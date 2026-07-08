import type { GameState, LifePack } from '../engine/types'
import { getBuddyImage, visualStateForEnding } from './buddyVisuals'
import { formatStat } from './format'
import { drawIcon } from './icons'

const GRADE_COLORS: Record<string, string> = {
  S: '#f5c518',
  A: '#7ee787',
  B: '#79c0ff',
  C: '#d2a8ff',
  D: '#8b949e',
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image load failed: ${src}`))
    img.src = src
  })
}

/** 把一局人生画成一张可分享的结局卡 PNG（含小人的最终状态） */
export async function drawEndingCard(pack: LifePack, state: GameState): Promise<HTMLCanvasElement> {
  const W = 900
  const H = 1460
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

  // 小人的最终状态
  try {
    const img = await loadImage(getBuddyImage(state.characterId, visualStateForEnding(ending.grade)))
    drawBuddyStage(ctx, img, (W - 360) / 2, 704, 360, 260, !!state.flags.siteLive)
  } catch {
    // 小人渲染失败不阻塞出卡
  }

  // 收入曲线
  const chartTop = 1004
  const chartH = 170
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
  const msY = chartTop + chartH + 100
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
  ctx.fillText('你会活出怎样的出海人生？', W / 2, H - 96)
  ctx.fillText('FABLEUNION —— 不同人生的体验', W / 2, H - 58)

  return canvas
}

function drawBuddyStage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  siteLive: boolean,
): void {
  ctx.save()
  roundRect(ctx, x, y, w, h, 24)
  const bg = ctx.createLinearGradient(0, y, 0, y + h)
  bg.addColorStop(0, '#1b2a3b')
  bg.addColorStop(0.62, '#111a25')
  bg.addColorStop(1, '#0a0d12')
  ctx.fillStyle = bg
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 2
  ctx.stroke()

  const glow = ctx.createRadialGradient(x + w / 2, y + h * 0.74, 20, x + w / 2, y + h * 0.74, w * 0.42)
  glow.addColorStop(0, 'rgba(245,166,35,0.28)')
  glow.addColorStop(1, 'rgba(245,166,35,0)')
  ctx.fillStyle = glow
  ctx.fillRect(x, y, w, h)

  // Window
  ctx.fillStyle = '#0b1220'
  ctx.strokeStyle = '#3a465a'
  ctx.lineWidth = 1.5
  roundRect(ctx, x + 28, y + 28, 84, 58, 8)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = 'rgba(216,222,233,0.85)'
  ctx.beginPath()
  ctx.arc(x + 48, y + 47, 7, 0, Math.PI * 2)
  ctx.fill()

  // Monitor
  ctx.fillStyle = '#202a39'
  ctx.strokeStyle = '#3a4356'
  roundRect(ctx, x + w - 102, y + h - 112, 64, 45, 7)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = siteLive ? '#7ee787' : '#4a5264'
  ctx.beginPath()
  ctx.arc(x + w - 51, y + h - 78, 4, 0, Math.PI * 2)
  ctx.fill()

  // Desk and shadow
  ctx.fillStyle = 'rgba(0,0,0,0.36)'
  ctx.beginPath()
  ctx.ellipse(x + w / 2, y + h - 52, 74, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  const desk = ctx.createLinearGradient(0, y + h - 74, 0, y + h - 42)
  desk.addColorStop(0, '#454e61')
  desk.addColorStop(1, '#262d3b')
  ctx.fillStyle = desk
  roundRect(ctx, x + 34, y + h - 76, w - 68, 28, 9)
  ctx.fill()

  const imgW = w * 0.56
  const imgH = h * 0.86
  ctx.drawImage(img, x + (w - imgW) / 2, y + h - imgH - 36, imgW, imgH)
  ctx.restore()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
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
