// 内容安全过滤测试（PRD 第 5 节）。

import { describe, expect, it } from 'vitest';
import { checkText } from './safety';

describe('checkText 输入过滤', () => {
  it('正常创作内容放行', () => {
    expect(checkText('我想要恐龙赛跑，恐龙一定要会喷火！').ok).toBe(true);
    expect(checkText('小幽灵在神秘城堡躲一躲').ok).toBe(true); // 神秘≠恐怖，允许
  });

  it('严重暴力内容被拦截并给出引导话术', () => {
    const r = checkText('我要一个用枪打死怪物的游戏');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.label).toBe('暴力内容');
      expect(r.line.length).toBeGreaterThan(5); // 引导而非拒绝
    }
  });

  it('个人信息被拦截', () => {
    const r = checkText('把我的手机号写在网页上');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.label).toBe('个人信息');
  });
});
