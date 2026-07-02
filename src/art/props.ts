// 场景道具插画库：与角色同风格的矢量小元素。
// 每个道具是 (x, y, s) => svg 字符串，(x, y) 为道具的视觉锚点（多数为中心）。

import { INK, PALETTE as P, strokeAttrs as S } from './style';

export type PropFn = (x: number, y: number, s: number) => string;

const g = (x: number, y: number, s: number, inner: string) =>
  `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;

// 以 (0,0) 为中心、约 40×40 的基准尺寸绘制，s=1 时约 40px 宽

export const sun: PropFn = (x, y, s) => g(x, y, s, `
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
    `<line x1="0" y1="-24" x2="0" y2="-30" transform="rotate(${a})" stroke="${P.sunshine}" stroke-width="5" stroke-linecap="round"/>`).join('')}
  <circle r="17" fill="${P.sunshine}" ${S}/>
  <circle cx="-6" cy="-2" r="2.2" fill="${INK}"/>
  <circle cx="6" cy="-2" r="2.2" fill="${INK}"/>
  <path d="M -4 4 Q 0 8 4 4" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
`);

export const cloud: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -22 8 Q -30 8 -28 -2 Q -26 -10 -16 -8 Q -14 -18 -2 -16 Q 8 -15 8 -6 Q 18 -8 19 2 Q 20 8 12 8 Z"
    fill="#fff" ${S}/>
`);

export const treeRound: PropFn = (x, y, s) => g(x, y, s, `
  <rect x="-4" y="4" width="8" height="18" rx="3" fill="${P.cocoa}" ${S}/>
  <circle cx="0" cy="-8" r="19" fill="${P.leaf}" ${S}/>
  <circle cx="-9" cy="-13" r="6" fill="#A5DB90" stroke="none"/>
  <circle cx="7" cy="-3" r="4" fill="#A5DB90" stroke="none"/>
`);

export const pine: PropFn = (x, y, s) => g(x, y, s, `
  <rect x="-3.5" y="12" width="7" height="10" rx="2.5" fill="${P.cocoa}" ${S}/>
  <path d="M 0 -26 L 14 -4 L -14 -4 Z" fill="#4FA85A" ${S}/>
  <path d="M 0 -12 L 17 12 L -17 12 Z" fill="${P.leaf}" ${S}/>
`);

export const flower: PropFn = (x, y, s) => g(x, y, s, `
  <line x1="0" y1="4" x2="0" y2="18" stroke="#4FA85A" stroke-width="3" stroke-linecap="round"/>
  ${[0, 72, 144, 216, 288].map((a) =>
    `<ellipse cx="0" cy="-7" rx="4.5" ry="7" transform="rotate(${a})" fill="${P.rose}" stroke="${INK}" stroke-width="2"/>`).join('')}
  <circle r="4.5" fill="${P.sunshine}" stroke="${INK}" stroke-width="2"/>
`);

export const mushroom: PropFn = (x, y, s) => g(x, y, s, `
  <rect x="-5" y="0" width="10" height="12" rx="4" fill="#FFF4E4" ${S}/>
  <path d="M -14 2 Q -14 -14 0 -14 Q 14 -14 14 2 Z" fill="${P.coral}" ${S}/>
  <circle cx="-6" cy="-6" r="2.5" fill="#fff"/>
  <circle cx="5" cy="-4" r="2" fill="#fff"/>
`);

export const star5: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M 0 -16 L 4.5 -5 L 16 -4 L 7 4 L 10 15 L 0 9 L -10 15 L -7 4 L -16 -4 L -4.5 -5 Z"
    fill="${P.sunshine}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
`);

export const sparkle: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M 0 -10 Q 2 -2 10 0 Q 2 2 0 10 Q -2 2 -10 0 Q -2 -2 0 -10" fill="${P.butter}" stroke="${INK}" stroke-width="1.6"/>
`);

export const rock: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -16 10 Q -18 -6 -4 -10 Q 12 -14 16 0 Q 18 10 8 12 Q -8 15 -16 10" fill="${P.stone}" ${S}/>
  <path d="M -6 -2 Q 0 -6 6 -2" stroke="#8E99A6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
`);

export const cactus: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -14 -4 Q -20 -6 -18 -14 Q -12 -13 -11 -7 L -10 0" fill="${P.leaf}" ${S}/>
  <rect x="-8" y="-22" width="16" height="40" rx="8" fill="${P.leaf}" ${S}/>
  <path d="M -3 -14 v 6 M 3 -6 v 6" stroke="#4FA85A" stroke-width="2.4" stroke-linecap="round"/>
`);

export const candy: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -12 -6 L -22 -12 L -20 0 L -22 10 L -12 5 Z" fill="${P.rose}" ${S}/>
  <path d="M 12 -6 L 22 -12 L 20 0 L 22 10 L 12 5 Z" fill="${P.rose}" ${S}/>
  <circle r="12" fill="#FFD9E8" ${S}/>
  <path d="M -8 -6 Q 0 -2 8 -6 M -8 6 Q 0 2 8 6" stroke="${P.rose}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
