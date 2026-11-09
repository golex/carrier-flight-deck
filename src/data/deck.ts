import type { Vec2 } from '../sim/types'
import type { Catapult, DeckGeometry, FuelStation, NamedArea, Pose, Spot } from './deckTypes'
import { offset } from '../sim/track'

/**
 * Nimitz-class flight deck geometry (CVN-68 .. CVN-75 configuration, 4 wires).
 * Source: docs/research/00-DOMAIN-REFERENCE.md §1. Anchors tagged [MEAS] there were measured
 * from orthorectified imagery of CVN-77 (about ±5 ft); parking slots, crew stations and
 * holding nodes are [EST] values fitted to those anchors.
 *
 * Frame: x = feet forward of the ramp along the keel (0..1092), y = feet from the centreline,
 * positive to starboard. Headings: 0 = toward the bow, +90 = toward starboard.
 */

/** landing centreline: Y = 18.6 - 0.158 X, 9.0° to port */
const LA_ANGLE = -9.0
const LA_F = { x: 0.9877, y: -0.1561 } // unit vector forward along the centreline
const LA_R = { x: 0.1561, y: 0.9877 } // unit vector to its starboard side

/** point on the landing centreline, s feet from the ramp */
export function laPoint(s: number, right = 0): Vec2 {
  return { x: LA_F.x * s + LA_R.x * right, y: 18.6 + LA_F.y * s + LA_R.y * right }
}
/** starboard foul line y at a given x (the safe-parking line) */
export function foulLineY(x: number): number {
  return 66.2 - 0.158 * x
}
/** port foul line y at a given x (valid aft of x = 300) */
export function portFoulLineY(x: number): number {
  return -29.0 - 0.158 * x
}

const outline: Vec2[] = [
  { x: 0, y: -60 },
  { x: 140, y: -66 },
  { x: 150, y: -128 },
  { x: 739, y: -142 },
  { x: 842, y: -63 },
  { x: 1092, y: -48 },
  { x: 1092, y: 42 },
  { x: 850, y: 65 },
  { x: 770, y: 120 },
  { x: 180, y: 120 },
  { x: 73, y: 97 },
  { x: 56, y: 66 },
  { x: 0, y: 67 },
]

// waterline hull, 1,040 x 134 ft, inside the deck overhang
const hull: Vec2[] = [
  { x: 26, y: 46 },
  { x: 90, y: 67 },
  { x: 840, y: 67 },
  { x: 1066, y: 0 },
  { x: 840, y: -67 },
  { x: 90, y: -67 },
  { x: 26, y: -46 },
]

const landingPolygon: Vec2[] = [
  { x: 0, y: 66.2 },
  { x: 837.9, y: -66.2 },
  { x: 739, y: -142 },
  { x: 300, y: -131.6 },
  { x: 300, y: -76.4 },
  { x: 0, y: -29.0 },
]

const strip: Vec2[] = [laPoint(0, 30), laPoint(796, 30), laPoint(796, -30), laPoint(0, -30)]

interface CatSpec {
  id: 1 | 2 | 3 | 4
  start: Vec2
  end: Vec2
  iccs: Vec2
  shooterPos: Vec2
  queue: Pose
  hold: Pose
  deckEdge: Vec2
  jbdOperator: Vec2
  jbdSafety: Vec2
  centerdeck: Vec2
  safetyObserver: Vec2
}

function makeCat(c: CatSpec): Catapult {
  const heading = (Math.atan2(c.end.y - c.start.y, c.end.x - c.start.x) * 180) / Math.PI
  // JBD Mk 7: hinge (forward edge) 52 ft aft of battery, 36 ft wide, 14 ft fore-aft when lowered
  const hinge = offset(c.start, heading, -52, 0)
  const jbd = [offset(hinge, heading, 0, -18), offset(hinge, heading, 0, 18), offset(hinge, heading, -14, 18), offset(hinge, heading, -14, -18)]
  const jbdAft = offset(c.start, heading, -66, 0)
  // Super Hornet nose gear is ~23 ft aft of the nose tip; the aircraft reference is mid-length (30 ft aft of nose)
  const aircraftPos = offset(c.start, heading, -7, 0)
  return { ...c, jbd, jbdAft, aircraftPos, heading }
}

