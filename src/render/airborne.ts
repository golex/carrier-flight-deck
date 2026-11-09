// STUB: lane E fills this in
import type { Frame } from './frame'
import type { AircraftType, PatternKeyframe, Vec2 } from '../sim/types'
import type { Iris } from './scope'

export interface AirJet { id: string; modex: string; type: AircraftType; world: Vec2; heading: number; alt: number; leg: PatternKeyframe['leg'] }

/** Pattern samples (leg !== 'none') whose deck sample is not visible. Stub: none. */
export function airborneJets(_f: Frame): AirJet[] {
  return []
}

/** Deck jets (aircraftShadowHeight) + airborne (shadowOffset(alt)); --shadow-air. */
export function drawAircraftShadows(_f: Frame, _air: AirJet[]): void {}

export function drawAirborne(_f: Frame, _air: AirJet[], _iris: Iris, _selected: string | null): void {}

export function hitAirborne(_f: Frame, _air: AirJet[], _screen: Vec2): string | null {
  return null
}

/** For follow mode. */
export function airbornePosition(_f: Frame, _id: string): Vec2 | null {
  return null
}
