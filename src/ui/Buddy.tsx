/**
 * 小人系统：一个住在小房间里的拟人角色。
 * 表情覆盖 喜/怒/哀/乐/悲 五态：乐是常态基线，喜/怒/悲 由事件瞬时触发，
 * 哀/悲 也会随心态值持续走低而成为常态。纯 SVG 矢量，无 emoji。
 */

export type Emotion = 'joy' | 'calm' | 'worry' | 'anger' | 'grief'

export const EMOTION_LABEL: Record<Emotion, string> = {
  joy: '喜',
  anger: '怒',
  worry: '哀',
  calm: '乐',
  grief: '悲',
}

/** 心态值 → 常态情绪 */
export function baseEmotion(mood: number): Emotion {
  if (mood >= 78) return 'joy'
  if (mood >= 45) return 'calm'
  if (mood >= 22) return 'worry'
  return 'grief'
}

const QUIPS: Record<Emotion, string[]> = {
  joy: ['成了！这波稳了！', '曲线在动，真的在动！', '今天的咖啡格外香。', '就说能行吧！'],
  calm: ['继续，一步一步来。', '平平淡淡也是进度。', '今天也在认真搬砖。', '先把手里的事做完。'],
  worry: ['存款……还够撑几周？', '再试一次，应该行……吧。', '别慌，问题总有解法。', '睡前又刷了一遍后台。'],
  anger: ['凭什么拒我外链？！', '这破算法到底怎么回事！', '气死了，想砸键盘。', '就差一点，就差一点！'],
  grief: ['好累啊……今天不想看后台了。', '努力为什么没有回报……', '让我缓一缓。', '要不……算了吧。'],
}

export function pickQuip(emotion: Emotion, seed: number): string {
  const list = QUIPS[emotion]
  return list[Math.abs(seed) % list.length]
}

const SKIN = '#e8b98c'
const HAIR = '#262b36'
const HOODIE = '#41506b'

