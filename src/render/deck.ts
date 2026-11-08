import type { Camera } from './camera'
import type { DeckGeometry } from '../data/deckTypes'
import type { EquipmentKeyframe, Vec2 } from '../sim/types'
import { tokens } from './tokens'

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

/**
 * Draws the static deck plus equipment state (JBDs, shuttles, wires).
 * Everything is derived from DeckGeometry so the numbers live in one place.
 */
export function drawDeck(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  g: DeckGeometry,
  eq: EquipmentKeyframe,
  showLabels: boolean,
): void {
  const z = cam.zoom
  const T = tokens()

  // hull shadow below the deck
  ctx.fillStyle = T.deckEdge
  polygon(ctx, cam, g.hull)
  ctx.fill()

  // deck surface
  ctx.fillStyle = T.deck
  polygon(ctx, cam, g.outline)
  ctx.fill()
  ctx.strokeStyle = T.deckEdge
  ctx.lineWidth = Math.max(1, 1.5 * z)
  ctx.stroke()

  // elevators
  ctx.fillStyle = T.deck2
  ctx.strokeStyle = T.markWhite
  ctx.lineWidth = Math.max(0.5, 0.6 * z)
  for (const el of g.elevators) {
    polygon(ctx, cam, el.polygon)
    ctx.fill()
    ctx.stroke()
  }

  // landing area outline + centreline
  ctx.strokeStyle = T.markWhite
  ctx.lineWidth = Math.max(0.75, 1.2 * z)
  polygon(ctx, cam, g.landingArea.polygon)
  ctx.stroke()
  ctx.setLineDash([12 * z, 8 * z])
  ctx.lineWidth = Math.max(0.75, 1.5 * z)
  const [c0, c1] = g.landingArea.centreline
  segment(ctx, cam, c0, c1)
  ctx.stroke()
  ctx.setLineDash([])

  // foul lines (red/white) — drawn as thin red lines
  ctx.strokeStyle = eq.deck === 'foul' ? T.markRed : T.markRed
  ctx.lineWidth = Math.max(0.75, 1 * z)
  ctx.globalAlpha = 0.9
  for (const [a, b] of g.landingArea.foulLines) {
    segment(ctx, cam, a, b)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // catapult tracks
  for (const cat of g.catapults) {
    const idx = cat.id - 1
    // track slot
    ctx.strokeStyle = T.deckEdge
    ctx.lineWidth = Math.max(1, 1.6 * z)
    segment(ctx, cam, cat.start, cat.end)
    ctx.stroke()
    ctx.strokeStyle = T.markWhite
    ctx.lineWidth = Math.max(0.5, 0.5 * z)
    ctx.setLineDash([6 * z, 6 * z])
    segment(ctx, cam, cat.start, cat.end)
    ctx.stroke()
    ctx.setLineDash([])

    // JBD panel: raised state tints it
    const raised = eq.jbd[idx] ?? 0
    ctx.fillStyle = raised > 0.05 ? T.markYellow : T.deck2
    ctx.globalAlpha = raised > 0.05 ? 0.35 + 0.5 * raised : 1
    polygon(ctx, cam, cat.jbd)
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = T.markWhite
    ctx.lineWidth = Math.max(0.5, 0.6 * z)
    polygon(ctx, cam, cat.jbd)
    ctx.stroke()

    // shuttle
    const sh = eq.shuttle[idx] ?? 0
    const sp = { x: cat.start.x + (cat.end.x - cat.start.x) * sh, y: cat.start.y + (cat.end.y - cat.start.y) * sh }
    const ss = cam.worldToScreen(sp)
    ctx.fillStyle = T.markWhite
    ctx.beginPath()
    ctx.arc(ss.x, ss.y, Math.max(1.5, 1.4 * z), 0, Math.PI * 2)
    ctx.fill()

    // ICCS bubble
    const ic = cam.worldToScreen(cat.iccs)
    ctx.fillStyle = T.island2
    ctx.beginPath()
    ctx.arc(ic.x, ic.y, Math.max(1.5, 2.5 * z), 0, Math.PI * 2)
    ctx.fill()
  }

  // arresting wires: drawn as lines across the landing area; a "run out" wire bows forward
  for (const w of g.wires) {
    const run = eq.wire[w.n - 1] ?? 0
    const a = cam.worldToScreen(w.a)
    const b = cam.worldToScreen(w.b)
    ctx.strokeStyle = T.markWhite
    ctx.lineWidth = Math.max(0.75, 0.9 * z)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    if (run > 0.01) {
      // the wire deflects forward along the landing centreline direction
      const dir = g.landingArea.angleDeg * (Math.PI / 180)
      const dx = Math.cos(dir) * 320 * run * z
      const dy = Math.sin(dir) * 320 * run * z
      ctx.quadraticCurveTo((a.x + b.x) / 2 + dx, (a.y + b.y) / 2 + dy, b.x, b.y)
    } else {
      ctx.lineTo(b.x, b.y)
    }
    ctx.stroke()
  }

  // island
  ctx.fillStyle = T.island
  polygon(ctx, cam, g.island.polygon)
  ctx.fill()
  ctx.strokeStyle = T.deckEdge
  ctx.lineWidth = Math.max(0.75, 1 * z)
  ctx.stroke()
  if (z > 1.2) {
    // Pri-Fly footprint
    const pf = cam.worldToScreen(g.island.priFly)
    ctx.fillStyle = T.island2
    ctx.fillRect(pf.x - 6 * z, pf.y - 5 * z, 12 * z, 10 * z)
  }

  // LSO platform
  ctx.fillStyle = T.deck2
  polygon(ctx, cam, g.lsoPlatform.polygon)
  ctx.fill()
  ctx.strokeStyle = T.markWhite
  ctx.lineWidth = Math.max(0.5, 0.6 * z)
  ctx.stroke()

  // IFLOLS (Fresnel lens) as a small marker
  const fl = cam.worldToScreen(g.iflols)
  ctx.fillStyle = T.markYellow
  ctx.beginPath()
  ctx.arc(fl.x, fl.y, Math.max(1.5, 2 * z), 0, Math.PI * 2)
  ctx.fill()

  if (showLabels) drawLabels(ctx, cam, g)
}

function drawLabels(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry): void {
  const z = cam.zoom
  const T = tokens()
  if (z < 0.55) return
  ctx.font = `${Math.max(10, Math.min(13, 9 + z * 2))}px ${T.fontMono}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = T.markWhite
  ctx.globalAlpha = Math.min(1, (z - 0.5) * 2)
  for (const cat in g.catapults) {
    const c = g.catapults[cat]!
    const p = cam.worldToScreen({ x: (c.start.x + c.end.x) / 2, y: (c.start.y + c.end.y) / 2 - 10 })
    ctx.fillText(`cat ${c.id}`, p.x, p.y)
  }
  for (const el of g.elevators) {
    const cx = el.polygon.reduce((s, p) => s + p.x, 0) / el.polygon.length
    const cy = el.polygon.reduce((s, p) => s + p.y, 0) / el.polygon.length
    const p = cam.worldToScreen({ x: cx, y: cy })
    ctx.fillText(`el ${el.id}`, p.x, p.y)
  }
  if (z > 0.9) {
    ctx.globalAlpha = Math.min(0.8, (z - 0.9) * 1.5)
    for (const a of g.areas) {
      const p = cam.worldToScreen(a.label)
      ctx.fillText(a.name, p.x, p.y)
    }
    for (const w of g.wires) {
      const p = cam.worldToScreen({ x: w.a.x, y: w.a.y })
      ctx.fillText(String(w.n), p.x, p.y + 8)
    }
  }
  ctx.globalAlpha = 1
}
