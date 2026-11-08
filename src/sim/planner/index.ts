import type { Timeline } from '../types'
import { DECK } from '../../data/deck'

/**
 * Temporary stub: parks the air wing on the launch spot with a handful of crew, so the
 * renderer can be exercised. Replaced by the real planner (launch / recovery / respot).
 */
export function buildTimeline(): Timeline {
  const duration = 60
  const spots = DECK.spots.launch
  const aircraft = spots.slice(0, 20).map((s, i) => ({
    id: `ac-${i}`,
    type: (i % 7 === 6 ? 'EA18G' : i % 3 === 0 ? 'FA18F' : 'FA18E') as 'FA18E',
    modex: String(200 + i),
    squadron: 'VFA-00',
    event: i < 12 ? 2 : 3,
    track: [
      { t: 0, x: s.x, y: s.y, heading: s.heading, wings: 'folded' as const, status: 'parked' as const },
      { t: duration, x: s.x, y: s.y, heading: s.heading, wings: 'folded' as const, status: 'parked' as const },
    ],
  }))
  const crew = Object.entries(DECK.stations).map(([k, p], i) => ({
    id: `crew-${i}`,
    role: (k.startsWith('lso') ? 'lso' : k.includes('ag') ? 'ag-crew' : 'director') as 'director',
    label: k,
    track: [{ t: 0, x: p.x, y: p.y, heading: 0, action: 'idle' as const }],
  }))
  return {
    duration,
    phases: [
      { id: 'prelaunch', title: 'Pre-launch', blurb: 'Stub.', tStart: 0, tEnd: 20 },
      { id: 'launch', title: 'Launch', blurb: 'Stub.', tStart: 20, tEnd: 40 },
      { id: 'recovery', title: 'Recovery', blurb: 'Stub.', tStart: 40, tEnd: 60 },
    ],
    aircraft,
    crew,
    vehicles: [{ id: 'tilly', kind: 'crash-crane', track: [{ t: 0, x: DECK.stations.tilly!.x, y: DECK.stations.tilly!.y, heading: 0 }] }],
    equipment: [{ t: 0, jbd: [0, 0, 0, 0], shuttle: [0, 0, 0, 0], wire: [0, 0, 0, 0], deck: 'red' }],
    events: [{ t: 0, kind: 'phase', text: 'Flight quarters' }],
    pattern: [],
  }
}
