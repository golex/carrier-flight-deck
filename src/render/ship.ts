import type { Frame } from './frame'
import { radarAzimuth, withAlpha } from './frame'
import type { DeckGeometry } from '../data/deckTypes'
import type { Vec2 } from '../sim/types'
import { cssVar, tokens } from './tokens'
import { shadowOffset, withWorld } from './world'
import { glowSprite } from './sprites'
import {
  ANTENNAS, BEACONS, ISLAND_HEIGHT_FT, ISLAND_LEVELS, ISLAND_MAST, PRIFLY_GLASS, SPONSON_MOUNTS, SPONSONS,
} from '../data/shipDetail'

/** catwalk band width outboard of the deck edge, ft */
const CATWALK_FT = 12
/** grating hairline spacing along each edge, ft */
const GRATE_STEP = 3

// ---- cached world-space paths (the geometry is static) ---------------------------------------------------------

export function polyPath(pts: readonly Vec2[], into = new Path2D()): Path2D {
  pts.forEach((p, i) => (i === 0 ? into.moveTo(p.x, p.y) : into.lineTo(p.x, p.y)))
  into.closePath()
  return into
}

const pathCache = new WeakMap<object, Path2D>()
function cached(key: object, build: () => Path2D): Path2D {
  let p = pathCache.get(key)
  if (!p) {
    p = build()
    pathCache.set(key, p)
  }
  return p
}

/**
 * The outline pushed d ft outboard (miter joins). The orientation comes from the signed area, so the concave
 * notches (the angled-deck sponson corners) offset correctly.
 */
function outsetPolygon(pts: readonly Vec2[], d: number): Vec2[] {
  const n = pts.length
  let area2 = 0
  for (let i = 0; i < n; i++) {
    const a = pts[i]!
    const b = pts[(i + 1) % n]!
    area2 += a.x * b.y - b.x * a.y
  }
  // area2 > 0: clockwise on screen (y down), so the outward normal of edge a->b is (dy, -dx)/len
  const sgn = area2 > 0 ? 1 : -1
  const lines = pts.map((a, i) => {
    const b = pts[(i + 1) % n]!
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    return { p: { x: a.x + (sgn * dy * d) / len, y: a.y - (sgn * dx * d) / len }, d: { x: dx, y: dy } }
  })
  return lines.map((L1, i) => {
    const L0 = lines[(i + n - 1) % n]!
    const den = L0.d.x * L1.d.y - L0.d.y * L1.d.x
    if (Math.abs(den) < 1e-9) return L1.p
    const s = ((L1.p.x - L0.p.x) * L1.d.y - (L1.p.y - L0.p.y) * L1.d.x) / den
    return { x: L0.p.x + L0.d.x * s, y: L0.p.y + L0.d.y * s }
  })
}

/**
 * Deck status as the beacons and the scope show it. The planner leaves eq.deck 'red' through the launch, but the
 * Air Boss clears launching with a green beacon (Pri-Fly "Launch aircraft." at first shot - 120, and each shooter's
 * "Two minutes. Beacon green." at S - 120), so a red deck reads green from that cue until the last shot.
 */
export function deckStatusAt(f: Pick<Frame, 'eq' | 'fxi' | 't'>): 'red' | 'green' | 'foul' {
  const { eq, fxi, t } = f
  if (eq.deck !== 'red' || fxi.shots.length === 0) return eq.deck
  const first = fxi.shots[0]!.t
  const last = fxi.shots[fxi.shots.length - 1]!.t
  return t >= first - 120 && t <= last ? 'green' : 'red'
}

