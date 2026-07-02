// 深度构建模块（PRD 3.6）：由槽位 JSON 参数化生成可玩的 Canvas 小游戏。
// 五种玩法模板（race/collect/dodge/jump/pop），主角/场景/基调/关键细节全部由槽位驱动。
// 儿童友好原则：永不出现“失败惩罚”，最坏情况也只是打个趔趄再来。

import { SCENE_THEMES, obstacleFor, workTitle } from './sketch';
import type { GameSpec, SlotProfile, ToneId } from './types';

export const GAME_W = 640;
export const GAME_H = 400;
const GROUND = 320;
const SX = GAME_W / 480; // sketch 主题坐标 → 游戏坐标
const SY = GAME_H / 320;

const TONE_ACCENT: Record<ToneId, string> = {
  cute: '#ec4899', cool: '#0891b2', mystery: '#7c3aed', funny: '#f59e0b', lively: '#16a34a',
};

export function buildSpec(profile: SlotProfile): GameSpec {
  return {
    title: workTitle(profile),
    mechanic: profile.mechanic ?? 'race',
    heroEmoji: profile.subject?.custom ? '✨' : profile.subject?.emoji ?? '🦖',
    heroLabel: profile.subject?.label ?? '小主角',
    companionEmoji: profile.companion?.emoji ?? null,
    sceneId: profile.scene?.id ?? 'meadow',
    tone: profile.tone ?? 'lively',
    effect: profile.key_detail?.effect ?? null,
    difficulty: profile.difficulty,
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

interface Particle { x: number; y: number; vx: number; vy: number; life: number; emoji?: string; color?: string; size: number }
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
  private rivals: { emoji: string; p: number; v: number }[] = [];
  // collect / dodge
  private drops: { x: number; y: number; v: number; emoji: string; caught?: boolean }[] = [];
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
  private obstacleEmoji: string;

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
    private hooks: RuntimeHooks,
  ) {
    canvas.width = GAME_W;
    canvas.height = GAME_H;
    this.ctx = canvas.getContext('2d')!;
    this.hard = spec.difficulty === 'hard';
    this.accent = TONE_ACCENT[spec.tone];
    this.theme = SCENE_THEMES[spec.sceneId] ?? SCENE_THEMES.meadow;
    this.obstacleEmoji = obstacleFor(spec.sceneId);
    this.goal = { race: 1, collect: this.hard ? 12 : 8, dodge: this.hard ? 22 : 15, jump: this.hard ? 10 : 6, pop: this.hard ? 15 : 10 }[
      spec.mechanic
    ];
    if (spec.mechanic === 'race') {
      const rivalPool = spec.companionEmoji ? [spec.companionEmoji, '🐢'] : ['🐢', '🐰'];
      this.rivals = rivalPool.map((emoji, i) => ({ emoji, p: 0, v: (this.hard ? 0.085 : 0.062) + i * 0.008 }));
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
        this.puff(this.heroX, this.heroY + 20, '☁️');
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
          this.puff(b.x, b.y, '✨');
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
          emoji: isCollect ? '⭐' : this.obstacleEmoji,
        });
      }
      for (const d of this.drops) d.y += d.v * dt;
      for (const d of this.drops) {
        if (!d.caught && Math.abs(d.x - this.heroX) < 42 && Math.abs(d.y - (GROUND - 30)) < 40) {
          d.caught = true;
          if (isCollect) {
            this.score++;
            sfx.collect();
            this.puff(d.x, d.y, '✨');
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
        x: GAME_W / 2, y: GAME_H / 2 - 40,
        vx: (Math.random() - 0.5) * 500, vy: -Math.random() * 420,
        life: 1.6 + Math.random(), size: 6 + Math.random() * 8,
        color: ['#f472b6', '#facc15', '#4ade80', '#38bdf8', '#a78bfa'][i % 5],
      });
    }
    setTimeout(() => this.hooks.onWin(), 1500);
  }

  // ---------- 粒子 ----------

  private flame(x: number, y: number) {
    // 向后喷的加速尾焰
    for (let i = 0; i < 4; i++) {
      this.particles.push({ x: x - 24, y, vx: -(90 + Math.random() * 60), vy: (Math.random() - 0.5) * 60, life: 0.4, emoji: '🔥', size: 18 + Math.random() * 10 });
    }
  }
  private puff(x: number, y: number, emoji: string) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({ x, y, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 120, life: 0.5, emoji, size: 14 + Math.random() * 8 });
    }
  }
  private trail(x: number, y: number) {
    this.particles.push({ x, y: y + 16, vx: -40, vy: 20, life: 0.5, size: 8, color: ['#f472b6', '#facc15', '#4ade80', '#38bdf8'][Math.floor(this.t * 10) % 4] });
  }

  private heroXOnTrack() { return 70 + this.progress * (GAME_W - 150); }

  // ---------- 渲染 ----------

  private emoji(e: string, x: number, y: number, size: number) {
    const c = this.ctx;
    c.font = `${size}px "Segoe UI Emoji", "Noto Color Emoji", serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(e, x, y);
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
    c.fillRect(0, GROUND, GAME_W, GAME_H - GROUND);
    if (th.celestial) this.emoji(th.celestial.emoji, th.celestial.x * SX, th.celestial.y * SY, th.celestial.size);
    for (const p of th.props) this.emoji(p.emoji, p.x * SX, p.y * SY, p.size * 0.9);

    const m = this.spec.mechanic;
    const heroSize = 52;
    let hx = this.heroX;
    let hy = this.heroY;

    if (m === 'race') {
      c.strokeStyle = 'rgba(255,255,255,0.85)';
      c.lineWidth = 4;
      c.setLineDash([20, 14]);
      for (let lane = 0; lane < 3; lane++) {
        c.beginPath();
        c.moveTo(30, GROUND + 18 + lane * 0); // 单线跑道即可
      }
      c.beginPath();
      c.moveTo(20, GROUND + 40);
      c.lineTo(GAME_W - 20, GROUND + 40);
      c.stroke();
      c.setLineDash([]);
      this.emoji('🏁', GAME_W - 45, GROUND - 30, 44);
      this.rivals.forEach((r, i) => this.emoji(r.emoji, 70 + r.p * (GAME_W - 150), GROUND - 90 - i * 46, 38));
      hx = this.heroXOnTrack();
      hy = GROUND - 34;
    } else if (m === 'collect' || m === 'dodge') {
      for (const d of this.drops) this.emoji(d.emoji, d.x, d.y, 34);
      hy = GROUND - 30;
    } else if (m === 'jump') {
      for (const o of this.obstacles) this.emoji(this.obstacleEmoji, o.x - this.scroll, GROUND - 22, 40);
      hx = this.heroX;
    } else if (m === 'pop') {
      for (const b of this.bubbles) {
        if (b.life <= 0) continue;
        c.globalAlpha = Math.max(0.25, Math.min(1, b.life));
        c.fillStyle = 'rgba(255,255,255,0.45)';
        c.beginPath();
        c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.9)';
        c.lineWidth = 3;
        c.stroke();
        this.emoji('⭐', b.x, b.y, b.r * 0.9);
        c.globalAlpha = 1;
      }
      hy = GROUND - 30;
      hx = GAME_W / 2;
    }

    // 特效光环/翅膀
    if (this.spec.effect === 'glow') {
      c.fillStyle = 'rgba(254,240,138,0.5)';
      c.beginPath();
      c.arc(hx, hy, heroSize * 0.85, 0, Math.PI * 2);
      c.fill();
    }
    if (this.spec.effect === 'fly') this.emoji('🪽', hx - 34, hy - 18, 30);

    // 主角（打趔趄时晃一晃）
    const shake = this.wobble > 0 ? Math.sin(this.t * 40) * 5 : 0;
    this.emoji(this.spec.heroEmoji, hx + shake, hy, heroSize);
    if (this.spec.heroEmoji === '✨') {
      c.fillStyle = '#92400e';
      c.font = 'bold 15px sans-serif';
      c.fillText(this.spec.heroLabel, hx, hy - 42);
    }
    if (this.spec.effect === 'sparkle' && Math.random() < 0.15) this.puff(hx, hy - 20, '✨');

    // 粒子
    for (const p of this.particles) {
      if (p.emoji) this.emoji(p.emoji, p.x, p.y, p.size);
      else {
        c.fillStyle = p.color ?? '#fff';
        c.beginPath();
        c.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        c.fill();
      }
    }

    this.renderHud();

    if (this.won) {
      c.fillStyle = 'rgba(255,255,255,0.55)';
      c.fillRect(0, 0, GAME_W, GAME_H);
      for (const p of this.confetti) {
        c.fillStyle = p.color!;
        c.fillRect(p.x, p.y, p.size, p.size);
      }
      this.emoji('🎉', GAME_W / 2, GAME_H / 2 - 46, 84);
      c.fillStyle = this.accent;
      c.font = 'bold 40px sans-serif';
      c.textAlign = 'center';
      c.fillText('你赢啦！', GAME_W / 2, GAME_H / 2 + 40);
    }
  }

  private renderHud() {
    const c = this.ctx;
    const m = this.spec.mechanic;
    // 进度条（所有玩法统一的“离胜利有多近”）
    let ratio = 0;
    if (m === 'race') ratio = this.progress;
    else if (m === 'collect' || m === 'pop') ratio = this.score / this.goal;
    else if (m === 'dodge') ratio = this.surviveT / this.goal;
    else if (m === 'jump') ratio = this.passed / this.goal;
    ratio = Math.max(0, Math.min(1, ratio));

    c.fillStyle = 'rgba(255,255,255,0.7)';
    this.roundRect(16, 14, 240, 26, 13);
    c.fill();
    c.fillStyle = this.accent;
    if (ratio > 0.02) {
      this.roundRect(19, 17, Math.max(20, 234 * ratio), 20, 10);
      c.fill();
    }
    this.emoji('🌟', 16 + Math.max(20, 234 * ratio), 27, 26);

    if (m === 'collect' || m === 'pop') {
      c.fillStyle = '#334155';
      c.font = 'bold 22px sans-serif';
      c.textAlign = 'left';
      c.fillText(`${this.score} / ${this.goal}`, 270, 32);
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
export function controlHint(spec: GameSpec): { text: string; emoji: string } {
  switch (spec.mechanic) {
    case 'race': return { text: '快快点屏幕（或按空格键），让它跑得飞快！', emoji: '👆💨' };
    case 'collect': return { text: '点左边往左、点右边往右（或用方向键），接住星星！', emoji: '⭐🧺' };
    case 'dodge': return { text: '点左边往左、点右边往右（或用方向键），躲开障碍！', emoji: '🙈💨' };
    case 'jump': return { text: '点一下屏幕（或按空格键）就能跳，跳过障碍！', emoji: '🦘⬆️' };
    case 'pop': return { text: '看到泡泡就戳它！全部戳破就赢啦！', emoji: '👆🫧' };
  }
}