const catapults: Catapult[] = [
  makeCat({
    id: 1,
    start: { x: 741.0, y: 55.1 },
    end: { x: 1049.7, y: 27.2 },
    iccs: { x: 760, y: 18 },
    shooterPos: { x: 756, y: 27 },
    queue: { x: 630, y: 64, heading: -5 },
    hold: { x: 560, y: 58, heading: -5 },
    deckEdge: { x: 750, y: 122 },
    jbdOperator: { x: 682, y: 122 },
    jbdSafety: { x: 681, y: 38 },
    centerdeck: { x: 745, y: 19 },
    safetyObserver: { x: 1060, y: 47 },
  }),
  makeCat({
    id: 2,
    start: { x: 736.0, y: -16.3 },
    end: { x: 1045.9, y: -24.3 },
    iccs: { x: 760, y: 18 },
    shooterPos: { x: 751, y: 10 },
    queue: { x: 625, y: -13, heading: -1.5 },
    hold: { x: 560, y: -34, heading: -3 },
    deckEdge: { x: 798, y: -97 },
    jbdOperator: { x: 668, y: -46 },
    jbdSafety: { x: 670, y: 8 },
    centerdeck: { x: 745, y: 19 },
    safetyObserver: { x: 1060, y: -52 },
  }),
  makeCat({
    id: 3,
    start: { x: 421.0, y: -71.8 },
    end: { x: 730.1, y: -95.1 },
    iccs: { x: 440, y: -92 },
    shooterPos: { x: 436, y: -98 },
    queue: { x: 310, y: -64, heading: -4 },
    hold: { x: 235, y: -52, heading: -6 },
    deckEdge: { x: 390, y: -136 },
    jbdOperator: { x: 362, y: -136 },
    jbdSafety: { x: 362, y: -45 },
    centerdeck: { x: 400, y: -92 },
    safetyObserver: { x: 735, y: -138 },
  }),
  makeCat({
    id: 4,
    start: { x: 367.0, y: -110.0 },
    end: { x: 677.0, y: -110.0 },
    iccs: { x: 440, y: -92 },
    shooterPos: { x: 382, y: -84 },
    queue: { x: 256, y: -110, heading: 0 },
    hold: { x: 175, y: -56, heading: -4 },
    deckEdge: { x: 390, y: -136 },
    jbdOperator: { x: 308, y: -134 },
    jbdSafety: { x: 309, y: -88 },
    centerdeck: { x: 400, y: -92 },
    safetyObserver: { x: 735, y: -138 },
  }),
]

/** Mk 7 Mod 3 pendants, 4-wire ship. Target wire is #3 at s = 257 ft. */
const wires = ([1, 2, 3, 4] as const).map(n => {
  const s = [177, 217, 257, 300][n - 1]!
  const centre = laPoint(s)
  return { n, s, centre, a: laPoint(s, 32), b: laPoint(s, -32) }
})

const rect = (x0: number, x1: number, y0: number, y1: number): Vec2[] => [
  { x: x0, y: y0 },
  { x: x1, y: y0 },
  { x: x1, y: y1 },
  { x: x0, y: y1 },
]

const elevators: DeckGeometry['elevators'] = [
  { id: 1, polygon: rect(591, 661, 65, 120) },
  { id: 2, polygon: rect(439, 509, 65, 120) },
  { id: 3, polygon: rect(182, 251, 63, 120) },
  { id: 4, polygon: [{ x: 145, y: -68 }, { x: 215, y: -68 }, { x: 215, y: -128 }, { x: 150, y: -128 }] },
]

