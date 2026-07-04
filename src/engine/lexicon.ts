import type { EffectId, MechanicId, SiteKind, ToneId } from './types';

// —— 词库：把孩子的自然语言映射到内部槽位 ——
// 覆盖不是目的，可靠兜底才是：没匹配到的词也有捕获与默认策略（见 parser）。

export interface SubjectEntry {
  id: string;
  label: string;
  emoji: string;
  words: string[];
  sceneHint?: string; // 缺场景时的推断
  toneHint?: ToneId; // 缺基调时的推断
  mechanicHints?: MechanicId[]; // 缺玩法时优先给出的两个候选
}

export const SUBJECTS: SubjectEntry[] = [
  { id: 'dino', label: '恐龙', emoji: '🦖', words: ['恐龙', '霸王龙', '暴龙', '三角龙'], sceneHint: 'meadow', toneHint: 'lively', mechanicHints: ['race', 'collect'] },
  { id: 'princess', label: '公主', emoji: '👸', words: ['公主', '小公主'], sceneHint: 'castle', toneHint: 'cute', mechanicHints: ['collect', 'jump'] },
  { id: 'racecar', label: '赛车', emoji: '🏎️', words: ['赛车', '跑车', '小汽车', '汽车'], sceneHint: 'city', toneHint: 'cool', mechanicHints: ['race', 'dodge'] },
  { id: 'cat', label: '小猫', emoji: '🐱', words: ['小猫', '猫咪', '猫'], sceneHint: 'garden', toneHint: 'cute', mechanicHints: ['collect', 'jump'] },
  { id: 'dog', label: '小狗', emoji: '🐶', words: ['小狗', '狗狗', '狗'], sceneHint: 'meadow', toneHint: 'funny', mechanicHints: ['race', 'collect'] },
  { id: 'robot', label: '机器人', emoji: '🤖', words: ['机器人', '变形金刚'], sceneHint: 'city', toneHint: 'cool', mechanicHints: ['dodge', 'pop'] },
  { id: 'rocket', label: '火箭', emoji: '🚀', words: ['火箭', '飞船', '宇宙飞船'], sceneHint: 'space', toneHint: 'cool', mechanicHints: ['dodge', 'collect'] },
  { id: 'unicorn', label: '独角兽', emoji: '🦄', words: ['独角兽', '小马', '彩虹马'], sceneHint: 'rainbow', toneHint: 'cute', mechanicHints: ['jump', 'collect'] },
  { id: 'monster', label: '小怪兽', emoji: '👾', words: ['怪兽', '小怪物', '怪物'], sceneHint: 'space', toneHint: 'funny', mechanicHints: ['pop', 'dodge'] },
  { id: 'bunny', label: '小兔子', emoji: '🐰', words: ['兔子', '小兔', '兔兔'], sceneHint: 'meadow', toneHint: 'cute', mechanicHints: ['jump', 'collect'] },
  { id: 'panda', label: '熊猫', emoji: '🐼', words: ['熊猫', '大熊猫'], sceneHint: 'forest', toneHint: 'cute', mechanicHints: ['collect', 'jump'] },
  { id: 'tiger', label: '老虎', emoji: '🐯', words: ['老虎', '小老虎'], sceneHint: 'forest', toneHint: 'lively', mechanicHints: ['race', 'jump'] },
  { id: 'shark', label: '鲨鱼', emoji: '🦈', words: ['鲨鱼', '大鲨鱼'], sceneHint: 'sea', toneHint: 'cool', mechanicHints: ['collect', 'dodge'] },
  { id: 'butterfly', label: '蝴蝶', emoji: '🦋', words: ['蝴蝶'], sceneHint: 'garden', toneHint: 'cute', mechanicHints: ['collect', 'dodge'] },
  { id: 'hero', label: '超级英雄', emoji: '🦸', words: ['超人', '英雄', '超级英雄', '奥特曼'], sceneHint: 'city', toneHint: 'cool', mechanicHints: ['dodge', 'pop'] },
  { id: 'wizard', label: '小魔法师', emoji: '🧙', words: ['魔法师', '巫师', '小仙女', '魔仙'], sceneHint: 'castle', toneHint: 'mystery', mechanicHints: ['pop', 'collect'] },
  { id: 'mermaid', label: '美人鱼', emoji: '🧜', words: ['美人鱼', '人鱼'], sceneHint: 'sea', toneHint: 'cute', mechanicHints: ['collect', 'dodge'] },
  { id: 'dragon', label: '龙', emoji: '🐉', words: ['小龙', '飞龙', '神龙'], sceneHint: 'volcano', toneHint: 'cool', mechanicHints: ['race', 'pop'] },
  { id: 'bird', label: '小鸟', emoji: '🐦', words: ['小鸟', '鸟'], sceneHint: 'sky', toneHint: 'lively', mechanicHints: ['dodge', 'collect'] },
  { id: 'fish', label: '小鱼', emoji: '🐟', words: ['小鱼', '金鱼'], sceneHint: 'sea', toneHint: 'cute', mechanicHints: ['collect', 'dodge'] },
  { id: 'elephant', label: '大象', emoji: '🐘', words: ['大象', '小象'], sceneHint: 'meadow', toneHint: 'funny', mechanicHints: ['race', 'collect'] },
  { id: 'monkey', label: '小猴子', emoji: '🐵', words: ['猴子', '小猴'], sceneHint: 'forest', toneHint: 'funny', mechanicHints: ['jump', 'collect'] },
  { id: 'plane', label: '小飞机', emoji: '✈️', words: ['飞机', '小飞机'], sceneHint: 'sky', toneHint: 'cool', mechanicHints: ['dodge', 'race'] },
  { id: 'ghost', label: '小幽灵', emoji: '👻', words: ['幽灵', '鬼', '小鬼'], sceneHint: 'castle', toneHint: 'mystery', mechanicHints: ['pop', 'dodge'] },
  { id: 'ninja', label: '小忍者', emoji: '🥷', words: ['忍者'], sceneHint: 'city', toneHint: 'cool', mechanicHints: ['jump', 'dodge'] },
  { id: 'pirate', label: '小海盗', emoji: '🏴‍☠️', words: ['海盗'], sceneHint: 'sea', toneHint: 'funny', mechanicHints: ['collect', 'dodge'] },
  { id: 'icecream', label: '冰淇淋', emoji: '🍦', words: ['冰淇淋', '雪糕'], sceneHint: 'candy', toneHint: 'cute', mechanicHints: ['collect', 'jump'] },
  { id: 'cake', label: '小蛋糕', emoji: '🍰', words: ['蛋糕'], sceneHint: 'candy', toneHint: 'cute', mechanicHints: ['collect', 'pop'] },
  { id: 'astronaut', label: '宇航员', emoji: '🧑‍🚀', words: ['宇航员', '太空人'], sceneHint: 'space', toneHint: 'cool', mechanicHints: ['collect', 'dodge'] },
  { id: 'frog', label: '小青蛙', emoji: '🐸', words: ['青蛙', '小蛙'], sceneHint: 'garden', toneHint: 'funny', mechanicHints: ['jump', 'collect'] },
];

