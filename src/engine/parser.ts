// 需求拆解引擎（PRD 3.2）+ 分歧检测（PRD 3.3）+ “永远不说不行”转译层。
// 这是产品的“翻译层”：把孩子的自然语言可靠地转成结构化槽位，
// 判定逻辑真实生效（词库匹配 / 推断 / 默认值 / 分歧），不是写死的演示流程。

import {
  DETAILS, MECHANICS, SCENES, STOP_WORDS, SUBJECTS, TONES,
  mechanicMeta, sceneMeta,
} from './lexicon';
import type {
  Confidence, DetailInfo, Divergence, DivergenceOption, MechanicId,
  NamedThing, ParseResult, SlotName, SlotProfile, ToneId,
} from './types';

export function emptyProfile(): SlotProfile {
  return {
    creation_type: 'game',
    subject: null,
    companion: null,
    scene: null,
    mechanic: null,
    tone: null,
    key_detail: null,
    difficulty: 'easy',
    confidence: {
      subject: 'missing', scene: 'missing', mechanic: 'missing',
      tone: 'missing', key_detail: 'missing',
    },
    raw: {},
  };
}

const cloneProfile = (p: SlotProfile): SlotProfile =>
  JSON.parse(JSON.stringify(p)) as SlotProfile;

// ---------- 文本工具 ----------

