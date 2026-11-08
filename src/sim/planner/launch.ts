import type { Catapult, Pose } from '../../data/deckTypes'
import type { AircraftKeyframe, Vec2 } from '../types'
import { DECK, cat as catOf, slot as slotOf } from '../../data/deck'
import { dist, headingTo, offset, pathLength, taxiPath } from '../track'
import { LAUNCHERS, PARKED, T_FIRST_SHOT, T_START_GO, type LaunchSlot } from './scenario'
import { AircraftBuilder, CrewBuilder, TAXI_SPEED, WING_FOLD_S, rel } from './toolkit'
import { zoneOf, type World } from './world'

/**
 * Pre-launch and launch phases: man-up, engine start, breakdown, taxi to the catapults,
 * hook-up, tension and the shot, with the catapult crews, directors, checkers, ordnance and
 * equipment (JBDs, shuttles). Timings follow §4 of docs/research/00-DOMAIN-REFERENCE.md:
 * wye at S-51, launch bar down S-39, tension S-28, MIL S-18, salute S-8, fire at S, stroke 2 s.
 */

/** The point jets pull forward-inboard straight onto cat 1 (they sit forward of JBD 1). */
const CAT1_POINT_PULLOUT: Pose = { x: 703, y: 78, heading: -42 }
/**
 * §4.1 step 6: wings are spread at a holding node 60-120 ft aft of the JBD, never close behind it.
 * Cat 4's deck.ts node (175,-56) would put a spread wing over the jet parked on E4B, so cat 4 jets spread
 * at the finger node instead (nose about 60 ft from the JBD 4 aft edge, clear of E4B by about 8 ft).
 */
const CAT4_HOLD: Pose = { x: 235, y: -48, heading: -30 }
/** Cat 3's deck.ts node (235,-52) puts a spread wing 3 ft over E4B; 10 ft forward and inboard clears it (nose 80 ft from JBD 3). */
const CAT3_HOLD: Pose = { x: 245, y: -48, heading: -4 }
/** §1.15 table "six-pack → cat 2/3: pull out, spread in the open": 305 spreads forward of 106 still in SP3 (nose 55 ft from JBD 2). */
// 207's node sits 15 ft forward of the deck.ts cat 1 node so its spread wing clears 210 parked on SP4.
const HOLD_FOR: Partial<Record<string, Pose>> = { '305': { x: 585, y: -38, heading: 0 }, '207': { x: 575, y: 60, heading: -5 } }
const PULL_OUT_FT = 15 // straight pull clear of the slot before the first turn
const PULL_OUT_SPEED = 3 // ft/s
/**
 * The six-pack is spotted nose aft-inboard so its jets pull straight out into the open (§1.15). A jet must pull
 * one length plus the row spacing (about 90 ft) before it turns, or its tail swings through the neighbour ahead.
 */
const SIXPACK_PULL_FT = 90
const PIVOT_OVER_DEG = 60 // sharper turns at the start or end of a leg are pivots in place
const PIVOT_RATE_DPS = 20 // pivots and the average yaw rate of a taxi leg stay below this
const MAX_LEG_FT = 120 // §1.15: directors are spaced every 60-150 ft
const HANDOFF_S = 2 // §1.15: 0-3 s pause at each director handoff
const APPROACH_SPEED = 5 // ft/s from the queue over the lowered JBD into the wye, ≤ 4 mph (§4.1 step 11)
const SHOT_CLEAR_S = 3 // a neighbouring jet moves only once the previous shot has gone
const ARM_S = 30 // §4.1 step 13: arming 30-60 s
const DIRECTOR_CAP = 10 // per fly zone: 2-4 stationary directors per taxi (§1.15 director chain)

interface CatCrew {
  cat: Catapult
  director: CrewBuilder
  tspo: CrewBuilder
  holdback: CrewBuilder
  hookup2: CrewBuilder
  weightBoard: CrewBuilder
  deckEdge: CrewBuilder
  jbdOp: CrewBuilder
  jbdSafety: CrewBuilder
  checkers: [CrewBuilder, CrewBuilder]
  /** +1 if the shooter stands to the jet's right, -1 to its left */
  shooterSide: 1 | -1
}

interface PairCrew {
  shooter: CrewBuilder
  centerdeck: CrewBuilder
  safety: CrewBuilder
  ordnance: [CrewBuilder, CrewBuilder]
  ordMuster: Vec2
}

