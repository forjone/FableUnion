// 图片生成服务的纯逻辑测试（prompt 拼装与配置判定）。

import { describe, expect, it } from 'vitest';
import { parseUtterance } from '../engine/parser';
import { DEFAULT_IMGGEN, imagePrompt, imgGenReady } from './imagegen';

describe('imagePrompt（PRD 3.5 终稿 prompt 拼装）', () => {
  it('包含槽位要素与儿童安全后缀', () => {
    const { profile } = parseUtterance('我想要恐龙赛跑，恐龙一定要会喷火！');
    const p = imagePrompt(profile);
    expect(p).toContain('恐龙');
    expect(p).toContain('大草地');
    expect(p).toContain('会喷火');
    expect(p).toContain('safe for young kids');
    expect(p).toContain('no text');
  });

  it('同伴也会出现在 prompt 里', () => {
    const { profile } = parseUtterance('恐龙和公主一起赛跑');
    expect(imagePrompt(profile)).toContain('和公主一起');
  });
});

describe('imgGenReady（未配置时必须回退手绘图）', () => {
  it('默认配置没有 Key → 不发请求', () => {
    expect(imgGenReady(DEFAULT_IMGGEN)).toBe(false);
  });

  it('有 Key 或 mock 模式 → 可用', () => {
    expect(imgGenReady({ ...DEFAULT_IMGGEN, apiKey: 'sk-test' })).toBe(true);
    expect(imgGenReady({ ...DEFAULT_IMGGEN, baseUrl: 'mock' })).toBe(true);
  });

  it('总开关关闭 → 一律不可用', () => {
    expect(imgGenReady({ ...DEFAULT_IMGGEN, apiKey: 'sk-test', enabled: false })).toBe(false);
  });
});
