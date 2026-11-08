import type { Vec2 } from '../sim/types'
import type { Catapult, DeckGeometry, NamedArea, Spot } from './deckTypes'
import { offset } from '../sim/track'

/**
 * Nimitz-class (CVN-68 .. CVN-75 configuration, 4 wires) flight deck geometry.
 * Source: docs/research/01-deck-geometry.md. Documented constraints: 1,092 x 252 ft deck,
 * 9 deg angled landing area ~780 ft long, ~310 ft catapult stroke, 40 ft wire spacing,
 * 4 deck-edge elevators (3 starboard, 1 port). Most individual coordinates are estimates
 * built to satisfy those constraints.
 */

const LA_ANGLE = -9 // degrees, to port
const LA_COS = Math.cos((LA_ANGLE * Math.PI) / 180)
const LA_SIN = Math.sin((LA_ANGLE * Math.PI) / 180)

/** point on the landing centreline, s feet from the ramp */
export function laPoint(s: number): Vec2 {
  return { x: 5 * 0 + LA_COS * s, y: 5 + LA_SIN * s }
}
/** foul line (starboard edge of the landing area) y at a given x */
export function foulLineY(x: number): number {
  return 60.7 - 0.1584 * x
}

const outline: Vec2[] = [
  { x: 0, y: 92 },
  { x: 300, y: 100 },
  { x: 760, y: 100 },
  { x: 900, y: 85 },
  { x: 1000, y: 65 },
  { x: 1092, y: 25 },
  { x: 1092, y: -25 },
  { x: 1000, y: -50 },
  { x: 790, y: -58 },
  { x: 774, y: -62 },
  { x: 760, y: -152 },
  { x: 560, y: -140 },
  { x: 330, y: -125 },
  { x: 150, y: -112 },
  { x: 0, y: -100 },
]

// waterline hull, 1,040 ft x 134 ft, set slightly aft of the deck's bow overhang
const hull: Vec2[] = (() => {
  const pts: Vec2[] = []
  const x0 = 20
  const x1 = 1060
  const half = 67
  // stern (flat transom) → starboard side → bow point → port side
  pts.push({ x: x0, y: 50 }, { x: x0 + 60, y: half }, { x: x1 - 220, y: half }, { x: x1, y: 0 }, { x: x1 - 220, y: -half }, { x: x0 + 60, y: -half }, { x: x0, y: -50 })
  return pts
})()

function makeCat(id: 1 | 2 | 3 | 4, start: Vec2, end: Vec2, iccs: Vec2, shooterPos: Vec2): Catapult {
  const heading = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI
  // JBD: hinge ~50 ft aft of the shuttle start, 36 ft wide across the track, 14 ft deep
  const hinge = offset(start, heading, -50, 0)
  const jbd = [offset(hinge, heading, 0, -18), offset(hinge, heading, 0, 18), offset(hinge, heading, -14, 18), offset(hinge, heading, -14, -18)]
  // Super Hornet nose gear is ~23 ft aft of the nose tip; aircraft reference is mid-length (30 ft aft of nose)
  const aircraftPos = offset(start, heading, -7, 0)
  return { id, start, end, jbd, iccs, shooterPos, aircraftPos, heading }
}

const catapults: Catapult[] = [
  makeCat(1, { x: 765, y: 25 }, { x: 1075, y: 30 }, { x: 800, y: 0 }, { x: 758, y: 64 }),
  makeCat(2, { x: 765, y: -25 }, { x: 1075, y: -30 }, { x: 800, y: 0 }, { x: 748, y: -52 }),
  makeCat(3, { x: 430, y: -30 }, { x: 736, y: -79 }, { x: 450, y: -100 }, { x: 440, y: 8 }),
  makeCat(4, { x: 410, y: -72 }, { x: 716, y: -121 }, { x: 450, y: -100 }, { x: 405, y: -112 }),
]

