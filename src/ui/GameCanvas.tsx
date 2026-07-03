// ⑤ 成品游玩界面（原型 DONE 分镜）：Canvas 运行时 + 彩色大按钮触屏控制。
// 素材先从矢量插画栅格化，加载完成后才允许开始。

import { useEffect, useRef, useState } from 'react';
import { IconArrow, IconHome, IconPlay, IconReplay, IconTap } from '../art/icons';
import { GameRuntime, effectButtonLabel, loadSprites, type SpriteSet } from '../engine/game';
import type { GameSpec } from '../engine/types';

export function PlayStage(props: {
  spec: GameSpec;
  onWin: () => void;
  onIterate: () => void;
  onReplay: () => void;
  onHome: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<GameRuntime | null>(null);
  const [sprites, setSprites] = useState<SpriteSet | null>(null);
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const { spec, onWin } = props;

  useEffect(() => {
    let alive = true;
    void loadSprites(spec).then((s) => { if (alive) setSprites(s); });
    return () => { alive = false; };
  }, [spec]);

  useEffect(() => {
    if (!started || !sprites || !canvasRef.current) return;
    const rt = new GameRuntime(canvasRef.current, spec, sprites, { onWin });
    runtimeRef.current = rt;
    rt.start();
    return () => { rt.destroy(); runtimeRef.current = null; };
  }, [started, sprites, spec, onWin, round]);

  const hold = (c: 'left' | 'right' | 'action') => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); runtimeRef.current?.press(c); },
    onPointerUp: () => runtimeRef.current?.release(c),
    onPointerLeave: () => runtimeRef.current?.release(c),
  });

  const needsLR = spec.mechanic === 'collect' || spec.mechanic === 'dodge';
  const needsAction = spec.mechanic === 'race' || spec.mechanic === 'jump';
  const actionLabel = spec.mechanic === 'race' ? '快跑！' : '跳一下';
  const keyHint = needsAction
    ? `用空格键${spec.mechanic === 'race' ? '加速' : '跳'}${spec.effect ? '、F 键放大招' : ''}，也可以点上面的按钮`
    : needsLR
      ? `用左右方向键移动${spec.effect ? '、F 键放大招' : ''}，也可以点按钮`
      : `直接点画面里的泡泡${spec.effect ? '，F 键放大招' : ''}`;

  return (
    <div className="stage-play">
      <div className="play-head">
        <h2 className="play-title">{spec.title}</h2>
        <span className="done-chip">造好啦</span>
      </div>
      <div className="game-frame">
        <canvas ref={canvasRef} className="game-canvas" key={round} />
        {!started && (
          <button
            className="game-start"
            type="button"
            disabled={!sprites}
            onClick={() => setStarted(true)}
          >
            <span className="game-start-btn"><IconPlay size={50} /></span>
          </button>
        )}
      </div>
      <div className="play-controls">
        {needsLR && (
          <>
            <button className="btn-action blue" type="button" {...hold('left')}><IconArrow dir="left" size={30} /></button>
            <button className="btn-action blue" type="button" {...hold('right')}><IconArrow dir="right" size={30} /></button>
          </>
        )}
        {needsAction && (
          <button className="btn-action blue" type="button" {...hold('action')}>
            <IconTap size={26} />{actionLabel}
          </button>
        )}
        {spec.effect && (
          <button className="btn-action red" type="button" onClick={() => runtimeRef.current?.special()}>
            {effectButtonLabel(spec.effect)}
          </button>
        )}
        <span className="ctl-divider" aria-hidden />
        <button
          className="btn-action ghost"
          type="button"
          onClick={() => { setStarted(false); setRound((r) => r + 1); props.onReplay(); }}
        >
          <IconReplay size={22} />再玩一次
        </button>
        <button className="btn-outline" type="button" onClick={props.onIterate}>还想加点什么</button>
        <button className="btn-action ghost" type="button" onClick={props.onHome}>
          <IconHome size={22} />收好
        </button>
      </div>
      <p className="soft-hint">{keyHint}</p>
    </div>
  );
}
