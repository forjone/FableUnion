// 插画系统的统一风格常量：所有角色、道具、图标共享一套描边与配色语言。
// 风格基准：顶尖儿童 App（Toca Boca / Sago Mini）的扁平厚描边矢量插画。

export const INK = '#413A5C';        // 深莓紫描边（比纯黑柔和）
export const CHEEK = '#FFB3C7';      // 腮红
export const WHITE = '#FFFFFF';

export const PALETTE = {
  coral: '#FF7E6B',
  peach: '#FFB088',
  sunshine: '#FFC94D',
  butter: '#FFE29A',
  leaf: '#7BC86C',
  mint: '#8FE3CF',
  teal: '#2EC4B6',
  sky: '#7FD3F7',
  blueberry: '#7C9EF5',
  lavender: '#A78BFA',
  lilac: '#C9B8F5',
  rose: '#F79ACB',
  cream: '#FFF8EE',
  sand: '#F5E2C8',
  cocoa: '#B58963',
  cloud: '#F4F1FF',
  stone: '#AEB8C4',
} as const;

/** 标准可爱脸：大眼睛 + 高光 + 腮红 + 微笑（s 为缩放，cx/cy 为脸中心） */
export function face(cx: number, cy: number, s = 1): string {
  const e = 8.5 * s;
  return `
    <circle cx="${cx - e}" cy="${cy}" r="${5.2 * s}" fill="#fff" stroke="${INK}" stroke-width="${2 * s}"/>
    <circle cx="${cx + e}" cy="${cy}" r="${5.2 * s}" fill="#fff" stroke="${INK}" stroke-width="${2 * s}"/>
    <circle cx="${cx - e + 1.2 * s}" cy="${cy + 0.6 * s}" r="${2.6 * s}" fill="${INK}"/>
    <circle cx="${cx + e + 1.2 * s}" cy="${cy + 0.6 * s}" r="${2.6 * s}" fill="${INK}"/>
    <circle cx="${cx - e + 2.4 * s}" cy="${cy - 0.8 * s}" r="${1 * s}" fill="#fff"/>
    <circle cx="${cx + e + 2.4 * s}" cy="${cy - 0.8 * s}" r="${1 * s}" fill="#fff"/>
    <circle cx="${cx - 17 * s}" cy="${cy + 7 * s}" r="${3.6 * s}" fill="${CHEEK}" opacity="0.85"/>
    <circle cx="${cx + 17 * s}" cy="${cy + 7 * s}" r="${3.6 * s}" fill="${CHEEK}" opacity="0.85"/>
    <path d="M ${cx - 4.5 * s} ${cy + 8.5 * s} Q ${cx} ${cy + 13 * s} ${cx + 4.5 * s} ${cy + 8.5 * s}"
      stroke="${INK}" stroke-width="${2.4 * s}" fill="none" stroke-linecap="round"/>`;
}

/** 闭眼开心版的笑脸（庆祝用） */
export function happyFace(cx: number, cy: number, s = 1): string {
  const e = 8.5 * s;
  const arc = (x: number) =>
    `<path d="M ${x - 4 * s} ${cy + 1 * s} Q ${x} ${cy - 4 * s} ${x + 4 * s} ${cy + 1 * s}" stroke="${INK}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>`;
  return `
    ${arc(cx - e)}${arc(cx + e)}
    <circle cx="${cx - 17 * s}" cy="${cy + 7 * s}" r="${3.6 * s}" fill="${CHEEK}" opacity="0.85"/>
    <circle cx="${cx + 17 * s}" cy="${cy + 7 * s}" r="${3.6 * s}" fill="${CHEEK}" opacity="0.85"/>
    <path d="M ${cx - 5 * s} ${cy + 7 * s} Q ${cx} ${cy + 14 * s} ${cx + 5 * s} ${cy + 7 * s}"
      stroke="${INK}" stroke-width="${2.4 * s}" fill="${CHEEK}" stroke-linecap="round"/>`;
}

export const strokeAttrs = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