const island = {
  polygon: [
    { x: 290, y: 80 },
    { x: 290, y: 120 },
    { x: 435, y: 120 },
    { x: 435, y: 63 },
    { x: 395, y: 63 },
    { x: 395, y: 80 },
  ],
  priFly: { x: 330, y: 100 },
  flightDeckControl: { x: 360, y: 82 },
}

const areas: NamedArea[] = [
  { id: 'bow', name: 'the bow', polygon: [{ x: 700, y: -44.4 }, { x: 837.9, y: -66.2 }, { x: 842, y: -63 }, { x: 1092, y: -48 }, { x: 1092, y: 42 }, { x: 850, y: 65 }, { x: 810, y: 80 }, { x: 700, y: 80 }], label: { x: 1040, y: -36 }, note: 'Bow rows one to four; the main recovery pack' },
  { id: 'point', name: 'the point', polygon: [{ x: 661, y: 80 }, { x: 661, y: 120 }, { x: 770, y: 120 }, { x: 810, y: 98 }, { x: 810, y: 80 }], label: { x: 730, y: 112 } },
  { id: 'crotch', name: 'the crotch', polygon: [{ x: 800, y: -25 }, { x: 800, y: -60.2 }, { x: 837.9, y: -66.2 }, { x: 842, y: -63 }, { x: 900, y: -59.5 }, { x: 900, y: -25 }], label: { x: 852, y: -44 } },
  { id: 'corral', name: 'the corral', polygon: rect(509, 591, 65, 120), label: { x: 550, y: 114 } },
  { id: 'street', name: 'the street', polygon: [{ x: 470, y: 60 }, { x: 700, y: 23 }, { x: 700, y: 65 }, { x: 470, y: 65 }], label: { x: 650, y: 50 } },
  { id: 'six-pack', name: 'the six-pack', polygon: [{ x: 445, y: -2 }, { x: 690, y: -41 }, { x: 690, y: 33 }, { x: 445, y: 62 }], label: { x: 560, y: 45 } },
  { id: 'hummer-hole', name: 'hummer hole', polygon: rect(300, 395, 47, 80), label: { x: 348, y: 40 } },
  { id: 'junkyard', name: 'the junkyard', polygon: [{ x: 251, y: 40 }, { x: 300, y: 40 }, { x: 300, y: 80 }, { x: 290, y: 80 }, { x: 290, y: 120 }, { x: 251, y: 120 }], label: { x: 270, y: 32 } },
  { id: 'patio', name: 'the patio', polygon: [{ x: 60, y: 57 }, { x: 182, y: 37 }, { x: 182, y: 120 }, { x: 73, y: 97 }, { x: 56, y: 66 }], label: { x: 95, y: 75 } },
  { id: 'fantail', name: 'the fantail', polygon: [{ x: 0, y: -29 }, { x: 60, y: -38.5 }, { x: 60, y: 56.7 }, { x: 0, y: 66.2 }], label: { x: 30, y: 58 } },
  { id: 'finger', name: 'the finger', polygon: [{ x: 215, y: -70 }, { x: 290, y: -75 }, { x: 290, y: -131 }, { x: 215, y: -130 }], label: { x: 252, y: -80 } },
  { id: 'la', name: 'landing area', polygon: landingPolygon, label: { x: 680, y: -118 } },
]

interface SlotSpec {
  id: string
  area: string
  x: number
  y: number
  heading: number
  flags: 'R' | 'L' | 'RL'
  launchHeading?: number
  feeds?: 1 | 2 | 3 | 4
}