function sideOf(cat: Catapult): 1 | -1 {
  const r = (cat.heading * Math.PI) / 180
  const rx = -Math.sin(r)
  const ry = Math.cos(r)
  const dx = cat.shooterPos.x - cat.aircraftPos.x
  const dy = cat.shooterPos.y - cat.aircraftPos.y
  return dx * rx + dy * ry >= 0 ? 1 : -1
}

function makeCatCrew(w: World, cat: Catapult): CatCrew {
  const a = cat.aircraftPos
  const side = sideOf(cat)
  const back = (cat.heading + 180) % 360
  const mk = (id: string, role: 'director' | 'cat-crew' | 'checker', label: string, p: Vec2, heading = back) => {
    const b = new CrewBuilder(id, role, label, p, heading, 'idle')
    w.crew.push(b)
    return b
  }
  const n = cat.id
  return {
    cat,
    shooterSide: side,
    director: mk(`cat${n}-director`, 'director', `Catapult ${n} director`, rel({ ...a, heading: cat.heading }, 35, 0)),
    tspo: mk(`cat${n}-tspo`, 'cat-crew', `Topside safety petty officer, cat ${n}`, rel({ ...a, heading: cat.heading }, 5, side * 27)),
    holdback: mk(`cat${n}-holdback`, 'cat-crew', `Holdback man, cat ${n}`, rel({ ...a, heading: cat.heading }, -8, side * 28)),
    hookup2: mk(`cat${n}-hookup`, 'cat-crew', `Hook-up crew, cat ${n}`, rel({ ...a, heading: cat.heading }, -8, -side * 28)),
    weightBoard: mk(`cat${n}-weight`, 'cat-crew', `Weight board operator, cat ${n}`, rel(cat.queue, 34, 14)),
    deckEdge: mk(`cat${n}-deckedge`, 'cat-crew', `Deck-edge operator, cat ${n}`, cat.deckEdge),
    jbdOp: mk(`cat${n}-jbd`, 'cat-crew', `JBD operator, cat ${n}`, cat.jbdOperator),
    jbdSafety: mk(`cat${n}-jbdsafety`, 'cat-crew', `JBD safety observer, cat ${n}`, cat.jbdSafety),
    checkers: [
      mk(`cat${n}-checker-a`, 'checker', `Final checker, cat ${n}`, rel(cat.queue, -4, 27)),
      mk(`cat${n}-checker-b`, 'checker', `Final checker, cat ${n}`, rel(cat.queue, -4, -27)),
    ],
  }
}

function makePairCrew(w: World, cats: [Catapult, Catapult], name: string, ordMuster: Vec2): PairCrew {
  const c = cats[0]
  const mk = (id: string, role: 'shooter' | 'cat-crew' | 'ordnance', label: string, p: Vec2) => {
    const b = new CrewBuilder(id, role, label, p, (c.heading + 180) % 360, 'watch')
    w.crew.push(b)
    return b
  }
  return {
    shooter: mk(`${name}-shooter`, 'shooter', `${name === 'bow' ? 'Bow' : 'Waist'} catapult officer (shooter)`, c.shooterPos),
    centerdeck: mk(`${name}-centerdeck`, 'cat-crew', `Centerdeck operator, ${name} cats`, c.centerdeck),
    safety: mk(`${name}-safety`, 'cat-crew', `${name === 'bow' ? 'Bow' : 'Angle'} safety observer`, c.safetyObserver),
    ordnance: [mk(`${name}-ord-a`, 'ordnance', `Arming crew, ${name} cats`, ordMuster), mk(`${name}-ord-b`, 'ordnance', `Arming crew, ${name} cats`, { x: ordMuster.x + 8, y: ordMuster.y })],
    ordMuster,
  }
}


type Step =
  | { kind: 'spread'; dur: number }
  | { kind: 'pivot'; heading: number; dur: number }
  | { kind: 'pull'; to: Pose; dur: number }
  | { kind: 'taxi'; to: Pose; speed: number; dur: number; straight?: boolean }
  | { kind: 'handoff'; dur: number }

const yawDiff = (a: number, b: number): number => Math.abs(((((b - a) % 360) + 540) % 360) - 180)
const pivotStep = (from: number, to: number): Step => ({ kind: 'pivot', heading: to, dur: Math.max(1, yawDiff(from, to) / PIVOT_RATE_DPS) })

function legPath(from: Pose, to: Pose): { pts: Vec2[]; L: number } {
  const pts = taxiPath(from, from.heading, to, to.heading, 20, 0.35)
  return { pts, L: pathLength(pts) }
}

