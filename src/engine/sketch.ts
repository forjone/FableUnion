// 可视化草图生成（PRD 3.4 / 3.5）。
// 用与角色库同风格的矢量插画程序化合成场景：毫秒级出图（速度感即体验）。
// draft = 蜡笔质感低保真草稿（隐式确认用）；final = 更完整的终稿效果图（显式确认用）。

import { characterMarkup } from '../art/characters';
import {
  balloonProp, basket, bubble, building, cactus, candy, castleTower, cloud, coin, cone,
  coral, crater, cupcake, flagCheck, flower, lollipop, moonProp, mushroom, pine, planet,
  rainbowArc, rock, schoolhouse, shell, snowflake, snowman, sparkle, star5, sun,
  treeRound, trophy, volcanoMt, waves, type PropFn,
} from '../art/props';
import { INK, PALETTE as P } from '../art/style';
import { mechanicMeta, siteKindMeta } from './lexicon';
import type { MechanicId, SiteKind, SlotProfile, ToneId } from './types';

export interface SceneTheme {
  sky: [string, string];
  ground: string;
  props: { fn: PropFn; x: number; y: number; s: number }[];
  /** 该场景里的障碍物造型（草图与游戏保持一致） */
  obstacle: PropFn;
}

const W = 480;
const H = 320;
const GROUND_Y = 240;

