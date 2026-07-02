// ⑤ 成品游玩界面：Canvas 运行时 + 大按钮触屏控制（低龄档友好）。

import { useEffect, useRef, useState } from 'react';
import { GameRuntime, controlHint } from '../engine/game';
import type { GameSpec } from '../engine/types';
import { BigButton } from './bits';

export function GameCanvas(props: { spec: GameSpec; onWin: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<GameRuntime | null>(null);
  const [started, setStarted] = useState(false);
  const { spec, onWin } = props;

  useEffect(() => {
    if (!started || !canvasRef.current) return;
    const rt = new GameRuntime(canvasRef.current, spec, { onWin });
    runtimeRef.current = rt;
    rt.start();
    return () => { rt.destroy(); runtimeRef.current = null; };
  }, [started, spec, onWin]);

  const hold = (c: 'left' | 'right' | 'action') => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); runtimeRef.current?.press(c); },
    onPointerUp: () => runtimeRef.current?.release(c),
    onPointerLeave: () => runtimeRef.current?.release(c),
  });

  const hint = controlHint(spec);
  const needsLR = spec.mechanic === 'collect' || spec.mechanic === 'dodge';
  const needsAction = spec.mechanic === 'race' || spec.mechanic === 'jump';

  return (
    <div className="game-wrap">
      <div className="game-frame">
        <canvas ref={canvasRef} className="game-canvas" />
        {!started && (
          <button className="game-start" type="button" onClick={() => setStarted(true)}>
            <span className="game-start-emoji">▶️</span>
            <span className="game-start-hint">{hint.emoji}</span>
          </button>
        )}
      </div>
      {started && (
        <div className="game-controls">
          {needsLR && (
            <>
              <button className="ctl-btn" type="button" {...hold('left')}>⬅️</button>
              <button className="ctl-btn" type="button" {...hold('right')}>➡️</button>
            </>
          )}
          {needsAction && (
            <button className="ctl-btn ctl-wide" type="button" {...hold('action')}>👆</button>
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
        <BigButton emoji="🎤" label="还想加点什么" kind="primary" onClick={props.onIterate} />
        <BigButton
          emoji="🔁"
          label="再玩一次"
          kind="plain"
          onClick={() => { setRound((r) => r + 1); props.onReplay(); }}
        />
        <BigButton emoji="🏠" label="收进小屋" kind="plain" onClick={props.onHome} />
      </div>
      {props.won && <div className="win-tip" aria-hidden>🎉</div>}
    </div>
  );
}
