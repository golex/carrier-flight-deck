import type { Timeline } from '../types'
import { PHASES, T_END } from './scenario'
import { buildPrelaunchAndLaunch } from './launch'
import { buildRecovery } from './recovery'
import { buildRespot } from './respot'
import { buildAmbient } from './ambient'
import { newWorld } from './world'

/**
 * Builds the whole scenario as precomputed keyframe tracks. Each phase builder appends to the
 * shared World; the order matters only where one phase continues another's aircraft.
 */
export function buildTimeline(): Timeline {
  const w = newWorld()
  buildPrelaunchAndLaunch(w)
  const pattern = buildRecovery(w)
  buildRespot(w)
  buildAmbient(w)

  const aircraft = [...w.aircraft.values()].map(a => {
    const e = a.build()
    // every track ends at the scenario end so late scrubbing samples a defined state
    const last = e.track[e.track.length - 1]!
    if (last.t < T_END) e.track.push({ ...last, t: T_END })
    return e
  })
  const crew = w.crew.map(c => {
    const e = c.build()
    const last = e.track[e.track.length - 1]!
    if (last.t < T_END) e.track.push({ ...last, t: T_END })
    return e
  })
  const vehicles = w.vehicles.map(v => v.build())

  return {
    duration: T_END,
    phases: PHASES,
    aircraft,
    crew,
    vehicles,
    equipment: w.eq.build(),
    events: w.log.build(),
    pattern,
  }
}
