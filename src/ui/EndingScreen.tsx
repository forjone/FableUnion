import { useEffect, useRef } from 'react'
import type { GameState, LifePack } from '../engine/types'
import { drawEndingCard } from './endingCard'

export function EndingScreen(props: {
  pack: LifePack
  state: GameState
  onRestart: () => void
}) {
  const { pack, state, onRestart } = props
  const holderRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ending = state.ending!

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
