import type { AircraftType } from '../types'

/**
 * The scenario: one day Case I cycle on a 1+30 schedule, built from §6.2 of
 * docs/research/00-DOMAIN-REFERENCE.md. Event N launches 12 jets off all four catapults,
 * the waist is secured, Event N-1 recovers 12 jets (with one bolter and one foul-deck
 * wave-off), then the deck is respotted for Event N+1.
 *
 * All times are simulation seconds from the start of the scenario.
 */

/** first catapult shot */
export const T_FIRST_SHOT = 300
/** "Start the go": engines start */
export const T_START_GO = 20

export interface LaunchSlot {
  /** parking slot id in data/deck.ts (launch spot) */
  slot: string
  cat: 1 | 2 | 3 | 4
  /** shot time offset from T_FIRST_SHOT, seconds */
  shotOffset: number
  type: AircraftType
  modex: string
  squadron: string
  tanker?: boolean
  armed?: boolean
  /** the cat-3 suspend: the first attempt is suspended this many seconds before the shot and re-run */
  suspend?: boolean
  /** route via these poses (slot -> via -> queue) */
  via?: { x: number; y: number; heading: number }[]
}

/**
 * Planned shots (mm:ss after the first shot), following the reference cycle:
 *   Cat 1: 0:00 (tanker), 1:40, 4:20     Cat 4: 0:20, 2:05, 5:00
 *   Cat 2: 0:50, 2:40, 5:40              Cat 3: 1:15, 3:30, 6:10 suspended → 7:50
 * Feed order respects the deck: stern and waist jets (inside the landing area) go first off
 * the waist cats, and El 1 stays empty because the cat 1 queue slot overlies it.
 */
export const LAUNCHERS: LaunchSlot[] = [
  { slot: 'PT1', cat: 1, shotOffset: 0, type: 'FA18E', modex: '211', squadron: 'VFA-11', tanker: true },
  { slot: 'FI1', cat: 4, shotOffset: 20, type: 'FA18F', modex: '103', squadron: 'VFA-103', armed: true },
  { slot: 'SP2', cat: 2, shotOffset: 50, type: 'FA18E', modex: '305', squadron: 'VFA-31' },
  { slot: 'FT2', cat: 3, shotOffset: 75, type: 'EA18G', modex: '501', squadron: 'VAQ-137' },
  { slot: 'PT2', cat: 1, shotOffset: 100, type: 'FA18E', modex: '204', squadron: 'VFA-11', armed: true },
  { slot: 'FT1', cat: 4, shotOffset: 125, type: 'FA18E', modex: '312', squadron: 'VFA-31', via: [{ x: 170, y: -45, heading: 0 }] },
  { slot: 'SP3', cat: 2, shotOffset: 160, type: 'FA18F', modex: '106', squadron: 'VFA-103', armed: true },
  { slot: 'FT3', cat: 3, shotOffset: 210, type: 'FA18E', modex: '301', squadron: 'VFA-31' },
  { slot: 'CO1', cat: 1, shotOffset: 260, type: 'FA18E', modex: '207', squadron: 'VFA-11' },
  { slot: 'E4A', cat: 4, shotOffset: 300, type: 'FA18F', modex: '111', squadron: 'VFA-103', via: [{ x: 215, y: -62, heading: 10 }] },
  { slot: 'CO2', cat: 2, shotOffset: 340, type: 'EA18G', modex: '504', squadron: 'VAQ-137' },
  { slot: 'E3A', cat: 3, shotOffset: 470, type: 'FA18E', modex: '310', squadron: 'VFA-31', suspend: true, armed: true },
]

/** Jets that stay parked through the launch and recovery (down for maintenance, spares). */
export const PARKED: { slot: string; type: AircraftType; modex: string; squadron: string }[] = [
  { slot: 'E2A', type: 'FA18E', modex: '202', squadron: 'VFA-11' },
  { slot: 'E2B', type: 'FA18F', modex: '112', squadron: 'VFA-103' },
  { slot: 'HH1', type: 'EA18G', modex: '503', squadron: 'VAQ-137' },
  { slot: 'E3B', type: 'FA18E', modex: '313', squadron: 'VFA-31' },
  { slot: 'PA1', type: 'FA18E', modex: '214', squadron: 'VFA-11' },
  { slot: 'PA2', type: 'FA18F', modex: '114', squadron: 'VFA-103' },
  { slot: 'E4B', type: 'FA18E', modex: '307', squadron: 'VFA-31' },
  { slot: 'SP4', type: 'FA18E', modex: '210', squadron: 'VFA-11' },
  { slot: 'SP5', type: 'FA18F', modex: '110', squadron: 'VFA-103' },
]

export interface RecoveryJet {
  type: AircraftType
  modex: string
  squadron: string
  /** which bow slot it taxis to after the trap */
  slot: string
  /** planned touchdown time (sim seconds) of the FIRST pass */
  touchdown: number
  /** wire caught on the successful pass (1-4) */
  wire: 1 | 2 | 3 | 4
  outcome: 'trap' | 'bolter-then-trap' | 'waveoff-then-trap'
  /** touchdown time of the second pass if the first failed */
  secondPass?: number
  /** the hook runner finds a hung wire: extra seconds in the wires */
  hungWire?: boolean
  armed?: boolean
  tanker?: boolean
}

