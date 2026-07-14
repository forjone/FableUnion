import { useEffect, useState } from 'react'
import type { LifePack } from '../engine/types'
import type { Profile } from '../meta/profile'
import { bestGrade, topRuns } from '../meta/profile'
import { fetchTop, leaderboardEnabled, type BoardEntry } from '../meta/leaderboard'
import { Icon } from './icons'

/** 图鉴与战绩：结局图鉴、里程碑图鉴、本地榜单 */
/** 图鉴展示用：把结局文案里的插值占位符抹成留白 */
function blankTemplate(text: string): string {
  return text.replace(/\{turn\}/g, '＿＿').replace(/\{stat\.[a-zA-Z0-9_]+\}/g, '＿＿')
}

export function CodexScreen(props: { pack: LifePack; profile: Profile; onBack: () => void }) {
  const { pack, profile, onBack } = props
  const chartDef = pack.stats.find((s) => s.id === pack.chartStat)
  const best = bestGrade(profile)
  const top = topRuns(profile, 5)
  const charName = (id: string) => pack.characters.find((c) => c.id === id)?.name ?? id
  const [board, setBoard] = useState<BoardEntry[] | null>(null)
  const [boardLoading, setBoardLoading] = useState(leaderboardEnabled())

  useEffect(() => {
    if (!leaderboardEnabled()) return
    void fetchTop(20).then((entries) => {
      setBoard(entries)
      setBoardLoading(false)
    })
  }, [])

  return (
    <div className="screen codex-screen">
      <header className="codex-header">
        <button className="btn" onClick={onBack}>
          返回
        </button>
        <h1>图鉴 · 战绩</h1>
      </header>

      <section className="codex-stats">
        <div className="codex-stat">
          <div className="codex-stat-value">{profile.runs.length}</div>
          <div className="codex-stat-label">走过的人生</div>
        </div>
        <div className="codex-stat">
          <div className="codex-stat-value">
            {best ? <span className={'grade-medal small grade-' + best}>{best}</span> : '—'}
          </div>
          <div className="codex-stat-label">最佳评级</div>
        </div>
        <div className="codex-stat">
          <div className="codex-stat-value">
            {profile.endingsSeen.length}
            <span className="codex-total">/{pack.endings.length}</span>
          </div>
          <div className="codex-stat-label">结局收集</div>
        </div>
        <div className="codex-stat">
          <div className="codex-stat-value">
            {profile.milestonesSeen.length}
            <span className="codex-total">/{pack.milestones.length}</span>
          </div>
          <div className="codex-stat-label">成就收集</div>
        </div>
      </section>

      {top.length > 0 && (
        <section>
          <h2>最佳战绩（本机）</h2>
          <ul className="record-list">
            {top.map((r, i) => (
              <li key={r.date} className="record-row">
                <span className="record-rank">{i + 1}</span>
                <span className="record-main">
                  {r.endingTitle}
                  <span className="record-sub">
                    {charName(r.characterId)} · {r.turns} {pack.turnUnit}
                  </span>
                </span>
                <span className={'grade-medal small grade-' + r.grade}>{r.grade}</span>
                <span className="record-final">
                  {chartDef?.unit}
                  {r.final >= 100 ? Math.round(r.final) : r.final.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {leaderboardEnabled() && (
        <section>
          <h2>全球榜</h2>
          {boardLoading && <p className="board-hint">加载中…</p>}
          {!boardLoading && !board && <p className="board-hint">全球榜暂时连不上，稍后再来看看。</p>}
          {!boardLoading && board && board.length === 0 && (
            <p className="board-hint">榜上还空着——第一个名字为什么不能是你？</p>
          )}
          {!boardLoading && board && board.length > 0 && (
            <ul className="record-list">
              {board.map((r, i) => (
                <li key={r.date + r.name + i} className="record-row">
                  <span className="record-rank">{i + 1}</span>
                  <span className="record-main">
                    {r.name}
                    <span className="record-sub">
                      {r.endingTitle} · {charName(r.characterId)} · {r.turns} {pack.turnUnit}
                    </span>
                  </span>
                  <span className={'grade-medal small grade-' + r.grade}>{r.grade}</span>
                  <span className="record-final">
                    {chartDef?.unit}
                    {r.final >= 100 ? Math.round(r.final) : r.final.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h2>结局图鉴</h2>
        <div className="codex-grid">
          {pack.endings.map((e) => {
            const seen = profile.endingsSeen.includes(e.id)
            return (
              <div key={e.id} className={'codex-card' + (seen ? '' : ' unseen')}>
                <span className={'grade-medal small grade-' + e.grade}>{seen ? e.grade : '?'}</span>
                <div className="codex-card-body">
                  <div className="codex-card-title">{seen ? e.title : '？？？'}</div>
                  {seen && <div className="codex-card-text">{blankTemplate(e.text)}</div>}
                  {!seen && e.hint && <div className="codex-card-text codex-hint-text">线索：{e.hint}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2>成就图鉴</h2>
        <div className="codex-grid">
          {pack.milestones.map((m) => {
            const seen = profile.milestonesSeen.includes(m.id)
            return (
              <div key={m.id} className={'codex-card' + (seen ? '' : ' unseen')}>
                <span className={'codex-trophy' + (seen ? ' lit' : '')}>
                  <Icon name="trophy" size={18} />
                </span>
                <div className="codex-card-body">
                  <div className="codex-card-title">{seen ? m.title : '？？？'}</div>
                  {seen && <div className="codex-card-text">{m.text}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
