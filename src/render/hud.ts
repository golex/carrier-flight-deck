// Lane F: on-canvas HUD. Cat tags (replacing the plain "cat N" deck labels), BOLTER / WAVE OFF callouts, scale bar.
// Everything here is a pure function of the Frame (sim t, camera, fx index), so scrubbing is exact.
import type { Frame, CatId, CatStatus, CatWord } from './frame'
import { sstep } from './frame'
import type { DeckGeometry } from '../data/deckTypes'
import type { Vec2 } from '../sim/types'
import { tokens, cssVar } from './tokens'
import { catStatusAt, inWindow } from './fxIndex'
import { NM_FT, SHIP_MID_X } from './world'

/** Same size rule as the deck labels in deck.ts, so the tag sits exactly where "cat N" did. */
function labelPx(z: number): number {
  return Math.max(10, Math.min(13, 9 + z * 2))
}

/** A plain "SAFE" cat is only worth a word when it fires (or just fired) within this many seconds. */
const SAFE_WINDOW_S = 60

function countdownText(c: number | null): string {
  if (c === null || !(c > 0)) return ''
  const s = Math.ceil(c - 1e-6)
  return ` T-${s < 10 ? '0' : ''}${s}`
}

/** Replaces "cat N" labels at the same anchor while b.labels > 0. */
export function drawCatTags(f: Frame, g: DeckGeometry): void {
  const { ctx, cam, b } = f
  if (b.labels <= 0) return
  const T = tokens()
  const ink = cssVar('--hud-ink')
  const warn = cssVar('--hud-warn')
  ctx.save()
  ctx.font = `${labelPx(cam.zoom)}px ${T.fontMono}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = cssVar('--hud-halo')
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.globalAlpha = b.labels
  for (const c of g.catapults) {
    const p = cam.worldToScreen({ x: (c.start.x + c.end.x) / 2, y: (c.start.y + c.end.y) / 2 - 10 })
    const st: CatStatus = catStatusAt(f.fxi, f.jets, f.eq, f.t, c.id as CatId)
    const head = `cat ${c.id}`
    let word: CatWord | null = st.word
    if (word === 'SAFE' && !shotNear(f, c.id as CatId)) word = null
    const segs: { text: string; color: string }[] = [{ text: head, color: ink }]
    if (word) {
      const hot = word === 'TENSION' || word === 'FINAL'
      segs.push({ text: ' · ', color: ink })
      segs.push({ text: word + countdownText(st.countdown), color: hot ? warn : ink })
    }
    drawSegments(ctx, segs, p.x, p.y, 'center')
  }
  ctx.restore()
}

/** Is there a shot off this cat within SAFE_WINDOW_S of t (either side)? */
function shotNear(f: Frame, cat: CatId): boolean {
  for (const s of inWindow(f.fxi.shots, f.t - SAFE_WINDOW_S, f.t + SAFE_WINDOW_S)) if (s.cat === cat) return true
  return false
}

/** Halo every segment first, then fill, so one segment's halo never cuts into its neighbour's glyphs. */
function drawSegments(ctx: CanvasRenderingContext2D, segs: { text: string; color: string }[], x: number, y: number, align: 'center' | 'left'): void {
  const widths = segs.map(s => ctx.measureText(s.text).width)
  const total = widths.reduce((a, w) => a + w, 0)
  const x0 = Math.round(align === 'center' ? x - total / 2 : x)
  const yy = Math.round(y)
  let cx = x0
  for (let i = 0; i < segs.length; i++) {
    ctx.strokeText(segs[i]!.text, cx, yy)
    cx += widths[i]!
  }
  cx = x0
  for (let i = 0; i < segs.length; i++) {
    ctx.fillStyle = segs[i]!.color
    ctx.fillText(segs[i]!.text, cx, yy)
    cx += widths[i]!
  }
}

const CALLOUT_S = 4
const CALLOUT_FADE_S = 0.4
const CALLOUT_MARGIN = 10
const CALLOUT_ARROW = 14

/** BOLTER / WAVE OFF beside the jet for 4 s, z > 0.2. */
export function drawCallouts(f: Frame): void {
  const { ctx, cam, t } = f
  if (cam.zoom <= 0.2) return
  const items: { id: string; t: number; at: Vec2; word: string; color: string }[] = []
  for (const d of inWindow(f.fxi.touchdowns, t - CALLOUT_S, t)) {
    if (d.kind === 'bolter') items.push({ id: d.id, t: d.t, at: d, word: 'BOLTER', color: cssVar('--hud-warn') })
  }
  for (const w of inWindow(f.fxi.waveoffs, t - CALLOUT_S, t)) {
    items.push({ id: w.id, t: w.t, at: w, word: 'WAVE OFF', color: cssVar('--hud-alert') })
  }
  if (items.length === 0) return
  const T = tokens()
  const fontPx = 12
  const spacing = 0.1 * fontPx
  ctx.save()
  ctx.font = `${fontPx}px ${T.fontMono}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.strokeStyle = cssVar('--hud-halo')
  ctx.lineWidth = 3.5
  ctx.lineJoin = 'round'
  for (const it of items) {
    const js = f.jets.find(j => j.a.id === it.id)
    // follow the jet while the deck sampler still has it; otherwise stay at the trigger point
    const wp = js?.s && js.s.visible ? js.s : it.at
    const p = cam.worldToScreen(wp)
    const age = t - it.t
    ctx.globalAlpha = sstep(age, 0, 0.12) * (1 - sstep(age, CALLOUT_S - CALLOUT_FADE_S, CALLOUT_S))
    if (ctx.globalAlpha <= 0.001) continue
    const tw = spacedWidth(ctx, it.word, spacing)
    ctx.fillStyle = it.color
    const m = CALLOUT_MARGIN
    let x = p.x + 24
    let y = p.y - 24
    if (p.x < m || p.x > cam.w - m || p.y < m || p.y > cam.h - m) {
      // a wave-off is called while the jet is still out behind the ramp: keep the word on screen where the line
      // from the screen centre to the jet leaves the viewport, with an arrow pointing at the jet
      const ox = cam.w / 2, oy = cam.h / 2
      const dx = p.x - ox, dy = p.y - oy
      const k = Math.min(dx !== 0 ? (cam.w / 2 - m) / Math.abs(dx) : Infinity, dy !== 0 ? (cam.h / 2 - m - fontPx) / Math.abs(dy) : Infinity)
      const qx = ox + dx * k, qy = oy + dy * k
      const towardLeft = dx < 0
      ctx.save()
      ctx.translate(qx, qy)
      ctx.rotate(Math.atan2(dy, dx))
      ctx.beginPath()
      ctx.moveTo(4, 0); ctx.lineTo(-4, -4.5); ctx.lineTo(-4, 4.5); ctx.closePath()
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.fill()
      ctx.restore()
      x = towardLeft ? qx + CALLOUT_ARROW - 4 : qx - CALLOUT_ARROW + 4 - tw
      y = qy + fontPx * 0.36
    }
    x = Math.min(cam.w - m - tw, Math.max(m, x))
    y = Math.min(cam.h - m, Math.max(m + fontPx, y))
    spaced(ctx, it.word, Math.round(x), Math.round(y), spacing)
  }
  ctx.restore()
}

function spacedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number): number {
  let w = 0
  for (const ch of text) w += ctx.measureText(ch).width + spacing
  return w - spacing
}

/** Letter-spaced text drawn glyph by glyph (portable; no reliance on ctx.letterSpacing). Halo pass first. */
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number): void {
  const xs: number[] = []
  let cx = x
  for (const ch of text) {
    xs.push(cx)
    cx += ctx.measureText(ch).width + spacing
  }
  let i = 0
  for (const ch of text) ctx.strokeText(ch, xs[i++]!, y)
  i = 0
  for (const ch of text) ctx.fillText(ch, xs[i++]!, y)
}

/** Nice lengths in ft, with their labels. */
const SCALE_STEPS: { ft: number; label: string }[] = [
  { ft: 10, label: '10 ft' },
  { ft: 50, label: '50 ft' },
  { ft: 100, label: '100 ft' },
  { ft: 500, label: '500 ft' },
  { ft: 1000, label: '1000 ft' },
  { ft: NM_FT, label: '1 nm' },
  { ft: 2 * NM_FT, label: '2 nm' },
  { ft: 5 * NM_FT, label: '5 nm' },
]
const SCALE_TARGET_PX = 120

/**
 * anchor (set by main.ts): screen CSS px of the bar's right end (x) and its bottom edge (y). It already sits above the
 * transport bar (or the phone sheet) and left of the side panel; draw the bar and its labels up and to the left of it.
 */
export function drawScaleBar(f: Frame, anchor: { right: number; bottom: number }): void {
  const { ctx, cam, b } = f
  const z = cam.zoom
  let best = SCALE_STEPS[0]!
  for (const s of SCALE_STEPS) if (Math.abs(s.ft * z - SCALE_TARGET_PX) < Math.abs(best.ft * z - SCALE_TARGET_PX)) best = s
  const len = Math.round(best.ft * z)
  const scopeInk = b.scope > 0.5
  const ink = cssVar(scopeInk ? '--scope-ink-2' : '--ink-on-sea-2')
  const halo = cssVar('--hud-halo')
  const T = tokens()

  const right = Math.round(anchor.right) + 0.5
  const barY = Math.round(anchor.bottom) - 0.5
  const left = right - len
  const tick = 6

  ctx.save()
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'round'
  const bar = new Path2D()
  bar.moveTo(left, barY - tick)
  bar.lineTo(left, barY)
  bar.lineTo(right, barY)
  bar.lineTo(right, barY - tick)
  ctx.strokeStyle = halo
  ctx.lineWidth = 3
  ctx.stroke(bar)
  ctx.strokeStyle = ink
  ctx.lineWidth = 1
  ctx.stroke(bar)

  ctx.font = `11px ${T.fontMono}`
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'center'
  ctx.strokeStyle = halo
  ctx.lineWidth = 3
  ctx.fillStyle = ink
  const ly = barY - tick - 3
  ctx.strokeText(best.label, (left + right) / 2, ly)
  ctx.fillText(best.label, (left + right) / 2, ly)

  // scope band: the range from the ship to the furthest visible corner
  const ra = sstep(b.scope, 0.4, 0.6)
  if (ra > 0.001) {
    const corners: Vec2[] = [
      cam.screenToWorld({ x: 0, y: 0 }), cam.screenToWorld({ x: cam.w, y: 0 }),
      cam.screenToWorld({ x: 0, y: cam.h }), cam.screenToWorld({ x: cam.w, y: cam.h }),
    ]
    let maxFt = 0
    for (const c of corners) maxFt = Math.max(maxFt, Math.hypot(c.x - SHIP_MID_X, c.y))
    const text = `RANGE ${Math.round(maxFt / NM_FT)} NM`
    ctx.globalAlpha = ra
    ctx.fillStyle = cssVar('--scope-ink-2')
    ctx.textAlign = 'right'
    ctx.strokeText(text, left - 14, ly)
    ctx.fillText(text, left - 14, ly)
  }
  ctx.restore()
}
