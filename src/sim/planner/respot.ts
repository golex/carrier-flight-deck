import type { AircraftKeyframe, AircraftStatus, CrewAction, Vec2 } from '../types'
import type { Pose } from '../../data/deckTypes'
import { DECK, slot as slotOf } from '../../data/deck'
import { dist, headingTo, lerp, lerpHeading, offset, pathToKeyframes, segmentAt, taxiPath, type PathPoint } from '../track'
import { RECOVERY, T_END, T_RESPOT_START } from './scenario'
import { AircraftBuilder, CrewBuilder, RUN_SPEED, TOW_SPEED, VehicleBuilder, WALK_SPEED, rel } from './toolkit'
import { zoneOf, type World } from './world'

/**
 * Respot for Event N+1 (§6.2 T+21..T+60, §6.4): tractors peel the bow pack outermost row first
 * (opens cats 1/2) and tow the twelve recovered jets into the launch spot, tails outboard.
 * Each tow (§6.4 "tow move crew"): yellow director ahead, blue driver on the tractor, brown plane
 * captain riding the brakes, two blue wing walkers who then chock and chain, a white safety
 * observer. At most six tows at once (six tractors from the junkyard). While the tows run, purple
 * grapes cold-fuel, red ordies load and green troubleshooters work on jets already in the spot.
 *
 * Every tow is planned as a relative track first, then a small scheduler slides its start later
 * until its footprint (folded jet plus tractor) clears every other jet on deck; that keeps the
 * single lane through the Box and down the landing area free of collisions.
 */

// ---- timings (§6.4: hook-up 30-60 s, move 1-5 min, unhook/chock/chain 1-2 min) ----------------
/** recovered jets are chained at the bow by this time (recovery.ts contract) */
const T_TOWS_EARLIEST = 1760
const TOW_MARGIN_S = 5
const HOOKUP_S = 40
/** blue shirts break down the chains before the tractor arrives; it is on the nose for the rest */
const TRACTOR_HOOK_LEAD_S = 20
const UNHOOK_S = 60
/** the tractor is free once the tow bar is off; the blue shirts finish the chains */
const TOWBAR_OFF_S = 15
/** final push-back into a deck-edge slot or nose-first creep into a six-pack slot, over the last 45 ft */
const PUSH_IN_SPEED = 2
const PUSH_IN_FT = 45
/** towed pivot about the main gear, deg/s */
const PIVOT_RATE = 6
/** tractor running light between tows, ft/s */
const TRACTOR_SPEED = 20
const TRACTOR_TURN_S = 3
/** tractor route nodes: the junkyard exit and the waist corridor along the LA side of the six-pack */
const JUNKYARD_GATE: Vec2 = { x: 305, y: 32 }
const WAIST_CORRIDOR: Vec2[] = [
  { x: 430, y: -32 },
  { x: 690, y: -22 },
]
/** tractor reference ahead of the jet reference: 12 ft ahead of the nose tip (nose = +30) */
const TRACTOR_NOSE = 42
const N_TRACTORS = 6 // §6.4: 12 on board, 2 kept for crash response, the rest busy with elevators
const SCHED_STEP_S = 5
const SCHED_MAX_DELAY_S = 500
const CHECK_DT = 2
/** extra clearance used by the scheduler on top of the folded footprint, ft */
const CLEAR_MARGIN = 1

// ---- servicing (§6.2 T+21..26, §6.4 service locks) ----------------------------------------------
const FUEL_S = 300 // §5.3 step 25: 5-10 min of fuel
const ARM_S = 90
const MAINT_S = 150

// ---- footprints -----------------------------------------------------------------------------------
const JET_HALF_L = 60.3 / 2
const JET_HALF_W = 30.5 / 2
const TRACTOR_HALF_L = 5
const TRACTOR_HALF_W = 3

// ---- tow crew stations relative to the jet (forward, right), ft --------------------------------------
const SAFETY_AFT = -15
const SAFETY_OUT = 26
/** the respot safety observers wait at the point, aft of the bow's starboard edge; one per concurrent tow (§6.4: six at once) */
const SAFETY_HOME: Vec2[] = [{ x: 772, y: 104 }, { x: 778, y: 100 }, { x: 784, y: 96 }, { x: 766, y: 108 }, { x: 790, y: 92 }, { x: 760, y: 112 }]
/** pool caps per fly zone for the tow crews: six concurrent tows on top of the recovery crews still in Fly 1 */
const DIRECTOR_CAP = 12
const PC_CAP = 12
const HANDLER_CAP = 24
/** §6.4 order (2) elevators early: the down jet on E2A is struck below to the hangar */
export const STRIKE_BELOW = { slot: 'E2A', t: T_RESPOT_START + 120, ride: 15 }

