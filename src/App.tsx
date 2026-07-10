import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GameState } from './engine/types'
import { createGame } from './engine/engine'
import { createRng } from './engine/rng'
import { siteBuilderPack } from './content/site-builder'
import { StartScreen } from './ui/StartScreen'
import { GameScreen } from './ui/GameScreen'
import { EndingScreen } from './ui/EndingScreen'
import { CodexScreen } from './ui/CodexScreen'
import { loadProfile, recordRun, type Profile } from './meta/profile'
import { playSfx } from './ui/sound'

const SAVE_KEY = 'fableunion.save.v2'
const SAVE_VERSION = 2

interface SaveFile {
  v: number
  state: GameState
}

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const file = JSON.parse(raw) as SaveFile
    if (file.v !== SAVE_VERSION || file.state.packId !== siteBuilderPack.id) return null
    file.state.counts ??= {} // 兼容加入计数系统前的存档
    return file.state
  } catch {
    return null
  }
}

export function App() {
  const [state, setState] = useState<GameState | null>(() => loadSave())
  const [showCodex, setShowCodex] = useState(false)
  const [profile, setProfile] = useState<Profile>(() => loadProfile())
  const rng = useMemo(() => createRng(Date.now() ^ (Math.random() * 0xffffffff)), [])

  useEffect(() => {
    if (state) localStorage.setItem(SAVE_KEY, JSON.stringify({ v: SAVE_VERSION, state }))
    else localStorage.removeItem(SAVE_KEY)
  }, [state])

  // 局面推进：一局落幕时记入生涯档案
  const update = useCallback(
    (next: GameState) => {
      setState((prev) => {
        if (next.phase === 'ended' && prev?.phase !== 'ended') {
          setProfile(recordRun(siteBuilderPack, next))
          playSfx('ending')
        }
        return next
      })
    },
    [],
  )

  const startGame = useCallback((characterId: string) => {
    setState(createGame(siteBuilderPack, characterId))
  }, [])

  const restart = useCallback(() => {
    setProfile(loadProfile())
    setState(null)
  }, [])

  if (!state) {
    if (showCodex) {
      return <CodexScreen pack={siteBuilderPack} profile={profile} onBack={() => setShowCodex(false)} />
    }
    return (
      <StartScreen
        pack={siteBuilderPack}
        profile={profile}
        onStart={startGame}
        onOpenCodex={() => setShowCodex(true)}
      />
    )
  }
  if (state.phase === 'ended' && state.ending) {
    return <EndingScreen pack={siteBuilderPack} state={state} onRestart={restart} />
  }
  return <GameScreen pack={siteBuilderPack} state={state} setState={update} rng={rng} onAbandon={restart} />
}
