// 需求拆解引擎的内部骨架（PRD 3.2）。
// 注意：这些结构只给 AI/代码用，任何面向孩子的呈现都不得暴露它们。

export type CreationType = 'game' | 'website';
/** 网站类作品的“核心功能”取值（对应 PRD 槽位 mechanic 的网站语义） */
export type SiteKind = 'gallery' | 'story' | 'intro' | 'invite';
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
  /** 组合玩法（原型第二轮：一边赛跑一边捡星星）；目前支持叠加“收集” */
  mechanic_extra: 'collect' | null;
  /** creation_type=website 时的核心功能（语义上占用 mechanic 槽位） */
  site_kind: SiteKind | null;
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

/** 配饰（角色装扮） */
export type AccessoryId = 'crown' | 'cap' | 'glasses' | 'bow' | 'wings';

/** 深度构建产物的参数（PRD 3.6），可完整序列化存档 */
export interface GameSpec {
  type?: 'game'; // 旧档案无此字段，缺省视为 game
  title: string;
  mechanic: MechanicId;
  /** 组合玩法：主玩法之上叠加“捡星星” */
  mechanicExtra: 'collect' | null;
  /** 主角的角色造型 id（词库 subject id 或 custom:名字） */
  heroId: string;
  heroLabel: string;
  companionId: string | null;
  sceneId: string;
  tone: ToneId;
  effect: EffectId | null;
  difficulty: Difficulty;
  /** 主角的装扮（游玩页可随时换） */
  accessory?: AccessoryId | null;
}

/** 网站类作品的构建参数（PRD 3.6 网站分流） */
export interface SiteSpec {
  type: 'website';
  title: string;
  kind: SiteKind;
  heroId: string;
  heroLabel: string;
  companionId: string | null;
  sceneId: string;
  tone: ToneId;
  effect: EffectId | null;
  difficulty: Difficulty;
  mechanicExtra: null;
  accessory?: AccessoryId | null;
}

export type WorkSpec = GameSpec | SiteSpec;

/** 作品档案（PRD 3.7） */
export interface WorkRecord {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  slots: unknown; // PRD 第 6 节格式的槽位 JSON
  profile: SlotProfile;
  spec: WorkSpec;
  dialogue: DialogueEntry[];
  /** AI 生成的终稿封面（未生成时为 null，展示回退到角色立绘） */
  coverUrl?: string | null;
}
