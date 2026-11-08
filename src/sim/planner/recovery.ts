import type { Pose } from '../../data/deckTypes'
import type { AircraftKeyframe, AircraftStatus, CrewAction, PatternEntity, PatternKeyframe, Vec2 } from '../types'
import { DECK, foulLineY, laPoint, slot as slotOf } from '../../data/deck'
import { dist, headingTo, lerpHeading, offset, taxiPath, type PathPoint } from '../track'
import { LAUNCHERS, RECOVERY, T_FIRST_SHOT, T_GREEN_DECK, T_RECOVERY_COMPLETE, type RecoveryJet } from './scenario'
import { AircraftBuilder, CrewBuilder, RUN_SPEED, VehicleBuilder, WALK_SPEED, rel } from './toolkit'
import type { World } from './world'
import { sampleAircraft } from '../sample'

/**
 * Recovery phase: waist secure and green deck, the Case I passes (traps, one bolter, one foul-deck
 * wave-off), rollout, hook up, the hard right turn with the wings folding on the move, the exit
 * route through the de-arm stop and the Box, up the bow and into the pack, with the LSOs,
 * arresting gear crew, gear puller, director chain, ordnance, blue shirts and plane captains.
 * Also returns the overhead-pattern tracks (nm) for the inset.
 *
 * Follows docs/research/00-DOMAIN-REFERENCE.md: §1.5 wires, §1.15 exit route and director chain,
 * §3 crew stations, §5.2 Case I pattern, §5.3 per-trap steps, §6.1 foul-deck rules, §7 bolter/wave-off.
 */

// ---- touchdown and rollout (§1.4, §1.5, §5.3 steps 11-13) ----------------------------------------------

/** the jet appears this long before touchdown, this far aft of the ramp along the landing centreline */
const GROOVE_VISIBLE_S = 6
const GROOVE_S0 = -1250
/** touchdown aim point, s along the landing centreline (§1.4) */
const TOUCHDOWN_S = 230
/** the hook point is 30 ft aft of the jet reference (mid-length) */
const HOOK_AFT = 30
/** ground speed at touchdown, ft/s (on-speed minus wind over deck) */
const TOUCHDOWN_SPEED = 220
/** hook runout and its duration (§1.5 rated runout: 344 ft in about 2 s; §1.15: about 315 ft) */
const ROLLOUT_FT = 315
const ROLLOUT_S = 2.0
/** rollback so the wire drops out of the hook (§5.3 step 13) */
const ROLLBACK_FT = 5
const ROLLBACK_S = 1.5
/** wire runout ramp duration for the deck renderer */
const WIRE_RUN_S = 1.6

// ---- after the stop (§5.3 steps 14-22) -------------------------------------------------------------------

/** the gear puller walks in to the pilot's 1 o'clock only after the stop (§5.3 step 14), at a fast walk */
const GP_SPEED = 12
const HOOK_UP_AFTER_GP = 0.5 // "hook up" as soon as he is in place
/** hook runners run in only after the jet stops (§3), from the front and side */
const RUNNER_GO_AFTER_STOP = 0.5
const RUNNER_CHECK_S = 3
/** each hand signal (WIRE CLEAR to the gear puller, RETRACT to the deck edge, §5.3 steps 15 and 17) */
const SIGNAL_S = 1.5
/** a hung wire: HOOK DOWN, pull back, HOOK UP; the second runner joins (§5.3 step 15) */
const HUNG_EXTRA_S = 18
const HUNG_PULLBACK_FT = 4
/** hold brakes -> off brakes about a second after WIRE CLEAR (§5.3 step 16) */
const OFF_BRAKES_AFTER_CLEAR = 1
/** wings fold on the move over WING_FOLD (12 s), starting about T+10 (§5.3 step 18) */
const FOLD_S = 12
const FOLD_SPEED = 5.5
const RETRACT_S = 10
/** speed out of the wires and up to the Box, and up the bow centreline (§1.15: 5-7 ft/s) */
const EXIT_SPEED = 6
const BOW_SPEED = 6
/** pause at each director handoff (§1.15 director rules: 0-3 s) */
const HANDOFF_PAUSE = 2
/** de-arm stop hold (§1.15: 30-90 s). 35 s, not 45: a longer hold keeps the next jet's tail across the foul line past the following jet's 1/2 nm decision point */
const DEARM_HOLD = 35
/** the gear puller's follow offset from the jet reference: ahead of the left wingtip */
const GP_FOLLOW: [number, number] = [28, -18]
/** longest a jet waits for the jet ahead before it gives up (keeps the search bounded) */
const MAX_WAIT_S = 120
/** directors stand clear of the folded wingtip (15.25 ft) by 10 ft */
const DIRECTOR_SIDE = 26

// ---- the bow pack (§1.13, §1.15 "spin into the slot ... tractor push for tight spots") ----------------------

/**
 * Bow slots are 63 ft apart fore-aft and 33 ft athwartships, so a jet cannot pivot in its own slot once
 * a neighbour is parked (the pivot circle is 34 ft in radius). It spins in the still-empty row aft
 * of its slot instead and the hot tractor pushes it back, tail first, into the slot.
 */
const SPIN_BACK = 67
const SPIN_RATE = 12
const PUSH_SPEED = 4
const TOW_HOOKUP_S = 5
/** tractor centre ahead of the jet reference while pushing on the tow bar */
const TOW_OFFSET = 44
const TRACTOR_SPEED = 8
const TRACTOR_HOMES: Pose[] = [
  { x: 800, y: 88, heading: -35 },
  { x: 812, y: 80, heading: -35 },
  { x: 824, y: 72, heading: -35 },
]
/** after the stop in the slot: engines run (manned) this long, then shut down (parked) */
const SHUTDOWN_AFTER = 60
const CHOCK_S = 12
const CHAIN_S = 18
const PC_STAY = 70

// ---- route nodes (§1.15) ---------------------------------------------------------------------------------

const BOX_ENTRY: Pose = { x: 700, y: 20, heading: 10 }
/** the jet waits here for the bow; far enough aft that the Four Row spins (x 812) clear it */
const BOX_EXIT: Pose = { x: 745, y: 20, heading: 0 }
const BOW_NODE: Pose = DECK.recoveryRoute[5] ?? { x: 830, y: 8, heading: 0 }
/** where a jet waits, out of the Box lane, when its slot must wait for a later jet (B4C behind B3C) */
const SIDE_HOLD: Pose = { x: 725, y: 58, heading: 0 }
/** out of the side hold forward-starboard of the Box, so a jet waiting in the Box is not in the way */
const SIDE_EXIT: Pose = { x: 785, y: 52, heading: -20 }

// ---- crew stations (§3, §1.15) ---------------------------------------------------------------------------

const ST = DECK.stations
const LSO_START: Vec2 = { x: 40, y: -66 }
const LSO_LEAVE = T_GREEN_DECK - 120
const AG_MUSTER: Vec2 = { x: 250, y: 124 }
const AG_WALK = 782
const RECOVERY_CREW_WALK = 790
/** static directors, offset from the §1.15 nodes so the jets pass them on the left at DIRECTOR_SIDE */
const FLY2_DIRECTOR: Vec2 = { x: 690, y: -32 }
const BOX_DIRECTOR: Vec2 = { x: 745, y: -8 }
// starboard of the foul line, outside the must-be-clear landing area (§1.4, §6.1), 50 ft port of the Box lane
const BOW_DIRECTOR_HOME: Vec2 = { x: 770, y: -45 }
/** de-arm crew muster by the empty SP3 spot, starboard of the exit lane, so they never cross it */
const ORD_MUSTER: Vec2[] = [{ x: 570, y: 30 }, { x: 578, y: 30 }]
const DEARM_WORK_S = 25
/** waist secure (§5.3 P2) */
const WAIST_SECURE_START = 775
const WAIST_CATWALK_Y = -136
/** after the shooters' checks, launch crew still standing in the LA or the bow lanes walk clear */
const LAUNCH_CREW_CLEAR = 782

// ---- pattern (§5.2), nautical miles, ship at the origin ----------------------------------------------------