export interface SceneEntry {
  id: string;
  label: string;
  emoji: string;
  words: string[];
}

export const SCENES: SceneEntry[] = [
  { id: 'forest', label: '大森林', emoji: '🌲', words: ['森林', '树林', '丛林'] },
  { id: 'space', label: '外太空', emoji: '🌌', words: ['太空', '宇宙', '外星', '星球'] },
  { id: 'school', label: '学校', emoji: '🏫', words: ['学校', '教室', '幼儿园'] },
  { id: 'sea', label: '海底世界', emoji: '🌊', words: ['海底', '大海', '海里', '水下', '海洋'] },
  { id: 'castle', label: '城堡', emoji: '🏰', words: ['城堡', '王国', '宫殿'] },
  { id: 'meadow', label: '大草地', emoji: '🌿', words: ['草地', '操场', '运动场', '草原'] },
  { id: 'desert', label: '大沙漠', emoji: '🏜️', words: ['沙漠', '沙子里'] },
  { id: 'snow', label: '冰雪世界', emoji: '⛄', words: ['雪地', '冰雪', '雪山', '下雪'] },
  { id: 'city', label: '大城市', emoji: '🏙️', words: ['城市', '大街', '马路'] },
  { id: 'volcano', label: '火山', emoji: '🌋', words: ['火山'] },
  { id: 'sky', label: '云朵上', emoji: '☁️', words: ['天上', '天空', '云朵', '云上'] },
  { id: 'candy', label: '糖果世界', emoji: '🍭', words: ['糖果', '甜甜的世界', '巧克力'] },
  { id: 'garden', label: '花园', emoji: '🌸', words: ['花园', '花丛', '院子'] },
  { id: 'moon', label: '月亮上', emoji: '🌙', words: ['月亮', '月球'] },
  { id: 'rainbow', label: '彩虹桥', emoji: '🌈', words: ['彩虹上', '彩虹桥'] },
];

export interface MechanicEntry {
  id: MechanicId;
  label: string;
  emoji: string;
  /** 复述确认时的动词短语 */
  verb: string;
  /** 作品名后缀 */
  titleNoun: string;
  words: string[];
}

