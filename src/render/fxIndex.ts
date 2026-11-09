// Lane C: the FX trigger index. Built once from the timeline; every effect looks its triggers up here by
// binary search on t, so all effects are closed-form in sim time and scrubbing is exact.
import type { FxIndex, CatStatus, CatId, JetSample, ShotFx, TouchFx, WaveoffFx, TensionFx, EdgeFx } from './frame'
import { hash01 } from './frame'
import type { AircraftEntity, AircraftStatus, EquipmentKeyframe, Timeline, Vec2 } from '../sim/types'
import type { AircraftState } from '../sim/sample'
import type { Catapult, DeckGeometry } from '../data/deckTypes'

/** Index data that the shared FxIndex type has no slot for (kept beside it, keyed by the index object). */
interface FxExtra {
  /** sim time the recovery phase begins (cats 3 and 4 are SECURED from then on) */
  recoveryStart: number
  /** tension windows sorted by t0, and the longest window, for a bounded binary search */
  maxTension: number
  /** the windows that end in a shot (t1 === that shot's t), by `${id}@${t1}` */
  shotEnds: Set<string>
  cats: Catapult[]
  byId: Map<string, AircraftEntity>
}
const extras = new WeakMap<FxIndex, FxExtra>()

/** Extra index data for consumers inside lane C (fx.ts). */
export function fxExtra(fxi: FxIndex): FxExtra | undefined {
  return extras.get(fxi)
}

const ON_CAT: ReadonlySet<AircraftStatus> = new Set<AircraftStatus>(['on-cat', 'tension', 'salute'])

function nearestCat(cats: readonly Catapult[], p: Vec2): Catapult {
  let best = cats[0]!
  let bd = Infinity
  for (const c of cats) {
    const d = (c.start.x - p.x) ** 2 + (c.start.y - p.y) ** 2
    if (d < bd) {
      bd = d
      best = c
    }
  }
  return best
}

/** Once at startup; arrays sorted by t. */
export function buildFxIndex(tl: Timeline, g: DeckGeometry): FxIndex {
  const shots: ShotFx[] = []
  const touchdowns: TouchFx[] = []
  const waveoffs: WaveoffFx[] = []
  const tension: TensionFx[] = []
  const shotEnds = new Set<string>()
  const byId = new Map<string, AircraftEntity>()

  for (const a of tl.aircraft) {
    byId.set(a.id, a)
    const tr = a.track
    let tensionStart: number | null = null
    let tensionCat: CatId = 1
    for (let i = 0; i < tr.length; i++) {
      const k = tr[i]!
      const prev = i > 0 ? tr[i - 1]!.status : null
      if (prev === k.status) continue
      // first 'shot' keyframe after a non-shot keyframe
      if (k.status === 'shot') {
        const cat = nearestCat(g.catapults, k).id
        shots.push({ cat, t: k.t, id: a.id, heavy: k.power === 2 })
        if (tensionStart !== null) {
          tension.push({ cat: tensionCat, id: a.id, t0: tensionStart, t1: k.t })
          shotEnds.add(`${a.id}@${k.t}`)
        }
        tensionStart = null
      } else if (k.status === 'tension' && prev !== 'salute') {
        tensionStart = k.t
        tensionCat = nearestCat(g.catapults, k).id
      } else if (tensionStart !== null && k.status !== 'salute' && k.status !== 'tension') {
        // suspended: the window closes without a shot
        tension.push({ cat: tensionCat, id: a.id, t0: tensionStart, t1: k.t })
        tensionStart = null
      }
      if (prev === 'groove' && (k.status === 'trap' || k.status === 'bolter')) {
        touchdowns.push({ t: k.t, id: a.id, x: k.x, y: k.y, heading: k.heading, kind: k.status })
      }
      if (k.status === 'waveoff') waveoffs.push({ t: k.t, id: a.id, x: k.x, y: k.y })
    }
  }

  // equipment edges (keyframes are piecewise linear: crossing times are interpolated)
  const jbdDown: EdgeFx[] = []
  const wireUp: EdgeFx[] = []
  const wireDown: EdgeFx[] = []
  const eq = tl.equipment
  for (let i = 1; i < eq.length; i++) {
    const a = eq[i - 1]!
    const b = eq[i]!
    for (let k = 0; k < 4; k++) {
      const ja = a.jbd[k]!
      const jb = b.jbd[k]!
      if (ja > 0.5 && jb <= 0.5) {
        const u = ja === jb ? 0 : (ja - 0.5) / (ja - jb)
        jbdDown.push({ index: k, t: a.t + (b.t - a.t) * u })
      }
      const wa = a.wire[k]!
      const wb = b.wire[k]!
      if (wa <= 0.001 && wb > 0.001) wireUp.push({ index: k, t: a.t })
      if (wa > 0.001 && wb <= 0.001) wireDown.push({ index: k, t: b.t })
    }
  }

  // 30 pre-seeded skid marks in the touchdown zone
  const oldSkids: { x: number; y: number; heading: number }[] = []
  for (let i = 0; i < 30; i++) {
    oldSkids.push({ x: 230 + 60 * hash01(i, 71), y: -30 + 20 * hash01(i, 72), heading: -9 })
  }

  const byT = <T extends { t: number }>(arr: T[]) => arr.sort((p, q) => p.t - q.t)
  byT(shots)
  byT(touchdowns)
  byT(waveoffs)
  byT(jbdDown)
  byT(wireUp)
  byT(wireDown)
  tension.sort((p, q) => p.t0 - q.t0)

  const fxi: FxIndex = { shots, touchdowns, waveoffs, tension, jbdDown, wireUp, wireDown, oldSkids }
  const rec = tl.phases.find(p => p.id === 'recovery')
  extras.set(fxi, {
    recoveryStart: rec ? rec.tStart : Infinity,
    maxTension: tension.reduce((m, w) => Math.max(m, w.t1 - w.t0), 0),
    shotEnds,
    cats: g.catapults,
    byId,
  })
  return fxi
}

