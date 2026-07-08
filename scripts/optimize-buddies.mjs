/**
 * 立绘优化：把 public/images/buddies 下的 PNG 原图压成 512px 宽的 WebP。
 * 原始高清稿保留在 images/ 目录，不受影响。
 * 运行：node scripts/optimize-buddies.mjs
 */
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('../public/images/buddies', import.meta.url).pathname
let before = 0
let after = 0

for (const dir of readdirSync(ROOT)) {
  const charDir = join(ROOT, dir)
  if (!statSync(charDir).isDirectory()) continue
  for (const file of readdirSync(charDir)) {
    if (!file.endsWith('.png')) continue
    const src = join(charDir, file)
    const dst = src.replace(/\.png$/, '.webp')
    before += statSync(src).size
    await sharp(src).resize({ width: 512 }).webp({ quality: 84 }).toFile(dst)
    after += statSync(dst).size
    console.log(`${dir}/${file} -> ${(statSync(dst).size / 1024).toFixed(0)} KB`)
  }
}
console.log(`total: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(2)} MB`)