/** Perpendicular hairlines every 3 ft from each outline edge out to the catwalk's outer edge. */
function gratingPath(outline: readonly Vec2[]): Path2D {
  const p = new Path2D()
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i]!
    const b = outline[(i + 1) % outline.length]!
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    if (len < 1) continue
    // the outline runs clockwise on screen (y down), so the outward normal is (dy, -dx)
    const nx = dy / len
    const ny = -dx / len
    const n = Math.floor(len / GRATE_STEP)
    for (let k = 1; k < n; k++) {
      const u = (k * GRATE_STEP) / len
      const x = a.x + dx * u
      const y = a.y + dy * u
      p.moveTo(x, y)
      p.lineTo(x + nx * CATWALK_FT, y + ny * CATWALK_FT)
    }
  }
  return p
}

/** Andrew's monotone chain. */
function convexHull(points: readonly Vec2[]): Vec2[] {
  const pts = points.slice().sort((p, q) => p.x - q.x || p.y - q.y)
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const lower: Vec2[] = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper: Vec2[] = []
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) upper.pop()
    upper.push(p)
  }
  upper.pop()
  lower.pop()
  return lower.concat(upper)
}

// ---- tinted glow (glowSprite is white; the beacons need colour) -------------------------------------------------

const tintCache = new Map<string, { src: HTMLCanvasElement; c: HTMLCanvasElement }>()
function tintedGlow(color: string): HTMLCanvasElement {
  const src = glowSprite()
  const hit = tintCache.get(color)
  if (hit && hit.src === src) return hit.c
  const c = document.createElement('canvas')
  c.width = src.width
  c.height = src.height
  const g = c.getContext('2d')!
  g.drawImage(src, 0, 0)
  g.globalCompositeOperation = 'source-in'
  g.fillStyle = color
  g.fillRect(0, 0, c.width, c.height)
  tintCache.set(color, { src, c })
  return c
}

// ---- 6: under the deck -------------------------------------------------------------------------------------------

/** Sponsons, catwalk band, net line, grating (plat band). */
export function drawShipUnder(f: Frame, g: DeckGeometry): void {
  const { ctx, cam, dpr, b } = f
  const z = cam.zoom
  const T = tokens()
  // catwalk: a filled polygon 12 ft outboard of the deck edge (the deck fill covers the inboard part); one fill
  // and one hairline instead of two 24 ft round-joined world strokes, which made the frame raster bound at z >= 2.4
  const outer = cached(g.outline, () => polyPath(outsetPolygon(g.outline, CATWALK_FT)))
  const sponsons = cached(SPONSONS, () => {
    const p = new Path2D()
    for (const s of SPONSONS) polyPath(s, p)
    return p
  })
  withWorld(ctx, cam, dpr, () => {
    ctx.fillStyle = cssVar('--catwalk')
    ctx.fill(outer)
    ctx.lineJoin = 'miter'
    ctx.strokeStyle = cssVar('--net')
    ctx.lineWidth = 1 / z
    ctx.stroke(outer)

    if (b.plat > 0) {
      const grate = cached(gratingPath, () => gratingPath(g.outline))
      ctx.globalAlpha = b.plat
      ctx.strokeStyle = cssVar('--catwalk-grate')
      ctx.lineWidth = 0.5 / z
      ctx.stroke(grate)
      ctx.globalAlpha = 1
    }
    // sponsons over the catwalk band: gun and missile platforms standing out past the deck edge
    ctx.lineJoin = 'miter'
    ctx.fillStyle = cssVar('--sponson')
    ctx.fill(sponsons)
    ctx.strokeStyle = T.deckEdge
    ctx.lineWidth = 0.6 / z
    ctx.stroke(sponsons)
    if (z >= 2.5) {
      ctx.fillStyle = T.island
      ctx.beginPath()
      for (const m of SPONSON_MOUNTS) {
        ctx.moveTo(m.x + 3, m.y)
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2)
      }
      ctx.fill()
      ctx.stroke()
    }
  })
}

// ---- 10: the island ----------------------------------------------------------------------------------------------