/** A taxi leg cut into director legs of at most MAX_LEG_FT, each ending on the original curve. */
function splitLeg(from: Pose, to: Pose): Pose[] {
  // a leg that starts or ends with a pivot runs along the straight chord
  const h = headingTo(from, to)
  const a = yawDiff(from.heading, h) > PIVOT_OVER_DEG ? { ...from, heading: h } : from
  const b = yawDiff(h, to.heading) > PIVOT_OVER_DEG ? { ...to, heading: h } : to
  const { pts, L } = legPath(a, b)
  const n = Math.ceil(L / MAX_LEG_FT)
  const out: Pose[] = []
  for (let k = 1; k < n; k++) {
    const i = Math.round((k * (pts.length - 1)) / n)
    out.push({ x: pts[i]!.x, y: pts[i]!.y, heading: headingTo(pts[i - 1]!, pts[i + 1]!) })
  }
  out.push(to)
  return out
}

/** One director leg; the speed is bounded so the jet's average yaw rate stays under PIVOT_RATE_DPS (1.5x margin). */
function taxiStep(from: Pose, to: Pose): Step {
  const { L } = legPath(from, to)
  const speed = Math.min(TAXI_SPEED, L / Math.max(0.1, (1.5 * yawDiff(from.heading, to.heading)) / PIVOT_RATE_DPS))
  return { kind: 'taxi', to, speed, dur: Math.max(2, L / speed) }
}

/**
 * Slot to queue (§4.1 steps 5-8): pull straight out, pivot toward the route, taxi in director legs with a
 * pause at each handoff, spread the wings at the holding node (point jets: once clear of the slot).
 */
function planRoute(slot: Pose, legs: Pose[], hold: Pose | null, queue: Pose, pullFt: number): Step[] {
  const steps: Step[] = []
  if (dist(slot, queue) < 30) {
    // the slot sits on the queue (FI1 / cat 4): spread in the slot, pivot left, ease across
    steps.push({ kind: 'spread', dur: WING_FOLD_S }, pivotStep(slot.heading, queue.heading))
    steps.push({ kind: 'taxi', to: queue, speed: 3, dur: Math.max(1, dist(slot, queue) / 3), straight: true })
    return steps
  }
  let p: Pose = { ...rel(slot, pullFt, 0), heading: slot.heading }
  let legsDone = 0
  if (pullFt > PULL_OUT_FT) {
    // a long straight pull out of a row (six-pack) is a director leg of its own
    steps.push({ kind: 'taxi', to: p, speed: TAXI_SPEED, dur: pullFt / TAXI_SPEED, straight: true })
    legsDone++
  } else steps.push({ kind: 'pull', to: p, dur: pullFt / PULL_OUT_SPEED })
  if (!hold) steps.push({ kind: 'spread', dur: WING_FOLD_S })
  for (const leg of legs) {
    for (const piece of splitLeg(p, leg)) {
      if (legsDone++ > 0) steps.push({ kind: 'handoff', dur: HANDOFF_S })
      // a turn sharper than PIVOT_OVER_DEG at either end of the leg is a pivot in place, not a swerve
      const h = headingTo(p, piece)
      if (yawDiff(p.heading, h) > PIVOT_OVER_DEG) {
        steps.push(pivotStep(p.heading, h))
        p = { ...p, heading: h }
      }
      if (yawDiff(h, piece.heading) > PIVOT_OVER_DEG) {
        steps.push(taxiStep(p, { ...piece, heading: h }), pivotStep(h, piece.heading))
      } else steps.push(taxiStep(p, piece))
      p = piece
    }
    if (leg === hold) steps.push({ kind: 'spread', dur: WING_FOLD_S })
  }
  return steps
}

/** Script the planned route; returns the director legs (start, end, end pose) and the time the wings start to spread. */
function runRoute(ab: AircraftBuilder, steps: Step[]): { windows: { t0: number; t1: number; to: Pose }[]; tSpread: number } {
  const windows: { t0: number; t1: number; to: Pose }[] = []
  let tSpread = ab.t
  ab.change({ status: 'taxiing' })
  for (const s of steps) {
    if (s.kind === 'spread') {
      tSpread = ab.t
      ab.spreadWings()
    } else if (s.kind === 'pivot') ab.turnTo(s.heading, PIVOT_RATE_DPS)
    else if (s.kind === 'pull') ab.moveStraight(s.to, s.dur, s.to.heading)
    else if (s.kind === 'handoff') ab.wait(s.dur)
    else {
      const t0 = ab.t
      if (s.straight) ab.moveStraight(s.to, s.dur, s.to.heading, 'out')
      else ab.taxiTo(s.to, s.speed, 'taxiing')
      windows.push({ t0, t1: ab.t, to: s.to })
    }
  }
  return { windows, tSpread }
}

