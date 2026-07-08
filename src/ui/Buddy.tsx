import { getBuddyImage, getVisualCharacter, pickBuddyVisualState } from './buddyVisuals'

/**
 * 小人系统：按人生角色选择小贝/小川立绘，再由心态、事件和工作状态切换视觉状态。
 * 情绪 API 保持稳定，避免游戏页和结局卡感知视觉实现细节。
 */

export type Emotion = 'joy' | 'calm' | 'worry' | 'anger' | 'grief'

export const EMOTION_LABEL: Record<Emotion, string> = {
  joy: '喜',
  anger: '怒',
  worry: '哀',
  calm: '乐',
  grief: '悲',
}

/** 心态值 -> 常态情绪 */
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

export function Buddy(props: {
  characterId: string
  emotion: Emotion
  siteLive: boolean
  working: boolean
  mood?: number
  burst?: boolean
  /** 房间等级：随收入梯度升级陈设（0 起步 / 1 十刀 / 2 百刀） */
  tier?: number
}) {
  const { characterId, emotion, siteLive, working } = props
  const tier = props.tier ?? 0
  const visualState = pickBuddyVisualState({
    emotion,
    mood: props.mood,
    working,
    burst: props.burst,
  })
  const visualCharacter = getVisualCharacter(characterId)
  const image = getBuddyImage(characterId, visualState)

  return (
    <div
      className={[
        'buddy-stage',
        `emo-${emotion}`,
        `visual-${visualState}`,
        `char-${visualCharacter}`,
        working ? 'working' : '',
        props.burst ? 'burst' : '',
      ].join(' ')}
      role="img"
      aria-label={`你的小人此刻的情绪：${EMOTION_LABEL[emotion]}`}
    >
      <div className="buddy-wall">
        <div className="buddy-window" aria-hidden="true">
          <span className="moon" />
          <span className="star s1" />
          <span className="star s2" />
          <span className="skyline" />
        </div>
        {tier >= 1 && <div className="buddy-poster" aria-hidden="true" />}
        {tier >= 2 && (
          <div className="buddy-trophy-shelf" aria-hidden="true">
            <span />
            <span />
          </div>
        )}
      </div>

      <div className="buddy-monitor" aria-hidden="true">
        <span className={siteLive ? 'monitor-led on' : 'monitor-led'} />
        <span className="monitor-line l1" />
        <span className="monitor-line l2" />
      </div>

      <div className="buddy-plant" aria-hidden="true">
        <span className="stem" />
        <span className="leaf left" />
        <span className="leaf right" />
        <span className="pot" />
      </div>

      <div className="buddy-shadow" aria-hidden="true" />
      <div className="buddy-desk" aria-hidden="true" />
      <img className="buddy-character-img" src={image} alt="" draggable={false} />
      <div className="buddy-stage-light" aria-hidden="true" />
    </div>
  )
}
