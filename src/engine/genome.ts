// 作品基因（Genome）：真正的“内容生成”层。
// 每个作品在深度构建时生成一份独有剧本——开场白、通关台词、关卡名、
// 游戏中途的剧情事件、物件命名、故事书正文、介绍页问答……
// LLM 可用时由大模型创作（见 app/llm.ts），不可用时用本地程序化生成器随机合成，
// 保证“同一个想法，每次生成的作品都不一样”。模板引擎只是这份剧本的执行器。

import { TONE_LABEL, mechanicMeta, sceneMeta } from './lexicon';
import type { SlotProfile } from './types';

/** 游戏进行中触发的剧情事件 */
export interface GenEvent {
  /** 触发时刻（开局后第几秒） */
  at: number;
  kind: 'star_rain' | 'speed_wind' | 'cheer';
  /** 事件横幅台词（画布内展示 + 可播报） */
  line: string;
}

export interface GameGenome {
  /** 开场白：小灵讲的一句背景小故事 */
  intro: string;
  /** 通关台词 */
  winLine: string;
  /** 关卡名（第 2、3、4 关…的故事名） */
  levelNames: string[];
  /** 游戏事件序列 */
  events: GenEvent[];
  /** 收集物 / 障碍物的命名（世界观） */
  itemName: string;
  obstacleName: string;
}

export interface SiteGenome {
  /** 页面欢迎语 */
  welcomeLine: string;
  /** 故事书四页正文 */
  storyPages: string[];
  /** 介绍页趣味问答 */
  facts: [string, string][];
  /** 邀请函大字 */
  inviteLine: string;
}

