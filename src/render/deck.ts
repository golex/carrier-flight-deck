import type { Camera } from './camera'
import type { DeckGeometry } from '../data/deckTypes'
import type { Vec2 } from '../sim/types'
import { cssVar, tokens } from './tokens'
import type { Frame } from './frame'
import { jbdGeometry, withWorld } from './world'
import { hatchPattern } from './sprites'
import { laPoint } from '../data/deck'
import { SILHOUETTES } from '../data/silhouettes'
import { sampleEquipment } from '../sim/sample'
import { inWindow } from './fxIndex'

/** Draw a closed polygon in world coordinates. Caller sets fill/stroke. */
export function polygon(ctx: CanvasRenderingContext2D, cam: Camera, pts: readonly Vec2[]): void {
  ctx.beginPath()
  pts.forEach((p, i) => {
    const s = cam.worldToScreen(p)
    if (i === 0) ctx.moveTo(s.x, s.y)
    else ctx.lineTo(s.x, s.y)
  })
  ctx.closePath()
}

export function segment(ctx: CanvasRenderingContext2D, cam: Camera, a: Vec2, b: Vec2): void {
  const sa = cam.worldToScreen(a)
  const sb = cam.worldToScreen(b)
  ctx.beginPath()
  ctx.moveTo(sa.x, sa.y)
  ctx.lineTo(sb.x, sb.y)
}

// ---- static geometry helpers (world ft) --------------------------------------------------------------------------

/** Path in world ft (used under withWorld). */
function wpoly(ctx: CanvasRenderingContext2D, pts: readonly Vec2[]): void {
  ctx.beginPath()
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.closePath()
}

function wseg(ctx: CanvasRenderingContext2D, a: Vec2, b: Vec2): void {
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
}

function centroid(pts: readonly Vec2[]): Vec2 {
  return { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length }
}

function inside(p: Vec2, poly: readonly Vec2[]): boolean {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!
    const b = poly[j]!
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c
  }
  return c
}

/** Inward unit normal of edge a->b of a convex polygon with centroid c. */
function inwardNormal(a: Vec2, b: Vec2, c: Vec2): Vec2 {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  let nx = dy / len
  let ny = -dx / len
  if (nx * (c.x - (a.x + b.x) / 2) + ny * (c.y - (a.y + b.y) / 2) < 0) {
    nx = -nx
    ny = -ny
  }
  return { x: nx, y: ny }
}

/** A convex polygon shrunk by d ft (offset edges, re-intersected). */
function insetPolygon(pts: readonly Vec2[], d: number): Vec2[] {
  const c = centroid(pts)
  const n = pts.length
  const lines = pts.map((a, i) => {
    const b = pts[(i + 1) % n]!
    const nn = inwardNormal(a, b, c)
    return { p: { x: a.x + nn.x * d, y: a.y + nn.y * d }, d: { x: b.x - a.x, y: b.y - a.y } }
  })
  return lines.map((L1, i) => {
    const L0 = lines[(i + n - 1) % n]!
    // L0.p + s L0.d = L1.p + u L1.d
    const den = L0.d.x * L1.d.y - L0.d.y * L1.d.x
    if (Math.abs(den) < 1e-9) return L1.p
    const s = ((L1.p.x - L0.p.x) * L1.d.y - (L1.p.y - L0.p.y) * L1.d.x) / den
    return { x: L0.p.x + L0.d.x * s, y: L0.p.y + L0.d.y * s }
  })
}

interface DeckStatic {
  /** elevator edges that lie inside the deck (the gaps round the platform), with their outward normal */
  elevatorGaps: { a: Vec2; b: Vec2; n: Vec2 }[]
  /** elevator hazard perimeters, inset 1 ft */
  elevatorInset: Vec2[][]
  /** 12 ft painted blast bands aft of each JBD, by catapult index */
  blastBands: Vec2[][]
  /** LA ladder rungs */
  rungs: [Vec2, Vec2][]
  /** unit vector forward along the landing centreline */
  laF: Vec2
}