/** From the queue onto the catapult: cross the lowered JBD, stop in the wye, hook up, creep to the shuttle, tension. */
function approachCat(ab: AircraftBuilder, cat: Catapult, S: number, tStart: number): AircraftKeyframe[] {
  ab.holdUntil(tStart)
  const wye: Pose = { ...rel({ ...cat.aircraftPos, heading: cat.heading }, -15, 0), heading: cat.heading }
  const j0 = ab.kf.length
  ab.taxiTo(wye, APPROACH_SPEED, 'taxiing')
  const samples = ab.kf.slice(j0)
  ab.holdUntil(S - 51).change({ status: 'on-cat' })
  ab.holdUntil(S - 39).change({ launchBar: true })
  ab.holdUntil(S - 37)
  ab.moveStraight(cat.aircraftPos, 6, cat.heading, 'out')
  ab.holdUntil(S - 28).change({ status: 'tension' })
  return samples
}

/** Military power, afterburner for heavy jets, the two-second stroke, the clearing turn, airborne. */
function fireCat(ab: AircraftBuilder, cat: Catapult, S: number, heavy: boolean): void {
  ab.holdUntil(S - 18).change({ power: 1 })
  if (heavy) ab.holdUntil(S - 16).change({ power: 2 })
  ab.holdUntil(S).change({ status: 'shot' })
  const strokeEnd = rel({ ...cat.aircraftPos, heading: cat.heading }, 310, 0)
  ab.moveStraight(strokeEnd, 2.0, cat.heading, 'in')
  const beyond = rel({ ...strokeEnd, heading: cat.heading }, 160, 0)
  // clearing turn: right off the bow cats, left off the waist cats
  ab.moveStraight(beyond, 0.7, cat.heading + (cat.id <= 2 ? 8 : -8))
  ab.depart()
}

/**
 * The catapult crew's choreography around one shot at time S (§4.1 steps 14-33).
 * 'abort' stops at S-9 with a suspend; 'rerun' starts from the tensioned jet at S-30.
 */
