import type { Emotion } from './Buddy'

export type VisualCharacter = 'xiaobei' | 'xiaochuan'

export type BuddyVisualState =
  | 'default'
  | 'happy'
  | 'thinking'
  | 'shocked'
  | 'tired'
  | 'determined'
  | 'sad'
  | 'anxious'

const VISUAL_BY_CHARACTER: Record<string, VisualCharacter> = {
  mom: 'xiaobei',
  programmer: 'xiaochuan',
  student: 'xiaochuan',
  smalltown: 'xiaochuan',
}

const BASE_URL = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL.slice(0, -1)
  : import.meta.env.BASE_URL
const ASSET_BASE = `${BASE_URL}/images/buddies`

const IMAGE_PATHS: Record<VisualCharacter, Record<BuddyVisualState, string>> = {
  xiaobei: {
    default: `${ASSET_BASE}/xiaobei/default.webp`,
    happy: `${ASSET_BASE}/xiaobei/happy.webp`,
    thinking: `${ASSET_BASE}/xiaobei/thinking.webp`,
    shocked: `${ASSET_BASE}/xiaobei/shocked.webp`,
    tired: `${ASSET_BASE}/xiaobei/tired.webp`,
    determined: `${ASSET_BASE}/xiaobei/determined.webp`,
    sad: `${ASSET_BASE}/xiaobei/sad.webp`,
    anxious: `${ASSET_BASE}/xiaobei/anxious.webp`,
  },
  xiaochuan: {
    default: `${ASSET_BASE}/xiaochuan/default.webp`,
    happy: `${ASSET_BASE}/xiaochuan/happy.webp`,
    thinking: `${ASSET_BASE}/xiaochuan/thinking.webp`,
    shocked: `${ASSET_BASE}/xiaochuan/shocked.webp`,
    tired: `${ASSET_BASE}/xiaochuan/tired.webp`,
    determined: `${ASSET_BASE}/xiaochuan/determined.webp`,
    sad: `${ASSET_BASE}/xiaochuan/tired.webp`,
    anxious: `${ASSET_BASE}/xiaochuan/shocked.webp`,
  },
}

export function getVisualCharacter(characterId: string): VisualCharacter {
  return VISUAL_BY_CHARACTER[characterId] ?? 'xiaochuan'
}

export function getBuddyImage(characterId: string, state: BuddyVisualState): string {
  const character = getVisualCharacter(characterId)
  return IMAGE_PATHS[character][state] ?? IMAGE_PATHS[character].default
}

export function baseVisualState(emotion: Emotion): BuddyVisualState {
  switch (emotion) {
    case 'joy':
      return 'happy'
    case 'anger':
      return 'shocked'
    case 'worry':
      return 'anxious'
    case 'grief':
      return 'sad'
    case 'calm':
    default:
      return 'default'
  }
}

export function pickBuddyVisualState(input: {
  emotion: Emotion
  mood?: number
  working?: boolean
  burst?: boolean
}): BuddyVisualState {
  if (input.burst) return baseVisualState(input.emotion)
  if (input.working) {
    if ((input.mood ?? 100) < 30) return 'tired'
    return input.emotion === 'joy' ? 'determined' : 'thinking'
  }
  return baseVisualState(input.emotion)
}

export function visualStateForEnding(grade: string): BuddyVisualState {
  switch (grade) {
    case 'S':
    case 'A':
      return 'happy'
    case 'B':
      return 'determined'
    case 'C':
      return 'anxious'
    case 'D':
    default:
      return 'sad'
  }
}
