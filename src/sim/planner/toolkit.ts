import type {
  AircraftEntity,
  AircraftKeyframe,
  AircraftStatus,
  AircraftType,
  CrewAction,
  CrewEntity,
  CrewKeyframe,
  CrewRole,
  EquipmentKeyframe,
  EventKind,
  SimEvent,
  Vec2,
  VehicleEntity,
  WingState,
} from '../types'
import type { Pose } from '../../data/deckTypes'
import { dist, headingTo, offset, pathToKeyframes, taxiPath } from '../track'

/**
 * Choreography toolkit. Every builder appends keyframes in time order and keeps a "cursor"
 * (the time of its last keyframe) so a phase can be written as a readable script:
 *
 *   jet.holdUntil(t0); jet.taxiTo(node, 6); jet.spreadWings(); ...
 *
 * All units: feet, seconds, degrees (see sim/types.ts).
 */

export const TAXI_SPEED = 6 // ft/s cruise under own power
export const TOW_SPEED = 4 // ft/s under tow
export const WALK_SPEED = 5 // ft/s crew walking
export const RUN_SPEED = 15 // ft/s hook runner sprint
export const WING_FOLD_S = 12

export type Pose3 = Pose

export class AircraftBuilder {
  readonly kf: AircraftKeyframe[] = []
  pose: Pose
  wings: WingState
  status: AircraftStatus
  hook = false
  launchBar = false
  power: 0 | 1 | 2 = 0

  constructor(
    public readonly id: string,
    public readonly type: AircraftType,
    public readonly modex: string,
    public readonly squadron: string,
    public readonly event: number,
    start: Pose,
    wings: WingState = 'folded',
    status: AircraftStatus = 'parked',
    t0 = 0,
  ) {
    this.pose = { ...start }
    this.wings = wings
    this.status = status
    this.key(t0)
  }

  get t(): number {
    return this.kf.length ? this.kf[this.kf.length - 1]!.t : 0
  }

  /** Append a keyframe at time t with the current state. */
  key(t: number): this {
    const last = this.kf[this.kf.length - 1]
    if (last && t < last.t - 1e-6) throw new Error(`${this.id}: keyframe time goes backwards (${t} < ${last.t})`)
    this.kf.push({
      t,
      x: this.pose.x,
      y: this.pose.y,
      heading: this.pose.heading,
      wings: this.wings,
      status: this.status,
      hook: this.hook,
      launchBar: this.launchBar,
      power: this.power,
    })
    return this
  }

  /** Hold the current state until time t (no-op if t is in the past). */
  holdUntil(t: number): this {
    if (t > this.t + 1e-6) this.key(t)
    return this
  }

  wait(seconds: number): this {
    return this.key(this.t + seconds)
  }

  set(patch: Partial<{ status: AircraftStatus; wings: WingState; hook: boolean; launchBar: boolean; power: 0 | 1 | 2 }>): this {
    if (patch.status !== undefined) this.status = patch.status
    if (patch.wings !== undefined) this.wings = patch.wings
    if (patch.hook !== undefined) this.hook = patch.hook
    if (patch.launchBar !== undefined) this.launchBar = patch.launchBar
    if (patch.power !== undefined) this.power = patch.power
    return this
  }

  /** Change state instantly at the cursor (emits a zero-length segment so the change is a step). */
  change(patch: Parameters<AircraftBuilder['set']>[0]): this {
    this.key(this.t)
    this.set(patch)
    return this.key(this.t)
  }

  /** Teleport (used for airborne → appearing in the groove). */
  jumpTo(pose: Pose): this {
    this.pose = { ...pose }
    return this
  }

  /** Spread or fold the wings over WING_FOLD_S seconds at the cursor, while stationary. */
  spreadWings(): this {
    this.key(this.t)
    this.wings = 'spread'
    return this.key(this.t + WING_FOLD_S)
  }
  foldWings(): this {
    this.key(this.t)
    this.wings = 'folded'
    return this.key(this.t + WING_FOLD_S)
  }

