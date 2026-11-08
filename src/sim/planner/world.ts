import type { CrewRole, Vec2 } from '../types'
import type { Pose } from '../../data/deckTypes'
import { AircraftBuilder, CrewBuilder, EquipmentBuilder, EventLog, VehicleBuilder, WALK_SPEED } from './toolkit'
import { dist } from '../track'

/** Shared mutable state that each phase builder appends to. */
export interface World {
  aircraft: Map<string, AircraftBuilder>
  crew: CrewBuilder[]
  vehicles: VehicleBuilder[]
  eq: EquipmentBuilder
  log: EventLog
  pools: Pools
}

export type Zone = 1 | 2 | 3

/** Fly 1 is the bow (x ≥ 660), Fly 2 the waist and island (300..660), Fly 3 aft (x < 300). */
export function zoneOf(x: number): Zone {
  return x >= 660 ? 1 : x >= 300 ? 2 : 3
}

/** Where idle crew of each kind wait in each fly zone, clear of the tracks and taxi lanes. */
export const MUSTER: Record<Zone, Record<'director' | 'plane-handler' | 'plane-captain' | 'checker', Vec2>> = {
  1: { director: { x: 724, y: 112 }, 'plane-handler': { x: 740, y: 116 }, 'plane-captain': { x: 706, y: 116 }, checker: { x: 690, y: 112 } },
  2: { director: { x: 418, y: 50 }, 'plane-handler': { x: 424, y: 58 }, 'plane-captain': { x: 410, y: 58 }, checker: { x: 430, y: 48 } },
  3: { director: { x: 238, y: 48 }, 'plane-handler': { x: 232, y: 56 }, 'plane-captain': { x: 244, y: 56 }, checker: { x: 226, y: 46 } },
}

/**
 * Simple crew pools: a request for a role in a zone at time t returns the idle crew member who can
 * reach `at` by t, or creates a new one (up to a cap). Members return to their muster point when done.
 */
export class Pools {
  private members: { role: CrewRole; zone: Zone; b: CrewBuilder }[] = []
  private counter = 0

  constructor(private readonly world: () => World) {}

  take(role: 'director' | 'plane-handler' | 'plane-captain' | 'checker', zone: Zone, at: Vec2, t: number, cap = 6, label?: string): CrewBuilder {
    const home = MUSTER[zone][role]
    let best: CrewBuilder | null = null
    for (const m of this.members) {
      if (m.role !== role || m.zone !== zone) continue
      const ready = m.b.t + dist(m.b.pos, at) / WALK_SPEED
      if (ready <= t && (!best || m.b.t > best.t)) best = m.b // most recently freed, so others stay at muster
    }
    if (best) return best
    const n = this.members.filter(m => m.role === role && m.zone === zone).length
    if (n >= cap) {
      // over capacity: take the earliest-free member anyway (they will arrive late rather than teleport)
      let earliest: CrewBuilder | null = null
      for (const m of this.members) if (m.role === role && m.zone === zone && (!earliest || m.b.t < earliest.t)) earliest = m.b
      if (earliest) return earliest
    }
    this.counter++
    const spread = (n % 3) * 6 - 6
    const b = new CrewBuilder(`${role}-f${zone}-${this.counter}`, role, label ?? `${roleName(role)}, Fly ${zone}`, { x: home.x + spread, y: home.y + (n >= 3 ? 6 : 0) }, 0, 'idle', 0)
    this.members.push({ role, zone, b })
    this.world().crew.push(b)
    return b
  }

  /** Send a pool member home (walk back to muster, idle). */
  release(b: CrewBuilder): void {
    const m = this.members.find(x => x.b === b)
    if (!m) return
    const home = MUSTER[m.zone][m.role as 'director']
    const n = this.members.filter(x => x.role === m.role && x.zone === m.zone).indexOf(m)
    b.walkTo({ x: home.x + (n % 3) * 6 - 6, y: home.y + (n >= 3 ? 6 : 0) })
  }
}

function roleName(role: CrewRole): string {
  return role === 'director' ? 'Aircraft director' : role === 'plane-handler' ? 'Chock and chain crew' : role === 'plane-captain' ? 'Plane captain' : 'Final checker'
}

export function newWorld(): World {
  const w: World = {
    aircraft: new Map(),
    crew: [],
    vehicles: [],
    eq: new EquipmentBuilder(0),
    log: new EventLog(),
    pools: null as unknown as Pools,
  }
  w.pools = new Pools(() => w)
  return w
}

export const poseOf = (p: Vec2, heading: number): Pose => ({ x: p.x, y: p.y, heading })