const statics = new WeakMap<DeckGeometry, DeckStatic>()
function deckStatic(g: DeckGeometry): DeckStatic {
  let s = statics.get(g)
  if (s) return s
  const elevatorGaps: DeckStatic['elevatorGaps'] = []
  for (const el of g.elevators) {
    const c = centroid(el.polygon)
    el.polygon.forEach((a, i) => {
      const b = el.polygon[(i + 1) % el.polygon.length]!
      const n = inwardNormal(a, b, c)
      const probe = { x: (a.x + b.x) / 2 - n.x * 3, y: (a.y + b.y) / 2 - n.y * 3 }
      if (inside(probe, g.outline)) elevatorGaps.push({ a, b, n: { x: -n.x, y: -n.y } })
    })
  }
  const blastBands = g.catapults.map(cat => {
    const [h0, , a1, a0] = cat.jbd as [Vec2, Vec2, Vec2, Vec2]
    const dx = a0.x - h0.x
    const dy = a0.y - h0.y
    const len = Math.hypot(dx, dy) || 1
    const ox = (dx / len) * 12
    const oy = (dy / len) * 12
    return [a0, a1, { x: a1.x + ox, y: a1.y + oy }, { x: a0.x + ox, y: a0.y + oy }]
  })
  const rungs: [Vec2, Vec2][] = []
  for (let k = 0; k * 50 <= 796; k++) {
    for (const side of [1, -1]) rungs.push([laPoint(k * 50, side * 32.5), laPoint(k * 50, side * 42.5)])
  }
  const a = g.landingArea.angleDeg * (Math.PI / 180)
  s = {
    elevatorGaps,
    elevatorInset: g.elevators.map(el => insetPolygon(el.polygon, 1)),
    blastBands,
    rungs,
    laF: { x: Math.cos(a), y: Math.sin(a) },
  }
  statics.set(g, s)
  return s
}

const hatchCache = new Map<string, CanvasPattern>()
function blastPaint(ctx: CanvasRenderingContext2D): CanvasPattern {
  const color = cssVar('--blast-paint')
  let p = hatchCache.get(color)
  if (!p) {
    p = hatchPattern(ctx, color)
    hatchCache.set(color, p)
  }
  return p
}

/** The trap jet's hook point for a running wire, or null when no jet is pulling it (retract keeps the curve). */
function hookFor(f: Frame, wireCentre: Vec2, laF: Vec2): Vec2 | null {
  let best: Vec2 | null = null
  let bestD = Infinity
  for (const { a, s } of f.jets) {
    if (!s || s.status !== 'trap' || !s.visible) continue
    const along = (s.x - wireCentre.x) * laF.x + (s.y - wireCentre.y) * laF.y
    if (along < 0 || along > 400) continue
    const h = (s.heading * Math.PI) / 180
    const back = SILHOUETTES[a.type].length / 2 - 2
    const hook = { x: s.x - Math.cos(h) * back, y: s.y - Math.sin(h) * back }
    if (along < bestD) {
      bestD = along
      best = hook
    }
  }
  return best
}

/**
 * Draws the static deck plus equipment state (JBDs, shuttles, wires). The catwalk, hull and sponsons are in
 * ship.ts drawShipUnder (drawn before this); the island is ship.ts drawIsland (drawn after the deck fx).
 */
