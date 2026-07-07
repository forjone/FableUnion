import { useMemo, useState } from 'react'
import type { GameState, LifePack, Rng } from '../engine/types'
import { eligibleTasks, endTurn, getEvent, resolveChoice } from '../engine/engine'
import { evalCondition, describeCondition } from '../engine/conditions'
import { formatStat } from './format'

export function GameScreen(props: {
  pack: LifePack
  state: GameState
  setState: (s: GameState) => void
  rng: Rng
}) {
  const { pack, state, setState, rng } = props
  const [chosen, setChosen] = useState<string[]>([])

  const visibleStats = pack.stats.filter((s) => !s.hidden)
  const tasks = useMemo(() => eligibleTasks(state, pack), [state, pack])
  const energy = state.stats[pack.energyStat.id] ?? 0
  const spent = chosen.reduce(
    (sum, id) => sum + (pack.tasks.find((t) => t.id === id)?.energyCost ?? 0),
    0,
  )
  const remaining = energy - spent

  const toggleTask = (id: string) => {
    if (chosen.includes(id)) {
      setChosen(chosen.filter((x) => x !== id))
    } else {
      const cost = pack.tasks.find((t) => t.id === id)?.energyCost ?? 0
      if (cost <= remaining) setChosen([...chosen, id])
    }
  }

  const submitWeek = () => {
    setState(endTurn(state, pack, chosen, rng))
    setChosen([])
  }

  const pending = state.pendingEvents[0]
  const pendingEvent = pending ? getEvent(pack, pending.eventId) : null

  return (
    <div className="screen game-screen">
      <header className="hud">
        <div className="week">
          第 {state.turn} {pack.turnUnit}
          <span className="week-total"> / {pack.maxTurns}</span>
        </div>
        <div className="stats">
          {visibleStats.map((s) => (
            <div className="stat" key={s.id} title={s.name}>
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">{formatStat(s, state.stats[s.id] ?? 0)}</span>
            </div>
          ))}
        </div>
      </header>

      {state.phase === 'plan' && (
        <section className="plan">
          <div className="plan-header">
            <h2>本{pack.turnUnit}安排</h2>
            <div className="energy-budget">
              ⚡ 剩余精力 <b>{remaining}</b> / {energy}
            </div>
          </div>
          <div className="task-grid">
            {tasks.map((t) => {
              const selected = chosen.includes(t.id)
              const affordable = selected || t.energyCost <= remaining
              return (
                <button
                  key={t.id}
                  className={'task-card' + (selected ? ' selected' : '') + (affordable ? '' : ' dim')}
                  onClick={() => toggleTask(t.id)}
                  disabled={!affordable && !selected}
                >
                  <div className="task-top">
                    <span className="task-icon">{t.icon}</span>
                    <span className="task-name">{t.name}</span>
                    <span className="task-cost">⚡{t.energyCost}</span>
                  </div>
                  <div className="task-desc">{t.desc}</div>
                </button>
              )
            })}
          </div>
          <button className="btn primary big" onClick={submitWeek}>
            {chosen.length > 0 ? `执行安排，结束本${pack.turnUnit}` : `什么都不做，混过这一${pack.turnUnit}`}
          </button>
        </section>
      )}

      {state.phase === 'event' && pendingEvent && pending && (
        <div className="modal-backdrop">
          <div className={'event-modal pool-' + pendingEvent.pool}>
            <div className="event-pool-tag">
              {pendingEvent.pool === 'daily' && '日常'}
              {pendingEvent.pool === 'fate' && '命运'}
              {pendingEvent.pool === 'wing' && '✨ 风口'}
            </div>
            <h2>{pendingEvent.title}</h2>
            <p className="event-text">
              {pending.missed && pendingEvent.wingCatch
                ? pendingEvent.wingCatch.missText
                : pendingEvent.text}
            </p>
            <div className="choices">
              {pending.missed ? (
                <button
                  className="btn choice"
                  onClick={() => setState(resolveChoice(state, pack, -1, rng))}
                >
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
                      onClick={() => setState(resolveChoice(state, pack, i, rng))}
                    >
                      {c.text}
                      {!ok && c.conditions && (
                        <span className="choice-req">
                          （{describeCondition(c.conditions, (id) => pack.stats.find((s) => s.id === id)?.name ?? id)}）
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

      <section className="journal">
        <h2>心路历程</h2>
        <ul>
          {[...state.log].reverse().slice(0, 30).map((entry, i) => (
            <li key={i} className={'log-' + entry.kind}>
              <span className="log-week">{entry.turn}{pack.turnUnit}</span>
              <span className="log-text">{entry.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
