// 通用小部件。低龄档原则：图形优先、文字只是辅助。

import { Mascot } from '../art/icons';

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