`);

export const lollipop: PropFn = (x, y, s) => g(x, y, s, `
  <line x1="0" y1="12" x2="0" y2="30" stroke="${P.cocoa}" stroke-width="4" stroke-linecap="round"/>
  <circle r="14" fill="${P.rose}" ${S}/>
  <path d="M 0 0 m -9 0 a 9 9 0 0 1 9 -9 a 6 6 0 0 1 6 6 a 4 4 0 0 1 -4 4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
`);

export const cupcake: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -13 2 L -10 18 L 10 18 L 13 2 Z" fill="${P.butter}" ${S}/>
  <path d="M -6 4 v 10 M 0 4 v 12 M 6 4 v 10" stroke="#E8B84B" stroke-width="2" stroke-linecap="round"/>
  <path d="M -14 2 Q -16 -12 -6 -10 Q -4 -18 4 -14 Q 12 -16 12 -8 Q 18 -6 14 2 Z" fill="${P.rose}" ${S}/>
  <circle cx="0" cy="-14" r="3.5" fill="${P.coral}" stroke="${INK}" stroke-width="2"/>
`);

export const planet: PropFn = (x, y, s) => g(x, y, s, `
  <circle r="15" fill="${P.peach}" ${S}/>
  <circle cx="-5" cy="-4" r="3.5" fill="#E8946A" stroke="none"/>
  <circle cx="6" cy="5" r="2.5" fill="#E8946A" stroke="none"/>
  <ellipse rx="24" ry="7" fill="none" stroke="${P.lavender}" stroke-width="3.5" transform="rotate(-16)"/>
`);

export const moonProp: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M 6 -16 A 17 17 0 1 0 6 16 A 13 13 0 1 1 6 -16" fill="${P.butter}" ${S}/>
`);

export const snowman: PropFn = (x, y, s) => g(x, y, s, `
  <circle cx="0" cy="8" r="14" fill="#fff" ${S}/>
  <circle cx="0" cy="-12" r="10" fill="#fff" ${S}/>
  <circle cx="-3.5" cy="-14" r="1.8" fill="${INK}"/>
  <circle cx="3.5" cy="-14" r="1.8" fill="${INK}"/>
  <path d="M 0 -11 L 6 -9 L 0 -7 Z" fill="${P.peach}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M -9 -4 L 9 -4" stroke="${P.coral}" stroke-width="4" stroke-linecap="round"/>
`);

export const snowflake: PropFn = (x, y, s) => g(x, y, s, `
  ${[0, 60, 120].map((a) =>
    `<path d="M 0 -12 L 0 12 M -3 -8 L 0 -12 L 3 -8 M -3 8 L 0 12 L 3 8" transform="rotate(${a})" stroke="#9FD5F5" stroke-width="2.6" fill="none" stroke-linecap="round"/>`).join('')}
`);

export const coral: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M 0 16 L 0 -6 M 0 2 Q -10 0 -12 -12 M 0 -2 Q 10 -4 12 -16 M 0 -6 Q -2 -14 4 -20"
    stroke="${P.rose}" stroke-width="5" fill="none" stroke-linecap="round"/>
`);

export const shell: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -12 6 Q -14 -10 0 -12 Q 14 -10 12 6 Q 0 12 -12 6" fill="#FFD9E8" ${S}/>
  <path d="M 0 -11 L 0 8 M -7 -9 L -4 7 M 7 -9 L 4 7" stroke="${P.rose}" stroke-width="2" stroke-linecap="round"/>
`);

export const waves: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -24 0 Q -18 -8 -12 0 Q -6 8 0 0 Q 6 -8 12 0 Q 18 8 24 0"
    stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.8"/>
`);

export const bubble: PropFn = (x, y, s) => g(x, y, s, `
  <circle r="12" fill="rgba(255,255,255,0.35)" stroke="#fff" stroke-width="2.5"/>
  <path d="M -6 -4 Q -3 -8 2 -7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
`);

export const castleTower: PropFn = (x, y, s) => g(x, y, s, `
  <rect x="-14" y="-18" width="28" height="40" rx="4" fill="${P.cloud}" ${S}/>
  <path d="M -14 -18 L -14 -26 L -8 -26 L -8 -20 L -3 -20 L -3 -26 L 3 -26 L 3 -20 L 8 -20 L 8 -26 L 14 -26 L 14 -18 Z"
    fill="${P.lilac}" ${S}/>
  <path d="M -5 22 L -5 6 Q -5 0 0 0 Q 5 0 5 6 L 5 22" fill="${P.lavender}" ${S}/>
  <line x1="0" y1="-26" x2="0" y2="-38" stroke="${INK}" stroke-width="2.5"/>
  <path d="M 0 -38 L 12 -34 L 0 -30 Z" fill="${P.coral}" stroke="${INK}" stroke-width="2"/>
`);

