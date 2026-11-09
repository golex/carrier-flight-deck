# Visual direction: "Instrument" (HUD / PLAT / CATCC scope)

One idea runs through the whole thing: **the zoom wheel is a set of instruments.** Fully in, you look down a PLAT camera at
a lit, wet, noisy deck. Pull back and the ship becomes a ship on a moving sea, with the jets in the pattern drawn at
their true positions and their shadows on the water. Pull back further and the picture becomes the CATCC scope in the
carrier's air operations centre: dark glass, range rings, a rotating sweep, friendly-air symbols, data blocks. Each step
tells the same story at a coarser resolution. The step changes are the showpiece, so they are continuous crossfades
driven by zoom alone. Nothing about them is modal.

Ground rules carried over from the codebase:
- Every colour is a CSS token in `src/styles.css`, read through `tokens()`.
- Anything that moves in the simulation is a pure function of sim time `t`, so scrubbing stays exact. Purely cosmetic
  motion (burner flicker, beacon pulse, radar sweep, heat shimmer) uses wall-clock `now`. Under
  `prefers-reduced-motion` the cosmetic motion freezes at a fixed phase.
- Canvas 2D only. Target 60 fps with about 190 crew and 33 jets.
- Jerseys stay the only *saturated* colours **on the deck surface**. The flair colours (burner, sparks, beacon) are
  small, short-lived and sit on the jets or the island, never on the people.
- Fully procedural. No generated images (section E).

Frames: world feet with x forward of the ramp and y to starboard. On screen the bow points right and starboard points
down. Pattern frame is nm, ship centre at the origin. `nmToWorld(p) = { x: 546 + p.x*6076, y: p.y*6076 }`.
Ship speed constant: `SHIP_KT = 27` (design choice, §0a 25-30 kt WOD), so `V_SHIP_FTS = 45.6`. The relative wind is
about 30 kt from dead ahead, so `WIND_FTS = 50` toward -x.

---

## A. Ocean and ship

### A.1 Sea: three tileable noise layers, cached once, scrolled by t

`noise.ts` builds **one** 256×256 tileable fBm value-noise canvas at startup (4 octaves, wrapping lattice,
seed 7, about 6 ms). From that one source canvas it bakes two alpha tiles:
- `crestTile`: white, alpha = `smoothstep(0.55, 0.85, n) * 0.9`
- `troughTile`: `--sea-trough`, alpha = `smoothstep(0.45, 0.15, n) * 0.8`

Each layer is a `CanvasPattern`, placed in world space with `pattern.setTransform(new DOMMatrix().translate(ox,oy).scale(s))`,
where `s = tileFt*z/256`, and painted with a single `fillRect(0,0,w,h)`.

| Layer | Tile (ft) | Scroll (ft, world) at time t | Weight by zoom z | Look |
|---|---|---|---|---|
| swell | 720 | x `-(V_SHIP_FTS + 14)*t`, y `+3*t` | ramps in 0.06 → 0.10; full 0.10-1.5; fades out 1.5 → 3 | long soft bands, trough tile then crest tile, alpha 0.35 |
| chop | 110, pattern rotated 12° | x `-(V_SHIP_FTS + 8)*t`, y `-2*t` | ramps in 0.18 → 0.30; full 0.30-6 | small whitecap flecks, crest alpha 0.22 |
| ripple | 26 | x `-(V_SHIP_FTS + 4)*t` | ramps in 1.8 → 3 | fine texture at PLAT zoom, crest alpha 0.12 |

The scroll is taken modulo the tile, so it stays exact under scrub. The ship holds still and the water streams astern,
which is honest: the scene is drawn in the ship's frame. At 4× playback the water rushes past, and that reads as speed.
When paused, the sea is still. All layers have weight 0 when `scope ≥ 1`.

### A.2 Wake, bow wave and Kelvin arms (static shapes, scrolling foam)

All shapes are `Path2D` in **world feet**, built once and drawn under `ctx.transform(z,0,0,z, ox, oy)`, so a zoom costs
nothing extra. `d` = feet astern of the hull's stern (x = 26), so `d = 26 - x`.

1. **Turbulent wake (screw wash).** Centre y = 0. Half-width `hw(d) = 46 + 110*(1 - exp(-d/1800)) + 0.010*d`
   (46 ft at the transom, about 150 ft at 1 nm, about 250 ft at 2.3 nm). Length `L_WAKE = 14 000 ft` (2.3 nm).
   - *Slick*: polygon filled with a linear gradient along x: `--wake-slick` at d=0 down to alpha 0 at L_WAKE. It reads
     as smoothed, paler water and visually flattens the swell inside it, because the slick is drawn over the sea layers.
   - *Foam*: the same polygon clipped to `d < 2200`. Fill it with the crest pattern at a 60 ft tile, scrolled
     `-V_SHIP_FTS*t`, so foam leaves the ship at ship speed. Then multiply by an alpha gradient (`destination-in`) with
     stops at d/2200 = 0 / 0.25 / 0.6 / 1 and alphas 1 / 0.55 / 0.18 / 0. Do this in a reusable offscreen canvas sized
     to the wake's on-screen bbox (clamped to the viewport), so the `destination-in` doesn't touch the main canvas.
   - *Churn core*: within `d < 400`, a second foam pass at a 24 ft tile, alpha 0.8, half-width × 0.6. This is the
     boiling white right at the stern, visible past the ramp at deck zoom.
2. **Kelvin arms.** These run from the hull bow (1066, 0) along ±19.47°, so `|y| = 0.3536*(1066 - x)`, out to
   x = -9000. Draw them as 1 px (min) strokes of `--foam-2` plus **diverging crest dashes**: every 90 ft along each
   arm, a 70 ft dash angled 35° outboard of the arm, alpha `0.45/sqrt(1 + dist/600)`. Drop every second dash when the
   dash spacing is under 6 px. The arms are fixed to the ship and do not scroll. That is physically right: the Kelvin
   pattern is stationary in the ship frame.