// ---- route nodes (§1.15): down the bow centreline, through the Box between JBDs 1 and 2 ------------
const BOX_IN: Pose = { x: 760, y: 20, heading: 180 }
const BOX_OUT: Pose = { x: 700, y: 20, heading: 180 }
/** into the landing area and aft along its centreline (Y = 18.6 - 0.158 X) */
const LA_A: Pose = { x: 620, y: -45, heading: 205 }
const LA_B: Pose = { x: 400, y: -45, heading: 172 }
/** port lane for the port bow column: aft through the crotch and over lowered JBD 2, straight into the LA */
const PORT_A: Pose = { x: 720, y: -60, heading: 185 }
/** U-turn in the empty waist for the stern spots: nose comes round to point forward */
const UTURN_IN: Pose = { x: 620, y: -40, heading: 215 }
const UTURN: Pose[] = [
  { x: 585, y: -92, heading: 270 },
  { x: 622, y: -120, heading: 0 },
]
/** the port lane turns further aft, so two stern tows can come round at once */
const UTURN_PORT: Pose[] = [
  { x: 500, y: -60, heading: 182 },
  { x: 452, y: -92, heading: 270 },
  { x: 488, y: -117, heading: 0 },
]
/** push-back lane end for the stern spots: the last 170 ft are straight (clear of the canted patio jets), tail over the ramp */
const STERN_LANE_X = 200
/** straight pull aft out of a bow column before merging toward the Box: one row pitch (63 ft) plus 3 */
const BOW_PULLBACK = 66

/** Tractor pool in the junkyard (§6.4), 2.5 ft apart, nose to port. */
const TRACTOR_PARK: Pose[] = [
  { x: 260, y: 70, heading: -90 },
  { x: 268.5, y: 70, heading: -90 },
  { x: 277, y: 70, heading: -90 },
  { x: 285.5, y: 70, heading: -90 },
  { x: 260, y: 82, heading: -90 },
  { x: 268.5, y: 82, heading: -90 },
]

/**
 * Tow order: the bow pack peels outermost (aft) row first, B5 then B4 ... B1, so cats 1/2 open first.
 * Two lanes run at once: the port column goes aft through the crotch into the landing area, the
 * starboard and centre columns go through the Box. Each tractor pairs one long tow into the aft half
 * of the deck (stern, El 3, El 4, finger) with one short hop to the corral, six-pack or point (§6.4
 * "bow spots last"), and the corral/six-pack chain runs in the order its geometry needs: CO1 (pivots
 * in the open six-pack) before SP3, SP3 (its tractor passes the corral) before CO2, CO2 before SP2.
 * The scheduler slides each start until it clears every other jet; this order (tuned offline against
 * that scheduler) has every jet in its slot by about T+2330 s.
 */
const TOWS: { from: string; to: string }[] = [
  { from: 'B5S', to: 'CO1' },
  { from: 'B4P', to: 'E3A' },
  { from: 'B4S', to: 'SP3' },
  { from: 'B4C', to: 'FT1' },
  { from: 'B3P', to: 'FI1' },
  { from: 'B3S', to: 'CO2' },
  { from: 'B3C', to: 'FT3' },
  { from: 'B2C', to: 'E4A' },
  { from: 'B2P', to: 'FT2' },
  { from: 'B2S', to: 'PT1' },
  { from: 'B1S', to: 'SP2' },
  { from: 'B1P', to: 'PT2' },
]

/** Jets serviced in the launch spot: grapes (2 teams), ordies (1 team of 3), troubleshooters (2). */
const FUEL_JOBS = ['CO1', 'SP3', 'E3A', 'FT1']
const ARM_JOBS = ['SP3', 'E3A', 'FI1']
const MAINT_JOBS = ['CO2', 'FI1']

// ---- small geometry helpers -----------------------------------------------------------------------
const norm = (h: number): number => ((((h + 180) % 360) + 360) % 360) - 180

interface Box {
  x: number
  y: number
  heading: number
  hl: number
  hw: number
}

/** Separating-axis test for two oriented rectangles. */
function boxesOverlap(a: Box, b: Box, margin = 0): boolean {
  const r = a.hl + a.hw + b.hl + b.hw + margin * 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (dx * dx + dy * dy > r * r) return false
  const axes: Vec2[] = []
  for (const o of [a, b]) {
    const h = (o.heading * Math.PI) / 180
    axes.push({ x: Math.cos(h), y: Math.sin(h) }, { x: -Math.sin(h), y: Math.cos(h) })
  }
  const proj = (o: Box, ax: Vec2): number => {
    const h = (o.heading * Math.PI) / 180
    const fx = Math.cos(h)
    const fy = Math.sin(h)
    return o.hl * Math.abs(fx * ax.x + fy * ax.y) + o.hw * Math.abs(-fy * ax.x + fx * ax.y)
  }
  for (const ax of axes) {
    const d = Math.abs(dx * ax.x + dy * ax.y)
    if (d > proj(a, ax) + proj(b, ax) + margin * 2) return false
  }
  return true
}

const jetBox = (p: Pose): Box => ({ x: p.x, y: p.y, heading: p.heading, hl: JET_HALF_L, hw: JET_HALF_W })
const tractorBox = (p: Pose): Box => {
  const c = offset(p, p.heading, TRACTOR_NOSE, 0)
  return { x: c.x, y: c.y, heading: p.heading, hl: TRACTOR_HALF_L, hw: TRACTOR_HALF_W }
}

interface Sampled extends Pose {
  status: AircraftStatus
}

function sampleKf(kf: readonly { t: number; x: number; y: number; heading: number; status: AircraftStatus }[], t: number): Sampled | null {
  const seg = segmentAt(kf, t)
  if (!seg) return null
  const { a, b, u } = seg
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), heading: lerpHeading(a.heading, b.heading, u), status: u < 1 ? a.status : b.status }
}

