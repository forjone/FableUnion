import { useEffect, useRef, useState } from 'react'
import type { GameState, LifePack } from '../engine/types'
import { drawEndingCard } from './endingCard'
import { leaderboardEnabled, savedNickname, submitScore } from '../meta/leaderboard'

export function EndingScreen(props: {
  pack: LifePack
  state: GameState
  onRestart: () => void
}) {
  const { pack, state, onRestart } = props
  const holderRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ending = state.ending!
  const [nickname, setNickname] = useState(savedNickname())
  const [boardStatus, setBoardStatus] = useState<'idle' | 'sending' | 'done' | 'fail'>('idle')

  const submitToBoard = async () => {
    if (boardStatus === 'sending' || boardStatus === 'done') return
    setBoardStatus('sending')
    const ok = await submitScore(nickname, {
      date: Date.now(),
      packId: state.packId,
      characterId: state.characterId,
      endingId: ending.id,
      endingTitle: ending.title,
      grade: ending.grade,
      turns: state.turn,
      final: state.stats[pack.chartStat] ?? 0,
    })
    setBoardStatus(ok ? 'done' : 'fail')
  }

  useEffect(() => {
    let cancelled = false
    let mounted: HTMLCanvasElement | null = null
    void drawEndingCard(pack, state).then((canvas) => {
      if (cancelled) return
      canvas.className = 'ending-canvas'
      canvasRef.current = canvas
      mounted = canvas
      holderRef.current?.appendChild(canvas)
    })
    const holder = holderRef.current
    return () => {
      cancelled = true
      if (mounted && holder?.contains(mounted)) holder.removeChild(mounted)
    }
  }, [pack, state])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `fableunion-${ending.id}.png`
    a.click()
  }

  return (
    <div className="screen ending-screen">
      <div className="ending-head">
        <span className={'grade-medal grade-' + ending.grade}>{ending.grade}</span>
        <h1 className="ending-headline">{ending.title}</h1>
      </div>
      <div ref={holderRef} className="ending-card-holder" />
      <div className="ending-actions">
        <button className="btn primary big" onClick={download}>
          保存结局卡，晒出这段人生
        </button>
        <button className="btn big" onClick={onRestart}>
          再活一次
        </button>
        {leaderboardEnabled() && (
          <div className="board-submit">
            <input
              className="board-name"
              maxLength={16}
              placeholder="你的名号（上全球榜用）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={boardStatus === 'done'}
            />
            <button
              className="btn"
              disabled={!nickname.trim() || boardStatus === 'sending' || boardStatus === 'done'}
              onClick={() => void submitToBoard()}
            >
              {boardStatus === 'idle' && '上榜'}
              {boardStatus === 'sending' && '提交中…'}
              {boardStatus === 'done' && '已上榜'}
              {boardStatus === 'fail' && '重试'}
            </button>
          </div>
        )}
      </div>

      <section className="journal ending-journal">
        <h2>完整心路历程</h2>
        <ul>
          {[...state.log].reverse().map((entry, i) => (
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
