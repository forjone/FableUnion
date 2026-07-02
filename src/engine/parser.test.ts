// 验证需求拆解引擎“真实生效，而非写死流程”（PRD 第 7 节 MVP 要求）。

import { describe, expect, it } from 'vitest';
import { applyOption, parseUtterance, pendingDivergence, slotsToJSON } from './parser';

describe('槽位拆解（PRD 3.2）', () => {
  it('PRD 示例：会喷火的恐龙赛跑 → 槽位齐全，直接进草图', () => {
    const r = parseUtterance('我想要恐龙赛跑，恐龙一定要会喷火！');
    expect(r.profile.subject?.id).toBe('dino');
    expect(r.profile.mechanic).toBe('race');
    expect(r.profile.key_detail?.effect).toBe('fire');
    expect(r.divergence).toBeNull();
    expect(r.profile.confidence.subject).toBe('high');
    expect(r.profile.confidence.key_detail).toBe('high');
  });

  it('场景缺失 → 由主角推断默认值，不打扰孩子', () => {
    const r = parseUtterance('恐龙赛跑');
    expect(r.profile.scene?.id).toBe('meadow');
    expect(r.profile.confidence.scene).toBe('medium_inferred');
  });

  it('玩法缺失（关键缺失）→ 触发双草图分歧，而不是文字提问', () => {
    const r = parseUtterance('我想要一个小猫的游戏');
    expect(r.profile.subject?.id).toBe('cat');
    expect(r.divergence?.slot).toBe('mechanic');
    expect(r.divergence?.kind).toBe('visual');
    expect(r.divergence?.options).toHaveLength(2);
  });

  it('两种玩法冲突 → 双草图二选一', () => {
    const r = parseUtterance('恐龙又要赛跑又要收集金币');
    expect(r.divergence?.slot).toBe('mechanic');
    expect(r.divergence?.reason).toBe('conflict');
  });

  it('分歧解决后标记 resolved_by_clarify，且一次只处理一个分歧', () => {
    const r = parseUtterance('随便做一个游戏');
    expect(r.divergence?.slot).toBe('subject');
    const afterSubject = applyOption(r.profile, r.divergence!, r.divergence!.options[0]);
    expect(afterSubject.confidence.subject).toBe('resolved_by_clarify');
    const next = pendingDivergence(afterSubject);
    expect(next?.slot).toBe('mechanic');
    const done = applyOption(afterSubject, next!, next!.options[0]);
    expect(pendingDivergence(done)).toBeNull();
  });

  it('规则类分歧（难度）无法用草图区分 → 兜底图卡选择题', () => {
    const r = parseUtterance('恐龙赛跑，难不难呀');
    expect(r.divergence?.kind).toBe('cards');
    expect(r.divergence?.slot).toBe('difficulty');
  });

  it('词库外的主角也能捕获成自定义主角', () => {
    const r = parseUtterance('我想做一个土豆侠的游戏，要跳来跳去');
    expect(r.profile.subject?.custom).toBe(true);
    expect(r.profile.subject?.label).toBe('土豆侠');
    expect(r.profile.mechanic).toBe('jump');
  });

  it('“XX在……”句式也能捕获自定义主角', () => {
    const r = parseUtterance('我想要土豆侠在糖果世界跳来跳去');
    expect(r.profile.subject?.label).toBe('土豆侠');
    expect(r.profile.scene?.id).toBe('candy');
    expect(r.profile.mechanic).toBe('jump');
  });

  it('否定词不会误填槽位：不要森林 ≠ 场景是森林', () => {
    const r = parseUtterance('小兔子跳跳，不要森林');
    expect(r.profile.scene?.id).not.toBe('forest');
  });

  it('两个主角 → 第一个当主角，第二个当同伴，不算冲突', () => {
    const r = parseUtterance('恐龙和公主一起赛跑');
    expect(r.profile.subject?.id).toBe('dino');
    expect(r.profile.companion?.id).toBe('princess');
    expect(r.divergence).toBeNull();
  });
});

describe('永远不说“不行”（PRD 第 2 节）', () => {
  it('无法实现的需求 → 转译台词，而非拒绝', () => {
    const r = parseUtterance('我要一只真的恐龙赛跑');
    expect(r.translations.length).toBeGreaterThan(0);
    expect(r.divergence).toBeNull();
    expect(r.profile.subject?.id).toBe('dino');
  });

  it('一百个关卡 → 转译成先做一关', () => {
    const r = parseUtterance('恐龙赛跑要有一百关');
    expect(r.translations.some((t) => t.includes('一关'))).toBe(true);
  });
});

describe('迭代模式（PRD 3.7 接着上次的改）', () => {
  it('新增关键细节合并进已有档案', () => {
    const base = parseUtterance('恐龙赛跑').profile;
    const r = parseUtterance('一定要会喷火', base);
    expect(r.profile.subject?.id).toBe('dino');
    expect(r.profile.mechanic).toBe('race');
    expect(r.profile.key_detail?.effect).toBe('fire');
    expect(r.changed).toContain('key_detail');
  });

  it('换场景只改场景', () => {
    const base = parseUtterance('恐龙赛跑').profile;
    const r = parseUtterance('换到太空去', base);
    expect(r.profile.scene?.id).toBe('space');
    expect(r.profile.mechanic).toBe('race');
  });
});

describe('槽位 JSON 导出（PRD 第 6 节格式）', () => {
  it('包含 confidence 字段', () => {
    const r = parseUtterance('我想要恐龙赛跑，恐龙一定要会喷火！');
    const json = slotsToJSON(r.profile) as Record<string, unknown>;
    expect(json.creation_type).toBe('game');
    expect(json.key_detail).toBe('会喷火');
    expect((json.confidence as Record<string, string>).subject).toBe('high');
  });
});
