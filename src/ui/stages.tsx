// 六阶段闭环的各个界面（PRD 第 2 节），分镜对照【儿童课程交互原型设计】。
// 全部为呈现组件，流程决策在 App。

import { useEffect, useRef, useState } from 'react';
import type { MagicCover } from '../app/imagegen';
import { sttSupported, startStt } from '../app/speech';
import { characterSVG } from '../art/characters';
import { IconCheck, IconGamepad, IconHand, IconMic, IconPencil, IconReplay, Mascot } from '../art/icons';
import {
  difficultyBadgeSVG, mechanicBadgeSVG, optionSketch, sceneBadgeSVG, sketchSVG,
  toneBadgeSVG, workTitle,
} from '../engine/sketch';
import { buildSteps } from '../engine/story';
import type {
  Divergence, DivergenceOption, SlotName, SlotProfile, WorkRecord,
} from '../engine/types';
import { SketchView } from './bits';

/** 分歧/卡片选项的图形徽章：根据槽位类型渲染对应插画 */
function optionBadge(div: Divergence, opt: DivergenceOption): string {
  if (div.slot === 'subject' && opt.patch.subject) return characterSVG(opt.patch.subject.id);
  if (div.slot === 'scene' && opt.patch.scene) return sceneBadgeSVG(opt.patch.scene.id);
  if (div.slot === 'mechanic' && opt.patch.mechanic) return mechanicBadgeSVG(opt.patch.mechanic);
  if (div.slot === 'tone' && opt.patch.tone) return toneBadgeSVG(opt.patch.tone);
  if (div.slot === 'difficulty') return difficultyBadgeSVG(opt.patch.difficulty === 'hard');
  return characterSVG(undefined);
}

// ---------- 欢迎（原型 WELCOME 分镜：大吉祥物 + 大圆麦克风） ----------

