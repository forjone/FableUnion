import type { RunRecord } from './profile'

/**
 * 在线排行榜客户端。
 * 通过 VITE_LEADERBOARD_URL 指向后端（server/ 目录有可直接部署的 Cloudflare Worker）。
 * 未配置时所有函数静默降级：游戏保持纯本地运行。
 */

const URL_BASE = (import.meta.env.VITE_LEADERBOARD_URL as string | undefined)?.replace(/\/$/, '')
const NAME_KEY = 'fableunion.nickname'

export function leaderboardEnabled(): boolean {
  return !!URL_BASE
}

export function savedNickname(): string {
  return localStorage.getItem(NAME_KEY) ?? ''
}

export interface BoardEntry {
  name: string
  characterId: string
  endingTitle: string
  grade: string
  turns: number
  final: number
  date: number
}

export async function submitScore(name: string, run: RunRecord): Promise<boolean> {
  if (!URL_BASE) return false
  const trimmed = name.trim().slice(0, 16)
  if (!trimmed) return false
  localStorage.setItem(NAME_KEY, trimmed)
  try {
    const res = await fetch(`${URL_BASE}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: trimmed,
        packId: run.packId,
        characterId: run.characterId,
        endingId: run.endingId,
        endingTitle: run.endingTitle,
        grade: run.grade,
        turns: run.turns,
        final: run.final,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function fetchTop(limit = 20): Promise<BoardEntry[] | null> {
  if (!URL_BASE) return null
  try {
    const res = await fetch(`${URL_BASE}/top?limit=${limit}`)
    if (!res.ok) return null
    const data = (await res.json()) as { entries: BoardEntry[] }
    return data.entries ?? []
  } catch {
    return null
  }
}
