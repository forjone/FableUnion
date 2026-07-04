// 内容安全过滤（PRD 第 5 节）。
// 输入侧：拦截不适合儿童创作的内容，小灵温柔地引导换主意（永远不说“不行”式的拒绝）。
// 输出侧：面向孩子的文本全部由受控模板生成；图片 prompt 固定追加安全后缀（见 imagegen.ts）。
// 所有拦截事件写入本地安全日志，家长门户可查看。

export interface SafetyEvent {
  at: number;
  label: string;
  text: string;
  action: 'redirected';
}

interface SafetyRule {
  re: RegExp;
  label: string;
  /** 小灵的引导话术 */
  line: string;
}

const RULES: SafetyRule[] = [
  {
    re: /杀死|杀掉|血腥|流血|砍死|打死|枪|炸弹|自杀|尸体/,
    label: '暴力内容',
    line: '这个有点太吓人啦！我们做个更好玩的吧——比如让它们来一场超级赛跑？',
  },
  {
    re: /亲嘴|接吻|脱衣|裸/,
    label: '不适宜内容',
    line: '嘻嘻，这个不太适合我们的小工坊哦！想想看，你最喜欢的动物是谁呀？',
  },
  {
    re: /电话号码|手机号|住在.{0,6}(路|街|号|小区)|家庭住址|身份证/,
    label: '个人信息',
    line: '小秘密要保护好，不能放进作品里哦！我们让小主角住在魔法城堡怎么样？',
  },
  {
    re: /恐怖片|鬼片|吓死/,
    label: '惊吓内容',
    line: '太吓人的东西会做噩梦的！要不要做一个神秘但是不吓人的夜晚城堡？',
  },
];

const LOG_KEY = 'fable.safety';

export function checkText(text: string): { ok: true } | { ok: false; label: string; line: string } {
  for (const r of RULES) {
    if (r.re.test(text)) return { ok: false, label: r.label, line: r.line };
  }
  return { ok: true };
}

export function logSafety(label: string, text: string) {
  try {
    const list = loadSafetyLog();
    list.unshift({ at: Date.now(), label, text, action: 'redirected' });
    localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, 100)));
  } catch { /* ignore */ }
}

export function loadSafetyLog(): SafetyEvent[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const list = raw ? (JSON.parse(raw) as SafetyEvent[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** 数据隐私（PRD 第 5 节）：一键清空本机所有数据（最小化存储的配套控制） */
export function clearAllLocalData() {
  try {
    for (const k of ['fable.works', 'fable.safety', 'fable.metrics', 'fable.sound', 'fable.imggen', 'fable.pin', 'fable.tier']) {
      localStorage.removeItem(k);
    }
  } catch { /* ignore */ }
}