3. **Bow wave (the "moustache").** Two foam bands follow the Kelvin arms from x 1092 aft to x 640. Width 26 → 6 ft,
   alpha 0.95 → 0, filled with the 24 ft foam pattern. They come out from under the deck edge (the overhang hides the
   whole hull) at about x 850 on starboard and x 900 on port, which gives the jagged white flare around the bow.
   **Stem foam**: a crescent at x 1092-1112, y ±22, `--foam` at alpha 0.9, the "bone in her teeth".
4. **Visibility.** Slick and arms are drawn at all zooms below 6. Foam detail is drawn at 0.04 < z < 6. In scope (see
   B) the wake becomes phosphor clutter.

### A.3 Shadows (one sun, light from the upper-left: port bow)

Shadow offset vector `SUN = { x: 0.20, y: 0.28 }` per foot of height.
- **Ship on sea**: the deck outline, offset by `SUN * 60` (12, 17) ft and filled with `--ship-shadow`, drawn before the
  ship. This sells the 60 ft of freeboard. The port overhang (y down to -142) now shows the darker water beneath it.
- **Island**: the island footprint offset by `SUN * 130` (26, 36) ft, `--ship-shadow`. It falls mostly to starboard,
  over the water, so it adds no clutter on deck.
- **Airborne jets on sea**: the jet silhouette offset by `SUN * alt`. At 800 ft that is (160, 224) ft, so height
  becomes visible. Fill `--air-shadow`, at z < 1.5 only.
- No shadows for jets on deck. They sit flat on the deck, and the island and JBD shadows are enough.

### A.4 The ship (changes vs today's `deck.ts`)

| Element | Today | Proposal |
|---|---|---|
| Hull | dark polygon, fully hidden under the deck overhang | Kept only as data; it is no longer filled. The ship's mass reads from the shadow (A.3) and the bow wave emerging from under the overhang. |
| Catwalks | 24 ft-wide `--deck-edge` stroke | A 12 ft outboard band in `--catwalk`. At z > 1.5, grating: 1 px lines every 3 ft perpendicular to the edge in `--catwalk-grate`, from a cached pattern clipped to the band. The outer lip is a 1 px `--deck-edge` line. |
| Sponsons [EST] | none | Four small outboard tubs (`--catwalk`, 1 px edge) for RAM/CIWS mounts, at about (905, 72), (1000, -56), (120, -120), (40, 78). Each is a circle of r = 9 ft with a 4 ft `--island` dot. Shown at z > 0.6. New `sponsons: Vec2[]` in `data/deck.ts`, tagged `[EST]`. |
| Deck surface | flat `--deck` | Flat `--deck` plus (a) non-skid speckle: the noise tile at 40 ft, alpha 0.05, z > 0.8; (b) **LA wear band** (§9.1 `--deck-wear`): a 30 ft-wide smear along the LA centreline from s=150 to s=420 ft, soft-edged; (c) **padeyes** at z > 3: 1 px `--padeye` dots on 10 ft rows offset 5 ft, from a cached pattern clipped to the outline. |
| Elevators | `--deck-2` fill, white edge | The same, plus a 1.5 px `--elevator-gap` line along the inboard edges, so they read as separate plates. |
| JBDs | yellow tint when raised | Lowered: `--deck-2` with white edge, as today. Raised (per §9.4, "a thick bar with a short shadow"): the hinge edge as a bar `--jbd`, 3 ft × raise wide, plus a shadow quad aft of it of 10.7·cos50° ≈ 7 ft × raise in `--ship-shadow`. **The yellow tint goes away**: raise state reads from shape and shadow. |
| Island | flat block, 3 px screen shadow | Layered: footprint `--island-2`; upper decks inset 5 ft `--island-3`; mast block (x 395-435, y 63-80) `--island`. **Pri-Fly glazing**: a 1.5 px `--canopy` line on the port face, x 300-360. **Two antennas** [EST] at (415, 92) and (345, 104), bars 22 ft and 14 ft long, rotating at `sweepAngle(now)` and `-0.6*sweepAngle(now)`. **Beacons** (fore at (435, 66), aft at (290, 84)): `--beacon-green` when `eq.deck === 'green'`, otherwise `--beacon-red` ('foul' flashes at 1 Hz). Glow is a 14 ft radial sprite with `lighter`. World-scaled shadow per A.3. |
| Wires | white line, bowed when run out | The same, plus while `run > 0` the stroke is 1.6× wider in `--wire-hot`. Sheave dots at both ends at z > 1.5. |
| Cat tracks | dark slot + dashed white | The same, plus a 0.5 s fading **shuttle streak** (white, alpha 0.6 → 0) from the shuttle position at t-0.3 to the one at t while the shuttle moves. |

### A.5 How the ship reads at each zoom

- z ≥ 0.35: everything above.
- 0.10-0.35: no grating, padeyes or speckle. The wear band stays. Wires are 1 px. Jets use the existing arrow
  silhouette (z < 0.35). Crew alpha ramps 1 → 0 between z 0.25 and 0.14.
- 0.055-0.10: deck fill alpha `1 - scope`. Over it, a phosphor outline (`--scope-ink`, 1.25 px) at alpha `scope`.
- < 0.055: outline only, as the scope's own-ship symbol (B.3).

### A.6 Token additions (`styles.css :root`, mirrored in `tokens.ts`)

