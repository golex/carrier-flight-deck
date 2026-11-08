import type { Catapult, Pose } from '../../data/deckTypes'
import type { AircraftKeyframe, Vec2 } from '../types'
import { DECK, cat as catOf, slot as slotOf } from '../../data/deck'
import { dist, offset, taxiPath } from '../track'
import { LAUNCHERS, PARKED, T_FIRST_SHOT, T_START_GO, type LaunchSlot } from './scenario'
import { AircraftBuilder, CrewBuilder, TAXI_SPEED, rel } from './toolkit'
import { zoneOf, type World } from './world'

/**
 * Pre-launch and launch phases: man-up, engine start, breakdown, taxi to the catapults,
 * hook-up, tension and the shot, with the catapult crews, directors, checkers, ordnance and
 * equipment (JBDs, shuttles). Timings follow §4 of docs/research/00-DOMAIN-REFERENCE.md:
 * wye at S-51, launch bar down S-39, tension S-28, MIL S-18, salute S-8, fire at S, stroke 2 s.
 */

/** The point jets pull forward-inboard straight onto cat 1 (they sit forward of JBD 1). */
const CAT1_POINT_PULLOUT: Pose = { x: 703, y: 78, heading: -42 }

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

/** Estimate taxi duration for a slot → queue route, including via points. */
function taxiDuration(from: Pose, legs: Pose[], speed: number): number {
  let total = 0
  let p = from
  for (const leg of legs) {
    const pts = taxiPath(p, p.heading, leg, leg.heading, 20, 0.35)
    let L = 0
    for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1]!, pts[i]!)
    total += Math.max(2, L / speed)
    p = leg
  }
  return total
}

