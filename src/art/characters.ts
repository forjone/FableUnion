// 角色插画库：手绘风矢量角色，统一 120×120 画布、厚描边、大眼睛、腮红。
// 每个词库主角映射到一个基础造型（可换配色）；词库外的自定义主角用“星星小生物”。

import { INK, PALETTE as P, face, strokeAttrs as S } from './style';

interface CharColors { body: string; belly: string; accent: string }

type BaseFn = (c: CharColors) => string;

// —— 基础造型（画布 120×120，地面约在 y=112） ——

const dino: BaseFn = (c) => `
  <path d="M 94 78 Q 112 74 110 62 Q 104 68 92 66" fill="${c.body}" ${S}/>
  <path d="M 46 34 L 54 20 L 62 34 M 62 32 L 70 18 L 78 32 M 78 32 L 86 22 L 92 34"
    fill="${c.accent}" ${S}/>
  <ellipse cx="60" cy="72" rx="36" ry="38" fill="${c.body}" ${S}/>
  <ellipse cx="60" cy="86" rx="20" ry="18" fill="${c.belly}" stroke="none"/>
  <path d="M 38 106 q 0 8 8 6 M 74 106 q 0 8 8 6" fill="none" ${S}/>
  ${face(60, 62)}
`;

const cat: BaseFn = (c) => `
  <path d="M 32 44 L 26 18 L 48 32 Z" fill="${c.body}" ${S}/>
  <path d="M 88 44 L 94 18 L 72 32 Z" fill="${c.body}" ${S}/>
  <path d="M 33 38 L 30 25 L 42 32 Z" fill="${c.accent}" stroke="none"/>
  <path d="M 87 38 L 90 25 L 78 32 Z" fill="${c.accent}" stroke="none"/>
  <path d="M 92 92 Q 112 96 108 78" fill="none" ${S}/>
  <ellipse cx="60" cy="72" rx="36" ry="38" fill="${c.body}" ${S}/>
  <ellipse cx="60" cy="88" rx="19" ry="16" fill="${c.belly}" stroke="none"/>
  <path d="M 18 62 L 32 64 M 18 72 L 32 70 M 102 62 L 88 64 M 102 72 L 88 70"
    stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  ${face(60, 62)}
`;

const dog: BaseFn = (c) => `
  <path d="M 30 40 Q 16 44 20 66 Q 30 64 36 52" fill="${c.accent}" ${S}/>
  <path d="M 90 40 Q 104 44 100 66 Q 90 64 84 52" fill="${c.accent}" ${S}/>
  <ellipse cx="60" cy="72" rx="36" ry="38" fill="${c.body}" ${S}/>
  <ellipse cx="60" cy="88" rx="19" ry="16" fill="${c.belly}" stroke="none"/>
  <ellipse cx="60" cy="76" rx="7" ry="5" fill="${INK}"/>
  ${face(60, 60)}
`;

const bunny: BaseFn = (c) => `
  <path d="M 42 40 Q 34 6 50 8 Q 58 10 52 40" fill="${c.body}" ${S}/>
  <path d="M 78 40 Q 86 6 70 8 Q 62 10 68 40" fill="${c.body}" ${S}/>
  <path d="M 45 32 Q 42 14 48 14 Q 52 16 49 32" fill="${c.accent}" stroke="none"/>
  <path d="M 75 32 Q 78 14 72 14 Q 68 16 71 32" fill="${c.accent}" stroke="none"/>
  <ellipse cx="60" cy="74" rx="34" ry="36" fill="${c.body}" ${S}/>
  <ellipse cx="60" cy="90" rx="18" ry="14" fill="${c.belly}" stroke="none"/>
  ${face(60, 64)}
`;