function catCrewSequence(cc: CatCrew, pc: PairCrew, S: number, mode: 'full' | 'abort' | 'rerun'): void {
  const cat = cc.cat
  const A = { ...cat.aircraftPos, heading: cat.heading }
  const back = (cat.heading + 180) % 360
  const side = cc.shooterSide

  if (mode !== 'rerun') {
    // TSPO and holdback at the nose gear during hook-up, then clear and crouched
    cc.tspo.holdUntil(S - 56).walkTo(rel(A, 2, 0))
    cc.tspo.act('hookup', back)
    cc.tspo.holdUntil(S - 26).walkTo(rel(A, 5, side * 27))
    cc.tspo.act('watch', back)
    cc.holdback.holdUntil(S - 56).walkTo(rel(A, -3, 2))
    cc.holdback.act('hookup', cat.heading)
    cc.holdback.holdUntil(S - 38).walkTo(rel(A, -8, side * 28))
    cc.holdback.act('watch', back)
    cc.hookup2.holdUntil(S - 56).walkTo(rel(A, -3, -3))
    cc.hookup2.act('hookup', cat.heading)
    cc.hookup2.holdUntil(S - 40).walkTo(rel(A, -8, -side * 28))
    cc.hookup2.act('watch', back)
    // JBD raised once the tail clears the arc
    cc.jbdOp.holdUntil(S - 44).act('direct')
    cc.jbdOp.holdUntil(S - 38).act('watch')
    // deck-edge: first ready, tension
    cc.deckEdge.holdUntil(S - 33).act('direct')
    cc.deckEdge.holdUntil(S - 24).act('watch')
    // checkers stand aft and outboard
    for (const [chk, cs] of [[cc.checkers[0], 1], [cc.checkers[1], -1]] as const) {
      chk.holdUntil(S - 30).walkTo(rel(A, -28, cs * 35))
      chk.act('check', cat.heading)
    }
  }
  // cat director passes control to the shooter and moves laterally clear
  cc.director.holdUntil(S - 30).walkTo(rel(A, 20, -side * 28))
  cc.director.act('watch', back)
  // shooter: final turn-up
  pc.shooter.holdUntil(S - 30).walkTo(cat.shooterPos)
  pc.shooter.act('direct', back)

  if (mode === 'abort') {
    // the checker on the burner side throws crossed arms; everyone stands down
    cc.checkers[1].holdUntil(S - 9).act('wave-off')
    cc.checkers[1].holdUntil(S - 4).act('check')
    pc.shooter.holdUntil(S - 8).act('wave-off')
    pc.shooter.holdUntil(S - 3).walkTo(rel(A, 22, 0)) // steps in front: "throttle back"
    pc.shooter.act('direct', back)
    pc.shooter.holdUntil(S + 8).walkTo(cat.shooterPos)
    pc.shooter.act('watch', back)
    cc.deckEdge.holdUntil(S - 8).act('direct')
    cc.deckEdge.holdUntil(S - 3).act('watch')
    cc.director.holdUntil(S + 2).walkTo(rel(A, 35, 0))
    cc.director.act('direct', back)
    return
  }

  for (const chk of cc.checkers) {
    chk.holdUntil(S - 8).act('direct')
    chk.holdUntil(S + 3).act('watch')
  }
  pc.shooter.holdUntil(S - 19).act('direct')
  pc.shooter.holdUntil(S - 2).act('signal-launch')
  pc.shooter.holdUntil(S + 2).act('watch')
  cc.deckEdge.holdUntil(S - 5).act('direct')
  cc.deckEdge.holdUntil(S - 1).act('signal-launch')
  cc.deckEdge.holdUntil(S + 1.5).act('watch')
  cc.jbdOp.holdUntil(S + 2).act('direct')
  cc.jbdOp.holdUntil(S + 6).act('watch')
  pc.centerdeck.holdUntil(S - 10).act('direct')
  pc.centerdeck.holdUntil(S - 6).act('watch')
  pc.safety.holdUntil(S - 6).act('direct')
  pc.safety.holdUntil(S - 1).act('watch')
  cc.director.holdUntil(S + 4).act('idle')
}