/** From the queue onto the catapult: cross the lowered JBD, stop in the wye, hook up, creep to the shuttle, tension. */
function approachCat(ab: AircraftBuilder, cat: Catapult, S: number): AircraftKeyframe[] {
  ab.holdUntil(S - 85)
  const wye: Pose = { ...rel({ ...cat.aircraftPos, heading: cat.heading }, -15, 0), heading: cat.heading }
  const j0 = ab.kf.length
  ab.taxiTo(wye, 3, 'taxiing')
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
    const legs: Pose[] = [...(L.via ?? []), queuePose]
    const taxiDur = taxiDuration(slotPose, legs, TAXI_SPEED)
    const tQ = S - 95
    const tLeave = tQ - taxiDur
    const tBreak = tLeave - 36
    const tStartEngines = T_START_GO + 8 + idx * 7

    // -- the jet --------------------------------------------------------------------------
    ab.holdUntil(tStartEngines).change({ status: 'manned' })
    ab.holdUntil(tLeave)
    const i0 = ab.kf.length
    ab.taxiTo(queuePose, TAXI_SPEED, 'taxiing', L.via ?? [])
    const taxiSamples = ab.kf.slice(i0)
    ab.spreadWings()
    const heavy = !!(L.tanker || L.armed)
    const S1 = L.suspend ? S - 100 : S
    const approachSamples = approachCat(ab, cat, S1)
    if (L.suspend) {
      // first attempt: tension, power, then a checker sees the right burner fail to light -> suspend
      ab.holdUntil(S1 - 18).change({ power: 1 })
      ab.holdUntil(S1 - 16).change({ power: 2 })
      ab.holdUntil(S1 - 9).change({ power: 1 })
      ab.holdUntil(S1 - 5).change({ power: 0, status: 'on-cat' })
      ab.holdUntil(S - 28).change({ status: 'tension' })
      log.add(S1 - 9, 'crew', `Cat ${L.cat}: SUSPEND. A checker saw the right burner fail to light.`, {
        focus: cat.aircraftPos,
        detail: 'Crossed arms overhead. The pilot stays at power until the shooter untensions the catapult and steps in front with "throttle back". The jet is checked and re-run.',
        narration: 'suspend',
      })
      eq.shuttle(L.cat, S1 - 4, 0.02, 3)
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
      log.add(tQ + 14, 'crew', `${L.modex} spreads its wings behind JBD ${L.cat}`, { focus: queuePose, detail: 'Wings spread only in the open, never close behind a raised jet blast deflector.' })
      log.add(S - 28, 'crew', `Cat ${L.cat}: tension taken on ${L.modex}`, { focus: cat.aircraftPos, detail: '"Taking tension" are the last words spoken until the launch. The jet squats onto its nose gear; the pilot goes to military power, wipes out the controls and salutes.', narration: 'tension' })
      log.add(S - 60, 'crew', 'Shooter: "Two minutes." Beacon green.', { narration: 'two-minutes' })
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

    // director relay: one director per fly zone along the route; hand-off at the zone boundary
    const boundaries = [300, 660]
    let segStart = 0
    let prevDirector: CrewBuilder | null = null
    const dirZoneAt = (x: number) => zoneOf(x)
    while (segStart < taxiSamples.length - 1) {
      const zStart = dirZoneAt(taxiSamples[segStart]!.x)
      let segEnd = taxiSamples.length - 1
      for (let i = segStart + 1; i < taxiSamples.length; i++) {
        const x0 = taxiSamples[i - 1]!.x
        const x1 = taxiSamples[i]!.x
        if (boundaries.some(bx => (x0 - bx) * (x1 - bx) < 0)) {
          segEnd = i
          break
        }
      }
      const samples = taxiSamples.slice(segStart, segEnd + 1)
      const first = samples[0]!
      const standAt = offset(first, first.heading, 26, -18)
      const tArrive = segStart === 0 ? tBreak : first.t
      const d = segStart === 0 ? w.pools.take('director', zStart, standAt, tArrive, 6) : w.pools.take('director', zStart, standAt, tArrive - 20, 6)
      d.arriveAt(standAt, tArrive)
      d.act('direct', (first.heading + 180) % 360)
      if (segStart === 0) d.holdUntil(tLeave)
      d.follow(samples as AircraftKeyframe[], 26, -18, 'direct')
      if (prevDirector) {
        // the previous director hands off and walks home
        w.pools.release(prevDirector)
      }
      prevDirector = d
      segStart = segEnd
      if (segEnd >= taxiSamples.length - 1) break
    }
    const lastDirector = prevDirector!
    // at the queue: stands ahead of the left wingtip, controls until the hand-off to the cat director
    lastDirector.act('direct', (queuePose.heading + 180) % 360)
    lastDirector.holdUntil(S - 85)
    lastDirector.act('idle')
    w.pools.release(lastDirector)

    // -- weight board at the queue --------------------------------------------------------------------
    cc.weightBoard.holdUntil(tQ + 16).act('check', (queuePose.heading + 180) % 360)
    cc.weightBoard.holdUntil(tQ + 26).act('idle')

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

    // ordnance: arm forward-firing weapons with the launch bar on the shuttle
    if (L.armed) {
      const t0 = S1 - 50
      for (const [o, os] of [[pc.ordnance[0], 1], [pc.ordnance[1], -1]] as const) {
        o.arriveAt(rel(A, -18, os * 12), t0)
        o.act('arm', cat.heading)
        o.holdUntil(t0 + 16)
        o.walkTo(rel(A, -20, os * 34))
        o.act('watch', back)
        o.holdUntil(Sx + 4)
        o.walkTo({ x: pc.ordMuster.x + (os > 0 ? 0 : 8), y: pc.ordMuster.y })
      }
      if (idx < 6) log.add(t0, 'crew', `Ordnance arms ${L.modex} on cat ${L.cat}`, { focus: cat.aircraftPos, detail: 'Red shirts arm forward-firing weapons only with the launch bar on the shuttle and the pilot\'s hands in view.' })
    }
  }

  // last shot clears the angle for the recovery
  const last = LAUNCHERS.reduce((a, b) => (a.shotOffset > b.shotOffset ? a : b))
  log.add(T_FIRST_SHOT + last.shotOffset + 3, 'phase', 'Last shot. The waist cats are secured and the landing area cleared.', {
    narration: 'waist-clear',
    detail: 'Shuttles aft, JBDs flush, slot seals out, the bubble lowered and locked. The waist cat officer signals the arresting gear officer with an arm overhead.',
  })
}
