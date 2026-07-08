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
import { generateGenome, llmReady, normalizeUtterance } from '../app/llm';
import { proceduralGenome, type Genome } from '../engine/genome';
import { record } from '../app/metrics';
import { checkText, logSafety } from '../app/safety';
import { loadSpeechPref, setSpeechEnabled, speak, speechEnabled, stopSpeaking } from '../app/speech';
import type { AccessoryId } from '../art/characters';
import { buildSiteSpec, buildSpec, controlHint } from '../engine/game';
import { suggestNext } from '../engine/suggest';
import {
  applyOption, parseUtterance, pendingDivergence, buildFixDivergence, slotsToJSON,
} from '../engine/parser';
import { sketchSVG, workTitle } from '../engine/sketch';
import {
  celebrateLine, iterateInvite, listenPrompt, nudgeLine, recapSentence, sketchNarration,
} from '../engine/story';
import type {
  DialogueEntry, Divergence, DivergenceOption, GameSpec, SiteSpec, SlotName, SlotProfile,
  WorkRecord, WorkSpec,
} from '../engine/types';
import { IconGear, IconHome, IconSound, JourneyDots, Mascot } from '../art/icons';
import { Bubble } from './bits';
import { PlayStage } from './GameCanvas';
import { ParentPortal, type AgeTier } from './ParentPortal';
import { SiteStage } from './SiteStage';
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

// —— 作品分享：spec+profile 编入 URL hash，打开即玩（部署后即为可发送的链接） ——

interface SharePayload { spec: WorkSpec; profile: SlotProfile; genome?: Genome | null }