function onDeck(p: Vec2): boolean {
  const poly = DECK.outline
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!
    const b = poly[j]!
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

/**
 * Like CrewBuilder.follow, but a station that would fall off the deck edge (a director's lead point
 * while the jet turns broadside to the edge) is pulled in toward the jet until it is on deck.
 */
function stationOnDeck(s: Pose, forward: number, right: number): Vec2 {
  let p = offset(s, s.heading, forward, right)
  for (let k = 0.85; !onDeck(p) && k > 0; k -= 0.15) p = offset(s, s.heading, forward * k, right * k)
  return p
}
function followOnDeck(b: CrewBuilder, samples: readonly AircraftKeyframe[], forward: number, right: number, action: CrewAction): void {
  b.key(b.t)
  b.action = action
  for (const s of samples) {
    if (s.t < b.t - 1e-6) continue
    const p = stationOnDeck(s, forward, right)
    // a late walker (or a station swept round by a pivot) runs to the first point he can reach instead of snapping
    if (dist(b.pos, p) > RUN_SPEED * (s.t - b.t) + 0.5) continue
    b.pos = p
    b.heading = s.heading
    b.key(s.t)
  }
}

function pathLen(pts: readonly Vec2[]): number {
  let L = 0
  for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1]!, pts[i]!)
  return L
}

/** Same path and duration the VehicleBuilder.driveTo uses, so a tractor can be timed to arrive exactly. */
function driveDuration(from: Pose, to: Pose, speed: number): number {
  return Math.max(1.5, pathLen(taxiPath(from, from.heading, to, to.heading, 16, 0.35)) / speed)
}

/**
 * A tractor trip: out of the junkyard inboard of the island, along the landing-area side of the
 * waist (clear of the six-pack and the hummer hole) when it crosses the waist, then to the target.
 */
function tripLegs(from: Vec2, to: Pose): Pose[] {
  const pts: Vec2[] = []
  const inJunkyard = (p: Vec2) => p.x < 300 && p.y > 40
  if (inJunkyard(from)) pts.push(JUNKYARD_GATE)
  if (Math.min(from.x, to.x) < WAIST_CORRIDOR[0]!.x && Math.max(from.x, to.x) > WAIST_CORRIDOR[1]!.x) {
    pts.push(...(to.x > from.x ? WAIST_CORRIDOR : [...WAIST_CORRIDOR].reverse()))
  }
  if (inJunkyard(to)) pts.push(JUNKYARD_GATE)
  return [...pts.map((p, i) => ({ ...p, heading: headingTo(p, pts[i + 1] ?? to) })), to]
}
/** Swing round to face the first leg, then drive (so it never sets off sideways). */
function tripDuration(from: Pose, to: Pose): number {
  const legs = tripLegs(from, to)
  let p: Pose = { ...from, heading: headingTo(from, legs[0]!) }
  let d = TRACTOR_TURN_S
  for (const leg of legs) {
    d += driveDuration(p, leg, TRACTOR_SPEED)
    p = leg
  }
  return d
}
function drive(vb: VehicleBuilder, to: Pose): void {
  const legs = tripLegs(vb.pos, to)
  vb.key(vb.t)
  vb.heading = headingTo(vb.pos, legs[0]!)
  vb.key(vb.t + TRACTOR_TURN_S)
  for (const leg of legs) vb.driveTo(leg, TRACTOR_SPEED)
}

// ---- tow plan: a relative-time track for one jet ----------------------------------------------------
interface PlanKey {
  t: number
  x: number
  y: number
  heading: number
  status: AircraftStatus
}

class TowPlan {
  readonly kf: PlanKey[] = []
  pose: Pose
  status: AircraftStatus = 'parked'
  /** end of hook-up (start of motion) and arrival in the slot, relative seconds */
  tMove = 0
  tArrive = 0

  constructor(start: Pose) {
    this.pose = { ...start }
    this.key(0)
  }
  get t(): number {
    return this.kf[this.kf.length - 1]!.t
  }
  key(t: number): void {
    this.kf.push({ t, x: this.pose.x, y: this.pose.y, heading: this.pose.heading, status: this.status })
  }
  hold(dt: number): void {
    this.key(this.t + dt)
  }
  setStatus(s: AircraftStatus): void {
    this.key(this.t)
    this.status = s
    this.key(this.t)
  }

  private run(pts: PathPoint[], speed: number, reverse: boolean): void {
    const dur = Math.max(2, pathLen(pts) / speed)
    const frames = pathToKeyframes(pts, this.t, this.t + dur, {}, true)
    for (let i = 1; i < frames.length; i++) {
      const f = frames[i]!
      this.pose = { x: f.x, y: f.y, heading: reverse ? norm(f.heading + 180) : f.heading }
      this.key(f.t)
    }
  }

  private legs(legs: Pose[], reverse: boolean): PathPoint[] {
    const pts: PathPoint[] = []
    let from: Pose = this.pose
    for (const leg of legs) {
      const h0 = reverse ? from.heading + 180 : from.heading
      const h1 = reverse ? leg.heading + 180 : leg.heading
      const n = Math.max(8, Math.ceil(dist(from, leg) / 6))
      const seg = taxiPath(from, h0, leg, h1, n, 0.35)
      pts.push(...(pts.length ? seg.slice(1) : seg))
      from = leg
    }
    return pts
  }

