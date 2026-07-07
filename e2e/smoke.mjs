/**
 * 端到端冒烟：构建产物 → 预览服务器 → 真实浏览器完整走一遍游戏流程。
 * 运行：npm run build && npm run test:e2e
 * 本地若 Playwright 默认浏览器不可用，可用 FABLE_CHROME 指定 Chromium 路径。
 */
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const PORT = 4519
const BASE = `http://localhost:${PORT}`
const SHOTS = new URL('./screenshots/', import.meta.url).pathname
mkdirSync(SHOTS, { recursive: true })

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
  detached: false,
})

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(BASE)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('preview server did not start')
}

const exe = process.env.FABLE_CHROME
let exitCode = 0
try {
  await waitForServer()
  const browser = await chromium.launch(exe ? { executablePath: exe } : {})
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console: ' + m.text())
  })

  await page.goto(BASE)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForSelector('.start-screen')
  await page.screenshot({ path: SHOTS + '1-start.png' })
  await page.click('button:has-text("开始这段人生")')
  await page.waitForSelector('.game-screen')

  // 新手引导
  for (let i = 0; i < 4; i++) {
    if (await page.locator('.onboard-modal').count()) {
      await page.click('.onboard-modal .btn.primary')
      await page.waitForTimeout(120)
    }
  }

  for (let week = 1; week <= 14; week++) {
    await page.waitForSelector('.plan', { timeout: 4000 })
    for (const name of ['需求分析', '关键词调研', '上站！', '写内容', '加外链', '接入广告', '打磨产品']) {
      const btn = page.locator(`.task-card:has-text("${name}")`).first()
      if ((await btn.count()) > 0 && (await btn.isEnabled())) await btn.click().catch(() => {})
    }
    await page.click('.plan .btn.primary')
    for (let guard = 0; guard < 12; guard++) {
      await page.waitForTimeout(220)
      if (await page.locator('.milestone-splash').count()) {
        await page.click('.milestone-splash .btn.primary')
        continue
      }
      if (await page.locator('.report-modal').count()) {
        await page.click('.report-modal .btn.primary')
        continue
      }
      if (await page.locator('.result-modal').count()) {
        await page.click('.result-modal .btn.primary')
        continue
      }
      if (await page.locator('.event-modal .choices').count()) {
        await page.locator('.event-modal .btn.choice:not(.disabled)').first().click()
        continue
      }
      break
    }
    if (await page.locator('.ending-screen').count()) break
  }
  await page.screenshot({ path: SHOTS + '2-midgame.png' })

  // 注入临近终局的存档，验证结局卡（含小人）渲染
  const save = {
    v: 2,
    state: {
      packId: 'site-builder',
      characterId: 'programmer',
      turn: 104,
      phase: 'plan',
      stats: { cash: 52000, energy: 10, mood: 70, income: 23.4, dev: 80, seo: 62, eng: 55, product: 70, polish: 6 },
      flags: { siteLive: true, adsense: true, keywordsDone: true, didResearch: true },
      usedOnce: {},
      cooldowns: {},
      chosenTasks: [],
      pendingEvents: [],
      log: [{ turn: 1, text: '开始。', kind: 'system' }],
      chartHistory: Array.from({ length: 103 }, (_, i) => Math.max(0, (i - 8) ** 1.6 / 40)),
      milestonesHit: ['firstCent', 'oneDollar', 'tenDollars'],
      recentValence: [],
      ending: null,
    },
  }
  await page.evaluate((s) => localStorage.setItem('fableunion.save.v2', JSON.stringify(s)), save)
  await page.reload()
  await page.waitForSelector('.game-screen')
  await page.click('.plan .btn.primary')
  for (let guard = 0; guard < 12; guard++) {
    await page.waitForTimeout(220)
    if (await page.locator('.milestone-splash').count()) { await page.click('.milestone-splash .btn.primary'); continue }
    if (await page.locator('.report-modal').count()) { await page.click('.report-modal .btn.primary'); continue }
    if (await page.locator('.result-modal').count()) { await page.click('.result-modal .btn.primary'); continue }
    if (await page.locator('.event-modal .choices').count()) {
      await page.locator('.event-modal .btn.choice:not(.disabled)').first().click()
      continue
    }
    break
  }
  await page.waitForSelector('.ending-screen', { timeout: 5000 })
  await page.waitForSelector('.ending-canvas', { timeout: 5000 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: SHOTS + '3-ending.png' })

  // 图鉴应记录到这局
  await page.click('button:has-text("再活一次")')
  await page.waitForSelector('.start-screen')
  await page.click('button:has-text("图鉴 · 战绩")')
  await page.waitForSelector('.codex-screen')
  await page.screenshot({ path: SHOTS + '4-codex.png' })
  const runsCount = await page.locator('.codex-stat-value').first().textContent()
  if (Number(runsCount) < 1) throw new Error('run was not recorded in profile')

  console.log('e2e ok · runs recorded:', runsCount?.trim())
  console.log('errors:', errors.length ? errors : 'none')
  await browser.close()
  if (errors.length) exitCode = 1
} catch (err) {
  console.error(err)
  exitCode = 1
} finally {
  server.kill()
}
process.exit(exitCode)
