// 通用小部件。低龄档原则：图形优先、文字只是辅助。

import { useState } from 'react';
import { ACCESSORIES, characterSVG, type AccessoryId } from '../art/characters';
import { Mascot } from '../art/icons';
import type { Suggestion } from '../engine/suggest';

/** 引擎生成的 SVG 插画（草图/立绘/徽章，内容均来自受控模板与转义文本） */
export function SketchView(props: { svg: string; className?: string }) {
  return (
    <div
      className={`sketch ${props.className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: props.svg }}
    />
  );
}

/** 小灵说的话：TTS 的可视字幕（原型分镜：小吉祥物 + 白色对话气泡） */
export function Bubble(props: { text: string }) {
  if (!props.text) return null;
  return (
    <div className="bubble">
      <span className="bubble-avatar float" aria-hidden><Mascot size={58} sparks={false} /></span>
      <span className="bubble-text">{props.text}</span>
    </div>
  );
}

/** 装扮选择器：给主角挑一件配饰（纯指选，不打字） */
export function DressUp(props: {
  heroId: string;
  current: AccessoryId | null | undefined;
  onPick: (acc: AccessoryId | null) => void;
}) {
  const options: { id: AccessoryId | null; label: string }[] = [
    { id: null, label: '不戴啦' },
    ...ACCESSORIES.map((a) => ({ id: a.id as AccessoryId | null, label: a.label })),
  ];
  return (
    <div className="dressup-row" role="group" aria-label="装扮">
      {options.map((o) => (
        <button
          key={o.id ?? 'none'}
          className={`dressup-card ${props.current === o.id || (!props.current && o.id === null) ? 'on' : ''}`}
          type="button"
          onClick={() => props.onPick(o.id)}
        >
          <span className="dressup-art" dangerouslySetInnerHTML={{ __html: characterSVG(props.heroId, 62, o.id) }} />
          <span className="dressup-label t-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** 小灵的主动提议（点燃想象）：点“好呀”直接进入迭代闭环 */
export function SuggestChip(props: { suggestion: Suggestion; onAccept: () => void }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div className="suggest-chip">
      <span className="suggest-mascot"><Mascot size={44} sparks={false} /></span>
      <span className="suggest-text">要不要{props.suggestion.say}</span>
      <button className="suggest-yes" type="button" onClick={props.onAccept}>好呀！</button>
      <button className="suggest-no" type="button" onClick={() => setGone(true)}>先不用</button>
    </div>
  );
}