```css
/* sea (existing names, new values) */
--sea: #8ea4ab;            /* base, a step darker than today's #cfd6d8 so foam and steam read */
--sea-2: #7d949c;
/* new */
--sea-trough: #6c838b;
--foam: rgba(247, 249, 248, 0.92);
--foam-2: rgba(247, 249, 248, 0.38);
--wake-slick: rgba(206, 222, 224, 0.42);
--ship-shadow: rgba(18, 28, 34, 0.38);
--air-shadow: rgba(18, 28, 34, 0.22);
/* ship */
--catwalk: #383b40;
--catwalk-grate: rgba(232, 230, 223, 0.10);
--island-3: #7a7e85;
--deck-wear: #3f4247;
--padeye: rgba(0, 0, 0, 0.22);
--elevator-gap: rgba(0, 0, 0, 0.45);
--jbd: #2a2c30;
--wire-hot: #f4f2ea;
--beacon-red: #ff3b30;
--beacon-green: #39d353;
--beacon-amber: #ffb000;
/* flair (--steam, --burner, --burner-glow exist and are kept) */
--steam-shade: rgba(205, 212, 214, 0.40);
--burner-core: #fff4dc;
--burner-edge: rgba(255, 110, 40, 0);
--diamond: rgba(255, 252, 235, 0.70);
--shimmer: rgba(255, 255, 255, 0.10);
--blast: rgba(236, 233, 226, 0.22);
--tyre-smoke: rgba(222, 222, 218, 0.55);
--spark: #ffd27a;
/* HUD (deck zoom) */
--hud-ink: #ece9e1;
--hud-ink-2: rgba(236, 233, 225, 0.62);
--hud-halo: rgba(20, 22, 25, 0.85);
--hud-bracket: #e9c23a;    /* = --mark-yellow */
--hud-warn: #ffb000;
--hud-alert: #ff3b30;
/* scope */
--scope-bg: #040b09;
--scope-bg-2: #0b1a15;
--scope-ink: #7dffb0;
--scope-ink-2: rgba(125, 255, 176, 0.58);
--scope-ink-3: rgba(125, 255, 176, 0.20);
--scope-ink-4: rgba(125, 255, 176, 0.08);
--scope-sweep: rgba(125, 255, 176, 0.24);
--scope-own: #e8e6df;
--scope-warn: #ffb000;
--scope-alert: #ff3b30;
--scope-scan: rgba(0, 0, 0, 0.18);
```

The page background stays `--paper`. The sea token change only affects the canvas.

### A.7 Layering (bottom to top)

1 sea base → 2 swell/chop/ripple → 3 wake slick → 4 Kelvin arms → 5 wake foam + churn → 6 bow wave + stem foam →
7 airborne-jet sea shadows → 8 ship shadow + island shadow → 9 catwalks + sponsons → 10 deck surface, markings,
equipment (`deck.ts`) → 11 island (`ship.ts`) → 12 vehicles → 13 aircraft (exhaust and shot smear drawn inside) →
14 **fx overlay** (steam, JBD blast, tyre smoke, sparks) → 15 crew → 16 control cones → 17 HUD (deck labels, cat tags,
reticle, callouts) → 18 airborne jets (in the air above everything) → 19 scope (alpha `scope`) → 20 pattern inset,
scale bar.

---

## B. Zoom-out and the scope

### B.1 Camera

- `minZoom = 0.015` px/ft. At 1088 px of free width that shows about 72 500 ft, or 12 nm: the full 3 nm-wide marshal
  circle, the initial and the departures, plus margin. `maxZoom` stays at 14.
- Wheel and pinch zoom are already multiplicative, so nothing changes there. `CameraTween` already interpolates in log
  space, so deck → pattern (×35) is smooth. Give that tween a duration of 1.4 s instead of 0.7.

### B.2 Bands (`lod.ts`, exact thresholds, crossfades in log z)

`ramp(z, a, b)` = smoothstep of `(ln z - ln a)/(ln b - ln a)`, clamped to 0..1.

| Band | z range (px/ft) | What is drawn |
|---|---|---|
| **PLAT** | ≥ 1.6 | Everything: modex, signals, salute, padeyes (z > 3), ripple (z > 1.8), shock diamonds (z > 2.5), reticle data block in full |
| **DECK** | 0.35-1.6 | Full deck, all flair, cat tags, labels (existing 0.55 fade) |
| **SHIP** | 0.10-0.35 | Ocean and wake carry the frame. Crew fade out (`crew = ramp(z, 0.14, 0.25)`). Jets as arrows. Airborne jets as silhouettes with sea shadows. The cat tags collapse into one **ship tag** (B.4). Steam only as coarse puffs (every 3rd, min 3 px) |
| **XFADE** | 0.055-0.10 | `scope = 1 - ramp(z, 0.055, 0.10)`, a log width of ×1.82 (about two wheel notches). World drawn normally, then the scope drawn at alpha `scope` |
| **SCOPE** | < 0.055 | Scope only. The world pass is skipped when `scope > 0.999` |

`lodFor(z)` returns all weights in one object, so every renderer reads the same numbers:

```ts
export interface Lod {
  z: number
  plat: number        // ramp(z, 1.3, 1.9)
  detail: number      // ramp(z, 0.30, 0.45): deck-detail band weight
  crew: number        // ramp(z, 0.14, 0.25)
  swell: number; chop: number; ripple: number   // A.1 weights, each × (1 - scope)
  air: number         // airborne silhouettes: 1 - scope
  scope: number       // 1 - ramp(z, 0.055, 0.10)
}
```

**The crossfade is the centrepiece.** It is staged so that it never looks like two images dissolving:
- scope 0 → 0.35: glass (`--scope-bg`) laid over the world at alpha `0.85*scope`, so the sea darkens like a CRT
  warming up. The phosphor outline of the deck traces in, its `lineDashOffset` running from the full perimeter to 0
  with `scope`, so it draws itself.
- 0.2 → 0.7: range rings bloom outward. Each ring k is drawn only out to radius `k nm` when `scope*6 > k`, so the rings
  appear inside-out from the ship. Scanlines fade in.
- 0.4 → 1: aircraft silhouettes shrink (alpha `1-scope`) as dome symbols and data blocks appear at alpha `scope`, at
  the same positions. The sweep fades in last (`ramp(scope, 0.6, 1)`).

### B.3 The scope (CATCC CCA-style PPI)

The centre is the ship centre `nmToWorld({0,0})`, mapped through the camera, so it pans with the camera like
everything else.

1. **Glass**: `fillRect` of `--scope-bg`, then a radial gradient from `--scope-bg-2` at the ship to `--scope-bg` at
   `0.75*max(w,h)`. **Scanlines**: a cached 1×3 px pattern (`--scope-scan` on row 3), screen-space. A **vignette**:
   a radial gradient to rgba(0,0,0,0.45) at the corners.
2. **Range rings**: every 1 nm, out to the edge of the view, in `--scope-ink-3` 1 px. Every 5 nm uses `--scope-ink-2`.
   Labels "1", "2", … in 10 px mono `--scope-ink-2`, placed where each ring crosses relative bearing 045 (up-right of
   the ship). The 0.5 nm ring is dotted, shown while z > 0.04.
