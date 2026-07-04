// 语音交互（PRD 3.1）。
// TTS：浏览器 speechSynthesis，语速偏慢、支持打断；不可用时静默降级为字幕。
// STT：浏览器 SpeechRecognition（Chrome/Safari 可用），不支持时回退到文字输入模拟。

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

// ---------- STT：真实语音输入（渐进增强，不支持就静默回退打字） ----------

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: unknown) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

function sttCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => SpeechRecognitionLike) | null;
}

export function sttSupported(): boolean {
  try { return sttCtor() !== null; } catch { return false; }
}

export interface SttHandle { stop(): void }

/**
 * 开始听孩子说话。final=true 的片段应追加进输入；final=false 是实时预览。
 * 任何错误都静默处理——打字输入永远可用。
 */
export function startStt(onText: (text: string, final: boolean) => void): SttHandle | null {
  try {
    const Ctor = sttCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      const ev = e as { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> };
      let interim = '';
      let final = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (final) onText(final, true);
      else onText(interim, false);
    };
    rec.onerror = () => { /* 静默：孩子可以打字 */ };
    rec.start();
    return { stop: () => { try { rec.onresult = null; rec.stop(); } catch { /* ignore */ } } };
  } catch {
    return null;
  }
}

/**
 * 语音表态（PRD 3.4/3.5）：在草图/确认页听孩子说“好耶/对”或“不是/不对”。
 * 防回声：小灵自己正在说话（TTS 播报中）时忽略识别结果，且只认短句，
 * 避免麦克风把“……对不对呀？”听回去误判。
 */
export function listenForAnswer(handlers: { onYes?: () => void; onNo?: () => void }): SttHandle | null {
  return startStt((text, final) => {
    if (!final) return;
    try { if (window.speechSynthesis?.speaking) return; } catch { /* ignore */ }
    const t = text.replace(/[\s，。！？,.!?]/g, '');
    if (t.length === 0 || t.length > 8) return;
    // 否定优先：“不对”里包含“对”
    if (/不是|不对|不要|不喜欢|换一个|重来/.test(t)) { handlers.onNo?.(); return; }
    if (/^(好耶|好呀|好的|好|对|嗯|耶|可以|就是这个|喜欢|要)/.test(t)) handlers.onYes?.();
  });
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
