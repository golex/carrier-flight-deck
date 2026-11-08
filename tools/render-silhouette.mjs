// Render a silhouette candidate JSON to PNG for visual review.
// Usage: node tools/render-silhouette.mjs <candidate.json> <out.png>
// JSON format (units = FEET; x = forward/nose positive, y = starboard/right positive, origin = mid-length of fuselage):
// {
//   "FA18E": { "length": 60.3, "span": 44.9, "spanFolded": 32.6, "hingeY": 16.3,
//              "parts": { "fuselage": "M..Z", "wingInnerR": "..", "wingInnerL": "..", "wingOuterR": "..", "wingOuterL": "..",
//                         "stabR": "..", "stabL": "..", "finR": "..", "finL": "..", "canopy": "..", "intakes"?: "..", "nozzles"?: ".." } },
//   "EA18G": { ...same..., "parts": { ..., "podR": "..", "podL": "..", "podsUnderwing"?: ".." } }
// }
// wingOuter* are the panels outboard of the fold hinge; the fold is animated by scaling them in y about hingeY.
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const [,, inPath, outPath = 'tools/out/silhouette.png'] = process.argv
const data = JSON.parse(readFileSync(inPath, 'utf8'))

const PX_PER_FT = 8
function svgFor(type, spec, foldFrac) {
  const parts = spec.parts
  const hinge = spec.hingeY
  const sy = 1 - 0.85 * foldFrac // scale outer panels toward hinge; 0.15 residual = the folded panel seen edge-on
  const g = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`
  const outerR = parts.wingOuterR ? `<g transform="translate(0 ${hinge}) scale(1 ${sy}) translate(0 ${-hinge})">${g(parts.wingOuterR, '#2f3338')}${parts.podR ? g(parts.podR, '#55606a') : ''}</g>` : ''
  const outerL = parts.wingOuterL ? `<g transform="translate(0 ${-hinge}) scale(1 ${sy}) translate(0 ${hinge})">${g(parts.wingOuterL, '#2f3338')}${parts.podL ? g(parts.podL, '#55606a') : ''}</g>` : ''
  // wingtip pods (podR/podL) ride on the outer panels, so they fold with them (drawn inside the groups above)
  const order = ['stabR', 'stabL', 'wingInnerR', 'wingInnerL', 'podsUnderwing', 'fuselage', 'intakes', 'nozzles', 'finR', 'finL', 'canopy']
  const fills = { canopy: '#8a9aa8', finR: '#1e2124', finL: '#1e2124', nozzles: '#15181b', podR: '#55606a', podL: '#55606a', podsUnderwing: '#55606a' }
  let body = ''
  for (const k of order) if (parts[k]) body += g(parts[k], fills[k] ?? '#2f3338')
  // grid: 10 ft
  let grid = ''
  for (let x = -40; x <= 40; x += 10) grid += `<line x1="${x}" y1="-40" x2="${x}" y2="40" stroke="#dde" stroke-width="0.15"/>`
  for (let y = -40; y <= 40; y += 10) grid += `<line x1="-40" y1="${y}" x2="40" y2="${y}" stroke="#dde" stroke-width="0.15"/>`
  const L = spec.length / 2
  const S = (foldFrac ? spec.spanFolded : spec.span) / 2
  const box = `<rect x="${-L}" y="${-S}" width="${spec.length}" height="${2 * S}" fill="none" stroke="#e33" stroke-width="0.2" stroke-dasharray="1 1"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${90 * PX_PER_FT}" height="${90 * PX_PER_FT}" viewBox="-45 -45 90 90">
  <rect x="-45" y="-45" width="90" height="90" fill="#f6f6f4"/>${grid}
  <g transform="rotate(-90)">${box}${outerR}${outerL}${body}</g>
  <text x="-43" y="-41" font-size="2.5" font-family="sans-serif" fill="#333">${type} ${foldFrac ? 'folded' : 'spread'} (nose up, 10 ft grid, red box = documented length x span)</text>
</svg>`
}

let html = '<html><body style="margin:0;background:#fff;display:flex;flex-wrap:wrap;width:2880px">'
for (const [type, spec] of Object.entries(data)) {
  html += svgFor(type, spec, 0) + svgFor(type, spec, 1)
}
html += '</body></html>'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 2880, height: 720 * Object.keys(data).length } })
await page.setContent(html)
await page.screenshot({ path: outPath, fullPage: true })
await browser.close()
console.log(`wrote ${outPath}`)