  /** Tractor pulls the jet nose-first through the poses, one smooth ease from rest to rest. */
  pull(legs: Pose[], speed = TOW_SPEED): void {
    this.run(this.legs(legs, false), speed, false)
  }

  /** Tractor on the nose pushes the jet tail-first through the poses (pose headings are the jet's). */
  push(legs: Pose[], speed = TOW_SPEED): void {
    this.run(this.legs(legs, true), speed, true)
  }

  /** Pivot about the main gear (the tractor swings the nose), in 10° steps so followers keep station. */
  pivot(heading: number, rate = PIVOT_RATE): void {
    const d = ((heading - this.pose.heading + 540) % 360) - 180
    const n = Math.max(1, Math.ceil(Math.abs(d) / 10))
    const h0 = this.pose.heading
    for (let i = 1; i <= n; i++) {
      this.pose = { ...this.pose, heading: norm(h0 + (d * i) / n) }
      this.key(this.t + Math.abs(d) / n / rate)
    }
  }

  /** Straight creep at constant heading (push-back into a deck-edge slot). */
  straight(to: Vec2, speed = PUSH_IN_SPEED): void {
    const from = { ...this.pose }
    const D = dist(from, to)
    const dur = Math.max(2, D / speed)
    const n = Math.max(2, Math.ceil(dur / 2))
    const t0 = this.t
    for (let i = 1; i <= n; i++) {
      const u = i / n
      this.pose = { x: lerp(from.x, to.x, u), y: lerp(from.y, to.y, u), heading: from.heading }
      this.key(t0 + (dur * i) / n)
    }
  }

  /** Into the slot: tow speed until the last PUSH_IN_FT, then the slow creep (§1.13: tail over the edge). */
  slotIn(to: Vec2): void {
    const D = dist(this.pose, to)
    if (D > PUSH_IN_FT + 5) {
      const u = (D - PUSH_IN_FT) / D
      this.straight({ x: lerp(this.pose.x, to.x, u), y: lerp(this.pose.y, to.y, u) }, TOW_SPEED)
    }
    this.straight(to, PUSH_IN_SPEED)
  }

  poseAt(tr: number): Pose {
    const s = sampleKf(this.kf, tr)!
    return { x: s.x, y: s.y, heading: s.heading }
  }
}

/** Build the move for one jet from its bow slot to a launch slot (§1.13 heading rules, §1.15 routes). */
function planTow(start: Pose, dest: string): TowPlan {
  const s = slotOf(dest)
  const final: Pose = { x: s.x, y: s.y, heading: s.launchHeading ?? s.heading }
  const p = new TowPlan(start)
  // straight back out of the column first: the bow pack columns are only 2.5 ft apart
  const out: Pose[] = start.x - BOW_PULLBACK > BOX_IN.x + 20 ? [{ x: start.x - BOW_PULLBACK, y: start.y, heading: start.heading }] : []
  // hook-up: tow bar on, chains and chocks off, brake rider up
  p.hold(HOOKUP_S)
  p.setStatus('towed')
  p.tMove = p.t

  const portLane = start.y < -20
  // legs from the bow slot into the landing area, nose-first
  const toLA: Pose[] = portLane ? [...out, PORT_A] : [...out, BOX_IN, BOX_OUT, LA_A]

  if (dest.startsWith('FT')) {
    // stern, inside the LA: U-turn in the waist, then pushed tail-first down the landing area
    p.pull(portLane ? [...out, PORT_A, ...UTURN_PORT] : [...out, BOX_IN, BOX_OUT, UTURN_IN, ...UTURN])
    p.push([{ x: STERN_LANE_X, y: final.y, heading: 0 }, final])
  } else if (dest === 'E4A' || dest === 'FI1') {
    // port aft, nose inboard (+90): down the LA nose-first, backed round toward the edge well inboard
    // (E4B is parked next door), then pushed straight in
    const q: Pose = { x: final.x - 40, y: 5, heading: 180 }
    p.pull([...toLA, LA_B, q])
    p.push([{ x: final.x, y: -35, heading: 90 }])
    p.slotIn(final)
  } else if (dest === 'E3A' || dest === 'PT1' || dest === 'PT2') {
    // starboard edge, nose inboard (-90): stop aft-inboard of the slot, back round, push straight in
    // (the neighbours are only 3-4 ft away, so the last 70 ft are a straight push)
    const q: Pose = { x: final.x - 40, y: final.y - 110, heading: 180 }
    p.pull(dest === 'E3A' ? [...toLA, LA_B, q] : [...out, BOX_IN, q])
    p.push([{ x: final.x, y: final.y - 70, heading: -90 }])
    p.slotIn(final)
  } else if (dest === 'CO1' || dest === 'CO2') {
    // corral: the street is pinched by the parked six-pack noses (SP4), so pivot in the open six-pack
    // forward of them and push back at an angle, tail first, into the slot
    p.pull([...out, BOX_IN, { x: final.x + 69, y: 30, heading: 180 }])
    p.pivot(-90)
    p.slotIn(final)
  } else {
    // six-pack, launch heading -135 (nose aft-port): nose-first from the street, creep the last 45 ft
    const pre: Pose = { ...rel(final, -45, 0), heading: final.heading }
    p.pull([...out, BOX_IN, pre])
    p.slotIn(final)
  }
  p.tArrive = p.t
  p.hold(UNHOOK_S)
  p.setStatus('parked')
  return p
}

