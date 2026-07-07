import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GameState } from './engine/types'
import { createGame } from './engine/engine'
import { createRng } from './engine/rng'
import { siteBuilderPack } from './content/site-builder'
import { StartScreen } from './ui/StartScreen'
import { GameScreen } from './ui/GameScreen'
import { EndingScreen } from './ui/EndingScreen'

const SAVE_KEY = 'fableunion.save.v1'

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const state = JSON.parse(raw) as GameState
    if (state.packId !== siteBuilderPack.id) return null
    return state
  } catch {
    return null
  }
}

export function App() {
  const [state, setState] = useState<GameState | null>(() => loadSave())
  const rng = useMemo(() => createRng(Date.now() ^ (Math.random() * 0xffffffff)), [])

  useEffect(() => {
    if (state) localStorage.setItem(SAVE_KEY, JSON.stringify(state))
    else localStorage.removeItem(SAVE_KEY)
  }, [state])

  const startGame = useCallback((characterId: string) => {
    setState(createGame(siteBuilderPack, characterId))
  }, [])

  const restart = useCallback(() => setState(null), [])

  if (!state) {
    return <StartScreen pack={siteBuilderPack} onStart={startGame} />
  }
  if (state.phase === 'ended' && state.ending) {
    return <EndingScreen pack={siteBuilderPack} state={state} onRestart={restart} />
  }
  return (
    <GameScreen pack={siteBuilderPack} state={state} setState={setState} rng={rng} />
  )
}
