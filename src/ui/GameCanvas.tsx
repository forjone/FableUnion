// ⑤ 成品游玩界面：Canvas 运行时 + 大按钮触屏控制（低龄档友好）。
// 素材先从矢量插画栅格化，加载完成后才允许开始。

import { useEffect, useRef, useState } from 'react';
import { IconArrow, IconHome, IconMic, IconPlay, IconReplay, IconTap } from '../art/icons';
import { GameRuntime, loadSprites, type SpriteSet } from '../engine/game';
import type { GameSpec } from '../engine/types';
import { BigButton } from './bits';

export function GameCanvas(props: { spec: GameSpec; onWin: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<GameRuntime | null>(null);
  const [sprites, setSprites] = useState<SpriteSet | null>(null);
  const [started, setStarted] = useState(false);
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
  }, [started, sprites, spec, onWin]);

  const hold = (c: 'left' | 'right' | 'action') => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); runtimeRef.current?.press(c); },
    onPointerUp: () => runtimeRef.current?.release(c),
    onPointerLeave: () => runtimeRef.current?.release(c),
  });

  const needsLR = spec.mechanic === 'collect' || spec.mechanic === 'dodge';
  const needsAction = spec.mechanic === 'race' || spec.mechanic === 'jump';

  return (
    <div className="game-wrap">
      <div className="game-frame">
        <canvas ref={canvasRef} className="game-canvas" />
        {!started && (
          <button
            className="game-start"
            type="button"
            disabled={!sprites}
            onClick={() => setStarted(true)}
          >
            <span className="game-start-btn"><IconPlay size={56} /></span>
          </button>
        )}
      </div>
      {started && (
        <div className="game-controls">
          {needsLR && (
            <>
              <button className="ctl-btn" type="button" {...hold('left')}><IconArrow dir="left" size={40} /></button>
              <button className="ctl-btn" type="button" {...hold('right')}><IconArrow dir="right" size={40} /></button>
            </>
          )}
          {needsAction && (
            <button className="ctl-btn ctl-wide" type="button" {...hold('action')}><IconTap size={44} /></button>
          )}
        </div>
      )}
    </div>
  );
}

export function PlayStage(props: {
  spec: GameSpec;
  won: boolean;
  onWin: () => void;
  onIterate: () => void;
  onReplay: () => void;
  onHome: () => void;
}) {
  const [round, setRound] = useState(0);
  return (
    <div className="stage-play">
      <div className="play-title">{props.spec.title}</div>
      <GameCanvas key={round} spec={props.spec} onWin={props.onWin} />
      <div className="row play-actions">
        <BigButton icon={<IconMic size={26} />} label="还想加点什么" kind="primary" onClick={props.onIterate} />
        <BigButton
          icon={<IconReplay size={26} />}
          label="再玩一次"
          kind="plain"
          onClick={() => { setRound((r) => r + 1); props.onReplay(); }}
        />
        <BigButton icon={<IconHome size={26} />} label="收进小屋" kind="plain" onClick={props.onHome} />
      </div>
    </div>
  );
}
