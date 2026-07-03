// 流程中枢：六阶段闭环状态机（PRD 第 2 节）。
// ① 倾听 → ② 拆解+草图隐式确认（打断→分歧，回到②）
// → ③ 复述确认+终稿【唯一显式确认】（不满意→②）→ ④ 构建 → ⑤ 成品+迭代（→①）
// 应用形态对照【儿童课程交互原型设计】：1194×834 iPad 横屏卡片 + 自适应缩放 + 顶部旅程条。

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadWorks, saveWork } from '../app/archive';
import {
  DEFAULT_IMGGEN, generateImage, imagePrompt, imgGenReady, loadImgGenConfig,
  saveImgGenConfig, type ImgGenConfig, type MagicCover,
} from '../app/imagegen';
import { loadSpeechPref, setSpeechEnabled, speak, speechEnabled, stopSpeaking } from '../app/speech';
import { buildSpec, controlHint } from '../engine/game';
import { sketchSVG, workTitle } from '../engine/sketch';
import {
  applyOption, parseUtterance, pendingDivergence, buildFixDivergence, slotsToJSON,
} from '../engine/parser';
import {
  celebrateLine, iterateInvite, listenPrompt, nudgeLine, recapSentence, sketchNarration,
} from '../engine/story';
import type {
  DialogueEntry, Divergence, DivergenceOption, GameSpec, SlotName, SlotProfile, WorkRecord,
} from '../engine/types';
import { IconGear, IconHome, IconSound, JourneyDots, Mascot } from '../art/icons';
import { Bubble } from './bits';
import { PlayStage } from './GameCanvas';
import {
  BuildStage, ConfirmStage, DivergeStage, FixWhatStage, ListenStage, SketchStage, WelcomeStage,
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

const FRAME_W = 1194;
const FRAME_H = 834;

/** 旅程点：倾听 0 → 画草图 1 → 确认 2 → 建造 3 → 玩 4 */
function journeyIndex(stage: Stage): number {
  switch (stage.name) {
    case 'listen': return 0;
    case 'diverge': case 'sketch': case 'fixwhat': return 1;
    case 'confirm': return 2;
    case 'build': return 3;
    case 'play': return 4;
    default: return -1;
  }
}

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
  const [imgCfg, setImgCfg] = useState<ImgGenConfig>(DEFAULT_IMGGEN);
  const [magic, setMagic] = useState<MagicCover>({ status: 'idle', url: null });
  const magicSeq = useRef(0);

  // —— 1194×834 卡片自适应缩放（对照原型的 fit 逻辑） ——
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const el = hostRef.current;
      if (!el) return;
      const s = Math.min(1, (el.clientWidth - 32) / FRAME_W, (el.clientHeight - 32) / FRAME_H);
      setScale(isFinite(s) && s > 0 ? s : 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (hostRef.current) ro.observe(hostRef.current);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, []);

  useEffect(() => {
    loadSpeechPref();
    setSoundOn(speechEnabled());
    setWorks(loadWorks());
    setImgCfg(loadImgGenConfig());
  }, []);

  /** 进入确认页时后台生成 AI 魔法图（PRD 3.5 终稿视觉）：不阻塞确认，好了才淡入 */
  const startMagic = useCallback((p: SlotProfile) => {
    magicSeq.current += 1;
    const seq = magicSeq.current;
    if (!imgGenReady(imgCfg)) { setMagic({ status: 'idle', url: null }); return; }
    setMagic({ status: 'loading', url: null });
    const finalSvg = sketchSVG(p, { quality: 'final', uid: 'magic', title: workTitle(p) });
    void generateImage(imagePrompt(p), imgCfg, finalSvg).then((url) => {
      if (magicSeq.current !== seq) return; // 槽位已变化，丢弃过期结果
      setMagic(url ? { status: 'ready', url } : { status: 'failed', url: null });
    });
  }, [imgCfg]);

  const cancelMagic = useCallback(() => {
    magicSeq.current += 1;
    setMagic({ status: 'idle', url: null });
  }, []);

  /** 小灵说话：TTS + 字幕 + 记入对话档案 */
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

  // —— ② → ③：沉默/点头即通过，进入唯一的显式确认（同时后台开始 AI 魔法图） ——
  const sketchPass = useCallback(() => {
    if (!profile) return;
    setStage({ name: 'confirm' });
    startMagic(profile);
    say(recapSentence(profile));
  }, [profile, say, startMagic]);

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
    say('好嘞！看我的小魔法——');
  }, [profile, say]);

  const confirmNo = useCallback(() => {
    cancelMagic(); // 槽位要变了，丢弃生成中的魔法图
    setStage({ name: 'fixwhat' });
    say('没关系！哪里要改？指给我看！');
  }, [cancelMagic, say]);

  // —— ④ → ⑤：构建完成即存档（作品档案 + AI 封面），开始玩 ——
  const buildDone = useCallback(() => {
    if (!profile) return;
    const s = buildSpec(profile);
    setSpec(s);
    setDialogue((d) => {
      const rec = saveWork(workId, s.title, profile, s, d, magic.url);
      setWorkId(rec.id);
      setWorks(loadWorks());
      return d;
    });
    setStage({ name: 'play', won: false });
    say(`${celebrateLine(profile)}${controlHint(s).text}`);
  }, [profile, say, workId, magic.url]);

  // 魔法图在构建/游玩期间才回来 → 补写进档案封面
  useEffect(() => {
    if (magic.status !== 'ready' || !magic.url || !workId || !profile || !spec) return;
    saveWork(workId, spec.title, profile, spec, dialogue, magic.url);
    setWorks(loadWorks());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magic.status]);

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
    cancelMagic();
    resetSession();
    setWorks(loadWorks());
    setCaption('');
    setStage({ name: 'home' });
  }, [cancelMagic, resetSession]);

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
        dialogue: dialogue.slice(-6).map((d) => `${d.who === 'kid' ? '孩子' : '小灵'}：${d.text}`),
      },
      null,
      2,
    );
  }, [devOpen, dialogue, profile, stage]);

  return (
    <div className="frame-host" ref={hostRef}>
      <div className="frame-card" style={{ transform: `scale(${scale})` }}>
        <header className="topbar">
          {stage.name !== 'home' ? (
            <button className="home-pill" type="button" onClick={goHome}>
              <IconHome size={18} />
              从头开始
            </button>
          ) : <span className="home-pill-ghost" />}
          <JourneyDots current={journeyIndex(stage)} />
          <div className="topbar-right">
            <button className="sound-pill" type="button" onClick={toggleSound} title="声音开关">
              <IconSound size={20} off={!soundOn} />
            </button>
            <div className="brand-chip">
              <span className="brand-logo"><Mascot size={24} sparks={false} /></span>
              小灵造造
            </div>
          </div>
        </header>

        <main className="stage-area">
          {stage.name !== 'home' && stage.name !== 'listen' && <Bubble text={caption} />}
          {stage.name === 'home' && (
            <WelcomeStage works={works} onStart={startFresh} onPlay={playWork} onIterate={iterateWork} />
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
            <ConfirmStage profile={profile} magic={magic} onYes={confirmYes} onNo={confirmNo} />
          )}
          {stage.name === 'build' && profile && (
            <BuildStage profile={profile} onDone={buildDone} />
          )}
          {stage.name === 'play' && spec && (
            <PlayStage
              spec={spec}
              onWin={gameWon}
              onIterate={iterate}
              onReplay={() => setStage({ name: 'play', won: false })}
              onHome={goHome}
            />
          )}
        </main>

        <button className="dev-toggle" type="button" onClick={() => setDevOpen((o) => !o)} title="设置与家长（孩子界面不可见）">
          <IconGear size={18} />
        </button>
        {devOpen && (
          <SettingsPanel
            cfg={imgCfg}
            magic={magic}
            devInfo={devInfo}
            onSave={(next) => { setImgCfg(next); saveImgGenConfig(next); }}
          />
        )}
      </div>
    </div>
  );
}

