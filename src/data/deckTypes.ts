import type { Vec2 } from '../sim/types'

/**
 * Static flight-deck geometry in ship-centered feet (see sim/types.ts for the frame).
 * Populated in data/deck.ts from the research notes (docs/research/00-DOMAIN-REFERENCE.md).
 */
export interface Catapult {
  id: 1 | 2 | 3 | 4
  /** battery position: where the shuttle sits for hook-up (aft end of the stroke) */
  start: Vec2
  /** forward end of the power stroke */
  end: Vec2
  /** jet blast deflector panel polygon (aft of the start point) */
  jbd: Vec2[]
  /** deck-edge integrated catapult control station (the "bubble") */
  iccs: Vec2
  /** where the shooter stands during the shot */
  shooterPos: Vec2
  /** where the aircraft's reference point sits when the launch bar is in the shuttle (nose gear at start) */
  aircraftPos: Vec2
  heading: number
}

export interface ArrestingWire {
  n: 1 | 2 | 3 | 4
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
}

export interface DeckGeometry {
  /** overall flight deck outline polygon (counter-clockwise or clockwise, closed implicitly) */
  outline: Vec2[]
  /** hull outline at the waterline, drawn faintly below the deck */
  hull: Vec2[]
  /** landing area */
  landingArea: {
    polygon: Vec2[]
    /** angle of the landing centreline relative to the keel, degrees (negative = to port) */
    angleDeg: number
    /** aft (ramp) and forward ends of the painted centreline */
    centreline: [Vec2, Vec2]
    /** foul lines bounding the landing area, each as a segment */
    foulLines: [Vec2, Vec2][]
    /** the round-down / ramp edge midpoint */
    ramp: Vec2
  }
  catapults: Catapult[]
  wires: ArrestingWire[]
  elevators: { id: 1 | 2 | 3 | 4; polygon: Vec2[] }[]
  island: { polygon: Vec2[]; priFly: Vec2; flightDeckControl: Vec2 }
  lsoPlatform: { polygon: Vec2[]; stand: Vec2 }
  iflols: Vec2
  /** nicknamed parking areas and other named regions */
  areas: NamedArea[]
  /** x positions of the Fly 1 / Fly 2 / Fly 3 boundaries */
  flyBoundaries: [number, number]
  /** parking spots by configuration */
  spots: {
    /** pre-launch spot: aircraft staged for launch (waist, fantail, street) */
    launch: Spot[]
    /** recovery spot: landing area clear, aircraft packed forward and starboard */
    recovery: Spot[]
  }
  /** crew stations that do not move with aircraft */
  stations: Record<string, Vec2>
  /** bounding box helper */
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
}