/** Last waist shot at 770; waist secured and deck green by about 860. First trap at 890. */
export const T_GREEN_DECK = 860
export const T_FIRST_TRAP = 890
const TRAP_INTERVAL = 50

/** Event N-1: 11 jets plus the previous recovery tanker, which lands last. */
export const RECOVERY: RecoveryJet[] = [
  { type: 'FA18E', modex: '203', squadron: 'VFA-11', slot: 'B1S', touchdown: T_FIRST_TRAP, wire: 3, outcome: 'trap' },
  { type: 'FA18F', modex: '102', squadron: 'VFA-103', slot: 'B1P', touchdown: T_FIRST_TRAP + TRAP_INTERVAL, wire: 3, outcome: 'trap', armed: true },
  { type: 'FA18E', modex: '302', squadron: 'VFA-31', slot: 'B2S', touchdown: T_FIRST_TRAP + 2 * TRAP_INTERVAL, wire: 2, outcome: 'trap' },
  { type: 'EA18G', modex: '502', squadron: 'VAQ-137', slot: 'B2C', touchdown: T_FIRST_TRAP + 3 * TRAP_INTERVAL, wire: 3, outcome: 'trap' },
  { type: 'FA18E', modex: '206', squadron: 'VFA-11', slot: 'B2P', touchdown: T_FIRST_TRAP + 4 * TRAP_INTERVAL, wire: 4, outcome: 'trap', armed: true },
  { type: 'FA18F', modex: '105', squadron: 'VFA-103', slot: 'B3S', touchdown: T_FIRST_TRAP + 5 * TRAP_INTERVAL, wire: 3, outcome: 'trap' },
  // jet A bolters at 1190 and comes back around 2.5 min later
  { type: 'FA18E', modex: '304', squadron: 'VFA-31', slot: 'B3C', touchdown: T_FIRST_TRAP + 6 * TRAP_INTERVAL, wire: 3, outcome: 'bolter-then-trap', secondPass: T_FIRST_TRAP + 10 * TRAP_INTERVAL },
  { type: 'FA18E', modex: '212', squadron: 'VFA-11', slot: 'B3P', touchdown: T_FIRST_TRAP + 7 * TRAP_INTERVAL, wire: 3, outcome: 'trap', hungWire: true },
  // jet 9 is waved off for a foul deck (jet 8's tail still across the foul line) and comes back
  { type: 'FA18F', modex: '107', squadron: 'VFA-103', slot: 'B4S', touchdown: T_FIRST_TRAP + 7 * TRAP_INTERVAL + 35, wire: 2, outcome: 'waveoff-then-trap', secondPass: T_FIRST_TRAP + 11 * TRAP_INTERVAL, armed: true },
  { type: 'FA18E', modex: '303', squadron: 'VFA-31', slot: 'B4C', touchdown: T_FIRST_TRAP + 9 * TRAP_INTERVAL, wire: 3, outcome: 'trap' },
  { type: 'EA18G', modex: '505', squadron: 'VAQ-137', slot: 'B4P', touchdown: T_FIRST_TRAP + 12 * TRAP_INTERVAL, wire: 3, outcome: 'trap' },
  { type: 'FA18E', modex: '201', squadron: 'VFA-11', slot: 'B5S', touchdown: T_FIRST_TRAP + 13 * TRAP_INTERVAL, wire: 3, outcome: 'trap', tanker: true },
]

/** Last trap at 1540; "recovery complete" and the last jet chained by about 1720. */
export const T_RECOVERY_COMPLETE = 1545
export const T_RESPOT_START = 1600
/** End of the scenario: the deck is respotted for Event N+1 and the cycle would repeat. */
export const T_END = 2400

export const PHASES = [
  { id: 'prelaunch' as const, title: 'Man up and start', blurb: 'Plane captains start the jets, blue shirts pull chains and chocks, and the yellow shirts begin walking the launchers toward the catapults.', tStart: 0, tEnd: T_FIRST_SHOT },
  { id: 'launch' as const, title: 'Launch', blurb: 'Twelve jets off four catapults in under eight minutes. Each pair of cats alternates; the waist cats go first because they sit inside the landing area.', tStart: T_FIRST_SHOT, tEnd: 770 },
  { id: 'respot-recovery' as const, title: 'Clear the landing area', blurb: 'The waist catapults are secured, the arresting gear is set and manned, and the Air Boss turns the deck green.', tStart: 770, tEnd: T_FIRST_TRAP - 20 },
  { id: 'recovery' as const, title: 'Recovery', blurb: 'Twelve traps about fifty seconds apart. Every jet that lands is clear of the foul line in under thirty seconds, or the next one is waved off.', tStart: T_FIRST_TRAP - 20, tEnd: T_RESPOT_START },
  { id: 'respot-launch' as const, title: 'Respot', blurb: 'Tractors tow the recovered jets off the bow into the launch spot for the next event while they are fuelled and armed.', tStart: T_RESPOT_START, tEnd: T_END },
]
