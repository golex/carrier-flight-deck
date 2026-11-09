// Post-process the generated FX textures (visuals spec §7) into public/img/fx/*.webp.
// Usage: node tools/tex.mjs
// Runs the image maths in a headless Playwright Chromium canvas, so it needs no new dependency.
// Sources: tools/out/visuals/gen/<name>-raw.png, else the already-paid fallback named in §7.
// Writes: public/img/fx/{sea-height,steam-sheet,burner,foam}.webp, plus tools/out/visuals/gen/contact.png
// and tools/out/visuals/gen/sea-tiled.png (2x2 wrap preview). Prints the sea wrap-seam ratios.
import { chromium } from 'playwright'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const GEN = 'tools/out/visuals/gen'
const VIS = 'tools/out/visuals'
const OUT = 'public/img/fx'
mkdirSync(OUT, { recursive: true })
mkdirSync(GEN, { recursive: true })

const SOURCES = {
  sea: [`${GEN}/sea-raw.png`, `${VIS}/scout-ocean-dark.png`],
  steam: [`${GEN}/steam-raw.png`, `${VIS}/cand-cinematic-steam.png`],
  burner: [`${GEN}/burner-raw.png`, `${VIS}/scout-afterburner.png`],
  foam: [`${GEN}/foam-raw.png`, `${VIS}/cand-cinematic-foam.png`],
}
const src = {}
for (const [k, list] of Object.entries(SOURCES)) {
  const p = list.find(f => existsSync(f))
  if (!p) { console.error(`no source for ${k}`); process.exit(1) }
  const fallback = p !== list[0]
  src[k] = { url: `data:image/png;base64,${readFileSync(p).toString('base64')}`, fallback }
  console.log(`${k}: ${p}${fallback ? ' (fallback)' : ''}`)
}

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<!doctype html><html><body></body></html>')