// ---- scheduling against everything else on deck -----------------------------------------------------
interface Committed {
  ab: AircraftBuilder
  tHook: number
  tFree: number
}

function makeChecker(w: World, committed: Committed[]) {
  return (self: AircraftBuilder, plan: TowPlan, s: number): number | null => {
    const others = [...w.aircraft.values()].filter(o => o !== self)
    const tractorEnd = plan.tArrive + TOWBAR_OFF_S
    for (let t = s; t <= T_END; t += CHECK_DT) {
      const tr = t - s
      const me = plan.poseAt(tr)
      const meMoving = tr > plan.tMove && tr < plan.tArrive
      const mine: Box[] = [jetBox(me)]
      if (tr >= TRACTOR_HOOK_LEAD_S && tr <= tractorEnd) mine.push(tractorBox(me))
      for (const o of others) {
        const op = sampleKf(o.kf, t)
        if (!op || op.status === 'airborne') continue
        const prev = sampleKf(o.kf, t - 1)!
        // parked neighbours may sit as close as the slot plan allows; anything moving keeps a margin
        const margin = meMoving || dist(prev, op) > 0.05 ? CLEAR_MARGIN : 0
        const theirs: Box[] = [jetBox(op)]
        const c = committed.find(k => k.ab === o)
        if (c && t >= c.tHook && t <= c.tFree) theirs.push(tractorBox(op))
        for (const a of mine) for (const b of theirs) {
          if (a.hl < JET_HALF_L && b.hl < JET_HALF_L) continue // tractor vs tractor: not checked
          if (boxesOverlap(a, b, a.hl < JET_HALF_L || b.hl < JET_HALF_L ? 0 : margin)) {
            return t
          }
        }
      }
    }
    return null
  }
}

interface Tractor {
  vb: VehicleBuilder
  home: Pose
  free: number
  pose: Pose
}

interface TowRecord {
  modex: string
  from: string
  to: string
  ab: AircraftBuilder
  start: Pose
  final: Pose
  tHook: number
  tMove: number
  tArrive: number
  tParked: number
  moveSamples: AircraftKeyframe[]
  tractor: Tractor
}

export function buildRespot(w: World): void {
  buildRespotWith(w, TOWS)
}

