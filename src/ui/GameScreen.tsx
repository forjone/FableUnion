import { useEffect, useMemo, useRef, useState } from 'react'
import type { GameState, LifePack, LogEntry, Milestone, Rng, StatDef } from '../engine/types'
import { eligibleTasks, endTurn, getEvent, resolveChoice } from '../engine/engine'
import { evalCondition, describeCondition } from '../engine/conditions'
import { formatStat } from './format'
import { Icon } from './icons'
import { Buddy, baseEmotion, pickQuip, EMOTION_LABEL, type Emotion } from './Buddy'
import { playSfx, soundEnabled, setSoundEnabled } from './sound'

const ONBOARD_KEY = 'fableunion.onboarded'
const FAST_KEY = 'fableunion.fastmode'

const ONBOARD_SLIDES = [
  {
    title: '每周，分配你的精力',
    text: '这是你的一段人生，以周为单位推进。每周有限的精力点，花在写内容、加外链还是接私活续命，由你决定。带成功率的任务会随技能成长变得更稳。',
  },
  {
    title: '命运会来敲门',
    text: '每周会发生事件：灰点是日常，紫点是命运抉择，金点是稀有「风口」——风口需要平时的积累才接得住，错过了它会明确告诉你为什么。',
  },
  {
    title: '照顾好那个小人',
    text: '资金归零或心态崩溃，这段人生就提前落幕。屏幕上的小人就是你：他的表情，就是你此刻的心路历程。目标不止是日入千刀——每种结局都是一种人生。',
  },
]

interface Delta {
  def: StatDef
  delta: number
}

function diffStats(pack: LifePack, prev: GameState, next: GameState): Delta[] {
  const out: Delta[] = []
  for (const def of pack.stats) {
    if (def.hidden || def.id === pack.energyStat.id) continue
    const d = (next.stats[def.id] ?? 0) - (prev.stats[def.id] ?? 0)
    if (Math.abs(d) >= 0.005) out.push({ def, delta: d })
  }
  return out
}

function formatDelta(def: StatDef, delta: number): string {
  const sign = delta > 0 ? '+' : '−'
  return `${sign}${formatStat(def, Math.abs(delta))}`
}

const POOL_LABEL: Record<string, string> = { daily: '日常', fate: '命运', wing: '风口' }