/** 设置与家长面板（PRD 第 5 节的雏形）：AI 魔法图配置 + 生成记录查看，孩子界面永不出现 */
function SettingsPanel(props: {
  cfg: ImgGenConfig;
  magic: MagicCover;
  devInfo: string;
  onSave: (cfg: ImgGenConfig) => void;
}) {
  const [draft, setDraft] = useState<ImgGenConfig>(props.cfg);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<ImgGenConfig>) => { setDraft((d) => ({ ...d, ...patch })); setSaved(false); };
  const statusText = !draft.enabled
    ? '已关闭：终稿使用小灵手绘图'
    : imgGenReady(draft)
      ? draft.baseUrl === 'mock'
        ? '演示模式：不发请求，用手绘图模拟 AI 上色'
        : '已配置：确认页会后台生成 AI 魔法图'
      : '未填 API Key：终稿使用小灵手绘图';
  return (
    <div className="dev-panel settings-panel">
      <div className="settings-title">AI 魔法图（图片生成）</div>
      <label className="settings-row">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(e) => set({ enabled: e.target.checked })}
        />
        启用（在确认页后台生成终稿插画，失败自动回退手绘图）
      </label>
      <label className="settings-row">
        <span>API 地址</span>
        <input
          type="text"
          value={draft.baseUrl}
          placeholder="/imggen/v1（同源代理）或 mock（演示）"
          onChange={(e) => set({ baseUrl: e.target.value.trim() })}
        />
      </label>
      <label className="settings-row">
        <span>API Key</span>
        <input
          type="password"
          value={draft.apiKey}
          placeholder="sk-…"
          onChange={(e) => set({ apiKey: e.target.value })}
        />
      </label>
      <label className="settings-row">
        <span>模型</span>
        <input
          type="text"
          value={draft.model}
          onChange={(e) => set({ model: e.target.value.trim() })}
        />
      </label>
      <div className="settings-actions">
        <button
          className="settings-save"
          type="button"
          onClick={() => { props.onSave(draft); setSaved(true); }}
        >
          {saved ? '已保存 ✓' : '保存'}
        </button>
        <span className="settings-status">{statusText}{props.magic.status === 'loading' ? '（生成中…）' : ''}</span>
      </div>
      <div className="settings-title">生成记录（内部骨架）</div>
      <pre className="settings-json">{props.devInfo}</pre>
    </div>
  );
}
