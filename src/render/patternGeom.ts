// STUB: lane E fills this in
// Constants moved out of pattern.ts (values unchanged; research §5.2, nm unless noted).
import type { PatternKeyframe, Vec2 } from '../sim/types'

export const NM_FT = 6076

export const CASE_I: {
  initialStart: Vec2; initialEnd: Vec2; breakRadius: number; downwindY: number; abeamX: number
  ninety: Vec2; finalDeg: number; rampX: number; grooveNm: number; stackCentre: Vec2; stackR: number
} = {
  initialStart: { x: -3, y: 0.15 },
  initialEnd: { x: 0, y: 0.08 },
  breakRadius: 0.6,
  downwindY: -1.2,
  abeamX: -0.1,
  ninety: { x: -1.15, y: -0.55 },
  finalDeg: -9,
  rampX: -546 / NM_FT,
  grooveNm: 0.75,
  stackCentre: { x: 1.0, y: -1.5 }, // sim/planner/recovery.ts STACK_CENTRE
  stackR: 1.5, // sim/planner/recovery.ts STACK_R
}

/** Nominal Case I path in any mapping (P maps pattern nm to the target space). Same shape as the inset's racetrack. */
export function racetrack(P: (nm: Vec2) => Vec2): Path2D {
  const C = CASE_I
  const path = new Path2D()
  const fr = (C.finalDeg * Math.PI) / 180
  const fdir = { x: Math.cos(fr), y: Math.sin(fr) }
  const ramp = { x: C.rampX, y: 0 }
  const grooveStart = { x: ramp.x - fdir.x * C.grooveNm, y: ramp.y - fdir.y * C.grooveNm }
  const bc = { x: C.initialEnd.x + C.breakRadius, y: (C.initialEnd.y + C.downwindY) / 2 }
  const br = (C.initialEnd.y - C.downwindY) / 2
  const abeam = { x: C.abeamX, y: C.downwindY }
  const move = (p: Vec2) => { const s = P(p); path.moveTo(s.x, s.y) }
  const line = (p: Vec2) => { const s = P(p); path.lineTo(s.x, s.y) }
  const bez = (c1: Vec2, c2: Vec2, e: Vec2) => {
    const a = P(c1), b = P(c2), c = P(e)
    path.bezierCurveTo(a.x, a.y, b.x, b.y, c.x, c.y)
  }
  move(C.initialStart)
  line({ x: bc.x, y: C.initialEnd.y })
  // break: left turn over the bow, sampled so any mapping works
  for (let i = 1; i <= 24; i++) {
    const a = Math.PI / 2 - (i / 24) * Math.PI
    line({ x: bc.x + br * Math.cos(a), y: bc.y + br * Math.sin(a) })
  }
  line(abeam)
  const turnR = 0.45
  bez({ x: abeam.x - turnR, y: abeam.y }, { x: C.ninety.x, y: C.ninety.y - turnR * 0.8 }, C.ninety)
  bez({ x: C.ninety.x, y: C.ninety.y + turnR }, { x: grooveStart.x - fdir.x * turnR * 0.8, y: grooveStart.y - fdir.y * turnR * 0.8 }, grooveStart)
  line(ramp)
  return path
}

export const LEG_CODE: Record<PatternKeyframe['leg'], string> = {
  marshal: 'MSHL', initial: 'INIT', break: 'BRK', downwind: 'DNWD', abeam: '180', ninety: '90',
  groove: 'GRV', departure: 'DEP', bolter: 'BLTR', none: '',
}