const panda: BaseFn = (c) => `
  <circle cx="34" cy="38" r="12" fill="${INK}" ${S}/>
  <circle cx="86" cy="38" r="12" fill="${INK}" ${S}/>
  <ellipse cx="60" cy="72" rx="36" ry="38" fill="${c.body}" ${S}/>
  <ellipse cx="49" cy="60" rx="9" ry="11" fill="${INK}" transform="rotate(-12 49 60)"/>
  <ellipse cx="71" cy="60" rx="9" ry="11" fill="${INK}" transform="rotate(12 71 60)"/>
  <circle cx="50" cy="61" r="4.6" fill="#fff"/>
  <circle cx="70" cy="61" r="4.6" fill="#fff"/>
  <circle cx="51" cy="62" r="2.4" fill="${INK}"/>
  <circle cx="69" cy="62" r="2.4" fill="${INK}"/>
  <circle cx="40" cy="74" r="3.6" fill="#FFB3C7" opacity="0.85"/>
  <circle cx="80" cy="74" r="3.6" fill="#FFB3C7" opacity="0.85"/>
  <path d="M 55.5 70 Q 60 75 64.5 70" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="92" rx="18" ry="13" fill="${c.belly}" stroke="none"/>
`;

const unicorn: BaseFn = (c) => `
  <path d="M 60 6 L 66 34 L 54 34 Z" fill="${P.sunshine}" ${S}/>
  <path d="M 40 36 Q 24 40 26 58 Q 36 54 42 46" fill="${P.rose}" ${S}/>
  <path d="M 34 48 Q 20 56 26 72 Q 36 66 40 58" fill="${P.lilac}" ${S}/>
  <path d="M 80 36 Q 96 40 94 58 Q 84 54 78 46" fill="${P.mint}" ${S}/>
  <ellipse cx="60" cy="72" rx="35" ry="37" fill="${c.body}" ${S}/>
  <ellipse cx="60" cy="90" rx="18" ry="14" fill="${c.belly}" stroke="none"/>
  ${face(60, 62)}
`;

const robot: BaseFn = (c) => `
  <line x1="60" y1="14" x2="60" y2="30" stroke="${INK}" stroke-width="3"/>
  <circle cx="60" cy="12" r="6" fill="${P.coral}" ${S}/>
  <rect x="24" y="30" width="72" height="76" rx="22" fill="${c.body}" ${S}/>
  <rect x="40" y="80" width="40" height="18" rx="9" fill="${c.belly}" stroke="none"/>
  <circle cx="48" cy="89" r="3.5" fill="${c.accent}"/>
  <circle cx="60" cy="89" r="3.5" fill="${P.sunshine}"/>
  <circle cx="72" cy="89" r="3.5" fill="${P.coral}"/>
  <rect x="12" y="56" width="12" height="24" rx="6" fill="${c.accent}" ${S}/>
  <rect x="96" y="56" width="12" height="24" rx="6" fill="${c.accent}" ${S}/>
  ${face(60, 56)}
`;

const rocket: BaseFn = (c) => `
  <path d="M 60 6 Q 88 34 84 74 L 36 74 Q 32 34 60 6" fill="${c.body}" ${S}/>
  <path d="M 36 60 L 20 84 L 40 78 Z" fill="${c.accent}" ${S}/>
  <path d="M 84 60 L 100 84 L 80 78 Z" fill="${c.accent}" ${S}/>
  <rect x="48" y="74" width="24" height="12" rx="5" fill="${c.accent}" ${S}/>
  <path d="M 50 90 Q 60 112 70 90 Q 65 96 60 94 Q 55 96 50 90" fill="${P.sunshine}" ${S}/>
  <circle cx="60" cy="46" r="17" fill="${c.belly}" ${S}/>
  ${face(60, 44, 0.72)}
`;

const princess: BaseFn = (c) => `
  <path d="M 60 74 L 88 108 L 32 108 Z" fill="${c.accent}" ${S}/>
  <circle cx="60" cy="52" r="28" fill="${c.body}" ${S}/>
  <path d="M 32 52 Q 30 22 60 22 Q 90 22 88 52 Q 82 38 74 36 Q 78 44 74 48 Q 68 34 60 34 Q 52 34 46 48 Q 42 44 46 36 Q 38 38 32 52"
    fill="${c.belly}" ${S}/>
  <path d="M 46 20 L 52 10 L 58 18 L 64 8 L 70 18 L 76 12 L 78 24 L 48 24 Z" fill="${P.sunshine}" ${S}/>
  ${face(60, 56, 0.9)}
`;