const NM = 6076
const RAMP_NM: Vec2 = { x: -546 / NM, y: 18.6 / NM }
const FINAL_DEG = DECK.landingArea.angleDeg
const GROOVE_NM = 0.75
const INITIAL_START: Vec2 = { x: -3, y: 0.2 }
const BREAK_POINT: Vec2 = { x: 0.2, y: 0.1 }
const DOWNWIND_Y = -1.2
const ABEAM_X = -0.2
const NINETY_X = -1.2
const STACK_CENTRE: Vec2 = { x: 1.0, y: -1.5 }
const STACK_R = 1.5
const STACK_ORBIT_S = 136 // 9.4 nm at about 250 kt
const STACK_START = Math.max(0, T_GREEN_DECK - 200)
const ALT = { stack: 2000, initial: 800, pattern: 600, ninety: 450, wake: 370 }
/** backward from touchdown T: groove T-18, ninety T-30, the 180 at T-45, downwind from T-61, break T-75, initial T-100 */
const P_GROOVE = 18
const P_NINETY = 30
const P_ABEAM = 45
const P_DOWNWIND = 61
const P_BREAK = 75
const P_INITIAL = 100
const P_LEAVE_STACK = 130
/** bolter / wave-off: climb straight ahead this far before the left turn downwind */
const BOLTER_UPWIND_NM = 1.4
const DEPARTURE_S = 45

// ---- helpers ------------------------------------------------------------------------------------------

const LA_HDG = DECK.landingArea.angleDeg
const laPose = (s: number, right = 0): Pose => ({ ...laPoint(s, right), heading: LA_HDG })
const tailOf = (p: Pose): Vec2 => offset(p, p.heading, -HOOK_AFT, 0)
/** both aft corners of the folded footprint (60.3 x 30.5) are starboard of the foul line (§6.1: tail or wingtip across = foul deck) */
const FOLDED_HALF_W = 15.25
const tailClear = (p: Pose): boolean =>
  [offset(p, p.heading, -HOOK_AFT, FOLDED_HALF_W), offset(p, p.heading, -HOOK_AFT, -FOLDED_HALF_W)].every(c => c.y > foulLineY(c.x))
const refAcross = (p: Pose): boolean => p.y > foulLineY(p.x)
const ON_DECK = new Set<AircraftStatus>(['parked', 'manned', 'taxiing', 'towed'])
const ACCEL = 1.2

interface Profile {
  pts: PathPoint[]
  times: number[]
}

/** A continuous path through several poses with a trapezoidal speed profile (v0 -> vmax -> v1). */
function profile(from: Pose, legs: Pose[], vmax: number, v0: number, v1: number): Profile {
  const pts: PathPoint[] = []
  let p = from
  for (const leg of legs) {
    const seg = taxiPath(p, p.heading, leg, leg.heading, 20, 0.35)
    if (pts.length) seg.shift()
    pts.push(...seg)
    p = leg
  }
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1]! + dist(pts[i - 1]!, pts[i]!))
  const L = cum[cum.length - 1]!
  const v = (s: number) => Math.max(0.4, Math.min(vmax, Math.sqrt(v0 * v0 + 2 * ACCEL * s), Math.sqrt(v1 * v1 + 2 * ACCEL * Math.max(0, L - s))))
  const times = [0]
  for (let i = 1; i < pts.length; i++) times.push(times[i - 1]! + (cum[i]! - cum[i - 1]!) / ((v(cum[i - 1]!) + v(cum[i]!)) / 2))
  return { pts, times }
}

/** Drive the jet along a profile from its cursor; status per keyframe from statusOf. Returns arrival time. */
function drive(ab: AircraftBuilder, legs: Pose[], vmax: number, v0: number, v1: number, statusOf: (p: Pose) => AircraftStatus): number {
  const pr = profile(ab.pose, legs, vmax, v0, v1)
  const t0 = ab.t
  for (let i = 1; i < pr.pts.length; i++) {
    const q = pr.pts[i]!
    ab.pose = { x: q.x, y: q.y, heading: q.heading }
    ab.status = statusOf(ab.pose)
    ab.key(t0 + pr.times[i]!)
  }
  return ab.t
}

/** Smooth straight move (push-back): smoothstep in time, heading held. */
function moveSmooth(ab: AircraftBuilder, to: Vec2, seconds: number): void {
  const from = { ...ab.pose }
  const t0 = ab.t
  const n = Math.max(2, Math.ceil(seconds))
  for (let i = 1; i <= n; i++) {
    const u0 = i / n
    const u = u0 * u0 * (3 - 2 * u0)
    ab.pose = { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u, heading: from.heading }
    ab.key(t0 + (seconds * i) / n)
  }
}

/** Pose of a keyframe track at time t (linear, shortest-arc heading). */
function poseAt(kf: readonly AircraftKeyframe[], t: number): Pose {
  let a = kf[0]!
  for (let i = 1; i < kf.length; i++) {
    const b = kf[i]!
    if (b.t >= t) {
      const u = b.t > a.t ? (t - a.t) / (b.t - a.t) : 1
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, heading: lerpHeading(a.heading, b.heading, u) }
    }
    a = b
  }
  return { x: a.x, y: a.y, heading: a.heading }
}

/** First time at or after kf[i0] when pred holds (sampled every 0.25 s). */
function firstTime(kf: readonly AircraftKeyframe[], i0: number, pred: (p: Pose) => boolean): number {
  const t0 = kf[i0]!.t
  const t1 = kf[kf.length - 1]!.t
  for (let t = t0; t <= t1 + 1e-6; t += 0.25) if (pred(poseAt(kf, t))) return t
  return Infinity
}

/** Index of the last keyframe at or before t. */
function indexAt(kf: readonly AircraftKeyframe[], t: number): number {
  let i = 0
  while (i + 1 < kf.length && kf[i + 1]!.t <= t + 1e-6) i++
  return i
}

