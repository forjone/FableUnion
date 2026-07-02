// 可视化草图生成（PRD 3.4 / 3.5）。
// 程序化 SVG：毫秒级出图，最大化“从说出来到看见它”的速度感（设计北极星准则 2）。
// draft = 低保真蜡笔风草稿（隐式确认用）；final = 更完整的终稿效果图（显式确认用）。

import { mechanicMeta } from './lexicon';
import type { SlotProfile, ToneId } from './types';

export interface SceneTheme {
  sky: [string, string];
  ground: string;
  props: { emoji: string; x: number; y: number; size: number }[];
  celestial?: { emoji: string; x: number; y: number; size: number };
}

const W = 480;
const H = 320;
const GROUND_Y = 240;

export const SCENE_THEMES: Record<string, SceneTheme> = {
  forest: {
    sky: ['#c7f0d8', '#eafff0'], ground: '#7ccf8f',
    props: [
      { emoji: '🌲', x: 60, y: GROUND_Y, size: 56 }, { emoji: '🌳', x: 420, y: GROUND_Y, size: 52 },
      { emoji: '🍄', x: 150, y: GROUND_Y + 30, size: 26 },
    ],
    celestial: { emoji: '☀️', x: 420, y: 60, size: 40 },
  },
  space: {
    sky: ['#1e1b4b', '#4c1d95'], ground: '#6d28d9',
    props: [
      { emoji: '⭐', x: 80, y: 70, size: 22 }, { emoji: '✨', x: 300, y: 50, size: 20 },
      { emoji: '🪐', x: 400, y: 90, size: 40 }, { emoji: '⭐', x: 200, y: 110, size: 16 },
    ],
    celestial: { emoji: '🌍', x: 60, y: 150, size: 34 },
  },
  school: {
    sky: ['#bfdbfe', '#e0f2fe'], ground: '#fbbf77',
    props: [{ emoji: '🏫', x: 90, y: GROUND_Y - 4, size: 64 }, { emoji: '🎒', x: 400, y: GROUND_Y + 26, size: 30 }],
    celestial: { emoji: '☀️', x: 420, y: 60, size: 40 },
  },
  sea: {
    sky: ['#7dd3fc', '#0ea5e9'], ground: '#0369a1',
    props: [
      { emoji: '🐚', x: 100, y: GROUND_Y + 40, size: 26 }, { emoji: '🪸', x: 400, y: GROUND_Y + 30, size: 36 },
      { emoji: '🫧', x: 320, y: 100, size: 24 }, { emoji: '🐠', x: 150, y: 140, size: 26 },
    ],
  },
  castle: {
    sky: ['#e9d5ff', '#fdf2f8'], ground: '#c084fc',
    props: [{ emoji: '🏰', x: 100, y: GROUND_Y - 6, size: 70 }, { emoji: '🚩', x: 400, y: GROUND_Y + 10, size: 26 }],
    celestial: { emoji: '🌈', x: 380, y: 70, size: 46 },
  },
  meadow: {
    sky: ['#bae6fd', '#e0f2fe'], ground: '#86efac',
    props: [
      { emoji: '🌼', x: 90, y: GROUND_Y + 40, size: 24 }, { emoji: '🌷', x: 420, y: GROUND_Y + 36, size: 26 },
      { emoji: '☁️', x: 120, y: 60, size: 34 },
    ],
    celestial: { emoji: '☀️', x: 420, y: 56, size: 42 },
  },
  desert: {
    sky: ['#fed7aa', '#ffedd5'], ground: '#fbbf24',
    props: [{ emoji: '🌵', x: 90, y: GROUND_Y + 6, size: 44 }, { emoji: '🐪', x: 410, y: GROUND_Y + 16, size: 36 }],
    celestial: { emoji: '☀️', x: 400, y: 60, size: 44 },
  },
  snow: {
    sky: ['#dbeafe', '#f0f9ff'], ground: '#e2e8f0',
    props: [{ emoji: '⛄', x: 100, y: GROUND_Y + 8, size: 44 }, { emoji: '🎿', x: 410, y: GROUND_Y + 26, size: 28 }, { emoji: '❄️', x: 300, y: 80, size: 22 }],
  },
  city: {
    sky: ['#bfdbfe', '#dbeafe'], ground: '#94a3b8',
    props: [{ emoji: '🏙️', x: 110, y: GROUND_Y - 10, size: 64 }, { emoji: '🚦', x: 410, y: GROUND_Y + 12, size: 30 }],
    celestial: { emoji: '☀️', x: 420, y: 56, size: 38 },
  },
  volcano: {
    sky: ['#fecaca', '#fed7aa'], ground: '#a8552f',
    props: [{ emoji: '🌋', x: 110, y: GROUND_Y - 8, size: 64 }, { emoji: '🪨', x: 400, y: GROUND_Y + 26, size: 26 }],
  },
  sky: {
    sky: ['#93c5fd', '#e0f2fe'], ground: '#f1f5f9',
    props: [{ emoji: '☁️', x: 90, y: 100, size: 40 }, { emoji: '☁️', x: 380, y: 70, size: 34 }, { emoji: '🎈', x: 300, y: 120, size: 26 }],
    celestial: { emoji: '☀️', x: 430, y: 50, size: 40 },
  },
  candy: {
    sky: ['#fbcfe8', '#fdf2f8'], ground: '#f9a8d4',
    props: [{ emoji: '🍭', x: 90, y: GROUND_Y + 4, size: 42 }, { emoji: '🧁', x: 410, y: GROUND_Y + 20, size: 34 }, { emoji: '🍬', x: 300, y: 100, size: 24 }],
  },
  garden: {
    sky: ['#d9f99d', '#f7fee7'], ground: '#86efac',
    props: [{ emoji: '🌸', x: 90, y: GROUND_Y + 30, size: 30 }, { emoji: '🌻', x: 410, y: GROUND_Y + 24, size: 34 }, { emoji: '🐝', x: 300, y: 110, size: 22 }],
    celestial: { emoji: '☀️', x: 420, y: 56, size: 40 },
  },
  moon: {
    sky: ['#312e81', '#1e1b4b'], ground: '#cbd5e1',
    props: [{ emoji: '⭐', x: 100, y: 70, size: 20 }, { emoji: '🌍', x: 400, y: 80, size: 36 }, { emoji: '🕳️', x: 150, y: GROUND_Y + 40, size: 26 }],
  },
  rainbow: {
    sky: ['#cffafe', '#fdf2f8'], ground: '#a5f3fc',
    props: [{ emoji: '🌈', x: 240, y: 90, size: 90 }, { emoji: '☁️', x: 90, y: 120, size: 32 }, { emoji: '☁️', x: 390, y: 120, size: 32 }],
  },
};