3. **Bearing scale**: on the 5 nm ring, or on a ring at 0.46×min(w,h) when 5 nm is off screen. Ticks every 5° (4 px)
   and every 10° (8 px). Labels every 30° as relative bearings: "000" at the bow (screen right), "090" at starboard
   (down), "270" up. `--scope-ink-2`.
4. **Reference lines**: **BRC** dashed `[6,6]` from the bow out to the edge, labelled "BRC". **FINAL** dashed `[2,4]`
   along the angled-deck final course (−9°), from the ramp out to 4 nm astern, labelled "FINAL −9°".
   `--scope-ink-3`.
5. **Nominal Case I pattern** (from `patternGeometry.ts`, shared with the inset). Dotted `[1.5,3]` in `--scope-ink-3`.
   Leg labels in 10 px mono `--scope-ink-2`: "INITIAL 800", "BREAK", "DOWNWIND 600", "THE 90", "GROOVE". **Marshal**:
   a dashed circle at STACK_CENTRE (1.0, −1.5) nm, r 1.5 nm (exported from `recovery.ts`), labelled
   "MARSHAL 2000". The labels use the same "skip if it collides with a data block" rule as `pattern.ts`.
6. **Sweep**: angle `θ = sweepAngle(now) = (now/4000)*2π` (SPN-43-like 15 rpm). It is cosmetic, wall-clock, and the
   same angle that turns the island antenna. A conic gradient (`createConicGradient`) runs from `--scope-sweep` at the
   leading edge to 0 over 40° behind it. The leading edge is a 1 px `--scope-ink` line at alpha 0.55. Under reduced
   motion there is no sweep, and blips stay at full brightness.
7. **Own ship**: the deck outline, to scale (about 30 px long at z = 0.027), stroked 1.25 px in `--scope-own`, with a
   centre dot, plus a **heading vector** of 0.5 nm (one minute at 27 kt is about 0.45 nm). **Wake clutter**: the A.2
   slick polygon filled with `--scope-ink-4`, which reads as sea return astern.
8. **Aircraft** come from `timeline.pattern` sampled at t, plus deck jets that are visible with status
   `groove|bolter|waveoff` (converted to nm, deduped by id):
   - **Symbol**: MIL-STD-2525 friendly air, a semicircle "dome" open at the bottom, 9 px wide, 1.5 px `--scope-ink`.
     Bolter/waveoff → `--scope-warn`. Departure → `--scope-ink-2`. Selected → plus a `--scope-own` 14 px square.
   - **Blip persistence**: brightness `0.55 + 0.45*exp(-angleBehindSweep/2)`, angle in radians. Cosmetic.
   - **History trail**: 5 dots at `t-4k` s for k = 1..5 (sim-time samples, so scrub-exact), 2 px, alpha 0.5 → 0.1.
   - **Velocity leader**: a line to the position at t+20 s (sampled from the track, deterministic), `--scope-ink-2`.
   - **Data block**: a 10 px mono, 2-line block, placed at the first of 8 offsets (up-right first) that clears the
     taken boxes, with a 1 px leader line:
     ```
     203 TKR
     008 GRV
     ```
     Line 1: modex, plus `TKR` for the tanker. Line 2: altitude in hundreds of feet (3 digits) and a leg code:
     MSL INI BRK DWN ABM 90 GRV DEP BLT W/O. W/O comes from the deck status `waveoff`, because the pattern leg reads
     `bolter` for both.
   - **Marshal crowding**: no collapse into a single marker, since the scope has room. Blocks shorten to line 1 only
     when more than 4 jets are within 0.6 nm of each other.
   - **Alerts**: on `bolter`/`waveoff`, line 2 becomes "BOLTER" / "WAVE OFF" in `--scope-warn` and flashes at 2 Hz on
     **sim time** for 4 s, so it can be captured in a screenshot.
9. **Own-ship data block**, anchored down-right of the ship symbol:
   ```
   CVN  27 KT
   DECK GREEN          (or DECK FOUL / DECK RED, word + colour)
   ON DECK 21  AIR 10
   CAT 1 TENS 2 SAFE 3 SHOT 4 SECD
   ```
   The counts come from the samples. The deck status always comes with its word, never colour alone (§9.2).
10. **Range readout**: in the scale bar (B.6): "RANGE 6 NM".

Why phosphor green rather than a modern CATCC colour LCD: it is the visual shorthand for "radar" that every viewer
reads instantly. The crew's green jerseys never appear in the scope, so there is no confusion.

### B.4 SHIP-band ship tag (the near HUD collapsing)

Between z 0.10 and 0.35 the four cat tags (D.1) merge into one tag beside the bow:
`CAT 1 TENS · 2 SAFE · 3 SHOT · 4 SECD` in 10 px mono. In the scope this becomes line 4 of the own-ship block. The
same information appears at three resolutions; that is the LOD story told in text.

### B.5 Pattern inset

- Alpha multiplied by `ramp(z, 0.12, 0.20)`: it fades out as soon as airborne jets appear in the main view, so
  there is never a duplicate. It is hidden entirely in the scope.
- Restyled as a **mini scope**: `--scope-bg` panel, `--scope-ink` symbols, rings at 1 nm, and the same
  symbol/data-block code at a smaller size (line 1 only). It becomes a visible preview of what zooming out shows. Its
  existing logic (STACK_MAX_DOTS collapse, leg labels, clamp) stays.
- The inset is **clickable**: a hit on its box calls `goView('pattern')`. In `main.ts` the onClick checks
  `patternInsetBox()` first. Add a "⤢" glyph in its title row and change the cursor to a pointer on hover.

### B.6 New VIEW preset and UI chrome

```ts
{ id: 'pattern', name: 'Overhead pattern', key: '6', minX: -19500, minY: -19450, maxX: 18800, maxY: 3650 }
```
This covers −3.3..+3.0 nm ahead and −3.2..+0.6 nm to starboard (initial, stack, departures). It fits at about
z = 0.026 at 1440×900 with the panel open, which is full scope.

Chrome:
- `#app.scope` is toggled with hysteresis (on at scope > 0.6, off at < 0.4). In CSS, `.scope .hdr` text uses
  `--scope-ink` / `--scope-ink-2`. The side panel and transport keep their paper surface, because they stay readable
  documents, but take a 1 px `--scope-ink-3` border. Transitions are 300 ms (none under reduced motion).
