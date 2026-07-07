import type { Rng } from './types'

/** mulberry32 —— 足够好的轻量种子随机源 */
export function createRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickWeighted<T>(rng: Rng, items: T[], weightOf: (item: T) => number): T | null {
  const total = items.reduce((s, it) => s + weightOf(it), 0)
  if (total <= 0) return null
  let roll = rng() * total
  for (const it of items) {
    roll -= weightOf(it)
    if (roll < 0) return it
  }
  return items[items.length - 1] ?? null
}
