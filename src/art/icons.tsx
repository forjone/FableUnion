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

export const IconReplay = ({ size = 28, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg size={size}>
    <path d="M 38 24 A 14 14 0 1 1 30 11" stroke={color} strokeWidth="5" fill="none" />
    <path d="M 28 4 L 38 11 L 28 18 Z" fill={color} />
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

/** 吉祥物“小灵”——橙色小圆生物（对照原型：不规则圆身、白眼黑瞳、腮红、开口笑、身边有小星星） */
export function Mascot({ size = 64, waving = false, sparks = true }: { size?: number; waving?: boolean; sparks?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className={waving ? 'mascot-wave' : undefined}>
      <defs>
        <linearGradient id="ling-body" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#FF9256" />
          <stop offset="1" stopColor="#EE7A45" />
        </linearGradient>
      </defs>
      {sparks && (
        <>
          <rect x="88" y="10" width="12" height="12" rx="3" fill="#FFC24B" transform="rotate(45 94 16)" className="spark s1" />
          <rect x="102" y="40" width="8" height="8" rx="2" fill="#57B368" transform="rotate(45 106 44)" className="spark s2" />
        </>
      )}
      <path d="M 60 8 Q 104 10 108 58 Q 110 106 60 110 Q 12 108 12 58 Q 14 12 60 8" fill="url(#ling-body)" />
      <path d="M 60 104 Q 24 102 20 62 Q 22 96 60 100 Q 96 98 102 60 Q 100 100 60 104" fill="rgba(0,0,0,0.06)" />
      <ellipse cx="44" cy="54" rx="10" ry="12" fill="#fff" />
      <ellipse cx="76" cy="54" rx="10" ry="12" fill="#fff" />
      <circle cx="46" cy="57" r="5" fill="#3E2A1E" />
      <circle cx="74" cy="57" r="5" fill="#3E2A1E" />
      <circle cx="48" cy="55" r="1.8" fill="#fff" />
      <circle cx="76" cy="55" r="1.8" fill="#fff" />
      <ellipse cx="32" cy="72" rx="7" ry="4.5" fill="rgba(255,120,120,0.5)" />
      <ellipse cx="88" cy="72" rx="7" ry="4.5" fill="rgba(255,120,120,0.5)" />
      <path d="M 51 70 Q 60 80 69 70" stroke="#3E2A1E" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** 顶部旅程进度点（原型：走过=橙、当前=黄、未到=浅灰） */
export function JourneyDots({ current }: { current: number }) {
  return (
    <div className="journey-dots" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="journey-dot"
          style={{
            background: i < current ? '#EE7A45' : i === current ? '#FFC24B' : 'rgba(62,49,40,0.12)',
          }}
        />
      ))}
    </div>
  );
}
