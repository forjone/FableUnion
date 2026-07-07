import type { GameState, LifePack } from '../engine/types'
import { formatStat } from './format'

const GRADE_COLORS: Record<string, string> = {
  S: '#f5c518',
  A: '#7ee787',
  B: '#79c0ff',
  C: '#d2a8ff',
  D: '#8b949e',
}

/** 把一局人生画成一张可分享的结局卡 PNG */
export function drawEndingCard(pack: LifePack, state: GameState): HTMLCanvasElement {
  const W = 900
  const H = 1200
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const ending = state.ending!
  const character = pack.characters.find((c) => c.id === state.characterId)

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#10131a')
  bg.addColorStop(1, '#1a1230')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 2
  ctx.strokeRect(24, 24, W - 48, H - 48)

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '28px system-ui, sans-serif'
  ctx.fillText(`FableUnion · ${pack.name}`, W / 2, 96)

  // 结局图标与标题
  ctx.font = '110px system-ui, sans-serif'
  ctx.fillText(ending.icon, W / 2, 240)
  ctx.fillStyle = GRADE_COLORS[ending.grade] ?? '#fff'
  ctx.font = 'bold 56px system-ui, sans-serif'
  ctx.fillText(ending.title, W / 2, 330)

  // 评级徽章
  ctx.font = 'bold 36px system-ui, sans-serif'
  ctx.fillStyle = '#10131a'
  const badgeY = 380
  ctx.beginPath()
  ctx.arc(W / 2, badgeY, 34, 0, Math.PI * 2)
  ctx.fillStyle = GRADE_COLORS[ending.grade] ?? '#fff'
  ctx.fill()
  ctx.fillStyle = '#10131a'
  ctx.fillText(ending.grade, W / 2, badgeY + 13)

  // 角色与时长
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '32px system-ui, sans-serif'
  ctx.fillText(
    `${character?.icon ?? ''} ${character?.name ?? ''} · 第 ${state.turn} ${pack.turnUnit}`,
    W / 2,
    470,
  )

  // 结局文案（手动换行）
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = '30px system-ui, sans-serif'
  wrapText(ctx, ending.text, W / 2, 540, W - 160, 46)

  // 收入曲线
  const chartTop = 760
  const chartH = 180
  const chartLeft = 100
  const chartW = W - 200
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(chartLeft, chartTop, chartW, chartH)
  const history = state.chartHistory
  if (history.length > 1) {
    const max = Math.max(...history, 0.01)
    ctx.beginPath()
    history.forEach((v, i) => {
      const x = chartLeft + (i / (history.length - 1)) * chartW
      const y = chartTop + chartH - (v / max) * (chartH - 12)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#7ee787'
    ctx.lineWidth = 3
    ctx.stroke()
  }
  const chartDef = pack.stats.find((s) => s.id === pack.chartStat)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '26px system-ui, sans-serif'
  ctx.fillText(
    `${chartDef?.name ?? ''}曲线 · 最终 ${formatStat(chartDef, state.stats[pack.chartStat] ?? 0)}`,
    W / 2,
    chartTop + chartH + 44,
  )

  // 里程碑
  const hit = pack.milestones.filter((m) => state.milestonesHit.includes(m.id))
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '28px system-ui, sans-serif'
  const msY = chartTop + chartH + 110
  if (hit.length > 0) {
    ctx.fillText('🏆 ' + hit.map((m) => m.title).join(' · '), W / 2, msY)
  } else {
    ctx.fillText('这一局没有解锁任何成就，但经历本身就是收获。', W / 2, msY)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '24px system-ui, sans-serif'
  ctx.fillText('你会活出怎样的出海人生？', W / 2, H - 100)
  ctx.fillText('FableUnion —— 不同人生的体验', W / 2, H - 64)

  return canvas
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const chars = Array.from(text)
  let line = ''
  let cy = y
  for (const ch of chars) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, x, cy)
      line = ch
      cy += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, cy)
}
