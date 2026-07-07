import type { Condition, GameState } from './types'

export function evalCondition(cond: Condition | undefined, state: GameState): boolean {
  if (!cond) return true
  if ('all' in cond) return cond.all.every((c) => evalCondition(c, state))
  if ('any' in cond) return cond.any.some((c) => evalCondition(c, state))
  if ('not' in cond) return !evalCondition(cond.not, state)
  if ('stat' in cond) {
    const v = state.stats[cond.stat] ?? 0
    if (cond.gte !== undefined && !(v >= cond.gte)) return false
    if (cond.lte !== undefined && !(v <= cond.lte)) return false
    if (cond.gt !== undefined && !(v > cond.gt)) return false
    if (cond.lt !== undefined && !(v < cond.lt)) return false
    return true
  }
  if ('flag' in cond) return (state.flags[cond.flag] ?? false) === cond.is
  if ('turn' in cond) {
    if (cond.turn.gte !== undefined && !(state.turn >= cond.turn.gte)) return false
    if (cond.turn.lte !== undefined && !(state.turn <= cond.turn.lte)) return false
    return true
  }
  return true
}

/** 人类可读的条件描述，用于置灰选项的提示 */
export function describeCondition(cond: Condition, statName: (id: string) => string): string {
  if ('all' in cond) return cond.all.map((c) => describeCondition(c, statName)).join('，')
  if ('any' in cond) return cond.any.map((c) => describeCondition(c, statName)).join(' 或 ')
  if ('not' in cond) return `非（${describeCondition(cond.not, statName)}）`
  if ('stat' in cond) {
    const parts: string[] = []
    if (cond.gte !== undefined) parts.push(`≥${cond.gte}`)
    if (cond.gt !== undefined) parts.push(`>${cond.gt}`)
    if (cond.lte !== undefined) parts.push(`≤${cond.lte}`)
    if (cond.lt !== undefined) parts.push(`<${cond.lt}`)
    return `${statName(cond.stat)}${parts.join('且')}`
  }
  if ('flag' in cond) return cond.is ? '需要特定经历' : '与已有经历冲突'
  if ('turn' in cond) return '时机未到'
  return ''
}