  /**
   * Taxi along a smooth curve from the current pose to `to`, at `speed` ft/s with ease-in/out.
   * `via` points bend the curve; each leg is a bezier between consecutive poses.
   * Returns the arrival time.
   */
  taxiTo(to: Pose, speed = TAXI_SPEED, status: AircraftStatus = 'taxiing', via: Pose[] = []): number {
    const legs: Pose[] = [...via, to]
    this.key(this.t)
    this.status = status
    let from = this.pose
    for (const leg of legs) {
      const pts = taxiPath(from, from.heading, leg, leg.heading, 20, 0.35)
      let L = 0
      for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1]!, pts[i]!)
      const dur = Math.max(2, L / speed)
      const t0 = this.t
      const frames = pathToKeyframes(pts, t0, t0 + dur, {}, true)
      for (let i = 1; i < frames.length; i++) {
        const f = frames[i]!
        this.pose = { x: f.x, y: f.y, heading: f.heading }
        this.key(f.t)
      }
      from = this.pose
    }
    return this.t
  }

  /** Straight-line move at constant speed (catapult stroke, rollout, creeping onto the shuttle). */
  moveStraight(to: Vec2, seconds: number, heading = this.pose.heading, ease: 'none' | 'in' | 'out' = 'none'): this {
    const from = { ...this.pose }
    const n = Math.max(2, Math.ceil(seconds * 4))
    const t0 = this.t
    for (let i = 1; i <= n; i++) {
      let u = i / n
      if (ease === 'in') u = u * u
      else if (ease === 'out') u = 1 - (1 - u) * (1 - u)
      this.pose = { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u, heading }
      this.key(t0 + (seconds * i) / n)
    }
    return this
  }

  /** Pivot in place to a new heading at `rate` deg/s. */
  turnTo(heading: number, rate = 12): this {
    const d = Math.abs(((heading - this.pose.heading + 540) % 360) - 180)
    this.key(this.t)
    this.pose = { ...this.pose, heading }
    return this.key(this.t + Math.max(1, d / rate))
  }

  /** Vanish from the deck (airborne) at the cursor. */
  depart(): this {
    this.key(this.t)
    this.status = 'airborne'
    return this.key(this.t)
  }

  build(): AircraftEntity {
    return { id: this.id, type: this.type, modex: this.modex, squadron: this.squadron, event: this.event, track: this.kf }
  }
}

/** The cut-back starboard bow deck edge (deck.ts outline (770,120) -> (850,65)) and a walking point inboard of it. */
const BOW_CUT: [Vec2, Vec2] = [
  { x: 770, y: 120 },
  { x: 850, y: 65 },
]
const BOW_CUT_WAYPOINT: Vec2 = { x: 840, y: 55 }

function segmentsCross(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
  const o = (p: Vec2, q: Vec2, r: Vec2) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0
}

export class CrewBuilder {
  readonly kf: CrewKeyframe[] = []
  pos: Vec2
  heading: number
  action: CrewAction

  constructor(
    public readonly id: string,
    public readonly role: CrewRole,
    public readonly label: string,
    start: Vec2,
    heading = 0,
    action: CrewAction = 'idle',
    t0 = 0,
  ) {
    this.pos = { ...start }
    this.heading = heading
    this.action = action
    this.key(t0)
  }

  get t(): number {
    return this.kf.length ? this.kf[this.kf.length - 1]!.t : 0
  }

  key(t: number): this {
    const last = this.kf[this.kf.length - 1]
    if (last && t < last.t - 1e-6) throw new Error(`${this.id}: keyframe time goes backwards (${t} < ${last.t})`)
    this.kf.push({ t, x: this.pos.x, y: this.pos.y, heading: this.heading, action: this.action })
    return this
  }

  holdUntil(t: number): this {
    if (t > this.t + 1e-6) this.key(t)
    return this
  }

  wait(seconds: number): this {
    return this.key(this.t + seconds)
  }

  /** Change action (and optionally facing) at the cursor as a step. */
  act(action: CrewAction, heading?: number): this {
    this.key(this.t)
    this.action = action
    if (heading !== undefined) this.heading = heading
    return this.key(this.t)
  }

