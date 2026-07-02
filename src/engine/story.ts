// 面向孩子的全部语言都从这里产出：讲故事口吻，绝不暴露“槽位/识别/分析”痕迹（设计北极星准则 3）。

import { mechanicMeta } from './lexicon';
import type { SlotName, SlotProfile } from './types';

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** 草图呈现时的讲故事旁白（PRD 3.4：不问“对不对”，像讲故事一样描述画面） */
export function sketchNarration(profile: SlotProfile, translations: string[], changed: SlotName[]): string[] {
  const lines: string[] = [];
  for (const t of translations) lines.push(t);

  const hero = profile.subject?.label ?? '小主角';
  const scene = profile.scene?.label ?? '奇妙世界';
  const verb = profile.mechanic ? mechanicMeta(profile.mechanic).verb : '大冒险';
  const detail = profile.key_detail ? `还${profile.key_detail.label}` : '';

  if (changed.length > 0 && changed.length <= 2) {
    // 迭代时先呼应改动
    if (changed.includes('subject')) lines.push(`好嘞！这次换${hero}闪亮登场！`);
    else if (changed.includes('scene')) lines.push(`好嘞！我们把舞台搬到${scene}！`);
    else if (changed.includes('key_detail')) lines.push(`收到！${hero}${profile.key_detail?.label ?? ''}啦！`);
    else if (changed.includes('mechanic')) lines.push(`好主意！这次来${verb}！`);
  }

  lines.push(
    pick([
      `好嘞——${hero}${detail ? '，' + detail + '，' : ''}马上要在${scene}里${verb}啦！`,
      `瞧！${hero}已经来到${scene}，准备${verb}${detail ? '，它' + detail : ''}！`,
      `${scene}到啦！${hero}摩拳擦掌${detail ? '，' + detail : ''}，就等你一声开始！`,
    ]),
  );
  return lines;
}

/** 复述确认（PRD 3.5）：优先用孩子原话的关键词 */
export function recapSentence(profile: SlotProfile): string {
  const subject = profile.raw.subject ?? profile.subject?.label ?? '小主角';
  const scene = profile.raw.scene ?? profile.scene?.label ?? '奇妙世界';
  const verb = profile.raw.mechanic
    ? `玩“${profile.raw.mechanic}”`
    : profile.mechanic
      ? mechanicMeta(profile.mechanic).verb
      : '大冒险';
  const detail = profile.raw.key_detail
    ? `${profile.raw.key_detail}的`
    : profile.key_detail
      ? `${profile.key_detail.label}的`
      : '';
  const companion = profile.companion ? `，${profile.companion.label}也一起来` : '';
  return `我们要做一个${detail}${subject}在${scene}里${verb}的游戏${companion}，对不对呀？`;
}

/** 深度构建的故事化进度（PRD 3.6：不是通用加载条） */
export function buildSteps(profile: SlotProfile): string[] {
  const hero = profile.subject?.label ?? '小主角';
  const scene = profile.scene?.label ?? '奇妙世界';
  const steps: string[] = [];
  steps.push(`正在把${scene}铺得漂漂亮亮…`);
  switch (profile.mechanic) {
    case 'race': steps.push(`正在给${hero}穿上超级跑鞋…`); break;
    case 'collect': steps.push(`正在把亮晶晶的星星挂到天上…`); break;
    case 'dodge': steps.push(`正在教${hero}闪转腾挪的功夫…`); break;
    case 'jump': steps.push(`正在给${hero}的腿装上弹簧…`); break;
    case 'pop': steps.push(`正在吹出好多好多泡泡…`); break;
    default: steps.push(`正在给${hero}热身…`);
  }
  if (profile.key_detail) steps.push(`正在教${hero}${profile.key_detail.label}的绝招…`);
  if (profile.companion) steps.push(`${profile.companion.label}也赶来帮忙啦…`);
  steps.push('嘘——马上就好，再撒一把魔法星星…');
  return steps;
}

/** 完成时的庆祝语 + 迭代邀请（PRD 3.7） */
export function celebrateLine(profile: SlotProfile): string {
  const hero = profile.subject?.label ?? '小主角';
  return pick([
    `哇！你的游戏做好啦！${hero}就等你来玩！`,
    `叮——完成！这可是你自己想出来的游戏哦！`,
    `太棒啦！${hero}说它超喜欢这个游戏！`,
  ]);
}

export function iterateInvite(): string {
  return pick([
    '还想加点什么吗？说给我听，我马上变出来！',
    '要不要再加点新花样？比如换个地方、加个新本领？',
    '你还想让它变得更酷吗？告诉我你的新想法！',
  ]);
}

/** 倾听阶段的开场白 */
export function listenPrompt(hasBase: boolean): string {
  return hasBase
    ? '想改点什么、加点什么？说吧，我听着呢！'
    : pick([
        '你好呀！今天想做一个什么样的游戏？说给我听！',
        '嗨！把你脑袋里的奇思妙想说出来，我帮你变成真的！',
        '想一想：谁当主角？在哪里玩？想怎么玩？说吧！',
      ]);
}

/** 空输入的温柔引导 */
export function nudgeLine(): string {
  return pick([
    '再大点声告诉我吧！比如“我想要恐龙赛跑”！',
    '没听清呢～你想让谁当主角呀？',
  ]);
}
