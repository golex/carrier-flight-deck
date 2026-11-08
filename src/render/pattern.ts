import type { Camera } from './camera'
import type { AircraftEntity, PatternEntity, Timeline } from '../sim/types'
import { phaseAt, samplePattern, type PatternState } from '../sim/sample'
import { tokens } from './tokens'

/**
 * Overhead-pattern inset: a small schematic of the Case I pattern drawn on the main canvas.
 * Pattern frame (types.ts PatternKeyframe): nm, ship at origin, x ahead along the BRC, y to starboard.
 * Drawn like the main view: ahead -> screen right, starboard -> screen down, so the port downwind sits above the ship.
 */

// ---- nominal Case I geometry, research §5.2 (nm unless noted) ----
const NM_FT = 6076
const SHIP_LEN_FT = 1092 // §1.2
const SHIP_BEAM_FT = 252 // §1.2
/** initial: 3 nm astern, slightly starboard of the BRC, 800 ft */
const INITIAL_START = { x: -3, y: 0.15 }
const INITIAL_END = { x: 0, y: 0.08 }
/** break: level 180° left turn over / ahead of the ship, ends on the downwind */
const BREAK_RADIUS = 0.6
/** downwind: 1.1-1.3 nm abeam to port, reciprocal heading, 600 ft */
const DOWNWIND_Y = -1.2
/** the 180 starts abeam the LSO platform (stern) */
const ABEAM_X = -0.1
/** the 90: about 1.0-1.2 nm from the ship, nose to starboard */
const NINETY = { x: -1.15, y: -0.55 }
/** final course: angled deck, 9° left of ship course (§1.2, §5.2) */
const FINAL_DEG = -9
/** ramp position relative to ship centre (546 ft aft of mid-length) */
const RAMP_X = -546 / NM_FT
/** groove: about 0.75 nm of track to touchdown */
const GROOVE_NM = 0.75
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
  opts: { visible: boolean; panelOpen: boolean },
): void {
  // sample first: visibility depends on it
  const samples: PatternState[] = []
  for (const e of tl.pattern as PatternEntity[]) {
    const s = samplePattern(e, t)
    if (s && s.leg !== 'none') samples.push(s)
  }
  const target = opts.visible && (samples.length > 0 || phaseAt(tl, t)?.id === 'recovery') ? 1 : 0

  const now = performance.now()
  const dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0
  lastNow = now
  if (reducedMotion?.matches || dt === 0) alpha = target
  else alpha += Math.sign(target - alpha) * Math.min(Math.abs(target - alpha), dt / FADE_S)
  if (alpha <= 0.001) return

  const box = layout(cam, opts.panelOpen)
  if (!box) return
  const T = tokens()
  const k = PX_PER_NM * (box.w / DESK.w)
  const small = box.w < SMALL.w + 1
  const pad = small ? 8 : 10
  const titleH = small ? TITLE_H - 4 : TITLE_H
  const plot = { x: box.x + 1, y: box.y + titleH + 2, w: box.w - 2, h: box.h - titleH - 3 }
  const o = { x: plot.x + plot.w * ORIGIN_FX, y: plot.y + plot.h * ORIGIN_FY }
  const P = (p: Pt): Pt => ({ x: o.x + p.x * k, y: o.y + p.y * k })

  ctx.save()
  ctx.globalAlpha = alpha

  // panel
  roundRect(ctx, box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, 6)
  ctx.fillStyle = T.panel
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = T.line
  ctx.stroke()

  // title + airborne readout
  ctx.textBaseline = 'middle'
  ctx.fillStyle = T.ink2
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

  // clip the diagram to the plot area
  ctx.save()
  ctx.beginPath()
  ctx.rect(plot.x, plot.y, plot.w, plot.h)
  ctx.clip()

  // final bearing and groove geometry
  const fr = (FINAL_DEG * Math.PI) / 180
  const fdir = { x: Math.cos(fr), y: Math.sin(fr) }
  const ramp = { x: RAMP_X, y: 0 }
  const grooveStart = { x: ramp.x - fdir.x * GROOVE_NM, y: ramp.y - fdir.y * GROOVE_NM }
  const bearingEnd = { x: grooveStart.x - fdir.x * BEARING_EXT_NM, y: grooveStart.y - fdir.y * BEARING_EXT_NM }

  // faint final bearing line (9° left of ship course), astern of the groove
  ctx.setLineDash([1, 4])
  ctx.strokeStyle = T.line
  ctx.lineWidth = 1
  ctx.beginPath()
  const b0 = P(bearingEnd)
  const b1 = P(grooveStart)
  ctx.moveTo(b0.x, b0.y)
  ctx.lineTo(b1.x, b1.y)
  ctx.stroke()

  // nominal racetrack, dotted
  const bc = { x: INITIAL_END.x + BREAK_RADIUS, y: (INITIAL_END.y + DOWNWIND_Y) / 2 }
  const br = (INITIAL_END.y - DOWNWIND_Y) / 2
  const breakStart = { x: bc.x, y: INITIAL_END.y }
  const abeam = { x: ABEAM_X, y: DOWNWIND_Y }
  ctx.setLineDash([1.5, 3])
  ctx.lineCap = 'round'
  ctx.strokeStyle = T.ink3
  ctx.beginPath()
  const p = (q: Pt) => P(q)
  let a = p(INITIAL_START)
  ctx.moveTo(a.x, a.y)
  a = p(breakStart)
  ctx.lineTo(a.x, a.y)
  // break: left turn (toward port = up on screen), anticlockwise on screen from +y-side to -y-side
  const c = p(bc)
  ctx.arc(c.x, c.y, br * k, Math.PI / 2, -Math.PI / 2, true)
  a = p(abeam)
  ctx.lineTo(a.x, a.y)
  // the 180 -> the 90 -> groove start (bezier with heading tangents)
  const n = p(NINETY)
  const turnR = 0.45
  let c1 = p({ x: abeam.x - turnR, y: abeam.y })
  let c2 = p({ x: NINETY.x, y: NINETY.y - turnR * 0.8 })
  ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, n.x, n.y)
  const gs = p(grooveStart)
  c1 = p({ x: NINETY.x, y: NINETY.y + turnR })
  c2 = p({ x: grooveStart.x - fdir.x * turnR * 0.8, y: grooveStart.y - fdir.y * turnR * 0.8 })
  ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, gs.x, gs.y)
  const rp = p(ramp)
  ctx.lineTo(rp.x, rp.y)
  ctx.stroke()
  ctx.setLineDash([])

  // ship symbol, to scale but with a pixel floor, outlined and named so the reader can orient the pattern
  const sl = Math.max(14, (SHIP_LEN_FT / NM_FT) * k)
  const sb = Math.max(4, (SHIP_BEAM_FT / NM_FT) * k)
  ctx.fillStyle = T.deck
  ctx.fillRect(o.x - sl / 2, o.y - sb / 2, sl, sb)
  ctx.strokeStyle = T.ink
  ctx.lineWidth = 1
  ctx.strokeRect(o.x - sl / 2, o.y - sb / 2, sl, sb)
  ctx.font = `10px ${T.fontMono}`
  ctx.fillStyle = T.ink2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('ship', o.x, o.y + sb / 2 + 2)

  // aircraft first; each number's box is kept so the leg labels can stay off them
  type Box = { x0: number; y0: number; x1: number; y1: number }
  const taken: Box[] = []
  ctx.font = `10px ${T.fontMono}`
  const marshal = samples.filter(s => s.leg === 'marshal')
  const stacked = marshal.length > STACK_MAX_DOTS
  const inner = { x0: plot.x + 4, y0: plot.y + 4, x1: plot.x + plot.w - 4, y1: plot.y + plot.h - 4 }
  const clampPt = (s: Pt): Pt => ({
    x: Math.min(inner.x1, Math.max(inner.x0, s.x)),
    y: Math.min(inner.y1, Math.max(inner.y0, s.y)),
  })
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.lineJoin = 'round'
  for (const s of samples) {
    if (stacked && s.leg === 'marshal') continue
    const sp = clampPt(P(s))
    ctx.fillStyle = s.leg === 'bolter' ? T.markRed : s.leg === 'departure' ? T.ink3 : T.jet
    ctx.beginPath()
    ctx.arc(sp.x, sp.y, 2, 0, Math.PI * 2)
    ctx.fill()
    taken.push({ x0: sp.x - 3, y0: sp.y - 3, x1: sp.x + 3, y1: sp.y + 3 })
    const label = modexOf(tl, s.aircraftId)
    if (label) {
      const w = ctx.measureText(label).width
      const lx = sp.x + 5 + w > plot.x + plot.w - 2 ? sp.x - 5 - w : sp.x + 5
      // panel-coloured halo so a number crossing a dotted leg still reads
      ctx.lineWidth = 3
      ctx.strokeStyle = T.panel
      ctx.strokeText(label, lx, sp.y)
      ctx.fillStyle = T.ink2
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
    ctx.strokeStyle = T.jet
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = T.ink2
    const label = `x${marshal.length} in the stack, ${low} ft`
    // label above the ring, so it never lands on the downwind / break labels beside it
    const w = ctx.measureText(label).width
    const lx = Math.min(plot.x + plot.w - 4 - w, Math.max(plot.x + 4, cx - w / 2))
    ctx.fillText(label, lx, cy - r - STACK_LABEL_GAP)
    taken.push({ x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r }, { x0: lx, y0: cy - r - STACK_LABEL_GAP - 6, x1: lx + w, y1: cy - r - STACK_LABEL_GAP + 6 })
  }

  // leg labels last, each only where it clears every aircraft number (the dotted leg still shows the leg)
  ctx.font = `11px ${T.fontMono}`
  ctx.fillStyle = T.ink2
  ctx.textBaseline = 'alphabetic'
  const legLabel = (text: string, x: number, y: number, align: CanvasTextAlign) => {
    const w = ctx.measureText(text).width
    const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2
    const b = { x0: x0 - 2, y0: y - 11, x1: x0 + w + 2, y1: y + 3 }
    if (taken.some(t => t.x0 < b.x1 && t.x1 > b.x0 && t.y0 < b.y1 && t.y1 > b.y0)) return
    ctx.textAlign = align
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