- **Scale bar** (new, all bands, bottom-left 16 px above the transport, or above the inset when the inset is shown):
  a nice-number bar ("10 ft", "50 ft", "100 ft", "500 ft", "1000 ft", "1 nm", "2 nm") in `--hud-ink-2` (on sea, with
  halo) or `--scope-ink-2`, with end ticks. It is the instrument cue that tells a viewer how far they have zoomed. In
  scope it adds "RANGE n NM" (the distance from the ship to the furthest visible corner, rounded).
- The panel's view buttons gain "Overhead pattern (6)". Key `6`.

---

## C. Flair (prioritised)

Every effect obeys **three readability rules**:
1. It never draws over crew. Fx goes in layer 14, crew is layer 15.
2. Peak alpha over a jet is ≤ 0.55. Over labels and HUD it is 0, because labels and HUD sit on top.
3. It is triggered by a sim field, so it scrubs exactly. Only flicker, shimmer, blast turbulence, beacon pulse and
   sweep use the wall clock.

Triggers come from an **`FxIndex` built once** at startup from the timeline:
- `shots[]`: rising edges of `eq.shuttle[i]` leaving 0, giving `{cat, t0}`. Cross-check: the 211 shot at t=300.
- `traps[]`: first `status:'trap'` keyframe per pass, giving `{id, t0, x, y, heading}`.
- `bolters[]` / `waveoffs[]`: first `bolter` / `waveoff` keyframe per pass.
- `tension[]`: `{cat, t0, t1}` from the jet's `tension` → `shot` status window.

| # | Effect | Trigger | Geometry / motion | Duration | Layer | Zoom | Readability rule |
|---|---|---|---|---|---|---|---|
| 1 | **Catapult steam: stroke plume** | `shots[]`: t0 | 28 puffs spawned along the track as the shuttle passes: puff i at `ts = t0 + 2*sqrt(i/28)` (the stroke accelerates), at the shuttle position + hash jitter ±4 ft. Each drifts at `-30 ft/s` in x (relative wind, dragged) plus a hashed lateral `±6*sqrt(age)` ft. Radius `5 + 5*age` ft. Alpha `0.55*(1-age/9)^1.5` | 9 s per puff | 14 | z > 0.12 (below 0.35, every 3rd puff, min 3 px) | Under crew. Peak alpha only in the first second, when the jet has already left the puff |
| 2 | **Catapult steam: lingering slot wisps** | after each shot | 12 vents evenly spaced along the slot. Each emits a small puff (r 3 → 10 ft, alpha 0.25) every 1.6 s (hashed phase) for `t0+2 … t0+45`, amplitude × `exp(-(t-t0-2)/14)`. Same drift | 45 s | 14 | z > 0.35 | Low alpha. The deck "smokes" between shots, which is the orchestrated-chaos texture the user asked for |
| 3 | **Battery venting** | `tension[]` window | 1 puff/s at the shuttle (battery), r 3 → 8 ft, alpha 0.3 | while tensioned | 14 | z > 0.6 | Under the nose; crew dots on top |
| 4 | **Afterburner plume** | `s.power === 2` | Per nozzle at aircraft-frame (−L/2, ±2.3 ft): a cone 24 ft long (+ flicker ±3 ft from `now`), 2.4 → 3.6 ft wide. Linear gradient `--burner-core` (0-0.3) → `--burner` (0.3-0.7) → `--burner-edge`, composite `lighter`. **Shock diamonds** at z > 2.5: 4 ellipses (`--diamond`, r 0.9 ft) at 18/34/50/66 % of the length. During `shot`, length × 1.7 | while power 2 | inside 13, under the body | z > 0.25 (below that, one 6 px glow dot) | Small and on the jet. The only bright warm colour, and it marks "this jet is about to go" |
| 5 | **MIL power / heat shimmer** | `s.power >= 1` | Faint cone (`--burner-glow`, 14 ft), plus 5 sinuous 1 px `--shimmer` strokes in a 40 ft × 12 ft cone aft, phase `now*6+i` (static under reduced motion), clipped at the JBD hinge if it is raised | while power ≥ 1 | 13 | z > 0.9 | Alpha 0.10: texture, not shape |
| 6 | **JBD blast** | the JBD for cat i raised (`eq.jbd[i] > 0.5`) **and** the jet on cat i has power ≥ 1 | Fan off the JBD's top edge, aft: 36 ft → 64 ft wide over 46 ft aft. Filled with the noise pattern (30 ft tile) scrolled aft at 60 ft/s (**wall clock**, cosmetic), masked by a `--blast` gradient to 0. With power 2, alpha × 1.6 and a 1 px `--burner-glow` line on the JBD lip | while true | 14 | z > 0.35 | Alpha ≤ 0.35. The next jet behind stays visible, and its yellow shirt sits on top |
| 7 | **Shot motion smear** | status `shot` | 4 ghost silhouettes sampled at `t - 0.06k`, alpha `0.22/k`, plus the shuttle streak (A.4) | 2.7 s | 13 | z > 0.35 | Jet-coloured ghosts at low alpha |
| 8 | **Touchdown tyre smoke** | `traps[]` and `bolters[]`: t0 | Main gear at aircraft-frame (−4, ±5.2) ft; nose gear at (+18, 0), 0.35 s later. 3 puffs per wheel from the shared puff sprite, r 3 → 16 ft, alpha 0.55 → 0, drift −40 ft/s in x, plus the ship-frame offset of the touchdown point (the jet is gone, the smoke stays) | 2.8 s | 14 | z > 0.35 | Under crew. The LA crew stand clear of the touchdown point anyway |
| 9 | **Hook sparks** | `traps[]`: t0 to t0 + 0.7; `bolters[]`: while status `bolter` and x < 800 | 10 streaks from the hook point (−L/2 − 2 ft), length 6-14 ft, spread ±25° aft, `--spark`, `lighter`, alpha 1 → 0. Hashed on 1/30 s **sim-time** buckets, so scrubbing is exact | 0.7 s / ~2 s | 14 | z > 0.6 | Tiny, brief, on the centreline |
| 10 | **Wire run-out emphasis** | `eq.wire[i] > 0` | Hot stroke (A.4) plus a HUD tag "3-WIRE" for 3 s from the rising edge | while run > 0 | 10 / 17 | z > 0.35 | A single word, placed off the LA's port side |
| 11 | **Bolter / wave-off callouts** | `bolters[]`, `waveoffs[]` | HUD stencil "BOLTER" (`--hud-warn`) or "WAVE OFF" (`--hud-alert`) beside the jet, 12 px mono, letter-spaced 0.1em, with halo, for 4 s. For a wave-off, the IFLOLS marker turns `--beacon-red`, flashing at 2 Hz on sim time, from t0 to t0 + 6 | 4-6 s | 17 | z > 0.2 | Word plus colour, never colour alone |
| 12 | **Island beacons** | `eq.deck` | A.4 | always | 11 | z > 0.3 | Two small glows on the island |
| 13 | **Antenna rotation** | wall clock | A.4 | always | 11 | z > 0.5 | Shares the sweep angle with the scope, which ties near and far together |
| 14 | **Airborne jets in the main view** | a pattern sample exists and the deck sample is not visible | Spread-wing silhouette at its true world position, heading from the track tangent (t to t+1), 6 px floor, sea shadow (A.3), afterburner when leg is `bolter` or `departure` and alt < 400 | while airborne | 18 (shadow at 7) | z < 1.5 (alpha `1-scope`) | Above the deck, and mostly far from it |
| 15 | **PLAT groove inset** (P3, optional) | a jet with status `groove` | For the groove's 15-18 s the pattern inset's content switches to a schematic PLAT frame: a crosshair (centreline + glideslope datum), the jet symbol growing toward the centre as range closes (from its track), with "0.75 NM → 0", "ROGER BALL" at groove start and "BOLTER" / "WAVE OFF" overlays. No invented deviations: the symbol stays on the crosshair | groove window | 20 | when the inset is visible | Inside the inset box only |