export const MECHANICS: MechanicEntry[] = [
  { id: 'race', label: '赛跑', emoji: '🏁', verb: '比赛跑步', titleNoun: '大赛跑', words: ['赛跑', '比赛跑', '跑得快', '竞速', '冲刺', '跑步比赛', '比谁快', '赛一赛'] },
  { id: 'collect', label: '收集星星', emoji: '⭐', verb: '收集亮晶晶的星星', titleNoun: '收集大冒险', words: ['收集', '捡', '接住', '吃金币', '吃星星', '吃糖', '捞', '摘'] },
  { id: 'dodge', label: '躲避障碍', emoji: '🙈', verb: '躲开飞来的障碍', titleNoun: '躲避大挑战', words: ['躲', '逃', '避开', '别碰到', '不要被抓', '追我', '闪开'] },
  { id: 'jump', label: '跳跳跑酷', emoji: '🦘', verb: '跳过一个个障碍', titleNoun: '跳跳乐', words: ['跳', '蹦', '跑酷', '越过', '跨过'] },
  { id: 'pop', label: '戳泡泡', emoji: '🫧', verb: '把泡泡一个个戳破', titleNoun: '泡泡派对', words: ['泡泡', '戳', '打地鼠', '点破', '拍', '抓住它们', '打怪'] },
];

export interface ToneEntry {
  id: ToneId;
  label: string;
  emoji: string;
  words: string[];
}

export const TONES: ToneEntry[] = [
  { id: 'cute', label: '可爱', emoji: '🎀', words: ['可爱', '粉粉', '软软', '萌萌'] },
  { id: 'cool', label: '酷炫', emoji: '😎', words: ['酷炫', '酷酷', '很酷', '超酷', '帅气', '很帅', '炫酷'] },
  { id: 'mystery', label: '神秘', emoji: '🔮', words: ['神秘', '黑黑的', '魔法感', '夜晚'] },
  { id: 'funny', label: '搞笑', emoji: '🤪', words: ['搞笑', '好笑', '滑稽', '逗'] },
  { id: 'lively', label: '热闹', emoji: '🎉', words: ['热闹', '开心', '欢乐', '嗨'] },
];

export interface DetailEntry {
  effect: EffectId;
  label: string;
  emoji: string;
  words: string[];
}

export const DETAILS: DetailEntry[] = [
  { effect: 'fire', label: '会喷火', emoji: '🔥', words: ['喷火', '喷出火', '吐火'] },
  { effect: 'fly', label: '会飞', emoji: '🪽', words: ['会飞', '飞起来', '长翅膀', '翅膀'] },
  { effect: 'glow', label: '会发光', emoji: '💡', words: ['发光', '亮亮的', '会发亮'] },
  { effect: 'rainbow', label: '彩虹色', emoji: '🌈', words: ['彩虹色', '七彩', '彩色的'] },
  { effect: 'speed', label: '超级快', emoji: '⚡', words: ['超级快', '飞快', '特别快', '闪电一样'] },
  { effect: 'sparkle', label: '有魔法', emoji: '✨', words: ['魔法', '会变身', '星星光'] },
];

// —— 网站类作品（PRD V2）：类型触发词 + 核心功能词 ——

/** 命中这些词 → creation_type = website */
export const SITE_TRIGGERS = ['网站', '网页', '主页', '画廊', '相册', '画展', '故事书', '绘本', '故事', '邀请函', '请柬', '介绍', '名片'];

export interface SiteKindEntry {
  id: SiteKind;
  label: string;
  /** 复述确认时的功能短语 */
  verb: string;
  titleNoun: string;
  words: string[];
}

export const SITE_KINDS: SiteKindEntry[] = [
  { id: 'gallery', label: '画廊', verb: '展示漂亮的画', titleNoun: '奇幻画廊', words: ['画廊', '相册', '画展', '照片', '展示'] },
  { id: 'story', label: '故事书', verb: '讲一个小故事', titleNoun: '小故事书', words: ['故事', '绘本', '故事书', '讲故事'] },
  { id: 'intro', label: '介绍页', verb: '介绍它自己', titleNoun: '小主页', words: ['介绍', '名片', '主页', '自我介绍'] },
  { id: 'invite', label: '邀请函', verb: '邀请朋友来玩', titleNoun: '派对邀请函', words: ['邀请', '请柬', '派对', '生日会'] },
];

export function siteKindMeta(id: SiteKind): SiteKindEntry {
  return SITE_KINDS.find((k) => k.id === id)!;
}

/** 捕获自定义主角时要排除的形容词/废词 */
export const STOP_WORDS = [
  '好玩', '有趣', '超级', '漂亮', '简单', '厉害', '特别', '喜欢', '想要',
  '一个', '什么', '这样', '那样', '大大', '小小', '最棒', '好看',
];

export const TONE_LABEL: Record<ToneId, string> = {
  cute: '可爱', cool: '酷炫', mystery: '神秘', funny: '搞笑', lively: '热闹',
};

export function mechanicMeta(id: MechanicId): MechanicEntry {
  return MECHANICS.find((m) => m.id === id)!;
}

export function sceneMeta(id: string): SceneEntry {
  return SCENES.find((s) => s.id === id) ?? SCENES[5];
}
