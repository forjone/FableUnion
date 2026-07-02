// 通用小部件：大按钮、草图视图、语音气泡。低龄档原则：图形优先、文字只是辅助。

import type { ReactNode } from 'react';

export function BigButton(props: {
  emoji: string;
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
      <span className="bigbtn-emoji" aria-hidden>{props.emoji}</span>
      {props.label && <span className="bigbtn-label">{props.label}</span>}
    </button>
  );
}

/** SVG 草图（引擎生成的字符串，内容均来自受控模板与转义文本） */
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
      <span className="bubble-avatar" aria-hidden>🧚</span>
      <span className="bubble-text">{props.text}</span>
    </div>
  );
}

export function Card(props: { children: ReactNode; className?: string }) {
  return <div className={`card ${props.className ?? ''}`}>{props.children}</div>;
}