const ghost: BaseFn = (c) => `
  <path d="M 28 70 Q 28 24 60 24 Q 92 24 92 70 L 92 100 Q 84 92 76 100 Q 68 108 60 100 Q 52 92 44 100 Q 36 108 28 100 Z"
    fill="${c.body}" ${S}/>
  <ellipse cx="60" cy="82" rx="16" ry="10" fill="${c.belly}" stroke="none"/>
  ${face(60, 58)}
`;

const dragon: BaseFn = (c) => `
  <path d="M 40 22 L 46 8 L 52 22 M 68 22 L 74 8 L 80 22" fill="${P.sunshine}" ${S}/>
  <path d="M 26 58 Q 6 50 10 34 Q 24 38 32 48" fill="${c.accent}" ${S}/>
  <path d="M 94 58 Q 114 50 110 34 Q 96 38 88 48" fill="${c.accent}" ${S}/>
  <ellipse cx="60" cy="70" rx="35" ry="37" fill="${c.body}" ${S}/>
  <path d="M 46 88 h 28 M 50 96 h 20" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
  <ellipse cx="60" cy="90" rx="17" ry="13" fill="${c.belly}" stroke="none"/>
  ${face(60, 60)}
`;

const monster: BaseFn = (c) => `
  <path d="M 38 28 Q 30 8 46 12 M 82 28 Q 90 8 74 12" fill="none" ${S}/>
  <circle cx="46" cy="10" r="5" fill="${P.sunshine}" ${S}/>
  <circle cx="74" cy="10" r="5" fill="${P.sunshine}" ${S}/>
  <ellipse cx="60" cy="70" rx="36" ry="40" fill="${c.body}" ${S}/>
  <circle cx="60" cy="56" r="13" fill="#fff" stroke="${INK}" stroke-width="2.6"/>
  <circle cx="62" cy="58" r="6" fill="${INK}"/>
  <circle cx="64.5" cy="55" r="2" fill="#fff"/>
  <circle cx="38" cy="72" r="4" fill="#FFB3C7" opacity="0.85"/>
  <circle cx="82" cy="72" r="4" fill="#FFB3C7" opacity="0.85"/>
  <path d="M 52 78 Q 60 86 68 78" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="96" rx="16" ry="10" fill="${c.belly}" stroke="none"/>
`;

const fish: BaseFn = (c) => `
  <path d="M 96 60 L 116 42 L 112 60 L 116 78 Z" fill="${c.accent}" ${S}/>
  <path d="M 52 30 Q 62 16 72 30 Z" fill="${c.accent}" ${S}/>
  <ellipse cx="58" cy="62" rx="42" ry="32" fill="${c.body}" ${S}/>
  <path d="M 30 84 Q 42 92 54 86" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="50" cy="74" rx="16" ry="10" fill="${c.belly}" stroke="none"/>
  ${face(48, 56, 0.9)}
`;

const bird: BaseFn = (c) => `
  <path d="M 54 16 Q 60 4 66 16" fill="none" ${S}/>
  <ellipse cx="60" cy="68" rx="34" ry="36" fill="${c.body}" ${S}/>
  <path d="M 26 66 Q 12 74 20 88 Q 30 84 34 76" fill="${c.accent}" ${S}/>
  <path d="M 94 66 Q 108 74 100 88 Q 90 84 86 76" fill="${c.accent}" ${S}/>
  <path d="M 54 68 L 66 68 L 60 78 Z" fill="${P.peach}" ${S}/>
  <ellipse cx="60" cy="92" rx="16" ry="10" fill="${c.belly}" stroke="none"/>
  <path d="M 50 104 v 8 M 70 104 v 8" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  ${face(60, 56, 0.9)}
`;

const frog: BaseFn = (c) => `
  <circle cx="40" cy="30" r="13" fill="${c.body}" ${S}/>
  <circle cx="80" cy="30" r="13" fill="${c.body}" ${S}/>
  <circle cx="40" cy="30" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/>
  <circle cx="80" cy="30" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/>
  <circle cx="41" cy="31" r="3" fill="${INK}"/>
  <circle cx="79" cy="31" r="3" fill="${INK}"/>
  <ellipse cx="60" cy="72" rx="37" ry="34" fill="${c.body}" ${S}/>
  <circle cx="40" cy="70" r="4" fill="#FFB3C7" opacity="0.85"/>
  <circle cx="80" cy="70" r="4" fill="#FFB3C7" opacity="0.85"/>
  <path d="M 48 72 Q 60 82 72 72" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="92" rx="18" ry="11" fill="${c.belly}" stroke="none"/>
`;