Priority for implementation: 1, 4, 6, 2, 8, 11, 12, 14, 7, 9, 10, 3, 5, 13, 15.

**Rejected, with reasons:**
- **Camera shake on the shot.** It breaks the reading of 190 dots, and it is motion-sickness bait.
- **Full-screen bloom, lens flare, CRT barrel distortion.** They are illegible and expensive in Canvas 2D.
- **Rain, fog, spray over the deck.** They hide the jerseys, and the scenario is Day Case I.
- **Photographic or AI-generated deck/sea textures.** They fight the to-scale schematic. Their scale is ambiguous
  across a ×900 zoom range, and they would show repeat seams.
- **WebGL water, real refraction for heat shimmer.** Out of scope. The faked strokes are enough.
- **Saturated red/yellow hazard striping on elevators and JBD hatching.** It breaks "jerseys are the only saturated
  colour on deck". A later option for z > 3 only.
- **Accumulating tyre rubber over time.** It depends on history, and the static wear band covers it.
- **Constant random radar clutter and noise.** Illegible. Clutter appears only along the wake.
- **Blinking data blocks all the time.** Flashing is reserved for bolter and wave-off.
- **Night mode.** A separate scenario.

---

## D. Architecture

### D.1 New modules (`src/render/`)

```ts
// lod.ts
export const ZOOM = { min: 0.015, scopeFull: 0.055, scopeOff: 0.10, crewOff: 0.14, crewOn: 0.25, deck: 0.35, plat: 1.6 } as const
export interface Lod { /* B.2 */ }
export function lodFor(z: number): Lod
export function ramp(z: number, a: number, b: number): number
export function sweepAngle(nowMs: number): number          // 0 under reduced motion
export function reducedMotion(): boolean

// noise.ts
export function noiseTile(size: number, seed: number, octaves: number): HTMLCanvasElement   // tileable fBm, cached by key
export function alphaTile(src: HTMLCanvasElement, color: string, lo: number, hi: number, gain: number): HTMLCanvasElement
export function hash01(a: number, b?: number, c?: number): number
export function puffSprite(color: string): HTMLCanvasElement                                  // 64 px radial sprite, cached per colour
export function clearTileCache(): void                                                         // called from resetTokens()

// ocean.ts
export const SHIP_KT = 27
export const V_SHIP_FTS = 45.6
export const WIND_FTS = 50
export function drawSea(ctx: CanvasRenderingContext2D, cam: Camera, t: number, lod: Lod): void
export function drawWake(ctx: CanvasRenderingContext2D, cam: Camera, t: number, lod: Lod): void       // slick, Kelvin, foam, bow wave
export function drawShipShadow(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, lod: Lod): void

// ship.ts  (catwalks/sponsons go before deck.ts, the island after it)
export function drawCatwalks(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, lod: Lod): void
export function drawIsland(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, eq: EquipmentKeyframe, t: number, now: number, lod: Lod): void

// fx.ts
export interface TouchEvt { id: string; t0: number; x: number; y: number; heading: number }
export interface FxIndex {
  shots: { cat: 0 | 1 | 2 | 3; t0: number }[]
  traps: TouchEvt[]
  bolters: TouchEvt[]
  waveoffs: TouchEvt[]
  tension: { cat: 0 | 1 | 2 | 3; id: string; t0: number; t1: number }[]
  wireEdges: { wire: number; t0: number }[]
}
export function buildFxIndex(tl: Timeline, g: DeckGeometry): FxIndex
export interface JetState { a: AircraftEntity; s: AircraftState | null }
export function drawDeckFx(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, fx: FxIndex, eq: EquipmentKeyframe, jets: JetState[], t: number, now: number, lod: Lod): void
export function drawJetExhaust(ctx: CanvasRenderingContext2D, spec: SilhouetteSpec, s: AircraftState, z: number, now: number): void   // called in drawAircraft's local frame
export function drawShotSmear(ctx: CanvasRenderingContext2D, cam: Camera, e: AircraftEntity, t: number, lod: Lod): void

// hud.ts
export function catStatus(cat: number, fx: FxIndex, jets: JetState[], eq: EquipmentKeyframe, t: number, phase: PhaseId | undefined): { word: string; countdown: number | null }
export function drawCatTags(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, fx: FxIndex, jets: JetState[], eq: EquipmentKeyframe, t: number, phase: PhaseId | undefined, lod: Lod): void
export function drawReticle(ctx: CanvasRenderingContext2D, cam: Camera, e: AircraftEntity, s: AircraftState, sPrev: AircraftState | null, lod: Lod): void
export function drawCallouts(ctx: CanvasRenderingContext2D, cam: Camera, fx: FxIndex, tl: Timeline, t: number, lod: Lod): void
export function drawScaleBar(ctx: CanvasRenderingContext2D, cam: Camera, lod: Lod, anchor: { x: number; y: number }): void

// airborne.ts
export function airborneStates(tl: Timeline, t: number, onDeck: Set<string>): { id: string; world: Vec2; heading: number; alt: number; leg: PatternKeyframe['leg'] }[]
export function drawAirborneShadows(ctx: CanvasRenderingContext2D, cam: Camera, tl: Timeline, list: ReturnType<typeof airborneStates>, lod: Lod): void
export function drawAirborne(ctx: CanvasRenderingContext2D, cam: Camera, tl: Timeline, list: ReturnType<typeof airborneStates>, lod: Lod, selected: string | null): void

// patternGeometry.ts  (extracted from pattern.ts; constants unchanged)
export const NM_FT = 6076
export function nmToWorld(p: Vec2): Vec2
export function worldToNm(p: Vec2): Vec2
export const CASE_I: { initialStart: Vec2; initialEnd: Vec2; breakRadius: number; downwindY: number; abeamX: number; ninety: Vec2; finalDeg: number; rampX: number; grooveNm: number; stackCentre: Vec2; stackR: number }
export function racetrack(P: (p: Vec2) => Vec2): Path2D    // nominal Case I path under any mapping
export const LEG_CODE: Record<PatternKeyframe['leg'], string>

// scope.ts
export interface ScopeOpts { selected: string | null; onDeck: number; air: number; deck: EquipmentKeyframe['deck']; catSummary: string }
export function drawScope(ctx: CanvasRenderingContext2D, cam: Camera, tl: Timeline, t: number, now: number, lod: Lod, opts: ScopeOpts): void
export function drawScopeTracks(ctx: CanvasRenderingContext2D, map: (nm: Vec2) => Vec2, tl: Timeline, t: number, now: number, size: 'full' | 'mini', alpha: number): void   // shared with the inset
export function hitScopeTrack(cam: Camera, tl: Timeline, t: number, screen: Vec2): string | null
```

