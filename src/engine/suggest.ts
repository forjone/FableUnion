// 小灵主动提议：作品完成后提出一个“再加点什么”的点子（点燃想象而非替代想象）。
// 提议本身就是一句孩子的话，被采纳后走完全一样的解析→草图→确认→重建闭环。

import type { SlotProfile } from './types';

export interface Suggestion {
  /** 以孩子口吻说出的那句话（直接送入解析器） */
  say: string;
  /** 短标签（高龄档显示） */
  label: string;
}

export function suggestNext(profile: SlotProfile): Suggestion | null {
  const cands: Suggestion[] = [];
  if (!profile.key_detail) {
    cands.push({ say: '一定要会喷火！', label: '会喷火' });
    cands.push({ say: '让它飞起来！', label: '会飞' });
    cands.push({ say: '变成彩虹色的！', label: '彩虹色' });
  }
  if (
    profile.creation_type === 'game' &&
    profile.mechanic && profile.mechanic !== 'collect' && !profile.mechanic_extra
  ) {
    cands.push({ say: '还要一边收集星星！', label: '捡星星' });
  }
  if (!profile.companion) {
    cands.push({ say: '让小猫也一起来！', label: '小猫作伴' });
    cands.push({ say: '让小兔子也一起来！', label: '兔兔作伴' });
  }
  if (profile.confidence.scene === 'default' || profile.confidence.scene === 'medium_inferred') {
    cands.push({ say: '把它搬到太空去！', label: '去太空' });
    cands.push({ say: '搬到糖果世界去！', label: '糖果世界' });
  }
  if (profile.creation_type === 'game' && profile.difficulty === 'easy') {
    cands.push({ say: '来一场大挑战，难一点！', label: '大挑战' });
  }
  if (cands.length === 0) return null;
  return cands[Math.floor(Math.random() * Math.min(cands.length, 3))];
}
