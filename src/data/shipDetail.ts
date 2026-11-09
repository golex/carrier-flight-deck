// Values are the [EST] figures from docs/design/visuals-spec.md §3.B.
import type { Vec2 } from '../sim/types'

/** Axis-aligned rectangle x0..x1, y0..y1 (ft). */
function rect(x0: number, x1: number, y0: number, y1: number): Vec2[] {
  return [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }]
}
function centre(p: Vec2[]): Vec2 {
  return { x: p.reduce((s, q) => s + q.x, 0) / p.length, y: p.reduce((s, q) => s + q.y, 0) / p.length }
}

export const SPONSONS: Vec2[][] = [rect(40, 80, 97, 112), rect(20, 60, -78, -60), rect(860, 900, -76, -60), rect(860, 900, 58, 74)]
export const SPONSON_MOUNTS: Vec2[] = SPONSONS.map(centre)
export const ISLAND_LEVELS: Vec2[][] = [
  [{ x: 298, y: 86 }, { x: 298, y: 114 }, { x: 428, y: 114 }, { x: 428, y: 70 }, { x: 402, y: 70 }, { x: 402, y: 86 }],
  rect(310, 400, 92, 112),
]
export const ISLAND_MAST: Vec2[] = rect(410, 420, 87, 97)
export const PRIFLY_GLASS: [Vec2, Vec2] = [{ x: 320, y: 92 }, { x: 380, y: 92 }]
export const ANTENNAS: { at: Vec2; len: number; rpm: number }[] = [
  { at: { x: 415, y: 92 }, len: 16, rpm: 15 }, // SPS-48
  { at: { x: 330, y: 104 }, len: 24, rpm: 12 }, // SPS-49
]
export const BEACONS: Vec2[] = [{ x: 432, y: 66 }, { x: 292, y: 84 }]
export const ISLAND_HEIGHT_FT = 130
