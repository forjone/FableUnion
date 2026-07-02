// 六阶段闭环的各个界面（PRD 第 2 节）。全部为呈现组件，流程决策在 App。

import { useEffect, useRef, useState } from 'react';
import { characterSVG } from '../art/characters';
import {
  IconCheck, IconGamepad, IconHand, IconMic, IconPencil, IconSparkle, Mascot,
} from '../art/icons';
import {
  difficultyBadgeSVG, mechanicBadgeSVG, optionSketch, sceneBadgeSVG, sketchSVG,
  toneBadgeSVG, workTitle,
} from '../engine/sketch';
import { buildSteps } from '../engine/story';
import type {
  Divergence, DivergenceOption, SlotName, SlotProfile, WorkRecord,
} from '../engine/types';
import { BigButton, Card, SketchView } from './bits';

/** 分歧/卡片选项的图形徽章：根据槽位类型渲染对应插画 */
function optionBadge(div: Divergence, opt: DivergenceOption): string {
  if (div.slot === 'subject' && opt.patch.subject) return characterSVG(opt.patch.subject.id);
  if (div.slot === 'scene' && opt.patch.scene) return sceneBadgeSVG(opt.patch.scene.id);
  if (div.slot === 'mechanic' && opt.patch.mechanic) return mechanicBadgeSVG(opt.patch.mechanic);
  if (div.slot === 'tone' && opt.patch.tone) return toneBadgeSVG(opt.patch.tone);
  if (div.slot === 'difficulty') return difficultyBadgeSVG(opt.patch.difficulty === 'hard');
  return characterSVG(undefined);
}

