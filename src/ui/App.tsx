// 流程中枢：六阶段闭环状态机（PRD 第 2 节）。
// ① 倾听 → ② 拆解+草图隐式确认（打断→分歧，回到②）
// → ③ 复述确认+终稿【唯一显式确认】（不满意→②）→ ④ 构建 → ⑤ 成品+迭代（→①）

import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadWorks, saveWork } from '../app/archive';
import { loadSpeechPref, setSpeechEnabled, speak, speechEnabled, stopSpeaking } from '../app/speech';
import { buildSpec } from '../engine/game';
import {
  applyOption, parseUtterance, pendingDivergence, buildFixDivergence, slotsToJSON,
} from '../engine/parser';
import {
  celebrateLine, iterateInvite, listenPrompt, nudgeLine, recapSentence, sketchNarration,
} from '../engine/story';
import { controlHint } from '../engine/game';
import type {
  DialogueEntry, Divergence, DivergenceOption, GameSpec, SlotName, SlotProfile, WorkRecord,
} from '../engine/types';
import { Bubble } from './bits';
import { PlayStage } from './GameCanvas';
import {
  BuildStage, ConfirmStage, DivergeStage, FixWhatStage, HomeStage, ListenStage, SketchStage,
} from './stages';

type Stage =
  | { name: 'home' }
  | { name: 'listen' }
  | { name: 'diverge'; div: Divergence }
  | { name: 'sketch' }
  | { name: 'fixwhat' }
  | { name: 'confirm' }
  | { name: 'build' }
  | { name: 'play'; won: boolean };

