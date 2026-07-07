/**
 * 轻量音效：WebAudio 现场合成，零音频资产。
 * 首次用户交互时惰性创建 AudioContext。
 */

const PREF_KEY = 'fableunion.sound'
let enabled = typeof localStorage !== 'undefined' && localStorage.getItem(PREF_KEY) !== 'off'
let ctx: AudioContext | null = null

export function soundEnabled(): boolean {
  return enabled
}

export function setSoundEnabled(on: boolean): void {
  enabled = on
  localStorage.setItem(PREF_KEY, on ? 'on' : 'off')
}

function ensureCtx(): AudioContext | null {
  if (!enabled) return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(
  ac: AudioContext,
  freq: number,
  at: number,
  dur: number,
  type: OscillatorType = 'sine',
  peak = 0.055,
): void {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = ac.currentTime + at
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0004, t0 + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

export type Sfx = 'tap' | 'confirm' | 'good' | 'bad' | 'milestone' | 'wing' | 'ending'

const PATTERNS: Record<Sfx, (ac: AudioContext) => void> = {
  tap: (ac) => tone(ac, 660, 0, 0.07, 'triangle', 0.04),
  confirm: (ac) => {
    tone(ac, 523, 0, 0.09, 'triangle')
    tone(ac, 784, 0.07, 0.12, 'triangle')
  },
  good: (ac) => {
    tone(ac, 523, 0, 0.08)
    tone(ac, 659, 0.06, 0.08)
    tone(ac, 784, 0.12, 0.14)
  },
  bad: (ac) => {
    tone(ac, 330, 0, 0.12, 'sawtooth', 0.035)
    tone(ac, 247, 0.1, 0.18, 'sawtooth', 0.035)
  },
  milestone: (ac) => {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(ac, f, i * 0.09, 0.16, 'triangle'))
    tone(ac, 1319, 0.36, 0.3, 'sine', 0.045)
  },
  wing: (ac) => {
    ;[880, 1109, 1319, 1760].forEach((f, i) => tone(ac, f, i * 0.07, 0.22, 'sine', 0.04))
  },
  ending: (ac) => {
    ;[392, 494, 587].forEach((f) => tone(ac, f, 0, 0.7, 'sine', 0.04))
    tone(ac, 784, 0.25, 0.6, 'sine', 0.03)
  },
}

export function playSfx(name: Sfx): void {
  const ac = ensureCtx()
  if (!ac) return
  PATTERNS[name](ac)
}
