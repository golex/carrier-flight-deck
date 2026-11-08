import type { Pose } from '../../data/deckTypes'
import type { CrewAction, CrewRole, Vec2 } from '../types'
import { DECK, foulLineY, laPoint, slot as slotOf } from '../../data/deck'
import { dist, headingTo } from '../track'
import { LAUNCHERS, PARKED, T_END, T_FIRST_SHOT, T_GREEN_DECK, T_RESPOT_START } from './scenario'
import { AircraftBuilder, CrewBuilder, VehicleBuilder, rel } from './toolkit'
import { MUSTER, zoneOf, type World } from './world'
import { STRIKE_BELOW } from './respot'

/**
 * Ambient crew and vehicles for the whole cycle (0..T_END): the people who are on the flight deck
 * but do not move jets. Stations and per-phase duties follow the §3 crew-roles table of
 * docs/research/00-DOMAIN-REFERENCE.md (Launch / Recovery / Respot columns), §1.10 for Tilly and
 * the P-25, and the crew highlights of the §6.2 example cycle.
 *
 * Not created here: catapult crews (launch.ts), LSOs, the AGO and hook runners (recovery),
 * tractors, their drivers and respot fuel crews (respot).
 */

// ---- timings -------------------------------------------------------------------------------------

/** Crash & salvage go from "P-25 manned" to watching the landing area this long before green deck. */
const CRASH_WATCH_LEAD = 30
/** Tilly is started and reported up 30 s before the deck goes green (§1.10: "No Tilly, no flight ops"). */
const T_TILLY_UP = T_GREEN_DECK - 30
/** A crash crewman walks up to the foul line abeam the wires every few minutes during the recovery. */
const CRASH_PATROL_TIMES = [985, 1225, 1465]
const CRASH_PATROL_DWELL = 20
/** Last waist shot is at T_FIRST_SHOT + 470 = 770; people on the angle move off right after it. */
const T_LAUNCH_DONE = 772
/**
 * Fuel top-off before the start (§3 purple "topping off before the start", §6.2 T-45): the hoses are already on
 * at t=0 and come off FUEL_CLEAR_S before that jet's engines start. A hot refuel is a separate procedure (§6.4).
 */
const FUEL_CLEAR_S = 5
/** Ordnance finishes the loads before any engine start near them (§6.2: loads at T-45, "start the go" at T-30). */
const ORD_DONE = 45
/** Plane captains of the non-flyers stay with their jets through the start, then muster (§3 brown). */
const PC_RELEASE = 400
/** Troubleshooters work on the down jets until the launch is over, then again during the respot. */
const MAINT_END_LAUNCH = 760
const MAINT_RESPOT_START = T_RESPOT_START + 60
const MAINT_RESPOT_END = T_END - 40
/** Pseudo-random troubleshooting dwell times, 40-60 s (repeatable). */
const MAINT_DWELL = [52, 44, 58, 41, 49, 56, 46, 60, 43, 54]
/** Fuels for the respot belong to the respot builder; ours just stay at their stations after this. */
const T_FUELS_HANDOFF = 1800

// ---- fixed positions -----------------------------------------------------------------------------

/** The 3-wire, where the crash crew and the safeties watch during the recovery (§1.5). */
const LA_WATCH = laPoint(257)
/** Foul-line point abeam the junkyard the patrolling crash crewman walks to (≥ 3 ft starboard of the line). */
const CRASH_PATROL_POINT: Vec2 = { x: 300, y: 22 }

/** §1.10: P-25 at (280, +52) nose toward the LA, crew of 3; Tilly at (270, +100), crew of 2; hot chocks at the junkyard cluster. */
const P25_CREW: Vec2[] = [{ x: 266, y: 45 }, { x: 266, y: 58 }, { x: 294, y: 59 }]
const TILLY_CREW: Vec2[] = [{ x: 262, y: 86 }, { x: 278, y: 86 }]
const HOT_CHOCKS: Vec2[] = [{ x: 292, y: 44 }, { x: 298, y: 49 }, { x: 288, y: 38 }]

/** Ordnance end point: the starboard edge between the E3 slots, near the ordnance muster (230, 112). */
const ORD_EDGE: Vec2[] = [{ x: 216, y: 112 }, { x: 216, y: 118 }]

/**
 * Elevator operators (§3 blue "E", white helmet). E2 stands at the inboard edge between the two
 * slots. E3's operator stands at the forward inboard corner (E3A taxis out across the gap
 * between its slots); E1's inboard edge is under the cat 1 queue, so its operator stands at the
 * deck-edge console instead; E4's stands at the aft inboard corner, clear of the E4A taxi-out.
 */
