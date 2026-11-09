// The ship's air-search scope (SPS-49, 12 rpm), irising open around the ship as the camera pulls back.
// Muted scope ink on blue-black glass; no scanlines, no vignette. Lane E (visuals spec §3.E, D4-D6).
import type { Frame } from './frame'
import { radarAzimuth, sstep } from './frame'
import type { AircraftType, PatternKeyframe, Timeline, Vec2 } from '../sim/types'
import type { AircraftState } from '../sim/sample'
import { samplePattern } from '../sim/sample'
import { aircraftEntity, jetWorldAt, overlaps, type AirJet, type Box } from './airborne'
import { aircraftShadowHeight, nmToWorld, NM_FT, SHIP_MID_X, TRANSOM_X } from './world'
import { CASE_I, LEG_CODE, racetrack } from './patternGeom'
import { catStatusAt } from './fxIndex'
import type { CatId, CatWord } from './frame'
import { DECK } from '../data/deck'
import { cssVar, tokens } from './tokens'
import { deckStatusAt } from './ship'

/** Screen px; r = 0 when closed. */
export interface Iris { x: number; y: number; r: number }

const FONT_PX = 10
const LINE_H = 12
const BLOCK_PAD = 3
const HIT_PX = 10
const ALERT_S = 12
const ALERT_FLASH_S = 4
const STACK_MAX = 4
const HISTORY = 5
const HISTORY_DT = 4
const LEADER_S = 20
const WIND_KT = 27

/** r = scope^1.5 * (max distance from ship centre to a viewport corner). */
export function irisGeometry(f: Frame): Iris {
  const { cam } = f
  const c = cam.worldToScreen({ x: SHIP_MID_X, y: 0 })
  const s = f.b.scope
  if (s <= 0) return { x: c.x, y: c.y, r: 0 }
  const maxD = Math.max(
    Math.hypot(c.x, c.y), Math.hypot(cam.w - c.x, c.y), Math.hypot(c.x, cam.h - c.y), Math.hypot(cam.w - c.x, cam.h - c.y),
  )
  // with the world pass skipped (scope >= 0.999) the glass must cover every corner, or stale pixels show
  return { x: c.x, y: c.y, r: f.b.world ? Math.pow(s, 1.5) * maxD : maxD + 2 }
}

// ---------------------------------------------------------------- helpers

const widthCache = new Map<string, number>()
// widths measured with a fallback font are wrong once the web font arrives
if (typeof document !== 'undefined' && document.fonts) {
  document.fonts.addEventListener('loadingdone', () => widthCache.clear())
  void document.fonts.ready.then(() => widthCache.clear())
}
function textW(ctx: CanvasRenderingContext2D, s: string): number {
  const k = ctx.font + '|' + s
  let w = widthCache.get(k)
  if (w === undefined) {
    w = ctx.measureText(s).width
    if (widthCache.size > 2000) widthCache.clear()
    widthCache.set(k, w)
  }
  return w
}

/** Screen direction of a relative bearing (deg clockwise from the bow; the bow points right, starboard down). */
function dir(bearingDeg: number): Vec2 {
  const a = (bearingDeg * Math.PI) / 180
  return { x: Math.cos(a), y: Math.sin(a) }
}

/** The canvas area not covered by DOM chrome (header, side panel or phone sheet, transport bar). */
export function freeRect(f: Frame): Box {
  const { w, h } = f.cam
  const narrow = w <= 760
  const app = typeof document !== 'undefined' ? document.getElementById('app') : null
  const panelOpen = !narrow && !(app?.classList.contains('panel-hidden') ?? false)
  return { x0: 8, y0: narrow ? 90 : 64, x1: w - (panelOpen ? 352 : 0) - 8, y1: h - (narrow ? 76 + 0.42 * h : 76) }
}

function inside(b: Box, p: Vec2, m = 0): boolean {
  return p.x >= b.x0 + m && p.x <= b.x1 - m && p.y >= b.y0 + m && p.y <= b.y1 - m
}

/** First bearing (scanning outward from `pref`) whose point on the circle lies in the free area, or null. */
function visibleBearing(c: Vec2, r: number, pref: number, free: Box, margin: number): number | null {
  for (let i = 0; i <= 24; i++) {
    for (const sgn of i ? [1, -1] : [1]) {
      const b = pref + sgn * i * 7.5
      const d = dir(b)
      if (inside(free, { x: c.x + d.x * r, y: c.y + d.y * r }, margin)) return b
    }
  }
  return null
}

function typeLetter(t: AircraftType): string {
  return t === 'FA18E' ? 'E' : t === 'FA18F' ? 'F' : 'G'
}

const CAT_ABBR: Record<CatWord, string> = {
  SAFE: 'SAFE', SPOT: 'SPOT', TENSION: 'TENS', FINAL: 'FINL', SHOT: 'SHOT', RETRACT: 'RETR', SECURED: 'SECD',
}

