// LLM 归一层（PRD 第 6 节“需求拆解用 Claude API”的适配实现）。
// 思路：不是让 LLM 直接产出槽位，而是把孩子语无伦次的话改写成一句规范描述，
// 再交给确定性的规则引擎拆解——下游的分歧检测/默认填充/置信度逻辑全部复用，
// LLM 不可用/超时/未配置时直接用原话走规则引擎，流程零依赖。

import type { ImgGenConfig } from './imagegen';

const SYSTEM_PROMPT =
  '你是儿童创作助手的语义归一器。把孩子对想做的游戏或网页的描述，改写成一句简洁规范的中文描述。' +
  '要求：保留主角、地点、玩法/功能、特别强调的要求；' +
  '主角和地点尽量映射到常见词（如恐龙、公主、小猫、机器人、森林、太空、城堡、海底、糖果世界）；' +
  '游戏玩法映射到：赛跑、收集星星、躲避、跳、戳泡泡（可组合“还要收集星星”）；' +
  '网页功能映射到：画廊、故事书、介绍、邀请函；' +
  '孩子强调的能力用“一定要会××”表达；只输出改写后的一句话，不要任何解释。';

export function llmReady(cfg: ImgGenConfig): boolean {
  return cfg.enabled && cfg.llmEnabled && cfg.llmModel.trim().length > 0
    && (cfg.baseUrl === 'mock' || cfg.apiKey.trim().length > 0);
}

/**
 * 归一孩子的话。任何失败（未配置/超时/异常/输出可疑）都返回 null，调用方用原话。
 */
export async function normalizeUtterance(text: string, cfg: ImgGenConfig): Promise<string | null> {
  if (!llmReady(cfg)) return null;
  if (cfg.baseUrl === 'mock') return null; // 演示模式不模拟 LLM，直接走规则引擎
  try {
    const res = await fetch(`${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: cfg.llmModel.trim(),
        temperature: 0,
        max_tokens: 120,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const out = data.choices?.[0]?.message?.content?.trim();
    if (!out || out.length > 120 || out.includes('\n')) return null;
    return out;
  } catch {
    return null;
  }
}
