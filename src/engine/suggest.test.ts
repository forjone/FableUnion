// 小灵主动提议 + 相关解析语义的测试。

import { describe, expect, it } from 'vitest';
import { parseUtterance } from './parser';
import { suggestNext } from './suggest';

describe('suggestNext（主动提议）', () => {
  it('缺关键细节时会提议加本领', () => {
    const { profile } = parseUtterance('恐龙赛跑');
    const s = suggestNext(profile);
    expect(s).not.toBeNull();
  });

  it('提议的话本身能被解析器正确理解（闭环自洽）', () => {
    const base = parseUtterance('恐龙赛跑').profile;
    // 遍历多次随机提议，每一条都必须能推进档案
    for (let i = 0; i < 20; i++) {
      const s = suggestNext(base);
      if (!s) break;
      const r = parseUtterance(s.say, base);
      expect(r.profile.subject?.id).toBe('dino'); // 主角不被顶掉
      expect(r.divergence).toBeNull(); // 提议不应引出新分歧
    }
  });

  it('什么都齐了就不再打扰', () => {
    const base = parseUtterance('会喷火的恐龙和公主在太空赛跑还要收集星星，来一场大挑战').profile;
    expect(base.difficulty).toBe('hard');
    expect(suggestNext(base)).toBeNull();
  });
});

describe('提议相关的解析语义', () => {
  it('“让小猫也一起来”→ 加同伴而不是换主角', () => {
    const base = parseUtterance('恐龙赛跑').profile;
    const r = parseUtterance('让小猫也一起来！', base);
    expect(r.profile.subject?.id).toBe('dino');
    expect(r.profile.companion?.id).toBe('cat');
  });

  it('“来一场大挑战”→ 直接设为困难，不再出选择题', () => {
    const base = parseUtterance('恐龙赛跑').profile;
    const r = parseUtterance('来一场大挑战，难一点！', base);
    expect(r.profile.difficulty).toBe('hard');
    expect(r.divergence).toBeNull();
  });
});