/** Bolter / wave-off rising edges (from the FX index when lane C has filled it, else straight from the tracks). */
interface AlertEv { t: number; id: string; kind: 'bolter' | 'waveoff' }
let alertCache: { tl: Timeline; list: AlertEv[] } | null = null
function alerts(f: Frame): AlertEv[] {
  const fromFx = f.fxi.touchdowns.length + f.fxi.waveoffs.length > 0
  if (fromFx) {
    return [
      ...f.fxi.touchdowns.filter(d => d.kind === 'bolter').map(d => ({ t: d.t, id: d.id, kind: 'bolter' as const })),
      ...f.fxi.waveoffs.map(w => ({ t: w.t, id: w.id, kind: 'waveoff' as const })),
    ]
  }
  if (alertCache && alertCache.tl === f.tl) return alertCache.list
  const list: AlertEv[] = []
  for (const a of f.tl.aircraft) {
    for (let i = 1; i < a.track.length; i++) {
      const p = a.track[i - 1]!, q = a.track[i]!
      if ((q.status === 'bolter' || q.status === 'waveoff') && p.status !== q.status) list.push({ t: p.t, id: a.id, kind: q.status })
    }
  }
  list.sort((x, y) => x.t - y.t)
  alertCache = { tl: f.tl, list }
  return list
}

// ---------------------------------------------------------------- tracks

interface Track {
  id: string
  modex: string
  type: AircraftType
  world: Vec2
  sp: Vec2
  heading: number // deg
  alt: number
  leg: PatternKeyframe['leg'] | 'waveoff'
  stacked: boolean
  alert: AlertEv | null
}

interface Layout {
  tracks: Track[]
  stack: { sp: Vec2; n: number; lo: number; hi: number } | null
}

function buildTracks(f: Frame, iris: Iris, air: AirJet[]): Layout {
  const { cam } = f
  const out: Track[] = []
  const seen = new Set<string>()
  const r2 = iris.r * iris.r
  const isIn = (p: Vec2) => (p.x - iris.x) ** 2 + (p.y - iris.y) ** 2 < r2
  const al = alerts(f)
  const alertFor = (id: string): AlertEv | null => {
    let hit: AlertEv | null = null
    for (const e of al) if (e.id === id && e.t <= f.t && f.t - e.t < ALERT_S) hit = e
    return hit
  }
  for (const j of air) {
    const sp = cam.worldToScreen(j.world)
    if (!isIn(sp)) continue
    seen.add(j.id)
    out.push({ id: j.id, modex: j.modex, type: j.type, world: j.world, sp, heading: j.heading, alt: j.alt, leg: j.leg, stacked: false, alert: alertFor(j.id) })
  }
  for (const { a, s } of f.jets) {
    if (!s || !s.visible || seen.has(a.id)) continue
    if (s.status !== 'groove' && s.status !== 'bolter' && s.status !== 'waveoff') continue
    const w = { x: s.x, y: s.y }
    const sp = cam.worldToScreen(w)
    if (!isIn(sp)) continue
    seen.add(a.id)
    const p = f.tl.pattern.find(e => e.aircraftId === a.id)
    const ps = p ? samplePattern(p, f.t) : null
    const alt = ps && ps.leg !== 'none' ? ps.alt : Math.round(aircraftShadowHeight(s as AircraftState).h)
    const leg = s.status === 'waveoff' ? 'waveoff' : ps && ps.leg !== 'none' ? ps.leg : s.status === 'groove' ? 'groove' : 'bolter'
    out.push({ id: a.id, modex: a.modex, type: a.type, world: w, sp, heading: s.heading, alt, leg, stacked: false, alert: alertFor(a.id) })
  }
  const marshal = out.filter(t => t.leg === 'marshal')
  let stack: Layout['stack'] = null
  if (marshal.length > STACK_MAX) {
    let x = 0, y = 0, lo = Infinity, hi = -Infinity
    for (const t of marshal) {
      t.stacked = true
      x += t.sp.x / marshal.length
      y += t.sp.y / marshal.length
      lo = Math.min(lo, t.alt)
      hi = Math.max(hi, t.alt)
    }
    stack = { sp: { x, y }, n: marshal.length, lo, hi }
  }
  out.sort((p, q) => (p.id < q.id ? -1 : p.id > q.id ? 1 : 0))
  return { tracks: out, stack }
}

/** Candidate block origins around an anchor: 8 offsets per ring, NE first, clockwise. */
function candidates(a: Vec2, w: number, h: number, g: number): Vec2[] {
  return [
    { x: a.x + g, y: a.y - g - h }, // NE
    { x: a.x + g + 2, y: a.y - h / 2 }, // E
    { x: a.x + g, y: a.y + g }, // SE
    { x: a.x - w / 2, y: a.y + g + 2 }, // S
    { x: a.x - g - w, y: a.y + g }, // SW
    { x: a.x - g - 2 - w, y: a.y - h / 2 }, // W
    { x: a.x - g - w, y: a.y - g - h }, // NW
    { x: a.x - w / 2, y: a.y - g - 2 - h }, // N
  ]
}

/**
 * Place a w x h block near anchor: the first of 8 offsets that clears every taken box and stays on the free
 * screen inside the iris; then the same 8 further out; then the least-overlapping candidate (never on top
 * of another data block if any candidate avoids them).
 */
