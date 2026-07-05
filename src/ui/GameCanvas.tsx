// ⑤ 成品游玩界面（原型 DONE 分镜）：Canvas 运行时 + 彩色大按钮触屏控制。
// 含：关卡递进、双人对决、角色装扮、小灵主动提议。

import { useEffect, useRef, useState } from 'react';
import type { AccessoryId } from '../art/characters';
import { IconArrow, IconGamepad, IconHome, IconMic, IconPencil, IconPlay, IconReplay, IconSparkle, IconTap } from '../art/icons';
import { GameRuntime, effectButtonLabel, loadSprites, type SpriteSet } from '../engine/game';
import type { Suggestion } from '../engine/suggest';
import type { GameSpec } from '../engine/types';
import { DressUp, SuggestChip } from './bits';

export function PlayStage(props: {
  spec: GameSpec;
  won: boolean;
  suggestion: Suggestion | null;
  onWin: () => void;
  onNextLevel: (level: number) => void;
  onDuel: () => void;
  onDress: (acc: AccessoryId | null) => void;
  onSuggest: (say: string) => void;
  onIterate: () => void;
  onShare: () => void;
  onReplay: () => void;
  onHome: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<GameRuntime | null>(null);
  const [sprites, setSprites] = useState<SpriteSet | null>(null);
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(1);
  const [duel, setDuel] = useState(false);
  const [dressOpen, setDressOpen] = useState(false);
  const { spec, onWin } = props;

  useEffect(() => {
    let alive = true;
    void loadSprites(spec).then((s) => { if (alive) setSprites(s); });
    return () => { alive = false; };
  }, [spec]);

  useEffect(() => {
    if (!started || !sprites || !canvasRef.current) return;
    // 双人模式：任意作品都切换成同屏赛跑对决（无特效技能，保证公平）
    const runSpec: GameSpec = duel
      ? { ...spec, mechanic: 'race', mechanicExtra: null, effect: null }
      : spec;
    const rt = new GameRuntime(canvasRef.current, runSpec, sprites, { onWin }, duel ? 1 : level, duel);
    runtimeRef.current = rt;
    rt.start();
    return () => { rt.destroy(); runtimeRef.current = null; };
  }, [started, sprites, spec, onWin, round, level, duel]);

  const hold = (c: 'left' | 'right' | 'action') => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); runtimeRef.current?.press(c); },
    onPointerUp: () => runtimeRef.current?.release(c),
    onPointerLeave: () => runtimeRef.current?.release(c),
  });

  const restart = () => { setRound((r) => r + 1); };

  const needsLR = !duel && (spec.mechanic === 'collect' || spec.mechanic === 'dodge');
  const needsAction = !duel && (spec.mechanic === 'race' || spec.mechanic === 'jump');
  const actionLabel = spec.mechanic === 'race' ? '快跑！' : '跳一下';
  const keyHint = duel
    ? '左边选手点左半屏，右边选手点右半屏，看谁先到终点！'
    : needsAction
      ? `用空格键${spec.mechanic === 'race' ? '加速' : '跳'}${spec.effect ? '、F 键放大招' : ''}，也可以点上面的按钮`
      : needsLR
        ? `用左右方向键移动${spec.effect ? '、F 键放大招' : ''}，也可以点按钮`
        : `直接点画面里的泡泡${spec.effect ? '，F 键放大招' : ''}`;

  return (
    <div className="stage-play">
      <div className="play-head">
        <h2 className="play-title">{spec.title}</h2>
        <span className="done-chip">造好啦</span>
        {duel && <span className="level-chip">双人对决</span>}
        {!duel && level > 1 && <span className="level-chip">第 {level} 关</span>}
      </div>
      <div className="game-frame">
        <canvas ref={canvasRef} className="game-canvas" key={`${round}-${duel ? 'd' : 's'}`} />
        {!started && (
          <button className="game-start" type="button" disabled={!sprites} onClick={() => setStarted(true)}>
            <span className="game-start-btn"><IconPlay size={50} /></span>
          </button>
        )}
      </div>
      {dressOpen && (
        <DressUp
          heroId={spec.heroId}
          current={spec.accessory}
          onPick={(acc) => { props.onDress(acc); }}
        />
      )}
      <div className="play-controls">
        {props.won && !duel && (
          <button
            className="btn-action green"
            type="button"
            onClick={() => {
              const next = level + 1;
              setLevel(next);
              restart();
              props.onNextLevel(next);
            }}
          >
            <IconPlay size={24} /><span className="t-label">下一关！</span>
          </button>
        )}
        {needsLR && (
          <>
            <button className="btn-action blue" type="button" {...hold('left')}><IconArrow dir="left" size={30} /></button>
            <button className="btn-action blue" type="button" {...hold('right')}><IconArrow dir="right" size={30} /></button>
          </>
        )}
        {needsAction && (
          <button className="btn-action blue" type="button" {...hold('action')}>
            <IconTap size={26} /><span className="t-label">{actionLabel}</span>
          </button>
        )}
        {!duel && spec.effect && (
          <button className="btn-action red" type="button" onClick={() => runtimeRef.current?.special()}>
            {effectButtonLabel(spec.effect)}
          </button>
        )}
        <button
          className={`btn-action ${duel ? 'blue' : 'ghost'}`}
          type="button"
          onClick={() => {
            const next = !duel;
            setDuel(next);
            restart();
            if (next) props.onDuel();
          }}
        >
          <IconGamepad size={24} /><span className="t-label">{duel ? '回到单人' : '双人比赛'}</span>
        </button>
        <button className="btn-action ghost" type="button" onClick={() => setDressOpen((o) => !o)}>
          <IconPencil size={22} /><span className="t-label">装扮</span>
        </button>
        <span className="ctl-divider" aria-hidden />
        <button className="btn-action ghost" type="button" onClick={() => { restart(); props.onReplay(); }}>
          <IconReplay size={22} color="#5B4A3E" /><span className="t-label">再玩一次</span>
        </button>
        <button className="btn-outline" type="button" onClick={props.onIterate}>
          <IconMic size={22} /><span className="t-label">还想加点什么</span>
        </button>
        <button className="btn-action ghost" type="button" onClick={props.onShare}>
          <IconSparkle size={22} /><span className="t-label">分享</span>
        </button>
        <button className="btn-action ghost" type="button" onClick={props.onHome}>
          <IconHome size={22} /><span className="t-label">收好</span>
        </button>
      </div>
      {props.won && props.suggestion && (
        <SuggestChip suggestion={props.suggestion} onAccept={() => props.onSuggest(props.suggestion!.say)} />
      )}
      <p className="soft-hint">{keyHint}</p>
    </div>
  );
}