/** Items with t0 <= t <= t1, by binary search on t (arr sorted by t). */
export function inWindow<T extends { t: number }>(arr: readonly T[], t0: number, t1: number): T[] {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid]!.t < t0) lo = mid + 1
    else hi = mid
  }
  const out: T[] = []
  for (let i = lo; i < arr.length && arr[i]!.t <= t1; i++) out.push(arr[i]!)
  return out
}

/** The last n items with t < tMax (binary search), oldest first. */
export function lastBefore<T extends { t: number }>(arr: readonly T[], tMax: number, n: number): T[] {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid]!.t < tMax) lo = mid + 1
    else hi = mid
  }
  return arr.slice(Math.max(0, lo - n), lo)
}

/** Tension windows with t0 - padBefore <= t <= t1 + padAfter (binary search on t0, bounded by the longest window). */
export function tensionAt(fxi: FxIndex, t: number, padAfter = 0): TensionFx[] {
  const ex = extras.get(fxi)
  const arr = fxi.tension
  const from = t - (ex ? ex.maxTension : Infinity) - padAfter
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid]!.t0 < from) lo = mid + 1
    else hi = mid
  }
  const out: TensionFx[] = []
  for (let i = lo; i < arr.length && arr[i]!.t0 <= t; i++) {
    const w = arr[i]!
    if (t <= w.t1 + padAfter) out.push(w)
  }
  return out
}

/** Does this tension window end in its shot (rather than a suspend)? */
export function endsInShot(fxi: FxIndex, w: TensionFx): boolean {
  return !!extras.get(fxi)?.shotEnds.has(`${w.id}@${w.t1}`)
}

/** The catapult a deck jet is on (on-cat, tension, salute, shot), or null. */
export function catOfJet(fxi: FxIndex, s: AircraftState, t: number): CatId | null {
  if (s.status === 'shot') {
    const w = inWindow(fxi.shots, t - 3, t)
    for (let i = w.length - 1; i >= 0; i--) if (w[i]!.id === s.id) return w[i]!.cat
    return null
  }
  if (!ON_CAT.has(s.status)) return null
  const ex = extras.get(fxi)
  if (!ex) return null
  const c = nearestCat(ex.cats, s)
  // the jet's reference sits ~7 ft aft of the battery; a jet taxiing on just short of it is still "on" the cat
  return (c.start.x - s.x) ** 2 + (c.start.y - s.y) ** 2 < 40 * 40 ? c.id : null
}

export function catStatusAt(fxi: FxIndex, jets: JetSample[], eq: EquipmentKeyframe, t: number, cat: CatId): CatStatus {
  const ex = extras.get(fxi)
  if (ex && (cat === 3 || cat === 4) && t >= ex.recoveryStart) return { word: 'SECURED', countdown: null }

  let jet: AircraftState | null = null
  for (const { s } of jets) {
    if (!s || !s.visible) continue
    if (catOfJet(fxi, s, t) === cat) {
      jet = s
      break
    }
  }
  let countdown: number | null = null
  for (const w of tensionAt(fxi, t)) {
    if (w.cat === cat && endsInShot(fxi, w)) countdown = Math.max(0, w.t1 - t)
  }
  if (jet) {
    if (jet.status === 'shot') return { word: 'SHOT', countdown: null }
    if (jet.status === 'salute') return { word: 'FINAL', countdown }
    if (jet.status === 'tension') return { word: 'TENSION', countdown }
    if (jet.status === 'on-cat') return { word: 'SPOT', countdown: null }
  }
  const sh = eq.shuttle[cat - 1]!
  // any shuttle off the battery with no jet on it is retracting, including one parked at the end of stroke
  // (it sits at 1 for ~8 s after the shot before the run aft)
  if (sh > 0.001) return { word: 'RETRACT', countdown: null }
  return { word: 'SAFE', countdown: null }
}