const res = await page.evaluate(async (src) => {
  const load = (url) => new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url })
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
  const ctx2 = (c) => c.getContext('2d', { willReadFrequently: true })
  const pixels = (img, sx = 0, sy = 0, sw = img.width, sh = img.height) => {
    const c = cv(sw, sh); const g = ctx2(c); g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
    return g.getImageData(0, 0, sw, sh)
  }
  const luma = (d, i) => (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255
  const levels = (v, bp, wp) => Math.min(1, Math.max(0, (v * 255 - bp) / (wp - bp)))
  /** Area-average downscale through repeated halving (good enough for power-of-two-ish ratios). */
  const scale = (c, w, h) => {
    let cur = c
    while (cur.width / 2 >= w && cur.height / 2 >= h) {
      const n = cv(Math.round(cur.width / 2), Math.round(cur.height / 2)); const g = ctx2(n)
      g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, n.width, n.height); cur = n
    }
    const o = cv(w, h); const g = ctx2(o); g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, w, h)
    return o
  }
  const out = {}

  // ---- 1. sea height: luma, normalise (mean .5, sd .18), offset-blend seam fix, 512 px ----
  {
    const img = await load(src.sea.url)
    const S = Math.min(img.width, img.height)
    const d = pixels(img, (img.width - S) / 2, (img.height - S) / 2, S, S).data
    const L = new Float32Array(S * S)
    for (let i = 0; i < S * S; i++) L[i] = luma(d, i * 4)
    const norm = (A) => {
      let m = 0; for (const v of A) m += v; m /= A.length
      let s = 0; for (const v of A) s += (v - m) ** 2; s = Math.sqrt(s / A.length) || 1
      for (let i = 0; i < A.length; i++) A[i] = Math.min(1, Math.max(0, 0.5 + (A[i] - m) / s * 0.18))
    }
    norm(L)
    const B = new Float32Array(S * S), h = S >> 1
    for (let y = 0; y < S; y++) {
      const wy = Math.sin(Math.PI * (y + 0.5) / S)
      for (let x = 0; x < S; x++) {
        const w = Math.pow(Math.max(0, Math.min(wy, Math.sin(Math.PI * (x + 0.5) / S))), 0.7)
        const r = L[((y + h) % S) * S + ((x + h) % S)]
        B[y * S + x] = w * L[y * S + x] + (1 - w) * r
      }
    }
    norm(B)
    const c = cv(S, S); const g = ctx2(c); const id = g.createImageData(S, S)
    for (let i = 0; i < S * S; i++) { const v = Math.round(B[i] * 255); id.data.set([v, v, v, 255], i * 4) }
    g.putImageData(id, 0, 0)
    const small = scale(c, 512, 512)
    // wrap-seam ratio: mean |diff| across the wrap vs mean |diff| between adjacent interior lines
    const sd = ctx2(small).getImageData(0, 0, 512, 512).data
    const at = (x, y) => sd[(y * 512 + x) * 4]
    let wx = 0, ix = 0, wy = 0, iy = 0, n = 0
    for (let k = 0; k < 512; k++) {
      wx += Math.abs(at(511, k) - at(0, k)); wy += Math.abs(at(k, 511) - at(k, 0))
      for (const j of [64, 128, 192, 256, 320, 384, 448]) { ix += Math.abs(at(j, k) - at(j - 1, k)); iy += Math.abs(at(k, j) - at(k, j - 1)); n++ }
    }
    out.seamX = wx / 512 / (ix / n); out.seamY = wy / 512 / (iy / n)
    out.sea = small.toDataURL('image/webp', 0.85)
    const t2 = cv(1024, 1024); const g2 = ctx2(t2)
    for (const [x, y] of [[0, 0], [512, 0], [0, 512], [512, 512]]) g2.drawImage(small, x, y)
    out.seaTiled = t2.toDataURL('image/png')
  }

  // ---- 2. steam: levels(14, 235), RGB white, alpha = luma, 512 px (cells of 128) ----
  {
    const img = await load(src.steam.url)
    const W = img.width, H = img.height
    const id = pixels(img); const d = id.data
    for (let i = 0; i < d.length; i += 4) {
      const a = levels(luma(d, i), 14, 235)
      d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.round(a * 255)
    }
    const c = cv(W, H); ctx2(c).putImageData(id, 0, 0)
    const small = scale(c, 512, 512)
    // cell-border bleed: mean alpha along the 3 inner grid lines and the outer frame
    const sd = ctx2(small).getImageData(0, 0, 512, 512).data
    let bleed = 0, bn = 0
    for (const j of [0, 127, 128, 255, 256, 383, 384, 511]) for (let k = 0; k < 512; k++) {
      bleed += sd[(k * 512 + j) * 4 + 3] + sd[(j * 512 + k) * 4 + 3]; bn += 2
    }
    out.steamBleed = bleed / bn / 255
    out.steam = small.toDataURL('image/webp', 0.85)
  }

  // ---- 3. burner: crop to the plume bbox, 512x128, RGB on black ----
  {
    const img = await load(src.burner.url)
    let x0 = 0
    if (src.burner.fallback) x0 = 95 // the scout image has a nozzle at x < 95
    const W = img.width - x0, H = img.height
    const d = pixels(img, x0, 0, W, H).data
    let minx = W, miny = H, maxx = -1, maxy = -1
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (luma(d, (y * W + x) * 4) > 0.08) { if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y }
    }
    const c = cv(512, 128); const g = ctx2(c)
    g.fillStyle = '#000'; g.fillRect(0, 0, 512, 128)
    g.imageSmoothingQuality = 'high'
    g.drawImage(img, x0 + minx, miny, maxx - minx + 1, maxy - miny + 1, 0, 0, 512, 128)
    out.burnerBox = [x0 + minx, miny, x0 + maxx, maxy]
    out.burner = c.toDataURL('image/webp', 0.85)
  }

  // ---- 4. foam: horizontal seam blend over a 12% cosine feather, RGB white, alpha = levels(luma, 20, 230), 1024x256 ----
  {
    const img = await load(src.foam.url)
    const W = img.width, H = img.height
    const d = pixels(img).data
    const F = Math.round(W * 0.12), Wo = W - F
    // output column x (0..Wo) takes the source column x; within the first F columns it cross-fades
    // with source column Wo + x, so the right edge (source Wo-1) runs straight into the left edge.
    const c = cv(Wo, H); const g = ctx2(c); const id = g.createImageData(Wo, H); const o = id.data
    for (let y = 0; y < H; y++) for (let x = 0; x < Wo; x++) {
      let v = luma(d, (y * W + x) * 4)
      if (x < F) {
        const w = 0.5 - 0.5 * Math.cos(Math.PI * (x + 0.5) / F) // 0 at the seam -> 1 inside
        v = w * v + (1 - w) * luma(d, (y * W + Wo + x) * 4)
      }
      const i = (y * Wo + x) * 4
      o[i] = o[i + 1] = o[i + 2] = 255; o[i + 3] = Math.round(levels(v, 20, 230) * 255)
    }
    g.putImageData(id, 0, 0)
    out.foam = scale(c, 1024, 256).toDataURL('image/webp', 0.85)
  }

  // ---- 5. contact sheet ----
  {
    const sheet = cv(1600, 1200); const g = ctx2(sheet)
    g.fillStyle = '#4d6670'; g.fillRect(0, 0, 1600, 1200)
    g.font = '16px sans-serif'; g.fillStyle = '#eef1ef'
    const put = async (url, x, y, w, h, label, bg) => {
      if (bg) { g.fillStyle = bg; g.fillRect(x, y, w, h) }
      g.drawImage(await load(url), x, y, w, h); g.fillStyle = '#eef1ef'; g.fillText(label, x, y - 6)
    }
    await put(out.sea, 20, 40, 512, 512, `sea-height.webp 512² (seam x ${out.seamX.toFixed(2)}, y ${out.seamY.toFixed(2)})`)
    await put(out.seaTiled, 552, 40, 512, 512, '2×2 wrap preview')
    await put(out.steam, 1084, 40, 496, 496, `steam-sheet.webp 512² on sea (border alpha ${out.steamBleed.toFixed(3)})`)
    await put(out.burner, 20, 600, 1024, 256, 'burner.webp 512×128 (on black, drawn with lighter)', '#000')
    await put(out.foam, 20, 900, 1024, 256, 'foam.webp 1024×256 on sea')
    g.strokeStyle = 'rgba(255,255,255,0.25)'
    for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(1084 + k * 124, 40); g.lineTo(1084 + k * 124, 536); g.moveTo(1084, 40 + k * 124); g.lineTo(1580, 40 + k * 124); g.stroke() }
    out.contact = sheet.toDataURL('image/png')
  }
  return out
}, src)
await browser.close()

const save = (path, url) => writeFileSync(path, Buffer.from(url.split(',')[1], 'base64'))
save(`${OUT}/sea-height.webp`, res.sea)
save(`${OUT}/steam-sheet.webp`, res.steam)
save(`${OUT}/burner.webp`, res.burner)
save(`${OUT}/foam.webp`, res.foam)
save(`${GEN}/sea-tiled.png`, res.seaTiled)
save(`${GEN}/contact.png`, res.contact)
console.log(`sea wrap-seam ratio x=${res.seamX.toFixed(3)} y=${res.seamY.toFixed(3)} (must be < 1.3)`)
console.log(`steam cell-border mean alpha=${res.steamBleed.toFixed(4)}`)
console.log(`burner crop box=${res.burnerBox.join(',')}`)
const bad = !(res.seamX < 1.3 && res.seamY < 1.3)
if (bad) { console.error('FAIL: sea seam ratio >= 1.3'); process.exit(1) }
console.log(`wrote ${OUT}/{sea-height,steam-sheet,burner,foam}.webp and ${GEN}/contact.png`)