function normalize(text: string): string {
  return text.replace(/[\s，。！？、,.!?~～…·:：;；'"“”]/g, '');
}

/** 找出文本中所有被否定的片段（“不要/别/不是/不喜欢 X”） */
function negatedSegments(text: string): string[] {
  const out: string[] = [];
  const re = /(?:不要|别|不是|不喜欢|不想)([^\s，。！？,.!?]{1,8})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m[1]);
  return out;
}

/** word 在文本中出现且未被否定 */
function mentioned(norm: string, negs: string[], word: string): number {
  const idx = norm.indexOf(word);
  if (idx < 0) return -1;
  if (negs.some((n) => n.includes(word) || word.includes(n))) return -1;
  return idx;
}

// ---------- “永远不说不行”转译（PRD 第 2/4 节） ----------

interface InfeasibleRule {
  re: RegExp;
  line: (m: RegExpMatchArray) => string;
}

const INFEASIBLE_RULES: InfeasibleRule[] = [
  {
    re: /真的|真正的|活的/,
    line: () => '真的家伙会把屏幕踩坏的！我们画一个超级超级像真的，好不好呀～',
  },
  {
    re: /联网|全世界|别人的手机|好朋友的手机|网上一起/,
    line: () => '我们先和电脑小伙伴一起玩，等你玩得超厉害，再邀请好朋友来！',
  },
  {
    re: /(一百|100|一千|1000|好多好多)[个关]?关/,
    line: () => '我们先做一关最最好玩的，玩通关了马上变出下一关！',
  },
  {
    re: /下载|安装|装到手机/,
    line: () => '不用下载哦，做好了马上就能在这里玩！',
  },
];

function findTranslations(text: string): string[] {
  const out: string[] = [];
  for (const r of INFEASIBLE_RULES) {
    const m = text.match(r.re);
    if (m) out.push(r.line(m));
  }
  return out;
}

// ---------- 槽位匹配 ----------

interface SubjectHit {
  thing: NamedThing;
  raw: string;
  index: number;
  entry: (typeof SUBJECTS)[number] | null;
}

function matchSubjects(norm: string, negs: string[]): SubjectHit[] {
  const hits: SubjectHit[] = [];
  for (const s of SUBJECTS) {
    let best = -1;
    let bestWord = '';
    for (const w of s.words) {
      const i = mentioned(norm, negs, w);
      if (i >= 0 && (best < 0 || i < best || (i === best && w.length > bestWord.length))) {
        best = i;
        bestWord = w;
      }
    }
    if (best >= 0) {
      hits.push({
        thing: { id: s.id, label: s.label, emoji: s.emoji },
        raw: bestWord,
        index: best,
        entry: s,
      });
    }
  }
  hits.sort((a, b) => a.index - b.index);
  // 去掉重叠命中（如“猫”与“小猫”）：同一位置只留最长词
  const dedup: SubjectHit[] = [];
  for (const h of hits) {
    if (!dedup.some((d) => Math.abs(d.index - h.index) < d.raw.length)) dedup.push(h);
  }
  return dedup;
}

/** 捕获词库外的自定义主角：“一个/一只/叫 XX 的游戏”、“XX 在……” */
function captureCustomSubject(text: string, norm: string): { label: string; raw: string } | null {
  // 先剥掉开头的意图短语，让“土豆侠在糖果世界跳”这类句式也能捕获主语
  const stripped = norm.replace(/^(我想要|我想做|我要做|我想|我要|做一个|给我做|帮我做|来一个)/, '');
  const patterns = [
    /(?:一个|一只|一条|一辆|一位)([一-龥A-Za-z0-9]{2,6}?)(?:的)?(?:游戏|大冒险|冒险)/,
    /(?:叫|名字是)([一-龥A-Za-z0-9]{2,6})(?:的)?/,
    /(?:关于)([一-龥A-Za-z0-9]{2,6})(?:的)/,
    new RegExp(`^([一-龥A-Za-z0-9]{2,5}?)(?:在|和)`),
  ];
  const known = [
    ...SUBJECTS.flatMap((s) => s.words),
    ...SCENES.flatMap((s) => s.words),
    ...MECHANICS.flatMap((m) => m.words),
    ...TONES.flatMap((t) => t.words),
    ...DETAILS.flatMap((d) => d.words),
  ];
  for (const re of patterns) {
    const m = text.match(re) ?? norm.match(re) ?? stripped.match(re);
    if (!m) continue;
    const word = m[1];
    if (STOP_WORDS.some((sw) => word.includes(sw))) continue;
    if (known.some((k) => word.includes(k) || k.includes(word))) continue;
    return { label: word, raw: word };
  }
  return null;
}

function matchScene(norm: string, negs: string[]): { thing: NamedThing; raw: string } | null {
  let best: { thing: NamedThing; raw: string; index: number } | null = null;
  for (const s of SCENES) {
    for (const w of s.words) {
      const i = mentioned(norm, negs, w);
      if (i >= 0 && (!best || i < best.index)) {
        best = { thing: { id: s.id, label: s.label, emoji: s.emoji }, raw: w, index: i };
      }
    }
  }
  return best;
}

function matchMechanics(norm: string, negs: string[]): { id: MechanicId; raw: string; index: number }[] {
  const found = new Map<MechanicId, { id: MechanicId; raw: string; index: number }>();
  for (const m of MECHANICS) {
    for (const w of m.words) {
      const i = mentioned(norm, negs, w);
      if (i >= 0) {
        const prev = found.get(m.id);
        if (!prev || i < prev.index) found.set(m.id, { id: m.id, raw: w, index: i });
      }
    }
  }
  return [...found.values()].sort((a, b) => a.index - b.index);
}

function matchTone(norm: string, negs: string[]): { id: ToneId; raw: string }[] {
  const out: { id: ToneId; raw: string; index: number }[] = [];
  for (const t of TONES) {
    for (const w of t.words) {
      const i = mentioned(norm, negs, w);
      if (i >= 0) {
        out.push({ id: t.id, raw: w, index: i });
        break;
      }
    }
  }
  return out.sort((a, b) => a.index - b.index);
}

function matchDetail(text: string, norm: string, negs: string[]): DetailInfo | null {
  for (const d of DETAILS) {
    for (const w of d.words) {
      if (mentioned(norm, negs, w) >= 0) {
        return { label: d.label, raw: w, effect: d.effect };
      }
    }
  }
  // 强调句式捕获词库外的执念点：“一定要会隐身”
  const m = text.match(/(?:一定要|必须|不能没有|最重要的是|我要它|要会)([一-龥]{2,6})/);
  if (m && !STOP_WORDS.some((sw) => m[1].includes(sw))) {
    return { label: m[1], raw: m[1], effect: 'sparkle' };
  }
  return null;
}

/** 该细节是否被强调（一定要…/重复两次以上）→ key_detail 优先级最高 */
function isEmphasized(text: string, raw: string): boolean {
  const emphasis = new RegExp(`(一定要|必须|不能没有|最重要|我要它|要会)[^，。！？]{0,4}${raw}`);
  if (emphasis.test(text)) return true;
  const count = text.split(raw).length - 1;
  return count >= 2;
}

// ---------- 默认填充（PRD 3.2 第 4 步“否 → 直接填入合理默认值”） ----------

function subjectEntryOf(profile: SlotProfile) {
  return profile.subject ? SUBJECTS.find((s) => s.id === profile.subject!.id) ?? null : null;
}

function fillSceneDefault(profile: SlotProfile) {
  if (profile.scene) return;
  const entry = subjectEntryOf(profile);
  if (entry?.sceneHint) {
    const s = sceneMeta(entry.sceneHint);
    profile.scene = { id: s.id, label: s.label, emoji: s.emoji };
    profile.confidence.scene = 'medium_inferred';
  } else {
    const s = sceneMeta('meadow');
    profile.scene = { id: s.id, label: s.label, emoji: s.emoji };
    profile.confidence.scene = 'default';
  }
}

function fillToneDefault(profile: SlotProfile) {
  if (profile.tone) return;
  const entry = subjectEntryOf(profile);
  profile.tone = entry?.toneHint ?? 'lively';
  profile.confidence.tone = entry?.toneHint ? 'medium_inferred' : 'default';
}

// ---------- 分歧构造（PRD 3.3：一次只处理一个，视觉优先） ----------

function mechanicOptions(profile: SlotProfile): [MechanicId, MechanicId] {
  const entry = subjectEntryOf(profile);
  const hints = entry?.mechanicHints ?? ['race', 'collect'];
  return [hints[0], hints[1] ?? (hints[0] === 'race' ? 'collect' : 'race')];
}

function mechanicDivergence(profile: SlotProfile, reason: 'missing' | 'conflict', ids?: MechanicId[]): Divergence {
  const [a, b] = ids && ids.length >= 2 ? [ids[0], ids[1]] : mechanicOptions(profile);
  const mk = (id: MechanicId): DivergenceOption => {
    const meta = mechanicMeta(id);
    return {
      label: meta.label,
      emoji: meta.emoji,
      patch: { mechanic: id },
    };
  };
  return {
    slot: 'mechanic',
    kind: 'visual',
    reason,
    prompt:
      reason === 'conflict'
        ? '两种玩法我都画出来啦！你更喜欢哪一个？指给我看！'
        : '我画了两个好玩的版本！你更喜欢哪一个？指给我看！',
    options: [mk(a), mk(b)],
  };
}

function subjectDivergence(): Divergence {
  const picks = [SUBJECTS[0], SUBJECTS[7]]; // 恐龙 vs 独角兽：视觉差异最大
  return {
    slot: 'subject',
    kind: 'visual',
    reason: 'missing',
    prompt: '我先画了两位小主角！你想让谁当主角？指给我看！',
    options: picks.map((s) => ({
      label: s.label,
      emoji: s.emoji,
      patch: { subject: { id: s.id, label: s.label, emoji: s.emoji } },
    })),
  };
}

function toneDivergence(tones: { id: ToneId; raw: string }[]): Divergence {
  return {
    slot: 'tone',
    kind: 'visual',
    reason: 'conflict',
    prompt: '两种感觉我都画出来啦！你更喜欢哪一种颜色的世界？',
    options: tones.slice(0, 2).map((t) => {
      const meta = TONES.find((x) => x.id === t.id)!;
      return { label: meta.label, emoji: meta.emoji, patch: { tone: t.id } };
    }),
  };
}

/** 规则类分歧：难度无法用一张草图画出来 → 兜底图卡选择题（PRD 3.3 兜底路径） */
function difficultyDivergence(): Divergence {
  return {
    slot: 'difficulty',
    kind: 'cards',
    reason: 'rule',
    prompt: '想轻轻松松地玩，还是来一场超级大挑战？',
    options: [
      { label: '轻松玩', emoji: '⭐', patch: { difficulty: 'easy' } },
      { label: '大挑战', emoji: '⭐⭐⭐', patch: { difficulty: 'hard' } },
    ],
  };
}

// ---------- 主入口 ----------

/**
 * 解析一句孩子的话。base 传入已有 profile 时为“迭代模式”（PRD 3.7 接着上次的改）。
 * 返回：更新后的 profile、至多一个分歧点、转译台词、改动的槽位。
 */
export function parseUtterance(text: string, base?: SlotProfile | null): ParseResult {
  const profile = base ? cloneProfile(base) : emptyProfile();
  const changed: SlotName[] = [];
  const norm = normalize(text);
  const negs = negatedSegments(text);
  const translations = findTranslations(text);

  // —— 否定处理：孩子说“不要森林” → 清掉已有取值，重新推断 ——
  if (base) {
    for (const n of negs) {
      if (profile.scene && SCENES.some((s) => s.id === profile.scene!.id && s.words.some((w) => n.includes(w)))) {
        profile.scene = null;
        profile.confidence.scene = 'missing';
        changed.push('scene');
      }
      if (profile.subject && SUBJECTS.some((s) => s.id === profile.subject!.id && s.words.some((w) => n.includes(w)))) {
        profile.subject = null;
        profile.confidence.subject = 'missing';
        changed.push('subject');
      }
      if (profile.mechanic && mechanicMeta(profile.mechanic).words.some((w) => n.includes(w))) {
        profile.mechanic = null;
        profile.confidence.mechanic = 'missing';
        changed.push('mechanic');
      }
    }
  }

  // —— 主体（可能有同伴：“恐龙和公主”） ——
  const subjectHits = matchSubjects(norm, negs);
  if (subjectHits.length > 0) {
    const hero = subjectHits[0];
    if (!profile.subject || profile.subject.id !== hero.thing.id) {
      profile.subject = hero.thing;
      profile.raw.subject = hero.raw;
      changed.push('subject');
    }
    profile.confidence.subject = 'high';
    if (subjectHits.length > 1) {
      profile.companion = subjectHits[1].thing;
    }
  } else if (!profile.subject) {
    const custom = captureCustomSubject(text, norm);
    if (custom) {
      profile.subject = { id: `custom:${custom.label}`, label: custom.label, emoji: '✨', custom: true };
      profile.raw.subject = custom.raw;
      profile.confidence.subject = 'high';
      changed.push('subject');
    }
  }

  // —— 场景 ——
  const scene = matchScene(norm, negs);
  if (scene) {
    if (!profile.scene || profile.scene.id !== scene.thing.id) changed.push('scene');
    profile.scene = scene.thing;
    profile.raw.scene = scene.raw;
    profile.confidence.scene = 'high';
  }

  // —— 玩法（可能冲突） ——
  const mechs = matchMechanics(norm, negs);
  let mechanicConflict: MechanicId[] | null = null;
  if (mechs.length === 1) {
    if (profile.mechanic !== mechs[0].id) changed.push('mechanic');
    profile.mechanic = mechs[0].id;
    profile.raw.mechanic = mechs[0].raw;
    profile.confidence.mechanic = 'high';
  } else if (mechs.length >= 2) {
    mechanicConflict = mechs.map((m) => m.id);
  }

  // —— 基调（可能冲突） ——
  const tones = matchTone(norm, negs);
  let toneConflict = false;
  if (tones.length === 1) {
    if (profile.tone !== tones[0].id) changed.push('tone');
    profile.tone = tones[0].id;
    profile.raw.tone = tones[0].raw;
    profile.confidence.tone = 'high';
  } else if (tones.length >= 2) {
    toneConflict = true;
  }

  // —— 关键细节（执念点优先级最高） ——
  const detail = matchDetail(text, norm, negs);
  if (detail) {
    const emphasized = isEmphasized(text, detail.raw);
    if (!profile.key_detail || emphasized || profile.key_detail.effect !== detail.effect) {
      profile.key_detail = detail;
      profile.raw.key_detail = detail.raw;
      profile.confidence.key_detail = 'high';
      changed.push('key_detail');
    }
  }

  // —— 规则类提问（难度）：唯一的兜底选择题场景 ——
  const asksDifficulty = /难不难|几关|多少关|难度|要不要难/.test(text);

  // —— 分歧判定：一次只抛出一个，优先级 主体 > 玩法 > 基调 > 规则 ——
  // 判定标准（PRD 3.2）：该槽位取值不同是否让草图明显不同。
  let divergence: Divergence | null = null;
  if (!profile.subject) {
    divergence = subjectDivergence();
  } else if (mechanicConflict) {
    divergence = mechanicDivergence(profile, 'conflict', mechanicConflict);
  } else if (!profile.mechanic) {
    divergence = mechanicDivergence(profile, 'missing');
  } else if (toneConflict) {
    divergence = toneDivergence(tones);
  } else if (asksDifficulty) {
    divergence = difficultyDivergence();
  }

  // —— 非关键缺失 → 默认填充，不打扰孩子 ——
  fillSceneDefault(profile);
  fillToneDefault(profile);
  if (!profile.key_detail) profile.confidence.key_detail = 'default';

  return { profile, divergence, translations, changed };
}

/**
 * 一次交互只处理一个分歧点（PRD 3.3）：
 * 解决一个之后，检查是否还有下一个关键缺失。
 */
export function pendingDivergence(profile: SlotProfile): Divergence | null {
  if (!profile.subject) return subjectDivergence();
  if (!profile.mechanic) return mechanicDivergence(profile, 'missing');
  return null;
}

/** 孩子在分歧界面指了一个选项 → 合并补丁，标记 resolved_by_clarify */
export function applyOption(profile: SlotProfile, divergence: Divergence, option: DivergenceOption): SlotProfile {
  const next = cloneProfile(profile);
  Object.assign(next, option.patch);
  if (divergence.slot !== 'difficulty') {
    next.confidence[divergence.slot] = 'resolved_by_clarify';
  }
  // 主角变了，重新推断依赖它的默认槽位
  if (divergence.slot === 'subject') {
    if (next.confidence.scene !== 'high') {
      next.scene = null;
      next.confidence.scene = 'missing';
      fillSceneDefault(next);
    }
    if (next.confidence.tone !== 'high') {
      next.tone = null;
      next.confidence.tone = 'missing';
      fillToneDefault(next);
    }
  }
  return next;
}

/**
 * 孩子在草图阶段打断“不是这样的”，选择了要改的槽位（PRD 3.4 → 3.3）。
 * 给该槽位生成两个“不同于当前取值”的候选，双图并排。
 */
export function buildFixDivergence(profile: SlotProfile, slot: SlotName): Divergence {
  if (slot === 'mechanic') {
    const all: MechanicId[] = ['race', 'collect', 'dodge', 'jump', 'pop'];
    const others = all.filter((m) => m !== profile.mechanic);
    const hinted = mechanicOptions(profile).filter((m) => m !== profile.mechanic);
    const picks = [...new Set([...hinted, ...others])].slice(0, 2);
    return mechanicDivergence(profile, 'conflict', picks);
  }
  if (slot === 'scene') {
    const others = SCENES.filter((s) => s.id !== profile.scene?.id);
    const picks = [others[0], others[3]];
    return {
      slot: 'scene',
      kind: 'visual',
      reason: 'conflict',
      prompt: '那我们换个地方！你喜欢哪一个？',
      options: picks.map((s) => ({
        label: s.label,
        emoji: s.emoji,
        patch: { scene: { id: s.id, label: s.label, emoji: s.emoji } },
      })),
    };
  }
  // subject
  const others = SUBJECTS.filter((s) => s.id !== profile.subject?.id);
  const picks = [others[0], others[6]];
  return {
    slot: 'subject',
    kind: 'visual',
    reason: 'conflict',
    prompt: '那我们换个主角！你想让谁上场？',
    options: picks.map((s) => ({
      label: s.label,
      emoji: s.emoji,
      patch: { subject: { id: s.id, label: s.label, emoji: s.emoji } },
    })),
  };
}

/** 导出 PRD 第 6 节格式的槽位 JSON（存档与家长层用） */
export function slotsToJSON(profile: SlotProfile): Record<string, unknown> {
  const conf: Record<string, Confidence> = { ...profile.confidence };
  return {
    creation_type: profile.creation_type,
    subject: profile.subject
      ? profile.companion
        ? `${profile.subject.label}（和${profile.companion.label}一起）`
        : profile.subject.label
      : null,
    scene: profile.scene?.label ?? null,
    mechanic: profile.mechanic ? mechanicMeta(profile.mechanic).label : null,
    tone: profile.tone,
    key_detail: profile.key_detail?.label ?? null,
    difficulty: profile.difficulty,
    confidence: conf,
  };
}