  face(p: Vec2): this {
    this.key(this.t)
    this.heading = headingTo(this.pos, p)
    return this.key(this.t)
  }

  /**
   * Walk in a straight line to `to` at `speed`, facing the direction of travel. Returns arrival time.
   * A line that would cut across the cut-back starboard bow edge goes via a point inboard of it instead.
   */
  walkTo(to: Vec2, speed = WALK_SPEED, action: CrewAction = 'walk'): number {
    const d = dist(this.pos, to)
    if (d < 0.5) return this.t
    if (segmentsCross(this.pos, to, BOW_CUT[0], BOW_CUT[1]) && dist(this.pos, BOW_CUT_WAYPOINT) > 0.5 && dist(to, BOW_CUT_WAYPOINT) > 0.5) {
      this.walkTo(BOW_CUT_WAYPOINT, speed, action)
      return this.walkTo(to, speed, action)
    }
    this.key(this.t)
    this.action = action
    this.heading = headingTo(this.pos, to)
    this.key(this.t)
    this.pos = { ...to }
    this.key(this.t + d / speed)
    this.action = 'idle'
    return this.t
  }

  /** Walk so as to arrive exactly at time tArrive (waits first if there is slack). */
  arriveAt(to: Vec2, tArrive: number, speed = WALK_SPEED, action: CrewAction = 'walk'): this {
    const d = dist(this.pos, to)
    const dur = d / speed
    this.holdUntil(Math.max(this.t, tArrive - dur))
    this.walkTo(to, speed, action)
    return this
  }

  /** Walk via several points. */
  walkVia(points: Vec2[], speed = WALK_SPEED): number {
    for (const p of points) this.walkTo(p, speed)
    return this.t
  }

  /**
   * Keep pace with a moving reference: follow a list of (t, pos) samples with a fixed offset. A sample the
   * walker cannot reach at `maxSpeed` (a late start, or an offset point swept round by a fast pivot) is skipped,
   * so he holds or runs straight to the first reachable one instead of snapping onto it.
   */
  follow(samples: { t: number; x: number; y: number; heading: number }[], forward: number, right: number, action: CrewAction = 'walk', maxSpeed = RUN_SPEED): this {
    this.key(this.t)
    this.action = action
    for (const s of samples) {
      if (s.t < this.t - 1e-6) continue
      const p = offset(s, s.heading, forward, right)
      if (dist(this.pos, p) > maxSpeed * (s.t - this.t) + 0.5) continue
      this.pos = p
      this.heading = s.heading
      this.key(s.t)
    }
    return this
  }

  build(): CrewEntity {
    return { id: this.id, role: this.role, label: this.label, track: this.kf }
  }
}

export class VehicleBuilder {
  readonly kf: VehicleEntity['track'] = []
  pos: Vec2
  heading: number

  constructor(public readonly id: string, public readonly kind: VehicleEntity['kind'], start: Vec2, heading = 0, t0 = 0) {
    this.pos = { ...start }
    this.heading = heading
    this.key(t0)
  }
  get t(): number {
    return this.kf.length ? this.kf[this.kf.length - 1]!.t : 0
  }
  key(t: number): this {
    this.kf.push({ t, x: this.pos.x, y: this.pos.y, heading: this.heading })
    return this
  }
  holdUntil(t: number): this {
    if (t > this.t + 1e-6) this.key(t)
    return this
  }
  driveTo(to: Pose, speed = 8): number {
    const pts = taxiPath(this.pos, this.heading, to, to.heading, 16, 0.35)
    let L = 0
    for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1]!, pts[i]!)
    const dur = Math.max(1.5, L / speed)
    const frames = pathToKeyframes(pts, this.t, this.t + dur, {}, true)
    for (let i = 1; i < frames.length; i++) {
      const f = frames[i]!
      this.pos = { x: f.x, y: f.y }
      this.heading = f.heading
      this.key(f.t)
    }
    return this.t
  }
  /** Follow aircraft keyframes at a fixed offset (tractor on the tow bar). */
  follow(samples: AircraftKeyframe[], forward: number, right = 0): this {
    for (const s of samples) {
      if (s.t < this.t - 1e-6) continue
      this.pos = offset(s, s.heading, forward, right)
      this.heading = s.heading
      this.key(s.t)
    }
    return this
  }
  build(): VehicleEntity {
    return { id: this.id, kind: this.kind, track: this.kf }
  }
}