const ELEVATOR_OPS: { n: 1 | 2 | 3 | 4; p: Vec2; heading: number }[] = [
  { n: 1, p: { x: 626, y: 121 }, heading: -90 },
  { n: 2, p: { x: 474, y: 68 }, heading: 90 },
  { n: 3, p: { x: 253, y: 62 }, heading: 90 },
  { n: 4, p: { x: 138, y: -76 }, heading: -90 },
]

/**
 * Safety observers (§3 white "SAFETY": around the cats during the launch, near the LA during the
 * recovery, around tows during the respot). Every recovery spot is ≥ 3 ft starboard of the
 * starboard foul line (y ≥ 66.2 - 0.158x + 3) and clear of the exit route (§1.15).
 */
const SAFETY: { label: string; launch: Vec2; recovery: Vec2 }[] = [
  { label: 'Safety observer, bow cats (starboard)', launch: { x: 672, y: 104 }, recovery: { x: 430, y: 4 } },
  { label: 'Safety observer, bow cats (port)', launch: { x: 720, y: -50 }, recovery: { x: 730, y: -36 } },
  { label: 'Safety observer, waist cats (inboard)', launch: { x: 330, y: -40 }, recovery: { x: 480, y: -5 } },
  { label: 'Safety observer, waist cats (deck edge)', launch: { x: 470, y: -136 }, recovery: { x: 590, y: -20 } },
]

/** Squadron troubleshooters standing by at each cat pair (§3 green, "stand by at the cats"), clear of the wing sweep. */
const CAT_PAIR_MAINT: { pair: string; launch: Vec2[]; recovery: Vec2[] }[] = [
  { pair: 'bow', launch: [{ x: 700, y: 26 }, { x: 706, y: 21 }], recovery: [{ x: 780, y: 104 }, { x: 786, y: 108 }] },
  { pair: 'waist', launch: [{ x: 394, y: -38 }, { x: 401, y: -41 }], recovery: [{ x: 446, y: 53 }, { x: 452, y: 53 }] },
]
/** Where the four roving troubleshooters wait out the recovery (§3: post-flight help; zone 2 starboard side). */
const MAINT_RECOVERY: Vec2[] = [{ x: 440, y: 44 }, { x: 446, y: 40 }, { x: 452, y: 45 }, { x: 458, y: 41 }]

/** Roving troubleshooters: which down jets each one works (§3 green: "fix downs at start"). */
const MAINT_ROUTES: string[][] = [['E2A', 'E2B', 'HH1', 'E3B'], ['SP5', 'SP4'], ['PA1', 'PA2'], ['E4B', 'E4B*']]

/** Fuel teams topping off three launchers (§3 purple: "topping off before the start"). */
const FUEL_TEAMS: { slot: string; recoveryStation: string }[] = [
  { slot: 'CO1', recoveryStation: 'F5' },
  { slot: 'FT3', recoveryStation: 'F7' },
  { slot: 'E4A', recoveryStation: 'F7' },
]

/** Ordnance finishing loads on two armed launchers (§6.2 T-45). */
const ORD_LOADS: string[] = ['SP3', 'E3A']

// ---- helpers -------------------------------------------------------------------------------------

/** Time until which a jet stays at its t=0 pose (Infinity if it never moves). */
function parkedUntil(ab: AircraftBuilder): number {
  const k0 = ab.kf[0]
  if (!k0) return 0
  for (const k of ab.kf) if (Math.hypot(k.x - k0.x, k.y - k0.y) > 1 || k.status !== 'parked') return k.t
  return Infinity
}

function fuelStation(id: string): Vec2 {
  const f = DECK.fuelStations.find(s => s.id === id)
  if (!f) throw new Error(`ambient: no fuel station ${id}`)
  return { x: f.x, y: f.y }
}

function nearestFuelStation(p: Vec2): Vec2 {
  let best = DECK.fuelStations[0]!
  for (const f of DECK.fuelStations) if (dist(f, p) < dist(best, p)) best = f
  return { x: best.x, y: best.y }
}

/** Slot pose as it is parked at t=0 (launchers use their launch heading). */
function slotPose(id: string): Pose {
  const s = slotOf(id)
  const launcher = LAUNCHERS.some(l => l.slot === id)
  return { x: s.x, y: s.y, heading: launcher ? s.launchHeading ?? s.heading : s.heading }
}

