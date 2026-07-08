/**
 * FableUnion 排行榜 · Cloudflare Worker + D1
 *
 * 部署步骤（一次性，约十分钟）：
 *   1. npm i -g wrangler && wrangler login
 *   2. wrangler d1 create fableunion-leaderboard
 *      把返回的 database_id 填进 server/wrangler.toml
 *   3. wrangler d1 execute fableunion-leaderboard --file=server/schema.sql --remote
 *   4. cd server && wrangler deploy
 *   5. 前端构建时设置 VITE_LEADERBOARD_URL=https://<worker 域名>
 *      （GitHub Pages：仓库 Settings → Secrets and variables → Actions → Variables 新增，
 *        CI 已透传该变量）
 */

const MAX_FINAL = 100000 // 数值上限：日入十万刀视为作弊提交
const GRADES = new Set(['S', 'A', 'B', 'C', 'D'])

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })

    if (request.method === 'POST' && url.pathname === '/submit') {
      let body
      try {
        body = await request.json()
      } catch {
        return json({ error: 'bad json' }, 400)
      }
      const name = String(body.name ?? '').trim().slice(0, 16)
      const grade = String(body.grade ?? '')
      const final = Number(body.final)
      const turns = Number(body.turns)
      if (!name || !GRADES.has(grade)) return json({ error: 'bad fields' }, 400)
      if (!Number.isFinite(final) || final < 0 || final > MAX_FINAL) return json({ error: 'bad final' }, 400)
      if (!Number.isInteger(turns) || turns < 1 || turns > 1000) return json({ error: 'bad turns' }, 400)

      // 朴素限频：同一 IP 每分钟最多 6 次提交
      const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
      const recent = await env.DB.prepare(
        'SELECT COUNT(*) AS n FROM scores WHERE ip = ? AND date > ?',
      )
        .bind(ip, Date.now() - 60_000)
        .first()
      if ((recent?.n ?? 0) >= 6) return json({ error: 'rate limited' }, 429)

      await env.DB.prepare(
        `INSERT INTO scores (name, pack_id, character_id, ending_id, ending_title, grade, turns, final, date, ip)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          name,
          String(body.packId ?? '').slice(0, 40),
          String(body.characterId ?? '').slice(0, 40),
          String(body.endingId ?? '').slice(0, 40),
          String(body.endingTitle ?? '').slice(0, 60),
          grade,
          turns,
          final,
          Date.now(),
          ip,
        )
        .run()
      return json({ ok: true })
    }

    if (request.method === 'GET' && url.pathname === '/top') {
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20))
      const rows = await env.DB.prepare(
        `SELECT name, character_id AS characterId, ending_title AS endingTitle,
                grade, turns, final, date
         FROM scores ORDER BY final DESC, date ASC LIMIT ?`,
      )
        .bind(limit)
        .all()
      return json({ entries: rows.results ?? [] })
    }

    return json({ error: 'not found' }, 404)
  },
}
