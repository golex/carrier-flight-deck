// STUB: lane C fills this in
import type { FxIndex, CatStatus, CatId, JetSample } from './frame'
import type { EquipmentKeyframe, Timeline } from '../sim/types'
import type { DeckGeometry } from '../data/deckTypes'

/** Once at startup; arrays sorted by t. Stub: every list empty. */
export function buildFxIndex(_tl: Timeline, _g: DeckGeometry): FxIndex {
  return { shots: [], touchdowns: [], waveoffs: [], tension: [], jbdDown: [], wireUp: [], wireDown: [], oldSkids: [] }
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

export function catStatusAt(_fxi: FxIndex, _jets: JetSample[], _eq: EquipmentKeyframe, _t: number, _cat: CatId): CatStatus {
  return { word: null, countdown: null }
}
