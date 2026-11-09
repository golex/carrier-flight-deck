// STUB: lane E fills this in
import type { Frame } from './frame'
import type { Vec2 } from '../sim/types'
import type { AirJet } from './airborne'
import { SHIP_MID_X } from './world'

/** Screen px; r = 0 when closed. */
export interface Iris { x: number; y: number; r: number }

/** r = scope^1.5 * (max distance from ship centre to a viewport corner). Stub: always closed. */
export function irisGeometry(f: Frame): Iris {
  const c = f.cam.worldToScreen({ x: SHIP_MID_X, y: 0 })
  return { x: c.x, y: c.y, r: 0 }
}

export function drawScope(_f: Frame, _iris: Iris, _air: AirJet[], _selected: string | null): void {}

/** 10 px radius. */
export function hitScope(_f: Frame, _iris: Iris, _air: AirJet[], _screen: Vec2): string | null {
  return null
}
