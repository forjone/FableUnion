// 深度构建模块（PRD 3.6）：由槽位 JSON 参数化生成可玩的 Canvas 小游戏。
// 素材与草图共用同一套矢量插画（角色/道具栅格化后绘制），保证“草图承诺 = 成品兑现”。
// 儿童友好原则：永不出现“失败惩罚”，最坏情况也只是打个趔趄再来。

import { characterSVG } from '../art/characters';
import { star5 } from '../art/props';
import { svgToImage, wrapPropSVG } from '../art/raster';
import { SCENE_THEMES, TONE_ACCENT, themeOf, workTitle } from './sketch';
import type { GameSpec, SlotProfile } from './types';

export const GAME_W = 640;
export const GAME_H = 400;
const GROUND = 320;
const SX = GAME_W / 480; // 草图主题坐标 → 游戏坐标
const SY = GAME_H / 320;

export function buildSpec(profile: SlotProfile): GameSpec {
  return {
    title: workTitle(profile),
    mechanic: profile.mechanic ?? 'race',
    heroId: profile.subject?.id ?? 'star',
    heroLabel: profile.subject?.label ?? '小主角',
    companionId: profile.companion?.id ?? null,
    sceneId: profile.scene?.id ?? 'meadow',
    tone: profile.tone ?? 'lively',
    effect: profile.key_detail?.effect ?? null,
    difficulty: profile.difficulty,
  };
}

// ---------- 素材集：把矢量插画栅格化给 Canvas 用 ----------

export interface SpriteSet {
  hero: HTMLImageElement;
  companion: HTMLImageElement | null;
  rivals: HTMLImageElement[];
  item: HTMLImageElement;
  obstacle: HTMLImageElement;
  props: { img: HTMLImageElement; x: number; y: number; s: number }[];
}

const RIVAL_POOL = ['bunny', 'cat', 'dog', 'frog'];

export async function loadSprites(spec: GameSpec): Promise<SpriteSet> {
  const theme = themeOf(spec.sceneId);
  const rivalIds = (spec.companionId ? [spec.companionId] : [])
    .concat(RIVAL_POOL.filter((r) => r !== spec.heroId && r !== spec.companionId))
    .slice(0, 2);
  const [hero, companion, item, obstacle, ...rest] = await Promise.all([
    svgToImage(characterSVG(spec.heroId, 160)),
    spec.companionId ? svgToImage(characterSVG(spec.companionId, 160)) : Promise.resolve(null),
    svgToImage(wrapPropSVG(star5(0, 0, 1.6))),
    svgToImage(wrapPropSVG(theme.obstacle(0, 0, 1.5))),
    ...rivalIds.map((r) => svgToImage(characterSVG(r, 160))),
    ...theme.props.map((p) => svgToImage(wrapPropSVG(p.fn(0, 0, 1.1)))),
  ]);
  const rivals = rest.slice(0, rivalIds.length) as HTMLImageElement[];
  const propImgs = rest.slice(rivalIds.length) as HTMLImageElement[];
  return {
    hero,
    companion,
    rivals,
    item,
    obstacle,
    props: theme.props.map((p, i) => ({ img: propImgs[i], x: p.x * SX, y: p.y * SY, s: p.s })),
  };
}

// ---------- 迷你音效（WebAudio 合成，无素材依赖） ----------

let audioCtx: AudioContext | null = null;
let muted = false;
export function setMuted(m: boolean) { muted = m; }

function beep(freq: number, dur = 0.12, type: OscillatorType = 'sine', gain = 0.08) {
  if (muted) return;
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch { /* 无声也不影响玩 */ }
}

const sfx = {
  collect: () => beep(880, 0.1, 'triangle'),
  jump: () => beep(420, 0.15, 'square', 0.05),
  pop: () => beep(620, 0.08, 'triangle'),
  bump: () => beep(160, 0.2, 'sawtooth', 0.05),
  win: () => { beep(523, 0.15); setTimeout(() => beep(659, 0.15), 130); setTimeout(() => beep(784, 0.3), 260); },
};

// ---------- 运行时 ----------

