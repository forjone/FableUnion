import type { Character, EndingGrade, GameState, LifePack } from '../engine/types'

/**
 * 生涯档案（元进度）：跨局持久化的图鉴、战绩与角色解锁。
 * 全部存 localStorage，与单局存档相互独立。
 */

const KEY = 'fableunion.profile.v1'

export interface RunRecord {
  date: number
  packId: string
  characterId: string
  endingId: string
  endingTitle: string
  grade: EndingGrade
  turns: number
  /** 结束时的核心属性值（chartStat），用于榜单 */
  final: number
}

export interface Profile {
  runs: RunRecord[]
  endingsSeen: string[]
  milestonesSeen: string[]
}

const EMPTY: Profile = { runs: [], endingsSeen: [], milestonesSeen: [] }

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(EMPTY)
    const p = JSON.parse(raw) as Profile
    return { ...structuredClone(EMPTY), ...p }
  } catch {
    return structuredClone(EMPTY)
  }
}

function saveProfile(p: Profile): void {
  localStorage.setItem(KEY, JSON.stringify(p))
}

/** 一局结束时记录：战绩入榜、结局与里程碑进图鉴 */
export function recordRun(pack: LifePack, state: GameState): Profile {
  const p = loadProfile()
  if (state.ending) {
    p.runs.push({
      date: Date.now(),
      packId: state.packId,
      characterId: state.characterId,
      endingId: state.ending.id,
      endingTitle: state.ending.title,
      grade: state.ending.grade,
      turns: state.turn,
      final: state.stats[pack.chartStat] ?? 0,
    })
    if (!p.endingsSeen.includes(state.ending.id)) p.endingsSeen.push(state.ending.id)
  }
  for (const m of state.milestonesHit) {
    if (!p.milestonesSeen.includes(m)) p.milestonesSeen.push(m)
  }
  saveProfile(p)
  return p
}

const GRADE_RANK: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 }

export function bestGrade(p: Profile): EndingGrade | null {
  let best: EndingGrade | null = null
  for (const r of p.runs) {
    if (!best || GRADE_RANK[r.grade] > GRADE_RANK[best]) best = r.grade
  }
  return best
}

export function isUnlocked(ch: Character, p: Profile): boolean {
  const rule = ch.unlock
  if (!rule) return true
  switch (rule.type) {
    case 'runs':
      return p.runs.length >= Number(rule.value)
    case 'milestone':
      return p.milestonesSeen.includes(String(rule.value))
    case 'grade': {
      const best = bestGrade(p)
      return !!best && GRADE_RANK[best] >= GRADE_RANK[String(rule.value)]
    }
  }
}

/** 榜单：按核心属性终值取前 N */
export function topRuns(p: Profile, n: number): RunRecord[] {
  return [...p.runs].sort((a, b) => b.final - a.final).slice(0, n)
}
