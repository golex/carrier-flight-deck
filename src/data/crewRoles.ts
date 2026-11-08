import type { CrewRole } from '../sim/types'

export type JerseyColour = 'yellow' | 'green' | 'blue' | 'red' | 'brown' | 'purple' | 'white'

export interface RoleInfo {
  role: CrewRole
  jersey: JerseyColour
  /** cranial (helmet) colour, informational */
  helmet: string
  name: string
  /** one sentence for the legend */
  summary: string
}

/**
 * Jersey colours as worn on a US carrier flight deck. Several roles share a colour;
 * the renderer distinguishes some (e.g. shooters vs directors) by a glyph at high zoom.
 */
export const ROLES: Record<CrewRole, RoleInfo> = {
  director: { role: 'director', jersey: 'yellow', helmet: 'yellow', name: 'Aircraft director', summary: 'Yellow shirts own every aircraft movement. Only they may signal a pilot to taxi.' },
  shooter: { role: 'shooter', jersey: 'yellow', helmet: 'yellow', name: 'Catapult officer (shooter)', summary: 'Runs the catapult: checks the jet, takes tension and gives the launch signal.' },
  handler: { role: 'handler', jersey: 'yellow', helmet: 'yellow', name: 'Aircraft handling officer', summary: 'The Handler plans every spot on the deck from Flight Deck Control, on the Ouija board.' },
  'cat-crew': { role: 'cat-crew', jersey: 'green', helmet: 'green', name: 'Catapult crew', summary: 'Hook the launch bar into the shuttle, set the holdback and run the deck-edge station.' },
  'ag-crew': { role: 'ag-crew', jersey: 'green', helmet: 'green', name: 'Arresting gear crew', summary: 'Reset the cross-deck pendants after every trap; the hook runner clears the wire.' },
  maint: { role: 'maint', jersey: 'green', helmet: 'green', name: 'Squadron maintenance', summary: 'Troubleshooters who fix a jet on the cat and the air wing mechanics.' },
  'plane-handler': { role: 'plane-handler', jersey: 'blue', helmet: 'blue', name: 'Plane handler', summary: 'Chocks and chains. Every jet is tied down the moment it stops moving.' },
  'tractor-driver': { role: 'tractor-driver', jersey: 'blue', helmet: 'blue', name: 'Tractor driver', summary: 'Tows aircraft that are not under their own power, under a yellow shirt.' },
  ordnance: { role: 'ordnance', jersey: 'red', helmet: 'red', name: 'Ordnance', summary: 'Load, arm and safe weapons. Ordies arm just before the catapult.' },
  'crash-salvage': { role: 'crash-salvage', jersey: 'red', helmet: 'red', name: 'Crash and salvage', summary: 'Firefighters and the crash crane crew, standing by through every recovery.' },
  'plane-captain': { role: 'plane-captain', jersey: 'brown', helmet: 'brown', name: 'Plane captain', summary: 'Owns one jet: preflight, start, chains, and stays with it on deck.' },
  fuels: { role: 'fuels', jersey: 'purple', helmet: 'purple', name: 'Fuels (grapes)', summary: 'Refuel and defuel aircraft between events.' },
  safety: { role: 'safety', jersey: 'white', helmet: 'white', name: 'Safety observer', summary: 'Watches for anything unsafe and can stop a launch.' },
  lso: { role: 'lso', jersey: 'white', helmet: 'white', name: 'Landing signal officer', summary: 'Paddles: talks every jet down the glideslope and waves it off if it is unsafe.' },
  checker: { role: 'checker', jersey: 'white', helmet: 'white', name: 'Final checker', summary: 'Last inspection of the jet before the shot; thumbs up to the shooter.' },
  medical: { role: 'medical', jersey: 'white', helmet: 'white', name: 'Medical', summary: 'Corpsman standing by on the deck.' },
  'air-boss': { role: 'air-boss', jersey: 'yellow', helmet: 'none', name: 'Air Boss', summary: 'Controls everything that flies within five miles, from Primary Flight Control.' },
}

export const ROLE_ORDER: CrewRole[] = [
  'director', 'shooter', 'cat-crew', 'ag-crew', 'maint', 'plane-handler', 'tractor-driver',
  'ordnance', 'crash-salvage', 'plane-captain', 'fuels', 'checker', 'safety', 'lso', 'medical', 'handler', 'air-boss',
]

export const JERSEY_LABEL: Record<JerseyColour, string> = {
  yellow: 'Yellow',
  green: 'Green',
  blue: 'Blue',
  red: 'Red',
  brown: 'Brown',
  purple: 'Purple',
  white: 'White',
}
