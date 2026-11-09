// Airborne jets outside the scope: true-scale silhouettes over the sea with altitude-offset shadows, plus every
// deck jet's shadow. Lane E (visuals spec §3.E).
import type { Frame, JetSample } from './frame'
import type { AircraftEntity, AircraftType, PatternEntity, PatternKeyframe, Timeline, Vec2 } from '../sim/types'
import type { AircraftState } from '../sim/sample'
import { samplePattern } from '../sim/sample'
import { irisGeometry, type Iris } from './scope'
import { SILHOUETTES } from '../data/silhouettes'
import { aircraftShadowHeight, nmToWorld, shadowOffset } from './world'
import { cssVar, tokens } from './tokens'

export interface AirJet { id: string; modex: string; type: AircraftType; world: Vec2; heading: number; alt: number; leg: PatternKeyframe['leg'] }

/** Airborne silhouettes are never drawn shorter than this on screen (px). */
const MIN_LEN_PX = 10
/** Arrow shadows below this zoom (matches aircraft.ts's arrow band). */
const ARROW_Z = 0.35
const LABEL_FONT_PX = 10

// ---------------------------------------------------------------- lookups

interface Entry { a: AircraftEntity; p: PatternEntity | null }
let lookup: { tl: Timeline; map: Map<string, Entry> } | null = null

function entries(tl: Timeline): Map<string, Entry> {
  if (lookup && lookup.tl === tl) return lookup.map
  const map = new Map<string, Entry>()
  for (const a of tl.aircraft) map.set(a.id, { a, p: null })
  for (const p of tl.pattern) {
    const e = map.get(p.aircraftId)
    if (e) e.p = p
  }
  lookup = { tl, map }
  return map
}

export function aircraftEntity(tl: Timeline, id: string): AircraftEntity | null {
  return entries(tl).get(id)?.a ?? null
}

/** Pattern position in world ft at t (leg !== 'none'), or null. */
function patternWorldAt(p: PatternEntity | null, t: number): { w: Vec2; alt: number; leg: PatternKeyframe['leg'] } | null {
  if (!p) return null
  const s = samplePattern(p, t)
  if (!s || s.leg === 'none') return null
  return { w: nmToWorld(s), alt: s.alt, leg: s.leg }
}

/**
 * Where jet `id` is at time t in world ft: its deck sample while that is visible, else its pattern position.
 * Used for scope history dots and leaders. Deterministic in t.
 */
export function jetWorldAt(tl: Timeline, id: string, t: number): Vec2 | null {
  const e = entries(tl).get(id)
  if (!e) return null
  const tr = e.a.track
  if (tr.length && t >= tr[0]!.t && t <= tr[tr.length - 1]!.t) {
    // cheap visibility check without the full sampler: binary search the segment
    let lo = 0, hi = tr.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (tr[mid]!.t <= t) lo = mid
      else hi = mid
    }
    const a = tr[lo]!, b = tr[hi]!
    const u = b.t > a.t ? (t - a.t) / (b.t - a.t) : 1
    const status = u < 1 ? a.status : b.status
    const visible = !(status === 'airborne' && (b.status === 'airborne' || u === 0))
    if (visible) return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }
  }
  return patternWorldAt(e.p, t)?.w ?? null
}

// ---------------------------------------------------------------- silhouettes

