import { useState } from 'react'
import type { LifePack } from '../engine/types'

export function StartScreen(props: { pack: LifePack; onStart: (characterId: string) => void }) {
  const { pack, onStart } = props
  const firstPlayable = pack.characters.find((c) => !c.locked)
  const [selected, setSelected] = useState<string | null>(firstPlayable?.id ?? null)
  const selectedChar = pack.characters.find((c) => c.id === selected)

  return (
    <div className="screen start-screen">
      <header className="start-hero">
        <div className="logo">FableUnion</div>
        <h1>{pack.name}</h1>
        <p className="tagline">{pack.tagline}</p>
      </header>

      <section className="char-grid">
        {pack.characters.map((c) => (
          <button
            key={c.id}
            className={
              'char-card' +
              (c.locked ? ' locked' : '') +
              (selected === c.id ? ' selected' : '')
            }
            disabled={c.locked}
            onClick={() => setSelected(c.id)}
          >
            <div className="char-icon">{c.icon}</div>
            <div className="char-name">{c.name}</div>
            <div className="char-tagline">{c.locked ? '即将解锁' : c.tagline}</div>
          </button>
        ))}
      </section>

      {selectedChar && !selectedChar.locked && (
        <section className="char-desc">
          <p>{selectedChar.desc}</p>
        </section>
      )}

      <button
        className="btn primary big"
        disabled={!selectedChar || selectedChar.locked}
        onClick={() => selected && onStart(selected)}
      >
        开始这段人生
      </button>

      <footer className="start-footer">
        每一局都是一段可叙述的人生 · 心路历程比数值更重要
      </footer>
    </div>
  )
}
