import type { PatternEntity } from '../types'
import { RECOVERY } from './scenario'
import { AircraftBuilder } from './toolkit'
import type { World } from './world'

/**
 * STUB — replaced by the recovery phase builder: the Case I pattern, traps, bolter, wave-off,
 * rollout, wing fold, taxi to the bow and tie-down, with LSOs, arresting gear crew, directors
 * and blue shirts. Returns the overhead-pattern tracks for the inset.
 */
export function buildRecovery(w: World): PatternEntity[] {
  for (const R of RECOVERY) {
    const ab = new AircraftBuilder(R.modex, R.type, R.modex, R.squadron, 1, { x: -500, y: 0, heading: 0 }, 'spread', 'airborne', 0)
    w.aircraft.set(R.modex, ab)
  }
  return []
}