const wires = ([1, 2, 3, 4] as const).map(n => {
  const s = 175 + (n - 1) * 40
  const c = laPoint(s)
  const px = -LA_SIN // perpendicular to the landing heading
  const py = LA_COS
  const half = 52
  return { n, a: { x: c.x - px * half, y: c.y - py * half }, b: { x: c.x + px * half, y: c.y + py * half } }
})

const rect = (x0: number, x1: number, y0: number, y1: number): Vec2[] => [
  { x: x0, y: y0 },
  { x: x1, y: y0 },
  { x: x1, y: y1 },
  { x: x0, y: y1 },
]

const elevators: DeckGeometry['elevators'] = [
  { id: 1, polygon: rect(670, 740, 48, 100) },
  { id: 2, polygon: rect(580, 650, 48, 100) },
  { id: 3, polygon: rect(325, 395, 48, 100) },
  { id: 4, polygon: [{ x: 330, y: -75 }, { x: 400, y: -75 }, { x: 400, y: -130 }, { x: 330, y: -125 }] },
]

const island = {
  polygon: [
    { x: 410, y: 70 },
    { x: 560, y: 70 },
    { x: 560, y: 102 },
    { x: 410, y: 102 },
  ],
  priFly: { x: 505, y: 88 },
  flightDeckControl: { x: 520, y: 76 },
}

const landingPolygon: Vec2[] = [
  { x: 0, y: 60.7 },
  { x: 770, y: foulLineY(770) },
  { x: 774, y: -62 },
  { x: 760, y: -152 },
  { x: 560, y: -139.4 },
  { x: 0, y: -50.7 },
]

const areas: NamedArea[] = [
  { id: 'bow', name: 'the bow', polygon: rect(880, 1060, -45, 75), label: { x: 960, y: -5 } },
  { id: 'point', name: 'the point', polygon: [{ x: 690, y: -150 }, { x: 760, y: -152 }, { x: 760, y: -115 }, { x: 690, y: -115 }], label: { x: 722, y: -138 } },
  { id: 'crotch', name: 'the crotch', polygon: rect(770, 830, -58, -40), label: { x: 800, y: -49 } },
  { id: 'finger', name: 'the finger', polygon: rect(830, 1000, -55, -40), label: { x: 915, y: -47 } },
  { id: 'six-pack', name: 'the six-pack', polygon: rect(560, 700, 5, 48), label: { x: 630, y: 26 } },
  { id: 'street', name: 'the street', polygon: [{ x: 400, y: 2 }, { x: 760, y: -55 }, { x: 760, y: -15 }, { x: 400, y: 20 }], label: { x: 500, y: -5 } },
  { id: 'corral', name: 'the corral', polygon: rect(600, 740, 50, 100), label: { x: 670, y: 75 } },
  { id: 'patio', name: 'the patio', polygon: rect(760, 900, 45, 85), label: { x: 830, y: 65 } },
  { id: 'junkyard', name: 'the junkyard', polygon: rect(340, 410, 15, 70), label: { x: 375, y: 42 } },
  { id: 'hummer-hole', name: 'hummer hole', polygon: rect(395, 415, 60, 100), label: { x: 405, y: 80 } },
  { id: 'fantail', name: 'the fantail', polygon: [{ x: 20, y: 95 }, { x: 320, y: 95 }, { x: 320, y: foulLineY(320) }, { x: 20, y: foulLineY(20) }], label: { x: 170, y: 72 } },
  { id: 'la', name: 'landing area', polygon: landingPolygon, label: { x: 330, y: -45 } },
]

function row(prefix: string, area: string, pts: Vec2[], heading: number): Spot[] {
  return pts.map((p, i) => ({ id: `${prefix}-${i + 1}`, x: p.x, y: p.y, heading, area }))
}
const xs = (x0: number, step: number, n: number, y: number): Vec2[] => Array.from({ length: n }, (_, i) => ({ x: x0 + step * i, y }))

