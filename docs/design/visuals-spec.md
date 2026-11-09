# Visuals branch: implementation spec

Status: authoritative. Built from the **Instrument** direction (judge 1's winner, and the most coherent concept),
with the grafts all three judges asked for: Cartographer's explanatory line work, iris, shadow heights,
discipline and engineering, plus Cinematic's proven generated VFX assets, layered wake and airborne-jet
follow. Where this file and a candidate disagree, this file wins. Parallel implementers build from it
**without talking to each other**, so every shared name, number and file boundary is fixed here.

Frames (unchanged): world feet, x forward of the ramp (0..1092), y positive to starboard. On screen the bow
points right and starboard points down. Pattern frame: nm, origin at ship mid-length,
`world = { x: 546 + 6076·px, y: 6076·py }`.

---

## 0. Intent (use this to break ties)

Zooming out climbs the chain of instruments that runs the cycle. Fully in, you are on a live, noisy,
wet flight deck. Pull back and it is a ship making 27 kt through a real sea, throwing a wake that points at
the jets in the pattern. Pull back further and the ship's own air-search scope irises open around it and
tells the same story as symbols. Every bit of spectacle (steam, burner, smoke, wake, shadows) must be
**caused by something in the timeline** and must **explain** it: why the JBD is up, when the shuttle fired,
how high a jet is, which wire it caught. Nothing invented goes on screen (no clouds, helicopters, grime,
shake or vignettes), and **nothing is ever drawn over a crew dot**. Jersey colours stay the only saturated
colour *on people*. Warm flair (burner, lights, sparks) is small, short-lived and sits on jets and
equipment. When in doubt, choose the option that keeps a first-time viewer able to count the yellow
shirts at 4× playback.

---

## 1. Decisions and conflict resolutions

| # | Conflict | Decision | Why |
|---|---|---|---|
| D1 | Sea tone: pale chart (#c3ced2, Cartographer), mid-grey (#8ea4ab, Instrument), or dark navy (#1B2228, research and Cinematic) | **Slate sea `--sea: #4d6670`**. Crests are lighter, troughs darker | White foam and steam need contrast (about 5.4:1 here, against 2.5:1 on #8ea4ab). The dark jets still read against it (about 2.4:1), so we don't need Cinematic's palette-wide switch to ghost-grey jets. The deck (#4a4d52) separates by its dark catwalk rim and the ship shadow. It moves toward the research's dark ocean without flipping the editorial chrome |
| D2 | Sea texture: procedural fBm (Instrument), engraved strokes (Cartographer), photographic tiles (Cinematic) | **Height-field tiles rendered as crest and trough alpha layers.** Swell is procedural fBm. Chop and ripple come from **one generated greyscale height texture**, with a procedural fBm fallback | Tokens stay tintable and sizes stay deterministic and world-scaled. The generated detail stops the chop looking like value noise, and the log-scale layering hides repetition |
| D3 | Image generation: none (Instrument, Cartographer) or 5 textures (Cinematic) | **4 generated assets, at most $2.00** (§7): sea height, steam sheet, afterburner, foam strip. Each has a procedural fallback | The steam and burner sprites are where Canvas 2D is weakest and where the scout showed proven results. No clouds, no ship renders |
| D4 | Far-zoom transition: staged crossfade (Instrument) or iris (Cartographer) | **An iris that opens from the ship, with Instrument's staging inside it.** The disc edge is a labelled range ring. Inside it the deck outline traces itself, rings bloom, symbols then data blocks fade in, and the sweep comes last | The iris is cheap and never muddy (no doubled imagery). The staging gives the "inevitable" build |
| D5 | Scope look: green phosphor with scanlines (Instrument/Cinematic) or muted ink (Cartographer) | **Muted scope ink on blue-black glass, no scanlines, no vignette** | It fits the editorial chrome and avoids the cliché. It still reads instantly as a radar because of the rings, sweep and blips |
| D6 | Scope identity: CATCC (Instrument/Cinematic) or the ship's air-search radar (Cartographer) | **The ship's air-search scope** (SPS-49 sweep at 12 rpm), with the 5 nm ring labelled `5 NM · CCZ` | Case I is under tower control inside 5 nm, so calling the scope CATCC would be wrong |
| D7 | HUD scope creep (cat-tag state machine, reticle data block, callouts, PLAT inset) | **Keep** the cat tags, which replace the existing `cat N` labels at z ≥ 0.55 only, the BOLTER / WAVE OFF callouts and the scale bar. **Drop** the SHIP-band ship tag, the reticle data block, the "3-WIRE" tag and the PLAT inset. The scope's own-ship block keeps the cat summary line | Teaching value, without competing with the narration panel at mid zoom |
| D8 | Saturated markings: elevator striping, blast hatching, foul-line dashes | **Painted static blast hatching** aft of each JBD (research §9.4), drawn at z ≥ 0.6. **Dynamic blast cone** in red hatching, cut off at the raised JBD. Foul line as red/white 8/8 ft dashes. Elevator red/yellow striping **only at z ≥ 2** | They are research markings. Gating them by zoom keeps the deck view calm |
| D9 | Shot motion: ghost smear (Instrument) or speed lines (Cartographer) | **Speed lines and a shuttle streak**. No ghosts | Ghosts read as extra jets on a crowded bow |
| D10 | Heat shimmer: self-blit (Cinematic) or noise scroll (Instrument) or heat lines (Cartographer) | **Cartographer's heat lines at the raised JBD, phase from sim `t`** | Deterministic and cheap, with no canvas self-copy |
| D11 | Hook sparks on every trap | **Bolter (hook skip) only** | Fidelity: sparks show on a skip, not on a normal trap |
| D12 | Afterburner on airborne departures (Instrument) | **No.** A burner shows only where a deck sample has `power === 2`. Airborne pattern jets never show one | It must follow the sim. **Flag:** the sim gives bolter and wave-off `power: 2`, while research says a bolter goes around at MIL. We render the sim as it is; the planner fix is out of scope |
| D13 | Island beacons, antennas, cat deck lights | **Keep all.** Fore and aft beacons follow `eq.deck` (with the word on the scope). Antennas rotate and share the scope's sweep function. The research's MIL-green / CRT-amber cat lights are lit during tension and salute | All three are faithful, cheap and tie near view to far view |
| D14 | Plane-guard helo, clouds, grime, non-skid, padeyes, hull number, vignette, scanlines, camera shake, quality governor | **Rejected** | They invent actors or texture and break §9.1 or the "everything is in the plan" rule. A hull number would imply a specific real ship. `?fx=0/1/2` replaces the governor |
| D15 | Turquoise wake band | **Kept but muted** (`--wake-aerated` is a desaturated teal at alpha 0.55) | It reads as aerated water, not as UI colour |
| D16 | Steam drift speed: 18 ft/s (Cartographer), 28 (Cinematic), 30 (Instrument) | **24 ft/s aft**, plus a hashed lateral 0-2 ft/s outboard | The ribbon stays on its own track for about 4 s and still visibly blows aft |
| D17 | Tyre smoke drift: 8 ft/s (Cartographer) or full WOD (Cinematic) | **14 ft/s aft**, fixed in the deck frame | The jet visibly decelerates away from its smoke, and the smoke still reads as blown |
| D18 | JBD raised cue: yellow tint (today) or bar and shadow | **Bar and shadow**, plus a 1 px `--mark-yellow` lip line on the raised top edge | It keeps a yellow cue viewers already know and drops the large yellow fill |
| D19 | Existing VIEW presets | **Unchanged.** Add `pattern` (key 6) | Keeps baseline framing and the screenshot history |
| D20 | Header text on the darker sea | Header text becomes light ink with a soft halo (`--ink-on-sea`), **always** | The canvas behind the header is now sea or scope, never paper |

---

## 2. Foundation (lane 0: the integrator lands this FIRST, verbatim, before the lanes fan out)

### 2.1 `src/render/tokens.ts`: add a generic accessor (keep the existing `Tokens` untouched)

```ts
const varCache = new Map<string, string>()
/** Any CSS custom property, e.g. cssVar('--sea-trough'). Cached; cleared by resetTokens(). */
export function cssVar(name: string): string {
  let v = varCache.get(name)
  if (v === undefined) {
    v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    varCache.set(name, v)
  }
  return v
}
// in resetTokens(): also varCache.clear()
```
All new modules read their new tokens with `cssVar('--name')`. Nobody edits the `Tokens` interface.

### 2.2 `src/render/frame.ts` (new; shared zoom bands, motion, hashing, per-frame context, FX types)

```ts
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
```

### 2.3 `src/render/world.ts` (new; physical constants and shared geometry)

```ts
import type { Camera } from './camera'
import type { Vec2 } from '../sim/types'
import type { AircraftState } from '../sim/sample'
import type { Catapult } from '../data/deckTypes'

export const NM_FT = 6076
export const SHIP_MID_X = 546
export const SHIP_KT = 27
export const V_SHIP = 45.6          // ft/s through the water; water streams aft at this in the ship frame
export const WOD_FTS = 50.6         // relative wind toward -x
export const KELVIN_TAN = 0.3536    // tan 19.47 deg
export const STEM: Vec2 = { x: 1066, y: 0 }  // waterline stem
export const TRANSOM_X = 26
export const DECK_H = 60            // flight deck above the waterline, ft
/** One sun, high (60 deg), from the port bow: shadows fall to starboard and slightly forward, away from the LA and the wake. */
export const SUN = { ux: 0.35, uy: 0.94, k: 0.58 }
export function shadowOffset(h: number): Vec2 { return { x: SUN.ux * SUN.k * h, y: SUN.uy * SUN.k * h } }

export function nmToWorld(p: Vec2): Vec2 { return { x: SHIP_MID_X + p.x * NM_FT, y: p.y * NM_FT } }
export function worldToNm(p: Vec2): Vec2 { return { x: (p.x - SHIP_MID_X) / NM_FT, y: p.y / NM_FT } }

/** Run draw() with 1 unit = 1 world foot. Line widths inside are in ft: use px / cam.zoom. */
export function withWorld(ctx: CanvasRenderingContext2D, cam: Camera, dpr: number, draw: () => void): void {
  ctx.save()
  ctx.setTransform(dpr * cam.zoom, 0, 0, dpr * cam.zoom, dpr * (cam.w / 2 - cam.cx * cam.zoom), dpr * (cam.h / 2 - cam.cy * cam.zoom))
  draw()
  ctx.restore()
}

/**
 * Height used for a deck-sampled jet's shadow, and whether that shadow falls on the sea.
 * Over the deck: height above the deck. Past the ramp or the bow: height above the water.
 */
export function aircraftShadowHeight(s: AircraftState): { h: number; onSea: boolean } {
  const off = s.x < 0 || s.x > 1092
  let hDeck = 6
  if (s.status === 'groove' || s.status === 'waveoff') hDeck = 10 + Math.max(0, -s.x) * 0.0612 // tan 3.5 deg
  if (s.status === 'shot' || s.status === 'airborne') hDeck = 6 + Math.max(0, s.x - 1092) * 0.15
  if ((s.status === 'bolter' || s.status === 'waveoff') && s.x > 700) hDeck = Math.max(hDeck, 6 + (s.x - 700) * 0.08)
  return off ? { h: hDeck + DECK_H, onSea: true } : { h: hDeck, onSea: false }
}

/** JBD plan geometry. jbd[0],jbd[1] = hinge (forward edge); jbd[3],jbd[2] = aft edge. Raised to 50 deg at raise = 1. */
export function jbdGeometry(c: Catapult, raise: number): { hinge: [Vec2, Vec2]; top: [Vec2, Vec2]; footprint: Vec2[]; shadow: Vec2[] } {
  const [h0, h1, a1, a0] = c.jbd as [Vec2, Vec2, Vec2, Vec2]
  const k = 1 - 0.6 * raise
  const t0 = { x: h0.x + (a0.x - h0.x) * k, y: h0.y + (a0.y - h0.y) * k }
  const t1 = { x: h1.x + (a1.x - h1.x) * k, y: h1.y + (a1.y - h1.y) * k }
  const so = shadowOffset(8.2 * raise)
  return { hinge: [h0, h1], top: [t0, t1], footprint: [h0, h1, t1, t0],
    shadow: [t0, t1, { x: t1.x + so.x, y: t1.y + so.y }, { x: t0.x + so.x, y: t0.y + so.y }] }
}
```

### 2.4 Tokens: add to `src/styles.css :root` (lane 0, all at once)

```css
/* sea (changed values) */
--sea: #4d6670;                          /* was #cfd6d8 */
--sea-2: #445c66;                        /* was #c2cacd */
/* sea (new) */
--sea-crest: rgba(222, 234, 236, 0.55);
--sea-trough: rgba(16, 30, 38, 0.55);
--foam: rgba(244, 248, 248, 0.95);
--foam-2: rgba(244, 248, 248, 0.45);
--wake-aerated: rgba(112, 160, 166, 0.55);
--wake-slick: rgba(150, 176, 186, 0.30);
--waterline: rgba(16, 30, 38, 0.35);
--shadow-ship: rgba(10, 18, 24, 0.42);
--shadow-air: rgba(10, 18, 24, 0.30);
--shadow-deck: rgba(16, 17, 19, 0.35);
/* ship */
--catwalk: #34373b;
--catwalk-grate: rgba(232, 230, 223, 0.10);
--net: rgba(232, 230, 223, 0.28);
--sponson: #3a3d42;
--island-3: #7a7d83;
--island-4: #888b91;
--deck-wear: #424549;
--skid: rgba(18, 19, 21, 0.22);
--elevator-gap: rgba(0, 0, 0, 0.45);
--jbd-bar: #2a2c30;
--wire-hot: #f4f2ea;
--beacon-green: #39d353;
--beacon-amber: #ffb000;
--beacon-red: #ff3b30;
/* flair (--steam, --burner, --burner-glow already exist and are kept) */
--burner-core: #fff4dc;
--burner-diamond: rgba(255, 250, 236, 0.85);
--heat: rgba(255, 255, 255, 0.20);
--blast-hatch: rgba(200, 71, 59, 0.30);
--blast-paint: rgba(184, 51, 44, 0.55);
--tyre-smoke: rgba(236, 236, 232, 0.60);
--spark: #ffd27a;
/* HUD on the canvas */
--hud-ink: #ece9e1;
--hud-ink-2: rgba(236, 233, 225, 0.66);
--hud-halo: rgba(20, 22, 25, 0.85);
--hud-warn: #ffb000;
--hud-alert: #ff3b30;
/* scope (muted ink, not phosphor green) */
--scope-bg: #10161a;
--scope-bg-2: #0b1013;
--scope-ring: rgba(170, 205, 192, 0.20);
--scope-ring-2: rgba(170, 205, 192, 0.38);
--scope-leg: rgba(170, 205, 192, 0.45);
--scope-ink: #d6e6df;
--scope-ink-2: rgba(214, 230, 223, 0.62);
--scope-ink-3: rgba(214, 230, 223, 0.30);
--scope-sweep: rgba(170, 230, 205, 0.18);
--scope-blip: #eef8f3;
--scope-clutter: rgba(170, 205, 192, 0.08);
--scope-warn: #f0b44c;
--scope-alert: #ef6a5c;
/* DOM chrome over the canvas */
--ink-on-sea: #eef1ef;
--ink-on-sea-2: rgba(238, 241, 239, 0.74);
--halo-on-sea: 0 1px 2px rgba(0, 0, 0, 0.45);
```

CSS rule changes (lane 0): `.hdr-title, .hdr-phase { color: var(--ink-on-sea); text-shadow: var(--halo-on-sea) }`,
`.hdr-sub { color: var(--ink-on-sea-2); text-shadow: var(--halo-on-sea) }`. Panel, transport and intro cards are unchanged.

---

## 3. Lanes and module boundaries

Each lane owns the files listed. **It may not edit any other existing file.** `main.ts` is wired by the
integrator only. The lanes may import each other's exports by the signatures below, even before they exist.
The integrator resolves the build after merging.

| Lane | Owns (new) | May edit (existing) | Reads |
|---|---|---|---|
| 0 Integrator | `frame.ts`, `world.ts`, `perf.ts` | `main.ts`, `tokens.ts` (cssVar only), `styles.css` | everything |
| A Sea | `render/sea.ts` | none | frame, world, sprites, data/deck |
| B Ship | `render/ship.ts`, `data/shipDetail.ts` | `render/deck.ts` | frame, world, data |
| C FX | `render/fxIndex.ts`, `render/fx.ts` | `render/aircraft.ts` | frame, world, sprites, data |
| D Assets | `render/sprites.ts`, `tools/tex.mjs`, `public/img/fx/*` | `tools/image.mjs` (add an optional 5th arg `background`), `tools/out/visuals/spend.log` (append only) | frame |
| E Far zoom | `render/scope.ts`, `render/airborne.ts`, `render/patternGeom.ts` | `render/pattern.ts`, `render/camera.ts`, `data/deck.ts` (**VIEWS array only**), `ui/panel.ts` (key 6 only, if needed), `sim/planner/recovery.ts` (add `export` to STACK_CENTRE and STACK_R; nothing else) | frame, world, fxIndex |
| F HUD | `render/hud.ts` | none | frame, world, fxIndex |

### 3.A `src/render/sea.ts` (lane A)

```ts
import type { Frame } from './frame'
import type { DeckGeometry } from '../data/deckTypes'
export function drawSea(f: Frame): void                        // base fill and the three texture layers
export function drawWake(f: Frame): void                       // slick, aerated band, transverse crests, Kelvin feathers, foam band, prop lobes
export function drawBowWave(f: Frame): void                    // moustache and stem foam (drawn BEFORE the deck so the overhang hides it)
export function drawShipShadow(f: Frame, g: DeckGeometry): void
```

**Sea (`drawSea`).** `fillRect` with `--sea`. Then for each layer whose weight > 0.01, two pattern fills: first
trough, then crest. Each `CanvasPattern` comes from `seaTiles(kind)` (sprites.ts), placed with
`pattern.setTransform(new DOMMatrix().translate(ox, oy).rotate(deg).scale(s))`, where
`s = tileFt · z / tile.px` and (ox, oy) is the screen position of the world anchor point
`(scrollX mod tileFt, scrollY mod tileFt)`. Each fill is one `fillRect(0, 0, w, h)`.

| Layer | Tile source | tileFt | Rotation | Scroll at t (ft) | Weight w(z) | Trough alpha | Crest alpha |
|---|---|---|---|---|---|---|---|
| swell | `seaTiles('swell')` (procedural fBm) | 900 | 0 | x: -(V_SHIP+6)·t, y: +2·t | `ramp(z,0.02,0.04)·(1-ramp(z,1.5,3))` | 0.45 | 0.18 |
| chop | `seaTiles('chop')` (generated, else fBm) | 160 | 12 deg | x: -(V_SHIP+3)·t, y: -1.5·t | `ramp(z,0.12,0.25)` | 0.30 | 0.35 |
| ripple | `seaTiles('chop')` | 28 | -20 deg | x: -(V_SHIP+1)·t | `ramp(z,1.4,2.8)` | 0.12 | 0.18 |

- **Strobe guard:** let `pxs = V_SHIP · z · f.speed`. Multiply the chop and ripple alphas by `clamp(1.6 - pxs/500, 0.25, 1)`. This changes alpha only, never position.
- **Reduced motion:** use t = 0 for every scroll (the sea is frozen). The sea is only drawn when `f.b.world`.

**Wake (`drawWake`).** Let `d = TRANSOM_X - x` (ft astern of the transom). Build every outline as a `Path2D` in
world feet, **once** (the foam band's sinuous edge is the exception: rebuild it when `floor(t·4)` changes,
48 samples spaced geometrically in d). Draw them all under `withWorld`.

| Band | Half-width (ft) | Length | Fill | Opacity along d |
|---|---|---|---|---|
| slick | `90 + 0.022·d` | 24 000 ft (4 nm) | `--wake-slick` | `exp(-d/9000)` (alpha multiplier on the token) |
| aerated | `70 + 0.018·d` | 12 000 ft | `--wake-aerated` | `exp(-d/3500)` |
| foam | `52 + 0.012·d + 14·noise1((d + V_SHIP·t)/180)` | 2 400 ft | foam texture (`foamPattern`) scrolled x by `-(V_SHIP+9)·t` | `0.92·exp(-d/650) + 0.20·exp(-d/2800)` |
| prop lobes | ellipses at (x = -134, y = ±28), rx 160, ry 26 | - | foam texture | 0.6 |

- The opacity curves are linear gradients along x in screen space, with 10 stops each, built from `withAlpha(token, curve(d))`.
- **Foam compositing:** use one reusable offscreen canvas at CSS-px resolution (no DPR), sized to the foam polygon's on-screen bounding box clipped to the viewport and reallocated only when it grows. Fill the polygon with the foam pattern, apply the falloff gradient with `destination-in`, then `drawImage` the result onto the main canvas.
- **Transverse crests:** arcs across the wedge between the Kelvin arms, every **405 ft** (λ = 2πV²/g at 27 kt), starting 200 ft astern of the ramp, about 10 of them. Sagitta is 6% of the chord, convex aft. Stroke `--sea-crest` at alpha `0.25·exp(-s/2500)`, 1 px. Drawn only when z < 0.6.
- **Kelvin feathers:** the arms run from STEM along `|y| = KELVIN_TAN·(1066 - x)` out to x = -9000. Put a feather every 90 ft of arc length s: length `40 + 0.012·s` ft, angled 35 deg outboard-aft of the arm. Each feather is a crest line (`--foam`, 1.2 px) plus a trough line (`--waterline`, 0.6 px) offset 1.2 px to its aft side. Alpha `0.55·exp(-s/3500)`. When the feather spacing is under 6 px, drop every second feather. The feathers are static in the ship frame (physically right).
- **Far zoom (z < 0.06):** skip the foam texture. Draw the slick and aerated polygons, the foam band as a flat `--foam-2` fill with the same falloff, and the Kelvin arms as two 1 px `--foam-2` hairlines. The 4 nm slick then points at the initial on the pattern view.
- **Reduced motion:** foam scroll and noise phase use t = 0.

**Bow wave (`drawBowWave`)**, drawn before the deck:
- **Moustache:** two foam crescents from STEM, one per side, hugging the hull aft to x = 760. Outer edge `|y| = 67·(1066-x)/226 + 10 + 0.06·(1066-x)` until the hull reaches full beam, then it flares at 19.47 deg. Width tapers 28 → 6 ft and alpha 0.85 → 0.15. Fill with the foam pattern scrolled at `-V_SHIP·t`.
- **Stem foam:** a crescent at x 1092-1112, y ±22, `--foam` at alpha 0.9 ("bone in her teeth").
- Visible at 0.04 < z.

**Ship shadow (`drawShipShadow`):** fill `g.outline` translated by `shadowOffset(DECK_H)` = (12.2, 32.7) ft with `--shadow-ship`.

### 3.B `src/render/ship.ts`, `src/data/shipDetail.ts`, edits to `deck.ts` (lane B)

```ts
// data/shipDetail.ts: all [EST] unless noted
export const SPONSONS: Vec2[][]            // rect(40,80,97,112), rect(20,60,-78,-60), rect(860,900,-76,-60), rect(860,900,58,74)
export const SPONSON_MOUNTS: Vec2[]        // one per sponson, at its centre; 6 ft circles at z >= 2.5
export const ISLAND_LEVELS: Vec2[][]       // [L2, L3]: L2 = [(298,86),(298,114),(428,114),(428,70),(402,70),(402,86)]; L3 = rect(310,400,92,112)
export const ISLAND_MAST: Vec2[]           // rect(410,420,87,97)
export const PRIFLY_GLASS: [Vec2, Vec2]    // (320,92) to (380,92), port face of L3
export const ANTENNAS: { at: Vec2; len: number; rpm: number }[]   // SPS-48 (415,92) 16 ft 15 rpm; SPS-49 (330,104) 24 ft 12 rpm
export const BEACONS: Vec2[]               // fore (432,66), aft (292,84)
export const ISLAND_HEIGHT_FT = 130

// render/ship.ts
import type { Frame } from './frame'
import type { DeckGeometry } from '../data/deckTypes'
export function drawShipUnder(f: Frame, g: DeckGeometry): void   // sponsons, catwalk band, net line, grating (plat band)
export function drawIsland(f: Frame, g: DeckGeometry): void      // island shadow on deck, footprint, levels, mast, Pri-Fly glass, antennas, beacons

// render/deck.ts: changed signatures
export function drawDeck(f: Frame, g: DeckGeometry): void
export function drawDeckLabels(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, opts?: { skipCats?: boolean }): void
```

Changes inside `drawDeck` (lane B):
- **Remove:** the catwalk stroke (moves to `drawShipUnder`), the hull fill, and the island and its 3 px shadow (move to `drawIsland`).
- **Catwalk** (`drawShipUnder`): stroke `g.outline` at `24·z + 2` px in `--net`, then at `24·z` px in `--catwalk`. The deck fill covers the inboard half, which leaves a 1 px net line on the outer edge. **Grating** at `b.plat > 0`: perpendicular hairlines every 3 ft from each outline edge to 12 ft outboard. Build them as one cached Path2D in world ft and stroke at 0.5 px in `--catwalk-grate` × plat.
- **Sponsons:** fill `--sponson` and stroke `--deck-edge`, drawn before the deck. Mounts appear at z ≥ 2.5.
- **Wear band:** along the LA centreline from s = 150 to s = 420 (`laPoint`). Three strokes of width 30, 22 and 14 ft in `--deck-wear` at alpha 0.35 each, round caps.
- **Foul lines:** red/white dashes, 8 ft each (`--mark-red` / `--mark-white`).
- **Ladder rungs:** at z ≥ 0.7, 10 ft rungs every 50 ft along `laPoint(s, ±37.5)`, `--mark-white` at alpha 0.5.
- **Elevators:** a 1.5 px `--elevator-gap` line on the inboard edges. At z ≥ 2, a hazard perimeter of alternating `--mark-red` / `--mark-yellow` dashes, 5 ft each, 1.2 px, inset 1 ft.
- **JBDs:** use `jbdGeometry(cat, raise)`.
  - Lowered (raise ≤ 0.05): exactly as today, minus the yellow tint.
  - Raised: fill the shadow polygon with `--shadow-deck`, then the footprint with `--jbd-bar`, then the top edge as a 1 px `--mark-yellow` line at alpha 0.8.
  - **Painted blast hatching** at z ≥ 0.6, always shown: a band 12 ft deep immediately aft of each JBD's aft edge, filled with `hatchPattern` tinted `--blast-paint`.
- **Wires:** while `run > 0.01` and a jet with status `trap` is within 400 ft forward of the wire, draw the wire as **two straight segments** from `w.a` and `w.b` to the hook point. The hook point is the jet's position minus heading × (length/2 - 2), with length from `SILHOUETTES`. Stroke it 1.6× wider in `--wire-hot`. Otherwise (retract) keep today's curve. At `b.plat > 0`, add sheave dots at both ends.
- **Island** (`drawIsland`):
  - **Shadow:** the convex hull of the footprint and the footprint translated by `shadowOffset(ISLAND_HEIGHT_FT)`, in `--shadow-ship`. It falls mostly off the starboard edge.
  - **Body:** footprint `--island-2`, L2 `--island-3`, L3 `--island-4`, each with a 0.6 px `--deck-edge` stroke. Mast in `--island`. Pri-Fly glass is a 2 px `--canopy` line.
  - **Antennas** at z ≥ 1.2: bars rotating at `radarAzimuth(f.nowMs, rpm)`.
  - **Beacons:** a 2.5 ft dot plus a 14 ft `glowSprite()` drawn with `lighter`. Colour: `--beacon-green` when `eq.deck === 'green'`, `--beacon-red` when `'red'`. For `'foul'`, `--beacon-red` flashing at 1 Hz from sim t (`floor(t·2) % 2`), steady under reduced motion.
- **Rejected for this lane:** padeyes, non-skid speckle, and a hull number.

### 3.C `src/render/fxIndex.ts`, `src/render/fx.ts`, edits to `aircraft.ts` (lane C)

```ts
// fxIndex.ts
import type { FxIndex, CatStatus, CatId, JetSample } from './frame'
export function buildFxIndex(tl: Timeline, g: DeckGeometry): FxIndex       // once at startup; arrays sorted by t
export function inWindow<T extends { t: number }>(arr: readonly T[], t0: number, t1: number): T[]  // binary search on t
export function catStatusAt(fxi: FxIndex, jets: JetSample[], eq: EquipmentKeyframe, t: number, cat: CatId): CatStatus

// fx.ts
import type { Frame } from './frame'
export function drawSeaFx(f: Frame): void            // low-pass water ruffle off the bow
export function drawSkids(f: Frame): void            // cumulative skid marks (after deck markings)
export function drawDeckFxUnder(f: Frame): void      // dynamic blast cone hatching, heat lines (under jets)
export function drawDeckFxOver(f: Frame): void       // steam, smoke, sparks, speed lines, cat lights, lens ring, JBD steam (over jets, under crew)
export function drawExhaust(ctx: CanvasRenderingContext2D, spec: SilhouetteSpec, s: AircraftState, z: number, f: Frame): void  // jet-local frame

// aircraft.ts: AircraftDrawOpts gains `frame?: Frame`. Replace the inline power-glow block with
// `if (opts.frame) drawExhaust(ctx, spec, s, z, opts.frame)` at the same point (before the body).
```

**Index rules (`buildFxIndex`):**
- `shots`: the first keyframe with status `shot` after a non-shot keyframe in each aircraft track. `cat` is the catapult whose `start` is nearest the jet. `heavy = power === 2`. Cross-check: 211 on cat 1 at t = 300, 103 on cat 4 at t = 320.
- `touchdowns`: the rising edge into `trap` or `bolter` from `groove`.
- `waveoffs`: the rising edge into `waveoff`.
- `tension`: from the `tension` rising edge to the matching shot.
- `jbdDown`, `wireUp` and `wireDown` come from `timeline.equipment` edges.
- `oldSkids`: 30 marks at hashed positions in x 230-290, y -30 to -10, heading -9.

`catStatusAt` returns:
- `SECURED` for cats 3 and 4 once the `recovery` phase has begun.
- `SHOT` while the cat's jet has status `shot`.
- `FINAL` during `salute`.
- `TENSION` during `tension`.
- `SPOT` when a jet is `on-cat` on it.
- `RETRACT` when 0 < shuttle < 1 and no jet is on it.
- `SAFE` otherwise.

`countdown` is `nextShot.t - t` from tension onward, otherwise null.

**Every effect is stateless and closed-form in t:** enumerate only the triggers in `inWindow(arr, t - life, t)`.
Puffs are drawn with `steamCell(hash % 16)`, rotation `hash·2π`, and `globalAlpha`. The FX alpha is multiplied by
0.4 when `f.dim`. Nothing in fx.ts is drawn when `f.fx === 0`. Effects marked "2" in the table are skipped when `f.fx === 1`.

### 3.D `src/render/sprites.ts`, `tools/tex.mjs`, assets (lane D)

```ts
export type FxAsset = 'sea' | 'steam' | 'burner' | 'foam'
export function loadFxAssets(): Promise<void>   // fetch from `${import.meta.env.BASE_URL}img/fx/…`; never rejects
export function assetReady(a: FxAsset): boolean
export function assetsVersion(): number         // increments whenever an asset finishes loading; consumers re-key caches on it
export interface SpriteCell { img: CanvasImageSource; sx: number; sy: number; sw: number; sh: number }
export function steamCell(k: number): SpriteCell             // 16 sheet cells, or 4 procedural puff variants (k % 4) as the fallback
export function glowSprite(): HTMLCanvasElement              // 64 px radial white -> transparent (beacons, lights, cat lights)
export function burnerSprite(): SpriteCell | null            // null -> the caller draws the procedural cone
export function foamPattern(ctx: CanvasRenderingContext2D): CanvasPattern                    // generated foam, else a procedural stipple
export function seaTiles(kind: 'swell' | 'chop', ctx: CanvasRenderingContext2D): { crest: CanvasPattern; trough: CanvasPattern; px: number }
export function hatchPattern(ctx: CanvasRenderingContext2D, color: string): CanvasPattern   // 16 px tile, 45 deg 1 px lines
export function resetSprites(): void            // the integrator calls it next to resetTokens()
```

- **Height to crest and trough:** from a greyscale height tile H (0..1), bake `crest` as `--sea-crest` with alpha `sstep(H, 0.58, 0.88)` and `trough` as `--sea-trough` with alpha `sstep(H, 0.42, 0.12)` (inverted).
- **Swell** is always a procedural 256 px tileable value-noise fBm (3 octaves, seed 7).
- **Chop** uses `sea-height.webp` (512 px) when loaded, otherwise a 256 px fBm (5 octaves, seed 11).
- The procedural puff is a 64 px radial gradient with three hashed lobes, so it is not a perfect disc.

### 3.E `scope.ts`, `airborne.ts`, `patternGeom.ts`, edits to `pattern.ts` and `camera.ts` (lane E)

```ts
// patternGeom.ts: constants moved out of pattern.ts, values unchanged
export const NM_FT = 6076
export const CASE_I: { initialStart: Vec2; initialEnd: Vec2; breakRadius: number; downwindY: number; abeamX: number;
  ninety: Vec2; finalDeg: number; rampX: number; grooveNm: number; stackCentre: Vec2; stackR: number }
export function racetrack(P: (nm: Vec2) => Vec2): Path2D       // nominal Case I path in any mapping
export const LEG_CODE: Record<PatternKeyframe['leg'], string>  // marshal MSHL, initial INIT, break BRK, downwind DNWD, abeam 180, ninety 90, groove GRV, departure DEP, bolter BLTR, none ''

// airborne.ts
export interface AirJet { id: string; modex: string; type: AircraftType; world: Vec2; heading: number; alt: number; leg: PatternKeyframe['leg'] }
export function airborneJets(f: Frame): AirJet[]         // pattern samples (leg !== 'none') whose deck sample is not visible
export function drawAircraftShadows(f: Frame, air: AirJet[]): void   // deck jets (aircraftShadowHeight) + airborne (shadowOffset(alt)); --shadow-air
export function drawAirborne(f: Frame, air: AirJet[], iris: Iris, selected: string | null): void
export function hitAirborne(f: Frame, air: AirJet[], screen: Vec2): string | null
export function airbornePosition(f: Frame, id: string): Vec2 | null  // for follow mode

// scope.ts
export interface Iris { x: number; y: number; r: number }      // screen px; r = 0 when closed
export function irisGeometry(f: Frame): Iris                   // r = scope^1.5 * (max distance from ship centre to a viewport corner)
export function drawScope(f: Frame, iris: Iris, air: AirJet[], selected: string | null): void
export function hitScope(f: Frame, iris: Iris, air: AirJet[], screen: Vec2): string | null   // 10 px radius

// pattern.ts
export function drawPatternInset(ctx, cam, tl, t, opts: { visible: boolean; panelOpen: boolean; alphaMul: number }): void
export function patternInsetBox(cam: Camera, panelOpen: boolean): { x: number; y: number; w: number; h: number } | null

// camera.ts
// minZoom = ZOOM.min (0.012); maxZoom = ZOOM.max
export function tweenDuration(z0: number, z1: number): number   // clamp(0.7 + 0.22*|log2(z1/z0)|, 0.7, 1.8)
// Camera.clampCentre(): keep |cx - 546| and |cy| <= 10 nm; called at the end of panBy, zoomAt and fit
```

**VIEWS row** (data/deck.ts):
```ts
{ id: 'pattern', name: 'Whole pattern', key: '6', minX: -20112, minY: -19443, maxX: 18774, maxY: 4861 }
```
This fits at about z = 0.027 at 1440×900 with the panel open, which is the full scope.

**Airborne jets (`drawAirborne`):**
- World position comes from `nmToWorld(sample)`. Heading comes from the track tangent, `sample(t) - sample(t - 1)`.
- Draw the silhouette at true scale with wings spread and a **10 px minimum length**, in `--jet`. Lane E compiles its own Path2Ds from `SILHOUETTES`.
- **No-doubling rule:** a jet whose screen point lies inside the iris is not drawn here (the scope draws it). The deck renderer owns any jet whose deck sample is visible.
- Label `211 · 800` (modex, altitude in ft) in 10 px mono, `--hud-ink` on a `--hud-halo` stroke, at alpha `b.airLabel`.
- Never a burner.

**Shadows (`drawAircraftShadows`):**
- Airborne jets: `shadowOffset(alt)` on the sea, alpha `0.42·clamp(1 - alt/2500, 0.25, 1)` on `--shadow-air`.
- Deck jets: `aircraftShadowHeight(s)`.
- At z < 0.35 the shadow is drawn as the arrow shape.

**Scope (`drawScope`).** Clip to the iris disc. Inside, in order:
1. **Glass:** `--scope-bg`, plus a radial gradient from `--scope-bg-2` at the ship.
2. **Wake clutter:** a 2 nm tapered polygon astern in `--scope-clutter`.
3. **Range rings** every 1 nm (`--scope-ring`, 1 px). The 5 nm ring uses `--scope-ring-2`, 1.5 px, labelled `5 NM · CCZ`. Labels `1` to `4` sit at the 315 deg point. Half-nm rings are dotted at z ≥ 0.03. **Bloom:** ring k has alpha `sstep(iris.r - k·NM_px, 0, 40)`, so each ring fades in as the iris passes it.
4. **Bearing ticks** on the 5 nm ring, or on the largest ring on screen: 2 deg minor, 10 deg major. Relative labels every 30 deg: `000R` at the bow (with `BRC` under it), `090R` down, and so on. `WOD 27 KT` with an arrow outside 000R.
5. **Approach plate:**
   - The nominal racetrack is dashed `[4, 4]` in `--scope-leg`. Leg labels run along the legs in 10 px mono `--scope-ink-2`: `INITIAL 800`, `BREAK`, `DOWNWIND 600`, `180`, `90 · 450`, `GROOVE 3.5°`.
   - The final approach course is a solid line along -9 deg, extended 4 nm astern, with ticks every 0.5 nm and `1 NM` / `2 NM` labels.
   - The marshal circle is dashed.
6. **Own ship:** the deck outline to scale, stroked in `--scope-blip`. It **traces itself**: `lineDashOffset` runs from the perimeter length to 0 as `sstep(scope, 0, 0.5)`. Add a 1-minute velocity leader (0.45 nm).
   - Data block: `CVN · BRC 000 · 27 KT` / `DECK GREEN` (the word always; FOUL and RED in `--scope-alert`) / `ON DECK n  AIR n` / `CAT 1 TENS · 2 SAFE · 3 SHOT · 4 SECD` (from `catStatusAt`, first 4 letters).
   - Block alpha is `sstep(scope, 0.3, 0.7)`.
7. **Tracks** for every AirJet inside the iris, plus deck jets with status `groove`, `bolter` or `waveoff` (deduped by id):
   - **Symbol:** a filled chevron, 7 px, along the heading, in `--scope-blip`. Always drawn at full alpha inside the iris.
   - **History:** 5 dots at t - 4k s, alpha 0.5 → 0.1.
   - **Leader:** to the position 20 s ahead, estimated from the derivative.
   - **Data block:** 2 lines, `304 E` / `006 DNWD`, placed at the first of 8 offsets that clears the taken boxes, with a leader line. Alpha `sstep(scope, 0.3, 0.7)`. A selected jet's block is boxed.
   - **Stack:** more than 4 marshal jets collapse to 2 px dots plus one `STACK ×n / 020-040` block.
   - **Alerts:** for 12 s after a bolter or wave-off, the track is drawn in `--scope-alert` and line 2 reads `BOLTER` or `WAVE OFF`. It flashes at 2 Hz from sim t for the first 4 s (steady under reduced motion).
8. **Sweep:** `radarAzimuth(nowMs, 12)`, a conic gradient from `--scope-sweep` to 0 over 40 deg, plus a 1 px leading line. Alpha `sstep(scope, 0.6, 1)`. None under reduced motion. Blip brightness is `0.7 + 0.3·exp(-Δθ/1.2)` (cosmetic).
9. **Iris edge** (when scope < 0.999): a 1 px `--scope-ring-2` circle with a 6 px outward soft gradient, labelled `scope range 1.8 nm` (`r / (z·6076)`, 1 decimal) at its 45 deg point.

**Pattern inset:**
- Its alpha is multiplied by `opts.alphaMul` (= `b.inset`).
- **Restyled as a mini-scope:** a `--scope-bg` panel, the same racetrack, chevrons and modex-only labels in scope ink, and rings at 1 nm. The existing stack-collapse and leg-label logic stays.
- A footer `Whole pattern ⤢` (11 px). The cursor is a pointer over the box (set by the integrator).

### 3.F `src/render/hud.ts` (lane F)

```ts
import type { Frame } from './frame'
export function drawCatTags(f: Frame, g: DeckGeometry): void   // replaces "cat N" labels at the same anchor while b.labels > 0
export function drawCallouts(f: Frame): void                   // BOLTER / WAVE OFF beside the jet for 4 s, z > 0.2
export function drawScaleBar(f: Frame, anchor: { right: number; bottom: number }): void
```

- **Cat tags:** text `cat 1 · TENSION T-04` in mono at the existing label size. `cat N` is in `--hud-ink`. The word is in `--hud-warn` for TENSION and FINAL, and in `--hud-ink` otherwise. Halo is `--hud-halo`. When `word` is `SAFE` and no shot is within 60 s, draw a plain `cat N`. The anchor is the existing one (mid-track, y - 10).
- **Callouts:** `BOLTER` in `--hud-warn`, or `WAVE OFF` in `--hud-alert`, in 12 px mono with letter-spacing 0.1em and a halo, 24 px up-right of the jet's screen point. Each lasts 4 s from the `touchdowns[kind=bolter]` or `waveoffs` trigger. It is always a word, never colour alone.
- **Scale bar:** pick a nice length from `10 ft, 50 ft, 100 ft, 500 ft, 1000 ft, 1 nm, 2 nm, 5 nm` that is closest to 120 px. Draw end ticks. Ink is `--ink-on-sea-2` with a halo, or `--scope-ink-2` when scope > 0.5. In the scope band, add `RANGE n NM` (ship to the furthest visible corner, rounded).

---

## 4. Draw order (main.ts, lane 0)

```
f = Frame{…}; iris = irisGeometry(f); air = airborneJets(f)
if (f.b.world) {
  1  drawSea(f)                                   A
  2  drawWake(f)                                  A
  3  drawSeaFx(f)                                 C   low-pass ruffle
  4  drawBowWave(f)                               A
  5  drawShipShadow(f, DECK)                      A
  6  drawShipUnder(f, DECK)                       B   sponsons, catwalk, net, grating
  7  drawDeck(f, DECK)                            B   surface, wear band, markings, JBD bars + paint, wires (V)
  8  drawSkids(f)                                 C
  9  drawDeckFxUnder(f)                           C   blast-cone hatching, heat lines
  10 drawIsland(f, DECK)                          B   island shadow, island, antennas, beacons
  11 vehicles                                     (existing)
  12 drawAircraftShadows(f, air)                  E
  13 aircraft (drawAircraft with opts.frame = f)  existing + C exhaust
  14 drawDeckFxOver(f)                            C   steam, smoke, sparks, lights, speed lines
  15 crew, with ctx.globalAlpha = b.crew; skipped when b.crew === 0
  16 control cones
  17 drawDeckLabels(..., { skipCats: true }) + drawCatTags(f) + drawCallouts(f)   B, F   (when showLabels)
  18 drawAirborne(f, air, iris, selected)         E
}
19 if (f.b.scope > 0) drawScope(f, iris, air, selected)    E
20 drawPatternInset(…, { alphaMul: f.b.inset })            E
21 drawScaleBar(f, …) ; perf readout if ?perf=1            F, 0
```

Integrator duties:
- `fxi = buildFxIndex(timeline, DECK)` once at startup. Call `loadFxAssets()` at startup without awaiting it.
- `resetSprites()` goes alongside `resetTokens()`.
- `goView` uses `tween.to(target, tweenDuration(cam.zoom, target.zoom))`.
- **Click order:** the inset box first (`goView('pattern')`), then deck aircraft, then `hitAirborne`, then `hitScope`.
- **Follow:** use `airbornePosition` when the deck sample is not visible, so the camera follows 211 off the cat, around the pattern and back to the wire across every band.
- **`?perf=1`:** a corner readout of the rolling p95 frame ms (`perf.ts`).

---

## 5. Effects table (lane C unless noted)

Layers: **U** = drawDeckFxUnder (9), **O** = drawDeckFxOver (14), **E** = drawExhaust inside the aircraft (13),
**S** = drawSeaFx (3), **K** = drawSkids (8). In the fx column, "1" means the effect is on at `?fx=1` and "2" means only at `?fx=2`.

| # | Effect | Trigger (from FxIndex / samples) | Geometry and motion (closed form in t) | Duration | Layer | Zoom | fx |
|---|---|---|---|---|---|---|---|
| 1 | **Catapult stroke steam** | `shots` | 40 puffs, one every u = i/39 along the track. Puff i is born when the shuttle passes it: `tb = S + 2·√u`. Position: track(u) + hash jitter ±3 ft. Drift x `-24·age`, y `±(0..2)·age` outboard (hashed). Radius `4 + 16·√age` ft. Alpha `0.5·(1 - age/L)^1.5` with `L = 6 + 4·(1-u)` (the aft end lingers) | ≤ 10 s | O | z ≥ 0.15. Below 0.35, every 2nd puff, min radius 2 px | 1 |
| 2 | **Water-brake burst** | `shots`, at S + 2 | 8 puffs at the track end, radial at 30 ft/s for 0.5 s, then the drift above. Radius 6 → 20 ft, alpha 0.45 → 0 | 3.5 s | O | z ≥ 0.3 | 2 |
| 3 | **Post-shot slot wisps** | `shots` | 12 vents along the slot. Each emits a puff (r 3 → 10 ft, alpha 0.22) every 1.6 s (hashed phase) from S+2 to S+45, amplitude × `exp(-(t-S-2)/14)`. Same drift | 45 s | O | z ≥ 0.45 (`b.detail`) | 2 |
| 4 | **Battery venting** | `tension` window | 1 puff per 1.2 s at the battery (cat.start), r 3 → 8 ft, alpha 0.25 | while tensioned | O | z ≥ 0.6 | 2 |
| 5 | **Afterburner plume** | deck sample `power === 2`, status ≠ airborne | Per nozzle at jet-frame (-L/2, ±1.9 ft). **Sprite** (`burnerSprite`, `lighter`): length 26 ft (40 ft during `shot`), width 5 ft. **Fallback cone:** outer cone 26 ft × 3.4 ft in a `--burner` → transparent gradient, core 9 ft × 1.4 ft in `--burner-core`, and 4 `--burner-diamond` ellipses (1.6 × 0.9 ft) every 2.6 ft at `b.plat > 0`. Flicker: length × `1 + 0.05·sin(nowMs·0.031 + idHash)`, none under reduced motion | while power 2 | E (under the airframe) | z ≥ 0.25. Below 0.4, one 6 px glow dot | 1 |
| 6 | **MIL glow** | `power === 1` | Today's short gradient (9 ft) in `--burner-glow` | while power 1 | E | z ≥ 0.4 | 1 |
| 7 | **Blast-cone hatching** | jet on deck with power ≥ 1 and status on-cat, tension, salute or manned | Cone aft of the nozzles: half-angle 10 deg, length 90 ft (MIL) or 140 ft (AB), filled with `hatchPattern(--blast-hatch)` plus a 1 px outline. **Clipped at the raised JBD:** when `eq.jbd[cat] > 0.5`, clip to the jet side of the JBD hinge line | while true | U | z ≥ 0.6 | 1 |
| 8 | **Heat lines** | raised JBD (> 0.5) and its cat's jet at power ≥ 1 | 4 sine hairlines (`--heat`, 0.8 px, amplitude 1.2 ft, wavelength 6 ft) rising off the JBD top edge and drifting aft. Phase `t·3` (**sim time**) | while true | U | z ≥ 0.6 | 2 |
| 9 | **JBD cooling spray** | as #8, with power 2 | 2 puffs at each JBD end every 1.2 s (`t` mod), r 4 → 12 ft, alpha 0.35 | while true | O | z ≥ 0.6 | 2 |
| 10 | **JBD cooling steam** | `jbdDown` | 12 puffs over 12 s rising off the panel, r 5 → 16 ft, alpha 0.3, drift -10 ft/s | 12 s | O | z ≥ 0.6 | 2 |
| 11 | **Shuttle streak + speed lines** | status `shot` | Streak: white, alpha 0.6 → 0, from the shuttle position at t - 0.3 to t. Speed lines: 3 hairlines trailing the jet, length `40·u` ft, `--mark-white` at alpha 0.4 | 2.7 s | O | z ≥ 0.5 | 1 |
| 12 | **Cat deck lights** | `tension` window (power 1 → `--beacon-green`, power 2 → `--beacon-amber`) | A 2.5 ft dot plus a 10 ft glow at `cat.iccs` offset 5 ft toward the track. Steady through tension and salute | window | O | z ≥ 0.5 | 1 |
| 13 | **Tyre smoke** | `touchdowns` | 3 puffs (main gear ±5 ft lateral at T; nose 17 ft ahead at T + 0.15) in `--tyre-smoke`, r 2 → 14 ft, alpha 0.6 → 0. **Fixed in the deck frame**, drifting aft at 14 ft/s | 2.5 s | O | z ≥ 0.3 | 1 |
| 14 | **Skid marks** | `touchdowns` with T < t, plus `oldSkids` | Two parallel streaks 30 ft × 1.2 ft from the touchdown point forward along -9 deg, in `--skid`, ±4 ft hashed scatter. At most 24 live marks. Old marks at half alpha | cumulative | K | z ≥ 0.5 | 1 |
| 15 | **Hook-skip sparks** | `touchdowns[kind=bolter]` | 10 streaks 6-14 ft from the hook point, fanning ±25 deg aft, `--spark`, `lighter`, alpha 1 → 0. Hashed on 1/30 s **sim** buckets | 0.6 s | O | z ≥ 0.8 | 1 |
| 16 | **Wave-off lens lights** | `waveoffs` (T to T + 6) | IFLOLS (385, -132): a 6 ft `--beacon-red` ring plus glow, flashing at 1.8 Hz from sim t (`floor(t·3.6) % 2`). Steady under reduced motion | 6 s | O | z ≥ 0.4 | 1 |
| 17 | **Low-pass ruffle** | `shots` (S + 2.7 to S + 4.7) | 3 concentric arcs (`--foam-2`) on the sea below the jet's sampled/pattern position, r 10 → 60 ft, fading | 2 s | S | z ≥ 0.4 | 2 |
| 18 | **Wire hot stroke / V** | lane B (deck.ts) | §3.B | while run > 0 | deck | always | n/a |
| 19 | **Island beacons, antennas** | lane B | §3.B | always | island | z ≥ 0.3 / 1.2 | n/a |
| 20 | **Callouts** | lane F | §3.F | 4 s | labels | z > 0.2 | n/a |

**Readability rules** (every effect, enforced by layer order):
- **R1:** nothing is drawn over crew.
- **R2:** alpha ≤ 0.55 over a jet, except the burner core, which sits on the jet's own tail.
- **R3:** everything is gone within 12 s, except the skids and the 45 s wisps, which are faint.
- **R4:** triggered by sim state, so scrubbing is exact. Only flicker, sweep, antennas and blip glow use the wall clock.
- **R5:** invisible below its zoom floor.

---

## 6. Performance and reduced motion

Budget for new work: **≤ 6 ms/frame** at 1440×900, DPR 2, on a mid laptop. Today's frame is about 4-5 ms.

| Item | Approach | Budget |
|---|---|---|
| Sea | ≤ 6 pattern `fillRect`s; tiles baked once (and again on `assetsVersion` change) | 0.6 ms |
| Wake | Cached world Path2Ds; one offscreen foam composite at 1× clipped to the viewport; gradients cached per (zoom, cx, cy) | 0.9 ms |
| Steam/smoke | One `drawImage` per puff from a cached sheet. Cull puffs off-screen by bbox. Hard cap of 300 puffs per frame (drop from the oldest) | 0.8 ms |
| Exhaust/hatching | ≤ 6 jets × (2 sprites or 4 gradients) + ≤ 6 clipped pattern fills | 0.4 ms |
| Shadows | 33 Path2D fills, reusing compiled paths | 0.5 ms |
| Island/catwalk | Cached Path2Ds; grating only at `b.plat > 0` | 0.3 ms |
| Scope | Ring and tick paths cached per (zoom, w, h). `measureText` cached per string. ≤ 33 tracks | 1.0 ms |
| Crew | Unchanged; skipped at z < 0.13 | - |
| World at scope 1 | Skipped entirely | saves ~5 ms |

- Triggers are found by `inWindow` binary search, never by a linear scan per frame.
- No `shadowBlur`, no `ctx.filter`, no self-blit, no per-frame `getImageData`.
- All baking happens lazily on first use. The total is ≤ 30 ms, then never again.

**Reduced motion** (`reducedMotion()` is true):
- Sea and foam scroll are frozen at t = 0.
- No burner flicker, no sweep (blips at full brightness), and antennas are fixed.
- Flashing lights (foul beacon, wave-off lens, scope alerts) are steady on.
- The camera tween is instant (`tweenDuration` → 0).
- **Sim-state effects still render at t** (steam, smoke, skids, burner, hatching), because they are information. The same t must give byte-identical screenshots.

---

## 7. Image-generation plan (lane D)

**Spend so far:** $0.79 (spend.log: scout plus cinematic tests). **This plan: at most $2.00**, 4 images plus at most one retry each.
The remaining budget is deliberately left unspent: no other asset passes the "caused by the timeline, schematic-compatible" test.
Run the calls sequentially (rate limit about 3/min; retry once after 60 s on 429). Append each call to `tools/out/visuals/spend.log`.
Raw outputs go to `tools/out/visuals/gen/` (git-ignored). Processed outputs go to `public/img/fx/` (committed).

| # | Output | Prompt (exact) | Size | Quality | Est. |
|---|---|---|---|---|---|
| 1 | `sea-height.webp` (512² greyscale) | "Seamless tileable texture, perfectly top-down orthographic view straight down at open ocean surface, sea state 3, small wind waves and fine ripples evenly distributed, very sparse tiny whitecaps, rendered in neutral greyscale only, flat overcast diffuse light, no sun glint, no horizon, no perspective, no boats, no foam streaks, no vignette, uniform density and brightness across the whole frame so all four edges wrap seamlessly, medium contrast." | 1024x1024 | high | $0.20 |
| 2 | `steam-sheet.webp` (512², 4×4 cells of 128) | "Game VFX sprite sheet on a pure flat black (#000000) background: a 4 by 4 grid of sixteen separate soft billowing white steam puffs seen from directly above, each a different irregular shape from round clouds to elongated wisps, dense white vapour cores fading to transparent wispy edges, each centred in its own cell with generous black margin, nothing touching the cell borders or the frame edges, no gridlines, no other objects, no ground, no texture or noise in the black, suitable for additive blending." | 1024x1024 | high | $0.20 |
| 3 | `burner.webp` (512×128) | "Game VFX sprite on a pure flat black (#000000) background: a single jet engine afterburner exhaust plume, horizontal, flowing left to right, starting exactly at the left edge of the image with no nozzle, no engine and no aircraft hardware visible anywhere, white-hot core at the left, orange body, four faint blue-white shock diamonds evenly spaced along the core, fading to transparent orange wisps at the right, vertically centred, nothing else in frame, suitable for additive blending." | 1536x1024 | high | $0.30 |
| 4 | `foam.webp` (1024×256) | "Seamless horizontally tileable strip texture, perfectly top-down view of the churned white propeller wash behind a large ship: dense white sea foam and bubbles in a horizontal band through the middle third, breaking up into lacy foam filaments toward the top and bottom, on a pure flat black (#000000) background, no water colour, no objects, no perspective, the left and right edges must wrap seamlessly." | 1536x1024 | high | $0.30 |
| | Retries (≤ 1 each) | | | | ≤ $1.00 |
| | **Total cap** | | | | **$2.00** |

**Post-processing:** `node tools/tex.mjs`, which runs Playwright Chromium canvas so it needs no new dependency.
Write each output with `canvas.toDataURL('image/webp', 0.85)`.
1. **Sea:** convert to luma. Normalise to mean 0.5 and SD 0.18. Apply the offset-blend seam fix (roll by half; weight `min(sin(πy), sin(πx))^0.7`). Downscale to 512. **Check:** the wrap-seam ratio is < 1.3 on both axes, and a 2×2 tiled preview is saved and viewed.
2. **Steam:** levels with black point 14 and white point 235, then RGB = white and alpha = luma. Downscale to 512, so the cells are 128 px.
3. **Burner:** crop to the plume's bbox. If any nozzle remains, crop x < 95 px of the source. Scale to 512×128 and keep RGB on black (drawn with `lighter`).
4. **Foam:** horizontal seam blend over a 12% cosine feather. RGB = white, alpha = levels(luma, 20, 230). Scale to 1024×256.
5. Save a contact sheet of all four at `tools/out/visuals/gen/contact.png` and view it before committing.

**If an image fails twice:** process the already-paid fallback with the same steps:
- `scout-ocean-dark.png` → sea
- `cand-cinematic-steam.png` → steam
- `scout-afterburner.png` → burner (crop x < 95)
- `cand-cinematic-foam.png` → foam

**At runtime:** if a file is missing or fails to decode, `sprites.ts` uses its procedural fallback silently. `assetReady()` stays false and nothing throws. The site must look complete with `public/img/fx/` deleted.

---

## 8. Acceptance (screenshots at 1440×900 unless noted; `zoom` multiplies the view's fit zoom)

Write outputs to `tools/out/visuals/acc-*.png`. Every command must exit 0 with no page errors.

| # | Command | Expected |
|---|---|---|
| 1 | `node tools/shot.mjs tools/out/visuals/acc-01-deck.png 330 deck 1440 900 1` | Slate sea with visible chop. A wake leaves the stern off the left edge: churned foam and prop lobes just aft of the ramp, a teal band behind it. Kelvin feathers flare at ±19.5 deg, about 377 ft outboard at the stern. The bow moustache shows past both bow edges, with stem foam ahead of the bow. The ship shadow falls down-right. Layered island with its shadow off the starboard edge, a green beacon. **Steam from cat 4's shot (t=320) drifting aft along the waist**; slot wisps. Every jersey dot visible in `base-deck.png` is still visible. Header text is light |
| 2 | `node tools/shot.mjs tools/out/visuals/acc-02-final.png 296 bow 1440 900 2.5` | 211 on cat 1 in salute: twin burner plumes with shock diamonds. JBD 1 drawn as a raised bar with a shadow and a yellow lip. A red hatched blast cone **cut off at the JBD**. Painted hatching aft of it. Heat lines. An amber cat light. The tag reads `cat 1 · FINAL T-04`. The crew dots near the cone are drawn on top |
| 3 | `node tools/shot.mjs tools/out/visuals/acc-03-stroke.png 301 bow 1440 900 1.5` | 211 mid-stroke: a steam ribbon densest at the aft end of cat 1, a shuttle streak, speed lines, `cat 1 · SHOT`. Shooter and deck-edge dots sit over the steam |
| 4 | `node tools/shot.mjs tools/out/visuals/acc-04-off.png 304 bow 1440 900 0.6` | 211 off the bow over the sea, its shadow separated by ≥ 20 ft, a ruffle beneath it, the water-brake burst at the end of the track, the ribbon fading |
| 5 | `node tools/shot.mjs tools/out/visuals/acc-05-trap.png 900.6 wires 1440 900 1.5` | 203 just after touchdown: smoke left behind at the gear. The engaged wire pulled into a **V** to the hook, hot white. No sparks |
| 6 | `node tools/shot.mjs tools/out/visuals/acc-06-skids.png 1105 wires 1440 900 1` | Fresh skid marks in the touchdown zone, one per trap so far, plus the faint pre-seeded marks |
| 7 | `node tools/shot.mjs tools/out/visuals/acc-07-bolter.png 1200.3 wires 1440 900 1.5` | 304 bolter: hook-skip sparks, twin burners, an amber `BOLTER` callout. Also `1196 wires … 0.8`: 304 in the groove behind the ramp with its shadow on the sea, offset 40-80 ft to starboard |
| 8 | `node tools/shot.mjs tools/out/visuals/acc-08-waveoff.png 1282 wires 1440 900 1` | 107 wave-off: red `WAVE OFF` callout, burners, and the lens ring red (check with `reduced=1` as extraQuery for the steady-on state) |
| 9 | `node tools/shot.mjs tools/out/visuals/acc-09-ship.png 1000 deck 1440 900 0.2` | SHIP band (z ≈ 0.18): the whole ship small, a wake more than 1 nm long, crew faded out, airborne jets as silhouettes with altitude-offset shadows and `modex · alt` labels. Inset faded. Scale bar `1000 ft` |
| 10 | `node tools/shot.mjs tools/out/visuals/acc-10-iris.png 1000 deck 1440 900 0.06` | Half-open iris (z ≈ 0.055): a dark disc on the ship with an edge ring labelled `scope range n.n nm`, inner rings in, the ship outline tracing, and the sea, wake and silhouettes outside. **Each airborne jet is drawn once** (count against `AIR n`) |
| 11 | `node tools/shot.mjs tools/out/visuals/acc-11-scope.png 1000 pattern 1440 900 1` | Full scope: rings 1-5 nm with `5 NM · CCZ`, relative bearing ticks, `000R BRC`, `WOD 27 KT`, the racetrack and approach plate with labels, the marshal circle and stack block, chevrons with history dots and leaders, **no overlapping data blocks**, and the own-ship block with `DECK GREEN` and the cat line. No inset |
| 12 | `node tools/shot.mjs tools/out/visuals/acc-12-inset.png 1000 deck 1440 900 1 '' '' fakepattern=stack` and `node tools/shot.mjs tools/out/visuals/acc-12-phone.png 1000 pattern 390 844 1` | The inset is drawn as a mini-scope with a `Whole pattern ⤢` footer. On the phone, the scope fits above the bottom sheet |

**Readability checklist (pass/fail):**
- [ ] **Crew on top:** in shots 1-3, sample 5 crew dots inside steam. Their pixels equal the jersey token hex values.
- [ ] **Same crew count** in shot 1 as `base-deck.png`.
- [ ] **`?fx=0` diff:** the label and tag boxes are pixel-identical with fx on and off.
- [ ] **Saturation audit** (shots 1-3): pixels with HSL saturation > 50% belong only to jerseys, deck markings, burner, hatching, lights and callouts.
- [ ] **Scrub determinism:** with `reduced=1`, shot 3 taken directly and taken after seeking from 600 are byte-identical.
- [ ] **Reduced motion:** two captures 1 s apart at the same t are identical (no sweep, flicker or sea drift).
- [ ] **Fallback:** with `public/img/fx` renamed away, shots 1-3 still render complete, with no errors.
- [ ] **Performance:** `?perf=1&play=1` at t = 290 on the deck view at 4×, and on the pattern view, gives p95 ≤ 16.7 ms.
- [ ] The deck reads clearly against the sea at the deck view (rim and shadow visible all round). Foam covers < 15% of the deck-view viewport.
- [ ] `npm run typecheck` passes. `npm run build` passes, and the assets resolve under the Pages base path.

---

## 9. Build order

1. **Lane 0** foundation (§2): `frame.ts`, `world.ts`, cssVar, tokens, header CSS.
2. **Lanes A-F in parallel.** Each lane screenshots its own work with temporary local wiring, but **commits no main.ts changes**.
3. **Lane 0** integrates main.ts (§4), runs §8, and tunes alphas within ±30% of the values here if a readability check fails. Record any change in this file.