function place(a: Vec2, w: number, h: number, taken: Box[], blocks: Box[], free: Box, iris: Iris): Box {
  const fits = (b: Box) => {
    if (b.x0 < free.x0 || b.y0 < free.y0 || b.x1 > free.x1 || b.y1 > free.y1) return false
    const r2 = iris.r * iris.r
    for (const [x, y] of [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]] as const) {
      if ((x - iris.x) ** 2 + (y - iris.y) ** 2 > r2) return false
    }
    return true
  }
  let best: Box | null = null
  let bestScore = Infinity
  for (const g of [9, 22, 40, 64]) {
    for (const c of candidates(a, w, h, g)) {
      const b = { x0: c.x, y0: c.y, x1: c.x + w, y1: c.y + h }
      const clear = !taken.some(t => overlaps(t, b))
      if (clear && fits(b)) return b
      // fallback score: overlap with blocks is far worse than with symbols or leaving the screen
      let score = g * 0.01
      for (const t of blocks) if (overlaps(t, b)) score += 1000
      for (const t of taken) if (overlaps(t, b)) score += 3
      if (!fits(b)) score += 50
      if (score < bestScore) {
        bestScore = score
        best = b
      }
    }
  }
  return best!
}

// ---------------------------------------------------------------- drawing

export function drawScope(f: Frame, iris: Iris, air: AirJet[], selected: string | null): void {
  if (iris.r <= 0.5 || f.b.scope <= 0) return
  const { ctx, cam } = f
  const T = tokens()
  const z = cam.zoom
  const nmPx = z * NM_FT
  const scope = f.b.scope
  const c = { x: iris.x, y: iris.y }
  const free = freeRect(f)
  const P = (nm: Vec2): Vec2 => cam.worldToScreen(nmToWorld(nm))
  const mono = `${FONT_PX}px ${T.fontMono}`
  const bg = cssVar('--scope-bg')
  const ring = cssVar('--scope-ring')
  const ring2 = cssVar('--scope-ring-2')
  const legC = cssVar('--scope-leg')
  const ink = cssVar('--scope-ink')
  const ink2 = cssVar('--scope-ink-2')
  const ink3 = cssVar('--scope-ink-3')
  const blip = cssVar('--scope-blip')
  const alertC = cssVar('--scope-alert')
  // Ramp shifted from the spec's 0.3-0.7 (review V7): at half iris the blocks are absent, not ghosted.
  const blockA = sstep(scope, 0.45, 0.75)
  const plateA = sstep(scope, 0.15, 0.55)
  const bloom = (rPx: number) => sstep(iris.r - rPx, 0, 40)

  ctx.save()
  ctx.beginPath()
  ctx.arc(c.x, c.y, iris.r, 0, Math.PI * 2)
  ctx.clip()

  // 1. glass (the gradient is kept: data blocks knock out with it, review V3)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, cam.w, cam.h)
  const glass = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, Math.max(40, Math.min(iris.r, 5 * nmPx)))
  glass.addColorStop(0, cssVar('--scope-bg-2'))
  glass.addColorStop(1, bg)
  {
    const gr = glass
    ctx.fillStyle = gr
    ctx.beginPath()
    ctx.arc(c.x, c.y, iris.r, 0, Math.PI * 2)
    ctx.fill()
  }

  // 2. wake clutter: 2 nm astern, widening and fading
  {
    const x0 = TRANSOM_X, x1 = TRANSOM_X - 2 * NM_FT
    const a0 = cam.worldToScreen({ x: x0, y: -110 }), a1 = cam.worldToScreen({ x: x1, y: -620 })
    const b1 = cam.worldToScreen({ x: x1, y: 620 }), b0 = cam.worldToScreen({ x: x0, y: 110 })
    const clutter = cssVar('--scope-clutter')
    const gr = ctx.createLinearGradient(a0.x, 0, a1.x, 0)
    gr.addColorStop(0, clutter)
    gr.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gr
    ctx.beginPath()
    ctx.moveTo(a0.x, a0.y)
    ctx.lineTo(a1.x, a1.y)
    ctx.lineTo(b1.x, b1.y)
    ctx.lineTo(b0.x, b0.y)
    ctx.closePath()
    ctx.fill()
  }

  // 3. range rings, each blooming as the iris passes it
  const maxK = Math.min(12, Math.ceil(iris.r / nmPx))
  ctx.font = mono
  ctx.textBaseline = 'middle'
  for (let k = 1; k <= maxK; k++) {
    const r = k * nmPx
    const a = bloom(r)
    if (a <= 0.005) continue
    ctx.globalAlpha = a
    ctx.strokeStyle = k === 5 ? ring2 : ring
    ctx.lineWidth = k === 5 ? 1.5 : 1
    ctx.beginPath()
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  if (z >= 0.03) {
    ctx.setLineDash([1, 4])
    ctx.strokeStyle = ring
    ctx.lineWidth = 1
    for (let k = 0; k < maxK; k++) {
      const r = (k + 0.5) * nmPx
      const a = bloom(r)
      if (a <= 0.005) continue
      ctx.globalAlpha = a
      ctx.beginPath()
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  // track layout first, so labels can keep off the data blocks
  const lay = buildTracks(f, iris, air)
  const taken: Box[] = []
  const blocks: Box[] = []
  // own-ship symbol box and every track symbol
  {
    const s0 = cam.worldToScreen({ x: 0, y: -130 }), s1 = cam.worldToScreen({ x: 1092, y: 130 })
    taken.push({ x0: s0.x - 3, y0: s0.y - 3, x1: s1.x + 3, y1: s1.y + 3 })
    const lead = cam.worldToScreen({ x: 1092 + 0.45 * NM_FT, y: 0 })
    taken.push({ x0: s1.x, y0: c.y - 2, x1: lead.x, y1: c.y + 2 })
  }
  for (const t of lay.tracks) {
    const h = t.stacked ? 3 : 5
    taken.push({ x0: t.sp.x - h, y0: t.sp.y - h, x1: t.sp.x + h, y1: t.sp.y + h })
  }
  // the scale bar and its RANGE readout (hud.ts) sit at the free area's bottom-right corner
  const scaleBox = { x0: free.x1 - 270, y0: free.y1 - 40, x1: free.x1 + 8, y1: free.y1 }
  taken.push(scaleBox)
  blocks.push(scaleBox)

  // own-ship block
  ctx.font = mono
  const deck = deckStatusAt(f) // same word as the island beacons (D13, review V11)
  const deckWord = deck === 'green' ? 'GREEN' : deck === 'foul' ? 'FOUL' : 'RED'
  let onDeck = 0
  let inAir = air.length
  for (const { s } of f.jets) {
    if (!s || !s.visible) continue
    // same status set as buildTracks' deck tracks, plus a shot jet once it has left the bow
    if (s.status === 'groove' || s.status === 'waveoff' || s.status === 'bolter' || s.status === 'airborne' ||
      (s.status === 'shot' && s.x > 1092)) inAir++
    else onDeck++
  }
  const catLine = 'CAT ' + ([1, 2, 3, 4] as CatId[])
    .map(id => {
      const st = catStatusAt(f.fxi, f.jets, f.eq, f.t, id)
      return `${id} ${st.word ? CAT_ABBR[st.word] : '----'}`
    })
    .join(' · ')
  const ownLines = [`CVN · BRC 000 · ${WIND_KT} KT`, `DECK ${deckWord}`, `ON DECK ${onDeck}  AIR ${inAir}`, catLine]
  const ownW = Math.max(...ownLines.map(l => textW(ctx, l))) + BLOCK_PAD * 2
  const ownH = ownLines.length * LINE_H + BLOCK_PAD * 2
  const shipSp = cam.worldToScreen({ x: 546, y: 0 })
  const ownBox = place({ x: shipSp.x, y: shipSp.y + Math.max(6, 130 * z) }, ownW, ownH, taken, blocks, free, iris)
  taken.push(ownBox)
  blocks.push(ownBox)

  // track blocks
  ctx.font = mono
  interface Placed { lines: string[]; box: Box; anchor: Vec2; t: Track | null }
  const placed: Placed[] = []
  const prio = lay.tracks
    .filter(t => !t.stacked)
    .sort((p, q) => (p.id === selected ? -1 : q.id === selected ? 1 : (p.alert ? 0 : 1) - (q.alert ? 0 : 1)))
  for (const t of prio) {
    const l2 = t.alert ? (t.alert.kind === 'bolter' ? 'BOLTER' : 'WAVE OFF') : `${String(Math.max(0, Math.round(t.alt / 100))).padStart(3, '0')} ${t.leg === 'waveoff' ? 'WO' : LEG_CODE[t.leg]}`.trimEnd()
    const lines = [`${t.modex} ${typeLetter(t.type)}`, l2]
    const w = Math.max(...lines.map(l => textW(ctx, l))) + BLOCK_PAD * 2
    const h = lines.length * LINE_H + BLOCK_PAD * 2
    const box = place(t.sp, w, h, taken, blocks, free, iris)
    taken.push(box)
    blocks.push(box)
    placed.push({ lines, box, anchor: t.sp, t })
  }
  if (lay.stack) {
    const s = lay.stack
    const fl = (a: number) => String(Math.round(a / 100)).padStart(3, '0')
    const lines = [`STACK ×${s.n}`, s.lo === s.hi ? fl(s.lo) : `${fl(s.lo)}-${fl(s.hi)}`]
    const w = Math.max(...lines.map(l => textW(ctx, l))) + BLOCK_PAD * 2
    const h = lines.length * LINE_H + BLOCK_PAD * 2
    const box = place(s.sp, w, h, taken, blocks, free, iris)
    taken.push(box)
    blocks.push(box)
    placed.push({ lines, box, anchor: s.sp, t: null })
  }

  // ring labels: 1-4 at the 315 deg point, `5 NM · CCZ` wherever the 5 nm ring is on screen
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const label = (text: string, x: number, y: number, color: string, alpha: number, align: CanvasTextAlign = 'left') => {
    const w = textW(ctx, text)
    const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2
    const b = { x0: x0 - 2, y0: y - 7, x1: x0 + w + 2, y1: y + 7 }
    const pad = { x0: b.x0 - 3, y0: b.y0 - 1, x1: b.x1 + 3, y1: b.y1 + 1 }
    if (taken.some(t => overlaps(t, pad))) return false
    // whole label on the free canvas (not under the header, side panel or transport), or not at all (review V8)
    if (b.x0 < free.x0 || b.y0 < free.y0 || b.x1 > free.x1 || b.y1 > free.y1) return false
    // whole label inside the iris, or not at all
    const r2 = (iris.r - 2) ** 2
    for (const [px, py] of [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]] as const) {
      if ((px - c.x) ** 2 + (py - c.y) ** 2 > r2) return false
    }
    ctx.globalAlpha = alpha
    ctx.textAlign = align
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.strokeStyle = bg
    ctx.strokeText(text, x, y)
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
    taken.push(b)
    return true
  }
  for (let k = 1; k <= Math.min(5, maxK); k++) {
    const r = k * nmPx
    const a = bloom(r)
    if (a <= 0.01) continue
    if (k < 5) {
      const d = dir(315)
      label(String(k), c.x + d.x * r + 3, c.y + d.y * r - 6, ink2, a)
    } else {
      // Scan the ring every 2.5 deg outward from 315 for a point that is on screen and clear of the DOM chrome
      // (the free box, plus the strip right of the header above it), then try the label just outside the ring
      // (up-right, like 1-4) and just inside it. At the pattern view's fit only a short arc near the top-right
      // corner is visible, so a 315-only or wide-margin search finds nothing.
      const text = '5 NM · CCZ'
      const w = textW(ctx, text)
      const narrow = cam.w <= 760
      const regions: Box[] = narrow ? [free] : [free, { x0: Math.max(free.x0, 380), y0: 8, x1: free.x1, y1: free.y1 }]
      const fits = (bx: Box) => regions.some(R => bx.x0 >= R.x0 && bx.y0 >= R.y0 && bx.x1 <= R.x1 && bx.y1 <= R.y1)
      scan: for (let i = 0; i <= 72; i++) {
        for (const sgn of i ? [1, -1] : [1]) {
          const d = dir(315 + sgn * i * 2.5)
          const p = { x: c.x + d.x * r, y: c.y + d.y * r }
          if (!regions.some(R => inside(R, p, 10))) continue
          const inAlign: CanvasTextAlign = d.x >= 0 ? 'right' : 'left'
          const cands: [number, number, CanvasTextAlign][] = [
            [p.x + 4, p.y - 8, 'left'],
            [p.x - d.x * 10, p.y - d.y * 12, inAlign],
          ]
          for (const [x, y, al] of cands) {
            const x0 = al === 'left' ? x : x - w
            if (!fits({ x0: x0 - 2, y0: y - 7, x1: x0 + w + 2, y1: y + 7 })) continue
            if (label(text, x, y, ink2, a, al)) break scan
          }
        }
      }
    }
  }

  // 4. bearing ticks on the 5 nm ring, or the largest ring mostly on screen
  {
    let tickK = 0
    for (let k = Math.min(5, maxK); k >= 1; k--) {
      const r = k * nmPx
      if (bloom(r) < 0.5) continue
      let vis = 0
      for (let i = 0; i < 72; i++) {
        const d = dir(i * 5)
        if (inside(free, { x: c.x + d.x * r, y: c.y + d.y * r })) vis++
      }
      if (vis >= 18 || (k === 5 && vis >= 6)) {
        tickK = k
        break
      }
    }
    if (tickK) {
      const r = tickK * nmPx
      const a = bloom(r)
      ctx.globalAlpha = a
      ctx.strokeStyle = ring2
      ctx.lineWidth = 1
      ctx.stroke(tickPath(c, r))
      for (let b = 0; b < 360; b += 30) {
        const d = dir(b)
        // 20 px inside the ring; if that box is off the free canvas, slide inward along the same radial (review V8)
        for (let inset = 20; inset <= 80; inset += 15) {
          const p = { x: c.x + d.x * (r - inset), y: c.y + d.y * (r - inset) }
          if (label(`${String(b).padStart(3, '0')}R`, p.x, p.y, ink2, a, 'center')) {
            if (b === 0) label('BRC', p.x, p.y + LINE_H, ink3, a, 'center')
            break
          }
        }
      }
      // WOD: the relative wind comes over the bow; arrow outside 000R pointing at the ship, else just inside
      const outX = c.x + r + 12
      const wod = `WOD ${WIND_KT} KT`
      const ww = textW(ctx, wod)
      const outside = outX + ww + 22 < free.x1
      const wx = outside ? outX + 18 : c.x + r - 40 - ww
      const wy = outside ? c.y : c.y + LINE_H * 2.2
      if (label(wod, wx, wy, ink2, a)) {
        ctx.strokeStyle = ink2
        ctx.fillStyle = ink2
        ctx.lineWidth = 1
        const ax0 = outside ? wx - 4 : wx + ww + 20
        const ax1 = ax0 - 13
        ctx.beginPath()
        ctx.moveTo(ax0, wy)
        ctx.lineTo(ax1 + 4, wy)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax1, wy)
        ctx.lineTo(ax1 + 5, wy - 3)
        ctx.lineTo(ax1 + 5, wy + 3)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  // 5. approach plate
  if (plateA > 0.01) {
    ctx.globalAlpha = plateA
    ctx.strokeStyle = legC
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.stroke(racetrack(P))
    // marshal circle
    const sc = P(CASE_I.stackCentre)
    ctx.beginPath()
    ctx.arc(sc.x, sc.y, CASE_I.stackR * nmPx, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    // final approach course: -9 deg, 4 nm astern of the ramp, ticks every 0.5 nm
    const fr = (CASE_I.finalDeg * Math.PI) / 180
    const fd = { x: Math.cos(fr), y: Math.sin(fr) }
    const ramp = { x: CASE_I.rampX, y: 0 }
    const along = (d: number): Vec2 => P({ x: ramp.x - fd.x * d, y: ramp.y - fd.y * d })
    const r0 = along(0), r4 = along(4)
    ctx.beginPath()
    ctx.moveTo(r0.x, r0.y)
    ctx.lineTo(r4.x, r4.y)
    const ux = (r4.x - r0.x) / Math.hypot(r4.x - r0.x, r4.y - r0.y), uy = (r4.y - r0.y) / Math.hypot(r4.x - r0.x, r4.y - r0.y)
    for (let k = 1; k <= 8; k++) {
      const p = along(k * 0.5)
      const len = k % 2 === 0 ? 5 : 3
      ctx.moveTo(p.x - uy * len, p.y + ux * len)
      ctx.lineTo(p.x + uy * len, p.y - ux * len)
    }
    ctx.stroke()
    for (const k of [1, 2]) {
      const p = along(k)
      label(`${k} NM`, p.x - uy * 14, p.y + ux * 14, ink3, plateA, 'center')
    }
    // leg labels, each only where it clears the data blocks and symbols
    const C = CASE_I
    const bc = { x: C.initialEnd.x + C.breakRadius, y: (C.initialEnd.y + C.downwindY) / 2 }
    const br = (C.initialEnd.y - C.downwindY) / 2
    const gs = { x: ramp.x - fd.x * C.grooveNm, y: ramp.y - fd.y * C.grooveNm }
    const pI = P({ x: C.initialStart.x + 0.9, y: C.initialStart.y })
    label('INITIAL 800', pI.x, pI.y - 10, ink2, plateA, 'center') || label('INITIAL 800', pI.x, pI.y + 10, ink2, plateA, 'center')
    const pB = P({ x: bc.x + br, y: bc.y })
    label('BREAK', pB.x + 6, pB.y, ink2, plateA, 'left') || label('BREAK', pB.x - 6, pB.y, ink2, plateA, 'right')
    const pD = P({ x: (bc.x + C.abeamX) / 2, y: C.downwindY })
    label('DOWNWIND 600', pD.x, pD.y - 10, ink2, plateA, 'center') || label('DOWNWIND 600', pD.x, pD.y + 10, ink2, plateA, 'center') ||
      label('DOWNWIND 600', pD.x + 0.4 * nmPx, pD.y - 10, ink2, plateA, 'center') || label('DOWNWIND 600', pD.x - 0.4 * nmPx, pD.y + 10, ink2, plateA, 'center')
    const p180 = P({ x: C.abeamX, y: C.downwindY })
    label('180', p180.x - 4, p180.y - 10, ink2, plateA, 'right') || label('180', p180.x - 4, p180.y + 10, ink2, plateA, 'right')
    const p90 = P(C.ninety)
    label('90 · 450', p90.x - 8, p90.y, ink2, plateA, 'right') || label('90 · 450', p90.x + 8, p90.y, ink2, plateA, 'left')
    const pG = P({ x: (gs.x + ramp.x) / 2, y: (gs.y + ramp.y) / 2 })
    label('GROOVE 3.5°', pG.x - 4, pG.y + 12, ink2, plateA, 'right') || label('GROOVE 3.5°', pG.x, pG.y - 12, ink2, plateA, 'right')
  }

  // 6. own ship: the deck outline traces itself, plus a 1-minute velocity leader
  {
    const pts = DECK.outline.map(p => cam.worldToScreen(p))
    let per = 0
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!, b = pts[(i + 1) % pts.length]!
      per += Math.hypot(b.x - a.x, b.y - a.y)
    }
    const trace = sstep(scope, 0, 0.5)
    ctx.globalAlpha = 1
    ctx.strokeStyle = blip
    ctx.lineWidth = 1
    ctx.setLineDash([per + 1, per + 1])
    ctx.lineDashOffset = (per + 1) * (1 - trace)
    ctx.beginPath()
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
    ctx.closePath()
    ctx.stroke()
    ctx.setLineDash([])
    ctx.lineDashOffset = 0
    const bow = cam.worldToScreen({ x: 1092, y: 0 })
    const lead = cam.worldToScreen({ x: 1092 + 0.45 * NM_FT, y: 0 })
    ctx.globalAlpha = blockA
    ctx.beginPath()
    ctx.moveTo(bow.x, bow.y)
    ctx.lineTo(lead.x, lead.y)
    ctx.stroke()
    // the own-ship data block is drawn with the track blocks, after the tracks (review V3)
  }

  // 7. tracks
  const az = radarAzimuth(f.nowMs, 12, f.reduced)
  const sweepOn = !f.reduced
  const brightness = (p: Vec2) => {
    if (!sweepOn) return 1
    const th = Math.atan2(p.y - c.y, p.x - c.x)
    let d = (az - th) % (Math.PI * 2)
    if (d < 0) d += Math.PI * 2
    return 0.7 + 0.3 * Math.exp(-d / 1.2)
  }
  const flashOff = (t: Track) =>
    !!t.alert && !f.reduced && f.t - t.alert.t < ALERT_FLASH_S && Math.floor(f.t * 4) % 2 === 1
  for (const t of lay.tracks) {
    const col = t.alert ? alertC : blip
    const dim = flashOff(t) ? 0.3 : 1
    // history: 5 dots at t - 4k s
    ctx.fillStyle = col
    for (let k = 1; k <= HISTORY; k++) {
      const w = jetWorldAt(f.tl, t.id, f.t - HISTORY_DT * k)
      if (!w) continue
      const p = cam.worldToScreen(w)
      ctx.globalAlpha = (0.5 - (k - 1) * 0.1) * dim
      ctx.beginPath()
      ctx.arc(p.x, p.y, t.stacked ? 0.8 : 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
    if (t.stacked) {
      ctx.globalAlpha = brightness(t.sp) * dim
      ctx.beginPath()
      ctx.arc(t.sp.x, t.sp.y, 2, 0, Math.PI * 2)
      ctx.fill()
      continue
    }
    // leader: 20 s ahead from the derivative
    const w1 = jetWorldAt(f.tl, t.id, f.t - 1)
    if (w1) {
      const ahead = cam.worldToScreen({ x: t.world.x + (t.world.x - w1.x) * LEADER_S, y: t.world.y + (t.world.y - w1.y) * LEADER_S })
      ctx.globalAlpha = 0.45 * dim
      ctx.strokeStyle = col
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(t.sp.x, t.sp.y)
      ctx.lineTo(ahead.x, ahead.y)
      ctx.stroke()
    }
  }

  // knock out the data-block rects (rings, plate, history and leaders run under them), then the chevrons on top
  if (blockA > 0.01) {
    ctx.globalAlpha = blockA * 0.85
    ctx.fillStyle = glass
    for (const b of [ownBox, ...placed.map(p => p.box)]) ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0)
  }
  for (const t of lay.tracks) {
    if (t.stacked) continue
    // symbol: filled chevron, 7 px, along the heading
    ctx.globalAlpha = brightness(t.sp) * (flashOff(t) ? 0.3 : 1)
    ctx.fillStyle = t.alert ? alertC : blip
    chevron(ctx, t.sp, t.heading)
  }

  // data blocks: own ship first, then tracks; each line on a --scope-bg halo, as label() does
  if (blockA > 0.01) {
    ctx.font = mono
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    const haloText = (text: string, x: number, y: number, color: string) => {
      ctx.lineWidth = 3
      ctx.strokeStyle = bg
      ctx.strokeText(text, x, y)
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
    }
    ctx.globalAlpha = blockA
    leaderLine(ctx, shipSp, ownBox, ink3)
    ownLines.forEach((l, i) => {
      const y = ownBox.y0 + BLOCK_PAD + LINE_H * (i + 0.5)
      if (i === 1) {
        haloText('DECK ', ownBox.x0 + BLOCK_PAD, y, ink)
        haloText(deckWord, ownBox.x0 + BLOCK_PAD + textW(ctx, 'DECK '), y, deckWord === 'GREEN' ? ink : alertC)
      } else {
        haloText(l, ownBox.x0 + BLOCK_PAD, y, i === 0 ? ink : ink2)
      }
    })
    for (const p of placed) {
      const t = p.t
      const col = t?.alert ? alertC : ink
      const dim = t && flashOff(t) ? 0.3 : 1
      ctx.globalAlpha = blockA * dim
      leaderLine(ctx, p.anchor, p.box, t?.alert ? alertC : ink3)
      p.lines.forEach((l, i) => {
        haloText(l, p.box.x0 + BLOCK_PAD, p.box.y0 + BLOCK_PAD + LINE_H * (i + 0.5), i === 0 ? col : t?.alert ? alertC : ink2)
      })
      if (t && t.id === selected) {
        ctx.strokeStyle = col
        ctx.lineWidth = 1
        ctx.strokeRect(Math.round(p.box.x0) + 0.5, Math.round(p.box.y0) + 0.5, Math.round(p.box.x1 - p.box.x0), Math.round(p.box.y1 - p.box.y0))
      }
    }
  }

  // 8. sweep (cosmetic, wall clock); none under reduced motion
  const sweepA = sstep(scope, 0.6, 1)
  if (sweepOn && sweepA > 0.01) {
    const span = (40 * Math.PI) / 180
    const sw = cssVar('--scope-sweep')
    const g = ctx.createConicGradient(az - span, c.x, c.y)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(span / (Math.PI * 2), sw)
    g.addColorStop(span / (Math.PI * 2) + 0.0005, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalAlpha = sweepA
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(c.x, c.y, iris.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = sw
    ctx.lineWidth = 1
    ctx.globalAlpha = Math.min(1, sweepA * 2)
    ctx.beginPath()
    ctx.moveTo(c.x, c.y)
    ctx.lineTo(c.x + Math.cos(az) * iris.r, c.y + Math.sin(az) * iris.r)
    ctx.stroke()
  }
  ctx.restore()

  // 9. iris edge: a labelled range ring
  if (scope < 0.999) {
    ctx.save()
    const gr = ctx.createRadialGradient(c.x, c.y, iris.r, c.x, c.y, iris.r + 6)
    gr.addColorStop(0, 'rgba(8,12,15,0.45)')
    gr.addColorStop(1, 'rgba(8,12,15,0)')
    ctx.fillStyle = gr
    ctx.beginPath()
    ctx.arc(c.x, c.y, iris.r + 6, 0, Math.PI * 2)
    ctx.arc(c.x, c.y, iris.r, 0, Math.PI * 2, true)
    ctx.fill()
    ctx.strokeStyle = ring2
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(c.x, c.y, iris.r, 0, Math.PI * 2)
    ctx.stroke()
    const b = visibleBearing(c, iris.r + 14, 45, { x0: 0, y0: 0, x1: cam.w, y1: cam.h }, 24)
    if (b !== null && iris.r > 12) {
      const d = dir(b)
      const text = `scope range ${(iris.r / nmPx).toFixed(1)} nm`
      ctx.font = mono
      ctx.textBaseline = 'middle'
      ctx.textAlign = d.x >= 0 ? 'left' : 'right'
      const x = c.x + d.x * (iris.r + 8), y = c.y + d.y * (iris.r + 10)
      ctx.lineJoin = 'round'
      ctx.lineWidth = 3
      ctx.strokeStyle = cssVar('--hud-halo')
      ctx.strokeText(text, x, y)
      ctx.fillStyle = cssVar('--hud-ink-2')
      ctx.fillText(text, x, y)
    }
    ctx.restore()
  }
}

/** Bearing ticks (2 deg minor, 10 deg major, inward), cached per centre and radius. */
let tickCache: { key: string; path: Path2D } | null = null
function tickPath(c: Vec2, r: number): Path2D {
  const key = `${c.x.toFixed(2)},${c.y.toFixed(2)},${r.toFixed(3)}`
  if (tickCache && tickCache.key === key) return tickCache.path
  const path = new Path2D()
  for (let b = 0; b < 360; b += 2) {
    const d = dir(b)
    const len = b % 10 === 0 ? 8 : 4
    path.moveTo(c.x + d.x * r, c.y + d.y * r)
    path.lineTo(c.x + d.x * (r - len), c.y + d.y * (r - len))
  }
  tickCache = { key, path }
  return path
}

function chevron(ctx: CanvasRenderingContext2D, p: Vec2, headingDeg: number): void {
  const a = (headingDeg * Math.PI) / 180
  const ca = Math.cos(a), sa = Math.sin(a)
  const pt = (x: number, y: number) => ({ x: p.x + x * ca - y * sa, y: p.y + x * sa + y * ca })
  const tip = pt(4, 0), l = pt(-3, -3.5), n = pt(-1, 0), r = pt(-3, 3.5)
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(l.x, l.y)
  ctx.lineTo(n.x, n.y)
  ctx.lineTo(r.x, r.y)
  ctx.closePath()
  ctx.fill()
}

/** A hairline from the symbol to the nearest point of its block (skipped when the block touches the symbol). */
function leaderLine(ctx: CanvasRenderingContext2D, a: Vec2, b: Box, color: string): void {
  const x = Math.min(b.x1, Math.max(b.x0, a.x))
  const y = Math.min(b.y1, Math.max(b.y0, a.y))
  const d = Math.hypot(x - a.x, y - a.y)
  if (d < 7) return
  const ux = (x - a.x) / d, uy = (y - a.y) / d
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(a.x + ux * 5, a.y + uy * 5)
  ctx.lineTo(x, y)
  ctx.stroke()
}

/** 10 px radius. */
export function hitScope(f: Frame, iris: Iris, air: AirJet[], screen: Vec2): string | null {
  if (iris.r <= 0.5) return null
  if (Math.hypot(screen.x - iris.x, screen.y - iris.y) > iris.r) return null
  const lay = buildTracks(f, iris, air)
  let best: string | null = null
  let bestD = HIT_PX
  for (const t of lay.tracks) {
    const d = Math.hypot(t.sp.x - screen.x, t.sp.y - screen.y)
    if (d <= bestD) {
      bestD = d
      best = t.id
    }
  }
  return best && aircraftEntity(f.tl, best) ? best : null
}
