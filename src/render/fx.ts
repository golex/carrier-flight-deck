// STUB: lane C fills this in
import type { Frame } from './frame'
import type { SilhouetteSpec } from '../data/silhouettes'
import type { AircraftState } from '../sim/sample'

/** Low-pass water ruffle off the bow. */
export function drawSeaFx(_f: Frame): void {}

/** Cumulative skid marks (after deck markings). */
export function drawSkids(_f: Frame): void {}

/** Dynamic blast cone hatching, heat lines (under jets). */
export function drawDeckFxUnder(_f: Frame): void {}

/** Steam, smoke, sparks, speed lines, cat lights, lens ring, JBD steam (over jets, under crew). */
export function drawDeckFxOver(_f: Frame): void {}

/** Jet-local frame (1 unit = 1 ft, origin at mid-length, x forward). */
export function drawExhaust(_ctx: CanvasRenderingContext2D, _spec: SilhouetteSpec, _s: AircraftState, _z: number, _f: Frame): void {}
