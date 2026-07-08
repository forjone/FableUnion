// 作品基因（内容生成层）测试：生成逻辑必须真实生效——同一想法产出不同内容。

import { describe, expect, it } from 'vitest';
import { mendGenome, proceduralGameGenome, proceduralGenome, proceduralSiteGenome } from './genome';
import { parseUtterance } from './parser';

describe('程序化生成器（离线兜底也要“每次不同”）', () => {
  it('游戏基因字段齐全且融入槽位内容', () => {
    const { profile } = parseUtterance('我想要恐龙赛跑，恐龙一定要会喷火！');
    const g = proceduralGameGenome(profile);
    expect(g.intro.length).toBeGreaterThan(5);
    expect(g.winLine.length).toBeGreaterThan(3);
    expect(g.levelNames.length).toBeGreaterThanOrEqual(3);
    expect(g.events.length).toBeGreaterThanOrEqual(2);
    expect(g.events.every((e) => e.at >= 4 && e.line.length > 0)).toBe(true);
    const all = g.intro + g.winLine;
    expect(all).toContain('恐龙');
  });

  it('同一想法多次生成，内容存在差异（生成性）', () => {
    const { profile } = parseUtterance('恐龙赛跑');
    const outs = new Set<string>();
    for (let i = 0; i < 12; i++) outs.add(proceduralGameGenome(profile).intro);
    expect(outs.size).toBeGreaterThan(1);
  });

  it('网站基因：四页故事 + 趣味档案', () => {
    const { profile } = parseUtterance('给独角兽做一本故事书');
    const s = proceduralSiteGenome(profile);
    expect(s.storyPages).toHaveLength(4);
    expect(s.facts.length).toBeGreaterThanOrEqual(4);
    expect(s.storyPages.join('')).toContain('独角兽');
  });

  it('按作品类型分流', () => {
    expect(proceduralGenome(parseUtterance('小猫的画廊').profile).site).toBeDefined();
    expect(proceduralGenome(parseUtterance('恐龙赛跑').profile).game).toBeDefined();
  });
});

describe('mendGenome（LLM 输出校验修补）', () => {
  it('完整的 LLM 输出被采纳并裁剪', () => {
    const { profile } = parseUtterance('恐龙赛跑');
    const g = mendGenome({
      intro: '恐龙要出发啦',
      winLine: '赢了！',
      levelNames: ['风起', '弯道', '冲刺', '大魔王'],
      events: [{ at: 8, kind: 'star_rain', line: '星星雨！' }],
      itemName: '许愿星',
      obstacleName: '捣蛋石',
    }, profile);
    expect(g.game?.intro).toBe('恐龙要出发啦');
    expect(g.game?.events[0].kind).toBe('star_rain');
  });

  it('残缺/畸形输出自动用程序化内容补齐', () => {
    const { profile } = parseUtterance('恐龙赛跑');
    const g = mendGenome({ intro: 123, events: 'nope' }, profile);
    expect(typeof g.game?.intro).toBe('string');
    expect(g.game!.intro.length).toBeGreaterThan(5);
    expect(g.game!.events.length).toBeGreaterThanOrEqual(2);
  });

  it('非法事件时刻被夹到安全范围', () => {
    const { profile } = parseUtterance('恐龙赛跑');
    const g = mendGenome({
      events: [{ at: 999, kind: 'cheer', line: '加油' }],
    }, profile);
    expect(g.game!.events[0].at).toBeLessThanOrEqual(40);
  });
});
