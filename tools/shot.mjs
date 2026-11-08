// Screenshot the running dev server at a sim time / view.
// Usage: node tools/shot.mjs <out.png> [t=0] [view=deck] [width=1440] [height=900] [zoom=1] [cx] [cy]
import { chromium } from 'playwright'
const [,, out = 'tools/out/shot.png', t = '0', view = 'deck', w = '1440', h = '900', zoomF = '1', cx = '', cy = ''] = process.argv
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', e => errors.push(String(e)))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
const q = new URLSearchParams({ t, view, zoom: zoomF, nointro: '1' })
if (cx) q.set('cx', cx)
if (cy) q.set('cy', cy)
await page.goto(`http://localhost:5173/?${q}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.screenshot({ path: out })
await browser.close()
if (errors.length) { console.error('PAGE ERRORS:\n' + errors.join('\n')); process.exit(2) }
console.log(`wrote ${out}`)