/** The respot with an explicit tow table (exposed for offline tuning of the tow order). */
export function buildRespotWith(w: World, towTable: readonly { from: string; to: string }[]): { lastArrive: number } {
  const { log } = w

  log.add(T_RESPOT_START, 'phase', "Respot: the Handler's plan goes onto the Ouija board.", {
    narration: 'respot',
    detail: 'The recovered jets are packed nose-aft on the bow. They are towed off the outermost row first, into the launch spot for Event N+1: stern, finger and El 4, the deck edge, the six-pack spun to face the waist.',
  })

  // ---- elevators early (§6.4 order (2), §6.2 T+26-40): the down jet on E2A goes below before the tows -------
  const below = slotOf(STRIKE_BELOW.slot)
  const downJet = [...w.aircraft.values()].find(a => dist(a.kf[0]!, below) < 1)
  if (downJet) {
    downJet.holdUntil(STRIKE_BELOW.t + STRIKE_BELOW.ride)
    downJet.depart() // on the hangar deck, out of the picture
    log.add(STRIKE_BELOW.t, 'crew', `Elevator 2: three horn blasts. ${downJet.modex} is struck below to the hangar.`, {
      focus: below,
      detail: 'Elevators run early in the respot: the down jets go to the hangar and spares come up (two to four trips), before the tows fill the deck edge.',
    })
  }

  // ---- tractor pool ---------------------------------------------------------------------------------
  const tractors: Tractor[] = TRACTOR_PARK.slice(0, N_TRACTORS).map((p, i) => {
    const vb = new VehicleBuilder(`respot-tractor-${i + 1}`, 'tractor', p, p.heading, 0)
    w.vehicles.push(vb)
    return { vb, home: p, free: 0, pose: { ...p } }
  })

  // ---- the recovered jets: read where recovery left them ----------------------------------------------
  const jets = new Map<string, AircraftBuilder>()
  for (const T of towTable) {
    const R = RECOVERY.find(r => r.slot === T.from)
    if (!R) throw new Error(`respot: no recovered jet for ${T.from}`)
    const ab = w.aircraft.get(R.modex)
    if (!ab) throw new Error(`respot: aircraft ${R.modex} missing`)
    const s = slotOf(T.from)
    if (ab.status === 'airborne' || dist(ab.pose, s) > 40) {
      // recovery has not parked this jet (stub or overrun): place it chained in its bow slot
      ab.holdUntil(Math.max(T_TOWS_EARLIEST - 60, ab.t))
      ab.jumpTo({ x: s.x, y: s.y, heading: s.heading })
      ab.set({ status: 'parked', wings: 'folded', hook: false, launchBar: false, power: 0 })
      ab.key(ab.t)
    }
    jets.set(T.from, ab)
  }

  // ---- schedule the tows -------------------------------------------------------------------------------
  const committed: Committed[] = []
  const clashAt = makeChecker(w, committed)
  const tows: TowRecord[] = []

  for (const T of towTable) {
    const ab = jets.get(T.from)!
    const start: Pose = { ...ab.pose }
    const plan = planTow(start, T.to)
    const hookPose: Pose = { ...rel(start, TRACTOR_NOSE, 0), heading: norm(start.heading + 180) }

    // the tractor that can be on the nose soonest
    let best = tractors[0]!
    let bestReady = Infinity
    for (const tr of tractors) {
      const ready = tr.free + tripDuration(tr.pose, hookPose)
      if (ready < bestReady) {
        bestReady = ready
        best = tr
      }
    }
    const earliest = Math.max(T_TOWS_EARLIEST + TOW_MARGIN_S, ab.t + TOW_MARGIN_S, bestReady - TRACTOR_HOOK_LEAD_S)
    let s = earliest
    while (s < earliest + SCHED_MAX_DELAY_S) {
      if (clashAt(ab, plan, s) === null) break
      s += SCHED_STEP_S
    }

    // commit the jet track
    ab.holdUntil(s)
    ab.change({ wings: 'folded', hook: false, launchBar: false, power: 0 })
    let iMove = -1
    let iArrive = -1
    for (const k of plan.kf) {
      ab.pose = { x: k.x, y: k.y, heading: k.heading }
      ab.status = k.status
      ab.key(s + k.t)
      if (iMove < 0 && k.t >= plan.tMove - 1e-6 && k.status === 'towed') iMove = ab.kf.length - 1
      if (k.t <= plan.tArrive + 1e-6) iArrive = ab.kf.length - 1
    }
    const moveSamples = ab.kf.slice(iMove, iArrive + 1)

    // the tractor: drive up nose-to-nose, swing round onto the tow bar, follow the jet, unhook
    const vb = best.vb
    const tOnNose = s + TRACTOR_HOOK_LEAD_S
    const tDepart = tOnNose - tripDuration(best.pose, hookPose)
    vb.holdUntil(Math.max(vb.t, tDepart))
    drive(vb, hookPose)
    vb.holdUntil(tOnNose + 4)
    vb.heading = start.heading
    vb.key(tOnNose + 16)
    vb.holdUntil(s + plan.tMove)
    vb.follow(moveSamples, TRACTOR_NOSE)
    const tFree = s + plan.tArrive + TOWBAR_OFF_S
    vb.holdUntil(tFree)
    best.free = tFree
    best.pose = { x: vb.pos.x, y: vb.pos.y, heading: vb.heading }

    committed.push({ ab, tHook: s + TRACTOR_HOOK_LEAD_S, tFree })
    const slot = slotOf(T.to)
    tows.push({
      modex: ab.modex,
      from: T.from,
      to: T.to,
      ab,
      start,
      final: { x: slot.x, y: slot.y, heading: slot.launchHeading ?? slot.heading },
      tHook: s,
      tMove: s + plan.tMove,
      tArrive: s + plan.tArrive,
      tParked: s + plan.tArrive + UNHOOK_S,
      moveSamples,
      tractor: best,
    })
  }

  // tractors go home to the junkyard once their last tow is done
  for (const tr of tractors) {
    if (tr.free > 0 && tr.free < T_END - 60) {
      tr.vb.holdUntil(tr.free + 5)
      // run up to just inboard of the slot from the deck side, then nose into line (clear of the island)
      drive(tr.vb, { x: tr.home.x, y: tr.home.y - 30, heading: 90 })
      tr.vb.pos = { x: tr.home.x, y: tr.home.y }
      tr.vb.key(tr.vb.t + 6)
    }
  }
  // the blue tractor drivers ride their tractors
  tractors.forEach((tr, i) => {
    const d = new CrewBuilder(`respot-tractor-driver-${i + 1}`, 'tractor-driver', `Tractor driver ${i + 1}`, offset(tr.home, tr.home.heading, -1, 0), tr.home.heading, 'idle', 0)
    d.follow(tr.vb.kf, -1, 0, 'idle')
    w.crew.push(d)
  })

  // ---- events ------------------------------------------------------------------------------------------
  const first = tows[0]!
  log.add(Math.max(T_RESPOT_START + 30, first.tHook - 40), 'crew', 'The Tractor King sends six tractors forward from the junkyard.', {
    focus: DECK.stations.tractorPool,
    detail: 'Each move has a director, a driver, a plane captain riding the brakes, wing walkers and a safety observer: six to ten people per tow, so six tows at once.',
  })
  tows.slice(0, 3).forEach(T => {
    const s = slotOf(T.to)
    const area = DECK.areas.find(a => a.id === s.area)?.name ?? s.area.replace('el-', 'elevator ')
    log.add(T.tMove, 'taxi', `Tractor tows ${T.modex} from ${T.from} to ${area}`, {
      focus: T.start,
      detail: T.to.startsWith('FT')
        ? 'Pulled out of the bow pack, swung round in the empty waist, then pushed tail-first down the landing area so the jet faces forward with its tail over the ramp.'
        : T.to.startsWith('SP')
          ? 'Pulled nose-first off the bow and down the street into the six-pack, nose toward the waist so it can taxi straight to cat 2.'
          : 'Pulled nose-first off the bow, then backed into its spot with the tail outboard.',
    })
  })

  // ---- tow crews -----------------------------------------------------------------------------------------
  const newSafety = (i: number): CrewBuilder => {
    const b = new CrewBuilder(`respot-safety-${i + 1}`, 'safety', 'Safety observer, respot', SAFETY_HOME[i]!, 180, 'watch', 0)
    w.crew.push(b)
    return b
  }
  const safety = [0, 1, 2].map(newSafety)

  // crews are drawn from the pools in time order
  tows.sort((a, b) => a.tHook - b.tHook)
  for (const T of tows) {
    const zone = zoneOf(T.start.x)
    const st = T.start
    const fin = T.final
    const back = norm(st.heading + 180)

    // director: stands ahead of the tractor, controls the whole move (§1.15 director rules)
    const dStand = stationOnDeck(st, 50, -15)
    const dir = w.pools.take('director', zone, dStand, T.tMove - 10, DIRECTOR_CAP, `Aircraft director, respot`)
    dir.arriveAt(dStand, T.tMove - 10)
    dir.act('direct', back)
    dir.holdUntil(T.tMove)
    followOnDeck(dir, T.moveSamples, 50, -15, 'direct')
    dir.act('direct')
    dir.holdUntil(T.tArrive + 8)
    dir.act('idle')
    w.pools.release(dir)

    // plane captain: checks the nose, climbs in to ride the brakes, climbs down at the spot
    const pcAt = rel(st, 24, -11)
    const pc = w.pools.take('plane-captain', zone, pcAt, T.tHook, PC_CAP, 'Plane captain (brake rider)')
    pc.arriveAt(pcAt, T.tHook + 8)
    pc.face(st)
    pc.act('check')
    pc.holdUntil(T.tHook + 28)
    pc.walkTo(rel(st, 18, 0), 3) // climbs into the cockpit
    pc.act('watch', st.heading)
    pc.holdUntil(T.tMove)
    pc.follow(T.moveSamples, 18, 0, 'watch') // §3 brown: brake rider in the cockpit on tows
    pc.holdUntil(T.tArrive + 8)
    pc.walkTo(rel(fin, 24, -11), 3)
    pc.act('check', fin.heading)
    pc.holdUntil(T.tParked)
    pc.act('idle')
    w.pools.release(pc)

    // two blue shirts: chains and chocks off, wing walkers, then chock and 6 chains at the spot
    for (const side of [1, -1] as const) {
      const at = rel(st, -4, side * 9)
      const b = w.pools.take('plane-handler', zone, at, T.tHook, HANDLER_CAP)
      b.arriveAt(at, T.tHook + 4)
      b.act('chain', st.heading)
      b.holdUntil(T.tHook + 18)
      b.walkTo(rel(st, 12, side * 9), 4)
      b.act('chock')
      b.holdUntil(T.tHook + 30)
      b.walkTo(rel(st, -5, side * 18), 4)
      b.act('idle', st.heading)
      b.holdUntil(T.tMove)
      followOnDeck(b, T.moveSamples, -5, side * 18, 'walk')
      b.walkTo(rel(fin, 12, side * 9), 4)
      b.act('chock', fin.heading)
      b.holdUntil(T.tArrive + 22)
      b.walkTo(rel(fin, -4, side * 9), 4)
      b.act('chain', fin.heading)
      b.holdUntil(T.tParked)
      b.act('idle')
      w.pools.release(b)
    }

    // white safety observer walks abeam the tail, on whichever side stays on deck at the spot
    const sSide = onDeck(rel(fin, SAFETY_AFT - 2, SAFETY_OUT + 2)) ? 1 : -1
    let sf = safety[0]!
    let sfReady = Infinity
    const sAt = stationOnDeck(st, SAFETY_AFT, sSide * SAFETY_OUT)
    for (const c of safety) {
      const r = c.t + dist(c.pos, sAt) / WALK_SPEED
      if (r < sfReady) {
        sfReady = r
        sf = c
      }
    }
    if (sfReady > T.tMove - 2 && safety.length < SAFETY_HOME.length) {
      // nobody free in time: another observer comes up (one per concurrent tow)
      sf = newSafety(safety.length)
      safety.push(sf)
    }
    sf.arriveAt(sAt, T.tMove - 2)
    sf.act('watch', back)
    sf.holdUntil(T.tMove)
    followOnDeck(sf, T.moveSamples, SAFETY_AFT, sSide * SAFETY_OUT, 'watch')
    sf.act('watch')
    sf.holdUntil(T.tArrive + 10)
    sf.act('idle')
  }
  safety.forEach((c, i) => {
    if (c.t < T_END - 120) c.walkTo(SAFETY_HOME[i]!)
  })

  // ---- servicing in the launch spot ------------------------------------------------------------------------
  const towTo = (slotId: string) => tows.find(t => t.to === slotId)!
  const byParked = (ids: string[]) => ids.slice().sort((a, b) => towTo(a).tParked - towTo(b).tParked)

  // purple: two teams, nozzleman at the jet, station operator at the deck-edge station (§6.4 cold fueling)
  // four teams: at FUEL_S = 300 two teams would still be fuelling the last jets after the scenario ends
  const FUEL_HOMES: Vec2[] = [{ x: 166, y: 113 }, { x: 174, y: 113 }, { x: 276, y: 116 }, { x: 284, y: 116 }]
  const fuelTeams = FUEL_HOMES.map((h, i) => {
    const nozzle = new CrewBuilder(`respot-fuels-${i + 1}a`, 'fuels', 'Fuels nozzleman', h, 90, 'idle', 0)
    const op = new CrewBuilder(`respot-fuels-${i + 1}b`, 'fuels', 'Fuel station operator', { x: h.x + 4, y: h.y + 3 }, 90, 'idle', 0)
    w.crew.push(nozzle, op)
    return { nozzle, op, home: [{ ...nozzle.pos }, { ...op.pos }] as const }
  })
  byParked(FUEL_JOBS).forEach((slotId, j) => {
    const T = towTo(slotId)
    const team = fuelTeams[j % fuelTeams.length]!
    const st = DECK.fuelStations.reduce((a, b) => (dist(a, T.final) <= dist(b, T.final) ? a : b))
    const atJet = rel(T.final, 6, 17)
    const t0 = T.tParked + 10
    team.op.arriveAt(st, t0)
    team.nozzle.arriveAt(st, t0 - dist(st, atJet) / WALK_SPEED - 4)
    team.nozzle.walkTo(atJet)
    const start = Math.max(t0, team.nozzle.t, team.op.t)
    team.nozzle.holdUntil(start).face(T.final)
    team.nozzle.act('fuel')
    team.op.holdUntil(start).face(T.final)
    team.op.act('fuel')
    team.nozzle.holdUntil(start + FUEL_S)
    team.op.holdUntil(start + FUEL_S)
    team.nozzle.walkTo(st)
    team.op.act('idle')
    team.nozzle.act('idle')
    if (j === 0) log.add(start, 'crew', `Grapes cold-fuel ${T.modex} on ${T.to} from station ${st.id}`, { focus: T.final, detail: 'A jet with a fuel hose on it is service-locked: it cannot be moved, and a hose across a lane blocks that lane.' })
  })
  fuelTeams.forEach(team => {
    if (team.nozzle.t < T_END - 60) team.nozzle.walkTo(team.home[0])
    if (team.op.t < T_END - 60) team.op.walkTo(team.home[1])
  })

  // red: one team of three loads weapons on three jets
  const ordHome: Vec2[] = [{ x: 254, y: 112 }, { x: 258, y: 116 }, { x: 262, y: 112 }]
  const ordies = ordHome.map((p, i) => {
    const b = new CrewBuilder(`respot-ordnance-${i + 1}`, 'ordnance', 'Ordnance load team', p, 90, 'idle', 0)
    w.crew.push(b)
    return b
  })
  byParked(ARM_JOBS).forEach((slotId, j) => {
    const T = towTo(slotId)
    const spots = [rel(T.final, -6, 12), rel(T.final, -6, -12), rel(T.final, 8, -14)]
    const t0 = T.tParked + 5
    ordies.forEach((o, i) => o.arriveAt(spots[i]!, t0))
    const start = Math.max(t0, ...ordies.map(o => o.t))
    ordies.forEach(o => {
      o.holdUntil(start).face(T.final)
      o.act('arm')
      o.holdUntil(start + ARM_S)
      o.act('idle')
    })
    if (j === 0) log.add(start, 'crew', `Ordnance loads ${T.modex} on ${T.to}`, { focus: T.final, detail: 'Weapons are loaded but not armed; arming happens on the catapult, with the launch bar in the shuttle.' })
  })
  ordies.forEach((o, i) => {
    if (o.t < T_END - 60) o.walkTo(ordHome[i]!)
  })

  // green: two squadron troubleshooters work gripes on two jets
  const maintHome: Vec2[] = [{ x: 216, y: 112 }, { x: 217, y: 117 }]
  const maint = maintHome.map((p, i) => {
    const b = new CrewBuilder(`respot-maint-${i + 1}`, 'maint', 'Squadron troubleshooter', p, 90, 'idle', 0)
    w.crew.push(b)
    return b
  })
  byParked(MAINT_JOBS).forEach(slotId => {
    const T = towTo(slotId)
    const spots = [rel(T.final, 12, 16), rel(T.final, 12, -16)]
    const t0 = T.tParked + 5
    maint.forEach((m, i) => m.arriveAt(spots[i]!, t0))
    const start = Math.max(t0, ...maint.map(m => m.t))
    maint.forEach(m => {
      m.holdUntil(start).face(T.final)
      m.act('check')
      m.holdUntil(start + MAINT_S)
      m.act('idle')
    })
  })
  maint.forEach((m, i) => {
    if (m.t < T_END - 60) m.walkTo(maintHome[i]!)
  })

  log.add(T_END - 60, 'info', 'Deck spotted for Event N+1. Man aircraft in 45 minutes.', {
    narration: 'cycle-end',
    detail: 'Twelve jets in the launch spot, fuelled, loaded and chained. The cycle repeats: start the go, launch Event N+1, recover Event N.',
  })
  return { lastArrive: Math.max(...tows.map(t => t.tArrive)) }
}
