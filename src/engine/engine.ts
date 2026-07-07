import type {
  EventCard,
  GameState,
  LifePack,
  PendingEvent,
  Rng,
  Task,
} from './types'
import { evalCondition } from './conditions'
import { applyEffects } from './effects'
import { directedWeight, recordValence } from './director'
import { pickWeighted } from './rng'

// ---------- 创建 ----------

export function createGame(pack: LifePack, characterId: string): GameState {
  const ch = pack.characters.find((c) => c.id === characterId)
  if (!ch) throw new Error(`unknown character: ${characterId}`)
  const stats: Record<string, number> = {}
  for (const s of pack.stats) stats[s.id] = 0
  Object.assign(stats, ch.initialStats)
  stats[pack.energyStat.id] = pack.energyStat.perTurn
  const flags: Record<string, boolean> = {}
  for (const f of ch.startFlags ?? []) flags[f] = true
  return {
    packId: pack.id,
    characterId,
    turn: 1,
    phase: 'plan',
    stats,
    flags,
    usedOnce: {},
    cooldowns: {},
    chosenTasks: [],
    pendingEvents: [],
    log: [{ turn: 1, text: `${ch.name}的故事开始了。${ch.tagline}`, kind: 'system' }],
    chartHistory: [],
    milestonesHit: [],
    recentValence: [],
    ending: null,
  }
}

// ---------- 查询 ----------

function offCooldown(state: GameState, id: string): boolean {
  const until = state.cooldowns[id]
  return until === undefined || state.turn >= until
}

export function eligibleTasks(state: GameState, pack: LifePack): Task[] {
  return pack.tasks.filter(
    (t) =>
      !state.usedOnce[t.id] &&
      offCooldown(state, t.id) &&
      evalCondition(t.conditions, state),
  )
}

function eligibleEvents(state: GameState, pack: LifePack, pool: EventCard['pool']): EventCard[] {
  return pack.events.filter(
    (e) =>
      e.pool === pool &&
      !state.usedOnce[e.id] &&
      offCooldown(state, e.id) &&
      (!e.characters || e.characters.includes(state.characterId)) &&
      evalCondition(e.conditions, state) &&
      directedWeight(state, e) > 0,
  )
}

export function getEvent(pack: LifePack, id: string): EventCard {
  const e = pack.events.find((x) => x.id === id)
  if (!e) throw new Error(`unknown event: ${id}`)
  return e
}

// ---------- 回合推进 ----------

const FATE_CHANCE = 0.35

/**
 * 结束本周：结算已选任务 → 周常收支 → 抽事件入队。
 * 返回新状态（不修改传入对象）。
 */
export function endTurn(
  prev: GameState,
  pack: LifePack,
  chosenTaskIds: string[],
  rng: Rng,
): GameState {
  const state = structuredClone(prev)
  if (state.phase !== 'plan') return state

  // 1. 任务结算
  let energy = state.stats[pack.energyStat.id] ?? 0
  for (const id of chosenTaskIds) {
    const task = pack.tasks.find((t) => t.id === id)
    if (!task) continue
    if (task.energyCost > energy) continue
    if (!evalCondition(task.conditions, state)) continue
    energy -= task.energyCost
    state.stats[pack.energyStat.id] = energy
    if (task.once) state.usedOnce[task.id] = true
    if (task.cooldown) state.cooldowns[task.id] = state.turn + task.cooldown

    let p = task.baseSuccess
    for (const b of task.successBonus ?? []) p += (state.stats[b.stat] ?? 0) * b.factor
    const ok = rng() < p
    const outcome = ok ? task.success : (task.fail ?? task.success)
    applyEffects(state, pack, outcome.effects, rng, 'task')
    state.log.push({ turn: state.turn, text: outcome.log, kind: 'task' })
  }

  // 2. 周常收支
  applyEffects(state, pack, pack.turnEffects, rng, 'upkeep')

  // 3. 抽事件
  const queue: PendingEvent[] = []
  const fatePool = eligibleEvents(state, pack, 'fate')
  const dailyPool = eligibleEvents(state, pack, 'daily')
  const mainPool = fatePool.length > 0 && rng() < FATE_CHANCE ? fatePool : dailyPool
  const main = pickWeighted(rng, mainPool, (e) => directedWeight(state, e))
  if (main) queue.push(markDrawn(state, main))
  if (rng() < pack.wingChance) {
    const wing = pickWeighted(rng, eligibleEvents(state, pack, 'wing'), (e) =>
      directedWeight(state, e),
    )
    if (wing) queue.push(markDrawn(state, wing))
  }

  state.pendingEvents = queue
  state.chosenTasks = []
  if (queue.length === 0) return finishTurn(state, pack, rng)
  state.phase = 'event'
  return state
}

