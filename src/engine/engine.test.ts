import { describe, expect, it } from 'vitest'
import type { GameState, LifePack } from './types'
import { evalCondition } from './conditions'
import { applyEffects } from './effects'
import { directedWeight, recordValence } from './director'
import { createGame, endTurn, resolveChoice } from './engine'
import { createRng } from './rng'

/** 极简测试用人生包 */
function testPack(overrides: Partial<LifePack> = {}): LifePack {
  return {
    id: 'test',
    name: '测试人生',
    tagline: '',
    turnUnit: '周',
    maxTurns: 3,
    stats: [
      { id: 'cash', name: '资金', icon: '💰' },
      { id: 'energy', name: '精力', icon: '⚡', min: 0, max: 10 },
      { id: 'mood', name: '心态', icon: '❤️', min: 0, max: 100 },
    ],
    energyStat: { id: 'energy', perTurn: 10 },
    chartStat: 'cash',
    turnEffects: [{ stat: 'cash', add: -100 }],
    characters: [
      { id: 'hero', name: '主角', icon: '🙂', tagline: '', desc: '', initialStats: { cash: 1000, mood: 50 } },
    ],
    tasks: [
      {
        id: 'work',
        name: '工作',
        icon: '🔨',
        desc: '',
        energyCost: 3,
        baseSuccess: 1,
        success: { effects: [{ stat: 'cash', add: 500 }], log: '赚到了' },
      },
    ],
    events: [
      {
        id: 'nothing',
        pool: 'daily',
        title: '平静的一周',
        text: '什么都没发生。',
        valence: 0,
        choices: [{ text: '继续', effects: [], resultText: '生活继续。' }],
      },
    ],
    milestones: [],
    endings: [
      {
        id: 'broke',
        title: '破产',
        icon: '🕳️',
        grade: 'D',
        priority: 1,
        when: 'immediate',
        conditions: { stat: 'cash', lte: 0 },
        text: '第 {turn} 周破产。',
      },
      {
        id: 'done',
        title: '平安落幕',
        icon: '📖',
        grade: 'B',
        priority: 100,
        when: 'final',
        conditions: { all: [] },
        text: '最终资金 {stat.cash}。',
      },
    ],
    wingChance: 0,
    ...overrides,
  }
}

function stateOf(pack: LifePack): GameState {
  return createGame(pack, 'hero')
}

describe('conditions', () => {
  it('evaluates stat / flag / turn / logic combinators', () => {
    const s = stateOf(testPack())
    s.flags.brave = true
    expect(evalCondition({ stat: 'cash', gte: 1000 }, s)).toBe(true)
    expect(evalCondition({ stat: 'cash', gt: 1000 }, s)).toBe(false)
    expect(evalCondition({ flag: 'brave', is: true }, s)).toBe(true)
    expect(evalCondition({ flag: 'missing', is: false }, s)).toBe(true)
    expect(evalCondition({ turn: { gte: 2 } }, s)).toBe(false)
    expect(
      evalCondition({ all: [{ stat: 'cash', gte: 500 }, { not: { flag: 'brave', is: false } }] }, s),
    ).toBe(true)
    expect(evalCondition({ any: [{ stat: 'cash', lt: 0 }, { turn: { lte: 1 } }] }, s)).toBe(true)
  })
})

describe('effects', () => {
  it('applies add / mul / set / addFromStat and clamps to stat bounds', () => {
    const pack = testPack()
    const s = stateOf(pack)
    const rng = createRng(1)
    applyEffects(s, pack, [{ stat: 'mood', add: 100 }], rng)
    expect(s.stats.mood).toBe(100) // clamped at max
    applyEffects(s, pack, [{ stat: 'cash', add: 100, mul: 2 }], rng)
    expect(s.stats.cash).toBe(2200) // (1000+100)*2
    applyEffects(s, pack, [{ stat: 'mood', set: 10 }, { flag: 'f', value: true }], rng)
    expect(s.stats.mood).toBe(10)
    expect(s.flags.f).toBe(true)
    applyEffects(s, pack, [{ stat: 'cash', addFromStat: { stat: 'mood', mul: 10 } }], rng)
    expect(s.stats.cash).toBe(2300)
  })
})

