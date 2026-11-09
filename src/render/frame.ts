import type { Camera } from './camera'
import type { AircraftEntity, EquipmentKeyframe, Timeline } from '../sim/types'
import type { AircraftState } from '../sim/sample'

/** Zoom thresholds in px per ft. THE single source of truth; nobody hard-codes these elsewhere. */
export const ZOOM = {
  min: 0.012, max: 14,
  scopeFull: 0.040, scopeOff: 0.070,   // iris fully open at <= 0.040, closed at >= 0.070
  crewOff: 0.13, crewOn: 0.22,
  insetOff: 0.12, insetOn: 0.20,
  airLabelOn: 0.30, airLabelOff: 0.45, // airborne modex/alt labels shown below 0.30, gone above 0.45
  detailOff: 0.30, detailOn: 0.45,     // deck micro-detail and small fx
  platOff: 1.3, platOn: 1.9,           // close-up extras (shock diamonds, sheaves, grating)
} as const

/** Smoothstep on ln(z): 0 at z <= a, 1 at z >= b. */
export function ramp(z: number, a: number, b: number): number {
  const u = (Math.log(z) - Math.log(a)) / (Math.log(b) - Math.log(a))
  const c = u < 0 ? 0 : u > 1 ? 1 : u
  return c * c * (3 - 2 * c)
}
/** Linear-domain smoothstep: 0 at x <= a, 1 at x >= b. */
export function sstep(x: number, a: number, b: number): number {
  const c = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return c * c * (3 - 2 * c)
}

export interface Bands {
  z: number
  scope: number     // 0 = no scope, 1 = iris covers the viewport
  world: boolean    // false when scope >= 0.999: skip the whole world pass
  crew: number      // crew alpha multiplier; 0 => skip the crew loop entirely
  inset: number     // pattern-inset alpha multiplier
  airLabel: number  // airborne jet label alpha
  detail: number    // deck micro-detail alpha
  plat: number      // close-up extras alpha
  labels: number    // existing deck-label alpha rule
}
export function zoomBands(z: number): Bands {
  const scope = 1 - ramp(z, ZOOM.scopeFull, ZOOM.scopeOff)
  return {
    z, scope, world: scope < 0.999,
    crew: ramp(z, ZOOM.crewOff, ZOOM.crewOn),
    inset: ramp(z, ZOOM.insetOff, ZOOM.insetOn),
    airLabel: 1 - ramp(z, ZOOM.airLabelOn, ZOOM.airLabelOff),
    detail: ramp(z, ZOOM.detailOff, ZOOM.detailOn),
    plat: ramp(z, ZOOM.platOff, ZOOM.platOn),
    labels: z < 0.55 ? 0 : Math.min(1, (z - 0.5) * 2),
  }
}

const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()
const mql = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null
/** ?reduced=1 forces it (for screenshots). */
export function reducedMotion(): boolean { return q.get('reduced') === '1' || !!mql?.matches }
/** ?fx=0 none, 1 essentials, 2 everything (default). */
export function fxLevel(): 0 | 1 | 2 { const v = q.get('fx'); return v === '0' ? 0 : v === '1' ? 1 : 2 }

/** Cosmetic radar/antenna azimuth (radians, clockwise from bow). Fixed at -PI/4 under reduced motion. */
export function radarAzimuth(nowMs: number, rpm = 12, reduced = reducedMotion()): number {
  return reduced ? -Math.PI / 4 : ((nowMs / 60000) * rpm * Math.PI * 2) % (Math.PI * 2)
}

/** Deterministic hash of up to three integers -> [0, 1). */
export function hash01(a: number, b = 0, c = 0): number {
  let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
/** Smooth 1-D value noise in [-1, 1], period 256. */
export function noise1(x: number): number {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f)
  const a = hash01(i & 255) * 2 - 1, b = hash01((i + 1) & 255) * 2 - 1
  return a + (b - a) * u
}
/** '#rrggbb' | 'rgb(...)' | 'rgba(...)' -> 'rgba(r,g,b,a*mul)'. */
export function withAlpha(color: string, mul: number): string {
  let r = 0, g = 0, b = 0, a = 1
  if (color.startsWith('#')) {
    const n = parseInt(color.slice(1, 7), 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255
  } else {
    const m = color.match(/[\d.]+/g) ?? []
    r = +m[0]!; g = +m[1]!; b = +m[2]!; a = m[3] !== undefined ? +m[3] : 1
  }
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a * mul))})`
}

export interface JetSample { a: AircraftEntity; s: AircraftState | null }

/** Everything a renderer needs this frame. Built once in main.ts. */
export interface Frame {
  ctx: CanvasRenderingContext2D
  cam: Camera
  dpr: number
  t: number            // sim seconds
  nowMs: number        // performance.now(); cosmetic motion only
  speed: number        // clock.speed when playing, else 0
  reduced: boolean
  fx: 0 | 1 | 2
  dim: boolean         // highlight mode active: fx alpha x 0.4
  b: Bands
  tl: Timeline
  eq: EquipmentKeyframe
  jets: JetSample[]    // every aircraft sampled at t, unsorted
  fxi: FxIndex
}

// ---- FX index types (implemented by lane C in fxIndex.ts; consumed by C, E, F) ----
export type CatId = 1 | 2 | 3 | 4
export interface ShotFx { cat: CatId; t: number; id: string; heavy: boolean }            // first 'shot' keyframe of a pass
export interface TouchFx { t: number; id: string; x: number; y: number; heading: number; kind: 'trap' | 'bolter' }
export interface WaveoffFx { t: number; id: string; x: number; y: number }
export interface TensionFx { cat: CatId; id: string; t0: number; t1: number }            // tension start -> shot
export interface EdgeFx { index: number; t: number }                                     // index 0..3
export interface FxIndex {
  shots: ShotFx[]; touchdowns: TouchFx[]; waveoffs: WaveoffFx[]; tension: TensionFx[]
  jbdDown: EdgeFx[]     // eq.jbd[i] falls through 0.5
  wireUp: EdgeFx[]; wireDown: EdgeFx[]
  oldSkids: { x: number; y: number; heading: number }[]  // 30 pre-seeded marks
}
export type CatWord = 'SAFE' | 'SPOT' | 'TENSION' | 'FINAL' | 'SHOT' | 'RETRACT' | 'SECURED'
export interface CatStatus { word: CatWord | null; countdown: number | null }