/** Recovery spot: landing area clear, aircraft packed on the bow and starboard side. */
const recoverySpots: Spot[] = [
  ...row('bow-port', 'bow', xs(900, 40, 4, -28), -90),
  ...row('bow-stbd', 'bow', xs(900, 40, 4, 44), 90),
  ...row('bow-tip', 'bow', [{ x: 1058, y: 0 }], 0),
  ...row('patio', 'patio', xs(790, 40, 3, 68), 90),
  ...row('corral', 'corral', xs(610, 40, 4, 76), 90),
  ...row('six-pack', 'six-pack', xs(575, 32, 6, 26), 40),
  ...row('fantail', 'fantail', xs(160, 40, 4, 70), 90),
  ...row('junkyard', 'junkyard', [{ x: 350, y: 30 }, { x: 392, y: 30 }], 0),
]

/** Launch spot: launchers staged aft (waist cats) and on the six-pack/fantail (bow cats). */
const launchSpots: Spot[] = [
  ...row('waist-stage', 'la', [
    { x: 300, y: -40 }, { x: 230, y: -32 }, { x: 160, y: -22 },
    { x: 280, y: -92 }, { x: 210, y: -84 }, { x: 140, y: -74 },
  ], -9),
  ...row('fantail', 'fantail', xs(160, 40, 4, 70), 90),
  ...row('six-pack', 'six-pack', xs(575, 32, 6, 26), 40),
  ...row('patio', 'patio', xs(790, 40, 3, 68), 90),
  ...row('corral', 'corral', xs(610, 40, 4, 76), 90),
  ...row('junkyard', 'junkyard', [{ x: 350, y: 30 }, { x: 392, y: 30 }], 0),
]

const stations: Record<string, Vec2> = {
  lso: { x: 168, y: -108 },
  iflols: { x: 420, y: -128 },
  priFly: island.priFly,
  flightDeckControl: island.flightDeckControl,
  tilly: { x: 300, y: 38 },
  crashCrew: { x: 420, y: 45 },
  agDeckEdgeStbd: { x: 250, y: 30 },
  agDeckEdgePort: { x: 250, y: -95 },
  hookRunnerStbd: { x: 300, y: 12 },
  fuelStationA: { x: 560, y: 60 },
  medical: { x: 440, y: 60 },
  bowCatOfficerBetween: { x: 745, y: 0 },
  waistSafety: { x: 470, y: -95 },
  bowSafety: { x: 790, y: 80 },
}

export const DECK: DeckGeometry = {
  outline,
  hull,
  landingArea: {
    polygon: landingPolygon,
    angleDeg: LA_ANGLE,
    centreline: [laPoint(0), laPoint(780)],
    foulLines: [[{ x: 0, y: 60.7 }, { x: 770, y: foulLineY(770) }]],
    ramp: laPoint(0),
  },
  catapults,
  wires,
  elevators,
  island,
  lsoPlatform: { polygon: [{ x: 150, y: -100 }, { x: 185, y: -102 }, { x: 185, y: -120 }, { x: 150, y: -118 }], stand: stations.lso! },
  iflols: stations.iflols!,
  areas,
  flyBoundaries: [400, 740],
  spots: { launch: launchSpots, recovery: recoverySpots },
  stations,
  bounds: { minX: -40, minY: -170, maxX: 1130, maxY: 120 },
}

/** Named camera views used by the UI. */
export const VIEWS: { id: string; name: string; key: string; minX: number; minY: number; maxX: number; maxY: number }[] = [
  { id: 'deck', name: 'Whole deck', key: '1', minX: -30, minY: -165, maxX: 1120, maxY: 115 },
  { id: 'bow', name: 'Bow catapults', key: '2', minX: 690, minY: -120, maxX: 1100, maxY: 110 },
  { id: 'waist', name: 'Waist catapults', key: '3', minX: 330, minY: -160, maxX: 780, maxY: 60 },
  { id: 'wires', name: 'Arresting gear', key: '4', minX: -20, minY: -130, maxX: 420, maxY: 100 },
  { id: 'island', name: 'Island and six-pack', key: '5', minX: 380, minY: -40, maxX: 760, maxY: 110 },
]
