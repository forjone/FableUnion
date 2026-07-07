import type { EventCard, GameState, Valence } from './types'

/**
 * 节拍导演：随机是表象，节拍是导演。
 * - 连续 2 次负面事件后，下一抽屏蔽负面（防挫败弃游）
 * - 连续 3 次非负事件后，负面权重翻倍（顺风必有逆风）
 */
const MEMORY = 4

export function recordValence(state: GameState, v: Valence): void {
  state.recentValence.push(v)
  if (state.recentValence.length > MEMORY) state.recentValence.shift()
}

export function directedWeight(state: GameState, card: EventCard): number {
  const base = card.weight ?? 1
  const v = card.valence ?? 0
  const recent = state.recentValence
  const lastTwoNegative =
    recent.length >= 2 && recent.slice(-2).every((x) => x === -1)
  const lastThreeNonNegative =
    recent.length >= 3 && recent.slice(-3).every((x) => x >= 0)
  if (lastTwoNegative && v === -1) return 0
  if (lastThreeNonNegative && v === -1) return base * 2
  return base
}
