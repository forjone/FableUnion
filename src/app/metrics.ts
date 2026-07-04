// 成功指标埋点（PRD 第 8 节）。全部本地聚合，家长门户展示。

export type MetricEvent =
  | 'session_start'        // 从欢迎页开始一次新创作
  | 'divergence_visual'    // 双草图分歧展示
  | 'divergence_cards'     // 兜底图卡分歧展示
  | 'sketch_silent_pass'   // 草图沉默通过（隐式确认成功）
  | 'sketch_button_pass'   // 草图点“好耶”通过
  | 'sketch_interrupt'     // 草图被打断
  | 'confirm_yes'          // 显式确认通过（“这就是我想要的”）
  | 'confirm_no'
  | 'build_done'           // 完成一次构建（①→④ 转化）
  | 'iterate'              // 继续迭代
  | 'replay'
  | 'magic_ready'          // AI 魔法图成功
  | 'magic_failed'
  | 'safety_block';

const KEY = 'fable.metrics';

type Counts = Partial<Record<MetricEvent, number>>;

export function record(e: MetricEvent) {
  try {
    const c = loadCounts();
    c[e] = (c[e] ?? 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch { /* ignore */ }
}

export function loadCounts(): Counts {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Counts) : {};
  } catch {
    return {};
  }
}

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—');
const avg = (a: number, b: number) => (b > 0 ? (a / b).toFixed(1) : '—');

/** PRD 第 8 节指标的本地汇总 */
export function metricsSummary(): { label: string; value: string }[] {
  const c = loadCounts();
  const n = (e: MetricEvent) => c[e] ?? 0;
  const sketchTotal = n('sketch_silent_pass') + n('sketch_button_pass') + n('sketch_interrupt');
  const divTotal = n('divergence_visual') + n('divergence_cards');
  return [
    { label: '完成转化率（开始→造好）', value: pct(n('build_done'), n('session_start')) },
    { label: '平均澄清轮次 / 作品', value: avg(divTotal, n('build_done')) },
    { label: '其中双图指选占比', value: pct(n('divergence_visual'), divTotal) },
    { label: '草图隐式确认通过率', value: pct(n('sketch_silent_pass') + n('sketch_button_pass'), sketchTotal) },
    { label: '“就是这个”确认率', value: pct(n('confirm_yes'), n('confirm_yes') + n('confirm_no')) },
    { label: '继续迭代次数', value: String(n('iterate')) },
    { label: 'AI 魔法图成功率', value: pct(n('magic_ready'), n('magic_ready') + n('magic_failed')) },
    { label: '安全拦截次数', value: String(n('safety_block')) },
  ];
}
