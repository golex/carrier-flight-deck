import type { Camera } from './camera'
import type { Vec2 } from '../sim/types'
import type { AircraftState } from '../sim/sample'
import type { Catapult } from '../data/deckTypes'

export const NM_FT = 6076
export const SHIP_MID_X = 546
export const SHIP_KT = 27
export const V_SHIP = 45.6          // ft/s through the water; water streams aft at this in the ship frame
export const WOD_FTS = 50.6         // relative wind toward -x
export const KELVIN_TAN = 0.3536    // tan 19.47 deg
export const STEM: Vec2 = { x: 1066, y: 0 }  // waterline stem
export const TRANSOM_X = 26
export const DECK_H = 60            // flight deck above the waterline, ft
/** One sun, high (60 deg), from the port bow: shadows fall to starboard and slightly forward, away from the LA and the wake. */
export const SUN = { ux: 0.35, uy: 0.94, k: 0.58 }
export function shadowOffset(h: number): Vec2 { return { x: SUN.ux * SUN.k * h, y: SUN.uy * SUN.k * h } }

export function nmToWorld(p: Vec2): Vec2 { return { x: SHIP_MID_X + p.x * NM_FT, y: p.y * NM_FT } }
export function worldToNm(p: Vec2): Vec2 { return { x: (p.x - SHIP_MID_X) / NM_FT, y: p.y / NM_FT } }

/** Run draw() with 1 unit = 1 world foot. Line widths inside are in ft: use px / cam.zoom. */
export function withWorld(ctx: CanvasRenderingContext2D, cam: Camera, dpr: number, draw: () => void): void {
  ctx.save()
  ctx.setTransform(dpr * cam.zoom, 0, 0, dpr * cam.zoom, dpr * (cam.w / 2 - cam.cx * cam.zoom), dpr * (cam.h / 2 - cam.cy * cam.zoom))
  draw()
  ctx.restore()
}

/**
 * Height used for a deck-sampled jet's shadow, and whether that shadow falls on the sea.
 * Over the deck: height above the deck. Past the ramp or the bow: height above the water.
 */
export function aircraftShadowHeight(s: AircraftState): { h: number; onSea: boolean } {
  const off = s.x < 0 || s.x > 1092
  let hDeck = 6
  if (s.status === 'groove' || s.status === 'waveoff') hDeck = 10 + Math.max(0, -s.x) * 0.0612 // tan 3.5 deg
  if (s.status === 'shot' || s.status === 'airborne') hDeck = 6 + Math.max(0, s.x - 1092) * 0.15
  if ((s.status === 'bolter' || s.status === 'waveoff') && s.x > 700) hDeck = Math.max(hDeck, 6 + (s.x - 700) * 0.08)
  return off ? { h: hDeck + DECK_H, onSea: true } : { h: hDeck, onSea: false }
}

/** JBD plan geometry. jbd[0],jbd[1] = hinge (forward edge); jbd[3],jbd[2] = aft edge. Raised to 50 deg at raise = 1. */
export function jbdGeometry(c: Catapult, raise: number): { hinge: [Vec2, Vec2]; top: [Vec2, Vec2]; footprint: Vec2[]; shadow: Vec2[] } {
  const [h0, h1, a1, a0] = c.jbd as [Vec2, Vec2, Vec2, Vec2]
  const k = 1 - 0.6 * raise
  const t0 = { x: h0.x + (a0.x - h0.x) * k, y: h0.y + (a0.y - h0.y) * k }
  const t1 = { x: h1.x + (a1.x - h1.x) * k, y: h1.y + (a1.y - h1.y) * k }
  const so = shadowOffset(8.2 * raise)
  return { hinge: [h0, h1], top: [t0, t1], footprint: [h0, h1, t1, t0],
    shadow: [t0, t1, { x: t1.x + so.x, y: t1.y + so.y }, { x: t0.x + so.x, y: t0.y + so.y }] }
}
