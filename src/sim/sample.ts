import type {
  AircraftEntity,
  AircraftKeyframe,
  CrewEntity,
  CrewKeyframe,
  EquipmentKeyframe,
  PatternEntity,
  PatternKeyframe,
  Timeline,
  VehicleEntity,
} from './types'
import { lerp, lerpHeading, segmentAt } from './track'

export interface AircraftState extends Omit<AircraftKeyframe, 't'> {
  id: string
  /** 0..1 progress through the current segment (for sprite animation such as wing fold) */
  u: number
  /** wing fold progress 0 = folded, 1 = spread */
  wingSpread: number
  visible: boolean
}

export interface CrewState extends Omit<CrewKeyframe, 't'> {
  id: string
  u: number
  /** simulation seconds since the current action began (for the signal pop-in) */
  since: number
}

export interface VehicleState {
  id: string
  kind: VehicleEntity['kind']
  x: number
  y: number
  heading: number
}

export interface PatternState extends Omit<PatternKeyframe, 't'> {
  aircraftId: string
}

export function sampleAircraft(e: AircraftEntity, t: number): AircraftState | null {
  const seg = segmentAt(e.track, t)
  if (!seg) return null
  const { a, b, u } = seg
  const spreadA = a.wings === 'spread' ? 1 : 0
  const spreadB = b.wings === 'spread' ? 1 : 0
  const status = u < 1 ? a.status : b.status
  const visible = !(status === 'airborne' && (b.status === 'airborne' || u === 0))
  return {
    id: e.id,
    x: lerp(a.x, b.x, u),
    y: lerp(a.y, b.y, u),
    heading: lerpHeading(a.heading, b.heading, u),
    wings: u < 0.5 ? a.wings : b.wings,
    wingSpread: lerp(spreadA, spreadB, u),
    status,
    hook: u < 1 ? a.hook : b.hook,
    launchBar: u < 1 ? a.launchBar : b.launchBar,
    power: u < 1 ? a.power : b.power,
    u,
    visible,
  }
}

export function sampleCrew(e: CrewEntity, t: number): CrewState | null {
  const seg = segmentAt(e.track, t)
  if (!seg) return null
  const { a, b, u, i } = seg
  let j = i
  while (j > 0 && e.track[j - 1]!.action === a.action) j--
  return {
    id: e.id,
    x: lerp(a.x, b.x, u),
    y: lerp(a.y, b.y, u),
    heading: lerpHeading(a.heading, b.heading, u),
    action: a.action,
    u,
    since: Math.max(0, t - e.track[j]!.t),
  }
}

export function sampleVehicle(e: VehicleEntity, t: number): VehicleState | null {
  const seg = segmentAt(e.track, t)
  if (!seg) return null
  const { a, b, u } = seg
  return { id: e.id, kind: e.kind, x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), heading: lerpHeading(a.heading, b.heading, u) }
}

export function sampleEquipment(track: readonly EquipmentKeyframe[], t: number): EquipmentKeyframe {
  const seg = segmentAt(track, t)
  if (!seg) {
    return { t, jbd: [0, 0, 0, 0], shuttle: [0, 0, 0, 0], wire: [0, 0, 0, 0], deck: 'red' }
  }
  const { a, b, u } = seg
  const l4 = (p: readonly number[], q: readonly number[]): [number, number, number, number] => [
    lerp(p[0]!, q[0]!, u),
    lerp(p[1]!, q[1]!, u),
    lerp(p[2]!, q[2]!, u),
    lerp(p[3]!, q[3]!, u),
  ]
  return { t, jbd: l4(a.jbd, b.jbd), shuttle: l4(a.shuttle, b.shuttle), wire: l4(a.wire, b.wire), deck: a.deck }
}

export function samplePattern(e: PatternEntity, t: number): PatternState | null {
  const seg = segmentAt(e.track, t)
  if (!seg) return null
  const { a, b, u } = seg
  if (a.leg === 'none' && b.leg === 'none') return null
  return { aircraftId: e.aircraftId, x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), alt: lerp(a.alt, b.alt, u), leg: a.leg }
}

export function phaseAt(tl: Timeline, t: number) {
  for (const p of tl.phases) if (t >= p.tStart && t < p.tEnd) return p
  return tl.phases[tl.phases.length - 1] ?? null
}

/** Events with t <= now, most recent last. */
export function eventsUpTo(tl: Timeline, t: number, max = 12) {
  // events are sorted by t
  let hi = tl.events.length
  let lo = 0
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (tl.events[mid]!.t <= t) lo = mid + 1
    else hi = mid
  }
  return tl.events.slice(Math.max(0, lo - max), lo)
}