/**
 * Deck equipment as a set of channel ramps. Phases may write in any order; build() samples every
 * channel at every ramp boundary so the sampler's linear interpolation reproduces each ramp exactly.
 */
export class EquipmentBuilder {
  private ramps: { ch: 'jbd' | 'shuttle' | 'wire'; i: number; t0: number; t1: number; v: number }[] = []
  private decks: { t: number; v: EquipmentKeyframe['deck'] }[] = []

  constructor(private readonly t0 = 0) {}

  /** Ramp a JBD to a raised fraction over `dur` seconds starting at t. */
  jbd(cat: 1 | 2 | 3 | 4, t: number, to: number, dur = 4): void {
    this.ramps.push({ ch: 'jbd', i: cat - 1, t0: t, t1: t + dur, v: to })
  }
  /** Move a shuttle along its track (0 battery .. 1 end of stroke). */
  shuttle(cat: 1 | 2 | 3 | 4, t: number, to: number, dur: number): void {
    this.ramps.push({ ch: 'shuttle', i: cat - 1, t0: t, t1: t + dur, v: to })
  }
  /** Run a wire out (1) or let it retract (0). */
  wire(n: 1 | 2 | 3 | 4, t: number, to: number, dur: number): void {
    this.ramps.push({ ch: 'wire', i: n - 1, t0: t, t1: t + dur, v: to })
  }
  deck(t: number, status: EquipmentKeyframe['deck']): void {
    this.decks.push({ t, v: status })
  }

  private value(ch: 'jbd' | 'shuttle' | 'wire', i: number, t: number): number {
    const rs = this.ramps.filter(r => r.ch === ch && r.i === i && r.t0 <= t + 1e-9).sort((a, b) => a.t0 - b.t0)
    let v = 0
    for (let k = 0; k < rs.length; k++) {
      const r = rs[k]!
      if (t >= r.t1 - 1e-9) v = r.v
      else {
        const u = r.t1 > r.t0 ? (t - r.t0) / (r.t1 - r.t0) : 1
        v = v + (r.v - v) * u
      }
    }
    return v
  }

  build(): EquipmentKeyframe[] {
    const times = new Set<number>([this.t0])
    for (const r of this.ramps) {
      times.add(r.t0)
      times.add(r.t1)
    }
    for (const d of this.decks) times.add(d.t)
    const decks = this.decks.slice().sort((a, b) => a.t - b.t)
    const out: EquipmentKeyframe[] = []
    for (const t of [...times].sort((a, b) => a - b)) {
      let deck: EquipmentKeyframe['deck'] = 'red'
      for (const d of decks) if (d.t <= t + 1e-9) deck = d.v
      const ch4 = (ch: 'jbd' | 'shuttle' | 'wire'): [number, number, number, number] => [
        this.value(ch, 0, t),
        this.value(ch, 1, t),
        this.value(ch, 2, t),
        this.value(ch, 3, t),
      ]
      out.push({ t, jbd: ch4('jbd'), shuttle: ch4('shuttle'), wire: ch4('wire'), deck })
    }
    return out
  }
}

export class EventLog {
  readonly events: SimEvent[] = []
  add(t: number, kind: EventKind, text: string, extra: Partial<Omit<SimEvent, 't' | 'kind' | 'text'>> = {}): SimEvent {
    const e: SimEvent = { t, kind, text, ...extra }
    this.events.push(e)
    return e
  }
  build(): SimEvent[] {
    return this.events.slice().sort((a, b) => a.t - b.t)
  }
}

/** Convenience: a position offset from a pose in its own frame (forward, right). */
export const rel = (p: Pose, forward: number, right: number): Vec2 => offset(p, p.heading, forward, right)

export const fmtMMSS = (t: number): string => {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
