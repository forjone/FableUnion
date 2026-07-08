import { useState } from 'react'
import type { LifePack } from '../engine/types'
import type { Profile } from '../meta/profile'
import { isUnlocked } from '../meta/profile'
import { getBuddyImage } from './buddyVisuals'
import { Icon } from './icons'

export function StartScreen(props: {
  pack: LifePack
  profile: Profile
  onStart: (characterId: string) => void
  onOpenCodex: () => void
}) {
  const { pack, profile, onStart, onOpenCodex } = props
  const firstPlayable = pack.characters.find((c) => isUnlocked(c, profile))
  const [selected, setSelected] = useState<string | null>(firstPlayable?.id ?? null)
  const selectedChar = pack.characters.find((c) => c.id === selected)
  const selectedLocked = selectedChar ? !isUnlocked(selectedChar, profile) : true

  return (
    <div className="screen start-screen">
      <header className="start-hero">
        <div className="logo">FABLEUNION</div>
        <h1>{pack.name}</h1>
        <p className="tagline">{pack.tagline}</p>
      </header>

      <section className="char-grid">
        {pack.characters.map((c) => {
          const locked = !isUnlocked(c, profile)
          return (
            <button
              key={c.id}
              className={
                'char-card' + (locked ? ' locked' : '') + (selected === c.id ? ' selected' : '')
              }
              onClick={() => setSelected(c.id)}
            >
              <div className="char-avatar">
                <img src={getBuddyImage(c.id, 'default')} alt="" draggable={false} />
                {locked && (
                  <span className="char-lock">
                    <Icon name="key" size={19} strokeWidth={1.8} />
                  </span>
                )}
              </div>
              <div className="char-name">{c.name}</div>
              <div className="char-tagline">{locked ? c.unlock?.hint ?? '未解锁' : c.tagline}</div>
            </button>
          )
        })}
      </section>

      {selectedChar && (
        <section className="char-desc">
          <p>{selectedLocked ? `【未解锁】${selectedChar.unlock?.hint ?? ''}` : selectedChar.desc}</p>
          {!selectedLocked && (
            <div className="char-stats-preview">
              {Object.entries(selectedChar.initialStats)
                .filter(([id]) => {
                  const def = pack.stats.find((s) => s.id === id)
                  return def && !def.hidden && def.max === 100 && id !== 'mood'
                })
                .map(([id, v]) => {
                  const def = pack.stats.find((s) => s.id === id)!
                  return (
                    <div className="preview-row" key={id}>
                      <span className="preview-label">{def.name}</span>
                      <div className="bar">
                        <div className="bar-fill" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </section>
      )}

      <button
        className="btn primary big"
        disabled={!selectedChar || selectedLocked}
        onClick={() => selected && onStart(selected)}
      >
        开始这段人生
      </button>
      <button className="btn big" onClick={onOpenCodex}>
        图鉴 · 战绩
        {profile.runs.length > 0 && (
          <span className="codex-hint">
            {' '}
            已收集 {profile.endingsSeen.length}/{pack.endings.length} 结局
          </span>
        )}
      </button>

      <footer className="start-footer">
        每一局都是一段可叙述的人生 · 心路历程比数值更重要
      </footer>
    </div>
  )
}
