// 语音输出（PRD 3.1 的 TTS 部分）。
// MVP 用浏览器自带 speechSynthesis：语速偏慢、支持打断；不可用时静默降级为字幕。
// STT 按 PRD MVP 范围用文字输入模拟，接口留在 ListenStage。

import { setMuted } from '../engine/game';

let enabled = true;

export function speechEnabled() { return enabled; }

export function setSpeechEnabled(on: boolean) {
  enabled = on;
  setMuted(!on);
  if (!on) stopSpeaking();
  try { localStorage.setItem('fable.sound', on ? '1' : '0'); } catch { /* ignore */ }
}

export function loadSpeechPref() {
  try { enabled = localStorage.getItem('fable.sound') !== '0'; } catch { /* ignore */ }
  setMuted(!enabled);
}

export function stopSpeaking() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

/** 活泼、偏慢的儿童向播报；每次开口先打断上一句（支持“打断重说”） */
export function speak(text: string) {
  if (!enabled) return;
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[～—]/g, '，'));
    u.lang = 'zh-CN';
    u.rate = 0.92;
    u.pitch = 1.25;
    const voice = synth.getVoices().find((v) => v.lang.startsWith('zh'));
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch { /* 静默降级为字幕 */ }
}