function encodeShare(payload: SharePayload): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodeShare(): SharePayload | null {
  try {
    const m = window.location.hash.match(/#w=([A-Za-z0-9+/=]+)/);
    if (!m) return null;
    const json = decodeURIComponent(escape(atob(m[1])));
    const p = JSON.parse(json) as SharePayload;
    return p.spec && p.profile ? p : null;
  } catch {
    return null;
  }
}

function loadTier(): AgeTier {
  try { return localStorage.getItem('fable.tier') === 'young' ? 'young' : 'old'; } catch { return 'old'; }
}

export default function App() {
  const [stage, setStage] = useState<Stage>({ name: 'home' });
  const [profile, setProfile] = useState<SlotProfile | null>(null);
  const [translations, setTranslations] = useState<string[]>([]);
  const [changed, setChanged] = useState<SlotName[]>([]);
  const [dialogue, setDialogue] = useState<DialogueEntry[]>([]);
  const [spec, setSpec] = useState<WorkSpec | null>(null);
  const [workId, setWorkId] = useState<string | null>(null);
  const [iterating, setIterating] = useState(false);
  const [caption, setCaption] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [portalOpen, setPortalOpen] = useState(false);
  const [works, setWorks] = useState<WorkRecord[]>([]);
  const [imgCfg, setImgCfg] = useState<ImgGenConfig>(DEFAULT_IMGGEN);
  const [magic, setMagic] = useState<MagicCover>({ status: 'idle', url: null });
  const [tier, setTier] = useState<AgeTier>('old');
  const magicSeq = useRef(0);
  // 作品基因（生成的剧本）：确认时开始生成，构建结束时就绪
  const [genome, setGenome] = useState<Genome | null>(null);
  const genomeRef = useRef<Promise<Genome> | null>(null);

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

  /** 小灵说话：TTS + 字幕 + 记入对话档案 */
  const say = useCallback((text: string) => {
    setCaption(text);
    speak(text);
    setDialogue((d) => [...d, { who: 'ai', text, at: Date.now() }]);
  }, []);

  useEffect(() => {
    loadSpeechPref();
    setSoundOn(speechEnabled());
    setWorks(loadWorks());
    setImgCfg(loadImgGenConfig());
    setTier(loadTier());
    // 分享链接直达游玩（客人模式）
    const shared = decodeShare();
    if (shared) {
      setProfile(shared.profile);
      setSpec(shared.spec);
      setGenome(shared.genome ?? proceduralGenome(shared.profile));
      setIterating(true);
      setStage({ name: 'play', won: false });
      say(`${shared.spec.title}来啦！这是好朋友分享给你的作品！`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /** 进入确认页时后台生成 AI 魔法图（PRD 3.5 终稿视觉）：不阻塞确认，好了才淡入 */
  const startMagic = useCallback((p: SlotProfile) => {
    magicSeq.current += 1;
    const seq = magicSeq.current;
    if (!imgGenReady(imgCfg)) { setMagic({ status: 'idle', url: null }); return; }
    setMagic({ status: 'loading', url: null });
    const finalSvg = sketchSVG(p, { quality: 'final', uid: 'magic', title: workTitle(p) });
    void generateImage(imagePrompt(p), imgCfg, finalSvg).then((url) => {
      if (magicSeq.current !== seq) return; // 槽位已变化，丢弃过期结果
      record(url ? 'magic_ready' : 'magic_failed');
      setMagic(url ? { status: 'ready', url } : { status: 'failed', url: null });
    });
  }, [imgCfg]);

  const cancelMagic = useCallback(() => {
    magicSeq.current += 1;
    setMagic({ status: 'idle', url: null });
  }, []);

  const showDivergence = useCallback((div: Divergence, prefix?: string[]) => {
    record(div.kind === 'visual' ? 'divergence_visual' : 'divergence_cards');
    setStage({ name: 'diverge', div });
    say([...(prefix ?? []), div.prompt].join('，'));
  }, [say]);

  // —— ① → ②：听完一句话（安全过滤 → LLM 归一 → 真实拆解） ——
  const goSketch = useCallback(
    (p: SlotProfile, tr: string[], ch: SlotName[]) => {
      setStage({ name: 'sketch' });
      say(sketchNarration(p, tr, ch).join('，'));
    },
    [say],
  );

  const submitUtterance = useCallback(
    (text: string, forceBase?: SlotProfile) => {
      if (!text.trim()) { say(nudgeLine()); return; }
      hear(text);
      // 内容安全过滤（PRD 第 5 节）：温柔引导换主意，并记入安全日志
      const chk = checkText(text);
      if (!chk.ok) {
        logSafety(chk.label, text);
        record('safety_block');
        say(chk.line);
        return;
      }
      void (async () => {
        let input = text;
        if (llmReady(imgCfg)) {
          const normalized = await normalizeUtterance(text, imgCfg);
          if (normalized) input = normalized;
        }
        const res = parseUtterance(input, forceBase ?? (iterating ? profile : null));
        setProfile(res.profile);
        setTranslations(res.translations);
        setChanged(res.changed);
        if (res.divergence) showDivergence(res.divergence, res.translations);
        else goSketch(res.profile, res.translations, res.changed);
      })();
    },
    [goSketch, hear, imgCfg, iterating, profile, say, showDivergence],
  );

  // —— 分歧：指一个 → 立即回到草图；若还有下一个关键缺失，继续处理下一个 ——
  const pickOption = useCallback(
    (opt: DivergenceOption) => {
      if (!profile || stage.name !== 'diverge') return;
      const next = applyOption(profile, stage.div, opt);
      setProfile(next);
      const pend = pendingDivergence(next);
      if (pend) {
        showDivergence(pend);
      } else {
        goSketch(next, translations, changed);
        setTranslations([]);
      }
    },
    [changed, goSketch, profile, showDivergence, stage, translations],
  );

  // —— ② → ③：沉默/点头即通过，进入唯一的显式确认（同时后台开始 AI 魔法图） ——
  const sketchPass = useCallback((source: 'silent' | 'button') => {
    if (!profile) return;
    record(source === 'silent' ? 'sketch_silent_pass' : 'sketch_button_pass');
    setStage({ name: 'confirm' });
    startMagic(profile);
    say(recapSentence(profile));
  }, [profile, say, startMagic]);

  const sketchInterrupt = useCallback(() => {
    stopSpeaking();
    record('sketch_interrupt');
    setStage({ name: 'fixwhat' });
    say('哦哦，哪里不对呀？指给我看！');
  }, [say]);

  const fixPick = useCallback(
    (slot: SlotName) => {
      if (!profile) return;
      showDivergence(buildFixDivergence(profile, slot));
    },
    [profile, showDivergence],
  );

  const fixResay = useCallback(() => {
    setIterating(true);
    setStage({ name: 'listen' });
    say(listenPrompt(true));
  }, [say]);

  // —— ③ → ④：孩子说“对！”，才开始耗费构建资源 ——
  // 构建动画的同时并行生成作品基因（LLM 创作剧本，失败回退程序化生成）
  const confirmYes = useCallback(() => {
    if (!profile) return;
    record('confirm_yes');
    genomeRef.current = generateGenome(profile, imgCfg);
    setStage({ name: 'build' });
    say('好嘞！看我的小魔法——');
  }, [imgCfg, profile, say]);

  const confirmNo = useCallback(() => {
    record('confirm_no');
    cancelMagic(); // 槽位要变了，丢弃生成中的魔法图
    setStage({ name: 'fixwhat' });
    say('没关系！哪里要改？指给我看！');
  }, [cancelMagic, say]);

  // —— ④ → ⑤：构建完成，取回生成的剧本，存档（档案 + AI 封面 + 基因），开始玩 ——
  const buildDone = useCallback(() => {
    if (!profile) return;
    void (async () => {
      // 剧本通常在构建动画期间已生成完；最多再等 2.5 秒，否则用程序化剧本
      const pending = genomeRef.current ?? Promise.resolve(proceduralGenome(profile));
      const g = await Promise.race([
        pending,
        new Promise<Genome>((r) => setTimeout(() => r(proceduralGenome(profile)), 2500)),
      ]);
      setGenome(g);
      const s: WorkSpec = profile.creation_type === 'website' ? buildSiteSpec(profile) : buildSpec(profile);
      setSpec(s);
      record('build_done');
      setDialogue((d) => {
        const rec = saveWork(workId, s.title, profile, s, d, magic.url, g);
        setWorkId(rec.id);
        setWorks(loadWorks());
        return d;
      });
      setStage({ name: 'play', won: false });
      if (s.type === 'website') {
        say(`${g.site?.welcomeLine ?? celebrateLine(profile)}这是一个真的网页哦，可以保存下来送给别人！`);
      } else {
        say(`${g.game?.intro ?? celebrateLine(profile)}${controlHint(s as GameSpec).text}`);
      }
    })();
  }, [profile, say, workId, magic.url]);

  // 魔法图在构建/游玩期间才回来 → 补写进档案封面
  useEffect(() => {
    if (magic.status !== 'ready' || !magic.url || !workId || !profile || !spec) return;
    saveWork(workId, spec.title, profile, spec, dialogue, magic.url, genome);
    setWorks(loadWorks());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magic.status]);

  const gameWon = useCallback(() => {
    setStage((st) => (st.name === 'play' ? { name: 'play', won: true } : st));
    if (profile) say(`${celebrateLine(profile)}${iterateInvite()}`);
  }, [profile, say]);

  // —— 小灵主动提议：作品完成后点燃下一个想法 ——
  const suggestion = useMemo(
    () => (stage.name === 'play' && profile ? suggestNext(profile) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage.name === 'play', profile],
  );
  const suggestionShown = useRef<string | null>(null);
  useEffect(() => {
    if (stage.name === 'play' && stage.won && suggestion && suggestionShown.current !== suggestion.say) {
      suggestionShown.current = suggestion.say;
      record('suggestion_shown');
    }
  }, [stage, suggestion]);

  const acceptSuggestion = useCallback((sayText: string) => {
    if (!profile) return;
    stopSpeaking();
    record('suggestion_accept');
    record('iterate');
    setIterating(true);
    submitUtterance(sayText, profile);
  }, [profile, submitUtterance]);

  // —— 装扮：更新 spec 并写回档案 ——
  const dressUp = useCallback((acc: AccessoryId | null) => {
    setSpec((s) => {
      if (!s) return s;
      const next = { ...s, accessory: acc };
      if (workId && profile) saveWork(workId, next.title, profile, next, dialogue, magic.url, genome);
      setWorks(loadWorks());
      return next;
    });
  }, [dialogue, genome, magic.url, profile, workId]);

  // —— ⑤ → ①：继续迭代，带着已有档案回到倾听 ——
  const iterate = useCallback(() => {
    stopSpeaking();
    record('iterate');
    setIterating(true);
    setStage({ name: 'listen' });
    say(listenPrompt(true));
  }, [say]);

  const shareWork = useCallback(() => {
    if (!spec || !profile) return;
    const url = `${window.location.origin}${window.location.pathname}#w=${encodeShare({ spec, profile, genome })}`;
    const done = () => say('链接复制好啦！发给好朋友，打开就能玩！');
    try {
      void navigator.clipboard.writeText(url).then(done, done);
    } catch {
      done();
    }
  }, [profile, say, spec]);

  const goHome = useCallback(() => {
    stopSpeaking();
    cancelMagic();
    setGenome(null);
    genomeRef.current = null;
    resetSession();
    setWorks(loadWorks());
    setCaption('');
    window.location.hash = '';
    setStage({ name: 'home' });
  }, [cancelMagic, resetSession]);

  const startFresh = useCallback(() => {
    resetSession();
    record('session_start');
    setStage({ name: 'listen' });
    say(listenPrompt(false));
  }, [resetSession, say]);

  const playWork = useCallback((w: WorkRecord) => {
    setProfile(w.profile);
    setSpec(w.spec);
    setWorkId(w.id);
    setDialogue(w.dialogue ?? []);
    setGenome(w.genome ?? proceduralGenome(w.profile));
    setIterating(true);
    setStage({ name: 'play', won: false });
    if (w.spec.type === 'website') say(`${w.title}来啦！`);
    else say(`${w.title}来啦！${controlHint(w.spec as GameSpec).text}`);
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

  const setTierPersist = useCallback((t: AgeTier) => {
    setTier(t);
    try { localStorage.setItem('fable.tier', t); } catch { /* ignore */ }
  }, []);

  const devInfo = useMemo(() => {
    if (!portalOpen) return '';
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
  }, [portalOpen, dialogue, profile, stage]);

  return (
    <div className="frame-host" ref={hostRef}>
      <div className={`frame-card${tier === 'young' ? ' tier-young' : ''}`} style={{ transform: `scale(${scale})` }}>
        <header className="topbar">
          {stage.name !== 'home' ? (
            <button className="home-pill" type="button" onClick={goHome}>
              <IconHome size={18} />
              <span className="t-label">从头开始</span>
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
          {stage.name === 'play' && spec && spec.type === 'website' && profile && (
            <SiteStage
              spec={spec as SiteSpec}
              profile={profile}
              genome={genome?.site ?? null}
              suggestion={suggestion}
              onDress={dressUp}
              onSuggest={acceptSuggestion}
              onIterate={iterate}
              onHome={goHome}
            />
          )}
          {stage.name === 'play' && spec && spec.type !== 'website' && (
            <PlayStage
              spec={spec as GameSpec}
              won={stage.won}
              genome={genome?.game ?? null}
              suggestion={suggestion}
              onWin={gameWon}
              onNextLevel={(level) => {
                record('replay');
                setStage({ name: 'play', won: false });
                const names = genome?.game?.levelNames ?? [];
                const name = names[(level - 2) % Math.max(1, names.length)];
                say(name ? `第${level}关：${name}！加油！` : `第${level}关来啦！会更快更难哦，加油！`);
              }}
              onDuel={() => {
                record('duel_start');
                setStage({ name: 'play', won: false });
                say('双人对决！左边点左半屏，右边点右半屏，看谁先到终点！');
              }}
              onDress={dressUp}
              onSuggest={acceptSuggestion}
              onIterate={iterate}
              onShare={shareWork}
              onReplay={() => { record('replay'); setStage({ name: 'play', won: false }); }}
              onHome={goHome}
            />
          )}
        </main>

        <button className="dev-toggle" type="button" onClick={() => setPortalOpen(true)} title="家长小屋（孩子界面不可见）">
          <IconGear size={18} />
        </button>
        {portalOpen && (
          <ParentPortal
            cfg={imgCfg}
            tier={tier}
            works={works}
            devInfo={devInfo}
            onSaveCfg={(next) => { setImgCfg(next); saveImgGenConfig(next); }}
            onTier={setTierPersist}
            onClose={() => setPortalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
