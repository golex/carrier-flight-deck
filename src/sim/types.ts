/**
 * Core simulation types.
 *
 * World units are FEET in a ship-centered frame:
 *   x: along the keel, 0 at the stern (round-down), increasing toward the bow.
 *   y: across the deck, 0 on the ship centerline, positive to STARBOARD.
 * Headings are in degrees, 0 = pointing toward the bow (+x), positive = clockwise
 * when viewed from above (i.e. turning toward starboard).
 * Time is simulation seconds from the start of the scenario.
 */

export type Vec2 = { x: number; y: number }

export type AircraftType = 'FA18E' | 'FA18F' | 'EA18G'

export type WingState = 'folded' | 'spread'

/** Discrete visual states an aircraft can be in; drives sprite details. */
export type AircraftStatus =
  | 'parked'        // engines off, chocked & chained
  | 'manned'        // pilot aboard, engines starting/running, still chained
  | 'taxiing'       // moving under own power behind a yellow shirt
  | 'towed'         // being towed by a tractor
  | 'on-cat'        // launch bar in the shuttle, holdback engaged
  | 'tension'       // catapult tension taken, full power
  | 'salute'        // at power, controls wiped out, the pilot salutes the shooter
  | 'shot'          // the 2-second catapult stroke
  | 'airborne'      // off the deck (not drawn on deck; shown in pattern inset)
  | 'groove'        // final approach, visible crossing the ramp
  | 'trap'          // hook engaged, rolling out
  | 'bolter'        // missed the wires, going around
  | 'waveoff'       // waved off by the LSO
  | 'rollout'       // post-trap, hook up, taxiing clear of the LA

export interface AircraftKeyframe {
  t: number
  x: number
  y: number
  /** degrees, see file header */
  heading: number
  wings: WingState
  status: AircraftStatus
  /** optional: hook down (true) / up (false) */
  hook?: boolean
  /** optional: launch bar lowered */
  launchBar?: boolean
  /** optional: 0 idle, 1 military, 2 afterburner */
  power?: 0 | 1 | 2
}

export type CrewRole =
  | 'director'         // yellow: aircraft director / plane director
  | 'shooter'          // yellow: catapult officer
  | 'handler'          // yellow: aircraft handling officer (Flight Deck Control)
  | 'cat-crew'         // green: catapult crew (hookup, topside safety, deck-edge operator)
  | 'ag-crew'          // green: arresting gear crew, hook runner
  | 'maint'            // green: air wing maintenance / troubleshooter (squadron)
  | 'plane-handler'    // blue: chocks & chains, elevator operator
  | 'tractor-driver'   // blue
  | 'ordnance'         // red: ordies
  | 'crash-salvage'    // red: crash & salvage, firefighting
  | 'plane-captain'    // brown
  | 'fuels'            // purple: grapes
  | 'safety'           // white: safety observer
  | 'lso'              // white: landing signal officer
  | 'checker'          // white: final checker / squadron QA
  | 'medical'          // white with red cross
  | 'air-boss'         // in Pri-Fly (island), drawn as a marker only

export type CrewAction =
  | 'idle'
  | 'walk'
  | 'direct'        // yellow shirt signalling
  | 'hookup'        // at nose gear
  | 'check'         // final checker inspecting
  | 'chock'         // placing/removing chocks
  | 'chain'         // tie-down chains
  | 'fuel'
  | 'arm'
  | 'signal-launch' // the shooter's go: kneel and point down the catapult (deck-edge: press fire)
  | 'wave-off'      // suspend (crossed arms / open hand) or the LSO's red lights
  | 'thumbs-up'     // ready: hook-up PO, final checkers
  | 'hands-up'      // the shooter's final turn-up, both arms raised
  | 'salute'        // plane captain's salute to the pilot
  | 'pickle'        // LSO holding the pickle switch up through the groove
  | 'pass'          // a director points the pilot at the next director (hand-off)
  | 'watch'

export interface CrewKeyframe {
  t: number
  x: number
  y: number
  heading: number
  action: CrewAction
}

export interface AircraftEntity {
  id: string
  type: AircraftType
  /** e.g. "203"; shown at high zoom */
  modex: string
  squadron: string
  /** which flight event this jet belongs to (launching vs recovering) */
  event: number
  /** recovery tanker (first shot, lands last) */
  tanker?: boolean
  /** carries forward-firing ordnance: armed before the shot, de-armed after the trap */
  armed?: boolean
  /** one-line note for the selection panel, e.g. "Launches off cat 3, recovers to slot B2C" */
  note?: string
  track: AircraftKeyframe[]
  /** who has control of the aircraft over time: the yellow shirt (or shooter) the pilot takes direction from */
  control: ControlChange[]
}

/** A change of control at time t; `director` is a crew id, or null when nobody is directing the jet. */
export interface ControlChange {
  t: number
  director: string | null
}

export interface CrewEntity {
  id: string
  role: CrewRole
  /** optional human-readable role label, e.g. "Hookup PO, Cat 1" */
  label?: string
  track: CrewKeyframe[]
}

export interface VehicleEntity {
  id: string
  kind: 'tractor' | 'crash-crane' | 'fire-truck'
  track: { t: number; x: number; y: number; heading: number }[]
}

/** Deck equipment state, keyframed as discrete steps (sampled with linear interpolation). */
export interface EquipmentKeyframe {
  t: number
  /** JBD raised fraction 0..1 per catapult (index 0..3 = cat 1..4) */
  jbd: [number, number, number, number]
  /** shuttle position along each cat track, 0 = battery (aft end), 1 = end of stroke */
  shuttle: [number, number, number, number]
  /** per arresting wire (index 0..3 = wire 1..4): 0 = at rest, 1 = fully run out */
  wire: [number, number, number, number]
  /** deck status as set by the Air Boss */
  deck: 'red' | 'green' | 'foul'
}

export type PhaseId =
  | 'prelaunch'
  | 'launch'
  | 'respot-recovery'
  | 'recovery'
  | 'respot-launch'

export interface Phase {
  id: PhaseId
  title: string
  /** short explanatory blurb shown in the panel */
  blurb: string
  tStart: number
  tEnd: number
}

export type EventKind =
  | 'phase' | 'cat' | 'trap' | 'bolter' | 'waveoff' | 'deck' | 'taxi' | 'crew' | 'info' | 'pattern'

export interface SimEvent {
  t: number
  kind: EventKind
  /** one-line headline for the ticker, e.g. "Cat 1 — 203 away" */
  text: string
  /** optional focus point for the "follow" camera */
  focus?: Vec2
  /** optional detail for the panel */
  detail?: string
  /** optional id of narration clip to play */
  narration?: string
}

/** Aircraft positions in the overhead pattern (for the inset diagram). */
export interface PatternKeyframe {
  t: number
  /** position in nautical miles, ship at origin, x = along base recovery course (ahead positive), y = starboard */
  x: number
  y: number
  /** altitude feet, informational */
  alt: number
  leg: 'marshal' | 'initial' | 'break' | 'downwind' | 'abeam' | 'ninety' | 'groove' | 'departure' | 'bolter' | 'none'
}

export interface PatternEntity {
  aircraftId: string
  track: PatternKeyframe[]
}

export interface Timeline {
  duration: number
  phases: Phase[]
  aircraft: AircraftEntity[]
  crew: CrewEntity[]
  vehicles: VehicleEntity[]
  equipment: EquipmentKeyframe[]
  events: SimEvent[]
  pattern: PatternEntity[]
}
