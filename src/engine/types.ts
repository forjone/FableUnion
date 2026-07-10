/**
 * 人生引擎 · 类型定义
 *
 * 纪律：引擎层不得出现任何具体人生包的领域概念（建站、收入、外链……）。
 * 所有领域内容由 LifePack（人生包）以数据形式提供。
 */

// ---------- 条件 ----------

export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { stat: string; gte?: number; lte?: number; gt?: number; lt?: number }
  | { flag: string; is: boolean }
  | { turn: { gte?: number; lte?: number } }
  /** 重复计数：task.<id>（尝试）/ task.<id>.ok（成功）/ event.<id>（经历） */
  | { count: string; gte?: number; lte?: number }

// ---------- 多态文案 ----------

/** 带条件的文案变体：同一件事在不同人生阶段读起来不一样 */
export interface TextVariant {
  text: string
  conditions?: Condition
  weight?: number
}

/** 纯字符串，或按条件/权重挑选的变体列表 */
export type FlexText = string | ReadonlyArray<string | TextVariant>

// ---------- 效果 ----------

export type Effect =
  | {
      stat: string
      add?: number
      /** 在 [min, max] 间随机加值 */
      addRange?: [number, number]
      mul?: number
      set?: number
      /** 从另一个属性按倍数换算加值，如每周收入入账 */
      addFromStat?: { stat: string; mul: number }
    }
  | { flag: string; value: boolean }
  | { log: string }

// ---------- 属性 ----------

export interface StatDef {
  id: string
  name: string
  icon: string
  min?: number
  max?: number
  /** 不在顶栏展示（如内部计数器） */
  hidden?: boolean
  /** 展示为货币/小数 */
  format?: 'int' | 'money' | 'decimal'
  /** 展示用单位前缀，如 ¥ / $ */
  unit?: string
}

// ---------- 角色 ----------

export interface Character {
  id: string
  name: string
  icon: string
  tagline: string
  desc: string
  initialStats: Record<string, number>
  startFlags?: string[]
  /** 每回合精力规则（缺省用 pack.energyStat.perTurn）；variance 表示 ±随机波动 */
  energy?: { base: number; variance?: number }
  /** 覆盖 pack.turnEffects（如不同的生活开销） */
  turnEffects?: Effect[]
  /** 元进度解锁规则，由 meta 层解释；缺省即解锁 */
  unlock?: { type: 'runs' | 'milestone' | 'grade'; value: string | number; hint: string }
}

// ---------- 事件（storylet） ----------

export type EventPool = 'daily' | 'fate' | 'wing'
/** 事件情绪极性，供节拍导演调度 */
export type Valence = -1 | 0 | 1

export interface EventChoice {
  text: string
  /** 不满足时该选项置灰并显示条件提示 */
  conditions?: Condition
  effects: Effect[]
  resultText: FlexText
}

export interface EventCard {
  id: string
  pool: EventPool
  title: string
  text: FlexText
  weight?: number
  valence?: Valence
  conditions?: Condition
  once?: boolean
  /** 触发后 N 回合内不再抽到 */
  cooldown?: number
  characters?: string[]
  /** 仅 wing 池：接住机会所需条件；不满足则展示 miss 文案 */
  wingCatch?: { conditions: Condition; missText: string; missEffects?: Effect[] }
  choices: EventChoice[]
}

// ---------- 任务 ----------

export interface Task {
  id: string
  name: string
  icon: string
  desc: string
  energyCost: number
  conditions?: Condition
  once?: boolean
  cooldown?: number
  /** 基础成功率 0~1；1 表示必然成功 */
  baseSuccess: number
  /** 属性加成：p += stats[stat] * factor */
  successBonus?: { stat: string; factor: number }[]
  success: { effects: Effect[]; log: FlexText }
  fail?: { effects: Effect[]; log: FlexText }
  /** 熟练度质变：累计成功次数达到阈值时的一次性突破 */
  mastery?: { count: number; log: string; effects?: Effect[] }[]
}

// ---------- 里程碑 / 结局 ----------

export interface Milestone {
  id: string
  stat: string
  gte: number
  title: string
  text: string
  effects?: Effect[]
}

export type EndingGrade = 'S' | 'A' | 'B' | 'C' | 'D'

export interface Ending {
  id: string
  title: string
  icon: string
  grade: EndingGrade
  /** 数字越小优先级越高，命中即停 */
  priority: number
  /** 触发时机：'immediate' 每回合检查；'final' 仅在回合耗尽时评价 */
  when: 'immediate' | 'final'
  conditions: Condition
  text: string
}

// ---------- 人生包 ----------

export interface LifePack {
  id: string
  name: string
  tagline: string
  /** 回合的叙事单位，如「周」 */
  turnUnit: string
  maxTurns: number
  stats: StatDef[]
  /** 每回合行动点属性 id 与每回合重置值 */
  energyStat: { id: string; perTurn: number }
  /** 用于结局卡曲线展示的核心属性 */
  chartStat: string
  /** 每回合开始时结算的效果（生活开销、收入入账等） */
  turnEffects: Effect[]
  characters: Character[]
  tasks: Task[]
  events: EventCard[]
  milestones: Milestone[]
  endings: Ending[]
  /** 每回合抽取 wing 池事件的概率 */
  wingChance: number
}

// ---------- 运行时状态 ----------

export interface LogEntry {
  turn: number
  text: string
  kind: 'task' | 'event' | 'milestone' | 'system' | 'upkeep'
}

export type Phase = 'plan' | 'event' | 'ended'

/** 抽出的事件在队列中的运行时形态 */
export interface PendingEvent {
  eventId: string
  /** wing 未接住时为 true，仅展示 miss 文案 */
  missed: boolean
  /** 抽取时按当前状态解析出的正文（多态文案在此定格） */
  resolvedText: string
}

export interface EndingResult {
  id: string
  title: string
  icon: string
  grade: EndingGrade
  text: string
}

export interface GameState {
  packId: string
  characterId: string
  turn: number
  phase: Phase
  stats: Record<string, number>
  flags: Record<string, boolean>
  /** 重复计数（task.<id> / task.<id>.ok / event.<id>），驱动量变到质变 */
  counts: Record<string, number>
  usedOnce: Record<string, true>
  cooldowns: Record<string, number>
  chosenTasks: string[]
  pendingEvents: PendingEvent[]
  log: LogEntry[]
  chartHistory: number[]
  milestonesHit: string[]
  /** 最近事件极性，供节拍导演参考 */
  recentValence: Valence[]
  ending: EndingResult | null
}

/** 随机数源：返回 [0,1) */
export type Rng = () => number