const car: BaseFn = (c) => `
  <path d="M 16 84 Q 16 66 32 64 L 40 46 Q 42 40 50 40 L 78 40 Q 84 40 88 46 L 96 64 Q 108 66 106 84 Z"
    fill="${c.body}" ${S}/>
  <path d="M 48 46 L 74 46 Q 78 46 80 50 L 85 60 L 46 60 Q 44 52 48 46" fill="${c.belly}" ${S}/>
  <circle cx="38" cy="88" r="12" fill="${INK}"/>
  <circle cx="38" cy="88" r="5" fill="${P.cloud}"/>
  <circle cx="86" cy="88" r="12" fill="${INK}"/>
  <circle cx="86" cy="88" r="5" fill="${P.cloud}"/>
  <circle cx="103" cy="74" r="4" fill="${P.sunshine}" stroke="${INK}" stroke-width="2"/>
  ${face(63, 53, 0.62)}
`;

const star: BaseFn = (c) => `
  <path d="M 60 8 L 74 42 L 110 46 L 84 70 L 92 106 L 60 86 L 28 106 L 36 70 L 10 46 L 46 42 Z"
    fill="${c.body}" ${S}/>
  ${face(60, 60, 0.95)}
`;

const BASES = {
  dino, cat, dog, bunny, panda, unicorn, robot, rocket,
  princess, ghost, dragon, monster, fish, bird, frog, car, star,
} as const;

type BaseId = keyof typeof BASES;

const DEFAULT_COLORS: Record<BaseId, CharColors> = {
  dino: { body: P.leaf, belly: '#DFF3C9', accent: P.teal },
  cat: { body: '#FFAB5E', belly: '#FFE3C2', accent: '#FFD9A8' },
  dog: { body: '#C89B7B', belly: '#EEDAC6', accent: '#A97C5B' },
  bunny: { body: '#FDEDF3', belly: '#FFFFFF', accent: P.rose },
  panda: { body: '#FDFDFB', belly: '#EFEDE8', accent: '#EFEDE8' },
  unicorn: { body: '#FFF7FB', belly: '#FDE9F3', accent: P.rose },
  robot: { body: '#8FB3E6', belly: '#DCE9FB', accent: '#6E92C7' },
  rocket: { body: P.coral, belly: '#FFE9E2', accent: P.sunshine },
  princess: { body: '#FFDDC4', belly: '#8A5A3B', accent: P.rose },
  ghost: { body: P.cloud, belly: '#FFFFFF', accent: '#DBD4F5' },
  dragon: { body: '#58C8C0', belly: '#CFF3EF', accent: '#9BE8DF' },
  monster: { body: '#B48CF2', belly: '#E4D6FB', accent: '#8E63D6' },
  fish: { body: '#6FC3F7', belly: '#D3EDFE', accent: '#4BA3DE' },
  bird: { body: '#FFD455', belly: '#FFF0C2', accent: '#F0B93B' },
  frog: { body: '#8CD467', belly: '#DFF3C9', accent: '#6DB94C' },
  car: { body: '#FF6B8A', belly: '#CDEFFB', accent: '#E14E70' },
  star: { body: P.sunshine, belly: '#FFF0C2', accent: P.butter },
};

/** 词库主角 → 基础造型（可换色）。没画到的主角统一用星星小生物（保持风格一致）。 */
const SUBJECT_CHARS: Record<string, { base: BaseId; colors?: Partial<CharColors> }> = {
  dino: { base: 'dino' },
  cat: { base: 'cat' },
  tiger: { base: 'cat', colors: { body: '#FF9A3D', accent: '#FFC894', belly: '#FFE3C2' } },
  dog: { base: 'dog' },
  bunny: { base: 'bunny' },
  panda: { base: 'panda' },
  unicorn: { base: 'unicorn' },
  robot: { base: 'robot' },
  astronaut: { base: 'robot', colors: { body: '#E8ECF5', belly: '#FFFFFF', accent: '#C2CBE0' } },
  rocket: { base: 'rocket' },
  plane: { base: 'rocket', colors: { body: '#7FD3F7', accent: '#FF7E6B', belly: '#EAF7FE' } },
  princess: { base: 'princess' },
  mermaid: { base: 'princess', colors: { accent: '#2EC4B6' } },
  ghost: { base: 'ghost' },
  dragon: { base: 'dragon' },
  monster: { base: 'monster' },
  fish: { base: 'fish' },
  shark: { base: 'fish', colors: { body: '#9FB6C6', belly: '#E3ECF2', accent: '#7E97A8' } },
  bird: { base: 'bird' },
  frog: { base: 'frog' },
  racecar: { base: 'car' },
  hero: { base: 'star', colors: { body: '#FF7E6B', belly: '#FFE9E2', accent: '#FFB088' } },
  wizard: { base: 'star', colors: { body: '#A78BFA', belly: '#E4D6FB', accent: '#C9B8F5' } },
};