export const SCENE_THEMES: Record<string, SceneTheme> = {
  meadow: {
    sky: ['#AEE7FF', '#EAF9FF'], ground: '#9BDB7E', obstacle: rock,
    props: [
      { fn: sun, x: 420, y: 58, s: 1 }, { fn: cloud, x: 120, y: 62, s: 0.9 },
      { fn: cloud, x: 300, y: 44, s: 0.7 }, { fn: treeRound, x: 52, y: 224, s: 1.1 },
      { fn: flower, x: 120, y: 280, s: 0.8 }, { fn: flower, x: 424, y: 276, s: 0.9 },
    ],
  },
  forest: {
    sky: ['#D5F3DC', '#F1FFF4'], ground: '#8FCB84', obstacle: rock,
    props: [
      { fn: pine, x: 58, y: 226, s: 1.2 }, { fn: treeRound, x: 430, y: 222, s: 1.1 },
      { fn: mushroom, x: 150, y: 276, s: 0.8 }, { fn: cloud, x: 300, y: 54, s: 0.8 },
      { fn: sun, x: 420, y: 58, s: 0.9 },
    ],
  },
  space: {
    sky: ['#2B2A5E', '#4B3F8C'], ground: '#6D5FC7', obstacle: rock,
    props: [
      { fn: star5, x: 80, y: 70, s: 0.5 }, { fn: sparkle, x: 300, y: 52, s: 0.9 },
      { fn: planet, x: 400, y: 88, s: 1 }, { fn: star5, x: 200, y: 112, s: 0.35 },
      { fn: star5, x: 350, y: 150, s: 0.3 }, { fn: crater, x: 150, y: 288, s: 1 },
    ],
  },
  sea: {
    sky: ['#8FDFF7', '#31A8DE'], ground: '#1E7FB8', obstacle: coral,
    props: [
      { fn: waves, x: 240, y: 120, s: 1 }, { fn: waves, x: 90, y: 78, s: 0.7 },
      { fn: coral, x: 408, y: 276, s: 1.1 }, { fn: shell, x: 100, y: 288, s: 0.9 },
      { fn: bubble, x: 320, y: 96, s: 0.5 }, { fn: bubble, x: 150, y: 142, s: 0.4 },
    ],
  },
  castle: {
    sky: ['#EFDFFF', '#FFF3FA'], ground: '#C9A6F0', obstacle: rock,
    props: [
      { fn: castleTower, x: 96, y: 218, s: 1.2 }, { fn: rainbowArc, x: 390, y: 84, s: 0.9 },
      { fn: cloud, x: 220, y: 58, s: 0.8 }, { fn: flower, x: 432, y: 280, s: 0.8 },
    ],
  },
  school: {
    sky: ['#C4E1FF', '#EAF5FF'], ground: '#F3C98B', obstacle: cone,
    props: [
      { fn: schoolhouse, x: 96, y: 232, s: 1.2 }, { fn: sun, x: 420, y: 58, s: 1 },
      { fn: cloud, x: 300, y: 60, s: 0.8 }, { fn: flower, x: 424, y: 280, s: 0.8 },
    ],
  },
  desert: {
    sky: ['#FFE3B8', '#FFF4E0'], ground: '#F2C94C', obstacle: cactus,
    props: [
      { fn: sun, x: 408, y: 60, s: 1.1 }, { fn: cactus, x: 84, y: 252, s: 1 },
      { fn: rock, x: 424, y: 290, s: 0.8 }, { fn: cloud, x: 230, y: 62, s: 0.6 },
    ],
  },
  snow: {
    sky: ['#DBEBFF', '#F4FAFF'], ground: '#EAF1F7', obstacle: snowman,
    props: [
      { fn: snowman, x: 96, y: 260, s: 1.1 }, { fn: pine, x: 430, y: 226, s: 1 },
      { fn: snowflake, x: 300, y: 82, s: 0.8 }, { fn: snowflake, x: 180, y: 122, s: 0.6 },
      { fn: cloud, x: 380, y: 52, s: 0.8 },
    ],
  },
  city: {
    sky: ['#C4E1FF', '#EAF6FF'], ground: '#B0BCCB', obstacle: cone,
    props: [
      { fn: building, x: 84, y: 236, s: 1.1 }, { fn: building, x: 146, y: 248, s: 0.8 },
      { fn: sun, x: 420, y: 56, s: 0.9 }, { fn: cloud, x: 300, y: 52, s: 0.8 },
      { fn: cone, x: 426, y: 290, s: 0.7 },
    ],
  },
  volcano: {
    sky: ['#FFD1C4', '#FFE9D6'], ground: '#B0684A', obstacle: rock,
    props: [
      { fn: volcanoMt, x: 104, y: 238, s: 1.3 }, { fn: rock, x: 404, y: 290, s: 0.8 },
      { fn: cloud, x: 320, y: 62, s: 0.7 },
    ],
  },
  sky: {
    sky: ['#9FD9FF', '#E8F7FF'], ground: '#F2F7FC', obstacle: cloud,
    props: [
      { fn: cloud, x: 90, y: 112, s: 1.1 }, { fn: cloud, x: 390, y: 82, s: 0.9 },
      { fn: balloonProp, x: 300, y: 116, s: 0.8 }, { fn: sun, x: 432, y: 52, s: 1 },
    ],
  },
  candy: {
    sky: ['#FFD9EC', '#FFF3FA'], ground: '#F8A8CF', obstacle: lollipop,
    props: [
      { fn: lollipop, x: 86, y: 244, s: 1.1 }, { fn: cupcake, x: 424, y: 280, s: 1 },
      { fn: candy, x: 300, y: 98, s: 0.8 }, { fn: cloud, x: 175, y: 58, s: 0.8 },
    ],
  },
  garden: {
    sky: ['#E1F7C4', '#F9FFEF'], ground: '#9BDB7E', obstacle: mushroom,
    props: [
      { fn: flower, x: 88, y: 272, s: 1 }, { fn: flower, x: 420, y: 268, s: 1.1 },
      { fn: mushroom, x: 300, y: 284, s: 0.7 }, { fn: sun, x: 420, y: 58, s: 1 },
      { fn: cloud, x: 150, y: 62, s: 0.7 },
    ],
  },
  moon: {
    sky: ['#3A3468', '#241F49'], ground: '#CBD3DE', obstacle: rock,
    props: [
      { fn: star5, x: 100, y: 70, s: 0.4 }, { fn: planet, x: 400, y: 80, s: 0.9 },
      { fn: crater, x: 150, y: 292, s: 1 }, { fn: crater, x: 380, y: 280, s: 1.2 },
      { fn: moonProp, x: 60, y: 120, s: 0.8 }, { fn: star5, x: 300, y: 112, s: 0.3 },
    ],
  },
  rainbow: {
    sky: ['#D8F7FF', '#FFF4FB'], ground: '#A5E8F5', obstacle: cloud,
    props: [
      { fn: rainbowArc, x: 240, y: 112, s: 1.6 }, { fn: cloud, x: 95, y: 132, s: 0.9 },
      { fn: cloud, x: 385, y: 132, s: 0.9 }, { fn: sparkle, x: 300, y: 58, s: 0.8 },
    ],
  },
};

