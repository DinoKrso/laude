// Renders the Instagram reel (promo.html) frame by frame and encodes an MP4.
// Needs: `npm run dev` running on :5173, Playwright (`npx playwright install chromium`) and ffmpeg on PATH.
// Usage: node scripts/render-reel.mjs [out.mp4]
import { chromium } from 'playwright'
import { mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const out = process.argv[2] || 'promo-video/laude-reel-9x16.mp4'
const frames = 'promo-video/frames'
const fps = 30
rmSync(frames, { recursive: true, force: true })
mkdirSync(frames, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
await page.goto('http://localhost:5173/promo.html')
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 })
await page.evaluate(() => document.fonts.ready)
const total = Math.round((await page.evaluate(() => window.__duration)) * fps)
for (let f = 0; f < total; f++) {
  await page.evaluate((t) => window.__setTime(t), f / fps)
  await page.screenshot({ path: `${frames}/f_${String(f).padStart(4, '0')}.png` })
  if (f % 30 === 0) console.log(`frame ${f}/${total}`)
}
await browser.close()
execFileSync('ffmpeg', ['-y', '-framerate', String(fps), '-i', `${frames}/f_%04d.png`,
  '-vf', 'tpad=stop_mode=clone:stop_duration=1,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
  '-movflags', '+faststart', out], { stdio: 'inherit' })
console.log('saved', out)
