import type { GameState, LifePack } from '../engine/types'
import { formatStat } from './format'
import { drawIcon } from './icons'

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
  const gradeColor = GRADE_COLORS[ending.grade] ?? '#fff'

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#10131a')
  bg.addColorStop(1, '#191230')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 2
  ctx.strokeRect(28, 28, W - 56, H - 56)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.strokeRect(40, 40, W - 80, H - 80)

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '600 26px system-ui, sans-serif'
  ctx.fillText(`FABLEUNION · ${pack.name}`, W / 2, 104)

  // 评级奖章：双环 + 等级字母
  const medalY = 240
  ctx.beginPath()
  ctx.arc(W / 2, medalY, 76, 0, Math.PI * 2)
  ctx.strokeStyle = gradeColor
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(W / 2, medalY, 64, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fill()
  ctx.strokeStyle = gradeColor
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = gradeColor
  ctx.font = 'bold 64px system-ui, sans-serif'
  ctx.fillText(ending.grade, W / 2, medalY + 22)
  // 奖章绶带线
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(W / 2 - 190, medalY)
  ctx.lineTo(W / 2 - 96, medalY)
  ctx.moveTo(W / 2 + 96, medalY)
  ctx.lineTo(W / 2 + 190, medalY)
  ctx.stroke()

  // 结局标题
  ctx.fillStyle = gradeColor
  ctx.font = 'bold 54px system-ui, sans-serif'
  ctx.fillText(ending.title, W / 2, 396)

  // 角色与时长
  if (character) {
    drawIcon(ctx, character.icon, W / 2 - 150, 432, 30, 'rgba(255,255,255,0.8)', 2)
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = '30px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${character.name} · 第 ${state.turn} ${pack.turnUnit}`, W / 2 - 110, 456)
    ctx.textAlign = 'center'
  }

  // 结局文案
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.font = '29px system-ui, sans-serif'
  wrapText(ctx, ending.text, W / 2, 530, W - 170, 46)

  // 收入曲线
  const chartTop = 760
  const chartH = 180
  const chartLeft = 100
  const chartW = W - 200
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  ctx.fillRect(chartLeft, chartTop, chartW, chartH)
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = 1
  ctx.strokeRect(chartLeft, chartTop, chartW, chartH)
  const history = state.chartHistory
  if (history.length > 1) {
    const max = Math.max(...history, 0.01)
    // 曲线下方渐隐填充
    ctx.beginPath()
    ctx.moveTo(chartLeft, chartTop + chartH)
    history.forEach((v, i) => {
      const x = chartLeft + (i / (history.length - 1)) * chartW
      const y = chartTop + chartH - (v / max) * (chartH - 14)
      ctx.lineTo(x, y)
    })
    ctx.lineTo(chartLeft + chartW, chartTop + chartH)
    ctx.closePath()
    const fillGrad = ctx.createLinearGradient(0, chartTop, 0, chartTop + chartH)
    fillGrad.addColorStop(0, 'rgba(126,231,135,0.28)')
    fillGrad.addColorStop(1, 'rgba(126,231,135,0)')
    ctx.fillStyle = fillGrad
    ctx.fill()
    ctx.beginPath()
    history.forEach((v, i) => {
      const x = chartLeft + (i / (history.length - 1)) * chartW
      const y = chartTop + chartH - (v / max) * (chartH - 14)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#7ee787'
    ctx.lineWidth = 3
    ctx.stroke()
  }
  const chartDef = pack.stats.find((s) => s.id === pack.chartStat)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '26px system-ui, sans-serif'
  ctx.fillText(
    `${chartDef?.name ?? ''}曲线 · 最终 ${formatStat(chartDef, state.stats[pack.chartStat] ?? 0)}`,
    W / 2,
    chartTop + chartH + 44,
  )

  // 里程碑
  const hit = pack.milestones.filter((m) => state.milestonesHit.includes(m.id))
  const msY = chartTop + chartH + 112
  if (hit.length > 0) {
    drawIcon(ctx, 'trophy', W / 2 - measureCenterOffset(ctx, hit) - 40, msY - 22, 28, GRADE_COLORS.S, 2)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '28px system-ui, sans-serif'
    ctx.fillText(hit.map((m) => m.title).join('  ·  '), W / 2 + 18, msY)
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '28px system-ui, sans-serif'
    ctx.fillText('这一局没有解锁任何成就，但经历本身就是收获。', W / 2, msY)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.font = '24px system-ui, sans-serif'
  ctx.fillText('你会活出怎样的出海人生？', W / 2, H - 104)
  ctx.fillText('FABLEUNION —— 不同人生的体验', W / 2, H - 66)

  return canvas
}

function measureCenterOffset(
  ctx: CanvasRenderingContext2D,
  hit: { title: string }[],
): number {
  ctx.font = '28px system-ui, sans-serif'
  return ctx.measureText(hit.map((m) => m.title).join('  ·  ')).width / 2
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
