// STUB: lane F fills this in
// drawCatTags keeps today's plain `cat N` labels (deck.ts skips them with skipCats) so nothing regresses meanwhile.
import type { Frame } from './frame'
import type { DeckGeometry } from '../data/deckTypes'
import { tokens } from './tokens'

/** Replaces "cat N" labels at the same anchor while b.labels > 0. */
export function drawCatTags(f: Frame, g: DeckGeometry): void {
  const { ctx, cam, b } = f
  if (b.labels <= 0) return
  const T = tokens()
  ctx.save()
  ctx.font = `${Math.max(10, Math.min(13, 9 + cam.zoom * 2))}px ${T.fontMono}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = T.markWhite
  ctx.strokeStyle = T.deckEdge
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.globalAlpha = b.labels
  for (const c of g.catapults) {
    const p = cam.worldToScreen({ x: (c.start.x + c.end.x) / 2, y: (c.start.y + c.end.y) / 2 - 10 })
    ctx.strokeText(`cat ${c.id}`, p.x, p.y)
    ctx.fillText(`cat ${c.id}`, p.x, p.y)
  }
  ctx.restore()
}

/** BOLTER / WAVE OFF beside the jet for 4 s, z > 0.2. */
export function drawCallouts(_f: Frame): void {}

/**
 * anchor (set by main.ts): screen CSS px of the bar's right end (x) and its bottom edge (y). It already sits above the
 * transport bar (or the phone sheet) and left of the side panel; draw the bar and its labels up and to the left of it.
 */
export function drawScaleBar(_f: Frame, _anchor: { right: number; bottom: number }): void {}