export function GameScreen(props: {
  pack: LifePack
  state: GameState
  setState: (s: GameState) => void
  rng: Rng
  onAbandon: () => void
}) {
  const { pack, state, setState, rng, onAbandon } = props
  const [chosen, setChosen] = useState<string[]>([])
  const [weekReport, setWeekReport] = useState<{ week: number; entries: LogEntry[]; deltas: Delta[] } | null>(null)
  const [eventResult, setEventResult] = useState<{ title: string; pool: string; text: string; deltas: Delta[] } | null>(null)
  const [milestoneShow, setMilestoneShow] = useState<Milestone | null>(null)
  const milestoneSeen = useRef<string[]>(state.milestonesHit)
  const [burst, setBurst] = useState<{ emotion: Emotion; text: string; key: number } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const [sound, setSound] = useState(soundEnabled())
  const [fastMode, setFastMode] = useState(() => localStorage.getItem(FAST_KEY) === 'on')
  const [onboardStep, setOnboardStep] = useState(() =>
    localStorage.getItem(ONBOARD_KEY) ? -1 : 0,
  )

  // 情绪爆发：3.4 秒后回落到常态
  useEffect(() => {
    if (!burst) return
    const t = setTimeout(() => setBurst(null), 3400)
    return () => clearTimeout(t)
  }, [burst])

  const triggerBurst = (deltas: Delta[]) => {
    const moodDelta = deltas.find((d) => d.def.id === 'mood')?.delta ?? 0
    let emotion: Emotion | null = null
    if (moodDelta >= 1) emotion = 'joy'
    else if (moodDelta <= -6) emotion = 'grief'
    else if (moodDelta < 0) emotion = 'anger'
    if (emotion) {
      playSfx(emotion === 'joy' ? 'good' : 'bad')
      const key = Date.now()
      setBurst({ emotion, text: pickQuip(emotion, key), key })
    }
  }

  const tasks = useMemo(() => eligibleTasks(state, pack), [state, pack])
  const energy = state.stats[pack.energyStat.id] ?? 0
  const spent = chosen.reduce(
    (sum, id) => sum + (pack.tasks.find((t) => t.id === id)?.energyCost ?? 0),
    0,
  )
  const remaining = energy - spent

  // 里程碑达成检测 → 庆祝演出（等结算/事件结果关闭后再放）
  useEffect(() => {
    if (weekReport || eventResult || milestoneShow) return
    const fresh = state.milestonesHit.find((id) => !milestoneSeen.current.includes(id))
    if (fresh) {
      const m = pack.milestones.find((x) => x.id === fresh)
      if (m) {
        setMilestoneShow(m)
        playSfx('milestone')
      }
      milestoneSeen.current = [...milestoneSeen.current, fresh]
    }
  }, [state.milestonesHit, weekReport, eventResult, milestoneShow, pack.milestones])

  // 风口降临音效
  const pendingPool = state.pendingEvents[0]
    ? getEvent(pack, state.pendingEvents[0].eventId).pool
    : null
  useEffect(() => {
    if (pendingPool === 'wing' && !weekReport && !eventResult) playSfx('wing')
  }, [pendingPool, weekReport, eventResult])

  const toggleTask = (id: string) => {
    if (chosen.includes(id)) {
      setChosen(chosen.filter((x) => x !== id))
    } else {
      const cost = pack.tasks.find((t) => t.id === id)?.energyCost ?? 0
      if (cost <= remaining) {
        playSfx('tap')
        setChosen([...chosen, id])
      }
    }
  }

  const submitWeek = () => {
    playSfx('confirm')
    const prev = state
    const next = endTurn(prev, pack, chosen, rng)
    const deltas = diffStats(pack, prev, next)
    if (fastMode) {
      // 快速结算：跳过周报弹窗，情绪反应直接触发，事件照常弹出
      triggerBurst(deltas)
    } else {
      const entries = next.log.slice(prev.log.length)
      setWeekReport({ week: prev.turn, entries, deltas })
    }
    setState(next)
    setChosen([])
  }

  const pickChoice = (index: number) => {
    const prev = state
    const pending = prev.pendingEvents[0]
    if (!pending) return
    const event = getEvent(pack, pending.eventId)
    const next = resolveChoice(prev, pack, index, rng)
    const text = pending.missed
      ? '机会从指缝间溜走了。'
      : event.choices[index]?.resultText ?? ''
    setEventResult({ title: event.title, pool: event.pool, text, deltas: diffStats(pack, prev, next) })
    setState(next)
  }

  const closeReport = () => {
    if (weekReport) triggerBurst(weekReport.deltas)
    setWeekReport(null)
  }
  const closeResult = () => {
    if (eventResult) triggerBurst(eventResult.deltas)
    setEventResult(null)
  }

  const pending = state.pendingEvents[0]
  const pendingEvent = pending ? getEvent(pack, pending.eventId) : null
  const overlayOpen = !!weekReport || !!eventResult || !!milestoneShow

  const mood = state.stats.mood ?? 0
  const skillDefs = pack.stats.filter((s) => !s.hidden && s.max === 100 && s.id !== 'mood')
  const displayEmotion: Emotion = burst?.emotion ?? baseEmotion(mood)
  const quip = burst?.text ?? pickQuip(baseEmotion(mood), state.turn)

  return (
    <div className="screen game-screen">
      <header className="hud">
        <div className="hud-top">
          <div className="week">
            第 {state.turn}
            <span className="week-unit">{pack.turnUnit}</span>
            <span className="week-total">/ {pack.maxTurns}</span>
          </div>
          <div className="hud-money">
            {pack.stats
              .filter((s) => s.format === 'money' || s.format === 'decimal')
              .map((s) => (
                <span className="stat" key={s.id} title={s.name}>
                  <Icon name={s.icon} size={14} />
                  <span className="stat-value">{formatStat(s, state.stats[s.id] ?? 0)}</span>
                </span>
              ))}
            <Sparkline data={state.chartHistory} />
            <button className="icon-btn" title="设置" onClick={() => setMenuOpen(true)}>
              <Icon name="settings" size={15} />
            </button>
          </div>
        </div>
        <div className="hud-bars">
          <div className="mood-block" title={`心态 ${Math.round(mood)}`}>
            <Icon name="mood" size={13} className={mood <= 25 ? 'danger' : ''} />
            <div className="bar">
              <div
                className={'bar-fill mood-fill' + (mood <= 25 ? ' danger' : '')}
                style={{ width: `${mood}%` }}
              />
            </div>
          </div>
          {skillDefs.map((s) => (
            <div className="skill-block" key={s.id} title={`${s.name} ${Math.round(state.stats[s.id] ?? 0)}`}>
              <span className="skill-label">{s.name}</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${state.stats[s.id] ?? 0}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="turn-progress">
          <div className="turn-progress-fill" style={{ width: `${(state.turn / pack.maxTurns) * 100}%` }} />
        </div>
      </header>

      <section className="buddy-panel">
        <div className="buddy-room">
          <Buddy
            characterId={state.characterId}
            emotion={displayEmotion}
            siteLive={!!state.flags.siteLive}
            working={state.phase === 'plan' && chosen.length > 0}
            mood={mood}
            burst={!!burst}
            tier={(state.stats.income ?? 0) >= 100 ? 2 : (state.stats.income ?? 0) >= 10 ? 1 : 0}
          />
        </div>
        <div className="buddy-side">
          <div className="buddy-status">
            此刻 · <b className={'emo-tag emo-' + displayEmotion}>{EMOTION_LABEL[displayEmotion]}</b>
          </div>
          <div className={'buddy-bubble' + (burst ? ' burst' : '')} key={burst?.key ?? state.turn}>
            {quip}
          </div>
          <div className="buddy-meta">
            <span className={'live-dot' + (state.flags.siteLive ? ' on' : '')} />
            {state.flags.siteLive ? '你的网站在线上运行着' : '还没有一个自己的网站'}
          </div>
        </div>
      </section>

      {state.phase === 'plan' && (
        <section className="plan">
          <div className="plan-header">
            <h2>本{pack.turnUnit}行动牌</h2>
            <div className="energy-pips" title={`精力 ${remaining}/${energy}`}>
              <Icon name="energy" size={13} />
              {Array.from({ length: pack.energyStat.perTurn }).map((_, i) => (
                <span key={i} className={'pip' + (i < remaining ? ' on' : i < energy ? ' spent' : '')} />
              ))}
            </div>
          </div>
          <div className="task-grid">
            {tasks.map((t) => {
              const selected = chosen.includes(t.id)
              const affordable = selected || t.energyCost <= remaining
              const p = Math.min(
                0.98,
                t.baseSuccess +
                  (t.successBonus ?? []).reduce((s, b) => s + (state.stats[b.stat] ?? 0) * b.factor, 0),
              )
              return (
                <button
                  key={t.id}
                  className={'task-card' + (selected ? ' selected' : '') + (affordable ? '' : ' dim')}
                  onClick={() => toggleTask(t.id)}
                  disabled={!affordable && !selected}
                >
                  <div className="task-top">
                    <span className="task-icon">
                      <Icon name={t.icon} size={16} />
                    </span>
                    <span className="task-name">{t.name}</span>
                    <span className="task-cost">
                      {Array.from({ length: t.energyCost }).map((_, i) => (
                        <span key={i} className="cost-pip" />
                      ))}
                    </span>
                  </div>
                  <div className="task-desc">{t.desc}</div>
                  {t.baseSuccess < 1 && (
                    <div className={'task-odds' + (p < 0.45 ? ' risky' : '')}>
                      命中率 {Math.round(p * 100)}%
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <button className="btn primary big" onClick={submitWeek}>
            {chosen.length > 0
              ? `执行 ${chosen.length} 项安排，结束本${pack.turnUnit}`
              : `什么都不做，混过这一${pack.turnUnit}`}
          </button>
        </section>
      )}

      {/* 周结算 */}
      {weekReport && (
        <div className="modal-backdrop" onClick={closeReport}>
          <div className="event-modal report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-pool-tag">第 {weekReport.week} {pack.turnUnit} · 结算</div>
            <ul className="report-list">
              {weekReport.entries
                .filter((e) => e.kind === 'task')
                .map((e, i) => (
                  <li key={i} className="report-line" style={{ animationDelay: `${i * 90}ms` }}>
                    {e.text}
                  </li>
                ))}
              {weekReport.entries.filter((e) => e.kind === 'task').length === 0 && (
                <li className="report-line muted">这一{pack.turnUnit}你什么都没做。时间不会等人。</li>
              )}
            </ul>
            <DeltaChips deltas={weekReport.deltas} />
            <button className="btn primary big" onClick={closeReport}>
              继续
            </button>
          </div>
        </div>
      )}

      {/* 事件：提问阶段 */}
      {!overlayOpen && state.phase === 'event' && pendingEvent && pending && (
        <div className="modal-backdrop">
          <div className={'event-modal pool-' + pendingEvent.pool}>
            <div className="event-pool-tag">
              <span className={'pool-dot ' + pendingEvent.pool} />
              {POOL_LABEL[pendingEvent.pool]}
            </div>
            <h2>{pendingEvent.title}</h2>
            <p className="event-text">
              {pending.missed && pendingEvent.wingCatch
                ? pendingEvent.wingCatch.missText
                : pendingEvent.text}
            </p>
            <div className="choices">
              {pending.missed ? (
                <button className="btn choice" onClick={() => pickChoice(-1)}>
                  唉……
                </button>
              ) : (
                pendingEvent.choices.map((c, i) => {
                  const ok = evalCondition(c.conditions, state)
                  return (
                    <button
                      key={i}
                      className={'btn choice' + (ok ? '' : ' disabled')}
                      disabled={!ok}
                      onClick={() => pickChoice(i)}
                    >
                      {c.text}
                      {!ok && c.conditions && (
                        <span className="choice-req">
                          需要：{describeCondition(c.conditions, (id) => pack.stats.find((s) => s.id === id)?.name ?? id)}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 事件：结果阶段 */}
      {eventResult && (
        <div className="modal-backdrop" onClick={closeResult}>
          <div className={'event-modal result-modal pool-' + eventResult.pool} onClick={(e) => e.stopPropagation()}>
            <div className="event-pool-tag">
              <span className={'pool-dot ' + eventResult.pool} />
              {eventResult.title}
            </div>
            <p className="event-text result-text">{eventResult.text}</p>
            <DeltaChips deltas={eventResult.deltas} />
            <button className="btn primary big" onClick={closeResult}>
              继续
            </button>
          </div>
        </div>
      )}

      {/* 里程碑演出 */}
      {milestoneShow && (
        <div className="modal-backdrop milestone-backdrop" onClick={() => setMilestoneShow(null)}>
          <div className="milestone-splash" onClick={(e) => e.stopPropagation()}>
            <div className="milestone-rays" />
            <div className="milestone-trophy">
              <Icon name="trophy" size={56} strokeWidth={1.5} />
            </div>
            <div className="milestone-kicker">成就达成</div>
            <h2 className="milestone-title">{milestoneShow.title}</h2>
            <p className="milestone-text">{milestoneShow.text}</p>
            <button className="btn primary big" onClick={() => setMilestoneShow(null)}>
              继续前进
            </button>
          </div>
        </div>
      )}

      {/* 设置菜单 */}
      {menuOpen && (
        <div className="modal-backdrop" onClick={() => { setMenuOpen(false); setConfirmAbandon(false) }}>
          <div className="event-modal settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-pool-tag">设置</div>
            <button
              className="btn big"
              onClick={() => {
                const next = !sound
                setSoundEnabled(next)
                setSound(next)
                if (next) playSfx('confirm')
              }}
            >
              音效：{sound ? '开' : '关'}
            </button>
            <button
              className="btn big"
              onClick={() => {
                const next = !fastMode
                localStorage.setItem(FAST_KEY, next ? 'on' : 'off')
                setFastMode(next)
              }}
            >
              快速结算：{fastMode ? '开' : '关'}
              <span className="settings-note">开启后跳过每周结算弹窗，事件照常</span>
            </button>
            {!confirmAbandon ? (
              <button className="btn big danger-btn" onClick={() => setConfirmAbandon(true)}>
                放弃这段人生
              </button>
            ) : (
              <button className="btn big danger-btn confirm" onClick={onAbandon}>
                确定放弃？这一局不会留下任何记录
              </button>
            )}
            <button className="btn primary big" onClick={() => { setMenuOpen(false); setConfirmAbandon(false) }}>
              继续游戏
            </button>
          </div>
        </div>
      )}

      {/* 新手引导 */}
      {onboardStep >= 0 && (
        <div className="modal-backdrop onboard-backdrop">
          <div className="event-modal onboard-modal">
            <div className="event-pool-tag">
              开始之前 · {onboardStep + 1}/{ONBOARD_SLIDES.length}
            </div>
            <h2>{ONBOARD_SLIDES[onboardStep].title}</h2>
            <p className="event-text">{ONBOARD_SLIDES[onboardStep].text}</p>
            <div className="onboard-dots">
              {ONBOARD_SLIDES.map((_, i) => (
                <span key={i} className={'pool-dot' + (i === onboardStep ? ' wing' : '')} />
              ))}
            </div>
            <button
              className="btn primary big"
              onClick={() => {
                if (onboardStep + 1 < ONBOARD_SLIDES.length) {
                  setOnboardStep(onboardStep + 1)
                } else {
                  localStorage.setItem(ONBOARD_KEY, '1')
                  setOnboardStep(-1)
                  playSfx('confirm')
                }
              }}
            >
              {onboardStep + 1 < ONBOARD_SLIDES.length ? '下一条' : '开始这段人生'}
            </button>
          </div>
        </div>
      )}

      <section className="journal">
        <h2>心路历程</h2>
        <ul>
          {[...state.log].reverse().slice(0, 30).map((entry, i) => (
            <li key={state.log.length - i} className={'log-' + entry.kind}>
              <span className="log-week">{entry.turn}{pack.turnUnit}</span>
              <span className="log-text">{entry.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function DeltaChips(props: { deltas: Delta[] }) {
  if (props.deltas.length === 0) return null
  return (
    <div className="delta-chips">
      {props.deltas.map((d, i) => (
        <span
          key={d.def.id}
          className={'delta-chip ' + (d.delta > 0 ? 'up' : 'down')}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <Icon name={d.def.icon} size={12} />
          {formatDelta(d.def, d.delta)}
        </span>
      ))}
    </div>
  )
}

function Sparkline(props: { data: number[] }) {
  const data = props.data.slice(-32)
  if (data.length < 2) return null
  const max = Math.max(...data, 0.01)
  const w = 64
  const h = 20
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - (v / max) * (h - 4)}`)
    .join(' ')
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
