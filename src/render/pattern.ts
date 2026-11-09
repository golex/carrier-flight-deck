import type { Camera } from './camera'
import type { AircraftEntity, PatternEntity, Timeline } from '../sim/types'
import { phaseAt, samplePattern, type PatternState } from '../sim/sample'
import { cssVar, tokens } from './tokens'
import { CASE_I, NM_FT, racetrack } from './patternGeom'

/**
 * Overhead-pattern inset: a small schematic of the Case I pattern drawn on the main canvas.
 * Pattern frame (types.ts PatternKeyframe): nm, ship at origin, x ahead along the BRC, y to starboard.
 * Drawn like the main view: ahead -> screen right, starboard -> screen down, so the port downwind sits above the ship.
 */

// ---- nominal Case I geometry (patternGeom.ts), research §5.2 (nm unless noted) ----
const SHIP_LEN_FT = 1092 // §1.2
const SHIP_BEAM_FT = 252 // §1.2
const { initialStart: INITIAL_START, initialEnd: INITIAL_END, breakRadius: BREAK_RADIUS, downwindY: DOWNWIND_Y,
  abeamX: ABEAM_X, ninety: NINETY, finalDeg: FINAL_DEG, rampX: RAMP_X, grooveNm: GROOVE_NM } = CASE_I
/** how far the faint final-bearing line extends astern of the groove start */
const BEARING_EXT_NM = 1.6

// ---- inset layout ----
const DESK = { w: 320, h: 210 }
const SMALL = { w: 240, h: 160 }
const PHONE = { w: 200, h: 130 }
const MARGIN = 16
const BOTTOM_CLEAR = 92 // clear of the 48 px transport bar at bottom 16 px
const PHONE_TOP = 64
const PANEL_W = 352 // side panel width + gutter
const HEADER_CLEAR = 130 // keep below the header block on desktop
const PHONE_BREAK = 760 // matches the CSS media query
const SMALL_W = 1024
const SMALL_H = 700
const TITLE_H = 22
/** the `Whole pattern ⤢` footer strip */
const FOOTER_H = 18
/** px per nm at the desktop size (1 nm ≈ 40-45 px), scaled with inset width */
const PX_PER_NM = 44
/** ship centre as a fraction of the plot area (more room above for the downwind and stack) */
const ORIGIN_FX = 0.62
const ORIGIN_FY = 0.68
/** marshal jets collapse into one stack marker beyond this many */
const STACK_MAX_DOTS = 4
const STACK_RING_NM = 0.35
/** px between the stack ring and its label above it */
const STACK_LABEL_GAP = 8
const FADE_S = 0.3

let alpha = 0
let lastNow = 0
let modexCache: { src: AircraftEntity[]; map: Map<string, string> } | null = null
const reducedMotion =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null

interface Pt {
  x: number
  y: number
}

function modexOf(tl: Timeline, id: string): string {
  if (!modexCache || modexCache.src !== tl.aircraft) {
    modexCache = { src: tl.aircraft, map: new Map(tl.aircraft.map(a => [a.id, a.modex])) }
  }
  return modexCache.map.get(id) ?? ''
}

function layout(cam: Camera, panelOpen: boolean): { x: number; y: number; w: number; h: number } | null {
  const vw = cam.w
  const vh = cam.h
  if (vw <= PHONE_BREAK) {
    // side panel moves to the bottom 42vh: inset goes top-right
    return { x: vw - MARGIN - PHONE.w, y: PHONE_TOP, w: PHONE.w, h: PHONE.h }
  }
  let size = vw < SMALL_W || vh < SMALL_H ? SMALL : DESK
  const free = vw - (panelOpen ? PANEL_W : 0) - 2 * MARGIN
  if (free < size.w) size = SMALL
  if (free < size.w) return null
  let y = vh - BOTTOM_CLEAR - size.h
  if (y < HEADER_CLEAR && size !== SMALL) {
    size = SMALL
    y = vh - BOTTOM_CLEAR - size.h
  }
  if (y < HEADER_CLEAR) return null
  return { x: MARGIN, y, w: size.w, h: size.h }
}

