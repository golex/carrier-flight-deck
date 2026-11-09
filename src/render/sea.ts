// STUB: lane A fills this in
import type { Frame } from './frame'
import type { DeckGeometry } from '../data/deckTypes'
import { cssVar } from './tokens'

/** Base fill and the three texture layers. Stub: the flat --sea fill only. */
export function drawSea(f: Frame): void {
  f.ctx.fillStyle = cssVar('--sea')
  f.ctx.fillRect(0, 0, f.cam.w, f.cam.h)
}

/** Slick, aerated band, transverse crests, Kelvin feathers, foam band, prop lobes. */
export function drawWake(_f: Frame): void {}

/** Moustache and stem foam (drawn BEFORE the deck so the overhang hides it). */
export function drawBowWave(_f: Frame): void {}

export function drawShipShadow(_f: Frame, _g: DeckGeometry): void {}