export const TONE_ACCENT: Record<ToneId, { frame: string; banner: string }> = {
  cute: { frame: '#F8B8D4', banner: '#EE6FA8' },
  cool: { frame: '#7FD8E8', banner: '#1FA8C4' },
  mystery: { frame: '#C4B2F2', banner: '#8B6FD8' },
  funny: { frame: '#FFD976', banner: '#F2A93B' },
  lively: { frame: '#9FE3A8', banner: '#3FAE5A' },
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function themeOf(sceneId: string | undefined): SceneTheme {
  return SCENE_THEMES[sceneId ?? 'meadow'] ?? SCENE_THEMES.meadow;
}

/** 角色立绘：x 为中心、gy 为脚底所在的地面线 */
function charAt(subjectId: string | undefined, x: number, gy: number, size: number): string {
  const k = size / 120;
  return `<g transform="translate(${x - 60 * k} ${gy - 112 * k}) scale(${k})">${characterMarkup(subjectId)}</g>`;
}

/** 自定义主角的名字牌 */
function nameTag(x: number, y: number, label: string): string {
  const w = Math.max(56, label.length * 18 + 20);
  return `
    <rect x="${x - w / 2}" y="${y}" width="${w}" height="26" rx="13" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <text x="${x}" y="${y + 18}" font-size="15" text-anchor="middle" fill="${INK}"
      font-family="'ZCOOL KuaiLe','PingFang SC',sans-serif">${esc(label)}</text>`;
}

/** 火苗（喷火细节 & 徽章用） */
function flameShape(x: number, y: number, s: number): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M 0 -16 Q 10 -6 8 4 Q 7 14 0 14 Q -7 14 -8 4 Q -10 -6 0 -16" fill="${P.coral}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M 0 -6 Q 5 0 4 6 Q 3 10 0 10 Q -3 10 -4 6 Q -5 0 0 -6" fill="${P.sunshine}" stroke="none"/>
  </g>`;
}

function detailFx(profile: SlotProfile, hx: number, hy: number, hsize: number): string {
  const d = profile.key_detail;
  if (!d) return '';
  const r = hsize / 2;
  switch (d.effect) {
    case 'fire':
      return flameShape(hx + r - 4, hy + 8, 1.1) + flameShape(hx + r + 14, hy + 16, 0.7);
    case 'fly':
      return `
        <path d="M ${hx - r - 4} ${hy - 10} Q ${hx - r - 30} ${hy - 26} ${hx - r - 26} ${hy + 2} Q ${hx - r - 12} ${hy + 6} ${hx - r - 4} ${hy - 4}" fill="#fff" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M ${hx + r + 4} ${hy - 10} Q ${hx + r + 30} ${hy - 26} ${hx + r + 26} ${hy + 2} Q ${hx + r + 12} ${hy + 6} ${hx + r + 4} ${hy - 4}" fill="#fff" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
    case 'glow':
      return `<circle cx="${hx}" cy="${hy}" r="${r + 16}" fill="${P.butter}" opacity="0.5"/>`;
    case 'rainbow':
      return rainbowArc(hx - r - 30, hy - 6, 0.55);
    case 'speed':
      return `<g stroke="${P.sky}" stroke-width="5" stroke-linecap="round" opacity="0.9">
        <line x1="${hx - r - 44}" y1="${hy - 14}" x2="${hx - r - 12}" y2="${hy - 14}"/>
        <line x1="${hx - r - 54}" y1="${hy + 2}" x2="${hx - r - 16}" y2="${hy + 2}"/>
        <line x1="${hx - r - 40}" y1="${hy + 18}" x2="${hx - r - 10}" y2="${hy + 18}"/>
      </g>`;
    case 'sparkle':
      return sparkle(hx - r - 14, hy - r, 1) + sparkle(hx + r + 14, hy - r + 12, 0.7) + star5(hx + r + 4, hy - r - 14, 0.4);
    default:
      return '';
  }
}

