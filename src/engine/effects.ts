import type { Effect, GameState, LifePack, LogEntry, Rng } from './types'

function clamp(pack: LifePack, statId: string, value: number): number {
  const def = pack.stats.find((s) => s.id === statId)
  if (!def) return value
  let v = value
  if (def.min !== undefined) v = Math.max(def.min, v)
  if (def.max !== undefined) v = Math.min(def.max, v)
  return v
}

/** 就地应用效果列表；产生的 log 追加到 state.log */
export function applyEffects(
  state: GameState,
  pack: LifePack,
  effects: Effect[],
  rng: Rng,
  logKind: LogEntry['kind'] = 'event',
): void {
  for (const ef of effects) {
    if ('log' in ef) {
      state.log.push({ turn: state.turn, text: ef.log, kind: logKind })
      continue
    }
    if ('flag' in ef) {
      state.flags[ef.flag] = ef.value
      continue
    }
    let v = state.stats[ef.stat] ?? 0
    if (ef.set !== undefined) v = ef.set
    if (ef.add !== undefined) v += ef.add
    if (ef.addRange !== undefined) {
      const [lo, hi] = ef.addRange
      v += lo + rng() * (hi - lo)
    }
    if (ef.addFromStat !== undefined) {
      v += (state.stats[ef.addFromStat.stat] ?? 0) * ef.addFromStat.mul
    }
    if (ef.mul !== undefined) v *= ef.mul
    state.stats[ef.stat] = clamp(pack, ef.stat, v)
  }
}
