import type { Vec2 } from '../sim/types'

/**
 * Static flight-deck geometry in ship-centered feet (see sim/types.ts for the frame).
 * Populated in data/deck.ts from docs/research/00-DOMAIN-REFERENCE.md.
 */
export interface Catapult {
  id: 1 | 2 | 3 | 4
  /** battery position: where the shuttle sits for hook-up (aft end of the stroke) */
  start: Vec2
  /** forward end of the power stroke */
  end: Vec2
  /** jet blast deflector panel polygon (aft of the start point) */
  jbd: Vec2[]
  /** centre of the JBD's aft edge (jets wait 10-20 ft aft of this) */
  jbdAft: Vec2
  /** integrated catapult control station (the "bubble") shared by the pair */
  iccs: Vec2
  /** where the shooter stands during the shot (between the pair's tracks) */
  shooterPos: Vec2
  /** where the aircraft's reference point (mid-length) sits when the launch bar is in the shuttle */
  aircraftPos: Vec2
  /** next-jet waiting slot, wings spread, just aft of the JBD */
  queue: Pose
  /** holding node 60-120 ft aft of the JBD where wings are spread */
  hold: Pose
  /** deck-edge operator's catwalk station */
  deckEdge: Vec2
  /** JBD operator's station (deck edge abeam the panel) */
  jbdOperator: Vec2
  /** JBD safety observer (far end of the panel) */
  jbdSafety: Vec2
  /** centerdeck operator (shared by the pair) */
  centerdeck: Vec2
  /** bow or angle safety observer at the forward end of the stroke */
  safetyObserver: Vec2
  heading: number
}

export interface Pose {
  x: number
  y: number
  heading: number
}

export interface ArrestingWire {
  n: 1 | 2 | 3 | 4
  /** distance from the ramp along the landing centreline */
  s: number
  centre: Vec2
  a: Vec2
  b: Vec2
}

export interface NamedArea {
  id: string
  name: string
  polygon: Vec2[]
  label: Vec2
  note?: string
}

export interface Spot {
  id: string
  x: number
  y: number
  heading: number
  /** which parking region it belongs to */
  area: string
  /** occupied in the full recovery spot */
  recovery: boolean
  /** usable in the launch spot */
  launch: boolean
  /** heading when used as a launch spot, if different (six-pack spins round) */
  launchHeading?: number
  /** primary catapult this slot feeds in the launch spot */
  feeds?: 1 | 2 | 3 | 4
  /** fill order in the recovery spot (lower first) */
  fillOrder?: number
}

export interface FuelStation {
  id: string
  x: number
  y: number
  serves: string
}

export interface DeckGeometry {
  /** overall flight deck outline polygon (clockwise from the ramp's port end) */
  outline: Vec2[]
  /** hull outline at the waterline, drawn faintly below the deck */
  hull: Vec2[]
  /** landing area */
  landingArea: {
    /** must-be-clear polygon */
    polygon: Vec2[]
    /** painted strip between the inner ladder lines */
    strip: Vec2[]
    /** angle of the landing centreline relative to the keel, degrees (negative = to port) */
    angleDeg: number
    /** aft (ramp) and forward ends of the painted centreline */
    centreline: [Vec2, Vec2]
    /** foul lines bounding the landing area, each as a segment */
    foulLines: [Vec2, Vec2][]
    /** the round-down / ramp edge midpoint */
    ramp: Vec2
    /** touchdown aim point */
    aimPoint: Vec2
  }
  catapults: Catapult[]
  wires: ArrestingWire[]
  elevators: { id: 1 | 2 | 3 | 4; polygon: Vec2[] }[]
  island: { polygon: Vec2[]; priFly: Vec2; flightDeckControl: Vec2 }
  lsoPlatform: { polygon: Vec2[]; stand: Vec2 }
  iflols: Vec2
  /** nicknamed parking areas and other named regions */
  areas: NamedArea[]
  /** x positions of the Fly 3 / Fly 2 and Fly 2 / Fly 1 boundaries */
  flyBoundaries: [number, number]
  /** every parking slot with recovery/launch flags */
  slots: Spot[]
  /** parking spots by configuration (derived from slots) */
  spots: {
    launch: Spot[]
    recovery: Spot[]
  }
  /** the de-arm stop on the recovery route */
  dearmStop: Pose
  /** recovery exit route nodes after the trap (jet centre), in order */
  recoveryRoute: Pose[]
  /** recovery director chain positions */
  recoveryDirectors: Vec2[]
  fuelStations: FuelStation[]
  /** crew stations that do not move with aircraft */
  stations: Record<string, Vec2>
  /** bounding box helper */
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
}
