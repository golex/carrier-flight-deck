import { DECK } from '../../data/deck'
import { VehicleBuilder } from './toolkit'
import type { World } from './world'

/**
 * STUB — replaced by the ambient crew builder: crash and salvage at the junkyard, Tilly and the
 * P-25, fuel crews, maintenance at the parked jets, the Handler in Flight Deck Control, medical,
 * tractor pool, and the Air Boss marker.
 */
export function buildAmbient(w: World): void {
  const t = DECK.stations.tilly!
  w.vehicles.push(new VehicleBuilder('tilly', 'crash-crane', t, 180, 0))
  const p = DECK.stations.p25!
  w.vehicles.push(new VehicleBuilder('p25', 'fire-truck', p, -90, 0))
}