export function buildPrelaunchAndLaunch(w: World): void {
  const { log, eq } = w

  // ---- aircraft on deck ------------------------------------------------------------------
  for (const L of LAUNCHERS) {
    const s = slotOf(L.slot)
    const pose: Pose = { x: s.x, y: s.y, heading: s.launchHeading ?? s.heading }
    const ab = new AircraftBuilder(L.modex, L.type, L.modex, L.squadron, 2, pose, 'folded', 'parked', 0)
    w.aircraft.set(L.modex, ab)
  }
  for (const P of PARKED) {
    const s = slotOf(P.slot)
    const ab = new AircraftBuilder(P.modex, P.type, P.modex, P.squadron, 0, { x: s.x, y: s.y, heading: s.heading }, 'folded', 'parked', 0)
    w.aircraft.set(P.modex, ab)
  }

  // ---- fixed catapult crews -----------------------------------------------------------------
  const catCrew: Record<1 | 2 | 3 | 4, CatCrew> = {
    1: makeCatCrew(w, catOf(1)),
    2: makeCatCrew(w, catOf(2)),
    3: makeCatCrew(w, catOf(3)),
    4: makeCatCrew(w, catOf(4)),
  }
  const pairs: Record<'bow' | 'waist', PairCrew> = {
    bow: makePairCrew(w, [catOf(1), catOf(2)], 'bow', { x: 712, y: 30 }),
    waist: makePairCrew(w, [catOf(3), catOf(4)], 'waist', { x: 396, y: -100 }),
  }
  const pairOf = (c: 1 | 2 | 3 | 4) => (c <= 2 ? pairs.bow : pairs.waist)

  // ---- events: man up and start -------------------------------------------------------------
  log.add(0, 'phase', 'Flight quarters. Event N is spotted for launch; Event N-1 is airborne.', { narration: 'intro' })
  log.add(T_START_GO, 'crew', '"Start the go." Plane captains signal engine start.', { narration: 'start-go', detail: 'Brown shirts stand at the nose of each jet, running the start and control checks with the pilot.' })

  // ---- per-launcher choreography ------------------------------------------------------------
  const byCat: Record<1 | 2 | 3 | 4, LaunchSlot[]> = { 1: [], 2: [], 3: [], 4: [] }
  for (const L of LAUNCHERS) byCat[L.cat].push(L)
  for (const k of [1, 2, 3, 4] as const) byCat[k].sort((a, b) => a.shotOffset - b.shotOffset)

  let launcherIndex = 0
  const shotsOn = (c: 1 | 2 | 3 | 4): number[] => byCat[c].map(x => T_FIRST_SHOT + x.shotOffset)
  for (const L of LAUNCHERS.slice().sort((a, b) => a.shotOffset - b.shotOffset)) {
    const cat = catOf(L.cat)
    const cc = catCrew[L.cat]
    const pc = pairOf(L.cat)
    const ab = w.aircraft.get(L.modex)!
    const s = slotOf(L.slot)
    const slotPose: Pose = { x: s.x, y: s.y, heading: s.launchHeading ?? s.heading }
    const S = T_FIRST_SHOT + L.shotOffset
    const idx = launcherIndex++

    const usesPullout = L.cat === 1 && s.area === 'point'
    const queuePose: Pose = usesPullout ? CAT1_POINT_PULLOUT : cat.queue
    const hold = usesPullout ? null : HOLD_FOR[L.modex] ?? (L.cat === 4 ? CAT4_HOLD : L.cat === 3 ? CAT3_HOLD : cat.hold)
    const via = (L.via ?? []).filter(v => !hold || dist(v, hold) > 15)
    // the corral jets' noses are 12 ft from 210's tail corner on SP4: a short pull, then the turn
    const pullFt = s.area === 'six-pack' ? SIXPACK_PULL_FT : s.area === 'corral' ? 8 : PULL_OUT_FT
    const steps = planRoute(slotPose, hold ? [...via, hold, queuePose] : [...via, queuePose], hold, queuePose, pullFt)
    const routeDur = steps.reduce((a, st) => a + st.dur, 0)
    const S1 = L.suspend ? S - 100 : S
    // armed jets roll into the wye 10 s early so the arming (§4.1 step 13) is done before the creep at S-37
    let tApproach = S1 - 85 - (L.armed ? 10 : 0)
    let tQ = tApproach - 10
    let tLeave = tQ - routeDur
    if (usesPullout) {
      // a point jet sits beside its own catapult: it moves only once that cat's previous shot has gone
      const prev = shotsOn(L.cat).filter(t => t < S).pop()
      if (prev !== undefined && tLeave < prev + SHOT_CLEAR_S) {
        const d = prev + SHOT_CLEAR_S - tLeave
        tLeave += d
        tQ += d
        tApproach = Math.max(tApproach, tQ)
      }
    }
    if (L.cat === 3) {
      // §1.14 [DOC]: while cat 4 is loaded the cat 3 jet is held aft of JBD 3, wings clear of the cat 4 jet
      const c4 = shotsOn(4).filter(t => t < S1 && t > S1 - 120).pop()
      if (c4 !== undefined) tApproach = Math.max(tApproach, c4 + SHOT_CLEAR_S)
    }
    const tBreak = tLeave - 36
    const tStartEngines = T_START_GO + 8 + idx * 7

    // -- the jet --------------------------------------------------------------------------
    ab.holdUntil(tStartEngines).change({ status: 'manned' })
    ab.holdUntil(tLeave)
    const { windows, tSpread } = runRoute(ab, steps)
    const heavy = !!(L.tanker || L.armed)
    const approachSamples = approachCat(ab, cat, S1, tApproach)
    const tWye = approachSamples[approachSamples.length - 1]!.t
    if (L.suspend) {
      // first attempt: tension, power, then a checker sees the right burner fail to light -> suspend.
      // §7 Suspend: the pilot stays at power -> untension -> shuttle aft -> launch bar up -> shuttle forward
      // of the bar -> only then the shooter steps in front with THROTTLE BACK.
      ab.holdUntil(S1 - 18).change({ power: 1 })
      ab.holdUntil(S1 - 16).change({ power: 2 })
      ab.holdUntil(S1 - 7).change({ status: 'on-cat' })
      eq.shuttle(L.cat, S1 - 7, -0.01, 1)
      ab.holdUntil(S1 - 5).change({ launchBar: false })
      eq.shuttle(L.cat, S1 - 4, 0.02, 2)
      ab.holdUntil(S1 + 2).change({ power: 0 })
      ab.holdUntil(S - 39).change({ launchBar: true })
      ab.holdUntil(S - 28).change({ status: 'tension' })
      log.add(S1 - 9, 'crew', `Cat ${L.cat}: SUSPEND. A checker saw the right burner fail to light.`, {
        focus: cat.aircraftPos,
        detail: 'Crossed arms overhead. The pilot stays at power until the shooter untensions the catapult and steps in front with "throttle back". The jet is checked and re-run.',
        narration: 'suspend',
      })
      eq.shuttle(L.cat, S - 45, 0, 3)
    }
    fireCat(ab, cat, S, heavy)

    // -- equipment ----------------------------------------------------------------------------
    eq.jbd(L.cat, S - 43, 1, 4)
    eq.jbd(L.cat, S + 2, 0, 3)
    eq.shuttle(L.cat, S, 1, 2)
    eq.shuttle(L.cat, S + 10, 0, 15)

    // -- events ---------------------------------------------------------------------------------
    const areaName = DECK.areas.find(a => a.id === s.area)?.name ?? s.area.replace('el-', 'elevator ')
    if (idx < 4 || L.tanker) {
      log.add(tBreak, 'taxi', `${L.modex} breaking down on ${areaName}`, { focus: { x: s.x, y: s.y }, detail: 'Chains and chocks off on the director\'s signal; the jet is handed from the plane captain to a yellow shirt.' })
    }
    if (idx === 0) {
      log.add(tSpread, 'crew', `${L.modex} spreads its wings at the holding node`, { focus: hold ?? slotPose, detail: 'Wings spread only in the open, never close behind a raised jet blast deflector.' })
      log.add(S - 28, 'crew', `Cat ${L.cat}: tension taken on ${L.modex}`, { focus: cat.aircraftPos, detail: '"Taking tension" are the last words spoken until the launch. The jet squats onto its nose gear; the pilot goes to military power, wipes out the controls and salutes.', narration: 'tension' })
      log.add(S - 120, 'crew', 'Shooter: "Two minutes." Beacon green.', { narration: 'two-minutes' })
    }
    log.add(S, 'cat', `Cat ${L.cat} — ${L.modex} away${L.tanker ? ' (recovery tanker)' : ''}${L.suspend ? ' on the re-run' : ''}`, {
      focus: cat.aircraftPos,
      detail: `${L.type === 'EA18G' ? 'EA-18G Growler' : L.type === 'FA18F' ? 'F/A-18F Super Hornet' : 'F/A-18E Super Hornet'}, ${L.squadron}. 0 to about 150 knots in two seconds over a 310 ft stroke.`,
      narration: idx === 0 ? 'first-shot' : undefined,
    })
    // -- plane captain, blue shirts, director relay --------------------------------------------------------------
    const zone = zoneOf(s.x)
    const pcPos = rel(slotPose, 24, -11)
    const planeCaptain = w.pools.take('plane-captain', zone, pcPos, 0, 6, `Plane captain, ${L.modex}`)
    planeCaptain.arriveAt(pcPos, Math.min(tStartEngines - 20, 40))
    planeCaptain.face(rel(slotPose, 10, 0))
    planeCaptain.act('check')
    planeCaptain.holdUntil(tStartEngines).act('direct')
    planeCaptain.holdUntil(tStartEngines + 25).act('check')
    planeCaptain.holdUntil(tBreak - 4).act('direct') // salute and hand-off to the director
    planeCaptain.holdUntil(tBreak + 2).act('idle')
    planeCaptain.holdUntil(tLeave + 6)
    w.pools.release(planeCaptain)

    const blueA = w.pools.take('plane-handler', zone, rel(slotPose, -4, 9), tBreak, 8)
    const blueB = w.pools.take('plane-handler', zone, rel(slotPose, -4, -9), tBreak, 8)
    for (const [b, sideSign] of [[blueA, 1], [blueB, -1]] as const) {
      b.arriveAt(rel(slotPose, -4, sideSign * 9), tBreak)
      b.act('chain', slotPose.heading)
      b.holdUntil(tBreak + 14)
      b.walkTo(rel(slotPose, 12, sideSign * 9), 4, 'chock')
      b.act('chock')
      b.holdUntil(tBreak + 30)
      b.walkTo(rel(slotPose, 6, sideSign * 36), 5)
      b.act('idle', slotPose.heading + 90 * sideSign)
      b.holdUntil(tLeave + 8)
      w.pools.release(b)
    }

    // director relay (§1.15): each director stands still ahead of the jet's left wingtip at the end of his
    // leg (60-150 ft), brings the jet up to him and hands it on during the HANDOFF_S pause; nobody walks the jet
    const breakStand = rel(slotPose, 26, -18)
    let prevDirector = w.pools.take('director', zone, breakStand, tBreak, DIRECTOR_CAP)
    prevDirector.arriveAt(breakStand, tBreak)
    prevDirector.act('direct', (slotPose.heading + 180) % 360)
    for (const win of windows) {
      prevDirector.holdUntil(win.t0)
      prevDirector.act('idle')
      w.pools.release(prevDirector)
      const stand = offset(win.to, win.to.heading, 26, -18)
      const d = w.pools.take('director', zoneOf(stand.x), stand, win.t0 - 2, DIRECTOR_CAP)
      d.arriveAt(stand, win.t0 - 2)
      d.act('direct', (win.to.heading + 180) % 360)
      prevDirector = d
    }
    // at the queue: stands ahead of the left wingtip, controls until the hand-off to the cat director
    prevDirector.holdUntil(tApproach)
    prevDirector.act('idle')
    w.pools.release(prevDirector)

    // -- weight board at the queue --------------------------------------------------------------------
    cc.weightBoard.holdUntil(tQ + 1).act('check', (queuePose.heading + 180) % 360)
    cc.weightBoard.holdUntil(tQ + 9).act('idle')

    // -- catapult crew around the jet -------------------------------------------------------------------
    const A = { ...cat.aircraftPos, heading: cat.heading }
    const back = (cat.heading + 180) % 360
    cc.director.holdUntil(S1 - 90).walkTo(rel(A, 35, 0))
    cc.director.act('direct', back)
    for (const [chk, cs] of [[cc.checkers[0], 1], [cc.checkers[1], -1]] as const) {
      chk.arriveAt(rel(queuePose, -4, cs * 27), tQ + 2)
      chk.act('check', queuePose.heading)
      chk.follow(approachSamples, -4, cs * 27, 'check')
    }
    if (L.suspend) {
      catCrewSequence(cc, pc, S1, 'abort')
      // troubleshooter check: the TSPO goes back under the nose while the jet is re-run
      cc.tspo.holdUntil(S1 + 10).walkTo(rel(A, 2, 0))
      cc.tspo.act('hookup', back)
      cc.tspo.holdUntil(S - 26).walkTo(rel(A, 5, cc.shooterSide * 27))
      cc.tspo.act('watch', back)
      catCrewSequence(cc, pc, S, 'rerun')
    } else {
      catCrewSequence(cc, pc, S, 'full')
    }
    const Sx = S

    // ordnance: arm forward-firing weapons with the jet stopped in the wye and the pilot's hands up
    // (§4.1 step 13, 30-60 s); the crew are out to the side before the creep onto the shuttle at S-37.
    // A suspended jet is armed instead while it sits throttled back on the cat between the two attempts.
    if (L.armed) {
      const ARM_CLEAR = 43 // seconds before the shot by which arming ends: 4.4 s walk out, clear by S-38
      const tArm0 = L.suspend ? S1 + 4 : tWye
      const tArm1 = L.suspend ? tArm0 + ARM_S : Math.min(tWye + ARM_S, S1 - ARM_CLEAR)
      for (const [o, os] of [[pc.ordnance[0], 1], [pc.ordnance[1], -1]] as const) {
        o.arriveAt(rel(A, -18, os * 12), tArm0)
        o.act('arm', cat.heading)
        o.holdUntil(tArm1)
        o.walkTo(rel(A, -20, os * 34))
        o.act('watch', back)
        o.holdUntil(Sx + 4)
        o.walkTo({ x: pc.ordMuster.x + (os > 0 ? 0 : 8), y: pc.ordMuster.y })
      }
      if (idx < 6) log.add(tArm0, 'crew', `Ordnance arms ${L.modex} on cat ${L.cat}`, { focus: cat.aircraftPos, detail: 'Red shirts arm forward-firing weapons only with the jet stopped on the catapult and the pilot\'s hands in view.' })
    }
  }
  // last shot clears the angle for the recovery
  const last = LAUNCHERS.reduce((a, b) => (a.shotOffset > b.shotOffset ? a : b))
  log.add(T_FIRST_SHOT + last.shotOffset + 3, 'phase', 'Last shot. The waist cats are secured and the landing area cleared.', {
    narration: 'waist-clear',
    detail: 'Shuttles aft, JBDs flush, slot seals out, the bubble lowered and locked. The waist cat officer signals the arresting gear officer with an arm overhead.',
  })
}
