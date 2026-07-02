// UI 图标：与插画同风格的厚描边矢量图标（替代 emoji）。

import { INK, PALETTE as P } from './style';

function Svg(props: { children: React.ReactNode; size?: number; viewBox?: string }) {
  return (
    <svg
      viewBox={props.viewBox ?? '0 0 48 48'}
      width={props.size ?? 28}
      height={props.size ?? 28}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {props.children}
    </svg>
  );
}

export const IconMic = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <rect x="17" y="6" width="14" height="24" rx="7" fill={P.coral} stroke={INK} strokeWidth="3" />
    <path d="M 10 24 Q 10 36 24 36 Q 38 36 38 24" stroke={INK} strokeWidth="3.5" />
    <line x1="24" y1="36" x2="24" y2="42" stroke={INK} strokeWidth="3.5" />
    <line x1="16" y1="42" x2="32" y2="42" stroke={INK} strokeWidth="3.5" />
  </Svg>
);

export const IconCheck = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M 10 26 L 20 36 L 38 14" stroke="#fff" strokeWidth="7" />
  </Svg>
);

export const IconHand = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <path
      d="M 16 24 L 16 12 Q 16 8 19.5 8 Q 23 8 23 12 L 23 9 Q 23 5 26.5 5 Q 30 5 30 9 L 30 12 Q 30 8 33.5 9 Q 36.5 10 36 14 L 36 28 Q 36 42 26 42 Q 18 42 14 33 L 10 24 Q 8.5 20 12 19 Q 15 18.5 16 22 Z"
      fill="#fff" stroke={INK} strokeWidth="3"
    />
  </Svg>
);

export const IconHome = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M 8 24 L 24 8 L 40 24" stroke={INK} strokeWidth="3.5" fill="none" />
    <path d="M 12 22 L 12 40 L 36 40 L 36 22" fill={P.butter} stroke={INK} strokeWidth="3" />
    <rect x="20" y="28" width="8" height="12" rx="2" fill={P.coral} stroke={INK} strokeWidth="2.5" />
  </Svg>
);

export const IconSound = ({ size = 28, off = false }: { size?: number; off?: boolean }) => (
  <Svg size={size}>
    <path d="M 8 19 L 14 19 L 24 10 L 24 38 L 14 29 L 8 29 Z" fill={P.sunshine} stroke={INK} strokeWidth="3" />
    {off ? (
      <path d="M 30 18 L 42 30 M 42 18 L 30 30" stroke={INK} strokeWidth="3.5" />
    ) : (
      <>
        <path d="M 30 17 Q 35 24 30 31" stroke={INK} strokeWidth="3.5" fill="none" />
        <path d="M 35 12 Q 43 24 35 36" stroke={INK} strokeWidth="3.5" fill="none" />
      </>
    )}
  </Svg>
);

export const IconReplay = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M 38 24 A 14 14 0 1 1 30 11" stroke="#fff" strokeWidth="5" fill="none" />
    <path d="M 28 4 L 38 11 L 28 18 Z" fill="#fff" />
  </Svg>
);

export const IconPencil = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M 12 30 L 30 12 L 36 18 L 18 36 L 10 38 Z" fill={P.sunshine} stroke={INK} strokeWidth="3" />
    <path d="M 30 12 L 33 9 Q 36 7 38 10 Q 41 12 39 15 L 36 18" fill={P.coral} stroke={INK} strokeWidth="3" />
  </Svg>
);

export const IconPlay = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M 16 10 L 38 24 L 16 38 Z" fill="#fff" stroke={INK} strokeWidth="3" />
  </Svg>
);

export const IconArrow = ({ size = 28, dir = 'right' }: { size?: number; dir?: 'left' | 'right' }) => (
  <Svg size={size}>
    <g transform={dir === 'left' ? 'scale(-1,1) translate(-48,0)' : undefined}>
      <path d="M 8 24 L 34 24 M 24 12 L 36 24 L 24 36" stroke={INK} strokeWidth="5" fill="none" />
    </g>
  </Svg>
);