/** Island shadow on deck, footprint, levels, mast, Pri-Fly glass, antennas, beacons. */
export function drawIsland(f: Frame, g: DeckGeometry): void {
  const { ctx, cam, dpr, b, t } = f
  const z = cam.zoom
  const T = tokens()
  const foot = g.island.polygon
  const shadow = cached(foot, () => {
    const o = shadowOffset(ISLAND_HEIGHT_FT)
    return polyPath(convexHull(foot.concat(foot.map(p => ({ x: p.x + o.x, y: p.y + o.y })))))
  })
  const footPath = cached(g.island, () => polyPath(foot))
  const l2 = cached(ISLAND_LEVELS[0]!, () => polyPath(ISLAND_LEVELS[0]!))
  const l3 = cached(ISLAND_LEVELS[1]!, () => polyPath(ISLAND_LEVELS[1]!))
  const mast = cached(ISLAND_MAST, () => polyPath(ISLAND_MAST))

  withWorld(ctx, cam, dpr, () => {
    ctx.fillStyle = cssVar('--shadow-ship')
    ctx.fill(shadow)

    ctx.strokeStyle = T.deckEdge
    ctx.lineWidth = 0.6 / z
    ctx.lineJoin = 'miter'
    ctx.fillStyle = T.island2
    ctx.fill(footPath)
    ctx.stroke(footPath)
    ctx.fillStyle = cssVar('--island-3')
    ctx.fill(l2)
    ctx.stroke(l2)
    ctx.fillStyle = cssVar('--island-4')
    ctx.fill(l3)
    ctx.stroke(l3)
    ctx.fillStyle = T.island
    ctx.fill(mast)
    ctx.stroke(mast)

    // Pri-Fly: the glass on L3's port face
    const [g0, g1] = PRIFLY_GLASS
    ctx.strokeStyle = T.canopy
    ctx.lineWidth = 2 / z
    ctx.lineCap = 'butt'
    ctx.beginPath()
    ctx.moveTo(g0.x, g0.y)
    ctx.lineTo(g1.x, g1.y)
    ctx.stroke()

    // antennas: bars turning on the wall clock (cosmetic); the SPS-49 shares the scope's sweep function
    if (z >= 1.2) {
      ctx.strokeStyle = T.deckEdge
      ctx.lineCap = 'round'
      ctx.lineWidth = 1.6
      for (const a of ANTENNAS) {
        const az = radarAzimuth(f.nowMs, a.rpm, f.reduced)
        const hx = (Math.cos(az) * a.len) / 2
        const hy = (Math.sin(az) * a.len) / 2
        ctx.beginPath()
        ctx.moveTo(a.at.x - hx, a.at.y - hy)
        ctx.lineTo(a.at.x + hx, a.at.y + hy)
        ctx.stroke()
      }
      ctx.fillStyle = T.island
      ctx.beginPath()
      for (const a of ANTENNAS) {
        ctx.moveTo(a.at.x + 1.4, a.at.y)
        ctx.arc(a.at.x, a.at.y, 1.4, 0, Math.PI * 2)
      }
      ctx.fill()
      ctx.lineCap = 'butt'
    }

    // beacons, fore and aft, show the deck status. Foul flashes at 1 Hz on sim time (steady under reduced motion)
    if (b.detail > 0) {
      const deck = deckStatusAt(f)
      const color = deck === 'green' ? cssVar('--beacon-green') : cssVar('--beacon-red')
      const lit = deck !== 'foul' || f.reduced || Math.floor(t * 2) % 2 === 0
      ctx.globalAlpha = b.detail
      if (lit) {
        const glow = tintedGlow(color)
        ctx.globalCompositeOperation = 'lighter'
        for (const p of BEACONS) ctx.drawImage(glow, p.x - 7, p.y - 7, 14, 14)
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = color
      } else {
        ctx.fillStyle = withAlpha(color, 0.3)
      }
      // a 2.5 ft dot, never under 1.5 px across
      const r = Math.max(1.25, 0.75 / z)
      ctx.beginPath()
      for (const p of BEACONS) {
        ctx.moveTo(p.x + r, p.y)
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      }
      ctx.fill()
      ctx.globalAlpha = 1
    }
  })
}