Cat tag words (`hud.ts`): `SAFE` (no jet on the cat), `SPOT` (on-cat), `TENSION`, `FINAL` (salute), `SHOT`,
`RETRACT` (0 < shuttle < 1 with no jet), `SECURED` (waist cats once recovery starts). A `T-nn` countdown to the next
`shots[]` t0 for that cat appears from tension onward. Tags are 10 px mono `--hud-ink` with a `--hud-halo`, anchored
20 ft aft of the JBD, outboard of the track, shown at z 0.45-3. The cat tags sit where today's "cat N" deck labels
are, so they **replace** those labels while the tags are shown.

**Reticle**: four L-brackets (`--hud-bracket`, 1.5 px, 6 px legs) replace today's dashed rect. The data block
reads `203  F/A-18E` / `TAXIING  6 KT`, plus a third line `AB` when power is 2. Speed comes from `|p(t) - p(t-0.5)|`.

### D.2 `main.ts` changes

- At startup: `const fx = buildFxIndex(timeline, DECK)`.
- Per frame: `const L = lodFor(cam.zoom)`. Sample all jets once into `jets: JetState[]` and build `onDeck` (the ids of
  visible deck samples). If `L.scope < 0.999`, run the world pass in the order of A.7. The crew loop is skipped when
  `L.crew === 0`, otherwise it runs with `ctx.globalAlpha = L.crew`. Then `drawScope` when `L.scope > 0`,
  `drawPatternInset(..., { alphaMul: ramp(z, 0.12, 0.20) })`, then `drawScaleBar`.
- `app.classList.toggle('scope', …)` with hysteresis.
- onClick: inset hit test → `goView('pattern')`. Then aircraft hits: deck, airborne silhouettes, scope symbols
  (8 px). `ui.selectedAircraft` works for airborne jets too. Follow uses the pattern position (converted to world)
  when the deck sample is hidden.
- `goView` takes a per-view tween duration (1.4 s for any change of more than ×8 in zoom).

### D.3 Other files

- `camera.ts`: `minZoom = 0.015`. Nothing else.
- `aircraft.ts`: the inline exhaust block is replaced by a `drawJetExhaust` call. The selection rect moves to `hud.ts`
  as the reticle. The low-zoom arrow stays. New `opts.alpha`.
- `deck.ts`: the catwalk stroke and hull fill move to `ship.ts`, the island moves to `ship.ts`. Raised JBD becomes the
  bar + shadow. Adds the wear band, padeyes, speckle, wire hot stroke and shuttle streak. `drawDeckLabels` skips cat
  labels while cat tags are visible.
- `crew.ts`: no change. The caller sets `globalAlpha`.
- `pattern.ts`: geometry is imported from `patternGeometry.ts`. Restyled as a mini-scope via `drawScopeTracks`.
  `alphaMul` option. `export function patternInsetBox(): { x: number; y: number; w: number; h: number } | null`.
- `data/deck.ts`: the `pattern` VIEW; `sponsons: Vec2[]` [EST]; `antennas: { at: Vec2; len: number }[]` [EST];
  `beacons: Vec2[]`. `deckTypes.ts` gains the matching fields.
- `sim/planner/recovery.ts`: `export` STACK_CENTRE and STACK_R. Read only; no behaviour change.
- `tokens.ts` / `styles.css`: the tokens in A.6, plus a `.scope` chrome block.
- `ui/panel.ts`: the view list already comes from `VIEWS`. Check that key 6 is wired.

### D.4 Performance plan (budget ≤ 6 ms/frame at 1440×900, dpr 2, on a mid laptop)