function inPolygon(p: Vec2, poly: readonly Vec2[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!
    const b = poly[j]!
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

/** Static crew whose actions are collected per pass, then written in time order. */
interface ActItem {
  t0: number
  t1: number
  action: CrewAction
  heading?: number
}

class Acts {
  private items: ActItem[] = []
  constructor(readonly b: CrewBuilder, private readonly rest: CrewAction, private readonly restHeading?: number) {}
  add(t0: number, t1: number, action: CrewAction, heading?: number): ActItem {
    const it = { t0, t1, action, heading }
    this.items.push(it)
    return it
  }
  flush(): void {
    const b = this.b
    for (const it of this.items.sort((p, q) => p.t0 - q.t0)) {
      if (it.t1 <= b.t + 1e-6) continue
      b.holdUntil(it.t0)
      b.act(it.action, it.heading)
      b.holdUntil(it.t1)
      b.act(this.rest, this.restHeading)
    }
  }
}

const typeName = (R: RecoveryJet) => (R.type === 'EA18G' ? 'EA-18G Growler' : R.type === 'FA18F' ? 'F/A-18F Super Hornet' : 'F/A-18E Super Hornet')

// ---- traffic: jets keep apart (a jet waits for the one ahead, §1.15 director rules) ---------------------------

const HALF_LEN = 30.15
const HALF_FOLDED = 15.25
const HALF_SPREAD = 22.45
const CLEARANCE = 1.5
const TRAFFIC_DT = 0.5
const TRAFFIC_END = 2400
const onDeck = (s: AircraftStatus) => s !== 'airborne' && s !== 'groove' && s !== 'bolter' && s !== 'waveoff'

interface Footprint {
  x: number
  y: number
  h: number
  hw: number
}

/** Footprints on the TRAFFIC_DT grid from k0 to k1 (indices), null while off the deck. */
function footprints(kf: readonly AircraftKeyframe[], k0: number, k1: number): (Footprint | null)[] {
  const out: (Footprint | null)[] = []
  let i = 0
  const first = kf[0]
  for (let k = k0; k <= k1; k++) {
    const t = k * TRAFFIC_DT
    if (!first || t < first.t) {
      out.push(null)
      continue
    }
    while (i + 1 < kf.length && kf[i + 1]!.t <= t) i++
    const a = kf[i]!
    const b = kf[i + 1] ?? a
    const u = b.t > a.t ? Math.min(1, (t - a.t) / (b.t - a.t)) : 0
    const st = u < 1 ? a.status : b.status
    if (!onDeck(st)) {
      out.push(null)
      continue
    }
    out.push({
      x: a.x + (b.x - a.x) * u,
      y: a.y + (b.y - a.y) * u,
      h: lerpHeading(a.heading, b.heading, u),
      hw: a.wings === 'spread' || b.wings === 'spread' ? HALF_SPREAD : HALF_FOLDED,
    })
  }
  return out
}

/** Footprint parts (centre offset along the axis, half length, half width): folded = one box; spread = fuselage and tails plus the wing. */
const PARTS_FOLDED = [{ c: 0, hl: HALF_LEN, hw: HALF_FOLDED }]
const PARTS_SPREAD = [
  { c: 0, hl: HALF_LEN, hw: 11 },
  { c: -3, hl: 9, hw: HALF_SPREAD },
]

function boxOverlap(a: { x: number; y: number; h: number; hl: number; hw: number }, b: { x: number; y: number; h: number; hl: number; hw: number }): boolean {
  const corners = (f: typeof a) => {
    const r = (f.h * Math.PI) / 180
    const c = Math.cos(r)
    const s = Math.sin(r)
    const L = f.hl + CLEARANCE / 2
    const W = f.hw + CLEARANCE / 2
    return [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([u, v]) => ({ x: f.x + c * u! * L - s * v! * W, y: f.y + s * u! * L + c * v! * W }))
  }
  const A = corners(a)
  const B = corners(b)
  for (const f of [a, b]) {
    for (const ang of [f.h, f.h + 90]) {
      const r = (ang * Math.PI) / 180
      const ax = Math.cos(r)
      const ay = Math.sin(r)
      const pa = A.map(v => v.x * ax + v.y * ay)
      const pb = B.map(v => v.x * ax + v.y * ay)
      if (Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa)) return false
    }
  }
  return true
}

function overlaps(p: Footprint, q: Footprint): boolean {
  if (Math.hypot(p.x - q.x, p.y - q.y) > 2 * Math.hypot(HALF_LEN, HALF_SPREAD) + CLEARANCE) return false
  const parts = (f: Footprint) =>
    (f.hw > HALF_FOLDED ? PARTS_SPREAD : PARTS_FOLDED).map(k => ({ ...offset(f, f.h, k.c, 0), h: f.h, hl: k.hl, hw: k.hw }))
  for (const a of parts(p)) for (const b of parts(q)) if (boxOverlap(a, b)) return true
  return false
}

class Traffic {
  private cache = new Map<AircraftBuilder, { n: number; tLast: number; frames: (Footprint | null)[] }>()
  constructor(private readonly all: () => Iterable<AircraftBuilder>) {}
  private framesOf(ab: AircraftBuilder): (Footprint | null)[] {
    const c = this.cache.get(ab)
    if (c && c.n === ab.kf.length && c.tLast === ab.t) return c.frames
    const frames = footprints(ab.kf, 0, Math.round(TRAFFIC_END / TRAFFIC_DT))
    this.cache.set(ab, { n: ab.kf.length, tLast: ab.t, frames })
    return frames
  }
  /** true if ab's track between t0 and t1 keeps clear of every other jet on deck */
  clear(ab: AircraftBuilder, t0: number, t1: number): boolean {
    return this.blocker(ab, t0, t1) === null
  }
  /** the first jet (and time) in ab's way between t0 and t1, or null */
  blocker(ab: AircraftBuilder, t0: number, t1: number): { id: string; t: number } | null {
    const k0 = Math.ceil(t0 / TRAFFIC_DT)
    const k1 = Math.min(Math.floor(t1 / TRAFFIC_DT), Math.round(TRAFFIC_END / TRAFFIC_DT))
    const mine = footprints(ab.kf, k0, k1)
    for (const other of this.all()) {
      if (other === ab) continue
      const theirs = this.framesOf(other)
      for (let k = k0; k <= k1; k++) {
        const m = mine[k - k0]
        const o = theirs[k]
        if (m && o && overlaps(m, o)) return { id: other.id, t: k * TRAFFIC_DT }
      }
    }
    return null
  }
}

interface Snap {
  n: number
  pose: Pose
  wings: AircraftBuilder['wings']
  status: AircraftStatus
  hook: boolean
  launchBar: boolean
  power: 0 | 1 | 2
}
const snap = (ab: AircraftBuilder): Snap => ({ n: ab.kf.length, pose: { ...ab.pose }, wings: ab.wings, status: ab.status, hook: ab.hook, launchBar: ab.launchBar, power: ab.power })
function restore(ab: AircraftBuilder, s: Snap): void {
  ab.kf.length = s.n
  ab.pose = { ...s.pose }
  ab.wings = s.wings
  ab.status = s.status
  ab.hook = s.hook
  ab.launchBar = s.launchBar
  ab.power = s.power
}

interface Pass {
  R: RecoveryJet
  idx: number
  T: number
  kind: 'trap' | 'bolter' | 'waveoff'
}

interface BowJob {
  R: RecoveryJet
  ab: AircraftBuilder
  /** the jet whose bow leg must finish first (same column, forward slot, traps later) */
  after?: string
  /** the Box director's 'direct' interval for this jet, extended to the moment it leaves the Box */
  boxItem?: ActItem
}

// ---- builder ------------------------------------------------------------------------------------------

export function buildRecovery(w: World): PatternEntity[] {
  const { log, eq } = w
  const preCrew = [...w.crew]

  const mk = (id: string, role: CrewBuilder['role'], label: string, p: Vec2, heading = 0, action: CrewAction = 'idle') => {
    const b = new CrewBuilder(id, role, label, p, heading, action)
    w.crew.push(b)
    return b
  }

  // ---- aircraft: Event N-1, airborne until the groove -----------------------------------------------
  for (const R of RECOVERY) {
    const ab = new AircraftBuilder(R.modex, R.type, R.modex, R.squadron, 1, laPose(GROOVE_S0), 'spread', 'airborne', 0)
    w.aircraft.set(R.modex, ab)
  }

  // ---- waist secure and recovery stations (§5.3 P1-P4) ---------------------------------------------------
  eq.deck(0, 'red')

  // launch crew left standing inside the landing area or the bow lanes walk clear
  const bowLanes = (p: Vec2) => p.x >= 560 && p.y > -70 && p.y < 75
  let laCount = 0
  let bowCount = 0
  for (const b of preCrew) {
    if (!/^(cat\d|bow-|waist-)/.test(b.id)) continue
    const inLA = inPolygon(b.pos, DECK.landingArea.polygon)
    if (!inLA && !bowLanes(b.pos)) continue
    b.holdUntil(Math.max(b.t, LAUNCH_CREW_CLEAR + (inLA ? laCount : bowCount) * 1.5))
    if (inLA) {
      const k = laCount++
      b.walkTo({ x: 470 + (k % 8) * 6, y: WAIST_CATWALK_Y - 2 - Math.floor(k / 8) * 4 })
      b.act('idle', 90)
    } else {
      const k = bowCount++
      b.walkTo({ x: 540 + (k % 12) * 6, y: 125 + Math.floor(k / 12) * 4 })
      b.act('idle', -90)
    }
  }

  // waist secure: shuttles aft, JBDs flush, then clear to the port catwalk (§5.3 P2)
  const c3 = DECK.catapults[2]!
  const c4 = DECK.catapults[3]!
  const waistChecks: Vec2[] = [
    offset(c3.start, c3.heading, -59, 0),
    c3.start,
    offset(c4.start, c4.heading, -59, 0),
    c4.start,
  ]
  waistChecks.forEach((p, i) => {
    const start = { x: 450 + i * 6, y: WAIST_CATWALK_Y - 2 }
    const b = mk(`waist-secure-${i + 1}`, 'cat-crew', 'Waist catapult crew (securing for recovery)', start, 90, 'idle')
    b.holdUntil(WAIST_SECURE_START + i * 2)
    b.walkTo({ x: ST.waistBubble!.x + (i - 1.5) * 5, y: ST.waistBubble!.y + 4 })
    b.walkTo({ x: p.x, y: p.y + (i % 2 ? 6 : -6) })
    b.act('check', 0)
    b.wait(10)
    b.walkTo({ x: 380 + i * 18, y: WAIST_CATWALK_Y })
    b.act('watch', 90)
  })
  log.add(WAIST_SECURE_START + 10, 'crew', 'Waist secure: shuttles aft, JBDs 3 and 4 flush, the bubble down and locked.', {
    focus: ST.waistBubble,
    detail: 'The waist catapults lie inside the landing area. The crew checks every track and panel, then clears to the port catwalk; the waist cat officer signals the arresting gear officer with an arm overhead.',
  })

  // LSOs walk along the port deck edge to the platform (§3 white)
  const lsoLabels = ['Controlling LSO', 'Backup LSO', 'Deck-status LSO', 'LSO writer']
  const lsoSpots: Vec2[] = [
    { x: 126, y: -70 },
    { x: 122, y: -72 },
    { x: 130, y: -73 },
    { x: 125, y: -76 },
  ]
  const lsos = lsoLabels.map((label, i) => {
    const b = mk(`lso-${i + 1}`, 'lso', label, { x: LSO_START.x - i * 4, y: LSO_START.y }, 0, 'idle')
    b.holdUntil(LSO_LEAVE + i * 2)
    b.walkTo({ x: 100, y: -69 })
    b.walkTo(lsoSpots[i]!)
    b.act('watch', 171)
    return b
  })
  const lsoCtl = new Acts(lsos[0]!, 'watch', 171)

  // arresting gear crew (§3 green "A"): AGO, deck-edge operator, topside PO, checkers, hook runners
  const ago = mk('ago', 'director', 'Arresting gear officer', { x: AG_MUSTER.x + 20, y: AG_MUSTER.y }, -90, 'idle')
  ago.holdUntil(AG_WALK).walkTo(ST.ago!)
  ago.act('watch', -150)
  const agoActs = new Acts(ago, 'watch', -150)

  const agEdge = mk('ag-deck-edge', 'ag-crew', 'Arresting gear deck-edge operator', { x: AG_MUSTER.x + 12, y: AG_MUSTER.y + 2 }, -90, 'idle')
  agEdge.holdUntil(AG_WALK).walkTo(ST.agDeckEdge!)
  agEdge.act('watch', -150)
  const agEdgeActs = new Acts(agEdge, 'watch', -150)

  const agStations: { id: string; label: string; p: Vec2 }[] = [
    { id: 'ag-topside', label: 'Arresting gear topside petty officer', p: ST.agTopside! },
    { id: 'ag-checker-1', label: 'Arresting gear deck checker', p: { x: 182, y: 44 } },
    { id: 'ag-checker-2', label: 'Arresting gear deck checker', p: { x: 302, y: 26 } },
  ]
  agStations.forEach((s, i) => {
    const b = mk(s.id, 'ag-crew', s.label, { x: AG_MUSTER.x - 8 - i * 6, y: AG_MUSTER.y }, -90, 'idle')
    b.holdUntil(AG_WALK + 2 + i * 2).walkTo(s.p)
    b.act('watch', -120)
  })

  const runnerA = mk('hook-runner-a', 'ag-crew', 'Hook runner', { x: AG_MUSTER.x - 30, y: AG_MUSTER.y + 2 }, -90, 'idle')
  const runnerB = mk('hook-runner-b', 'ag-crew', 'Hook runner (second)', { x: AG_MUSTER.x - 36, y: AG_MUSTER.y + 2 }, -90, 'idle')
  for (const [r, st] of [[runnerA, ST.hookRunnerA!], [runnerB, ST.hookRunnerB!]] as const) {
    r.holdUntil(AG_WALK).walkTo({ x: 330, y: 30 })
    r.walkTo(st)
    r.act('watch', -150)
  }

  // the gear puller (landing-area director) and the static directors of the exit route (§1.15)
  const gpPre = ST.gearPullerPre!
  const gp = mk('gear-puller', 'director', 'Gear puller (landing-area director)', { x: 600, y: 123 }, -90, 'idle')
  gp.holdUntil(RECOVERY_CREW_WALK).walkTo(gpPre)
  gp.act('watch', 171)

  const fly2 = mk('fly2-director', 'director', 'Fly 2 director', { x: 640, y: 123 }, -90, 'idle')
  fly2.holdUntil(RECOVERY_CREW_WALK + 2).walkTo(FLY2_DIRECTOR)
  fly2.act('watch', 200)
  const fly2Acts = new Acts(fly2, 'watch', 200)

  const boxDir = mk('box-director', 'director', 'Box director', { x: 748, y: 118 }, -90, 'idle')
  boxDir.holdUntil(RECOVERY_CREW_WALK + 4).walkTo(BOX_DIRECTOR)
  boxDir.act('watch', 180)
  const boxActs = new Acts(boxDir, 'watch', 180)

  const bowDir = mk('bow-director', 'director', 'Fly 1 bow director', { x: 840, y: 66 }, -90, 'idle')
  bowDir.holdUntil(RECOVERY_CREW_WALK + 6).walkTo(BOW_DIRECTOR_HOME)
  bowDir.act('watch', 180)

  // de-arm crew (§3 red "CA")
  const ordies = ORD_MUSTER.map((p, i) => {
    const b = mk(`dearm-${i + 1}`, 'ordnance', 'De-arm crew (ordnance)', { x: 690 + i * 8, y: 124 }, -90, 'idle')
    b.holdUntil(RECOVERY_CREW_WALK + 10 + i * 2).walkTo(p)
    b.act('watch', 180)
    return b
  })

  // green deck (§5.3 P3-P4)
  log.add(T_GREEN_DECK - 15, 'crew', 'AGO: "Gear manned and ready." Pendants set, sheaves up, crews manned.', {
    focus: ST.ago,
    detail: 'The arresting gear officer runs the pre-recovery checklist: catapult gear clear of the landing area, every aircraft inside the safe-parking line, the LSO platform manned.',
  })
  eq.deck(T_GREEN_DECK, 'green')
  agoActs.add(T_GREEN_DECK - 1, T_GREEN_DECK + 2, 'direct')
  log.add(T_GREEN_DECK, 'deck', '99, Charlie. Land aircraft.', {
    focus: DECK.landingArea.aimPoint,
    narration: 'green-deck',
    detail: 'The Air Boss turns the deck light green. The first division is already in the break; the first jet should be in the groove as the deck goes green.',
  })

  // ---- passes ------------------------------------------------------------------------------------------
  const passes: Pass[] = []
  RECOVERY.forEach((R, idx) => {
    if (R.outcome === 'trap') passes.push({ R, idx, T: R.touchdown, kind: 'trap' })
    else {
      passes.push({ R, idx, T: R.touchdown, kind: R.outcome === 'bolter-then-trap' ? 'bolter' : 'waveoff' })
      passes.push({ R, idx, T: R.secondPass ?? R.touchdown + 150, kind: 'trap' })
    }
  })
  passes.sort((a, b) => a.T - b.T)
  const lastTrapT = Math.max(...passes.filter(p => p.kind === 'trap').map(p => p.T))

  let trapNo = 0
  const pending = new Map<string, BowJob>()
  let bowFree = 0
  let gpFreeAt = 0
  const tractors: VehicleBuilder[] = []
  const traffic = new Traffic(() => w.aircraft.values())
  const firstArmed = { done: false }

  for (const P of passes) {
    const { R, T } = P
    const ab = w.aircraft.get(R.modex)!

    // -- the groove: appear 6 s out ----------------------------------------------------------------------
    ab.jumpTo(laPose(GROOVE_S0))
    ab.holdUntil(T - GROOVE_VISIBLE_S)
    // the controlling LSO holds the pickle up through the groove; on a wave-off it is squeezed at the half-mile point
    if (P.kind === 'waveoff') lsoCtl.add(T - P_GROOVE, T - 15, 'pickle')
    else lsoCtl.add(T - P_GROOVE, T, 'pickle')

    if (P.kind === 'waveoff') {
      // foul deck at the 1/2 nm point: the previous jet's tail is still across the foul line (§6.1, §7)
      ab.change({ status: 'waveoff', hook: true, power: 2, wings: 'spread' })
      ab.moveStraight(laPoint(1050), 9.5, LA_HDG)
      ab.depart()
      lsoCtl.add(T - 15, T - 11, 'wave-off')
      log.add(T - 15, 'waveoff', `Wave off, foul deck — ${R.modex}`, {
        focus: DECK.landingArea.aimPoint,
        narration: 'waveoff',
        detail: `The jet ahead is still across the foul line when ${R.modex} reaches about half a mile (about 15 s to touchdown), so the controlling LSO hits the pickle: red wave-off lights. A foul-deck wave-off is not graded; the jet climbs straight ahead and comes back round in about two minutes.`,
      })
      continue
    }

    ab.change({ status: 'groove', hook: true, power: 1, wings: 'spread' })
    ab.moveStraight(laPoint(TOUCHDOWN_S), GROOVE_VISIBLE_S, LA_HDG)
    eq.deck(T, 'foul')
    agoActs.add(T, T + 2, 'direct')
    agEdgeActs.add(T - 18, T - 16, 'direct')

    if (P.kind === 'bolter') {
      // hook skip: already at MIL, full power and off the angle (§7)
      ab.change({ status: 'bolter', power: 2 })
      ab.moveStraight(laPoint(600), 1.7, LA_HDG)
      ab.moveStraight(laPoint(796 + 200), 1.6, LA_HDG)
      ab.depart()
      eq.deck(T + 6, 'green')
      agoActs.add(T + 6, T + 8, 'direct')
      log.add(T, 'bolter', `Bolter, bolter, bolter — ${R.modex} goes around`, {
        focus: laPoint(400),
        narration: 'bolter',
        detail: 'The hook skipped over the wires. The pilot went to full power at touchdown, as on every pass, so the jet simply flies off the angle and re-enters the downwind. There is no wire to retract, so the deck is clear again in seconds.',
      })
      continue
    }

    // -- trap ------------------------------------------------------------------------------------------
    trapNo++
    // §6.1: at touchdown no jet that has crossed the foul line may still have a tail corner across it
    for (const o of w.aircraft.values()) {
      const q = o === ab ? null : sampleAircraft(o.build(), T)
      if (q?.visible && ON_DECK.has(q.status) && refAcross(q) && !tailClear(q)) throw new Error(`recovery: ${o.modex} fouls the landing area at the ${R.modex} touchdown (t=${T})`)
    }
    const wire = DECK.wires[R.wire - 1]!
    const sEngage = wire.s + HOOK_AFT
    const tEngage = T + (sEngage - TOUCHDOWN_S) / TOUCHDOWN_SPEED
    ab.moveStraight(laPoint(sEngage), tEngage - T, LA_HDG)
    ab.change({ status: 'trap' })
    ab.moveStraight(laPoint(sEngage + ROLLOUT_FT), ROLLOUT_S, LA_HDG, 'out')
    ab.moveStraight(laPoint(sEngage + ROLLOUT_FT - ROLLBACK_FT), ROLLBACK_S, LA_HDG)
    ab.change({ power: 0 })
    const stop: Pose = laPose(sEngage + ROLLOUT_FT - ROLLBACK_FT)
    eq.wire(R.wire, tEngage, 1, WIRE_RUN_S)
    const hung = !!R.hungWire
    const extra = hung ? HUNG_EXTRA_S : 0
    // §5.3 steps 14-17 in order: the jet stops; only then the gear puller walks in (hook up) and the hook runner
    // sprints in; the runner checks the hook, gives WIRE CLEAR to the gear puller, then RETRACT to the deck edge.
    const tStop = ab.t
    const post = rel(stop, 60, 18)
    const tGpIn = Math.max(gp.t, gpFreeAt, tStop) + dist(gp.pos, post) / GP_SPEED
    const hookPos = offset(stop, stop.heading, -HOOK_AFT - 5, 6)
    const tRunnerIn = Math.max(runnerA.t, tStop + RUNNER_GO_AFTER_STOP) + dist(runnerA.pos, hookPos) / RUN_SPEED
    const tWireClear = tRunnerIn + RUNNER_CHECK_S + extra
    const tRetract = tWireClear + SIGNAL_S
    ab.holdUntil(tGpIn + HOOK_UP_AFTER_GP).change({ hook: false })
    if (hung) {
      // HOOK DOWN, pull back, HOOK UP
      const tDown = tRunnerIn + RUNNER_CHECK_S
      ab.holdUntil(tDown).change({ hook: true })
      ab.holdUntil(tDown + 3)
      ab.moveStraight(laPoint(sEngage + ROLLOUT_FT - ROLLBACK_FT - HUNG_PULLBACK_FT), 3, LA_HDG)
      ab.holdUntil(tDown + 10).change({ hook: false })
    }

    eq.wire(R.wire, tRetract, 0, RETRACT_S)
    agEdgeActs.add(tRetract, tRetract + 2, 'direct')

    // -- off brakes, hard right turn, fold on the move (§5.3 steps 16-19), out through the de-arm stop to the Box --------
    const later = RECOVERY.find(K => {
      if (K === R) return false
      const ks = slotOf(K.slot)
      const js = slotOf(R.slot)
      const kT = K.secondPass ?? K.touchdown
      return Math.abs(ks.y - js.y) < 1 && ks.x > js.x && kT > T
    })
    const sideHold = !!later
    // every jet stops at the de-arm stop (SP1, §1.13): armed jets for the de-arm, the others only while the Box is busy
    const goal: Pose = DECK.dearmStop
    const horizon = () => Math.max(...[...w.aircraft.values()].filter(o => o !== ab).map(o => o.t)) + 5
    let status: AircraftStatus = 'rollout'
    const statusOf = (p: Pose): AircraftStatus => {
      if (status === 'rollout' && tailClear(p)) status = 'taxiing'
      return status
    }
    const sA = snap(ab)
    let tOff = tWireClear + OFF_BRAKES_AFTER_CLEAR
    let iMove = 0
    let tDearm0 = 0
    // a jet still being de-armed holds the next one in the wires for a few seconds (the director stops it)
    for (let attempt = 0; attempt <= MAX_WAIT_S; attempt++) {
      restore(ab, sA)
      status = 'rollout'
      tOff = tWireClear + OFF_BRAKES_AFTER_CLEAR + attempt
      ab.holdUntil(tOff)
      iMove = ab.kf.length - 1
      const p1Base = rel(stop, 14, 8)
      const h1 = headingTo(p1Base, goal)
      const p1: Pose = { ...p1Base, heading: h1 }
      ab.status = 'rollout'
      drive(ab, [p1], FOLD_SPEED, 0, FOLD_SPEED, statusOf)
      const foldLen = Math.min(FOLD_SPEED * FOLD_S, dist(p1, goal) - 14)
      const p2: Pose = { ...rel(p1, foldLen, 0), heading: h1 }
      ab.pose = p2
      ab.wings = 'folded'
      ab.status = statusOf(p2)
      ab.key(ab.t + FOLD_S)
      drive(ab, [goal], EXIT_SPEED, FOLD_SPEED, 0, statusOf)
      tDearm0 = ab.t
      if (traffic.clear(ab, tOff, horizon())) break
    }
    const tDearm1 = R.armed ? tDearm0 + DEARM_HOLD : tDearm0 + HANDOFF_PAUSE
    const sB = snap(ab)
    let tB = tDearm1
    let iBox = 0
    let tBoxArrive = 0
    for (let attempt = 0; attempt < 400; attempt++, tB += 1) {
      restore(ab, sB)
      ab.holdUntil(tB)
      iBox = ab.kf.length - 1
      drive(ab, sideHold ? [SIDE_HOLD] : [BOX_ENTRY, BOX_EXIT], EXIT_SPEED, 0, 0, statusOf)
      tBoxArrive = ab.t
      if (traffic.clear(ab, tB, horizon())) break
    }

    // the tail clears the foul line: the landing area is clear once the wire is back too
    const tTail = firstTime(ab.kf, iMove, tailClear)
    const tAcross = firstTime(ab.kf, iMove, refAcross)

    // -- gear puller: hook up, walk the jet out, hand off at the foul line, back for the next one ----------------------
    gp.holdUntil(Math.max(gp.t, gpFreeAt, tStop))
    gp.walkTo(post, GP_SPEED)
    gp.act('direct', headingTo(post, stop))
    ab.handTo(gp.id, gp.t)
    const iAcross = indexAt(ab.kf, tAcross)
    const followFrom = ab.kf.slice(iMove, iAcross + 1)
    const startPose = poseAt(ab.kf, tOff)
    const gpStart = offset(startPose, startPose.heading, GP_FOLLOW[0], GP_FOLLOW[1])
    gp.holdUntil(tOff - 1.5)
    gp.walkTo(gpStart, 12)
    gp.follow(followFrom, GP_FOLLOW[0], GP_FOLLOW[1], 'direct')
    // at the foul line: a point at the Fly 2 director, who has the jet from here
    gp.act('pass', headingTo(gp.pos, FLY2_DIRECTOR))
    gp.holdUntil(gp.t + 1.5)
    gp.act('idle')
    ab.handTo(fly2.id, tAcross)
    // clear deck forward as soon as the tail is across and the wire is back, then back to his spot
    const tClearFwd = Math.max(gp.t, tTail + 0.5, tRetract + RETRACT_S - 2)
    const tGreen = tClearFwd + 2
    gp.holdUntil(tClearFwd).act('direct', headingTo(gp.pos, ST.ago!))
    gp.holdUntil(tGreen).act('idle')
    gp.walkTo(gpPre, RUN_SPEED)
    gp.act('watch', 171)
    gpFreeAt = tGreen
    eq.deck(tGreen, 'green')
    agoActs.add(tGreen, tGreen + 2, 'direct')

    // -- hook runner(s): sprint in after the stop, WIRE CLEAR, RETRACT, sprint back (§5.3 steps 15-17) ------------------
    runnerA.holdUntil(tStop + RUNNER_GO_AFTER_STOP)
    runnerA.walkTo(hookPos, RUN_SPEED)
    runnerA.act('check', headingTo(hookPos, tailOf(stop)))
    runnerA.holdUntil(tWireClear)
    runnerA.act('direct', headingTo(hookPos, post)) // WIRE CLEAR to the gear puller (vertical arm)
    runnerA.holdUntil(tRetract)
    runnerA.act('direct', headingTo(hookPos, ST.agDeckEdge!)) // RETRACT to the deck-edge operator
    runnerA.wait(SIGNAL_S)
    runnerA.walkTo(ST.hookRunnerA!, RUN_SPEED)
    runnerA.act('watch', -150)
    if (hung) {
      const posB = offset(stop, stop.heading, -HOOK_AFT - 6, -7)
      runnerB.holdUntil(tStop + RUNNER_GO_AFTER_STOP + 3)
      runnerB.walkTo(posB, RUN_SPEED)
      runnerB.act('check', headingTo(posB, tailOf(stop)))
      runnerB.holdUntil(tWireClear)
      runnerB.walkTo(ST.hookRunnerB!, RUN_SPEED)
      runnerB.act('watch', -150)
      log.add(tRunnerIn, 'crew', `Hung wire on ${R.modex}: "Hook down, pull back, hook up."`, {
        focus: tailOf(stop),
        detail: 'The pendant has not dropped out of the hook. The hook runner signals the pilot through the gear puller to lower the hook and roll back, a second runner joins, and the wire is cleared. Every second here is a second the landing area stays foul.',
      })
    }

    // (the Fly 2 director's signals are written with the Box director's below, once the Box entry time is known)

    // -- de-arm (§1.15, §5.3 step 21): the crew approach from the side and aft ----------------------------------------
    if (R.armed) {
      const D = DECK.dearmStop
      ordies.forEach((o, k) => {
        // from the starboard side and aft, never from in front of the forward-firing weapons
        const approach = rel(D, -10, 26 + k * 4)
        const work = rel(D, -6 - k * 10, 12) // both on the aft-right side they came from: nobody crosses under the running jet
        o.holdUntil(tDearm0 - 2)
        o.walkTo(approach)
        o.walkTo(work)
        o.act('arm', headingTo(work, D))
        o.holdUntil(Math.min(o.t + DEARM_WORK_S, tDearm1 - 8))
        o.walkTo(approach)
        o.act('watch', headingTo(approach, D))
        o.holdUntil(tDearm1 + 4)
        o.walkTo(ORD_MUSTER[k]!)
        o.act('watch', 180)
      })
      if (!firstArmed.done) {
        firstArmed.done = true
        log.add(tDearm0 + 2, 'crew', `De-arm: ${R.modex} holds at the de-arm stop while red shirts safe its weapons`, {
          focus: D,
          detail: 'Forward-firing ordnance is safed before the jet goes forward among the parked aircraft. The jet is turned so nothing points at people; the arming crew come in only from the side and aft.',
        })
      }
    }

    // -- Box director -------------------------------------------------------------------------------------------
    const tBoxIn = firstTime(ab.kf, iBox, p => p.x > BOX_ENTRY.x - 10)
    const viaBox = !sideHold && Number.isFinite(tBoxIn)
    let boxItem: ActItem | undefined
    if (viaBox) {
      boxItem = boxActs.add(tBoxIn, tBoxArrive + HANDOFF_PAUSE, 'direct')
      ab.handTo(boxDir.id, tBoxIn)
    }

    // -- Fly 2 director: from the foul line to the de-arm stop / the Box; hands off to the Box director at the Box entry
    const tFly2End = viaBox ? tBoxIn : R.armed ? tDearm1 + 6 : tBoxArrive - 8
    fly2Acts.add(tAcross, Math.min(tFly2End, R.armed ? tDearm0 + 2 : tFly2End), 'direct', headingTo(FLY2_DIRECTOR, poseAt(ab.kf, tAcross)))
    if (R.armed && tDearm1 - 4 < tFly2End) fly2Acts.add(tDearm1 - 4, Math.min(tDearm1 + 6, tFly2End), 'direct')
    if (viaBox) fly2Acts.add(tFly2End, tFly2End + 2, 'pass', headingTo(FLY2_DIRECTOR, BOX_DIRECTOR))

    // -- events --------------------------------------------------------------------------------------------------
    const stopFocus = { x: stop.x, y: stop.y }
    const isLast = T === lastTrapT
    log.add(T, 'trap', `Trap ${trapNo} — ${R.modex} catches the ${R.wire}-wire${R.tanker ? ' (recovery tanker, last aboard)' : ''}`, {
      focus: stopFocus,
      narration: trapNo === 1 ? 'first-trap' : isLast ? 'tanker-last' : undefined,
      detail: `${typeName(R)}, ${R.squadron}. Throttles to MIL at touchdown in case the hook misses; the wire stops the jet in about 2 s over about 315 ft. It will taxi to bow slot ${R.slot}.`,
    })
    if (trapNo === 1) {
      log.add(tOff, 'crew', 'Gear puller: hook up, off brakes, hard right turn, fold wings', {
        focus: stopFocus,
        detail: 'The landing-area director stands at the pilot\'s one o\'clock, gives hook up and brakes, then turns the jet hard right toward the foul line. The wings fold on the move; the tail must clear the foul line within about 30 s.',
      })
      log.add(tGreen, 'deck', 'Clear deck forward. The landing area is clear for the next jet.', {
        focus: gpPre,
        detail: 'Tail across the foul line, wire retracted and re-tensioned: the gear puller signals clear deck forward and the arresting gear officer turns the deck green.',
      })
    }

    // -- the bow: queue behind other jets, spin, push back, chock and chain -----------------------------------------
    const job: BowJob = { R, ab, after: later?.modex, boxItem }
    if (job.after) pending.set(job.after, job)
    else {
      bowFree = bowLeg(job, bowFree)
      const waiting = pending.get(R.modex)
      if (waiting) {
        pending.delete(R.modex)
        bowFree = bowLeg(waiting, bowFree)
      }
    }
  }
  if (pending.size) throw new Error('recovery: a jet is waiting for a slot that never fills')

  // ---- the bow leg for one jet ---------------------------------------------------------------------------------
  function bowLeg(job: BowJob, free: number): number {
    const { R, ab } = job
    const s = slotOf(R.slot)
    const slotPose: Pose = { x: s.x, y: s.y, heading: 180 }
    const arrHdg = s.y > 10 ? 12 : s.y < -10 ? -12 : 0
    const spin: Pose = { x: s.x - SPIN_BACK, y: s.y, heading: arrHdg }
    const fromSide = ab.pose.y >= 40
    const legs: Pose[] = fromSide ? [SIDE_EXIT, { ...spin, heading: -70 }] : spin.x > BOW_NODE.x + 30 ? [BOW_NODE, spin] : [spin]
    const pr = profile(ab.pose, legs, BOW_SPEED, 0, 0)
    const dur = pr.times[pr.times.length - 1]!
    const tArrive = ab.t
    const horizon = () => Math.max(...[...w.aircraft.values()].filter(o => o !== ab).map(o => o.t)) + 5
    const s0 = snap(ab)
    let tGo = Math.max(ab.t + HANDOFF_PAUSE, free - dur)
    let i0 = 0
    let tSpinEnd = 0
    let tPush = 0
    let iPush = 0
    for (let attempt = 0; attempt < 400; attempt++) {
      restore(ab, s0)
      ab.holdUntil(tGo)
      i0 = ab.kf.length - 1
      drive(ab, legs, BOW_SPEED, 0, 0, () => 'taxiing')
      // spin in the empty row aft of the slot
      ab.turnTo(180, SPIN_RATE)
      tSpinEnd = ab.t
      // the hot tractor hooks up to the nose and pushes the jet back into the slot
      tPush = tSpinEnd + TOW_HOOKUP_S
      ab.holdUntil(tPush)
      ab.change({ status: 'towed' })
      iPush = ab.kf.length - 1
      moveSmooth(ab, slotPose, dist(spin, slotPose) / PUSH_SPEED + 3)
      if (traffic.clear(ab, tArrive, Math.max(ab.t + 1, horizon()))) break
      tGo += 2
    }
    const tSlot = ab.t
    const tMeet = firstTime(ab.kf, i0, p => dist(p, spin) < 60)
    // spot director's stand: in the column gap ahead-left of the spin point, outside the pivot circle
    const standSpot: Vec2 = { x: spin.x + 40, y: s.y - 16.5 }

    // Fly 1 bow director: forward of the Box, on the side away from the jet's turn, until the spot director has it
    const standBow = rel(BOX_EXIT, 40, s.y < -10 ? DIRECTOR_SIDE : -DIRECTOR_SIDE)
    const bd = bowDir.t + dist(bowDir.pos, standBow) / WALK_SPEED <= tGo - 2 ? bowDir : w.pools.take('director', 1, standBow, tGo - 2, 8, 'Fly 1 bow director')
    bd.arriveAt(standBow, Math.max(bd.t + dist(bd.pos, standBow) / WALK_SPEED, tGo - 2))
    bd.act('direct', headingTo(standBow, ab.pose))
    bd.holdUntil(tMeet + HANDOFF_PAUSE)
    bd.act('pass', headingTo(standBow, standSpot))
    bd.holdUntil(bd.t + 2)
    bd.act('watch')
    // control: Box director (or the Fly 2 director for a side hold) -> bow director as the jet leaves, -> spot director at the spin point
    if (job.boxItem) {
      job.boxItem.t1 = Math.max(job.boxItem.t1, tGo)
      boxActs.add(tGo, tGo + 2, 'pass', headingTo(BOX_DIRECTOR, standBow))
    }
    ab.handTo(bd.id, tGo)
    ab.handTo('__spot__', tMeet + HANDOFF_PAUSE)
    if (bd === bowDir) {
      bd.holdUntil(Math.max(bd.t, firstTime(ab.kf, i0, p => dist(p, standBow) > 50)))
      bd.walkTo(BOW_DIRECTOR_HOME)
      bd.act('watch', 180)
    } else w.pools.release(bd)

    // Bow crews wait in the 2.5 ft gaps between the parked rows and columns (§1.13 spacing), never in a slot,
    // and come in along the starboard deck edge and down the row gap.
    const gapX = s.x + (s.x > 1050 ? 22 : 31.5)
    const edgeY = (x: number) => 65 - (Math.max(850, x) - 850) * (23 / 242) - 4
    const approach = (b: CrewBuilder, to: Vec2, tArrive: number): void => {
      const edge = { x: gapX, y: edgeY(gapX) }
      const d = dist(b.pos, edge) + dist(edge, to)
      b.holdUntil(Math.max(b.t, tArrive - d / WALK_SPEED))
      b.walkTo(edge)
      b.walkTo(to)
    }

    // spot director
    const sd = w.pools.take('director', 1, standSpot, tGo, 8, 'Spot director, Fly 1')
    approach(sd, standSpot, tGo)
    sd.act('direct', headingTo(standSpot, spin))
    const spotHand = ab.control.find(c => c.director === '__spot__')
    if (spotHand) spotHand.director = sd.id

    // the hot tractor: from its spot at the point to the jet's nose, push, unhook, back
    const waitPose: Pose = { x: spin.x - TOW_OFFSET, y: spin.y, heading: 0 }
    const eta = (v: VehicleBuilder) => v.t + 1 + (dist(v.pos, waitPose) * 1.25) / TRACTOR_SPEED
    let tr = tractors.find(v => eta(v) <= tPush - 2)
    if (!tr && tractors.length < TRACTOR_HOMES.length) {
      const h = TRACTOR_HOMES[tractors.length]!
      tr = new VehicleBuilder(`hot-tractor-${tractors.length + 1}`, 'tractor', h, h.heading, 0)
      tractors.push(tr)
      w.vehicles.push(tr)
    }
    if (!tr) tr = tractors.reduce((a, b) => (eta(a) < eta(b) ? a : b))
    tr.holdUntil(Math.max(tr.t, tPush - 2 - (eta(tr) - tr.t)))
    tr.heading = headingTo(tr.pos, waitPose)
    tr.key(tr.t + 1)
    tr.driveTo(waitPose, TRACTOR_SPEED)
    tr.holdUntil(tPush)
    for (const k of ab.kf.slice(iPush + 1)) {
      tr.pos = { x: k.x - TOW_OFFSET, y: k.y }
      tr.heading = 0
      tr.key(k.t)
    }
    tr.holdUntil(tSlot + 5)
    const home = TRACTOR_HOMES[tractors.indexOf(tr)]!
    tr.heading = headingTo(tr.pos, home)
    tr.key(tr.t + 1.5)
    tr.driveTo(home, TRACTOR_SPEED)

    ab.change({ status: 'manned' })
    ab.holdUntil(tSlot + SHUTDOWN_AFTER).change({ status: 'parked', power: 0 })

    sd.holdUntil(tSlot + 3)
    sd.act('idle')
    w.pools.release(sd)
    ab.releaseControl(tSlot + 3)

    // blue shirts wait at the slot's forward corners, then chock and put on the initial chains (§5.3 step 23)
    for (const side of [1, -1] as const) {
      const at = rel(slotPose, -4, side * 9)
      const wait = { x: gapX, y: s.y + side * 16.5 }
      const b = w.pools.take('plane-handler', 1, wait, tGo, 10, 'Chock and chain crew, Fly 1')
      approach(b, wait, tGo)
      b.act('watch', headingTo(wait, at))
      b.holdUntil(tSlot)
      b.walkTo(at, 4)
      b.act('chock', slotPose.heading)
      b.wait(CHOCK_S)
      b.act('chain')
      b.wait(CHAIN_S)
      b.act('idle')
      w.pools.release(b)
    }
    // the plane captain takes the jet once the tractor is off the nose (§5.3 step 24)
    const pcAt = rel(slotPose, 24, -11)
    const pcWait = { x: s.x + 18, y: s.y - 16.5 }
    const pc = w.pools.take('plane-captain', 1, pcWait, tGo, 10, `Plane captain, ${R.modex}`)
    approach(pc, pcWait, tGo)
    pc.act('watch', headingTo(pcWait, slotPose))
    pc.holdUntil(tSlot + 5)
    pc.walkTo(pcAt)
    pc.act('check', headingTo(pcAt, slotPose))
    pc.holdUntil(tSlot + PC_STAY)
    pc.act('idle')
    w.pools.release(pc)

    return tSlot
  }

  // ---- flush the static crews' actions ------------------------------------------------------------------------
  for (const a of [lsoCtl, agoActs, agEdgeActs, fly2Acts, boxActs]) a.flush()

  eq.deck(T_RECOVERY_COMPLETE, 'red')
  log.add(T_RECOVERY_COMPLETE, 'phase', 'Recovery complete.', {
    narration: 'recovery-complete',
    detail: 'Twelve aboard. The last jets are still taxiing to the bow and being chained; the deck goes red and the Handler starts the respot for the next event.',
  })

  return buildPattern(passes)
}

// ---- pattern inset (§5.2) ---------------------------------------------------------------------------------

type Leg = PatternKeyframe['leg']

function buildPattern(passes: Pass[]): PatternEntity[] {
  const out: PatternEntity[] = []
  const rad = (d: number) => (d * Math.PI) / 180
  const fin = { x: Math.cos(rad(FINAL_DEG)), y: Math.sin(rad(FINAL_DEG)) }
  const grooveStart: Vec2 = { x: RAMP_NM.x - GROOVE_NM * fin.x, y: RAMP_NM.y - GROOVE_NM * fin.y }

  RECOVERY.forEach((R, idx) => {
    const track: PatternKeyframe[] = []
    const push = (t: number, p: Vec2, alt: number, leg: Leg) => {
      const last = track[track.length - 1]
      if (last && t < last.t) return
      track.push({ t, x: p.x, y: p.y, alt, leg })
    }
    /** a polyline traversed between t0 and t1, keyframes spaced by arc length */
    const pathLeg = (pts: Vec2[], t0: number, t1: number, alt0: number, alt1: number, leg: Leg) => {
      const cum = [0]
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1]! + dist(pts[i - 1]!, pts[i]!))
      const L = cum[cum.length - 1]! || 1
      pts.forEach((p, i) => push(t0 + ((t1 - t0) * cum[i]!) / L, p, alt0 + ((alt1 - alt0) * cum[i]!) / L, leg))
    }
    const arc = (n: number, f: (u: number) => Vec2) => Array.from({ length: n + 1 }, (_, i) => f(i / n))

    /** downwind, the 180, the 90 and the groove, ending at touchdown T */
    const finalLegs = (T: number) => {
      pathLeg([{ x: BREAK_POINT.x, y: DOWNWIND_Y }, { x: ABEAM_X, y: DOWNWIND_Y }], T - P_DOWNWIND, T - P_ABEAM, ALT.pattern, ALT.pattern, 'downwind')
      // the 180: quarter ellipse from abeam (heading aft) to the ninety (heading starboard)
      const cy = (DOWNWIND_Y + grooveStart.y) / 2
      const a1 = ABEAM_X - NINETY_X
      const b1 = cy - DOWNWIND_Y
      pathLeg(arc(8, u => ({ x: ABEAM_X - a1 * Math.sin((u * Math.PI) / 2), y: cy - b1 * Math.cos((u * Math.PI) / 2) })), T - P_ABEAM, T - P_NINETY, ALT.pattern, ALT.ninety, 'abeam')
      // the 90 to the groove: quarter ellipse to the final bearing
      const a2 = grooveStart.x - NINETY_X
      const b2 = grooveStart.y - cy
      pathLeg(arc(8, u => ({ x: grooveStart.x - a2 * Math.cos((u * Math.PI) / 2), y: cy + b2 * Math.sin((u * Math.PI) / 2) })), T - P_NINETY, T - P_GROOVE, ALT.ninety, ALT.wake, 'ninety')
      pathLeg([grooveStart, RAMP_NM], T - P_GROOVE, T, ALT.wake, 0, 'groove')
    }

    const mine = passes.filter(p => p.R === R).sort((a, b) => a.T - b.T)
    const first = mine[0]!
    push(0, STACK_CENTRE, ALT.stack, 'none')

    // overhead stack: left-hand circle, jets spread round it
    const tLeave = first.T - P_LEAVE_STACK
    const phi0 = Math.PI / 2 + (idx / RECOVERY.length) * Math.PI * 2
    const stackAt = (t: number): Vec2 => {
      const phi = phi0 - ((t - STACK_START) / STACK_ORBIT_S) * Math.PI * 2
      return { x: STACK_CENTRE.x + STACK_R * Math.cos(phi), y: STACK_CENTRE.y + STACK_R * Math.sin(phi) }
    }
    if (tLeave > STACK_START) {
      push(STACK_START - 0.01, stackAt(STACK_START), ALT.stack, 'none')
      for (let t = STACK_START; t < tLeave; t += 5) push(t, stackAt(t), ALT.stack, 'marshal')
      push(tLeave, stackAt(tLeave), ALT.stack, 'marshal')
    } else push(Math.max(0.01, tLeave - 0.01), stackAt(tLeave), ALT.stack, 'none')
    // descend out of the stack to the initial
    pathLeg([stackAt(tLeave), { x: -2.0, y: -0.9 }, INITIAL_START], tLeave, first.T - P_INITIAL, ALT.stack, ALT.initial, 'marshal')
    pathLeg([INITIAL_START, BREAK_POINT], first.T - P_INITIAL, first.T - P_BREAK, ALT.initial, ALT.initial, 'initial')
    // the break: level 180 to the left over / ahead of the ship
    const rB = (BREAK_POINT.y - DOWNWIND_Y) / 2
    const cB = { x: BREAK_POINT.x, y: BREAK_POINT.y - rB }
    pathLeg(arc(10, u => ({ x: cB.x + rB * Math.sin(u * Math.PI), y: cB.y + rB * Math.cos(u * Math.PI) })), first.T - P_BREAK, first.T - P_DOWNWIND, ALT.initial, ALT.pattern, 'break')
    finalLegs(first.T)

    for (let k = 1; k < mine.length; k++) {
      const prev = mine[k - 1]!
      const next = mine[k]!
      // bolter / wave-off: straight ahead off the angle, climb to pattern altitude, left turn downwind
      const up: Vec2 = { x: RAMP_NM.x + BOLTER_UPWIND_NM * fin.x, y: RAMP_NM.y + BOLTER_UPWIND_NM * fin.y }
      const r = (up.y - DOWNWIND_Y) / 2
      const c = { x: up.x, y: up.y - r }
      const turn = arc(10, u => ({ x: c.x + r * Math.sin(u * Math.PI), y: c.y + r * Math.cos(u * Math.PI) }))
      pathLeg([RAMP_NM, ...turn, { x: BREAK_POINT.x, y: DOWNWIND_Y }], prev.T, next.T - P_DOWNWIND, 0, ALT.pattern, 'bolter')
      finalLegs(next.T)
    }
    const lastPass = mine[mine.length - 1]!
    push(lastPass.T + 0.01, RAMP_NM, 0, 'none')
    out.push({ aircraftId: R.modex, track })
  })

  // departures for Event N off the catapults: climb out ahead with a clearing turn
  for (const L of LAUNCHERS) {
    const S = T_FIRST_SHOT + L.shotOffset
    const side = L.cat <= 2 ? 1 : -1
    const x0 = L.cat <= 2 ? (1049 - 546) / NM : (730 - 546) / NM
    const y0 = L.cat <= 2 ? 0 : -0.016
    out.push({
      aircraftId: L.modex,
      track: [
        { t: 0, x: x0, y: y0, alt: 0, leg: 'none' },
        { t: S, x: x0, y: y0, alt: 0, leg: 'departure' },
        { t: S + DEPARTURE_S / 3, x: 0.7, y: y0 + side * 0.04, alt: 300, leg: 'departure' },
        { t: S + (2 * DEPARTURE_S) / 3, x: 1.7, y: y0 + side * 0.18, alt: 450, leg: 'departure' },
        { t: S + DEPARTURE_S, x: 2.8, y: y0 + side * 0.45, alt: 500, leg: 'departure' },
        { t: S + DEPARTURE_S + 0.01, x: 2.8, y: y0 + side * 0.45, alt: 500, leg: 'none' },
      ],
    })
  }
  return out
}