/** Parking slots: centre of a folded 60.3 x 30.5 ft footprint. §1.13 of the domain reference. */
const slotSpecs: SlotSpec[] = [
  // bow pack, nose aft, filled first in a recovery
  { id: 'B1S', area: 'bow', x: 1068, y: 16, heading: 180, flags: 'R' },
  { id: 'B1P', area: 'bow', x: 1068, y: -17, heading: 180, flags: 'R' },
  { id: 'B2S', area: 'bow', x: 1005, y: 33, heading: 180, flags: 'R' },
  { id: 'B2C', area: 'bow', x: 1005, y: 0, heading: 180, flags: 'R' },
  { id: 'B2P', area: 'bow', x: 1005, y: -33, heading: 180, flags: 'R' },
  { id: 'B3S', area: 'bow', x: 942, y: 33, heading: 180, flags: 'R' },
  { id: 'B3C', area: 'bow', x: 942, y: 0, heading: 180, flags: 'R' },
  { id: 'B3P', area: 'bow', x: 942, y: -33, heading: 180, flags: 'R' },
  { id: 'B4S', area: 'bow', x: 879, y: 33, heading: 180, flags: 'R' },
  { id: 'B4C', area: 'bow', x: 879, y: 0, heading: 180, flags: 'R' },
  { id: 'B4P', area: 'bow', x: 879, y: -33, heading: 180, flags: 'R' },
  { id: 'B5S', area: 'bow', x: 816, y: 33, heading: 180, flags: 'R' },
  { id: 'B5C', area: 'bow', x: 816, y: 0, heading: 180, flags: 'R' },
  { id: 'B5P', area: 'crotch', x: 816, y: -33, heading: 180, flags: 'R' },
  // starboard deck edge, nose inboard, tail over the side
  { id: 'PT1', area: 'point', x: 708, y: 104, heading: -90, flags: 'RL', feeds: 1 },
  { id: 'PT2', area: 'point', x: 760, y: 107, heading: -90, flags: 'RL', feeds: 1 },
  { id: 'E1A', area: 'el-1', x: 608, y: 96, heading: -90, flags: 'RL', feeds: 1 },
  { id: 'E1B', area: 'el-1', x: 643, y: 96, heading: -90, flags: 'RL', feeds: 1 },
  { id: 'CO1', area: 'corral', x: 531, y: 96, heading: -90, flags: 'RL', feeds: 1 },
  { id: 'CO2', area: 'corral', x: 567, y: 96, heading: -90, flags: 'RL', feeds: 1 },
  { id: 'E2A', area: 'el-2', x: 456, y: 96, heading: -90, flags: 'RL', feeds: 2 },
  { id: 'E2B', area: 'el-2', x: 491, y: 96, heading: -90, flags: 'RL', feeds: 2 },
  // six-pack along the starboard foul line; recovery heading +45, launch spot spun to -135
  { id: 'SP1', area: 'six-pack', x: 640, y: 1.1, heading: 45, flags: 'RL', launchHeading: -135, feeds: 2 },
  { id: 'SP2', area: 'six-pack', x: 597, y: 7.9, heading: 45, flags: 'RL', launchHeading: -135, feeds: 2 },
  { id: 'SP3', area: 'six-pack', x: 554, y: 14.7, heading: 45, flags: 'RL', launchHeading: -135, feeds: 2 },
  { id: 'SP4', area: 'six-pack', x: 511, y: 21.5, heading: 45, flags: 'RL', launchHeading: -135, feeds: 3 },
  { id: 'SP5', area: 'six-pack', x: 468, y: 28.3, heading: 45, flags: 'RL', launchHeading: -135, feeds: 3 },
  { id: 'HH1', area: 'hummer-hole', x: 362, y: 63, heading: 180, flags: 'RL', feeds: 3 },
  { id: 'E3A', area: 'el-3', x: 199, y: 96, heading: -90, flags: 'RL', feeds: 3 },
  { id: 'E3B', area: 'el-3', x: 234, y: 96, heading: -90, flags: 'RL', feeds: 4 },
  { id: 'PA1', area: 'patio', x: 150, y: 97, heading: -62, flags: 'RL', feeds: 3 },
  { id: 'PA2', area: 'patio', x: 113, y: 90, heading: -62, flags: 'RL', feeds: 4 },
  // port side
  { id: 'E4A', area: 'el-4', x: 163, y: -99, heading: 90, flags: 'RL', feeds: 4 },
  { id: 'E4B', area: 'el-4', x: 197, y: -99, heading: 90, flags: 'RL', feeds: 4 },
  { id: 'FI1', area: 'finger', x: 258, y: -105, heading: 90, flags: 'RL', feeds: 4 },
  // stern, inside the landing area: launch spot only, go first off the waist cats
  { id: 'FT1', area: 'fantail', x: 28, y: -38, heading: 0, flags: 'L', feeds: 4 },
  { id: 'FT2', area: 'fantail', x: 28, y: 0, heading: 0, flags: 'L', feeds: 3 },
  { id: 'FT3', area: 'fantail', x: 28, y: 38, heading: 0, flags: 'L', feeds: 3 },
]

