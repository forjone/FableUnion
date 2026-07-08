// LLM 生成层：
// ① 语义归一（PRD 需求拆解适配）：把孩子语无伦次的话改写成规范句，再交给确定性规则引擎。
// ② 内容创作（Genome）：为每个作品生成独有的剧本（开场白/事件/台词/故事/文案）。
// 两者都遵循同一原则：LLM 不可用/超时/未配置时零感知回退（规则引擎 / 程序化生成器）。

import { mendGenome, proceduralGenome, type Genome } from '../engine/genome';
import { slotsToJSON } from '../engine/parser';
import type { SlotProfile } from '../engine/types';
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

// ---------- 内容创作：作品基因（Genome） ----------

const GENOME_GAME_PROMPT =
  '你是儿童游戏的编剧。根据给定的作品槽位 JSON，为一个 4-10 岁孩子的小游戏创作独有的剧本。' +
  '只输出一个 JSON 对象，不要任何解释或代码块标记，字段：' +
  'intro（开场小故事，一句话，≤40字）、winLine（通关台词，≤25字）、' +
  'levelNames（4个有故事感的关卡名，每个≤12字）、' +
  'events（2-3个游戏事件，每个含 at:触发秒数4-35 的数字、kind:"star_rain"|"speed_wind"|"cheer" 之一、line:横幅台词≤15字）、' +
  'itemName（收集物的可爱命名≤6字）、obstacleName（障碍物的可爱命名≤6字）。' +
  '全部中文、活泼、适合幼儿、不出现任何吓人内容。';

const GENOME_SITE_PROMPT =
  '你是儿童绘本作者。根据给定的作品槽位 JSON，为一个 4-10 岁孩子的网页作品创作内容。' +
  '只输出一个 JSON 对象，不要任何解释或代码块标记，字段：' +
  'welcomeLine（欢迎语≤25字）、storyPages（4页小故事，每页一句话≤50字，有起承转合）、' +
  'facts（4-5条趣味小档案，每条是 [标签,内容] 数组，标签≤6字、内容≤15字）、' +
  'inviteLine（派对邀请大字≤18字）。全部中文、温暖活泼、适合幼儿。';

/**
 * 生成作品基因：LLM 创作 → 校验修补；任何失败都落到程序化生成器。
 * 永远成功返回（生成逻辑不允许阻塞创作闭环）。
 */
export async function generateGenome(profile: SlotProfile, cfg: ImgGenConfig): Promise<Genome> {
  if (!llmReady(cfg) || cfg.baseUrl === 'mock') return proceduralGenome(profile);
  try {
    const res = await fetch(`${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: cfg.llmModel.trim(),
        temperature: 0.9, // 创作要有变化
        max_tokens: 600,
        messages: [
          { role: 'system', content: profile.creation_type === 'website' ? GENOME_SITE_PROMPT : GENOME_GAME_PROMPT },
          { role: 'user', content: JSON.stringify(slotsToJSON(profile)) },
        ],
      }),
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return proceduralGenome(profile);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const out = data.choices?.[0]?.message?.content?.trim() ?? '';
    const jsonText = out.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim();
    return mendGenome(JSON.parse(jsonText), profile);
  } catch {
    return proceduralGenome(profile);
  }
}
