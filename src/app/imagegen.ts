// AI 图片生成服务（PRD 3.5 终稿视觉的“魔法上色”）。
// 设计原则：永不阻塞创作流程——进入确认页时后台开始生成，
// 好了就淡入替换手绘终稿并成为作品封面；失败/未配置则静默用手绘图。
// 接口为 OpenAI 兼容的 /v1/images/generations（默认经同源 /imggen 代理转发）。

import { TONE_LABEL, mechanicMeta } from '../engine/lexicon';
import type { SlotProfile } from '../engine/types';

/** AI 魔法图（终稿上色）的生成状态 */
export interface MagicCover {
  status: 'idle' | 'loading' | 'ready' | 'failed';
  url: string | null;
}

export interface ImgGenConfig {
  enabled: boolean;
  /** API 基址；'mock' 表示演示模式（不发请求，延迟后返回加了魔法滤镜的手绘图） */
  baseUrl: string;
  apiKey: string;
  model: string;
}

const KEY = 'fable.imggen';

export const DEFAULT_IMGGEN: ImgGenConfig = {
  enabled: true,
  baseUrl: '/imggen/v1',
  apiKey: '',
  model: 'gpt-image-2',
};

export function loadImgGenConfig(): ImgGenConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_IMGGEN };
    return { ...DEFAULT_IMGGEN, ...(JSON.parse(raw) as Partial<ImgGenConfig>) };
  } catch {
    return { ...DEFAULT_IMGGEN };
  }
}

export function saveImgGenConfig(cfg: ImgGenConfig) {
  try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch { /* ignore */ }
}

export function imgGenReady(cfg: ImgGenConfig): boolean {
  return cfg.enabled && (cfg.baseUrl === 'mock' || cfg.apiKey.trim().length > 0);
}

/** 由槽位拼装图片 prompt（中文描述 + 英文风格词，固定儿童安全后缀） */
export function imagePrompt(profile: SlotProfile): string {
  const subject = profile.subject?.label ?? '小主角';
  const companion = profile.companion ? `和${profile.companion.label}一起` : '';
  const scene = profile.scene?.label ?? '大草地';
  const verb = profile.mechanic ? mechanicMeta(profile.mechanic).verb : '开心玩耍';
  const detail = profile.key_detail ? `，${profile.key_detail.label}` : '';
  const tone = TONE_LABEL[profile.tone ?? 'lively'];
  return (
    `一只超级可爱的卡通${subject}${companion}，在${scene}里${verb}${detail}，${tone}的氛围。` +
    `children's picture book illustration, cute chubby character with big eyes and blush cheeks, ` +
    `thick clean outlines, bright flat colors, soft warm lighting, cheerful, ` +
    `wholesome and safe for young kids, no text, no letters, no scary elements`
  );
}

/** 演示模式：把手绘终稿加一层暖金“魔法滤镜”，模拟 AI 上色效果 */
function mockMagicDataUrl(finalSvg?: string): string | null {
  if (!finalSvg) return null;
  const overlay =
    `<defs><linearGradient id="magic-wash" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#FFC24B"/><stop offset="1" stop-color="#EE7A45"/></linearGradient></defs>` +
    `<rect width="100%" height="100%" fill="url(#magic-wash)" opacity="0.16"/>`;
  const patched = finalSvg.replace('</svg>', `${overlay}</svg>`);
  return `data:image/svg+xml;utf8,${encodeURIComponent(patched)}`;
}

/**
 * 生成一张图。任何失败都返回 null（调用方回退到手绘图），绝不抛错打断流程。
 * mockSvg：演示模式下用来合成假“AI 图”的手绘终稿。
 */
export async function generateImage(
  prompt: string,
  cfg: ImgGenConfig,
  mockSvg?: string,
): Promise<string | null> {
  if (!imgGenReady(cfg)) return null;
  if (cfg.baseUrl === 'mock') {
    await new Promise((r) => setTimeout(r, 1600));
    return mockMagicDataUrl(mockSvg);
  }
  try {
    const res = await fetch(`${cfg.baseUrl.replace(/\/+$/, '')}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { url?: string; b64_json?: string }[] };
    const item = data.data?.[0];
    if (item?.url) return item.url;
    if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
    return null;
  } catch {
    return null;
  }
}