describe('director', () => {
  it('blocks negative events after two negatives and boosts after calm streak', () => {
    const s = stateOf(testPack())
    const negCard = { id: 'n', pool: 'daily', title: '', text: '', valence: -1, choices: [] } as const
    recordValence(s, -1)
    recordValence(s, -1)
    expect(directedWeight(s, { ...negCard, choices: [] })).toBe(0)
    recordValence(s, 1)
    recordValence(s, 0)
    recordValence(s, 1)
    expect(directedWeight(s, { ...negCard, choices: [] })).toBe(2)
  })
})

describe('game flow', () => {
  it('runs task → upkeep → event → next turn', () => {
    const pack = testPack()
    const rng = createRng(42)
    let s = stateOf(pack)
    s = endTurn(s, pack, ['work'], rng)
    expect(s.stats.cash).toBe(1000 + 500 - 100)
    expect(s.phase).toBe('event')
    s = resolveChoice(s, pack, 0, rng)
    expect(s.phase).toBe('plan')
    expect(s.turn).toBe(2)
    expect(s.stats.energy).toBe(10) // 精力重置
  })

  it('triggers immediate ending when broke', () => {
    const pack = testPack()
    const rng = createRng(7)
    let s = stateOf(pack)
    s.stats.cash = 50 // 本周开销 100 后归零以下
    s = endTurn(s, pack, [], rng)
    if (s.phase === 'event') s = resolveChoice(s, pack, 0, rng)
    expect(s.phase).toBe('ended')
    expect(s.ending?.id).toBe('broke')
    expect(s.ending?.text).toContain('第 1 周')
  })

  it('reaches final ending at maxTurns with interpolated stats', () => {
    const pack = testPack()
    const rng = createRng(9)
    let s = stateOf(pack)
    for (let i = 0; i < 3; i++) {
      s = endTurn(s, pack, [], rng)
      if (s.phase === 'event') s = resolveChoice(s, pack, 0, rng)
    }
    expect(s.phase).toBe('ended')
    expect(s.ending?.id).toBe('done')
    expect(s.ending?.text).toContain('700') // 1000 - 3×100
  })

  it('wing event misses when catch conditions unmet', () => {
    const pack = testPack({
      wingChance: 1,
      events: [
        {
          id: 'wind',
          pool: 'wing',
          title: '风口',
          text: '来了',
          wingCatch: {
            conditions: { stat: 'cash', gte: 999999 },
            missText: '错过了。',
            missEffects: [{ stat: 'mood', add: -5 }],
          },
          choices: [{ text: '接住', effects: [{ stat: 'cash', add: 99999 }], resultText: 'ok' }],
        },
      ],
    })
    const rng = createRng(3)
    let s = stateOf(pack)
    s = endTurn(s, pack, [], rng)
    expect(s.phase).toBe('event')
    expect(s.pendingEvents[0]?.missed).toBe(true)
    const moodBefore = s.stats.mood
    s = resolveChoice(s, pack, -1, rng)
    expect(s.stats.mood).toBe(moodBefore - 5)
    expect(s.log.some((l) => l.text.includes('错过'))).toBe(true)
  })

  it('respects once and cooldown when drawing events', () => {
    const pack = testPack({
      maxTurns: 10,
      events: [
        {
          id: 'onceEv',
          pool: 'daily',
          title: '唯一',
          text: '',
          once: true,
          choices: [{ text: 'ok', effects: [], resultText: '' }],
        },
      ],
    })
    const rng = createRng(5)
    let s = stateOf(pack)
    s = endTurn(s, pack, [], rng)
    expect(s.pendingEvents[0]?.eventId).toBe('onceEv')
    s = resolveChoice(s, pack, 0, rng)
    // 第二回合无可用事件，直接翻页
    s = endTurn(s, pack, [], rng)
    expect(s.phase).toBe('plan')
    expect(s.turn).toBe(3)
  })
})