type ParticleKind = 'flame' | 'spark' | 'puff' | 'dot';
interface Particle { kind: ParticleKind; x: number; y: number; vx: number; vy: number; life: number; color?: string; size: number }
type Control = 'left' | 'right' | 'action';

export interface RuntimeHooks {
  onWin: () => void;
}

export class GameRuntime {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private running = false;
  private won = false;
  private t = 0;

  private heroX = GAME_W / 2;
  private heroY = GROUND - 34;
  private heroVy = 0;
  private wobble = 0;
  private held: Record<Control, boolean> = { left: false, right: false, action: false };

  // race
  private progress = 0;
  private speed = 0;
  private rivals: { p: number; v: number }[] = [];
  // collect / dodge
  private drops: { x: number; y: number; v: number; isItem: boolean; caught?: boolean }[] = [];
  private score = 0;
  private surviveT = 0;
  // jump
  private obstacles: { x: number; passed?: boolean }[] = [];
  private passed = 0;
  private scroll = 0;
  // pop
  private bubbles: { x: number; y: number; r: number; life: number }[] = [];

  private particles: Particle[] = [];
  private confetti: Particle[] = [];

  private goal: number;
  private hard: boolean;
  private accent: string;
  private theme: (typeof SCENE_THEMES)[string];

  private keyDown = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft') this.held.left = true;
    else if (e.code === 'ArrowRight') this.held.right = true;
    else if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); this.press('action'); }
  };
  private keyUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft') this.held.left = false;
    else if (e.code === 'ArrowRight') this.held.right = false;
    else if (e.code === 'Space' || e.code === 'ArrowUp') this.held.action = false;
  };
  private onPointer = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * GAME_W;
    const y = ((e.clientY - rect.top) / rect.height) * GAME_H;
    this.pointer(x, y);
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private spec: GameSpec,
    private sprites: SpriteSet,
    private hooks: RuntimeHooks,
  ) {
    canvas.width = GAME_W;
    canvas.height = GAME_H;
    this.ctx = canvas.getContext('2d')!;
    this.hard = spec.difficulty === 'hard';
    this.accent = TONE_ACCENT[spec.tone].banner;
    this.theme = themeOf(spec.sceneId);
    this.goal = { race: 1, collect: this.hard ? 12 : 8, dodge: this.hard ? 22 : 15, jump: this.hard ? 10 : 6, pop: this.hard ? 15 : 10 }[
      spec.mechanic
    ];
    if (spec.mechanic === 'race') {
      this.rivals = this.sprites.rivals.map((_, i) => ({ p: 0, v: (this.hard ? 0.085 : 0.062) + i * 0.008 }));
      this.heroX = 70;
    }
    canvas.addEventListener('pointerdown', this.onPointer);
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
  }

  start() {
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.t += dt;
      this.update(dt);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener('pointerdown', this.onPointer);
    window.removeEventListener('keydown', this.keyDown);
    window.removeEventListener('keyup', this.keyUp);
  }

  press(c: Control) {
    this.held[c] = true;
    if (c === 'action') this.action();
  }
  release(c: Control) { this.held[c] = false; }

  private action() {
    if (this.won) return;
    const m = this.spec.mechanic;
    if (m === 'race') {
      this.speed += this.spec.effect === 'fire' ? 0.075 : 0.06;
      if (this.spec.effect === 'fire') this.flame(this.heroXOnTrack(), GROUND - 40);
      sfx.jump();
    } else if (m === 'jump') {
      if (this.heroY >= GROUND - 36) {
        this.heroVy = this.spec.effect === 'fly' ? -460 : -420;
        sfx.jump();
        if (this.spec.effect === 'fire') this.flame(this.heroX, GROUND - 20);
      } else if (this.spec.effect === 'fly' && this.heroVy > -80) {
        this.heroVy = -300; // 会飞：二段跳
        this.puff(this.heroX, this.heroY + 20);
      }
    }
  }

  private pointer(x: number, y: number) {
    if (this.won) return;
    if (this.spec.mechanic === 'pop') {
      for (const b of this.bubbles) {
        if (b.life > 0 && Math.hypot(b.x - x, b.y - y) < b.r + 26) {
          b.life = 0;
          this.score++;
          sfx.pop();
          this.spark(b.x, b.y);
          if (this.score >= this.goal) this.win();
          return;
        }
      }
    } else if (this.spec.mechanic === 'race' || this.spec.mechanic === 'jump') {
      this.action();
    } else {
      // collect/dodge：点左半边向左，右半边向右（触屏友好）
      this.held.left = x < GAME_W / 2;
      this.held.right = x >= GAME_W / 2;
      setTimeout(() => { this.held.left = false; this.held.right = false; }, 220);
    }
  }

  // ---------- 更新 ----------

  private update(dt: number) {
    this.particles = this.particles.filter((p) => (p.life -= dt) > 0);
    for (const p of this.particles) { p.x += p.vx * dt; p.y += p.vy * dt; }
    if (this.won) {
      this.confetti = this.confetti.filter((p) => (p.life -= dt) > 0);
      for (const p of this.confetti) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; }
      return;
    }
    if (this.wobble > 0) this.wobble -= dt;

    const moveSpeed = (this.spec.effect === 'speed' ? 360 : 280) * dt;
    const m = this.spec.mechanic;

    if (m === 'race') {
      this.speed = Math.max(0, this.speed - dt * 0.09);
      this.progress = Math.min(1, this.progress + this.speed * dt);
      for (const r of this.rivals) r.p = Math.min(1, r.p + r.v * dt * (0.8 + Math.random() * 0.5));
      if (this.spec.effect === 'rainbow' && this.speed > 0.05) this.trail(this.heroXOnTrack(), GROUND - 30);
      if (this.progress >= 1) this.win();
      else if (this.rivals.some((r) => r.p >= 1)) {
        // 对手先到：不算失败，笑一笑重新开跑
        this.rivals.forEach((r) => (r.p = 0));
        this.progress = 0;
        this.speed = 0;
        this.wobble = 1;
        sfx.bump();
      }
    } else if (m === 'collect' || m === 'dodge') {
      if (this.held.left) this.heroX -= moveSpeed;
      if (this.held.right) this.heroX += moveSpeed;
      this.heroX = Math.max(40, Math.min(GAME_W - 40, this.heroX));
      const isCollect = m === 'collect';
      const spawnEvery = isCollect ? 0.8 : this.hard ? 0.7 : 0.95;
      if (this.drops.length === 0 || this.t % spawnEvery < dt) {
        this.drops.push({
          x: 40 + Math.random() * (GAME_W - 80),
          y: -20,
          v: (isCollect ? 130 : 150) * (this.hard ? 1.35 : 1),
          isItem: isCollect,
        });
      }
      for (const d of this.drops) d.y += d.v * dt;
      for (const d of this.drops) {
        if (!d.caught && Math.abs(d.x - this.heroX) < 42 && Math.abs(d.y - (GROUND - 30)) < 40) {
          d.caught = true;
          if (isCollect) {
            this.score++;
            sfx.collect();
            this.spark(d.x, d.y);
            if (this.score >= this.goal) this.win();
          } else {
            this.wobble = 0.8;
            sfx.bump();
            this.surviveT = Math.max(0, this.surviveT - 1.5);
          }
        }
      }
      this.drops = this.drops.filter((d) => d.y < GAME_H + 30 && !d.caught);
      if (!isCollect) {
        this.surviveT += dt;
        if (this.surviveT >= this.goal) this.win();
      }
      if (this.spec.effect === 'rainbow' && (this.held.left || this.held.right)) this.trail(this.heroX, GROUND - 20);
    } else if (m === 'jump') {
      this.scroll += dt * (this.hard ? 260 : 210);
      this.heroVy += 1150 * dt;
      this.heroY = Math.min(GROUND - 36, this.heroY + this.heroVy * dt);
      if (this.heroY >= GROUND - 36) this.heroVy = 0;
      if (this.obstacles.length === 0 || this.obstacles[this.obstacles.length - 1].x < this.scroll + GAME_W - 260) {
        this.obstacles.push({ x: this.scroll + GAME_W + Math.random() * 160 });
      }
      for (const o of this.obstacles) {
        const ox = o.x - this.scroll;
        if (!o.passed && ox < this.heroX - 30) {
          o.passed = true;
          this.passed++;
          sfx.collect();
          if (this.passed >= this.goal) this.win();
        }
        if (!o.passed && Math.abs(ox - this.heroX) < 30 && this.heroY > GROUND - 70) {
          o.passed = true;
          this.passed++; // 绊一下也算过：永不挫败
          this.wobble = 0.7;
          sfx.bump();
        }
      }
      this.obstacles = this.obstacles.filter((o) => o.x - this.scroll > -60);
      if (this.spec.effect === 'rainbow') this.trail(this.heroX - 20, this.heroY + 10);
      this.heroX = 140;
    } else if (m === 'pop') {
      if (this.bubbles.filter((b) => b.life > 0).length < (this.hard ? 5 : 4) && Math.random() < 0.05) {
        this.bubbles.push({
          x: 60 + Math.random() * (GAME_W - 120),
          y: 120 + Math.random() * (GAME_H - 220),
          r: 26 + Math.random() * 18,
          life: this.hard ? 2.2 : 3.5,
        });
      }
      for (const b of this.bubbles) { b.life -= dt; b.y -= 12 * dt; }
      this.bubbles = this.bubbles.filter((b) => b.life > -0.2);
    }
  }

  private win() {
    if (this.won) return;
    this.won = true;
    sfx.win();
    for (let i = 0; i < 90; i++) {
      this.confetti.push({
        kind: 'dot',
        x: GAME_W / 2, y: GAME_H / 2 - 40,
        vx: (Math.random() - 0.5) * 500, vy: -Math.random() * 420,
        life: 1.6 + Math.random(), size: 6 + Math.random() * 8,
        color: ['#FF7E6B', '#FFC94D', '#7BC86C', '#7FD3F7', '#A78BFA'][i % 5],
      });
    }
    setTimeout(() => this.hooks.onWin(), 1500);
  }

  // ---------- 粒子 ----------

  private flame(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({ kind: 'flame', x: x - 24, y, vx: -(90 + Math.random() * 60), vy: (Math.random() - 0.5) * 60, life: 0.4, size: 10 + Math.random() * 6 });
    }
  }
  private spark(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({ kind: 'spark', x, y, vx: (Math.random() - 0.5) * 180, vy: -Math.random() * 130, life: 0.5, size: 5 + Math.random() * 5, color: '#FFC94D' });
    }
  }
  private puff(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({ kind: 'puff', x, y, vx: (Math.random() - 0.5) * 120, vy: -Math.random() * 80, life: 0.5, size: 7 + Math.random() * 6 });
    }
  }
  private trail(x: number, y: number) {
    this.particles.push({ kind: 'dot', x, y: y + 16, vx: -40, vy: 20, life: 0.5, size: 8, color: ['#FF7E6B', '#FFC94D', '#7BC86C', '#7FD3F7'][Math.floor(this.t * 10) % 4] });
  }

  private heroXOnTrack() { return 70 + this.progress * (GAME_W - 150); }

  // ---------- 渲染 ----------

  private img(image: HTMLImageElement, x: number, y: number, size: number) {
    this.ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
  }

  private drawParticle(p: Particle) {
    const c = this.ctx;
    const a = Math.min(1, p.life * 2.5);
    c.globalAlpha = a;
    if (p.kind === 'flame') {
      c.fillStyle = '#FF7E6B';
      c.beginPath();
      c.moveTo(p.x, p.y - p.size);
      c.quadraticCurveTo(p.x + p.size * 0.8, p.y, p.x, p.y + p.size * 0.7);
      c.quadraticCurveTo(p.x - p.size * 0.8, p.y, p.x, p.y - p.size);
      c.fill();
      c.fillStyle = '#FFC94D';
      c.beginPath();
      c.arc(p.x, p.y + p.size * 0.15, p.size * 0.4, 0, Math.PI * 2);
      c.fill();
    } else if (p.kind === 'spark') {
      c.fillStyle = p.color ?? '#FFC94D';
      c.beginPath();
      const s = p.size;
      c.moveTo(p.x, p.y - s);
      c.quadraticCurveTo(p.x + s * 0.25, p.y - s * 0.25, p.x + s, p.y);
      c.quadraticCurveTo(p.x + s * 0.25, p.y + s * 0.25, p.x, p.y + s);
      c.quadraticCurveTo(p.x - s * 0.25, p.y + s * 0.25, p.x - s, p.y);
      c.quadraticCurveTo(p.x - s * 0.25, p.y - s * 0.25, p.x, p.y - s);
      c.fill();
    } else if (p.kind === 'puff') {
      c.fillStyle = 'rgba(255,255,255,0.85)';
      c.beginPath();
      c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      c.fill();
    } else {
      c.fillStyle = p.color ?? '#fff';
      c.beginPath();
      c.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }

  private render() {
    const c = this.ctx;
    const th = this.theme;
    // 背景
    const g = c.createLinearGradient(0, 0, 0, GAME_H);
    g.addColorStop(0, th.sky[0]);
    g.addColorStop(1, th.sky[1]);
    c.fillStyle = g;
    c.fillRect(0, 0, GAME_W, GAME_H);
    c.fillStyle = th.ground;
    c.beginPath();
    c.moveTo(0, GROUND);
    c.quadraticCurveTo(GAME_W / 4, GROUND - 14, GAME_W / 2, GROUND);
    c.quadraticCurveTo((GAME_W * 3) / 4, GROUND + 12, GAME_W, GROUND - 4);
    c.lineTo(GAME_W, GAME_H);
    c.lineTo(0, GAME_H);
    c.fill();
    for (const p of this.sprites.props) this.img(p.img, p.x, p.y, 96 * p.s);

    const m = this.spec.mechanic;
    const heroSize = 76;
    let hx = this.heroX;
    let hy = this.heroY;

    if (m === 'race') {
      c.strokeStyle = 'rgba(255,255,255,0.85)';
      c.lineWidth = 4;
      c.setLineDash([20, 14]);
      c.beginPath();
      c.moveTo(20, GROUND + 44);
      c.lineTo(GAME_W - 20, GROUND + 44);
      c.stroke();
      c.setLineDash([]);
      // 终点旗
      c.strokeStyle = '#413A5C';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(GAME_W - 40, GROUND - 66);
      c.lineTo(GAME_W - 40, GROUND + 10);
      c.stroke();
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
        c.fillStyle = (i + j) % 2 === 0 ? '#413A5C' : '#fff';
        c.fillRect(GAME_W - 40 + i * 9, GROUND - 66 + j * 9, 9, 9);
      }
      this.rivals.forEach((r, i) =>
        this.img(this.sprites.rivals[i], 70 + r.p * (GAME_W - 150), GROUND - 96 - i * 56, 52));
      hx = this.heroXOnTrack();
      hy = GROUND - 34;
    } else if (m === 'collect' || m === 'dodge') {
      for (const d of this.drops) this.img(d.isItem ? this.sprites.item : this.sprites.obstacle, d.x, d.y, 40);
      hy = GROUND - 30;
    } else if (m === 'jump') {
      for (const o of this.obstacles) this.img(this.sprites.obstacle, o.x - this.scroll, GROUND - 24, 48);
      hx = this.heroX;
    } else if (m === 'pop') {
      for (const b of this.bubbles) {
        if (b.life <= 0) continue;
        c.globalAlpha = Math.max(0.25, Math.min(1, b.life));
        c.fillStyle = 'rgba(255,255,255,0.4)';
        c.beginPath();
        c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.95)';
        c.lineWidth = 3;
        c.stroke();
        this.img(this.sprites.item, b.x, b.y, b.r * 1.1);
        c.globalAlpha = 1;
      }
      hy = GROUND - 30;
      hx = GAME_W / 2;
    }

    // 特效
    if (this.spec.effect === 'glow') {
      c.fillStyle = 'rgba(255,226,154,0.55)';
      c.beginPath();
      c.arc(hx, hy, heroSize * 0.72, 0, Math.PI * 2);
      c.fill();
    }
    if (this.spec.effect === 'fly') {
      c.fillStyle = '#fff';
      c.strokeStyle = '#413A5C';
      c.lineWidth = 2.5;
      const flap = Math.sin(this.t * 12) * 6;
      for (const side of [-1, 1]) {
        c.beginPath();
        c.ellipse(hx + side * (heroSize * 0.52), hy - 8 + flap * 0.4, 16, 9, side * 0.5, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }
    }

    // 主角（打趔趄时晃一晃）
    const shake = this.wobble > 0 ? Math.sin(this.t * 40) * 5 : 0;
    const bob = m === 'pop' || m === 'collect' || m === 'dodge' ? Math.sin(this.t * 5) * 3 : 0;
    this.img(this.sprites.hero, hx + shake, hy + bob, heroSize);
    if (this.spec.heroId.startsWith('custom:')) {
      c.fillStyle = '#fff';
      c.strokeStyle = '#413A5C';
      c.lineWidth = 2.5;
      const label = this.spec.heroLabel;
      const w = Math.max(52, label.length * 18 + 16);
      this.roundRect(hx - w / 2, hy - heroSize * 0.78 - 14, w, 24, 12);
      c.fill();
      c.stroke();
      c.fillStyle = '#413A5C';
      c.font = '15px "ZCOOL KuaiLe", sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(label, hx, hy - heroSize * 0.78 - 2);
    }
    if (this.spec.effect === 'sparkle' && Math.random() < 0.15) this.spark(hx, hy - 20);

    for (const p of this.particles) this.drawParticle(p);

    this.renderHud();

    if (this.won) {
      c.fillStyle = 'rgba(255,253,246,0.6)';
      c.fillRect(0, 0, GAME_W, GAME_H);
      for (const p of this.confetti) {
        c.fillStyle = p.color!;
        c.fillRect(p.x, p.y, p.size, p.size);
      }
      this.img(this.sprites.hero, GAME_W / 2, GAME_H / 2 - 58, 110);
      c.fillStyle = this.accent;
      c.font = '44px "ZCOOL KuaiLe", sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('你赢啦！', GAME_W / 2, GAME_H / 2 + 52);
    }
  }

  private renderHud() {
    const c = this.ctx;
    const m = this.spec.mechanic;
    let ratio = 0;
    if (m === 'race') ratio = this.progress;
    else if (m === 'collect' || m === 'pop') ratio = this.score / this.goal;
    else if (m === 'dodge') ratio = this.surviveT / this.goal;
    else if (m === 'jump') ratio = this.passed / this.goal;
    ratio = Math.max(0, Math.min(1, ratio));

    c.fillStyle = 'rgba(255,255,255,0.8)';
    this.roundRect(16, 14, 240, 26, 13);
    c.fill();
    c.strokeStyle = '#413A5C';
    c.lineWidth = 2.5;
    this.roundRect(16, 14, 240, 26, 13);
    c.stroke();
    c.fillStyle = this.accent;
    if (ratio > 0.02) {
      this.roundRect(20, 18, Math.max(18, 232 * ratio), 18, 9);
      c.fill();
    }
    this.img(this.sprites.item, 20 + Math.max(18, 232 * ratio), 27, 30);

    if (m === 'collect' || m === 'pop') {
      c.fillStyle = '#413A5C';
      c.font = '22px "ZCOOL KuaiLe", sans-serif';
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillText(`${this.score} / ${this.goal}`, 272, 28);
    }
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
}

/** 各玩法的开场提示（语音播报 + 屏幕大图标，不依赖阅读） */
export function controlHint(spec: GameSpec): { text: string } {
  switch (spec.mechanic) {
    case 'race': return { text: '快快点屏幕（或按空格键），让它跑得飞快！' };
    case 'collect': return { text: '点左边往左、点右边往右（或用方向键），接住星星！' };
    case 'dodge': return { text: '点左边往左、点右边往右（或用方向键），躲开障碍！' };
    case 'jump': return { text: '点一下屏幕（或按空格键）就能跳，跳过障碍！' };
    case 'pop': return { text: '看到泡泡就戳它！全部戳破就赢啦！' };
  }
}