export const building: PropFn = (x, y, s) => g(x, y, s, `
  <rect x="-14" y="-30" width="28" height="52" rx="5" fill="#B8CDEB" ${S}/>
  ${[-20, -8, 4].map((yy) =>
    `<rect x="-8" y="${yy}" width="6" height="7" rx="2" fill="${P.butter}" stroke="${INK}" stroke-width="1.6"/>
     <rect x="2" y="${yy}" width="6" height="7" rx="2" fill="${P.butter}" stroke="${INK}" stroke-width="1.6"/>`).join('')}
`);

export const schoolhouse: PropFn = (x, y, s) => g(x, y, s, `
  <rect x="-20" y="-8" width="40" height="30" rx="4" fill="${P.butter}" ${S}/>
  <path d="M -24 -8 L 0 -26 L 24 -8 Z" fill="${P.coral}" ${S}/>
  <circle cx="0" cy="-12" r="4" fill="#fff" stroke="${INK}" stroke-width="2"/>
  <path d="M -6 22 L -6 8 Q -6 3 0 3 Q 6 3 6 8 L 6 22" fill="${P.cocoa}" ${S}/>
`);

export const volcanoMt: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -26 22 L -8 -18 L 8 -18 L 26 22 Z" fill="#A8664A" ${S}/>
  <path d="M -8 -18 Q 0 -12 8 -18 Q 6 -24 0 -24 Q -6 -24 -8 -18" fill="${P.coral}" ${S}/>
  <circle cx="0" cy="-26" r="3" fill="${P.sunshine}" stroke="none"/>
`);

export const flagCheck: PropFn = (x, y, s) => g(x, y, s, `
  <line x1="-10" y1="-24" x2="-10" y2="24" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="-10" y="-24" width="26" height="18" rx="2" fill="#fff" ${S}/>
  ${[0, 1, 2].map((cx) => [0, 1].map((cy) =>
    (cx + cy) % 2 === 0
      ? `<rect x="${-10 + cx * 8.67}" y="${-24 + cy * 9}" width="8.67" height="9" fill="${INK}"/>`
      : '').join('')).join('')}
`);

export const trophy: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -10 -14 L 10 -14 L 8 2 Q 6 10 0 10 Q -6 10 -8 2 Z" fill="${P.sunshine}" ${S}/>
  <path d="M -10 -12 Q -18 -12 -16 -4 Q -15 2 -8 0 M 10 -12 Q 18 -12 16 -4 Q 15 2 8 0"
    fill="none" ${S}/>
  <rect x="-7" y="12" width="14" height="5" rx="2.5" fill="${P.cocoa}" ${S}/>
  <path d="M 0 10 v 3" stroke="${INK}" stroke-width="2.5"/>
`);

export const balloonProp: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M 0 14 Q -4 22 0 28 Q 4 34 0 38" stroke="${INK}" stroke-width="2" fill="none"/>
  <ellipse rx="12" ry="14" fill="${P.coral}" ${S}/>
  <ellipse cx="-4" cy="-5" rx="3" ry="4.5" fill="#fff" opacity="0.5"/>
`);

export const rainbowArc: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -34 16 A 34 34 0 0 1 34 16" stroke="${P.coral}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M -26 16 A 26 26 0 0 1 26 16" stroke="${P.sunshine}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M -18 16 A 18 18 0 0 1 18 16" stroke="${P.mint}" stroke-width="7" fill="none" stroke-linecap="round"/>
`);

export const crater: PropFn = (x, y, s) => g(x, y, s, `
  <ellipse rx="12" ry="5" fill="#B9C2CE" stroke="#98A3B1" stroke-width="2"/>
`);

export const basket: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -14 -6 L 14 -6 L 10 12 L -10 12 Z" fill="${P.cocoa}" ${S}/>
  <path d="M -10 -6 Q 0 -20 10 -6" fill="none" ${S}/>
  <path d="M -9 0 L 9 0 M -8 6 L 8 6" stroke="#8A6544" stroke-width="2" stroke-linecap="round"/>
`);

export const coin: PropFn = (x, y, s) => g(x, y, s, `
  <circle r="11" fill="${P.sunshine}" ${S}/>
  <circle r="7" fill="none" stroke="#E8B84B" stroke-width="2"/>
  <path d="M 0 -4 L 1.5 -1 L 4.5 -1 L 2 1 L 3 4 L 0 2.2 L -3 4 L -2 1 L -4.5 -1 L -1.5 -1 Z" fill="#E8B84B"/>
`);

export const cone: PropFn = (x, y, s) => g(x, y, s, `
  <path d="M -12 12 L -4 -12 Q 0 -18 4 -12 L 12 12 Z" fill="${P.coral}" ${S}/>
  <path d="M -7 2 L 7 2" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  <rect x="-16" y="12" width="32" height="5" rx="2.5" fill="${P.stone}" ${S}/>
`);