export function WelcomeStage(props: {
  works: WorkRecord[];
  onStart: () => void;
  onPlay: (w: WorkRecord) => void;
  onIterate: (w: WorkRecord) => void;
}) {
  return (
    <div className="stage-welcome">
      <div className="welcome-mascot"><Mascot size={190} /></div>
      <h1 className="welcome-title">你想造个什么呀？</h1>
      <p className="welcome-sub">点一下下面的大圆圈，把你的点子说给我听～</p>
      <button className="mic-orb" type="button" onClick={props.onStart} aria-label="开始说想法">
        <svg width="54" height="54" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M6 11a6 6 0 0 0 12 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <p className="welcome-hint">点一下就开始说话</p>
      {props.works.length > 0 && (
        <div className="shelf">
          <div className="shelf-title">我的作品</div>
          <div className="shelf-row">
            {props.works.slice(0, 4).map((w) => (
              <div key={w.id} className="work-card">
                <button className="work-main" type="button" onClick={() => props.onPlay(w)}>
                  {w.coverUrl
                    ? <img className="work-cover" src={w.coverUrl} alt="" />
                    : <span className="work-art" dangerouslySetInnerHTML={{ __html: characterSVG(w.spec.heroId, 44) }} />}
                  <span className="work-title">{w.title}</span>
                </button>
                <button className="work-edit" type="button" title="接着上次的改" onClick={() => props.onIterate(w)}>
                  <IconPencil size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- ① 语音倾听（原型 LISTENING 分镜；MVP 用文字输入模拟语音，PRD 第 7 节） ----------

const FRESH_CHIPS = [
  { charId: 'dino', text: '我想要恐龙赛跑，恐龙一定要会喷火！' },
  { charId: 'unicorn', text: '独角兽在彩虹上收集星星' },
  { charId: 'ghost', text: '小幽灵的游戏' },
  { charId: 'rocket', text: '火箭在太空躲陨石，要超级快，酷酷的' },
];

const ITERATE_CHIPS = [
  { charId: 'dragon', text: '一定要会喷火' },
  { charId: 'princess', text: '换到城堡里' },
  { charId: 'cat', text: '让小猫也一起来' },
  { charId: 'star', text: '难不难？我要大挑战' },
];

export function ListenStage(props: { iterating: boolean; onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  const [live, setLive] = useState(''); // STT 实时预览片段
  const hasMic = sttSupported();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  // 真实语音输入（PRD 3.1）：支持的浏览器直接说话，最终片段追加进输入框
  useEffect(() => {
    const handle = startStt((t, final) => {
      if (final) { setText((prev) => prev + t); setLive(''); }
      else setLive(t);
    });
    return () => handle?.stop();
  }, []);

  const chips = props.iterating ? ITERATE_CHIPS : FRESH_CHIPS;
  const shown = text + live;
  const submit = () => { props.onSubmit(text + live); setText(''); setLive(''); };
  return (
    <div className="stage-listen">
      <div className="listen-orb" aria-hidden>
        <span className="listen-ring r1" />
        <span className="listen-ring r2" />
        <span className="listen-orb-core">
          <span className="wave w1" /><span className="wave w2" /><span className="wave w3" />
          <span className="wave w4" /><span className="wave w5" />
        </span>
      </div>
      <p className="listen-title">我在认真听哦……</p>
      <div className="transcript-box">
        <textarea
          ref={inputRef}
          className="transcript-input"
          placeholder={
            hasMic
              ? '直接说话，或者打字都可以～'
              : props.iterating ? '想改点什么、加点什么？说吧！' : '把你的点子说出来…（打字模拟说话）'
          }
          value={shown}
          rows={2}
          onChange={(e) => { setText(e.target.value); setLive(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
        />
      </div>
      {shown.trim() && (
        <button className="btn-go" type="button" onClick={submit}>
          <IconCheck size={26} />
          <span className="t-label">对，就是这个！</span>
        </button>
      )}
      <div className="chips">
        {chips.map((c) => (
          <button key={c.text} className="chip" type="button" onClick={() => setText(c.text)}>
            <span className="chip-art" dangerouslySetInnerHTML={{ __html: characterSVG(c.charId, 30) }} />
            <span className="chip-text t-label">{c.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- ② 草图隐式确认（PRD 3.4：沉默即通过，打断才处理） ----------

const PASS_AFTER_MS = 8000;

export function SketchStage(props: {
  profile: SlotProfile;
  /** silent = 沉默计时通过（隐式确认），button = 主动点“好耶” */
  onPass: (source: 'silent' | 'button') => void;
  onInterrupt: () => void;
}) {
  const [left, setLeft] = useState(PASS_AFTER_MS);
  const svg = sketchSVG(props.profile, { quality: 'draft', uid: 'draft' });
  const { onPass } = props;
  useEffect(() => {
    const started = Date.now();
    const iv = setInterval(() => {
      const remain = PASS_AFTER_MS - (Date.now() - started);
      setLeft(remain);
      if (remain <= 0) { clearInterval(iv); onPass('silent'); }
    }, 100);
    return () => clearInterval(iv);
  }, [onPass]);
  return (
    <div className="stage-sketch">
      <div className="proto-card sketch-card pop-in">
        <SketchView svg={svg} />
      </div>
      <div className="quiet-timer" aria-hidden>
        <div className="quiet-timer-fill" style={{ width: `${(left / PASS_AFTER_MS) * 100}%` }} />
      </div>
      <div className="row">
        <button className="btn-go" type="button" onClick={() => props.onPass('button')}>
          <IconCheck size={26} />
          <span className="t-label">好耶，就是这样！</span>
        </button>
        <button className="btn-quiet" type="button" onClick={props.onInterrupt}>
          <IconHand size={24} />
          <span className="t-label">不是这样的</span>
        </button>
      </div>
    </div>
  );
}

// ---------- 打断后：想改哪里（图形卡片，不是开放提问） ----------

export function FixWhatStage(props: {
  profile: SlotProfile;
  onPick: (slot: SlotName) => void;
  onResay: () => void;
}) {
  const p = props.profile;
  const cards: { slot: SlotName; art: string; label: string }[] = [
    { slot: 'subject', art: characterSVG(p.subject?.id), label: '换主角' },
    { slot: 'scene', art: sceneBadgeSVG(p.scene?.id ?? 'meadow'), label: '换地方' },
    { slot: 'mechanic', art: '', label: '换玩法' },
  ];
  return (
    <div className="stage-fixwhat">
      <div className="option-row">
        {cards.map((c) => (
          <button key={c.slot} className="pick-card slide-up" type="button" onClick={() => props.onPick(c.slot)}>
            {c.slot === 'mechanic'
              ? <span className="pick-art pick-art-icon"><IconGamepad size={62} /></span>
              : <span className="pick-art" dangerouslySetInnerHTML={{ __html: c.art }} />}
            <span className="pick-label t-label">{c.label}</span>
          </button>
        ))}
        <button className="pick-card slide-up" type="button" onClick={props.onResay}>
          <span className="pick-art pick-art-icon"><IconMic size={62} /></span>
          <span className="pick-label t-label">我再说一遍</span>
        </button>
      </div>
      <p className="soft-hint">点一个你想改的～不用着急</p>
    </div>
  );
}

// ---------- 分歧处理（PRD 3.3：双草图并排优先，图卡选择题兜底） ----------

export function DivergeStage(props: {
  profile: SlotProfile;
  divergence: Divergence;
  onPick: (opt: DivergenceOption) => void;
}) {
  const { divergence, profile } = props;
  if (divergence.kind === 'visual') {
    return (
      <div className="stage-diverge">
        <div className="option-row">
          {divergence.options.map((opt, i) => (
            <button
              key={opt.label}
              className="proto-card option-sketch slide-up"
              style={{ animationDelay: `${i * 0.08}s` }}
              type="button"
              onClick={() => props.onPick(opt)}
            >
              <SketchView svg={optionSketch(profile, opt.patch, `opt${i}`)} />
              <span className="option-label-bar">
                <span className="option-badge-art" dangerouslySetInnerHTML={{ __html: optionBadge(divergence, opt) }} />
                <span className="t-label">{opt.label}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="soft-hint">点一个你更喜欢的～不用着急</p>
      </div>
    );
  }
  return (
    <div className="stage-diverge">
      <div className="option-row">
        {divergence.options.map((opt, i) => (
          <button
            key={opt.label}
            className="pick-card slide-up"
            style={{ animationDelay: `${i * 0.08}s` }}
            type="button"
            onClick={() => props.onPick(opt)}
          >
            <span className="pick-art" dangerouslySetInnerHTML={{ __html: optionBadge(divergence, opt) }} />
            <span className="pick-label t-label">{opt.label}</span>
          </button>
        ))}
      </div>
      <p className="soft-hint">点一个你更喜欢的～不用着急</p>
    </div>
  );
}

// ---------- ③ 复述确认＋终稿视觉（唯一显式确认关卡，PRD 3.5） ----------

export function ConfirmStage(props: {
  profile: SlotProfile;
  magic: MagicCover;
  onYes: () => void;
  onNo: () => void;
}) {
  const svg = sketchSVG(props.profile, {
    quality: 'final',
    uid: 'final',
    title: workTitle(props.profile),
  });
  const { magic } = props;
  return (
    <div className="stage-confirm">
      <span className="confirm-badge">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#6A4A12" aria-hidden>
          <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.7 5.7 21l2.3-7.2-6-4.4h7.6z" />
        </svg>
        最后确认一下
      </span>
      <div className="proto-card confirm-card pop-in">
        <div className="magic-stack">
          <SketchView svg={svg} />
          {magic.status === 'ready' && magic.url && (
            <img className="magic-img" src={magic.url} alt="AI 魔法图" />
          )}
        </div>
      </div>
      {magic.status === 'loading' && (
        <span className="magic-chip loading">✦ 小灵正在施魔法上色…</span>
      )}
      {magic.status === 'ready' && (
        <span className="magic-chip ready">✦ 魔法图来啦！</span>
      )}
      <p className="confirm-sub">对的话我就开始造啦，要用点小魔法哦～</p>
      <div className="row">
        <button className="btn-quiet" type="button" onClick={props.onNo}>
          <IconReplay size={22} color="#8A7A6E" />
          <span className="t-label">再改改</span>
        </button>
        <button className="btn-primary" type="button" onClick={props.onYes}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 12.5l5 5 11-12" />
          </svg>
          <span className="t-label">对！开始造</span>
        </button>
      </div>
    </div>
  );
}

// ---------- ④ 深度构建（原型 BUILD 分镜：大字进度 + 步骤清单，PRD 3.6） ----------

export function BuildStage(props: { profile: SlotProfile; onDone: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const steps = useRef(buildSteps(props.profile)).current;
  const { onDone } = props;
  useEffect(() => {
    if (stepIdx >= steps.length) { onDone(); return; }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 1000);
    return () => clearTimeout(t);
  }, [stepIdx, steps.length, onDone]);
  return (
    <div className="stage-build">
      <div className="build-scene">
        <span className="build-mascot float"><Mascot size={130} /></span>
        <span className="build-hero bounce" dangerouslySetInnerHTML={{ __html: characterSVG(props.profile.subject?.id, 96) }} />
      </div>
      <p className="build-line">{steps[Math.min(stepIdx, steps.length - 1)]}</p>
      <div className="build-bar">
        <div
          className="build-bar-fill"
          style={{ width: `${Math.min(100, (stepIdx / steps.length) * 100)}%` }}
        />
      </div>
      <div className="build-list">
        {steps.map((text, i) => {
          const done = i < stepIdx;
          const active = i === stepIdx;
          return (
            <div key={text} className={`build-item ${done ? 'done' : active ? 'active' : ''}`}>
              <span className="build-item-dot">{done ? '✓' : active ? '·' : ''}</span>
              {text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