/** 网站类作品的“页面感”布局层：画框/翻开的书/横幅/气球 */
function siteLayer(kind: SiteKind, final: boolean): string {
  const parts: string[] = [];
  const frame = (x: number, y: number, w: number, h: number, inner: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#fff" stroke="${INK}" stroke-width="3"/>` + inner;
  if (kind === 'gallery') {
    parts.push(frame(216, 88, 72, 56, star5(252, 116, 0.6)));
    parts.push(frame(306, 108, 72, 56, flower(342, 136, 0.7)));
    parts.push(frame(396, 82, 66, 52, sun(429, 108, 0.55)));
    if (final) parts.push(sparkle(300, 66, 0.8));
  } else if (kind === 'story') {
    parts.push(`
      <path d="M 230 200 Q 230 130 300 138 L 300 210 Q 240 202 230 214 Z" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <path d="M 370 200 Q 370 130 300 138 L 300 210 Q 360 202 370 214 Z" fill="#FFF6E8" stroke="${INK}" stroke-width="3"/>
      <path d="M 245 160 h 40 M 245 174 h 34 M 316 160 h 40 M 316 174 h 34" stroke="#D8BFA4" stroke-width="3" stroke-linecap="round"/>
    `);
    parts.push(star5(300, 116, 0.5));
  } else if (kind === 'intro') {
    parts.push(`
      <rect x="222" y="92" width="176" height="34" rx="17" fill="${P.sunshine}" stroke="${INK}" stroke-width="3"/>
      <path d="M 250 138 h 120 M 258 154 h 104 M 266 170 h 88" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
    `);
    parts.push(sparkle(412, 100, 0.8));
  } else if (kind === 'invite') {
    parts.push(balloonProp(250, 110, 0.9));
    parts.push(balloonProp(390, 100, 0.75));
    parts.push(`
      <path d="M 240 74 L 300 92 L 360 74" stroke="${INK}" stroke-width="2.5" fill="none"/>
      ${[252, 276, 300, 324, 348].map((x, i) =>
        `<path d="M ${x - 9} ${76 + (i === 2 ? 18 : i === 1 || i === 3 ? 12 : 2)} l 9 16 l 9 -16 Z" fill="${[P.coral, P.sunshine, P.mint, P.rose, P.sky][i]}" stroke="${INK}" stroke-width="2"/>`).join('')}
    `);
    if (final) parts.push(cupcake(320, 200, 0.9));
  }
  return parts.join('');
}

function mechanicLayer(profile: SlotProfile, final: boolean): string {
  if (profile.creation_type === 'website') {
    return siteLayer(profile.site_kind ?? 'gallery', final);
  }
  const m = profile.mechanic;
  const theme = themeOf(profile.scene?.id);
  const parts: string[] = [];
  // 组合玩法：主玩法之上撒一串可捡的星星
  if (profile.mechanic_extra === 'collect' && m !== 'collect') {
    [[200, 150], [280, 120], [360, 148]].forEach(([x, y]) => parts.push(star5(x, y, 0.55)));
  }
  if (m === 'race') {
    parts.push(`<line x1="20" y1="${GROUND_Y + 44}" x2="${W - 20}" y2="${GROUND_Y + 44}" stroke="#fff" stroke-width="4" stroke-dasharray="18 12" opacity="0.9"/>`);
    parts.push(flagCheck(W - 52, GROUND_Y + 8, 1));
    if (final) parts.push(trophy(W - 52, GROUND_Y - 52, 0.9));
  } else if (m === 'collect') {
    const spots: [number, number][] = [[170, 128], [250, 168], [330, 122], [400, 160]];
    spots.forEach(([x, y], i) => parts.push(star5(x, y, 0.7 + (i % 2) * 0.15)));
    if (final) parts.push(basket(W - 60, GROUND_Y + 46, 1.1), coin(220, 96, 0.7));
  } else if (m === 'dodge') {
    parts.push(theme.obstacle(250, 96, 0.8));
    parts.push(theme.obstacle(346, 66, 0.6));
    parts.push(`<g stroke="${P.coral}" stroke-width="4" stroke-linecap="round" opacity="0.85">
      <line x1="250" y1="122" x2="250" y2="152"/><path d="M 242 144 L 250 156 L 258 144" fill="none"/>
    </g>`);
  } else if (m === 'jump') {
    parts.push(theme.obstacle(258, GROUND_Y + 16, 0.9));
    parts.push(theme.obstacle(368, GROUND_Y + 16, 0.9));
    parts.push(`<path d="M 150 ${GROUND_Y - 20} Q 205 ${GROUND_Y - 108} 262 ${GROUND_Y - 28}" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" fill="none" opacity="0.9"/>`);
  } else if (m === 'pop') {
    const spots: [number, number, number][] = [[230, 108, 1.1], [320, 152, 0.9], [392, 92, 1], [268, 192, 0.75]];
    spots.forEach(([x, y, s]) => {
      parts.push(bubble(x, y, s * 1.4));
      parts.push(star5(x, y, s * 0.45));
    });
  }
  return parts.join('');
}

export interface SketchOptions {
  quality: 'draft' | 'final';
  /** 唯一 id 前缀，避免并排两张图的 SVG defs id 冲突 */
  uid: string;
  title?: string;
}

/** 由槽位生成一张草图/终稿 SVG（字符串，直接注入 DOM） */
export function sketchSVG(profile: SlotProfile, opts: SketchOptions): string {
  const theme = themeOf(profile.scene?.id);
  const tone = TONE_ACCENT[profile.tone ?? 'lively'];
  const final = opts.quality === 'final';
  const uid = opts.uid;

  const hx = 122;
  const gy = GROUND_Y + 36;
  const hsize = final ? 118 : 106;
  const hy = gy - hsize * 0.55;

  const hero = charAt(profile.subject?.id, hx, gy, hsize) +
    (profile.subject?.custom ? nameTag(hx, gy + 6, profile.subject.label) : '');
  const companion = profile.companion
    ? charAt(profile.companion.id, hx + 84, gy + 2, hsize * 0.66)
    : '';

  const props = theme.props
    .map((p) => p.fn(p.x, p.y, final ? p.s : p.s * 0.94))
    .join('');

  const roughFilter = final
    ? ''
    : `<filter id="${uid}-rough"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter>`;
  const groupFilter = final ? '' : `filter="url(#${uid}-rough)"`;

  const banner = final && opts.title
    ? `<g>
        <rect x="${W / 2 - 150}" y="14" width="300" height="46" rx="23" fill="${tone.banner}" stroke="${INK}" stroke-width="3"/>
        <text x="${W / 2}" y="45" font-size="23" text-anchor="middle" fill="#fff"
          font-family="'ZCOOL KuaiLe','PingFang SC',sans-serif">${esc(opts.title)}</text>
      </g>`
    : '';

  const frame = final
    ? `<rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="22" fill="none" stroke="${tone.frame}" stroke-width="9"/>`
    : `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="18" fill="none" stroke="#D8D2C4" stroke-width="3" stroke-dasharray="14 10"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">
    <defs>
      <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${theme.sky[0]}"/><stop offset="1" stop-color="${theme.sky[1]}"/>
      </linearGradient>
      ${roughFilter}
    </defs>
    <rect width="${W}" height="${H}" fill="#FFFDF6"/>
    <g ${groupFilter}>
      <rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="16" fill="url(#${uid}-sky)"/>
      <path d="M 9 ${GROUND_Y} Q ${W / 4} ${GROUND_Y - 14} ${W / 2} ${GROUND_Y} Q ${W * 3 / 4} ${GROUND_Y + 12} ${W - 9} ${GROUND_Y - 4} L ${W - 9} ${H - 25} Q ${W - 9} ${H - 9} ${W - 25} ${H - 9} L 25 ${H - 9} Q 9 ${H - 9} 9 ${H - 25} Z" fill="${theme.ground}"/>
      ${props}
      ${mechanicLayer(profile, final)}
      ${companion}
      ${hero}
      ${detailFx(profile, hx, hy, hsize)}
    </g>
    ${banner}${frame}
  </svg>`;
}

/** 分歧双版本：对每个候选选项渲染一张草图 */
export function optionSketch(profile: SlotProfile, patch: Partial<SlotProfile>, uid: string): string {
  const merged = { ...JSON.parse(JSON.stringify(profile)), ...patch } as SlotProfile;
  if (!merged.mechanic) merged.mechanic = 'race';
  return sketchSVG(merged, { quality: 'draft', uid });
}

/** 作品名：喷火恐龙大赛跑 / 恐龙奇幻画廊 */
export function workTitle(profile: SlotProfile): string {
  const detail = profile.key_detail ? profile.key_detail.label.replace(/^会/, '') : '';
  const subject = profile.subject?.label ?? '奇想';
  const noun =
    profile.creation_type === 'website'
      ? profile.site_kind ? siteKindMeta(profile.site_kind).titleNoun : '小主页'
      : profile.mechanic ? mechanicMeta(profile.mechanic).titleNoun : '大冒险';
  return `${detail}${subject}${noun}`;
}

// ---------- 选项徽章（分歧界面 / 修正卡片用的小图） ----------

const badgeWrap = (inner: string, vb = '0 0 96 96') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;

export function mechanicBadgeSVG(id: MechanicId | SiteKind): string {
  switch (id) {
    case 'gallery': return badgeWrap(
      `<rect x="14" y="22" width="30" height="26" rx="4" fill="#fff" stroke="${INK}" stroke-width="3"/>` +
      `<rect x="52" y="30" width="30" height="26" rx="4" fill="#fff" stroke="${INK}" stroke-width="3"/>` +
      star5(29, 35, 0.55) + flower(67, 44, 0.6) + sparkle(48, 70, 0.8));
    case 'story': return badgeWrap(
      `<path d="M 18 66 Q 18 30 48 34 L 48 70 Q 24 66 18 72 Z" fill="#fff" stroke="${INK}" stroke-width="3"/>` +
      `<path d="M 78 66 Q 78 30 48 34 L 48 70 Q 72 66 78 72 Z" fill="#FFF6E8" stroke="${INK}" stroke-width="3"/>` +
      star5(48, 22, 0.5));
    case 'intro': return badgeWrap(
      `<rect x="16" y="26" width="64" height="18" rx="9" fill="${P.sunshine}" stroke="${INK}" stroke-width="3"/>` +
      `<path d="M 26 56 h 44 M 32 68 h 32" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity="0.5"/>`);
    case 'invite': return badgeWrap(balloonProp(36, 40, 0.8) + balloonProp(62, 34, 0.65) + sparkle(76, 66, 0.8));
    case 'race': return badgeWrap(flagCheck(48, 48, 1.4));
    case 'collect': return badgeWrap(star5(48, 44, 1.6) + sparkle(76, 24, 0.9));
    case 'dodge': return badgeWrap(
      rock(56, 40, 1.2) +
      `<g stroke="${P.coral}" stroke-width="5" stroke-linecap="round"><line x1="24" y1="62" x2="40" y2="76"/><line x1="56" y1="66" x2="56" y2="82"/></g>`);
    case 'jump': return badgeWrap(
      `<path d="M 16 76 Q 48 8 80 76" stroke="${P.teal}" stroke-width="5" stroke-dasharray="9 9" fill="none" stroke-linecap="round"/>` +
      star5(48, 22, 0.8));
    case 'pop': return badgeWrap(bubble(48, 44, 2.2) + star5(48, 44, 0.8) +
      `<path d="M 74 70 L 86 84" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`);
  }
}

/** 场景小样：迷你天空 + 地面 + 标志道具 */
export function sceneBadgeSVG(sceneId: string): string {
  const t = themeOf(sceneId);
  const lead = t.props[0];
  return badgeWrap(`
    <defs><linearGradient id="sb-${sceneId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.sky[0]}"/><stop offset="1" stop-color="${t.sky[1]}"/>
    </linearGradient></defs>
    <rect x="4" y="4" width="88" height="88" rx="18" fill="url(#sb-${sceneId})" stroke="${INK}" stroke-width="3"/>
    <path d="M 4 66 Q 48 56 92 66 L 92 74 Q 92 92 74 92 L 22 92 Q 4 92 4 74 Z" fill="${t.ground}"/>
    ${lead.fn(48, 56, Math.min(1.1, lead.s))}
  `);
}

export function difficultyBadgeSVG(hard: boolean): string {
  const stars = hard
    ? star5(28, 48, 1) + star5(48, 40, 1.2) + star5(68, 48, 1)
    : star5(48, 46, 1.4);
  return badgeWrap(stars);
}

export function toneBadgeSVG(tone: ToneId): string {
  const a = TONE_ACCENT[tone];
  return badgeWrap(`
    <circle cx="36" cy="40" r="22" fill="${a.banner}" stroke="${INK}" stroke-width="3"/>
    <circle cx="62" cy="56" r="16" fill="${a.frame}" stroke="${INK}" stroke-width="3"/>
    ${sparkle(70, 28, 0.9)}
  `);
}

export { flameShape };