export default function App() {
  const [stage, setStage] = useState<Stage>({ name: 'home' });
  const [profile, setProfile] = useState<SlotProfile | null>(null);
  const [translations, setTranslations] = useState<string[]>([]);
  const [changed, setChanged] = useState<SlotName[]>([]);
  const [dialogue, setDialogue] = useState<DialogueEntry[]>([]);
  const [spec, setSpec] = useState<GameSpec | null>(null);
  const [workId, setWorkId] = useState<string | null>(null);
  const [iterating, setIterating] = useState(false);
  const [caption, setCaption] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [devOpen, setDevOpen] = useState(false);
  const [works, setWorks] = useState<WorkRecord[]>([]);

  useEffect(() => {
    loadSpeechPref();
    setSoundOn(speechEnabled());
    setWorks(loadWorks());
  }, []);

  /** 阿奇（AI 小精灵）说话：TTS + 字幕 + 记入对话档案 */
  const say = useCallback((text: string) => {
    setCaption(text);
    speak(text);
    setDialogue((d) => [...d, { who: 'ai', text, at: Date.now() }]);
  }, []);

  const hear = useCallback((text: string) => {
    setDialogue((d) => [...d, { who: 'kid', text, at: Date.now() }]);
  }, []);

  const resetSession = useCallback(() => {
    setProfile(null);
    setTranslations([]);
    setChanged([]);
    setDialogue([]);
    setSpec(null);
    setWorkId(null);
    setIterating(false);
  }, []);

  // —— ① → ②：听完一句话，真实拆解，然后要么进分歧、要么直接画草图 ——
  const goSketch = useCallback(
    (p: SlotProfile, tr: string[], ch: SlotName[]) => {
      setStage({ name: 'sketch' });
      say(sketchNarration(p, tr, ch).join('，'));
    },
    [say],
  );

  const submitUtterance = useCallback(
    (text: string) => {
      if (!text.trim()) { say(nudgeLine()); return; }
      hear(text);
      const res = parseUtterance(text, iterating ? profile : null);
      setProfile(res.profile);
      setTranslations(res.translations);
      setChanged(res.changed);
      if (res.divergence) {
        setStage({ name: 'diverge', div: res.divergence });
        say([...res.translations, res.divergence.prompt].join('，'));
      } else {
        goSketch(res.profile, res.translations, res.changed);
      }
    },
    [goSketch, hear, iterating, profile, say],
  );

  // —— 分歧：指一个 → 立即回到草图；若还有下一个关键缺失，继续处理下一个 ——
  const pickOption = useCallback(
    (opt: DivergenceOption) => {
      if (!profile || stage.name !== 'diverge') return;
      const next = applyOption(profile, stage.div, opt);
      setProfile(next);
      const pend = pendingDivergence(next);
      if (pend) {
        setStage({ name: 'diverge', div: pend });
        say(pend.prompt);
      } else {
        goSketch(next, translations, changed);
        setTranslations([]);
      }
    },
    [changed, goSketch, profile, say, stage, translations],
  );

  // —— ② → ③：沉默/点头即通过，进入唯一的显式确认 ——
  const sketchPass = useCallback(() => {
    if (!profile) return;
    setStage({ name: 'confirm' });
    say(recapSentence(profile));
  }, [profile, say]);

  const sketchInterrupt = useCallback(() => {
    stopSpeaking();
    setStage({ name: 'fixwhat' });
    say('哦哦，哪里不对呀？指给我看！');
  }, [say]);

  const fixPick = useCallback(
    (slot: SlotName) => {
      if (!profile) return;
      const div = buildFixDivergence(profile, slot);
      setStage({ name: 'diverge', div });
      say(div.prompt);
    },
    [profile, say],
  );

  const fixResay = useCallback(() => {
    setIterating(true);
    setStage({ name: 'listen' });
    say(listenPrompt(true));
  }, [say]);

  // —— ③ → ④：孩子说“对！”，才开始耗费构建资源 ——
  const confirmYes = useCallback(() => {
    if (!profile) return;
    setStage({ name: 'build' });
    say('好嘞！看我的魔法——');
  }, [profile, say]);

  const confirmNo = useCallback(() => {
    setStage({ name: 'fixwhat' });
    say('没关系！哪里要改？指给我看！');
  }, [say]);

  // —— ④ → ⑤：构建完成即存档（作品档案），开始玩 ——
  const buildDone = useCallback(() => {
    if (!profile) return;
    const s = buildSpec(profile);
    setSpec(s);
    setDialogue((d) => {
      const rec = saveWork(workId, s.title, profile, s, d);
      setWorkId(rec.id);
      setWorks(loadWorks());
      return d;
    });
    setStage({ name: 'play', won: false });
    say(`${celebrateLine(profile)}${controlHint(s).text}`);
  }, [profile, say, workId]);

  const gameWon = useCallback(() => {
    setStage((st) => (st.name === 'play' ? { name: 'play', won: true } : st));
    if (profile) say(`${celebrateLine(profile)}${iterateInvite()}`);
  }, [profile, say]);

  // —— ⑤ → ①：继续迭代，带着已有档案回到倾听 ——
  const iterate = useCallback(() => {
    stopSpeaking();
    setIterating(true);
    setStage({ name: 'listen' });
    say(listenPrompt(true));
  }, [say]);

  const goHome = useCallback(() => {
    stopSpeaking();
    resetSession();
    setWorks(loadWorks());
    setCaption('');
    setStage({ name: 'home' });
  }, [resetSession]);

  const startFresh = useCallback(() => {
    resetSession();
    setStage({ name: 'listen' });
    say(listenPrompt(false));
  }, [resetSession, say]);

  const playWork = useCallback((w: WorkRecord) => {
    setProfile(w.profile);
    setSpec(w.spec);
    setWorkId(w.id);
    setDialogue(w.dialogue ?? []);
    setIterating(true);
    setStage({ name: 'play', won: false });
    say(`${w.title}来啦！${controlHint(w.spec).text}`);
  }, [say]);

  const iterateWork = useCallback((w: WorkRecord) => {
    setProfile(w.profile);
    setSpec(w.spec);
    setWorkId(w.id);
    setDialogue(w.dialogue ?? []);
    setIterating(true);
    setStage({ name: 'listen' });
    say(listenPrompt(true));
  }, [say]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSpeechEnabled(next);
  };

  const devInfo = useMemo(() => {
    if (!devOpen) return '';
    return JSON.stringify(
      {
        stage: stage.name,
        divergence: stage.name === 'diverge' ? { slot: stage.div.slot, kind: stage.div.kind, reason: stage.div.reason } : null,
        slots: profile ? slotsToJSON(profile) : null,
        dialogue: dialogue.slice(-6).map((d) => `${d.who === 'kid' ? '👶' : '🧚'} ${d.text}`),
      },
      null,
      2,
    );
  }, [devOpen, profile, stage]);

  return (
    <div className="app">
      <header className="topbar">
        {stage.name !== 'home' ? (
          <button className="icon-btn" type="button" onClick={goHome} title="回小屋">🏠</button>
        ) : <span />}
        <button className="icon-btn" type="button" onClick={toggleSound} title="声音开关">
          {soundOn ? '🔊' : '🔇'}
        </button>
      </header>

      {stage.name !== 'home' && <Bubble text={caption} />}

      <main className="stage-area">
        {stage.name === 'home' && (
          <HomeStage works={works} onStart={startFresh} onPlay={playWork} onIterate={iterateWork} />
        )}
        {stage.name === 'listen' && (
          <ListenStage iterating={iterating} onSubmit={submitUtterance} />
        )}
        {stage.name === 'diverge' && profile && (
          <DivergeStage profile={profile} divergence={stage.div} onPick={pickOption} />
        )}
        {stage.name === 'sketch' && profile && (
          <SketchStage profile={profile} onPass={sketchPass} onInterrupt={sketchInterrupt} />
        )}
        {stage.name === 'fixwhat' && profile && (
          <FixWhatStage profile={profile} onPick={fixPick} onResay={fixResay} />
        )}
        {stage.name === 'confirm' && profile && (
          <ConfirmStage profile={profile} onYes={confirmYes} onNo={confirmNo} />
        )}
        {stage.name === 'build' && profile && (
          <BuildStage profile={profile} onDone={buildDone} />
        )}
        {stage.name === 'play' && spec && (
          <PlayStage
            spec={spec}
            won={stage.won}
            onWin={gameWon}
            onIterate={iterate}
            onReplay={() => setStage({ name: 'play', won: false })}
            onHome={goHome}
          />
        )}
      </main>

      <button className="dev-toggle" type="button" onClick={() => setDevOpen((o) => !o)} title="内部骨架（开发/家长用）">
        ⚙️
      </button>
      {devOpen && <pre className="dev-panel">{devInfo}</pre>}
    </div>
  );
}
