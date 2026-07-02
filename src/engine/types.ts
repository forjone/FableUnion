// 需求拆解引擎的内部骨架（PRD 3.2）。
// 注意：这些结构只给 AI/代码用，任何面向孩子的呈现都不得暴露它们。

export type CreationType = 'game';
export type SlotName = 'subject' | 'scene' | 'mechanic' | 'tone' | 'key_detail';
export type Confidence =
  | 'high'
  | 'medium_inferred'
  | 'resolved_by_clarify'
  | 'default'
  | 'missing';

export type MechanicId = 'race' | 'collect' | 'dodge' | 'jump' | 'pop';
export type ToneId = 'cute' | 'cool' | 'mystery' | 'funny' | 'lively';
export type EffectId = 'fire' | 'fly' | 'glow' | 'rainbow' | 'speed' | 'sparkle';
export type Difficulty = 'easy' | 'hard';

export interface NamedThing {
  id: string;
  label: string;
  emoji: string;
  custom?: boolean;
}

export interface DetailInfo {
  label: string;
  raw: string;
  effect: EffectId;
}

export interface SlotProfile {
  creation_type: CreationType;
  subject: NamedThing | null;
  companion: NamedThing | null;
  scene: NamedThing | null;
  mechanic: MechanicId | null;
  tone: ToneId | null;
  key_detail: DetailInfo | null;
  difficulty: Difficulty;
  confidence: Record<SlotName, Confidence>;
  /** 孩子原话里的关键词，复述确认时优先使用（PRD 3.5） */
  raw: Partial<Record<SlotName, string>>;
}

export interface DivergenceOption {
  label: string;
  emoji: string;
  /** 选中后合并进 profile 的补丁 */
  patch: Partial<SlotProfile>;
}

/**
 * 分歧点（PRD 3.3）：一次只处理一个。
 * kind=visual → 并排双草图直接指选（默认路径）
 * kind=cards  → 图卡选择题（仅当无法用画面区分时的兜底）
 */
export interface Divergence {
  slot: SlotName | 'difficulty';
  kind: 'visual' | 'cards';
  reason: 'missing' | 'conflict' | 'rule';
  prompt: string;
  options: DivergenceOption[];
}

export interface ParseResult {
  profile: SlotProfile;
  divergence: Divergence | null;
  /** “永远不说不行”的转译台词（PRD 2/4） */
  translations: string[];
  /** 迭代时被改动的槽位，用于讲故事式反馈 */
  changed: SlotName[];
}

export interface DialogueEntry {
  who: 'kid' | 'ai';
  text: string;
  at: number;
}

/** 深度构建产物的参数（PRD 3.6），可完整序列化存档 */
export interface GameSpec {
  title: string;
  mechanic: MechanicId;
  /** 主角的角色造型 id（词库 subject id 或 custom:名字） */
  heroId: string;
  heroLabel: string;
  companionId: string | null;
  sceneId: string;
  tone: ToneId;
  effect: EffectId | null;
  difficulty: Difficulty;
}

/** 作品档案（PRD 3.7） */
export interface WorkRecord {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  slots: unknown; // PRD 第 6 节格式的槽位 JSON
  profile: SlotProfile;
  spec: GameSpec;
  dialogue: DialogueEntry[];
}