/** Recovery fill order: bow first, front to back, then the deck-edge row, six-pack last. */
const FILL_ORDER = [
  'B1S', 'B1P', 'B2S', 'B2C', 'B2P', 'B3S', 'B3C', 'B3P', 'B4S', 'B4C', 'B4P', 'B5S', 'B5C', 'B5P',
  'PT1', 'PT2', 'E1A', 'E1B', 'CO1', 'CO2', 'E2A', 'E2B', 'HH1', 'E3A', 'E3B', 'PA1', 'PA2', 'E4A', 'E4B', 'FI1',
  'SP5', 'SP4', 'SP3', 'SP2', 'SP1',
]

const slots: Spot[] = slotSpecs.map(s => ({
  id: s.id,
  area: s.area,
  x: s.x,
  y: s.y,
  heading: s.heading,
  recovery: s.flags.includes('R'),
  launch: s.flags.includes('L'),
  launchHeading: s.launchHeading,
  feeds: s.feeds,
  fillOrder: FILL_ORDER.indexOf(s.id) >= 0 ? FILL_ORDER.indexOf(s.id) : undefined,
}))

const recoverySpots = slots
  .filter(s => s.recovery)
  .sort((a, b) => (a.fillOrder ?? 99) - (b.fillOrder ?? 99))
const launchSpots = slots
  .filter(s => s.launch)
  .map(s => ({ ...s, heading: s.launchHeading ?? s.heading }))

// 2 ft forward-starboard of the §3 table's (645,-5) so the folded footprint's port aft corner is clear of the foul line
const dearmStop: Pose = { x: 647, y: -2, heading: 75 }

/** Jet centre positions along the exit from the wires to the bow (§1.15). */
const recoveryRoute: Pose[] = [
  { x: 583, y: -73.5, heading: -9 }, // stop after a 3-wire trap
  { x: 625, y: -40, heading: 30 }, // turning right toward the foul line
  { x: 650, y: -12, heading: 55 }, // across the foul line
  { x: 700, y: 20, heading: 10 }, // into the Box between JBDs 1 and 2
  { x: 760, y: 20, heading: 0 },
  { x: 830, y: 8, heading: 0 }, // up the bow centreline
]

const recoveryDirectors: Vec2[] = [
  { x: 655, y: -30 }, // gear puller (before the trap)
  { x: 665, y: -10 }, // Fly 2 director at the foul line
  { x: 740, y: 20 }, // Box director
  { x: 900, y: 0 }, // Fly 1 bow director
]

const fuelStations: FuelStation[] = [
  { id: 'F1', x: 1000, y: 52, serves: 'bow One Row' },
  { id: 'F2', x: 880, y: 63, serves: 'bow, point' },
  { id: 'F3', x: 760, y: 121, serves: 'point, cat 1 queue' },
  { id: 'F4', x: 680, y: 121, serves: 'El 1, six-pack forward' },
  { id: 'F5', x: 550, y: 121, serves: 'corral, six-pack' },
  { id: 'F6', x: 270, y: 121, serves: 'junkyard, hummer hole' },
  { id: 'F7', x: 165, y: 115, serves: 'patio, El 3' },
  { id: 'F8', x: 60, y: 80, serves: 'patio aft' },
  { id: 'F9', x: 40, y: -61, serves: 'stern port' },
  { id: 'F10', x: 240, y: -131, serves: 'finger, El 4' },
  { id: 'F11', x: 450, y: -135, serves: 'waist, cats 3/4' },
  { id: 'F12', x: 620, y: -140, serves: 'waist forward' },
  { id: 'F13', x: 790, y: -103, serves: 'angle forward edge, crotch' },
  { id: 'F14', x: 850, y: -63, serves: 'crotch, Four Row' },
  { id: 'F15', x: 950, y: -57, serves: 'bow Four Row' },
  { id: 'F16', x: 1040, y: -51, serves: 'bow tip port' },
]