/** The inset's screen box (CSS px), or null when it does not fit. */
export function patternInsetBox(cam: Camera, panelOpen: boolean): { x: number; y: number; w: number; h: number } | null {
  return layout(cam, panelOpen)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function drawPatternInset(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  tl: Timeline,
  t: number,
  opts: { visible: boolean; panelOpen: boolean; alphaMul: number },
): void {
  // sample first: visibility depends on it
  const samples: { s: PatternState; heading: number }[] = []
  for (const e of tl.pattern as PatternEntity[]) {
    const s = samplePattern(e, t)
    if (!s || s.leg === 'none') continue
    // heading from the track tangent (the inset's screen frame matches the pattern frame: ahead right, starboard down)
    let q = samplePattern(e, t - 1)
    let dx = q ? s.x - q.x : 0
    let dy = q ? s.y - q.y : 0
    if (Math.hypot(dx, dy) < 1e-7) {
      q = samplePattern(e, t + 1)
      dx = q ? q.x - s.x : 1
      dy = q ? q.y - s.y : 0
    }
    samples.push({ s, heading: Math.atan2(dy, dx) })
  }
  const target = opts.visible && (samples.length > 0 || phaseAt(tl, t)?.id === 'recovery') ? 1 : 0

  const now = performance.now()
  const dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0
  lastNow = now
  if (reducedMotion?.matches || dt === 0) alpha = target
  else alpha += Math.sign(target - alpha) * Math.min(Math.abs(target - alpha), dt / FADE_S)
  if (alpha * opts.alphaMul <= 0.001) return

  const box = layout(cam, opts.panelOpen)
  if (!box) return
  const T = tokens()
  const bg = cssVar('--scope-bg')
  const ringC = cssVar('--scope-ring')
  const ring2 = cssVar('--scope-ring-2')
  const legC = cssVar('--scope-leg')
  const ink = cssVar('--scope-ink')
  const ink2 = cssVar('--scope-ink-2')
  const ink3 = cssVar('--scope-ink-3')
  const blip = cssVar('--scope-blip')
  const alertC = cssVar('--scope-alert')
  const k = PX_PER_NM * (box.w / DESK.w)
  const small = box.w < SMALL.w + 1
  const pad = small ? 8 : 10
  const titleH = small ? TITLE_H - 4 : TITLE_H
  const plot = { x: box.x + 1, y: box.y + titleH + 2, w: box.w - 2, h: box.h - titleH - 3 - FOOTER_H }
  const o = { x: plot.x + plot.w * ORIGIN_FX, y: plot.y + plot.h * ORIGIN_FY }
  const P = (p: Pt): Pt => ({ x: o.x + p.x * k, y: o.y + p.y * k })

  ctx.save()
  ctx.globalAlpha = alpha * opts.alphaMul

  // panel: a small face of the same scope
  roundRect(ctx, box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, 6)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = ring2
  ctx.stroke()

  // title + airborne readout
  ctx.textBaseline = 'middle'
  ctx.fillStyle = ink2
  ctx.font = `${small ? 11 : 12}px ${T.fontSans}`
  ctx.textAlign = 'left'
  ctx.fillText('Overhead pattern, Case I', box.x + pad, box.y + titleH / 2 + 3)
  ctx.font = `${small ? 10 : 11}px ${T.fontMono}`
  ctx.textAlign = 'right'
  // the readout drops its word when the title would collide with it (phone size)
  const titleW = (() => {
    ctx.save()
    ctx.font = `${small ? 11 : 12}px ${T.fontSans}`
    const w = ctx.measureText('Overhead pattern, Case I').width
    ctx.restore()
    return w
  })()
  const full = `${samples.length} airborne`
  const readout = pad + titleW + 8 + ctx.measureText(full).width + pad <= box.w ? full : String(samples.length)
  ctx.fillText(readout, box.x + box.w - pad, box.y + titleH / 2 + 3)

  // footer: the inset is a button to the whole-pattern scope (view 6)
  {
    const fy = box.y + box.h - FOOTER_H / 2 - 1
    ctx.strokeStyle = ringC
    ctx.beginPath()
    ctx.moveTo(box.x + 1, box.y + box.h - FOOTER_H - 1.5)
    ctx.lineTo(box.x + box.w - 1, box.y + box.h - FOOTER_H - 1.5)
    ctx.stroke()
    ctx.font = `11px ${T.fontSans}`
    ctx.textAlign = 'right'
    ctx.fillStyle = ink
    ctx.fillText('Whole pattern ⤢', box.x + box.w - pad, fy)
  }

  // clip the diagram to the plot area
  ctx.save()
  ctx.beginPath()
  ctx.rect(plot.x, plot.y, plot.w, plot.h)
  ctx.clip()

  // range rings every nm around the ship
  ctx.strokeStyle = ringC
  ctx.lineWidth = 1
  for (let r = 1; r <= 6; r++) {
    ctx.beginPath()
    ctx.arc(o.x, o.y, r * k, 0, Math.PI * 2)
    ctx.stroke()
  }

  // final bearing and groove geometry
  const fr = (FINAL_DEG * Math.PI) / 180
  const fdir = { x: Math.cos(fr), y: Math.sin(fr) }
  const ramp = { x: RAMP_X, y: 0 }
  const grooveStart = { x: ramp.x - fdir.x * GROOVE_NM, y: ramp.y - fdir.y * GROOVE_NM }
  const bearingEnd = { x: grooveStart.x - fdir.x * BEARING_EXT_NM, y: grooveStart.y - fdir.y * BEARING_EXT_NM }

  // faint final bearing line (9° left of ship course), astern of the groove
  ctx.setLineDash([1, 4])
  ctx.strokeStyle = ring2
  ctx.beginPath()
  const b0 = P(bearingEnd)
  const b1 = P(grooveStart)
  ctx.moveTo(b0.x, b0.y)
  ctx.lineTo(b1.x, b1.y)
  ctx.stroke()

  // nominal racetrack (patternGeom), dashed like the scope's
  const bc = { x: INITIAL_END.x + BREAK_RADIUS, y: (INITIAL_END.y + DOWNWIND_Y) / 2 }
  ctx.setLineDash([3, 3])
  ctx.lineCap = 'round'
  ctx.strokeStyle = legC
  ctx.stroke(racetrack(P))
  ctx.setLineDash([])
  const p = (q: Pt) => P(q)
  const n = p(NINETY)

  // ship symbol, to scale but with a pixel floor, outlined and named so the reader can orient the pattern
  const sl = Math.max(14, (SHIP_LEN_FT / NM_FT) * k)
  const sb = Math.max(4, (SHIP_BEAM_FT / NM_FT) * k)
  ctx.strokeStyle = blip
  ctx.lineWidth = 1
  ctx.strokeRect(o.x - sl / 2, o.y - sb / 2, sl, sb)
  ctx.font = `10px ${T.fontMono}`
  ctx.fillStyle = ink2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('ship', o.x, o.y + sb / 2 + 2)

  // aircraft first; each number's box is kept so the leg labels can stay off them
  type Box = { x0: number; y0: number; x1: number; y1: number }
  const taken: Box[] = [{ x0: o.x - sl / 2 - 1, y0: o.y - sb / 2 - 1, x1: o.x + sl / 2 + 1, y1: o.y + sb / 2 + 14 }]
  ctx.font = `10px ${T.fontMono}`
  const marshal = samples.filter(q => q.s.leg === 'marshal').map(q => q.s)
  const stacked = marshal.length > STACK_MAX_DOTS
  const inner = { x0: plot.x + 4, y0: plot.y + 4, x1: plot.x + plot.w - 4, y1: plot.y + plot.h - 4 }
  const clampPt = (s: Pt): Pt => ({
    x: Math.min(inner.x1, Math.max(inner.x0, s.x)),
    y: Math.min(inner.y1, Math.max(inner.y0, s.y)),
  })
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.lineJoin = 'round'
  for (const { s, heading } of samples) {
    if (stacked && s.leg === 'marshal') continue
    const sp = clampPt(P(s))
    const col = s.leg === 'bolter' ? alertC : s.leg === 'departure' ? ink3 : blip
    ctx.fillStyle = col
    chevron(ctx, sp, heading)
    taken.push({ x0: sp.x - 4, y0: sp.y - 4, x1: sp.x + 4, y1: sp.y + 4 })
    const label = modexOf(tl, s.aircraftId)
    if (label) {
      const w = ctx.measureText(label).width
      // right of the chevron, else left, else whichever stays in the plot
      const hits = (x: number) => taken.some(t => t.x0 < x + w && t.x1 > x && t.y0 < sp.y + 6 && t.y1 > sp.y - 6)
      const fitsR = sp.x + 6 + w <= plot.x + plot.w - 2
      const lx = fitsR && !hits(sp.x + 6) ? sp.x + 6 : !hits(sp.x - 6 - w) || !fitsR ? sp.x - 6 - w : sp.x + 6
      // glass-coloured halo so a number crossing a dashed leg still reads
      ctx.lineWidth = 3
      ctx.strokeStyle = bg
      ctx.strokeText(label, lx, sp.y)
      ctx.fillStyle = s.leg === 'bolter' ? alertC : ink
      ctx.fillText(label, lx, sp.y)
      taken.push({ x0: lx, y0: sp.y - 6, x1: lx + w, y1: sp.y + 6 })
    }
  }
  // the downwind label's anchor: the stack ring keeps above it
  const qDown = p({ x: (bc.x + ABEAM_X) / 2, y: DOWNWIND_Y })
  if (stacked) {
    const m = marshal.reduce((acc, s) => ({ x: acc.x + s.x / marshal.length, y: acc.y + s.y / marshal.length }), { x: 0, y: 0 })
    const low = Math.round(Math.min(...marshal.map(s => s.alt)) / 1000) * 1000
    const r = Math.max(5, STACK_RING_NM * k)
    const sp = clampPt(P(m))
    const cx = Math.min(inner.x1 - r, Math.max(inner.x0 + r, sp.x))
    const cy = Math.max(inner.y0 + r + STACK_LABEL_GAP + 6, Math.min(inner.y1 - r, sp.y, qDown.y - 5 - 12 - r))
    ctx.setLineDash([2, 2])
    ctx.strokeStyle = blip
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = ink2
    const label = `x${marshal.length} in the stack, ${low} ft`
    // label above the ring, so it never lands on the downwind / break labels beside it
    const w = ctx.measureText(label).width
    const lx = Math.min(plot.x + plot.w - 4 - w, Math.max(plot.x + 4, cx - w / 2))
    ctx.fillText(label, lx, cy - r - STACK_LABEL_GAP)
    taken.push({ x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r }, { x0: lx, y0: cy - r - STACK_LABEL_GAP - 6, x1: lx + w, y1: cy - r - STACK_LABEL_GAP + 6 })
  }

  // leg labels last, each only where it clears every aircraft number (the dashed leg still shows the leg)
  ctx.font = `11px ${T.fontMono}`
  ctx.fillStyle = ink2
  ctx.textBaseline = 'alphabetic'
  const legLabel = (text: string, x: number, y: number, align: CanvasTextAlign) => {
    const w = ctx.measureText(text).width
    const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2
    const b = { x0: x0 - 2, y0: y - 11, x1: x0 + w + 2, y1: y + 3 }
    if (taken.some(t => t.x0 < b.x1 && t.x1 > b.x0 && t.y0 < b.y1 && t.y1 > b.y0)) return
    ctx.textAlign = align
    ctx.lineWidth = 3
    ctx.strokeStyle = bg
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
  }
  const qInit = p({ x: INITIAL_START.x, y: INITIAL_START.y })
  legLabel('initial 800 ft', qInit.x, qInit.y + 13, 'left')
  legLabel('downwind 600 ft', qDown.x, qDown.y - 5, 'center')
  legLabel('the 90', n.x - 5, n.y + 3, 'right')
  const gm = p({ x: (grooveStart.x + ramp.x) / 2, y: (grooveStart.y + ramp.y) / 2 })
  legLabel('groove', gm.x, gm.y - 7, 'center')

  ctx.restore()
  ctx.restore()
}

/** Filled 7 px chevron along `heading` (radians, screen frame). */
function chevron(ctx: CanvasRenderingContext2D, p: Pt, heading: number): void {
  const ca = Math.cos(heading), sa = Math.sin(heading)
  const q = (x: number, y: number) => ({ x: p.x + x * ca - y * sa, y: p.y + x * sa + y * ca })
  const a = q(4, 0), b = q(-3, -3.5), c = q(-1, 0), d = q(-3, 3.5)
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.lineTo(c.x, c.y)
  ctx.lineTo(d.x, d.y)
  ctx.closePath()
  ctx.fill()
}
