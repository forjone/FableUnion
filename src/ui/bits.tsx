// 通用小部件：大按钮、草图视图、语音气泡。低龄档原则：图形优先、文字只是辅助。

import type { ReactNode } from 'react';
import { Mascot } from '../art/icons';

export function BigButton(props: {
  icon: ReactNode;
  label?: string;
  kind?: 'primary' | 'ok' | 'warn' | 'plain';
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={`bigbtn ${props.kind ?? 'primary'} ${props.className ?? ''}`}
      onClick={props.onClick}
      type="button"
    >
      <span className="bigbtn-icon" aria-hidden>{props.icon}</span>
      {props.label && <span className="bigbtn-label">{props.label}</span>}
    </button>
  );
}

/** 引擎生成的 SVG 插画（草图/立绘/徽章，内容均来自受控模板与转义文本） */
export function SketchView(props: { svg: string; className?: string }) {
  return (
    <div
      className={`sketch ${props.className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: props.svg }}
    />
  );
}

/** 小精灵“阿奇”的话：TTS 的可视字幕（不依赖孩子识字，只是同步呈现） */
export function Bubble(props: { text: string }) {
  if (!props.text) return null;
  return (
    <div className="bubble">
      <span className="bubble-avatar" aria-hidden><Mascot size={52} /></span>
      <span className="bubble-text">{props.text}</span>
    </div>
  );
}

export function Card(props: { children: ReactNode; className?: string }) {
  return <div className={`card ${props.className ?? ''}`}>{props.children}</div>;
}

/** 全屏景观背景：远山 + 云朵（所有页面共享的世界感） */
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden>
      <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" className="backdrop-hills">
        <path d="M 0 220 Q 240 120 480 200 Q 640 250 800 190 Q 1040 110 1240 200 Q 1360 250 1440 210 L 1440 320 L 0 320 Z"
          fill="#CDEBC0" opacity="0.8" />
        <path d="M 0 260 Q 320 190 640 250 Q 960 300 1440 240 L 1440 320 L 0 320 Z"
          fill="#B4E2A4" />
        <circle cx="240" cy="285" r="7" fill="#8FCB84" />
        <circle cx="1180" cy="292" r="9" fill="#8FCB84" />
        <path d="M 340 300 q 4 -18 12 -20 q 8 2 10 20 Z" fill="#7BC86C" />
        <path d="M 1040 302 q 4 -14 10 -16 q 7 2 9 16 Z" fill="#7BC86C" />
      </svg>
      <svg viewBox="0 0 60 24" className="backdrop-cloud c1"><path d="M 10 18 Q 2 18 4 10 Q 6 4 14 6 Q 16 -2 26 1 Q 34 3 33 10 Q 42 8 43 15 Q 43 18 36 18 Z" fill="#fff" opacity="0.9"/></svg>
      <svg viewBox="0 0 60 24" className="backdrop-cloud c2"><path d="M 10 18 Q 2 18 4 10 Q 6 4 14 6 Q 16 -2 26 1 Q 34 3 33 10 Q 42 8 43 15 Q 43 18 36 18 Z" fill="#fff" opacity="0.75"/></svg>
    </div>
  );
}
