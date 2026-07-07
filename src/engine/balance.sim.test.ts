import { describe, expect, it } from 'vitest'
import { createGame, endTurn, eligibleTasks, getEvent, resolveChoice } from './engine'
import { evalCondition } from './conditions'
import { createRng } from './rng'
import { siteBuilderPack } from '../content/site-builder'
import type { GameState, Rng } from './types'

/**
 * 蒙特卡洛平衡模拟：用随机贪心策略跑完整人生，检查结局分布是否健康。
 * 调数值时跑这个测试观察分布变化。
 */
function playOneLife(seed: number, characterId = 'programmer'): GameState {
  const pack = siteBuilderPack
  const rng: Rng = createRng(seed)
  let s = createGame(pack, characterId)
  let guard = 0
  while (s.phase !== 'ended' && guard++ < 2000) {
    if (s.phase === 'plan') {
      const tasks = [...eligibleTasks(s, pack)].sort(() => rng() - 0.5)
      const chosen: string[] = []
      let energy = s.stats[pack.energyStat.id] ?? 0
      for (const t of tasks) {
        if (t.energyCost <= energy) {
          chosen.push(t.id)
          energy -= t.energyCost
        }
      }
      s = endTurn(s, pack, chosen, rng)
    } else {
      const pending = s.pendingEvents[0]!
      if (pending.missed) {
        s = resolveChoice(s, pack, -1, rng)
      } else {
        const event = getEvent(pack, pending.eventId)
        const enabled = event.choices
          .map((c, i) => ({ c, i }))
          .filter(({ c }) => evalCondition(c.conditions, s))
        const pick = enabled[Math.floor(rng() * enabled.length)]!
        s = resolveChoice(s, pack, pick.i, rng)
      }
    }
  }
  return s
}

describe('balance simulation (site-builder pack)', () => {
  it('random-greedy lives end sanely and endings are diverse', () => {
    const RUNS = 200
    const endings = new Map<string, number>()
    let reachedFirstCent = 0
    let reachedTen = 0
    for (let i = 0; i < RUNS; i++) {
      const s = playOneLife(1000 + i * 7)
      expect(s.phase).toBe('ended')
      expect(s.ending).not.toBeNull()
      endings.set(s.ending!.id, (endings.get(s.ending!.id) ?? 0) + 1)
      if (s.milestonesHit.includes('firstCent')) reachedFirstCent++
      if (s.milestonesHit.includes('tenDollars')) reachedTen++
    }
    // 打印分布，供调平衡时观察
    // eslint-disable-next-line no-console
    console.table(Object.fromEntries([...endings.entries()].sort((a, b) => b[1] - a[1])))
    // eslint-disable-next-line no-console
    console.log(`first cent: ${reachedFirstCent}/${RUNS}, ten dollars: ${reachedTen}/${RUNS}`)

    // 健康度底线：结局不能单一化；第一笔收入应是大概率事件
    expect(endings.size).toBeGreaterThanOrEqual(4)
    expect(reachedFirstCent / RUNS).toBeGreaterThan(0.5)
    // 随机乱玩不应该轻易通向最高成就
    const legend = endings.get('legend') ?? 0
    expect(legend / RUNS).toBeLessThan(0.1)
  })

  it('every character can finish a life and earn the first cent', () => {
    for (const characterId of siteBuilderPack.characters.map((c) => c.id)) {
      const RUNS = 40
      let firstCent = 0
      for (let i = 0; i < RUNS; i++) {
        const s = playOneLife(5000 + i * 13, characterId)
        expect(s.phase).toBe('ended')
        expect(s.ending).not.toBeNull()
        if (s.milestonesHit.includes('firstCent')) firstCent++
      }
      // 每个角色随机乱玩也应该大概率跑通第一笔收入
      expect(firstCent / RUNS, characterId).toBeGreaterThan(0.4)
    }
  })
})