export const IconTap = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M 24 4 Q 33 4 35 12" stroke={INK} strokeWidth="3" fill="none" />
    <path
      d="M 20 22 L 20 12 Q 20 8 23.5 8 Q 27 8 27 12 L 27 22 L 33 24 Q 38 26 37 31 L 35 38 Q 34 43 28 43 L 24 43 Q 18 43 15 37 L 11 29 Q 9.5 25 13 24 Q 16 23.5 17.5 26 L 20 30 Z"
      fill="#fff" stroke={INK} strokeWidth="3"
    />
  </Svg>
);

export const IconGamepad = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <path
      d="M 14 14 L 34 14 Q 44 14 44 26 Q 44 36 36 36 Q 31 36 28 31 L 20 31 Q 17 36 12 36 Q 4 36 4 26 Q 4 14 14 14"
      fill={P.lavender} stroke={INK} strokeWidth="3"
    />
    <path d="M 15 20 L 15 28 M 11 24 L 19 24" stroke="#fff" strokeWidth="3.5" />
    <circle cx="32" cy="21" r="2.6" fill={P.sunshine} />
    <circle cx="37" cy="26" r="2.6" fill={P.coral} />
  </Svg>
);

export const IconSparkle = ({ size = 28 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M 24 6 Q 27 18 40 21 Q 27 24 24 38 Q 21 24 8 21 Q 21 18 24 6" fill={P.sunshine} stroke={INK} strokeWidth="2.6" />
    <path d="M 37 8 Q 38 12 42 13 Q 38 14 37 18 Q 36 14 32 13 Q 36 12 37 8" fill={P.butter} stroke={INK} strokeWidth="2" />
  </Svg>
);

export const IconStarBadge = ({ size = 28, count = 1 }: { size?: number; count?: number }) => (
  <Svg size={size} viewBox="0 0 96 48">
    {Array.from({ length: count }).map((_, i) => {
      const x = 48 + (i - (count - 1) / 2) * 28;
      return (
        <path
          key={i}
          d={`M ${x} 10 L ${x + 4.5} 20 L ${x + 15} 21 L ${x + 7} 28 L ${x + 9.5} 38 L ${x} 32 L ${x - 9.5} 38 L ${x - 7} 28 L ${x - 15} 21 L ${x - 4.5} 20 Z`}
          fill={P.sunshine} stroke={INK} strokeWidth="2.6" strokeLinejoin="round"
        />
      );
    })}
  </Svg>
);

export const IconGear = ({ size = 20 }: { size?: number }) => (
  <Svg size={size}>
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <rect key={a} x="21" y="4" width="6" height="9" rx="3" fill="#98A3B1" transform={`rotate(${a} 24 24)`} />
    ))}
    <circle cx="24" cy="24" r="13" fill="#B9C2CE" stroke={INK} strokeWidth="2.5" />
    <circle cx="24" cy="24" r="5" fill="#fff" stroke={INK} strokeWidth="2.5" />
  </Svg>
);

/** 吉祥物“阿奇”——挥着魔法棒的星星小精灵（品牌角色，出现在气泡/倾听/构建） */
export function Mascot({ size = 64, waving = false }: { size?: number; waving?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className={waving ? 'mascot-wave' : undefined}>
      <g transform={waving ? 'rotate(-8 60 60)' : undefined}>
        <line x1="94" y1="44" x2="112" y2="20" stroke={P.cocoa} strokeWidth="5" strokeLinecap="round" />
        <path d="M 112 20 m 0 -9 l 2.7 6 6.3 0.7 -4.7 4.3 1.3 6.3 -5.6 -3.3 -5.6 3.3 1.3 -6.3 -4.7 -4.3 6.3 -0.7 Z" fill={P.coral} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 60 14 L 72 42 L 102 45 L 80 65 L 87 95 L 60 78 L 33 95 L 40 65 L 18 45 L 48 42 Z"
          fill={P.sunshine} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="51" cy="55" r="5" fill="#fff" stroke={INK} strokeWidth="2" />
        <circle cx="69" cy="55" r="5" fill="#fff" stroke={INK} strokeWidth="2" />
        <circle cx="52" cy="56" r="2.5" fill={INK} />
        <circle cx="68" cy="56" r="2.5" fill={INK} />
        <circle cx="44" cy="64" r="3.4" fill="#FFB3C7" opacity="0.9" />
        <circle cx="76" cy="64" r="3.4" fill="#FFB3C7" opacity="0.9" />
        <path d="M 55 64 Q 60 69 65 64" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