function Face(props: { emotion: Emotion }) {
  const e = props.emotion
  return (
    <g>
      {/* 眉毛 */}
      {e === 'joy' && (
        <g stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M89 43 q3.5 -2.5 7 0" />
          <path d="M104 43 q3.5 -2.5 7 0" />
        </g>
      )}
      {e === 'calm' && (
        <g stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M89.5 44.5 q3 -1.5 6 0" />
          <path d="M104.5 44.5 q3 -1.5 6 0" />
        </g>
      )}
      {(e === 'worry' || e === 'grief') && (
        <g stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M89 45.5 L96 43" />
          <path d="M104 43 L111 45.5" />
        </g>
      )}
      {e === 'anger' && (
        <g stroke={HAIR} strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M89 42.5 L96 45.5" />
          <path d="M104 45.5 L111 42.5" />
        </g>
      )}

      {/* 眼睛 */}
      {e === 'joy' && (
        <g stroke={HAIR} strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M90.5 50.5 q3 -3.5 6 0" />
          <path d="M103.5 50.5 q3 -3.5 6 0" />
        </g>
      )}
      {e === 'calm' && (
        <g fill={HAIR}>
          <circle cx="93.5" cy="50" r="1.9" />
          <circle cx="106.5" cy="50" r="1.9" />
        </g>
      )}
      {e === 'worry' && (
        <g fill={HAIR}>
          <circle cx="93.5" cy="51" r="1.7" />
          <circle cx="106.5" cy="51" r="1.7" />
        </g>
      )}
      {e === 'anger' && (
        <g fill={HAIR}>
          <circle cx="93.5" cy="50.5" r="1.8" />
          <circle cx="106.5" cy="50.5" r="1.8" />
        </g>
      )}
      {e === 'grief' && (
        <g stroke={HAIR} strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M90.5 50 q3 3 6 0" />
          <path d="M103.5 50 q3 3 6 0" />
        </g>
      )}

      {/* 嘴 */}
      {e === 'joy' && <path d="M92.5 57.5 q7.5 8.5 15 0 z" fill="#7a4a3a" />}
      {e === 'calm' && (
        <path d="M95 60 q5 3.2 10 0" stroke="#7a4a3a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
      {e === 'worry' && (
        <path d="M95.5 61.5 q4.5 -2.2 9 0" stroke="#7a4a3a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
      {e === 'anger' && (
        <path
          d="M93.5 61 l3.2 -2 l3.3 2 l3.3 -2 l3.2 2"
          stroke="#7a4a3a"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
      {e === 'grief' && (
        <path d="M94.5 62.5 q5.5 -4.5 11 0" stroke="#7a4a3a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}

      {/* 情绪附加物 */}
      {e === 'joy' && (
        <g stroke="#f5c518" strokeWidth="1.4" strokeLinecap="round" className="buddy-sparkles">
          <path d="M78 34 v5 M75.5 36.5 h5" />
          <path d="M122 40 v4 M120 42 h4" />
        </g>
      )}
      {e === 'anger' && (
        <g stroke="#ff7b72" strokeWidth="1.6" strokeLinecap="round" className="buddy-anger-mark">
          <path d="M117 33 l5 5 M122 33 l-5 5" />
        </g>
      )}
      {e === 'worry' && <path d="M84.5 44 q-2.6 3.4 0 5 q2.6 -1.6 0 -5z" fill="#79c0ff" opacity="0.9" />}
      {e === 'grief' && (
        <path className="buddy-tear" d="M92.5 55 q-2.2 3.6 0 5.2 q2.2 -1.6 0 -5.2z" fill="#79c0ff" />
      )}
    </g>
  )
}

export function Buddy(props: { emotion: Emotion; siteLive: boolean; working: boolean }) {
  const { emotion, siteLive, working } = props
  return (
    <svg
      className="buddy-svg"
      viewBox="0 0 210 150"
      role="img"
      aria-label={`你的小人此刻的情绪：${EMOTION_LABEL[emotion]}`}
    >
      {/* 房间 */}
      <rect x="1" y="1" width="208" height="148" rx="12" fill="#151a24" stroke="#2b3240" />
      <line x1="1" y1="116" x2="209" y2="116" stroke="#232936" strokeWidth="1.5" />
      {/* 窗户与夜空 */}
      <g>
        <rect x="16" y="18" width="46" height="38" rx="3" fill="#10182b" stroke="#333c4e" strokeWidth="1.5" />
        <line x1="39" y1="18" x2="39" y2="56" stroke="#333c4e" strokeWidth="1.2" />
        <line x1="16" y1="37" x2="62" y2="37" stroke="#333c4e" strokeWidth="1.2" />
        <circle cx="30" cy="27" r="4" fill="#d8dee9" opacity="0.85" />
        <circle cx="50" cy="46" r="0.9" fill="#d8dee9" opacity="0.7" />
        <circle cx="55" cy="24" r="0.7" fill="#d8dee9" opacity="0.5" />
        <circle cx="22" cy="48" r="0.7" fill="#d8dee9" opacity="0.5" />
      </g>
      {/* 绿植 */}
      <g>
        <path d="M30 116 h14 l-2 -10 h-10 z" fill="#3b3226" />
        <g stroke="#4f8f5e" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M37 106 q-1 -8 -6 -11" />
          <path d="M37 106 q1 -9 5 -12" />
          <path d="M37 106 q0 -6 0 -9" />
        </g>
      </g>
      {/* 书桌 */}
      <rect x="70" y="94" width="126" height="6" rx="2" fill="#3b4150" />
      <rect x="78" y="100" width="5" height="16" fill="#303643" />
      <rect x="183" y="100" width="5" height="16" fill="#303643" />
      {/* 笔记本（背面朝观众） */}
      <g>
        <path d="M146 70 h30 l3 24 h-36 z" fill="#2a3140" stroke="#3a4356" strokeWidth="1.2" />
        <circle
          cx="161"
          cy="82"
          r="2.6"
          fill={siteLive ? '#7ee787' : '#4a5264'}
          className={siteLive ? 'buddy-led' : ''}
        />
        <rect x="140" y="94" width="42" height="3" rx="1.5" fill="#454e61" />
      </g>
      {/* 马克杯 */}
      <g>
        <rect x="122" y="86" width="9" height="8" rx="1.5" fill="#8a5a44" />
        <path d="M131 88 q4 1.5 0 4" stroke="#8a5a44" strokeWidth="1.6" fill="none" />
        <path className="buddy-steam" d="M126 83 q1.5 -2 0 -4" stroke="#9aa5b4" strokeWidth="1" fill="none" opacity="0.6" />
      </g>

      {/* 小人 */}
      <g className={`buddy-figure emo-${emotion}${working ? ' working' : ''}`}>
        {/* 身体 */}
        <path d="M76 94 q0 -22 24 -22 q24 0 24 22 z" fill={HOODIE} />
        <path d="M96 72 h8 v6 h-8 z" fill={SKIN} />
        {/* 手臂搭在桌上 */}
        <path d="M79 88 q4 8 18 8" stroke={HOODIE} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M121 88 q-4 8 -18 8" stroke={HOODIE} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="97" cy="95" r="3.2" fill={SKIN} className="buddy-hand-l" />
        <circle cx="103" cy="95" r="3.2" fill={SKIN} className="buddy-hand-r" />
        {/* 头 */}
        <g className="buddy-head">
          <circle cx="100" cy="51" r="17" fill={SKIN} />
          <path d="M83.5 47 q1 -14.5 16.5 -14.5 q15.5 0 16.5 14.5 q-5 -7 -16.5 -7 q-11.5 0 -16.5 7 z" fill={HAIR} />
          <Face emotion={emotion} />
        </g>
      </g>
    </svg>
  )
}