/** Polygons from the silhouette path strings (M/L/Z only), re-wound to one orientation so a nonzero fill is their union. */
function polygons(d: string): Vec2[][] {
  const out: Vec2[][] = []
  let cur: Vec2[] | null = null
  const tok = d.match(/[MLZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []
  for (let i = 0; i < tok.length; i++) {
    const c = tok[i]!
    if (c === 'M' || c === 'm') {
      cur = [{ x: +tok[i + 1]!, y: +tok[i + 2]! }]
      out.push(cur)
      i += 2
    } else if (c === 'L' || c === 'l') {
      cur?.push({ x: +tok[i + 1]!, y: +tok[i + 2]! })
      i += 2
    } else if (c === 'Z' || c === 'z') cur = null
    else if (cur) {
      // implicit lineto
      cur.push({ x: +c, y: +tok[i + 1]! })
      i += 1
    }
  }
  for (const p of out) {
    let area = 0
    for (let i = 0; i < p.length; i++) {
      const a = p[i]!, b = p[(i + 1) % p.length]!
      area += a.x * b.y - b.x * a.y
    }
    if (area < 0) p.reverse()
  }
  return out
}

interface Shapes { spread: Path2D; folded: Path2D; arrowSpread: Path2D; arrowFolded: Path2D; length: number; span: number }
const shapes = new Map<AircraftType, Shapes>()

function shapesOf(type: AircraftType): Shapes {
  let s = shapes.get(type)
  if (s) return s
  const spec = SILHOUETTES[type]
  const spread = new Path2D()
  const folded = new Path2D()
  for (const [k, d] of Object.entries(spec.parts)) {
    const outer = k.startsWith('wingOuter') || k === 'podR' || k === 'podL'
    for (const poly of polygons(d)) {
      for (const path of outer ? [spread] : [spread, folded]) {
        poly.forEach((q, i) => (i ? path.lineTo(q.x, q.y) : path.moveTo(q.x, q.y)))
        path.closePath()
      }
    }
  }
  const arrow = (span: number) => {
    const p = new Path2D()
    p.moveTo(spec.length / 2, 0)
    p.lineTo(-spec.length / 2, span / 2)
    p.lineTo(-spec.length / 2 + 8, 0)
    p.lineTo(-spec.length / 2, -span / 2)
    p.closePath()
    return p
  }
  s = { spread, folded, arrowSpread: arrow(spec.span), arrowFolded: arrow(spec.spanFolded), length: spec.length, span: spec.span }
  shapes.set(type, s)
  return s
}

/** Scale-up factor so an airborne silhouette is at least MIN_LEN_PX long on screen. */
function minScale(type: AircraftType, z: number): number {
  return Math.max(1, MIN_LEN_PX / (SILHOUETTES[type].length * z))
}

/** Fill `path` (jet frame, ft) at world point w, heading deg, scaled by k. */
function fillJet(f: Frame, path: Path2D, w: Vec2, headingDeg: number, k: number): void {
  const { ctx, cam } = f
  const sc = cam.worldToScreen(w)
  ctx.save()
  ctx.translate(sc.x, sc.y)
  ctx.rotate((headingDeg * Math.PI) / 180)
  ctx.scale(cam.zoom * k, cam.zoom * k)
  ctx.fill(path)
  ctx.restore()
}

/** A colour with its alpha replaced. */
function setAlpha(color: string, a: number): string {
  const m = color.match(/[\d.]+/g) ?? []
  if (color.startsWith('#')) {
    const n = parseInt(color.slice(1, 7), 16)
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
  }
  return `rgba(${m[0]},${m[1]},${m[2]},${Math.max(0, Math.min(1, a))})`
}

function onScreen(f: Frame, w: Vec2, marginPx: number): boolean {
  const p = f.cam.worldToScreen(w)
  return p.x > -marginPx && p.y > -marginPx && p.x < f.cam.w + marginPx && p.y < f.cam.h + marginPx
}

// ---------------------------------------------------------------- public API

/** Pattern samples (leg !== 'none') whose deck sample is not visible. */
export function airborneJets(f: Frame): AirJet[] {
  const map = entries(f.tl)
  const deck = new Map<string, JetSample>()
  for (const j of f.jets) deck.set(j.a.id, j)
  const out: AirJet[] = []
  for (const p of f.tl.pattern) {
    const s = samplePattern(p, f.t)
    if (!s || s.leg === 'none') continue
    const d = deck.get(p.aircraftId)
    if (d?.s?.visible) continue
    const e = map.get(p.aircraftId)
    if (!e) continue
    // heading from the track tangent: sample(t) - sample(t - 1), or forward when the jet has just appeared
    let prev = samplePattern(p, f.t - 1)
    let dx = prev ? s.x - prev.x : 0
    let dy = prev ? s.y - prev.y : 0
    if (Math.hypot(dx, dy) < 1e-7) {
      prev = samplePattern(p, f.t + 1)
      dx = prev ? prev.x - s.x : 1
      dy = prev ? prev.y - s.y : 0
    }
    out.push({
      id: e.a.id, modex: e.a.modex, type: e.a.type, world: nmToWorld(s),
      heading: (Math.atan2(dy, dx) * 180) / Math.PI, alt: s.alt, leg: s.leg,
    })
  }
  return out
}

/** Deck jets (aircraftShadowHeight) + airborne (shadowOffset(alt)); --shadow-air. */
export function drawAircraftShadows(f: Frame, air: AirJet[]): void {
  if (!f.b.world) return
  const { ctx, cam } = f
  const z = cam.zoom
  const base = cssVar('--shadow-air')
  const arrows = z < ARROW_Z
  ctx.save()
  // deck-sampled jets: over the deck, height above the deck; past the ramp or the bow, above the water
  for (const { a, s } of f.jets) {
    if (!s || !s.visible) continue
    const { h, onSea } = aircraftShadowHeight(s as AircraftState)
    const o = shadowOffset(h)
    const w = { x: s.x + o.x, y: s.y + o.y }
    if (!onScreen(f, w, 80)) continue
    const sh = shapesOf(a.type)
    const spread = s.wingSpread > 0.5
    ctx.fillStyle = onSea ? setAlpha(base, 0.42 * clamp(1 - h / 2500, 0.25, 1)) : base
    fillJet(f, arrows ? (spread ? sh.arrowSpread : sh.arrowFolded) : spread ? sh.spread : sh.folded, w, s.heading, 1)
  }
  // airborne jets: on the sea, offset by their altitude, fainter the higher they are
  for (const j of air) {
    const o = shadowOffset(j.alt)
    const w = { x: j.world.x + o.x, y: j.world.y + o.y }
    if (!onScreen(f, w, 40)) continue
    const sh = shapesOf(j.type)
    ctx.fillStyle = setAlpha(base, 0.42 * clamp(1 - j.alt / 2500, 0.25, 1))
    fillJet(f, arrows ? sh.arrowSpread : sh.spread, w, j.heading, minScale(j.type, z))
  }
  ctx.restore()
}

/** Silhouettes and `modex · alt` labels for airborne jets outside the iris (the scope draws the ones inside it). */
export function drawAirborne(f: Frame, air: AirJet[], iris: Iris, selected: string | null): void {
  if (!f.b.world || !air.length) return
  const { ctx, cam } = f
  const T = tokens()
  const z = cam.zoom
  const shown: { j: AirJet; p: Vec2; half: number }[] = []
  ctx.save()
  ctx.fillStyle = T.jet
  for (const j of air) {
    const p = cam.worldToScreen(j.world)
    if (iris.r > 0 && Math.hypot(p.x - iris.x, p.y - iris.y) < iris.r) continue // no doubling: the scope owns it
    if (p.x < -40 || p.y < -40 || p.x > cam.w + 40 || p.y > cam.h + 40) continue
    const k = minScale(j.type, z)
    const sh = shapesOf(j.type)
    fillJet(f, sh.spread, j.world, j.heading, k)
    const half = (sh.length * z * k) / 2
    shown.push({ j, p, half })
    if (j.id === selected) {
      ctx.save()
      ctx.strokeStyle = T.markYellow
      ctx.lineWidth = 1.2
      ctx.setLineDash([3, 2])
      const r = Math.max(half, (sh.span * z * k) / 2) + 4
      ctx.strokeRect(p.x - r, p.y - r, r * 2, r * 2)
      ctx.restore()
    }
  }
  // labels: `211 · 800`, first free spot of four around the jet so neighbours never stack
  const la = f.b.airLabel
  if (la > 0.01 && shown.length) {
    ctx.font = `${LABEL_FONT_PX}px ${T.fontMono}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    ctx.globalAlpha = la
    const ink = cssVar('--hud-ink')
    const halo = cssVar('--hud-halo')
    const taken: Box[] = shown.map(({ p, half }) => ({ x0: p.x - half, y0: p.y - half, x1: p.x + half, y1: p.y + half }))
    for (const { j, p, half } of shown) {
      const text = `${j.modex} · ${Math.round(j.alt / 10) * 10}`
      const w = ctx.measureText(text).width
      const h = LABEL_FONT_PX + 2
      const g = half + 4
      const cands: Vec2[] = [
        { x: p.x + g, y: p.y + g * 0.3 }, { x: p.x + g, y: p.y - g * 0.3 - h },
        { x: p.x - g - w, y: p.y + g * 0.3 }, { x: p.x - g - w, y: p.y - g * 0.3 - h },
      ]
      let pick = cands[0]!
      for (const c of cands) {
        const b = { x0: c.x - 1, y0: c.y, x1: c.x + w + 1, y1: c.y + h }
        if (!taken.some(t => overlaps(t, b)) && !boxInCircle(b, iris)) {
          pick = c
          break
        }
      }
      taken.push({ x0: pick.x - 1, y0: pick.y, x1: pick.x + w + 1, y1: pick.y + h })
      ctx.strokeStyle = halo
      ctx.strokeText(text, pick.x, pick.y + h / 2)
      ctx.fillStyle = ink
      ctx.fillText(text, pick.x, pick.y + h / 2)
    }
  }
  ctx.restore()
}

export function hitAirborne(f: Frame, air: AirJet[], screen: Vec2): string | null {
  if (!f.b.world) return null
  // the iris owns everything inside it (hitScope); main.ts tries that next
  const z = f.cam.zoom
  let best: string | null = null
  let bestD = Infinity
  for (const j of air) {
    const p = f.cam.worldToScreen(j.world)
    const d = Math.hypot(p.x - screen.x, p.y - screen.y)
    const r = Math.max(10, (SILHOUETTES[j.type].length * z * minScale(j.type, z)) / 2 + 3)
    if (d <= r && d < bestD) {
      best = j.id
      bestD = d
    }
  }
  if (best && f.b.scope > 0) {
    // a jet under the iris is the scope's, not ours
    const iris = irisGeometry(f)
    const p = f.cam.worldToScreen(air.find(a => a.id === best)!.world)
    if (Math.hypot(p.x - iris.x, p.y - iris.y) < iris.r) return null
  }
  return best
}

/** For follow mode: the jet's pattern position in world ft while it is in the pattern. */
export function airbornePosition(f: Frame, id: string): Vec2 | null {
  return patternWorldAt(entries(f.tl).get(id)?.p ?? null, f.t)?.w ?? null
}

// ---------------------------------------------------------------- small shared helpers

export interface Box { x0: number; y0: number; x1: number; y1: number }
export function overlaps(a: Box, b: Box): boolean {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0
}
/** True when the box touches the iris disc. */
function boxInCircle(b: Box, iris: Iris): boolean {
  if (iris.r <= 0) return false
  const x = Math.min(b.x1, Math.max(b.x0, iris.x)), y = Math.min(b.y1, Math.max(b.y0, iris.y))
  return (x - iris.x) ** 2 + (y - iris.y) ** 2 < iris.r * iris.r
}
function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v))
}