const TONE_ACCENT: Record<ToneId, { frame: string; banner: string }> = {
  cute: { frame: '#f9a8d4', banner: '#ec4899' },
  cool: { frame: '#67e8f9', banner: '#0891b2' },
  mystery: { frame: '#c4b5fd', banner: '#7c3aed' },
  funny: { frame: '#fde047', banner: '#f59e0b' },
  lively: { frame: '#86efac', banner: '#16a34a' },
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function emojiText(emoji: string, x: number, y: number, size: number, extra = ''): string {
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="middle" ${extra}>${esc(emoji)}</text>`;
}

/** 自定义主角（词库外的词）画成一个带名字的星星小生物 */
function customHero(x: number, y: number, size: number, label: string): string {
  const r = size * 0.55;
  return `
    <g>
      <circle cx="${x}" cy="${y}" r="${r}" fill="#fef3c7" stroke="#f59e0b" stroke-width="4"/>
      ${emojiText('✨', x, y - r * 0.9, size * 0.5)}
      <circle cx="${x - r * 0.3}" cy="${y - r * 0.15}" r="${r * 0.09}" fill="#78350f"/>
      <circle cx="${x + r * 0.3}" cy="${y - r * 0.15}" r="${r * 0.09}" fill="#78350f"/>
      <path d="M ${x - r * 0.25} ${y + r * 0.25} Q ${x} ${y + r * 0.5} ${x + r * 0.25} ${y + r * 0.25}" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text x="${x}" y="${y + r + 18}" font-size="16" text-anchor="middle" fill="#92400e" font-weight="bold">${esc(label)}</text>
    </g>`;
}

function detailFx(profile: SlotProfile, hx: number, hy: number, hsize: number): string {
  const d = profile.key_detail;
  if (!d) return '';
  switch (d.effect) {
    case 'fire':
      // 🦖 这类 emoji 朝左，火要喷在嘴前
      return emojiText('🔥', hx - hsize * 0.72, hy - hsize * 0.1, hsize * 0.5) +
        emojiText('🔥', hx - hsize * 0.95, hy + hsize * 0.05, hsize * 0.34);
    case 'fly':
      return emojiText('🪽', hx - hsize * 0.6, hy - hsize * 0.4, hsize * 0.5) +
        emojiText('☁️', hx, hy + hsize * 0.7, hsize * 0.4);
    case 'glow':
      return `<circle cx="${hx}" cy="${hy}" r="${hsize * 0.85}" fill="#fef08a" opacity="0.45"/>`;
    case 'rainbow':
      return emojiText('🌈', hx - hsize * 0.9, hy + hsize * 0.1, hsize * 0.6);
    case 'speed':
      return `<g stroke="#38bdf8" stroke-width="5" stroke-linecap="round" opacity="0.8">
        <line x1="${hx - hsize * 1.2}" y1="${hy - 12}" x2="${hx - hsize * 0.7}" y2="${hy - 12}"/>
        <line x1="${hx - hsize * 1.35}" y1="${hy + 6}" x2="${hx - hsize * 0.75}" y2="${hy + 6}"/>
        <line x1="${hx - hsize * 1.15}" y1="${hy + 24}" x2="${hx - hsize * 0.7}" y2="${hy + 24}"/>
      </g>`;
    case 'sparkle':
      return emojiText('✨', hx - hsize * 0.7, hy - hsize * 0.5, hsize * 0.4) +
        emojiText('✨', hx + hsize * 0.7, hy - hsize * 0.35, hsize * 0.32);
    default:
      return '';
  }
}

/** 与游戏运行时保持一致的场景化障碍物（草图是承诺，成品要兑现） */
export function obstacleFor(sceneId: string | undefined): string {
  return (
    ({ sea: '🪸', volcano: '🪨', snow: '⛄', candy: '🍭', space: '🪨', city: '🚧' } as Record<string, string>)[
      sceneId ?? ''
    ] ?? '🌵'
  );
}

function mechanicLayer(profile: SlotProfile, final: boolean): string {
  const m = profile.mechanic;
  const parts: string[] = [];
  const obs = obstacleFor(profile.scene?.id);
  if (m === 'race') {
    parts.push(`<line x1="20" y1="${GROUND_Y + 42}" x2="${W - 20}" y2="${GROUND_Y + 42}" stroke="#fff" stroke-width="4" stroke-dasharray="18 12" opacity="0.9"/>`);
    parts.push(emojiText('🏁', W - 50, GROUND_Y - 4, 42));
    if (final) parts.push(emojiText('🏆', W - 50, GROUND_Y - 52, 30));
  } else if (m === 'collect') {
    const xs = [150, 230, 310, 390];
    xs.forEach((x, i) => parts.push(emojiText('⭐', x, 130 + (i % 2) * 42, 30)));
    if (final) parts.push(emojiText('🧺', W - 60, GROUND_Y + 30, 34));
  } else if (m === 'dodge') {
    parts.push(emojiText(obs, 240, 100, 32));
    parts.push(emojiText(obs, 340, 70, 26));
    parts.push(`<g stroke="#f87171" stroke-width="4" stroke-linecap="round" opacity="0.8">
      <line x1="240" y1="122" x2="240" y2="152"/><path d="M 232 144 L 240 156 L 248 144" fill="none"/>
    </g>`);
  } else if (m === 'jump') {
    parts.push(emojiText(obs, 250, GROUND_Y + 8, 36));
    parts.push(emojiText(obs, 360, GROUND_Y + 8, 36));
    parts.push(`<path d="M 140 ${GROUND_Y - 30} Q 200 ${GROUND_Y - 110} 258 ${GROUND_Y - 36}" stroke="#94a3b8" stroke-width="4" stroke-dasharray="8 8" fill="none"/>`);
  } else if (m === 'pop') {
    const spots: [number, number, number][] = [[220, 110, 34], [320, 150, 28], [390, 90, 30], [260, 190, 24]];
    spots.forEach(([x, y, s]) => parts.push(emojiText('🫧', x, y, s)));
    if (final) parts.push(emojiText('👆', 320, 190, 30));
  }
  return parts.join('');
}

export interface SketchOptions {
  quality: 'draft' | 'final';
  /** 唯一 id 前缀，避免并排两张图的 SVG filter id 冲突 */
  uid: string;
  title?: string;
}

/** 由槽位生成一张草图/终稿 SVG（字符串，直接注入 DOM） */
export function sketchSVG(profile: SlotProfile, opts: SketchOptions): string {
  const theme = SCENE_THEMES[profile.scene?.id ?? 'meadow'] ?? SCENE_THEMES.meadow;
  const tone = TONE_ACCENT[profile.tone ?? 'lively'];
  const final = opts.quality === 'final';
  const uid = opts.uid;

  const hx = 120;
  const hy = GROUND_Y - 26;
  const hsize = final ? 78 : 68;

  const hero = profile.subject?.custom
    ? customHero(hx, hy, hsize, profile.subject.label)
    : emojiText(profile.subject?.emoji ?? '✨', hx, hy, hsize);

  const companion = profile.companion
    ? emojiText(profile.companion.emoji, hx + 92, hy + 14, hsize * 0.62)
    : '';

  const props = theme.props
    .map((p) => emojiText(p.emoji, p.x, p.y, final ? p.size : p.size * 0.9))
    .join('');
  const celestial = theme.celestial
    ? emojiText(theme.celestial.emoji, theme.celestial.x, theme.celestial.y, theme.celestial.size)
    : '';

  const roughFilter = final
    ? ''
    : `<filter id="${uid}-rough"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter>`;
  const groupFilter = final ? '' : `filter="url(#${uid}-rough)"`;

  const banner = final && opts.title
    ? `<g>
        <rect x="${W / 2 - 150}" y="14" width="300" height="44" rx="22" fill="${tone.banner}" opacity="0.92"/>
        <text x="${W / 2}" y="42" font-size="21" text-anchor="middle" fill="#fff" font-weight="bold">${esc(opts.title)}</text>
      </g>`
    : '';

  const frame = final
    ? `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="20" fill="none" stroke="${tone.frame}" stroke-width="8"/>`
    : `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="16" fill="none" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="12 10"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">
    <defs>
      <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${theme.sky[0]}"/><stop offset="1" stop-color="${theme.sky[1]}"/>
      </linearGradient>
      ${roughFilter}
    </defs>
    <rect width="${W}" height="${H}" fill="#fffdf5"/>
    <g ${groupFilter}>
      <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="14" fill="url(#${uid}-sky)"/>
      <rect x="8" y="${GROUND_Y}" width="${W - 16}" height="${H - GROUND_Y - 8}" rx="10" fill="${theme.ground}"/>
      ${celestial}${props}
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

/** 作品名：喷火恐龙大赛跑 */
export function workTitle(profile: SlotProfile): string {
  const detail = profile.key_detail ? profile.key_detail.label.replace(/^会/, '') : '';
  const subject = profile.subject?.label ?? '奇想';
  const noun = profile.mechanic ? mechanicMeta(profile.mechanic).titleNoun : '大冒险';
  return `${detail}${subject}${noun}`;
}