// —— 配饰系统（角色装扮）：叠加在角色头部/身侧的可爱小物件 ——

export type AccessoryId = 'crown' | 'cap' | 'glasses' | 'bow' | 'wings';

export const ACCESSORIES: { id: AccessoryId; label: string }[] = [
  { id: 'crown', label: '小皇冠' },
  { id: 'cap', label: '棒球帽' },
  { id: 'glasses', label: '酷眼镜' },
  { id: 'bow', label: '蝴蝶结' },
  { id: 'wings', label: '小翅膀' },
];

function accessoryMarkup(id: AccessoryId): string {
  switch (id) {
    case 'crown':
      return `<path d="M 42 30 L 46 12 L 54 24 L 60 8 L 66 24 L 74 12 L 78 30 Q 60 36 42 30"
        fill="${P.sunshine}" ${S}/>
        <circle cx="60" cy="8" r="3" fill="${P.coral}" stroke="${INK}" stroke-width="2"/>`;
    case 'cap':
      return `<path d="M 38 30 Q 38 8 60 8 Q 82 8 82 30 Q 60 36 38 30" fill="${P.sky}" ${S}/>
        <path d="M 78 26 Q 100 24 102 32 Q 92 38 76 34" fill="${P.sky}" ${S}/>
        <circle cx="60" cy="8" r="4" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    case 'glasses':
      return `<circle cx="44" cy="55" r="13" fill="rgba(127,211,247,0.35)" stroke="${INK}" stroke-width="3.5"/>
        <circle cx="76" cy="55" r="13" fill="rgba(127,211,247,0.35)" stroke="${INK}" stroke-width="3.5"/>
        <path d="M 57 55 Q 60 51 63 55" stroke="${INK}" stroke-width="3.5" fill="none"/>`;
    case 'bow':
      return `<g transform="translate(85 16) rotate(18)">
        <path d="M 0 0 L -16 -9 Q -20 0 -16 9 Z" fill="${P.rose}" ${S}/>
        <path d="M 0 0 L 16 -9 Q 20 0 16 9 Z" fill="${P.rose}" ${S}/>
        <circle r="4.5" fill="${P.coral}" stroke="${INK}" stroke-width="2"/>
      </g>`;
    case 'wings':
      return `<path d="M 16 62 Q -6 44 4 26 Q 20 32 24 50 Q 26 58 16 62" fill="#fff" ${S} opacity="0.95"/>
        <path d="M 104 62 Q 126 44 116 26 Q 100 32 96 50 Q 94 58 104 62" fill="#fff" ${S} opacity="0.95"/>`;
  }
}

/** 角色的 SVG 内部标记（120×120 坐标系），可叠加配饰 */
export function characterMarkup(subjectId: string | undefined, accessory?: AccessoryId | null): string {
  const key = subjectId?.startsWith('custom:') ? undefined : subjectId;
  const spec = (key && SUBJECT_CHARS[key]) || { base: 'star' as BaseId };
  const colors = { ...DEFAULT_COLORS[spec.base], ...spec.colors };
  const body = BASES[spec.base](colors);
  return accessory ? body + accessoryMarkup(accessory) : body;
}

/** 完整 SVG 字符串（可直接注入 DOM 或栅格化给 Canvas 用） */
export function characterSVG(subjectId: string | undefined, size = 120, accessory?: AccessoryId | null): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}">${characterMarkup(subjectId, accessory)}</svg>`;
}