/** Where a troubleshooter stands to work on a parked jet: beside the fuselage on the side away from the taxi lanes. */
function maintSpot(id: string): Vec2 {
  const alt = id.endsWith('*')
  const sid = alt ? id.slice(0, -1) : id
  const p = slotPose(sid)
  if (sid === 'HH1') return rel(p, -38, 11) // aft of the tail, clear of the island
  if (sid === 'SP4' || sid === 'SP5') return rel(p, -20, 18) // aft-starboard of the six-pack jet
  if (sid === 'PA1' || sid === 'PA2') return rel(p, -10, 18) // outboard on the patio
  if (sid === 'E4B') return alt ? rel(p, -33, -8) : rel(p, -16, -18) // beside the aft fuselage, then at the tail from the catwalk
  return rel(p, -16, 18) // starboard-edge slots: beside the aft fuselage, tail over the side
}

function mk(w: World, id: string, role: CrewRole, label: string, p: Vec2, heading = 0, action: CrewAction = 'idle'): CrewBuilder {
  const b = new CrewBuilder(id, role, label, p, heading, action)
  w.crew.push(b)
  return b
}

const faceLA = (p: Vec2) => headingTo(p, LA_WATCH)

// ---- builder -------------------------------------------------------------------------------------

export function buildAmbient(w: World): void {
  const { log } = w

  // ---- vehicles (§1.10) ------------------------------------------------------------------------
  const tillyPos = DECK.stations.tilly!
  const tilly = new VehicleBuilder('tilly', 'crash-crane', tillyPos, 180, 0)
  // Tilly does not move, but is started before green deck and kept running throughout the recovery
  tilly.holdUntil(T_TILLY_UP).holdUntil(T_RESPOT_START).holdUntil(T_END)
  w.vehicles.push(tilly)
  const p25 = new VehicleBuilder('p25', 'fire-truck', DECK.stations.p25!, -90, 0)
  p25.holdUntil(T_END)
  w.vehicles.push(p25)

  // ---- events: Pri-Fly calls ----------------------------------------------------------------------
  log.add(5, 'info', 'Ship steadies on the base recovery course, 25-30 knots of wind down the angled deck.')
  log.add(T_FIRST_SHOT - 120, 'info', 'Pri-Fly: "Launch aircraft."', { focus: DECK.island.priFly })
  log.add(T_TILLY_UP, 'info', 'Tilly is up. No crash crane, no recovery.', {
    focus: tillyPos,
    detail: 'The A/S32A-35A crash crane is started before every recovery and kept running until the last jet is chained.',
  })
  log.add(1560, 'info', 'Pri-Fly: the ship may leave the base recovery course; Event N tanker stays overhead.', { focus: DECK.island.priFly })

  // ---- crash & salvage (§3 red; §1.10) --------------------------------------------------------------
  const crash: CrewBuilder[] = []
  P25_CREW.forEach((p, i) => crash.push(mk(w, `crash-p25-${i + 1}`, 'crash-salvage', 'Crash and salvage, P-25 crew', p, faceLA(p))))
  TILLY_CREW.forEach((p, i) => crash.push(mk(w, `crash-tilly-${i + 1}`, 'crash-salvage', i === 0 ? 'Tilly driver' : 'Tilly rigger', p, faceLA(p))))
  HOT_CHOCKS.forEach((p, i) => crash.push(mk(w, `crash-chocks-${i + 1}`, 'crash-salvage', 'Crash and salvage, hot chocks', p, faceLA(p))))
  for (const c of crash) {
    c.holdUntil(T_GREEN_DECK - CRASH_WATCH_LEAD).act('watch', faceLA(c.pos))
  }
  // one of the hot-chocks crew walks up to the foul line abeam the wires every few minutes
  const patrol = crash[crash.length - 3]!
  const patrolHome = { ...patrol.pos }
  for (const t of CRASH_PATROL_TIMES) {
    patrol.holdUntil(t).walkTo(CRASH_PATROL_POINT)
    patrol.act('watch', faceLA(CRASH_PATROL_POINT))
    patrol.wait(CRASH_PATROL_DWELL).walkTo(patrolHome)
    patrol.act('watch', faceLA(patrolHome))
  }
  for (const c of crash) c.holdUntil(T_RESPOT_START).act('idle')

  // ---- Flight Deck Control and Pri-Fly (§3 yellow; drawn as markers in the island) -------------------------------
  const pri = DECK.island.priFly
  mk(w, 'handler', 'handler', 'Aircraft Handling Officer (the Handler), Flight Deck Control', DECK.stations.flightDeckControl!, -90, 'watch')
  mk(w, 'air-boss', 'air-boss', 'Air Boss, Pri-Fly', pri, 180, 'watch')
  mk(w, 'mini-boss', 'air-boss', 'Mini Boss, Pri-Fly', { x: pri.x + 6, y: pri.y }, 180, 'watch')

  // ---- medical (§3 white, red cross) -------------------------------------------------------------------
  mk(w, 'medical', 'medical', 'Flight deck corpsman', DECK.stations.medical!, -90, 'idle')

  // ---- safety observers (§3 white) -----------------------------------------------------------------------
  SAFETY.forEach((s, i) => {
    const b = mk(w, `safety-${i + 1}`, 'safety', s.label, s.launch, i % 2 === 0 ? 0 : 180, 'idle')
    b.holdUntil(T_FIRST_SHOT - 60).act('watch')
    b.holdUntil(T_LAUNCH_DONE + i * 4).walkTo(s.recovery)
    b.act('watch', faceLA(s.recovery))
    b.holdUntil(T_RESPOT_START).act('idle')
  })

  // ---- elevator operators (§3 blue "E") ------------------------------------------------------------------------
  for (const e of ELEVATOR_OPS) {
    const b = mk(w, `elevator-op-${e.n}`, 'plane-handler', `Elevator operator, El ${e.n}`, e.p, e.heading, 'idle')
    if (e.n === 2) {
      // runs El 2 when the down jet is struck below early in the respot (respot.ts STRIKE_BELOW)
      b.holdUntil(STRIKE_BELOW.t - 5).act('direct')
      b.holdUntil(STRIKE_BELOW.t + STRIKE_BELOW.ride).act('idle')
    }
  }

  // ---- fuels: top off three launchers before the start (§3 purple) ---------------------------------------------------
  const recoveryFuelCount: Record<string, number> = {}
  FUEL_TEAMS.forEach(team => {
    const pose = slotPose(team.slot)
    const station = nearestFuelStation(pose)
    const hose: Vec2[] = [rel(pose, 0, 12), rel(pose, -6, 16)]
    const recStation = fuelStation(team.recoveryStation)
    const jet = [...w.aircraft.values()].find(a => dist(a.kf[0]!, pose) < 1)
    const tStart = jet?.kf.find(k => k.status === 'manned')?.t ?? 60
    for (let k = 0; k < 2; k++) {
      const home = { x: station.x + (k === 0 ? -3 : 3), y: station.y }
      const b = mk(w, `fuels-${team.slot}-${k + 1}`, 'fuels', k === 0 ? `Fuels nozzleman, ${team.slot}` : `Fuels station operator, ${team.slot}`, hose[k]!, headingTo(hose[k]!, pose), 'fuel')
      b.holdUntil(tStart - FUEL_CLEAR_S)
      // E4A: go round E4B along the port catwalk rather than under it
      if (team.slot === 'E4A') b.walkTo({ x: 180, y: -131 })
      b.walkTo(home)
      b.act('idle', headingTo(home, pose))
      // relocate to the recovery station (crossing the angle only after the last waist shot)
      const n = recoveryFuelCount[team.recoveryStation] ?? 0
      recoveryFuelCount[team.recoveryStation] = n + 1
      const rp = { x: recStation.x - 9 + n * 6, y: recStation.y - (team.recoveryStation === 'F7' ? 1 : 4) }
      if (dist(home, rp) > 1) {
        if (team.slot === 'E4A') {
          b.holdUntil(T_LAUNCH_DONE)
          b.walkVia([{ x: 240, y: -60 }, { x: 205, y: 45 }, { x: 180, y: 108 }])
        } else {
          b.holdUntil(T_LAUNCH_DONE - 20)
        }
        b.walkTo(rp)
        b.act('idle', -90)
      }
      b.holdUntil(T_FUELS_HANDOFF)
    }
  })

  // ---- ordnance: finish loads on two armed launchers (§3 red, §6.2) --------------------------------------------------
  ORD_LOADS.forEach((sid, i) => {
    const pose = slotPose(sid)
    const p = rel(pose, 2, -10)
    const b = mk(w, `ord-load-${i + 1}`, 'ordnance', `Ordnance loader, ${sid}`, p, headingTo(p, pose), 'arm')
    b.holdUntil(ORD_DONE + i * 5)
    if (sid === 'SP3') b.walkVia([{ x: 420, y: 40 }, { x: 300, y: 42 }, { x: 222, y: 60 }])
    b.walkTo(ORD_EDGE[i]!)
    b.act('idle', 90)
  })

  // ---- plane captains for the parked non-flyers (§3 brown) ----------------------------------------------------------
  const pcCount: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
  for (const P of PARKED) {
    const ab = w.aircraft.get(P.modex)
    const pose = ab ? { x: ab.kf[0]!.x, y: ab.kf[0]!.y, heading: ab.kf[0]!.heading } : slotPose(P.slot)
    const p = rel(pose, 24, -11)
    const b = mk(w, `pc-parked-${P.modex}`, 'plane-captain', `Plane captain, ${P.modex} (down jet)`, p, headingTo(p, rel(pose, 10, 0)), 'check')
    const zone = zoneOf(pose.x)
    const n = pcCount[zone]!
    pcCount[zone] = n + 1
    const home = MUSTER[zone]['plane-captain']
    const spot = { x: home.x - 6 + n * 6, y: home.y - 6 }
    // the E4B captain waits for the waist launch to finish rather than cross the cat 3/4 taxi lanes
    const release = P.slot === 'E4B' ? T_LAUNCH_DONE : PC_RELEASE
    b.holdUntil(Math.min(release, ab ? parkedUntil(ab) : release))
    b.walkTo(spot)
    b.act('idle', 180)
  }

  // ---- squadron troubleshooters (§3 green / black stripe) --------------------------------------------------------------
  const visit = (b: CrewBuilder, route: string[], tEnd: number, d0: number): number => {
    let d = d0
    for (let guard = 0; guard < 40; guard++) {
      for (const id of route) {
        const sid = id.replace('*', '')
        const modex = PARKED.find(p => p.slot === sid)?.modex
        const ab = modex ? w.aircraft.get(modex) : undefined
        const spot = maintSpot(id)
        const dwell = MAINT_DWELL[d++ % MAINT_DWELL.length]!
        const tArrive = b.t + dist(b.pos, spot) / 5
        if (tArrive + dwell > tEnd) return d
        if (ab && parkedUntil(ab) < tArrive + dwell + 5) continue
        b.walkTo(spot)
        b.act('check', headingTo(spot, slotPose(sid)))
        b.wait(dwell)
      }
    }
    return d
  }
  MAINT_ROUTES.forEach((route, i) => {
    const first = maintSpot(route[0]!)
    const b = mk(w, `maint-${i + 1}`, 'maint', 'Squadron troubleshooter', first, headingTo(first, slotPose(route[0]!.replace('*', ''))), 'check')
    let d = visit(b, route, MAINT_END_LAUNCH, i * 3)
    // §3 recovery: post-flight help, waiting on the starboard side in Fly 2
    b.holdUntil(Math.max(b.t, T_LAUNCH_DONE - 10 + i * 3))
    if (route[0] === 'E4B') b.walkVia([{ x: 240, y: -60 }, { x: 330, y: 30 }])
    b.walkTo(MAINT_RECOVERY[i]!)
    b.act('idle', -135)
    // §3 respot: maintenance between events, on the down jets still in their slots
    b.holdUntil(MAINT_RESPOT_START + i * 20)
    const respotRoute = route.filter(r => r !== 'E4B' && r !== 'E4B*')
    if (respotRoute.length) {
      d = visit(b, respotRoute, MAINT_RESPOT_END, d)
      b.walkTo(MAINT_RECOVERY[i]!)
      b.act('idle', -135)
    }
  })
  // two at each cat pair during the launch, near the pair's ordnance muster
  for (const cp of CAT_PAIR_MAINT) {
    cp.launch.forEach((p, k) => {
      const b = mk(w, `maint-${cp.pair}-cats-${k + 1}`, 'maint', `Squadron troubleshooter, ${cp.pair} cats`, p, cp.pair === 'bow' ? 180 : 0, 'idle')
      b.holdUntil(T_FIRST_SHOT - 90).act('watch')
      b.holdUntil((cp.pair === 'bow' ? 650 : T_LAUNCH_DONE) + k * 3).walkTo(cp.recovery[k]!)
      b.act('idle', -135)
    })
  }

  // sanity: nobody we place for the recovery stands on the landing-area side of the starboard foul line
  for (const b of w.crew) {
    if (!b.id.startsWith('safety') && !b.id.startsWith('crash') && !b.id.startsWith('maint') && !b.id.startsWith('fuels') && b.id !== 'bow-director') continue
    for (const k of b.kf) {
      if (k.t < T_GREEN_DECK || k.t > T_RESPOT_START) continue
      if (k.y < foulLineY(k.x) + 3) throw new Error(`ambient: ${b.id} inside the foul line at t=${k.t} (${k.x.toFixed(0)}, ${k.y.toFixed(0)})`)
    }
  }
}