export function drawDeck(f: Frame, g: DeckGeometry): void {
  const { ctx, cam, dpr, eq, b } = f
  const z = cam.zoom
  const T = tokens()
  const S = deckStatic(g)
  /** a line width of k ft that never drops under minPx on screen */
  const lw = (minPx: number, ft: number) => Math.max(minPx / z, ft)

  withWorld(ctx, cam, dpr, () => {
    // deck surface
    ctx.fillStyle = T.deck
    wpoly(ctx, g.outline)
    ctx.fill()
    ctx.strokeStyle = T.deckEdge
    ctx.lineWidth = lw(1, 1.5)
    ctx.stroke()

    // wear band: the touchdown zone along the LA centreline, s = 150..420
    ctx.strokeStyle = cssVar('--deck-wear')
    ctx.lineCap = 'round'
    ctx.globalAlpha = 0.35
    const w0 = laPoint(150)
    const w1 = laPoint(420)
    for (const w of [30, 22, 14]) {
      ctx.lineWidth = w
      wseg(ctx, w0, w1)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.lineCap = 'butt'

    // elevators: platform, white edge, the dark hinge gap on the inboard edges
    ctx.fillStyle = T.deck2
    ctx.strokeStyle = T.markWhite
    ctx.lineWidth = lw(0.5, 0.6)
    for (const el of g.elevators) {
      wpoly(ctx, el.polygon)
      ctx.fill()
      ctx.stroke()
    }
    // the gap sits just outboard of the white edge stroke so both stay visible
    ctx.strokeStyle = cssVar('--elevator-gap')
    ctx.lineWidth = 1.5 / z
    const gapOff = lw(0.5, 0.6) / 2 + 0.75 / z
    ctx.beginPath()
    for (const { a, b: c, n } of S.elevatorGaps) {
      ctx.moveTo(a.x + n.x * gapOff, a.y + n.y * gapOff)
      ctx.lineTo(c.x + n.x * gapOff, c.y + n.y * gapOff)
    }
    ctx.stroke()
    if (z >= 2) {
      // hazard perimeter: alternating red / yellow 5 ft dashes, inset 1 ft
      ctx.lineWidth = 1.2 / z
      for (const poly of S.elevatorInset) {
        wpoly(ctx, poly)
        ctx.setLineDash([5, 5])
        ctx.strokeStyle = T.markYellow
        ctx.lineDashOffset = 0
        ctx.stroke()
        ctx.strokeStyle = T.markRed
        ctx.lineDashOffset = 5
        ctx.stroke()
      }
      ctx.setLineDash([])
      ctx.lineDashOffset = 0
    }

    // landing area outline + centreline
    ctx.strokeStyle = T.markWhite
    ctx.lineWidth = lw(0.75, 1.2)
    wpoly(ctx, g.landingArea.polygon)
    ctx.stroke()
    ctx.setLineDash([12, 8])
    ctx.lineWidth = lw(0.75, 1.5)
    const [c0, c1] = g.landingArea.centreline
    wseg(ctx, c0, c1)
    ctx.stroke()
    ctx.setLineDash([])

    // ladder rungs either side of the centreline
    if (z >= 0.7) {
      ctx.globalAlpha = 0.5
      ctx.lineWidth = lw(0.75, 1)
      ctx.beginPath()
      for (const [a, c] of S.rungs) {
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(c.x, c.y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // foul lines: red / white 8 ft dashes
    ctx.lineWidth = lw(0.75, 1)
    ctx.beginPath()
    for (const [a, c] of g.landingArea.foulLines) {
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(c.x, c.y)
    }
    ctx.setLineDash([8, 8])
    ctx.strokeStyle = T.markRed
    ctx.stroke()
    ctx.lineDashOffset = 8
    ctx.strokeStyle = T.markWhite
    ctx.stroke()
    ctx.setLineDash([])
    ctx.lineDashOffset = 0

    // catapult tracks, JBDs, shuttles, ICCS
    for (const cat of g.catapults) {
      const idx = cat.id - 1
      ctx.strokeStyle = T.deckEdge
      ctx.lineWidth = lw(1, 1.6)
      wseg(ctx, cat.start, cat.end)
      ctx.stroke()
      ctx.strokeStyle = T.markWhite
      ctx.lineWidth = lw(0.5, 0.5)
      ctx.setLineDash([6, 6])
      wseg(ctx, cat.start, cat.end)
      ctx.stroke()
      ctx.setLineDash([])

      const raise = eq.jbd[idx] ?? 0
      if (raise <= 0.05) {
        // lowered: flush with the deck
        ctx.fillStyle = T.deck2
        wpoly(ctx, cat.jbd)
        ctx.fill()
        ctx.strokeStyle = T.markWhite
        ctx.lineWidth = lw(0.5, 0.6)
        ctx.stroke()
      } else {
        // raised: shadow, the panel seen from above as a dark bar, and a yellow lip on its top edge
        const j = jbdGeometry(cat, raise)
        ctx.fillStyle = cssVar('--shadow-deck')
        wpoly(ctx, j.shadow)
        ctx.fill()
        ctx.fillStyle = cssVar('--jbd-bar')
        wpoly(ctx, j.footprint)
        ctx.fill()
        ctx.strokeStyle = T.markYellow
        ctx.globalAlpha = 0.8
        ctx.lineWidth = 1 / z
        wseg(ctx, j.top[0], j.top[1])
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // during a stroke the shuttle accelerates with the jet (constant acceleration over 2 s, as the jet's 'in'
      // ease and fx.ts's streak); eq.shuttle ramps linearly, which put the dot well ahead of the nose gear
      const stroke = inWindow(f.fxi.shots, f.t - 2, f.t).find(x => x.cat === cat.id)
      const sh = stroke ? Math.min(1, ((f.t - stroke.t) / 2) ** 2) : (eq.shuttle[idx] ?? 0)
      const sx = cat.start.x + (cat.end.x - cat.start.x) * sh
      const sy = cat.start.y + (cat.end.y - cat.start.y) * sh
      ctx.fillStyle = T.markWhite
      ctx.beginPath()
      ctx.arc(sx, sy, Math.max(1.5 / z, 1.4), 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = T.island2
      ctx.beginPath()
      ctx.arc(cat.iccs.x, cat.iccs.y, Math.max(1.5 / z, 2.5), 0, Math.PI * 2)
      ctx.fill()
    }

    // arresting wires: a wire pulled out by a trapping jet runs straight from each sheave to the hook (a V);
    // a retracting wire keeps the forward bow
    const baseW = lw(0.75, 0.9)
    for (const w of g.wires) {
      const run = eq.wire[w.n - 1] ?? 0
      let hook: Vec2 | null = null
      if (run > 0.01) {
        const before = sampleEquipment(f.tl.equipment, f.t - 0.25).wire[w.n - 1] ?? 0
        if (before <= run) hook = hookFor(f, w.centre, S.laF)
      }
      ctx.beginPath()
      ctx.moveTo(w.a.x, w.a.y)
      if (hook) {
        ctx.lineTo(hook.x, hook.y)
        ctx.lineTo(w.b.x, w.b.y)
        ctx.strokeStyle = cssVar('--wire-hot')
        ctx.lineWidth = baseW * 1.6
        ctx.lineJoin = 'round'
      } else {
        if (run > 0.01) {
          const dx = S.laF.x * 320 * run
          const dy = S.laF.y * 320 * run
          ctx.quadraticCurveTo((w.a.x + w.b.x) / 2 + dx, (w.a.y + w.b.y) / 2 + dy, w.b.x, w.b.y)
        } else {
          ctx.lineTo(w.b.x, w.b.y)
        }
        ctx.strokeStyle = T.markWhite
        ctx.lineWidth = baseW
      }
      ctx.stroke()
      ctx.lineJoin = 'miter'
    }
    if (b.plat > 0) {
      // deck sheaves at both ends of every pendant
      ctx.globalAlpha = b.plat
      ctx.fillStyle = T.deckEdge
      ctx.strokeStyle = T.markWhite
      ctx.lineWidth = 0.6 / z
      for (const w of g.wires) {
        for (const p of [w.a, w.b]) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
    }

    // LSO platform
    ctx.fillStyle = T.deck2
    wpoly(ctx, g.lsoPlatform.polygon)
    ctx.fill()
    ctx.strokeStyle = T.markWhite
    ctx.lineWidth = lw(0.5, 0.6)
    ctx.stroke()

    // IFLOLS (Fresnel lens) as a small marker
    ctx.fillStyle = T.markYellow
    ctx.beginPath()
    ctx.arc(g.iflols.x, g.iflols.y, Math.max(1.5 / z, 2), 0, Math.PI * 2)
    ctx.fill()
  })

  // painted blast hatching aft of every JBD (research §9.4). In screen space so the 16 px tile stays crisp,
  // anchored to the world origin so it does not swim when the camera pans.
  if (z >= 0.6) {
    const pat = blastPaint(ctx)
    const o = cam.worldToScreen({ x: 0, y: 0 })
    pat.setTransform(new DOMMatrix().translate(((o.x % 16) + 16) % 16, ((o.y % 16) + 16) % 16))
    ctx.fillStyle = pat
    for (const band of S.blastBands) {
      polygon(ctx, cam, band)
      ctx.fill()
    }
  }
}

/** Deck names (cats, elevators, areas, wires, island). Drawn after the jets and crew, each with a dark halo. */
export function drawDeckLabels(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, opts?: { skipCats?: boolean }): void {
  const z = cam.zoom
  const T = tokens()
  if (z < 0.55) return
  ctx.font = `${Math.max(10, Math.min(13, 9 + z * 2))}px ${T.fontMono}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = T.markWhite
  ctx.strokeStyle = T.deckEdge
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  const label = (text: string, x: number, y: number) => {
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
  }
  ctx.globalAlpha = Math.min(1, (z - 0.5) * 2)
  for (const cat in g.catapults) {
    if (opts?.skipCats) break // hud.ts draws the cat tags at this anchor
    const c = g.catapults[cat]!
    const p = cam.worldToScreen({ x: (c.start.x + c.end.x) / 2, y: (c.start.y + c.end.y) / 2 - 10 })
    label(`cat ${c.id}`, p.x, p.y)
  }
  for (const el of g.elevators) {
    const cx = el.polygon.reduce((s, p) => s + p.x, 0) / el.polygon.length
    const cy = el.polygon.reduce((s, p) => s + p.y, 0) / el.polygon.length
    const p = cam.worldToScreen({ x: cx, y: cy })
    label(`el ${el.id}`, p.x, p.y)
  }
  // the island: dark text on the light block
  const isl = g.island.polygon
  const ip = cam.worldToScreen({ x: isl.reduce((s, p) => s + p.x, 0) / isl.length, y: isl.reduce((s, p) => s + p.y, 0) / isl.length })
  ctx.fillStyle = T.ink
  ctx.fillText('island', ip.x, ip.y)
  ctx.fillStyle = T.markWhite
  if (z > 0.9) {
    ctx.globalAlpha = Math.min(0.8, (z - 0.9) * 1.5)
    for (const a of g.areas) {
      const p = cam.worldToScreen(a.label)
      label(a.name, p.x, p.y)
    }
    for (const w of g.wires) {
      const p = cam.worldToScreen({ x: w.a.x, y: w.a.y })
      label(String(w.n), p.x, p.y + 8)
    }
  }
  ctx.globalAlpha = 1
}