const stations: Record<string, Vec2> = {
  lso: { x: 125, y: -74 },
  iflols: { x: 385, y: -132 },
  priFly: island.priFly,
  flightDeckControl: island.flightDeckControl,
  ago: { x: 262, y: 34 },
  gearPullerPre: { x: 655, y: -30 },
  gearPullerPost: { x: 650, y: -65 },
  hookRunnerA: { x: 545, y: -12 },
  hookRunnerB: { x: 505, y: -6 },
  agDeckEdge: { x: 270, y: 122 },
  agTopside: { x: 240, y: 30 },
  tilly: { x: 270, y: 100 },
  p25: { x: 280, y: 52 },
  crashCrew: { x: 285, y: 46 },
  medical: { x: 300, y: 94 },
  bowBubble: { x: 760, y: 18 },
  waistBubble: { x: 440, y: -92 },
  dearm: { x: 647, y: -2 },
  tractorPool: { x: 270, y: 72 },
  fuelsMuster: { x: 150, y: 112 },
  ordnanceMuster: { x: 230, y: 112 },
  maintMuster: { x: 420, y: 100 },
}

export const DECK: DeckGeometry = {
  outline,
  hull,
  landingArea: {
    polygon: landingPolygon,
    strip,
    angleDeg: LA_ANGLE,
    centreline: [laPoint(0), laPoint(796)],
    foulLines: [
      [{ x: 0, y: 66.2 }, { x: 837.9, y: -66.2 }],
      [{ x: 0, y: -29.0 }, { x: 300, y: -76.4 }],
    ],
    ramp: laPoint(0),
    aimPoint: laPoint(230),
  },
  catapults,
  wires,
  elevators,
  island,
  lsoPlatform: { polygon: rect(115, 135, -82, -66), stand: stations.lso! },
  iflols: stations.iflols!,
  areas,
  flyBoundaries: [300, 660],
  slots,
  spots: { launch: launchSpots, recovery: recoverySpots },
  dearmStop,
  recoveryRoute,
  recoveryDirectors,
  fuelStations,
  stations,
  bounds: { minX: -40, minY: -170, maxX: 1130, maxY: 140 },
}

export function slot(id: string): Spot {
  const s = slots.find(x => x.id === id)
  if (!s) throw new Error(`unknown slot ${id}`)
  return s
}

export function cat(id: 1 | 2 | 3 | 4): Catapult {
  return catapults[id - 1]!
}

/** Named camera views used by the UI. */
export const VIEWS: { id: string; name: string; key: string; minX: number; minY: number; maxX: number; maxY: number }[] = [
  { id: 'deck', name: 'Whole deck', key: '1', minX: -20, minY: -160, maxX: 1110, maxY: 135 },
  { id: 'bow', name: 'Bow catapults', key: '2', minX: 640, minY: -120, maxX: 1100, maxY: 130 },
  { id: 'waist', name: 'Waist catapults', key: '3', minX: 280, minY: -150, maxX: 790, maxY: 70 },
  { id: 'wires', name: 'Arresting gear', key: '4', minX: 0, minY: -150, maxX: 640, maxY: 130 },
  { id: 'island', name: 'Island and six-pack', key: '5', minX: 240, minY: -60, maxX: 720, maxY: 130 },
  { id: 'pattern', name: 'Whole pattern', key: '6', minX: -20112, minY: -19443, maxX: 18774, maxY: 4861 },
]