export interface Genome {
  game?: GameGenome;
  site?: SiteGenome;
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// ---------- 程序化生成器（离线兜底，仍保证每次不同） ----------

export function proceduralGameGenome(profile: SlotProfile): GameGenome {
  const hero = profile.subject?.label ?? '小主角';
  const scene = profile.scene?.label ?? '大草地';
  const skill = profile.key_detail?.label;
  const friend = profile.companion?.label;
  const verb = profile.mechanic ? mechanicMeta(profile.mechanic).verb : '大冒险';

  const intro = pick([
    `传说${scene}的深处藏着一颗许愿星，${hero}决定今天就出发去找它！`,
    `今天是${scene}一年一度的大日子，${hero}${skill ? `带着${skill}的绝招` : '鼓足了勇气'}来啦！`,
    `${hero}做了一个梦，梦见自己在${scene}里${verb}——醒来发现，梦是真的！`,
    friend
      ? `${hero}和${friend}拉了勾：谁都不许偷懒，一起在${scene}闯出名堂！`
      : `${hero}悄悄给自己定了一个小目标：成为${scene}最棒的那一个！`,
  ]);

  const winLine = pick([
    `${scene}的烟花全都为${hero}点亮啦！`,
    `${hero}把奖杯高高举过头顶，笑得见牙不见眼！`,
    skill ? `靠着${skill}的绝招，${hero}成功啦！` : `${hero}成功啦，连星星都在鼓掌！`,
    `今晚${scene}会流传${hero}的传说！`,
  ]);

  const levelNames = shuffle([
    `${scene}的风开始变大了`,
    `传说中的弯道出现啦`,
    `星星藏得更高了`,
    `${hero}的心跳加速时刻`,
    `最后的大魔王关`,
  ]).slice(0, 4);

  const cheers = [
    `${hero}，加油呀！`,
    friend ? `${friend}在给你打气！` : '小灵在给你打气！',
    skill ? `用${skill}的绝招！` : '你可以的！',
    '别眨眼，好戏来啦！',
  ];

  const events: GenEvent[] = shuffle([
    { at: 6 + Math.random() * 4, kind: 'star_rain' as const, line: pick(['哇，天上下起了星星雨！', '许愿星撒下了小星星！']) },
    { at: 14 + Math.random() * 5, kind: 'speed_wind' as const, line: pick([`${scene}吹来一阵顺风！`, '追风精灵来帮忙啦，冲呀！']) },
    { at: 22 + Math.random() * 5, kind: 'cheer' as const, line: pick(cheers) },
  ]).slice(0, 2 + Math.floor(Math.random() * 2)).sort((a, b) => a.at - b.at);

  const itemName = pick(['许愿星', '魔法星星', '亮晶晶', '星星糖']);
  const obstacleName = pick(['捣蛋石', '拦路怪', '小障碍', '淘气包']);

  return { intro, winLine, levelNames, events, itemName, obstacleName };
}

export function proceduralSiteGenome(profile: SlotProfile): SiteGenome {
  const hero = profile.subject?.label ?? '小主角';
  const scene = profile.scene?.label ?? '大草地';
  const skill = profile.key_detail?.label ?? pick(['笑得特别甜', '跑得特别快', '梦特别多']);
  const friend = profile.companion?.label ?? pick(['好朋友', '小伙伴']);
  const tone = TONE_LABEL[profile.tone ?? 'lively'];

  const welcomeLine = pick([
    `欢迎来到${hero}的小天地！`,
    `${scene}最有名的就是${hero}啦！`,
    `嘘——${hero}有好多小秘密要告诉你。`,
  ]);

  const storyPages = [
    pick([
      `在${scene}上，住着一只叫${hero}的小家伙，它${skill}。`,
      `${scene}的清晨，${hero}被一缕光挠醒了鼻子——新的一天开始啦。`,
    ]),
    pick([
      `有一天，${hero}出门探险，一路蹦蹦跳跳，遇见了${friend}。`,
      `${hero}捡到一张藏宝图，拉上${friend}就出发了！`,
    ]),
    pick([
      `它们一起爬上云朵，把星星一颗一颗装进小口袋。`,
      `走过${sceneMeta('forest').label}、越过${sceneMeta('sky').label}，宝藏原来是一箱亮晶晶的笑声！`,
    ]),
    pick([
      `天黑啦，${hero}回到${scene}，做了一个亮晶晶的梦。晚安！`,
      `回家的路上，${hero}悄悄许愿：明天还要和${friend}一起玩。晚安！`,
    ]),
  ];

  const facts: [string, string][] = [
    ['我叫', hero],
    ['我住在', scene],
    ['我的绝招', skill],
    ['我的性格', tone],
    pick<[string, string]>([
      ['最爱吃', pick(['云朵棉花糖', '星星脆片', '彩虹果冻'])],
      ['小秘密', pick(['睡觉会打小呼噜', '会对着月亮唱歌', '藏了一盒宝石贴纸'])],
      ['最大的梦想', pick(['环游所有奇妙世界', '交一百个好朋友', '造一座云朵城堡'])],
    ]),
  ];
  if (profile.companion) facts.splice(4, 0, ['我的好朋友', profile.companion.label]);

  const inviteLine = pick([
    `请你来${hero}的派对！`,
    `${hero}的${scene}大派对，就差你啦！`,
    `今晚${scene}见！${hero}等你！`,
  ]);

  return { welcomeLine, storyPages, facts, inviteLine };
}

export function proceduralGenome(profile: SlotProfile): Genome {
  return profile.creation_type === 'website'
    ? { site: proceduralSiteGenome(profile) }
    : { game: proceduralGameGenome(profile) };
}

/** 校验/修补 LLM 返回的基因：字段缺失就用程序化生成的补齐 */
export function mendGenome(raw: unknown, profile: SlotProfile): Genome {
  const fallback = proceduralGenome(profile);
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Record<string, unknown>;
  if (profile.creation_type === 'website') {
    const f = fallback.site!;
    const s = (r.site ?? r) as Partial<SiteGenome>;
    return {
      site: {
        welcomeLine: typeof s.welcomeLine === 'string' && s.welcomeLine ? s.welcomeLine.slice(0, 60) : f.welcomeLine,
        storyPages: Array.isArray(s.storyPages) && s.storyPages.length >= 4
          ? s.storyPages.slice(0, 4).map((p) => String(p).slice(0, 120))
          : f.storyPages,
        facts: Array.isArray(s.facts) && s.facts.length >= 3
          ? (s.facts.slice(0, 6).map((x) => [String((x as string[])[0]).slice(0, 12), String((x as string[])[1]).slice(0, 30)]) as [string, string][])
          : f.facts,
        inviteLine: typeof s.inviteLine === 'string' && s.inviteLine ? s.inviteLine.slice(0, 40) : f.inviteLine,
      },
    };
  }
  const f = fallback.game!;
  const g = (r.game ?? r) as Partial<GameGenome>;
  const okEvent = (e: unknown): e is GenEvent => {
    const ev = e as GenEvent;
    return !!ev && typeof ev.at === 'number' && ['star_rain', 'speed_wind', 'cheer'].includes(ev.kind) && typeof ev.line === 'string';
  };
  return {
    game: {
      intro: typeof g.intro === 'string' && g.intro ? g.intro.slice(0, 80) : f.intro,
      winLine: typeof g.winLine === 'string' && g.winLine ? g.winLine.slice(0, 60) : f.winLine,
      levelNames: Array.isArray(g.levelNames) && g.levelNames.length > 0
        ? g.levelNames.slice(0, 5).map((n) => String(n).slice(0, 20))
        : f.levelNames,
      events: Array.isArray(g.events) && g.events.some(okEvent)
        ? g.events.filter(okEvent).slice(0, 4).map((e) => ({ ...e, at: Math.min(40, Math.max(4, e.at)), line: e.line.slice(0, 30) }))
        : f.events,
      itemName: typeof g.itemName === 'string' && g.itemName ? g.itemName.slice(0, 8) : f.itemName,
      obstacleName: typeof g.obstacleName === 'string' && g.obstacleName ? g.obstacleName.slice(0, 8) : f.obstacleName,
    },
  };
}