// ---------- ① 语音倾听（MVP：文字输入模拟语音，PRD 第 7 节） ----------

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  const chips = props.iterating ? ITERATE_CHIPS : FRESH_CHIPS;
  const submit = () => { props.onSubmit(text); setText(''); };
  return (
    <Card className="stage-listen">
      <div className="listen-mascot">
        <Mascot size={96} waving />
        <div className="listen-ears" aria-hidden>
          <span /><span /><span /><span /><span />
        </div>
      </div>
      <textarea
        ref={inputRef}
        className="speech-input"
        placeholder="把你的想法说出来…（打字模拟说话）"
        value={text}
        rows={2}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
        }}
      />
      <BigButton icon={<IconSparkle size={30} />} label="说完啦！" kind="ok" onClick={submit} />
      <div className="chips">
        {chips.map((c) => (
          <button key={c.text} className="chip" type="button" onClick={() => setText(c.text)}>
            <span className="chip-art" dangerouslySetInnerHTML={{ __html: characterSVG(c.charId, 34) }} />
            <span className="chip-text">{c.text}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ---------- ② 草图隐式确认（PRD 3.4：沉默即通过，打断才处理） ----------

const PASS_AFTER_MS = 8000;

export function SketchStage(props: {
  profile: SlotProfile;
  onPass: () => void;
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
      if (remain <= 0) { clearInterval(iv); onPass(); }
    }, 100);
    return () => clearInterval(iv);
  }, [onPass]);
  return (
    <Card className="stage-sketch">
      <div className="polaroid">
        <SketchView svg={svg} className="sketch-pop" />
        <span className="polaroid-tape" aria-hidden />
      </div>
      <div className="quiet-timer" aria-hidden>
        <div className="quiet-timer-fill" style={{ width: `${(left / PASS_AFTER_MS) * 100}%` }} />
      </div>
      <div className="row">
        <BigButton icon={<IconCheck size={30} />} label="好耶！" kind="ok" onClick={props.onPass} />
        <BigButton icon={<IconHand size={30} />} label="不是这样的" kind="warn" onClick={props.onInterrupt} />
      </div>
    </Card>
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
    <Card className="stage-fixwhat">
      <div className="option-row">
        {cards.map((c) => (
          <button key={c.slot} className="pick-card" type="button" onClick={() => props.onPick(c.slot)}>
            {c.slot === 'mechanic'
              ? <span className="pick-art pick-art-icon"><IconGamepad size={64} /></span>
              : <span className="pick-art" dangerouslySetInnerHTML={{ __html: c.art }} />}
            <span className="pick-label">{c.label}</span>
          </button>
        ))}
        <button className="pick-card" type="button" onClick={props.onResay}>
          <span className="pick-art pick-art-icon"><IconMic size={64} /></span>
          <span className="pick-label">我再说一遍</span>
        </button>
      </div>
    </Card>
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
      <Card className="stage-diverge">
        <div className="option-row">
          {divergence.options.map((opt, i) => (
            <button
              key={opt.label}
              className={`option-sketch tilt-${i % 2 ? 'r' : 'l'}`}
              type="button"
              onClick={() => props.onPick(opt)}
            >
              <SketchView svg={optionSketch(profile, opt.patch, `opt${i}`)} />
              <span className="option-badge">
                <span className="option-badge-art" dangerouslySetInnerHTML={{ __html: optionBadge(divergence, opt) }} />
                <span className="pick-label">{opt.label}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>
    );
  }
  return (
    <Card className="stage-diverge">
      <div className="option-row">
        {divergence.options.map((opt) => (
          <button key={opt.label} className="pick-card" type="button" onClick={() => props.onPick(opt)}>
            <span className="pick-art" dangerouslySetInnerHTML={{ __html: optionBadge(divergence, opt) }} />
            <span className="pick-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ---------- ③ 复述确认＋终稿视觉（唯一显式确认关卡，PRD 3.5） ----------

export function ConfirmStage(props: {
  profile: SlotProfile;
  onYes: () => void;
  onNo: () => void;
}) {
  const svg = sketchSVG(props.profile, {
    quality: 'final',
    uid: 'final',
    title: workTitle(props.profile),
  });
  return (
    <Card className="stage-confirm">
      <SketchView svg={svg} className="sketch-pop" />
      <div className="row">
        <BigButton icon={<IconCheck size={30} />} label="对！就是这个！" kind="ok" onClick={props.onYes} />
        <BigButton icon={<IconHand size={30} />} label="还不对" kind="warn" onClick={props.onNo} />
      </div>
    </Card>
  );
}

// ---------- ④ 深度构建（故事化进度，PRD 3.6） ----------

export function BuildStage(props: { profile: SlotProfile; onDone: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const steps = useRef(buildSteps(props.profile)).current;
  const { onDone } = props;
  useEffect(() => {
    if (stepIdx >= steps.length) { onDone(); return; }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 950);
    return () => clearTimeout(t);
  }, [stepIdx, steps.length, onDone]);
  return (
    <Card className="stage-build">
      <div className="build-scene">
        <span className="build-hero bounce" dangerouslySetInnerHTML={{ __html: characterSVG(props.profile.subject?.id, 110) }} />
        <span className="build-mascot"><Mascot size={72} waving /></span>
      </div>
      <div className="build-step">{steps[Math.min(stepIdx, steps.length - 1)]}</div>
      <div className="build-bar">
        <div
          className="build-bar-fill"
          style={{ width: `${Math.min(100, ((stepIdx + 1) / steps.length) * 100)}%` }}
        />
      </div>
    </Card>
  );
}

// ---------- 小屋（作品档案，PRD 3.7） ----------

export function HomeStage(props: {
  works: WorkRecord[];
  onStart: () => void;
  onPlay: (w: WorkRecord) => void;
  onIterate: (w: WorkRecord) => void;
}) {
  return (
    <Card className="stage-home">
      <div className="home-mascot"><Mascot size={120} waving /></div>
      <h1 className="home-title">奇想造物屋</h1>
      <p className="home-sub">把你脑袋里的奇思妙想，变成真的游戏！</p>
      <BigButton icon={<IconMic size={34} />} label="说出你的想法" kind="primary" onClick={props.onStart} className="home-start" />
      {props.works.length > 0 && (
        <div className="shelf">
          <div className="shelf-title">我的作品</div>
          <div className="shelf-row">
            {props.works.map((w) => (
              <div key={w.id} className="work-card">
                <button className="work-main" type="button" onClick={() => props.onPlay(w)}>
                  <span className="work-art" dangerouslySetInnerHTML={{ __html: characterSVG(w.spec.heroId, 56) }} />
                  <span className="work-title">{w.title}</span>
                </button>
                <button
                  className="work-edit"
                  type="button"
                  title="接着上次的改"
                  onClick={() => props.onIterate(w)}
                >
                  <IconPencil size={22} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