function markDrawn(state: GameState, event: EventCard): PendingEvent {
  if (event.once) state.usedOnce[event.id] = true
  if (event.cooldown) state.cooldowns[event.id] = state.turn + event.cooldown
  const missed =
    event.pool === 'wing' &&
    !!event.wingCatch &&
    !evalCondition(event.wingCatch.conditions, state)
  return { eventId: event.id, missed }
}

/** 玩家在当前事件上做出选择（missed 的 wing 事件 choiceIndex 传 -1） */
export function resolveChoice(
  prev: GameState,
  pack: LifePack,
  choiceIndex: number,
  rng: Rng,
): GameState {
  const state = structuredClone(prev)
  const pending = state.pendingEvents[0]
  if (state.phase !== 'event' || !pending) return state
  const event = getEvent(pack, pending.eventId)

  if (pending.missed && event.wingCatch) {
    applyEffects(state, pack, event.wingCatch.missEffects ?? [], rng, 'event')
    state.log.push({
      turn: state.turn,
      text: `【错过】${event.title} —— ${event.wingCatch.missText}`,
      kind: 'event',
    })
    recordValence(state, -1)
  } else {
    const choice = event.choices[choiceIndex]
    if (!choice) return state
    if (!evalCondition(choice.conditions, state)) return state
    applyEffects(state, pack, choice.effects, rng, 'event')
    state.log.push({
      turn: state.turn,
      text: `${event.title}：${choice.resultText}`,
      kind: 'event',
    })
    recordValence(state, event.valence ?? 0)
  }

  state.pendingEvents = state.pendingEvents.slice(1)
  if (state.pendingEvents.length === 0) return finishTurn(state, pack, rng)
  return state
}

// ---------- 回合收尾：里程碑、结局、翻页 ----------

function interpolate(text: string, state: GameState): string {
  return text
    .replace(/\{turn\}/g, String(state.turn))
    .replace(/\{stat\.([a-zA-Z0-9_]+)\}/g, (_, id: string) => {
      const v = state.stats[id] ?? 0
      return v >= 100 ? String(Math.round(v)) : String(Math.round(v * 100) / 100)
    })
}

function finishTurn(state: GameState, pack: LifePack, rng: Rng): GameState {
  // 里程碑
  for (const m of pack.milestones) {
    if (state.milestonesHit.includes(m.id)) continue
    if ((state.stats[m.stat] ?? 0) >= m.gte) {
      state.milestonesHit.push(m.id)
      applyEffects(state, pack, m.effects ?? [], rng, 'milestone')
      state.log.push({ turn: state.turn, text: `${m.title} —— ${m.text}`, kind: 'milestone' })
    }
  }

  state.chartHistory.push(state.stats[pack.chartStat] ?? 0)

  // 结局判定
  const isFinal = state.turn >= pack.maxTurns
  const candidates = pack.endings
    .filter((e) => e.when === 'immediate' || isFinal)
    .sort((a, b) => a.priority - b.priority)
  for (const e of candidates) {
    if (evalCondition(e.conditions, state)) {
      state.ending = {
        id: e.id,
        title: e.title,
        icon: e.icon,
        grade: e.grade,
        text: interpolate(e.text, state),
      }
      state.phase = 'ended'
      return state
    }
  }
  if (isFinal) {
    // 人生包应当自带兜底结局；万一没有，给一个中性收尾
    state.ending = {
      id: '_fallback',
      title: '故事到这里就结束了',
      icon: '📖',
      grade: 'C',
      text: `${state.turn} ${pack.turnUnit}过去了，生活还在继续。`,
    }
    state.phase = 'ended'
    return state
  }

  // 翻页
  state.turn += 1
  state.stats[pack.energyStat.id] = pack.energyStat.perTurn
  state.phase = 'plan'
  return state
}