| Item | Approach | Est. cost |
|---|---|---|
| Sea | 3 pattern `fillRect`s, transforms only | 0.6 ms |
| Wake | Cached world `Path2D`s. The foam is composited in one reusable offscreen canvas sized to the visible wake bbox, reallocated only on resize | 0.8 ms |
| Steam/smoke | One cached puff sprite per colour, drawn with `drawImage` + `globalAlpha`. At most about 4 × (28 + 12×5) live puffs, so ≤ 250 `drawImage`s. Off-screen puffs culled | 0.7 ms |
| Exhaust | ≤ 4 jets × 2 gradients | 0.2 ms |
| Crew | Unchanged. Skipped at z < 0.14 | — |
| Scope | ≤ 33 symbols + blocks. `measureText` cached per string. Ring and tick paths cached per (zoom, viewport) key | 1.0 ms |
| World skipped at scope 1 | — | saves ~4 ms |

All noise, pattern and sprite canvases are built lazily on the first frame (about 15 ms total). `resetTokens()` also
calls `clearTileCache()`. A dev-only `?perf=1` draws a frame-time readout, and `?fx=0` disables layer 14 for the R2
check.

---

## E. Image generation

**None. Fully procedural, $0.** Reasons:
1. Every texture this direction needs (sea, foam, non-skid, steam, blast) is low-frequency noise. A 256 px fBm tile
   gives that at runtime with no assets, and it stays tileable and token-tinted.
2. A raster image can't take token colours, would be ambiguous in scale across a ×900 zoom range, and would show
   seams and repetition at the swell tile size.
3. The scope is pure symbology, so an image adds nothing.

If an implementer still wants a reference for tuning the foam look, the most I'd endorse is one medium image
(≈ $0.07), used **only as a tuning reference and never shipped**:
`"Top-down orthographic aerial photo of an aircraft carrier steaming fast across calm grey-blue open ocean, long white
turbulent wake and faint Kelvin wake arms trailing behind, foamy bow wave, no text, no logos"`, 1024×1024, medium.
It is optional. No test images were generated for this proposal, and nothing was appended to spend.log.

---

## F. Acceptance checks

The `zoom` argument of `tools/shot.mjs` multiplies the view's fitted zoom (deck fit ≈ 0.92 px/ft at 1440×900, panel
open). All shots are at 1440×900.

1. **`t=330 deck zoom=1`** (DECK band). Ocean swell and chop are visible. The wake leaves the stern to screen-left past
   the edge, with white churn just aft of the ramp and Kelvin arms flaring at ±19.5°. A bow-wave flare shows past both
   bow edges, and a stem crescent ahead of the bow. The ship shadow falls down-right. The island is layered, with
   antennas and beacons. **Steam from the cat 4 shot at t=320 drifts aft along the waist; slot wisps along cat 1 and
   cat 4.** Every jersey dot visible in `base-deck.png` is still visible.
2. **`t=296 bow zoom=2.5`** (PLAT band). 211 (the tanker, heavy) on cat 1 in afterburner, with shock diamonds. The JBD
   is a raised bar with a shadow, a blast fan sits aft of the JBD, and the next jet behind it is still clearly
   outlined. A battery-venting puff. The cat 1 tag reads "TENSION T-04" or "FINAL T-04".
3. **`t=301 bow zoom=1.5`**. 211 mid-stroke: ghost smear, a shuttle streak, the stroke plume rising along cat 1's
   track. The shooter's and TSPO's dots are on top of the steam.
4. **`t=900.5 wires zoom=2`**. 203's trap: tyre smoke puffs at the main gear, hook sparks, the 3-wire hot and bowed, a
   "3-WIRE" tag. The LA crew dots are readable.
5. **`t=1201 wires zoom=1.5`**. 304's bolter: an amber "BOLTER" callout, the afterburner, sparks along the LA. Plus
   **`t=1272 wires zoom=1`** (107's wave-off, at its touchdown 1285 minus 15 s, adjust to the logged event): "WAVE OFF"
   in red, and the lens marker red in one of two frames 0.25 s apart.
6. **`t=1000 deck zoom=0.2`** (z ≈ 0.18, SHIP band). The whole ship is small. The 2.3 nm wake dominates the left. The
   pattern's airborne jets are drawn as silhouettes with sea shadows offset by altitude. Crew are faded out. The
   merged ship tag shows, the pattern inset is hidden, and the scale bar reads "1000 ft".
7. **`t=1000 deck zoom=0.085`** (z ≈ 0.078, mid-crossfade). The sea is darkening, the deck dimmed with a phosphor
   outline traced over it, the inner range rings in and the outer ones not yet, and both silhouettes and dome symbols
   on the airborne jets. No double-bright regions and no hard edges.
8. **`t=1000 pattern zoom=1`** (z ≈ 0.026, full scope). Dark glass with scanlines. Rings 1-5+ nm with labels, the
   bearing scale, BRC and FINAL lines, the nominal Case I racetrack with leg labels, and the marshal circle with jets
   on it. Every airborne jet has a dome symbol, history dots, a velocity leader and a 2-line data block, and **no data
   blocks overlap**. The own-ship outline has its heading vector and wake clutter. The own-ship block says
   "DECK GREEN" in words. The header is in phosphor ink (`#app.scope`). The pattern inset is hidden. Also take
   `t=1000 deck zoom=1` (pass '' for cx and cy, extraQuery `fakepattern=stack`): the inset renders as the mini-scope.

**Readability checks (pass/fail):**
- R1: count the jersey dots in shot 1 against base-deck.png at the same t. Same count, because fx are drawn under crew.
- R2: no fx pixel over a deck label or HUD tag. Layer order guarantees it; verify with `?fx=0` and a diff of the label
  boxes.
- R3: at the deck view, the deck reads clearly against the sea: `#4a4d52` on `#8ea4ab` is about 2.9:1, and the
  `--deck-edge` lip and ship shadow add the edge. Foam covers < 12 % of the deck-view viewport.
- R4: `prefers-reduced-motion` (emulated in Playwright): no sweep, no flicker, no shimmer motion, a static beacon.
  Sim-driven steam still renders, and the same `t` gives byte-identical screenshots.
- R5: scrub determinism. A shot at t=301 after seeking from 0 must be pixel-identical to one taken after seeking from
  600, under reduced motion.
- R6: 60 fps at the deck view during the 4× launch phase (Chrome performance panel, ≥ 95 % of frames under 16.7 ms),
  and at the full scope.
