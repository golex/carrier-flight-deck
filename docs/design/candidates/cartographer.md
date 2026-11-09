# Visual direction: "Cartographer"

A nautical-chart and technical-drawing take on the brief. The sea is a pale chart sheet engraved with
water-lines. The ship is a precise plan drawing that casts a shadow. Wake, steam and jet blast are drawn as
explained line work: hatching, feathering, contours and heat lines, the way an Admiralty chart or an
engineering plate would draw them. Spectacle comes from **motion and scale**. The sea streams aft at
27 kt, steam is blown down the deck, shadows close in as a jet descends the groove, and the camera can
zoom out so far that the chart turns into the ship's own air-search radar scope (an *iris* that opens out
from the hull). There is very little new colour. The only new saturated colours are burner light, the
blast-danger hatching (red, as painted on real decks) and the alerts.

Ground rules carried from the brief and the code:
- World frame: feet, x forward of the ramp, y to starboard. Bow is screen right, starboard is screen down.
- Anything that tells the story derives from **sim time `t`**: sea drift, wake foam, steam, smoke, skid marks,
  the radar blips and their history trails. Only *cosmetic* motion uses wall clock: burner flicker, the scope
  sweep and the island antenna rotation (they share one function).
- `prefers-reduced-motion`: the sea texture is frozen (no drift), there is no flicker, and the sweep is
  replaced by a static scope. Sim-state effects still show the state at `t`.
- Canvas 2D only. Everything heavy is cached once, as Path2D in world feet or offscreen pattern tiles.
- No image generation (§E). Spend: **$0**.

Simulation facts used throughout (checked against `buildTimeline()`):

| What | Value |
|---|---|
| Ship speed through water | 27 kt = **45.6 ft/s** (`V_SHIP`) |
| Kelvin half-angle | 19.47° |
| Transverse wavelength λ = 2πV²/g | **405 ft** |
| Deck height above the waterline | 60 ft (§1.2) |
| Shots, power 2 (afterburner) | 211 cat 1 at t = 300, 103 cat 4 at 320, 204 cat 1 at 400, 106 cat 2 at 460, 310 cat 3 at 770 (suspended first at 654-663). Others shoot at power 1 |
| Stroke | `shot` lasts 2.7 s, then `airborne` |
| Groove on the main view | starts 6 s before touchdown at x = -1235, y = 214. Touchdown about x 283, y -26 |
| Traps | t = 900, 950, 1000, 1050, 1100, 1150, 1250, 1350, 1400, 1450, 1500, 1550 |
| Bolter | 304 at t = 1200 (power 2) |
| Wave-off | 107 at t = 1279 (power 2) |
| Pattern frame | nm, ship **centre** at the origin (world x = 546 + 6076·px, y = 6076·py). Stack centre (1.0, -1.5) nm, radius 1.5. Initial from (-3, 0.2). Departures out to x = 2.8 |

---

## A. Ocean and ship

### A.1 Sea: base and the three engraved octaves

The base stays a pale chart tone. It is deepened just enough that white foam reads:
`--sea: #c3ced2` (was #cfd6d8). Over it go **water-lines**: short, slightly curved hairline crests drawn
in ink at very low alpha, the way an engraver shades open water. The crests run across the wind (wind
is from the bow), so on screen they are mostly vertical strokes with ±25° jitter.

**Implementation: three cached pattern tiles ("octaves"), drawn as world-scaled patterns.**
- Each octave is a 512×512 offscreen canvas (`OffscreenCanvas` when available, a detached `<canvas>`
  otherwise). It is generated once from a seeded RNG (mulberry32, fixed seeds 11/12/13). Each tile holds
  about 260 strokes. A stroke is a quadratic curve 6-22 tile px long, 0.9 tile px wide, coloured
  `--sea-line`. Strokes that cross an edge are drawn again at ±512 so the tile wraps seamlessly.
- The octaves differ by world scale: **O0 = 1/8 ft per tile px** (ripples), **O1 = 1 ft** (chop),
  **O2 = 8 ft** (swell; this tile uses `--sea-line-2`, longer strokes and lower density).
- Each frame, for each octave with alpha > 0, `ctx.fillStyle = pattern` and `pattern.setTransform(M)`, with
  `M = translate(anchor.x, anchor.y) · scale(z·s_o)`, then one `fillRect` over the viewport.
- **Octave alpha** (a log-zoom bump, so strokes stay about 1 screen px wide): `q = log2(z·s_o)`,
  `a_o = clamp(1 - |q - 0.2| / 1.6, 0, 1)`. Normalise the alphas to sum to at most 1.
  The result: O0 is visible at z 3-14, O1 at 0.4-4, O2 at 0.05-0.6.
- **Drift with t.** Water moves aft relative to the ship at `V_SHIP`. The anchor is the screen point of the world
  point `(-((V_SHIP·t) mod (512·s_o)), 0)`. O2 also gets a small cross-drift of +0.6 ft/s to starboard (a
  residual swell from the port bow). Scrubbing is consistent because the drift is a pure function of `t`.
- **Strobing guard.** At high playback the fine octave would alias. Let `pxs = V_SHIP·z·clock.speed`
  (screen px/s). Multiply the alphas of O0 and O1 by `clamp(1.6 - pxs/500, 0.25, 1)`. This changes alpha
  only, never position, so determinism is untouched.
- Reduced motion: anchor at t = 0.
- The sea is drawn when `bands.scope < 1`. In the scope band it sits under the iris (§B).

There is no full-screen gradient and no vignette. The paper stays flat, like a chart.

### A.2 Waterlining: the hull's displacement wave

This is the cartographic signature: **3 contour lines hugging the hull**, as charts waterline a coastline.
The spacing widens outward (offsets d = 14, 34, 64 ft from the waterline hull `g.hull`) and the lines get
fainter (alpha 0.55, 0.35, 0.2).
- The lines are computed once in world ft. Offset the convex 7-point `g.hull` polygon by d with round
  joins (edge normals plus 6-segment arcs at the vertices), then cut it at the stern quarter (x < 60) so
  the contours stay open aft.
- **Bow pressure wave.** Push each contour's forward vertex (bow, x = 1066) forward by `0.9·d` so the lines
  bunch at the stem. Along the forward 250 ft, draw each contour as a white crest line (`--foam`, 1.4 px)
  with an ink trough line (`--waterline`, 0.6 px) offset 1.2 px to the line's outboard side. This is the
  engraver's emboss and makes the bow wave read on the pale sea.
- The rest of each contour is ink only (`--waterline`, 0.8 px, dashed 12/10 ft) so it reads as "water",
  not as structure.
- The aft ends flare out at the Kelvin angle and merge into the Kelvin arms (A.3).
- The contours are static in the ship frame. A steady wave pattern does not move relative to the hull,
  which is physically right.

### A.3 Wake geometry (ship frame; static envelope, drifting texture)

The ship sits at the left edge of the sea it has just crossed, so the wake streams off to screen left.

1. **Kelvin arms (divergent waves).** The apex is at the bow waterline (1066, 0). The arms run aft at
   ±19.47°, so their half-width at the stern is 1066·tan 19.47° ≈ **377 ft**: visible well outboard of
   the deck (port edge -142, starboard edge 120). Each arm is drawn as **feathers**: short crest strokes
   *en echelon*. One every 90 ft along the arm, each at 35° to the arm and pointing outboard-aft. Feather
   length is `40 + 0.012·s` ft, where s is the distance along the arm from the apex. Arm length is
   **9,000 ft**. Alpha is `0.85·exp(-s/3500)`. Each feather is a white crest (`--foam`, 1.2 px) plus an ink
   trough (`--waterline`, 0.5 px) offset to its aft side. Feathers under the deck are simply covered by it.
2. **Transverse crests.** Between the arms there are arcs across the course every **405 ft** (λ),
   starting 200 ft astern of the ramp. Each arc spans the wedge at that station with a sagitta of 6% of
   its chord, convex aft. Ink only (`--sea-line-2` stroked twice), alpha `0.5·exp(-s/2500)`. There are
   about 10 arcs.
3. **Turbulent (propeller) wake.** This is the white scar. The envelope is a polygon from the stern
   (x = 20, half-width 58 ft, slightly less than the 134 ft waterline beam) widening as
   `w(s) = 58 + 0.03·s` ft out to **s = 15,000 ft (2.5 nm)**. It has a gentle sinuous meander,
   `y_c(s) = 18·sin(s/1300)`, which is static (rudder history). Inside it:
   - a **foam stipple** pattern (a 4th tile, 256 px: about 900 white dots r 0.6-1.6 px plus about 60 short
     streaks along x), drawn with `--foam-2`, world scale 0.5 ft per tile px at z ≥ 0.5, switching to
     4 ft per tile px below (same log-bump rule). The pattern anchor **drifts aft at `V_SHIP·t`** like the
     sea, so the foam visibly streams away from the stern.
   - an **opacity falloff along s**: clip to the envelope, then draw the stipple. Lay a linear gradient
     (screen space, along the wake axis) over it in `--sea` from transparent at s = 0 to opaque at
     s = 15,000, so the foam dies out with distance. Drawing a sea-coloured fade over the foam is the
     cheap equivalent of a mask.
   - **Edge lines.** Both envelope edges are drawn as ink hairlines (`--waterline`, 0.6 px) dashed
     `[6, 10]` px for the first 3,000 ft, then they fade. This is the chart "limit of foam" line.
   - **Propeller boil.** A brighter oval at the stern: 120×70 ft centred at (-40, 0), white at 0.35 with
     the stipple at double density (the same pattern drawn twice).
4. **At far zoom** (z < 0.06) the wake reduces to the turbulent scar only: a tapering white line plus the
   two feather arms as single hairlines, so a 30-px ship still trails a 450-px wake. That is the money
   shot of the zoom-out.

All of 1, 2 and the envelope are **Path2D in world feet, built once**. They are drawn under a world
transform (§D). Line widths are given in screen px, so the code sets `lineWidth = px / z`.

### A.4 Ship depiction (changes to `deck.ts`)

A precise plan, with depth carried by shadow, not by colour.

| Element | Today | Proposed |
|---|---|---|
| Ship shadow on water | none | Deck outline translated by `shadowOffset(60)` = (+12, +35) ft (A.5), filled `--shadow-ship`, drawn **before** the catwalk. It shows as a dark sliver off the starboard edge and around the bow. |
| Catwalks | 24 ft dark stroke | Kept as a stroke in `--catwalk`. At z ≥ 2, **grating** is added: short perpendicular hairlines every 3 ft along each outline edge, from the edge to 12 ft outboard (`--catwalk-grate`, 0.5 px). They are built once as a cached Path2D. At z ≥ 1, a **safety-net** line runs along the outer catwalk edge, dashed `[2, 3]` px, `--net`. |
| Hull | dark polygon under the deck (invisible) | Removed as a fill. `g.hull` is still used for waterlining. |
| Sponsons [EST] | only the LSO platform | Four more small plan shapes outboard of the outline, `--deck-2` with an `--deck-edge` stroke: starboard aft quarter (40-80, 97-112), port aft quarter (20-60, -60 to -78), port forward (860-900, -60 to -76), starboard forward (820-860, 65-82). At z ≥ 2.5 each gets a 6 ft circle (a weapon mount), outline only. Marked EST in `data/deck.ts`. |
| Elevators | flat polygon, white stroke | Flat polygon plus a **hazard perimeter** at z ≥ 0.8: dashes alternating `--mark-red` and `--mark-yellow`, dash 5 ft, 1.2 px, inset 1 ft (§1.9 [SRC]). Plus a dark **seam** (`--deck-edge`, 1 px) on the outboard edge. |
| Island | flat light block, offset drop shadow | **Stepped plan**: the footprint (`--island-2`) plus two inset levels, the 07 level inset 6 ft and the 010 level inset 14 ft, each one tone lighter (`--island-3`, `--island-4`), drawn as nested polygons with a 0.6 px `--deck-edge` stroke. Pri-Fly glass is a 2 ft band on the aft and port faces of the top level in `--canopy`. **Mast** is a 10 ft square at (415, 92). The **SPS-48** (a 16 ft bar) and **SPS-49** (a 24 ft bar) sit on the mast and aft platform at (415, 92) and (330, 100), **rotating** at 15 and 12 rpm by `radarAzimuth(nowMs, rpm)` (cosmetic), drawn at z ≥ 1.2. **Beacon**: a 2.5 ft dot on the aft face (300, 92) in `--status-green` when `eq.deck === 'green'` and `--status-red` otherwise, ringed in `--deck-edge`. **Island shadow**: an extruded shadow (the convex hull of the footprint and the footprint translated by `shadowOffset(130)` = (+27, +76) ft), `--shadow-ship`, drawn on the deck **under** jets and crew. It mostly falls off the starboard edge onto the water. |
| Hull number | none | A large "68" in `--mark-white` at 0.35 alpha on the bow, rotated so it reads from the stern (x 1000-1060, y -10 to 10, 40 ft cap height), at z ≥ 0.4. IBM Plex Mono bold is fine. |
| Ladder rungs, foul line | not drawn / plain red | Foul line drawn red/white dash 8/8 ft (§9.4). Ladder rungs: 10 ft white @ 0.5 every 50 ft along both LA edges, z ≥ 0.7. These are cheap and make it read as a drawing. |

### A.5 Shadows (single sun)

`SUN = { ux: 0.35, uy: 0.94, k: 0.58 }`: the shadow direction is mostly to starboard with a little
forward lean, and `k = 1/tan(60°)`. So `shadowOffset(h) = (ux·k·h, uy·k·h)`. The shadows fall
**away from the angled deck and the wake**, onto the empty starboard sea, and never cover the landing area.
- Ship: h = 60 (deck to water). Island: h = 130 above the deck (drawn on the deck).
- **Aircraft**: the silhouette is filled once more in `--shadow-air` at `shadowOffset(h)`, where
  - on deck: h = 6 (a grounding shadow, a 3.5 ft offset)
  - `groove` / `waveoff` and x < 0 (behind the ramp): `h = 60 + 10 + (-x)·tan(3.5°)`, measured from the
    water. The shadow is drawn **on the sea** at that offset. At x = -1235 that is about 145 ft, an offset of
    (29, 79) ft. The shadow converges on the jet as it crosses the ramp, and from then on h = deck-relative 6.
  - `shot` and the first second after leaving the bow: h grows to 60 + 30·(seconds since the end of the deck).
    The jet visibly lifts off its shadow.
  - `bolter` / `waveoff` beyond x > 700: `h = 6 + (x - 700)·0.08`.
- The shadow is always drawn **before all aircraft** (one pass), so no shadow lies on top of a jet.
  At z < 0.35 the shadow is the low-zoom arrow shape.

### A.6 Tokens (add to `:root` in styles.css and to `Tokens` in tokens.ts)

```css
/* sea and wake */
--sea:            #c3ced2;   /* was #cfd6d8 */
--sea-line:       rgba(34, 54, 64, 0.16);  /* engraved chop strokes */
--sea-line-2:     rgba(34, 54, 64, 0.09);  /* swell strokes, transverse crests */
--waterline:      rgba(34, 54, 64, 0.30);  /* hull contours, crest troughs, foam limit */
--foam:           rgba(250, 251, 248, 0.92);
--foam-2:         rgba(250, 251, 248, 0.55);
--shadow-ship:    rgba(28, 40, 48, 0.22);
--shadow-air:     rgba(28, 40, 48, 0.20);
/* ship */
--catwalk:        #34373b;
--catwalk-grate:  rgba(232, 230, 223, 0.10);
--net:            rgba(232, 230, 223, 0.28);
--island-3:       #7a7d83;
--island-4:       #888b91;
--status-green:   #39d353;   /* §9.3 beacon / deck-status, used only as 2-3 px lights */
--status-red:     #ff3b30;
/* flair */
--burner-core:    #fff4dc;
--burner-diamond: rgba(255, 250, 236, 0.9);
--heat:           rgba(255, 255, 255, 0.22);
--blast-hatch:    rgba(200, 71, 59, 0.30);
--steam:          rgba(255, 255, 255, 0.55);   /* existing, now actually used */
--tyre-smoke:     rgba(236, 236, 232, 0.60);
--skid:           rgba(18, 19, 21, 0.20);
--spark:          #ffd27a;
/* scope (B) */
--scope-bg:       #10161a;
--scope-bg-2:     #0b1013;
--scope-ring:     rgba(170, 205, 192, 0.20);
--scope-ring-2:   rgba(170, 205, 192, 0.38);
--scope-leg:      rgba(170, 205, 192, 0.45);
--scope-ink:      #d6e6df;
--scope-ink-2:    rgba(214, 230, 223, 0.62);
--scope-sweep:    rgba(170, 230, 205, 0.20);
--scope-blip:     #eef8f3;
--scope-alert:    #ef6a5c;
--ink-on-scope:   #dfe8e3;
--ink-on-scope-2: rgba(223, 232, 227, 0.66);
```

### A.7 Layering (world, bottom to top)

sea base → sea octaves → transverse crests → wake foam + edges → Kelvin feathers → waterlining + bow wave →
**ship shadow** → catwalk + grating + nets → sponsons → deck + markings + elevators → **skid marks** →
cat tracks / JBDs / wires → island shadow → island levels / radars / beacon → **blast hatching + heat
lines** (deck fx) → vehicles → **aircraft shadows** → **burner plumes** → aircraft → **steam, tyre
smoke, sparks, speed lines** → crew → control cones → deck labels → chart traffic → **scope layer**
(iris) → pattern inset → DOM chrome.

---

## B. Zoom-out and the radar scope

### B.1 Camera range and bands

- `Camera.minZoom = 0.012` (was 0.25). At 1440 px that is 120,000 ft, about 20 nm across: room for the
  5 nm ring with margin. `maxZoom` stays 14.
- Bands come from **log zoom**, with smoothstep `S(a, b, z)` taken on `log(z)`:

| Band quantity | Formula | Effect |
|---|---|---|
| `crew` | `S(0.12, 0.20, z)` | Crew dot alpha. Below 0.12 crew are not drawn at all (loop skipped). |
| `inset` | `S(0.18, 0.30, z)` | Pattern-inset alpha multiplier. The main view shows the pattern from here on. |
| `traffic` | `1 - S(0.20, 0.30, z)` | Airborne pattern aircraft drawn on the **chart** (sea band) as true-scale arrow symbols with shadows and a one-line modex label |
| `scope` | `1 - S(0.035, 0.06, z)` | Iris openness, 0 = chart, 1 = full scope |
| `labels` | existing (z ≥ 0.55) | unchanged |

- At 1440 px wide the familiar views sit around z 0.9-3. "Ship at sea" (the whole wake) is about z 0.08-0.2.
  The scope is fully open at z ≤ 0.035. The new **pattern view** fits at about 0.022.
- The crossfade width for the scope is 0.035 → 0.06 (0.78 octave), roughly two wheel notches.

### B.2 The transition: an iris that opens from the ship

The scope does **not** cross-dissolve over the chart, which would be muddy. It opens as a **disc
centred on the ship's centre** (world 546, 0). The disc radius is
`R = scope^1.5 · hypot(w, h)` screen px. Inside the disc the scope is drawn; outside, the chart. The disc
edge is drawn as a 1 px `--scope-ring-2` ring with a 6 px soft outer edge, an outward radial gradient from
`--scope-bg` to transparent. At intermediate zoom the disc edge *is* a range ring and is labelled with its
range in nm (`R/(z·6076)`, one decimal). So a half-open iris reads as "scope range 1.8 nm", a deliberate
state rather than a glitch.

Implementation: `ctx.save(); ctx.beginPath(); ctx.arc(shipScreen, R); ctx.clip();` then draw the scope
(background fill, rings, legs, blips). Anything outside the clip remains the chart: sea, wake, ship and
chart-style traffic symbols.

**No doubling rule.** For each airborne aircraft, if its screen position lies within R of the ship, draw only
the scope blip. Otherwise draw only the chart symbol. The deck view stops drawing a jet once it is
`airborne`, and the pattern track starts at the shot/ramp, so deck and pattern never double. The source
for each jet: the aircraft sample while it is visible on the main view (deck, groove, bolter, waveoff);
otherwise the pattern sample with `leg !== 'none'`.

### B.3 Scope style in full

- **Background**: `--scope-bg`, with a radial gradient to `--scope-bg-2` at 1.2× the 5 nm ring. A flat
  instrument, no texture and no scanlines.
- **Range rings**: centred on the ship centre, every 1 nm (`--scope-ring`, 1 px). The 5 nm ring uses
  `--scope-ring-2`, 1.5 px. Labels "1", "2", "3", "4" and "5 NM" in `--scope-ink-2`, 10 px mono, at the
  ring's 315° (upper-left) point. Half-nm rings appear as dotted lines at z ≥ 0.03.
- **Bearing scale**: ticks on the 5 nm ring (or on the largest ring inside the viewport): 2° minor (3 px),
  10° major (7 px) and **relative** labels every 30°, "000R" at the bow (screen right), "090R" at starboard
  (down), and so on. "000R" also says "BRC" under it.
- **Wind**: a small arrow and "WOD 27 KT" text at 000R, outside the ring.
- **Sweep**: angle `θ = radarAzimuth(nowMs)` (12 rpm, the SPS-49), clockwise. It is drawn as a conic
  gradient (`ctx.createConicGradient(θ - 0.7, sx, sy)`) from `--scope-sweep` at the leading edge to
  transparent 40° behind, inside the 5 nm ring, plus a 1 px leading line at 0.45 alpha. If conic gradients
  are unavailable: 8 stepped wedges. Reduced motion: no sweep at all.
- **Blip brightness**: `0.7 + 0.3·exp(-Δθ/1.2)`, where Δθ is the angle since the sweep passed. This is
  cosmetic only. **Blips are always drawn at their true current position and are never hidden.**
- **Aircraft symbol**: a filled chevron 7 px long pointing along the ground track (heading from
  `samplePattern(t) - samplePattern(t - 2)`), `--scope-blip`.
  - **History trail**: 5 dots (r 1.2 px) at the positions sampled at t-4, -8, -12, -16 and -20 s, with alpha
    0.5 → 0.1. This is the ATC convention, deterministic from `t`, and needs no state.
  - **Velocity leader**: a line to the predicted position 20 s ahead, from that derivative (not from future
    track data), `--scope-ink-2`, 1 px.
- **Data block** (ATC full data block, IBM Plex Mono 11 px, 2 lines, `--scope-ink`):
  ```
  304 E
  006 DNWD
  ```
  Line 1 is the modex plus a type letter (E / F / G). Line 2 is the altitude in hundreds of ft (3 digits)
  plus the leg code: MSHL, INIT, BRK, DNWD, 180, 90, GRV, DEP, BLTR, WOFF. The block sits at one of 8
  positions around the symbol, chosen by the first that clears the existing taken boxes (reuse the inset's
  `taken` approach). It is tied to the symbol by a 12 px leader line. The selected aircraft's block is
  boxed in a 1 px `--scope-ink` rectangle.
- **Alerts**: for 12 s after a `bolter`/`waveoff` (from the AircraftStatus track), the symbol and block are
  `--scope-alert`, and line 2 reads "BOLTER" or "WAVE OFF". During `waveoff` the block blinks at 2 Hz from
  `t`, unless reduced motion is on.
- **Marshal stack**: more than 4 jets in `marshal` collapse (as the inset does) to small 2 px dots with no
  blocks, a dashed orbit circle (the stack ring, centre (1.0, -1.5) nm, r 1.5 nm) and one block
  `STACK ×7 / 020-040`.
- **Pattern legs**: the nominal Case I racetrack is drawn as an approach-plate line: `--scope-leg`, 1 px,
  dashed `[4, 4]`. The leg names are set *along* the legs in 10 px small caps, `--scope-ink-2`:
  "INITIAL 800", "BREAK", "DOWNWIND 600", "180", "90 · 450", "GROOVE 3.5°". The **final approach
  course** is a solid line extended 4 nm astern along the 9° angled-deck bearing, with ticks every 0.5 nm
  and "1 NM" / "2 NM" labels, like an approach plate. Geometry is shared with pattern.ts (export its
  constants).
- **Ship symbol**: the deck outline to scale (about 25 px at z 0.022), filled `--scope-blip`, with a
  **velocity leader** 1 min ahead (0.45 nm) and "CVN 68 · BRC 000 · 27 KT" in a data block below it. The
  wake shows as a faint 2 nm dotted trail (`--scope-ring`).
- **Deck readout**: a fixed block at the scope's lower left, inside the free area:
  `ON DECK 21   AIRBORNE 10   DECK GREEN` (deck state from `eq.deck`; "FOUL" shows in `--scope-alert`).
  This tells the reader the deck still exists.
- **Departures**: DEP blocks for 45 s, then they fade (the track ends at 2.8 nm).

### B.4 Overhead-pattern inset

- Its alpha is multiplied by `bands.inset`, so it fades out between z 0.30 and 0.18. The main view *is* the
  pattern by then.
- At z ≥ 0.3 the inset gains a footer link drawn on the canvas, "Show whole pattern ⤢" (11 px,
  `--ink-2`). Export `insetBox(cam, panelOpen)` from pattern.ts. In main.ts's tap handler, a tap inside the
  box calls `goView('pattern')` before the aircraft hit test.

### B.5 New VIEW preset

```ts
{ id: 'pattern', name: 'Whole pattern', key: '6',
  minX: 546 - 3.4 * 6076,  // -20112: initial (−3 nm) plus margin
  minY: -3.2 * 6076,       // -19443: top of the stack ring
  maxX: 546 + 3.0 * 6076,  //  18774: departures to 2.8 nm
  maxY: 0.8 * 6076 }       //   4861
```
`goView` tween duration: `clamp(0.7 + 0.22·|log2(z1/z0)|, 0.7, 1.8)` s, so the long zoom out to the
scope (about 5.4 octaves, 1.9 s, clamped to 1.8) lets the iris open on screen. The tween is already in log
space, which suits the zoom.

### B.6 UI chrome

- `#app` gets class `scope` when `bands.scope > 0.5` (with hysteresis 0.45/0.55). CSS: `.scope .hdr-title,
  .scope .hdr-phase { color: var(--ink-on-scope) }`, `.scope .hdr-sub { color: var(--ink-on-scope-2) }`,
  with `transition: color 0.4s` (killed by the existing reduced-motion rule). The panel and transport cards
  are unchanged (they are cards on any background).
- The views list gains "Whole pattern (6)".
- Phone (≤ 760 px): the pattern view fits the top 58 % (chromeInset already does this). Data blocks drop to
  1 line (modex only) when `cam.w < 500`.

---

## C. Flair, in priority order

Every effect obeys these rules:
- **R1**: never drawn over crew dots. Crew stay on top, except the scope layer.
- **R2**: alpha ≤ 0.55 for anything that covers deck, so jets and markings remain legible through it.
- **R3**: gone within 12 s, except skid marks, which are cumulative and faint.
- **R4**: driven by sim state at `t`.
- **R5**: invisible below its zoom floor.

`buildFxIndex()` (§D) precomputes every trigger once from the timeline.

| # | Effect | Trigger | Geometry and timing | Layer | Zoom |
|---|---|---|---|---|---|
| 1 | **Catapult steam along the track** | `shots[]`: the first keyframe with status `shot` per jet. Cat = nearest `DECK.catapults[i].start`. | Puffs every 8 ft along the stroke, about 39 per shot. A puff at track fraction u is **born when the shuttle passes it**: constant acceleration, so `t_b = t_shot + 2·√u`. Each puff is a cached 64 px radial sprite (`--steam` centre to 0). Radius `4 + 14·a` ft, where `a` = age/6. Alpha `0.5·(1-age/L)²`, with life `L = 6 + 4·(1-u)` s (the aft end lingers longer). It **drifts aft at 18 ft/s** (wind over deck, slowed in the boundary layer) plus 2 ft/s outboard, with a per-puff jitter from a hash of (shot, i). A lingering **battery wisp**: 3 puffs at the shuttle start, each lasting 12 s. **Pre-shot leaks**: during `tension`/`salute`, 3 small wisps (r 3 ft, alpha 0.2) at hashed points along the slot, each repeating on a 2.5 s cycle (`t` mod). | over aircraft, under crew | z ≥ 0.15 |
| 2 | **Afterburner plume** | `s.power === 2` and not airborne | Two nozzles at y = ±1.9 ft in the jet frame, behind `-length/2`. For each: an outer cone, 26 ft long and 3.4 ft wide at the root, in a gradient from `--burner` to transparent. A core, 9 ft long and 1.4 ft wide, in `--burner-core`. **Shock diamonds**: 4 small ellipses (1.6×0.9 ft) every 2.6 ft in `--burner-diamond`. Length × `(1 + 0.05·sin(nowMs·0.031 + seed))` flicker (cosmetic; off when reduced motion). During `shot` the plume lengthens to 40 ft. Power 1: only the existing small glow. | under the airframe, inside `drawAircraft` | z ≥ 0.4 (cones), diamonds z ≥ 2 |
| 3 | **Jet-blast danger hatching** | power ≥ 1, the jet on deck, status `on-cat`, `tension` or `salute`, or `manned` with power | A cone behind the jet: half-angle 10°, length 90 ft (MIL) or 140 ft (AB), filled with **diagonal hatching** (a cached 16 px pattern, 45° lines 1 px `--blast-hatch`). It is **truncated at the raised JBD**: when `eq.jbd[cat] > 0.5` and the JBD line is within the cone, clip to the jet side of the JBD line. This shows, by line, *why the JBD exists*. A 1 px `--blast-hatch` outline goes around the cone. | deck fx, under vehicles and jets | z ≥ 0.6 |
| 4 | **JBD raised: shadow, heat lines and spray** | `eq.jbd[i] > 0.05` | The raised panel is drawn as a thick bar (the panel polygon scaled to 40% of its depth at the hinge side) in `--deck-2`, with an aft shadow of 10.7 ft·cos50° ≈ 7 ft in `--shadow-ship`. When the jet on that cat has power ≥ 1, there are **heat lines**: 4 sine hairlines (`--heat`, 0.8 px, amplitude 1.2 ft, wavelength 6 ft) rising from the JBD's top edge and drifting aft with phase `t·3`. At power 2 there is also a **cooling-water steam** fringe: 2 steam puffs at each JBD end, every 1.2 s (`t` mod), alpha 0.35. | deck fx (lines), steam layer (puffs) | z ≥ 0.6 |
| 5 | **Touchdown tyre smoke** | `touchdowns[]`: the first `trap` or `bolter` keyframe | 3 puffs (main gear at ±5 ft lateral, nose 17 ft ahead), born at T, T and T+0.15, each `--tyre-smoke`, radius 2 → 12 ft over 2.5 s, alpha 0.6 → 0. **Fixed in the deck frame** (they drift aft at 8 ft/s) while the jet decelerates away. That separation is the cue. | steam layer | z ≥ 0.3 |
| 6 | **Skid marks (cumulative)** | each touchdown with T < t | Two parallel streaks 30 ft long, 1.2 ft wide, from the touchdown point forward along the 9° angle, in `--skid`. At most 24 drawn; a deterministic hash adds ±4 ft lateral scatter. The deck accumulates the recovery's history. Pre-seed 30 "old" marks around (230-290, -30 to -10) at half alpha so the deck looks worked even at t = 0. | right after deck markings | z ≥ 0.5 |
| 7 | **Wire run-out as a V** | `eq.wire[n] > 0.01` and a jet in `trap` | Replace the quadratic bow with two straight segments from the sheaves `w.a`, `w.b` to the **hook point**: the trapping jet's position minus its heading × (length/2 - 2). The engaged pendant is drawn 1.4 px `--mark-white`. Small "payout" ticks at both sheaves: 3 short dashes stepping outboard. When no jet is engaged (retract), fall back to the existing curve. | deck (equipment) | always |
| 8 | **Shadows on the sea** (A.5) | groove, shot, bolter, waveoff | as A.5 | aircraft shadow pass | all |
| 9 | **Hook-skip sparks** | the `bolter` touchdown | 5 hairlines, 6-14 ft, from the hook point fanning aft ±25°, `--spark`, 1 px, lasting 0.5 s of `t` | steam layer | z ≥ 0.8 |
| 10 | **Wave-off lights** | status `waveoff`, or the LSO's `wave-off` action | The IFLOLS marker gets a 6 ft `--status-red` ring flashing at 1.8 Hz (`floor(t·3.6) % 2`). It stays on when reduced motion is on. | deck (lens) | z ≥ 0.5 |
| 11 | **Catapult speed lines** | status `shot` | 3 hairlines trailing the jet, length `40·u_stroke` ft, `--mark-white` at 0.4. This is the technical-drawing convention for motion, not a blur. | over the jet | z ≥ 0.5 |
| 12 | **Low-pass water ruffle** | 0-2 s after a launched jet passes the bow (x > 1092) | 3 concentric arcs on the sea below the jet (`--waterline`), radius 10 → 60 ft, fading. Downwash on the water as the jet settles off the bow. | sea (after the wake) | z ≥ 0.4 |
| 13 | **Island antennas and beacon** | always (A.4) | rotating SPS-48/49 bars; the beacon follows `eq.deck` | island | z ≥ 1.2 |

### Rejected, and why
- **A photographic or AI-generated ocean texture** (e.g. `test-ocean-low.png`). It fights the
  schematic, drops jersey-dot contrast, tiles visibly when it scrolls at 27 kt, and needs mipmapping by hand.
  The engraved strokes do the same job and *explain* the sea.
- **`shadowBlur` glows and bloom** on burners and the sweep. Too expensive per frame with 33 jets, and
  they muddy the line work. Gradients and sprites only.
- **Screen shake on a cat shot or a trap.** It destroys readability and is unfriendly to vestibular users.
- **Particle systems** with hundreds of stateful particles. They are not scrub-safe. Every puff here is a
  closed-form function of `t`.
- **Clouds or cloud shadows.** They hide the deck, and nothing in the sim motivates them.
- **A plane-guard helicopter, escort ships or birds.** They are not in the timeline, and inventing actors
  breaks the "everything shown is in the plan" contract.
- **A green-phosphor CRT look** (scanlines, neon). A cliché that would clash with the editorial chrome. The
  scope uses the same restrained ink logic, inverted.
- **Day/night or sunset grading.** That is a separate feature (night ops, §7.1), not this branch.
- **Non-skid or pad-eye textures.** Research §9.1 says one flat tone.
- **Real-wind steam drift (45 ft/s).** Physically fair, but it smears steam across the waist in about
  6 s. 18 ft/s keeps the ribbon on its own track long enough to read.

---

## D. Architecture

### D.1 New modules (`src/render/`)

```ts
// bands.ts: zoom bands, one source of truth (also owns the shared reduced-motion MediaQueryList)
export interface Bands { crew: number; inset: number; traffic: number; scope: number }
export const ZOOM_BANDS: { crew: [number, number]; inset: [number, number]; traffic: [number, number]; scope: [number, number] }
export function bands(z: number): Bands
export function reducedMotion(): boolean

// world.ts: world-space transform helper (Path2D in feet)
export function withWorld(ctx: CanvasRenderingContext2D, cam: Camera, dpr: number, draw: () => void): void
// sets ctx.setTransform(dpr*z, 0, 0, dpr*z, dpr*(w/2 - cx*z), dpr*(h/2 - cy*z)), runs draw, restores

// sea.ts
export const V_SHIP_FTPS = 45.6
export function seaDriftFt(t: number, reducedMotion: boolean): number
export function drawSea(ctx: CanvasRenderingContext2D, cam: Camera, t: number,
  o: { dpr: number; speed: number; reducedMotion: boolean; alpha: number }): void

// wake.ts
export function drawWake(ctx: CanvasRenderingContext2D, cam: Camera, t: number,
  o: { dpr: number; reducedMotion: boolean; far: boolean }): void
export function drawWaterlining(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, dpr: number): void

// shadow.ts
export const SUN: { ux: number; uy: number; k: number }
export function shadowOffset(heightFt: number): Vec2
export function aircraftHeightFt(s: AircraftState): number
export function drawShipShadow(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry): void
export function drawAircraftShadows(ctx: CanvasRenderingContext2D, cam: Camera,
  states: { a: AircraftEntity; s: AircraftState | null }[]): void

// fx.ts
export interface ShotFx { cat: number; t: number; heavy: boolean; aircraftId: string }
export interface TouchdownFx { t: number; x: number; y: number; heading: number; kind: 'trap' | 'bolter' }
export interface FxIndex { shots: ShotFx[]; touchdowns: TouchdownFx[]; oldSkids: Vec2[] }
export function buildFxIndex(tl: Timeline, g: DeckGeometry): FxIndex
export function drawSkids(ctx: CanvasRenderingContext2D, cam: Camera, fx: FxIndex, t: number): void
export function drawDeckFx(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, fx: FxIndex, t: number,
  eq: EquipmentKeyframe, states: { a: AircraftEntity; s: AircraftState | null }[]): void  // hatching, heat lines, JBD bar
export function drawSteamFx(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, fx: FxIndex, t: number,
  eq: EquipmentKeyframe, states: { a: AircraftEntity; s: AircraftState | null }[]): void  // steam, JBD spray, smoke, sparks, speed lines
export function drawBurner(ctx: CanvasRenderingContext2D, spec: SilhouetteSpec, s: AircraftState,
  z: number, nowMs: number, reducedMotion: boolean): void  // called from drawAircraft in the jet frame

// island.ts (split out of deck.ts)
export function drawIsland(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, eq: EquipmentKeyframe, nowMs: number): void

// scope.ts
export function radarAzimuth(nowMs: number, rpm?: number): number
export function drawScope(ctx: CanvasRenderingContext2D, cam: Camera, tl: Timeline, t: number, openness: number,
  o: { nowMs: number; reducedMotion: boolean; selected: string | null; eq: EquipmentKeyframe;
       onDeck: number; dpr: number }): { radiusPx: number }  // the radius drives the no-doubling rule
export function drawChartTraffic(ctx: CanvasRenderingContext2D, cam: Camera, tl: Timeline, t: number, alpha: number,
  exclude: { x: number; y: number; r: number } | null): void

// sprites.ts: cached offscreen sprites and tiles (lazy; rebuilt on resetTokens() or a DPR change)
export function puffSprite(): CanvasImageSource   // 64 px radial white
export function seaTile(ctx: CanvasRenderingContext2D, octave: 0 | 1 | 2): CanvasPattern
export function foamTile(ctx: CanvasRenderingContext2D): CanvasPattern
export function hatchPattern(ctx: CanvasRenderingContext2D): CanvasPattern
export function resetSprites(): void
```

### D.2 Changes to existing files

- **main.ts** frame order:
  ```
  B = bands(z); eq = sampleEquipment(...); states = ...
  drawSea                       // skipped when B.scope === 1
  drawWake(far = z < 0.06); drawWaterlining
  drawShipShadow
  drawDeck(eq, hooks)           // + catwalk grating, sponsons, elevator striping, foul dashes, ladders, hull number, wire V
  drawSkids
  drawDeckFx                    // hatching, heat lines, JBD bars
  drawIsland(eq, nowMs)         // island shadow, levels, radars, beacon
  vehicles
  drawAircraftShadows(states)
  aircraft (drawBurner inside)  // skipped when B.scope === 1
  drawSteamFx
  crew (alpha *= B.crew; loop skipped when B.crew === 0)
  control, deck labels
  if (B.traffic > 0) drawChartTraffic(excluding the iris disc)
  if (B.scope > 0) drawScope(...)
  drawPatternInset(..., fade = B.inset)
  toggle #app.scope
  ```
  `fxIndex = buildFxIndex(timeline, DECK)` once after `buildTimeline()`. Keep `dpr` in a module variable
  from `resize()`. One reduced-motion MediaQueryList is shared (moved from pattern.ts to `bands.ts`).
  The tap handler checks `insetBox()` first. Follow mode uses the pattern position while a jet is airborne.
- **camera.ts**: `minZoom = 0.012`. `CameraTween.to()` gets a default duration from the log-zoom ratio (B.5).
- **pattern.ts**: export the geometry constants (or move them to `data/pattern.ts`, shared with
  scope.ts). Add `opts.fade` and `insetBox()`. Draw the "Show whole pattern" footer.
- **aircraft.ts**: replace the inline power glow with `drawBurner`. Speed lines are drawn in fx.
- **deck.ts**: the wire V (gets the trapping jet's hook point as `hooks: (Vec2 | null)[]`, one per wire).
  Elevator striping, catwalk grating, sponsons, ladders, foul dashes and the hull number. The island moves
  to `island.ts`. The hull fill goes.
- **data/deck.ts**: `VIEWS` gains `pattern`. `island.levels`, `island.mast`, `island.radars`, `sponsons` and
  `hullNumber` are added, all tagged `[EST]`.
- **tokens.ts / styles.css**: the A.6 tokens, plus the `.scope` header rules.
- **ui/panel.ts**: the views list renders "Whole pattern" from VIEWS automatically. Check the key hint.

### D.3 Performance plan (budget ≤ 5 ms/frame of new work at 1440×900, DPR 2, mid laptop)

| Item | Cost strategy | Budget |
|---|---|---|
| Sea | ≤ 2 active pattern fills (`fillRect` viewport); tiles built once | 0.4 ms |
| Wake | 4 cached Path2D strokes under `withWorld`; 1 clipped pattern fill + 1 gradient fill | 0.6 ms |
| Waterlining | 3 cached Path2D, 2 strokes each | 0.2 ms |
| Shadows | ship: 1 fill. Aircraft: 33 Path2D fills reusing compiled silhouettes (arrow at z < 0.35) | 0.6 ms |
| Steam / smoke | ≤ 110 `drawImage(puffSprite)`; puffs outside the viewport culled by bbox | 0.5 ms |
| Hatching | ≤ 6 clipped pattern fills | 0.2 ms |
| Scope | ≤ 24 symbols × 6 trail dots, ≤ 24 text blocks; rings and ticks cached per (zoom, size) in an offscreen canvas, re-rendered only when the zoom changes by more than 2% or the camera pans | 1.0 ms |
| Crew | unchanged; skipped entirely at z < 0.12 | (existing) |

- Effects only search a window of their triggers: binary-search `shots` and `touchdowns` for
  `t-12 ≤ T ≤ t`.
- Wake and waterline Path2Ds are culled by a world bbox test against `cam.bounds()`.
- Add a dev hook `?perf=1` that draws the rolling frame time (ms, p95) in a corner, to verify the budget
  at t = 300 (two AB jets, steam) and t = 1000 (full scope).

---

## E. Image generation

**None. The direction is fully procedural.** Every texture is a seeded vector stroke tile that inherits
tokens: sea chop, swell, foam stipple, blast hatching and the steam sprite. That keeps it themable, crisp
at any zoom through the octave scheme, deterministic and tiny. A raster ocean would contradict the
chart idiom, and the test image already in `tools/out/visuals/test-ocean-low.png` shows why: it is
photographic, dark and busy, and it would swamp the jersey dots. Estimated spend: **$0 of $12**. No test
images were generated for this proposal, and `spend.log` is unchanged.

(If the orchestrator wants a fallback anyway: one *reference only* image, not shipped, at medium
1024×1024, $0.07, prompt: "Top-down Admiralty nautical chart engraving of open sea around a ship's wake,
fine parallel water-lining hairlines, Kelvin wake feathers, monochrome ink on pale grey-blue paper,
no land, no text". Use it to tune stroke density by eye.)

---

## F. Acceptance

Shots via `node tools/shot.mjs <out> t view w h zoom`. The `zoom` argument multiplies the view's fit zoom.
Outputs go to `tools/out/visuals/cart-*.png`.

1. **`cart-1-deck.png 330 deck 1440 900 1`**: the pale engraved sea. Vertical-ish hairline chop is visible but
   faint. Three waterlines hug the hull, with white/ink crest pairs at the bow. Kelvin feathers on both
   sides reach about 377 ft outboard at the stern. A white foam scar leaves the ramp and runs off the left
   edge. The ship shadow shows as a sliver along the starboard edge. The island shadow falls mostly off the
   starboard edge. The elevators have red/yellow perimeters. All about 190 crew dots are present and the
   jersey colours are unchanged.
2. **`cart-2-shot.png 301 bow 1440 900 1`**: on cat 1, a steam ribbon over the aft about 70% of the
   track, densest and largest aft, displaced aft of the slot. 211 is mid-stroke with twin AB plumes and
   speed lines. The JBD 1 bar is raised with its shadow and heat lines. Also check t = 304: 211 is off the
   bow over the sea with its shadow separated by at least 20 ft, and the steam is still visible but fading.
3. **`cart-3-burner.png 296 bow 1440 900 2.5`**: 211 in `salute`. Twin plumes with shock diamonds. A red
   hatched blast cone is **cut off at the raised JBD**. Heat lines and spray puffs are at the JBD. A crew
   dot standing near the cone is still drawn on top.
4. **`cart-4-trap.png 900.6 wires 1440 900 1.5`**: 203 just after touchdown. 3 smoke puffs are left behind
   the jet. The engaged wire is pulled into a **V** to the hook. Then **`1105 wires`**: 5 fresh skid marks
   (one per trap so far) lie in the touchdown zone, plus the faint pre-seeded ones.
5. **`cart-5-groove.png 1196 wires 1440 900 0.8`**: 304 in the groove behind the ramp over the wake. Its
   shadow is on the sea, offset about 60-80 ft toward starboard. At **1200.2** there are hook-skip
   sparks and AB plumes on the bolter. At **1282** (wave-off), the lens red ring is lit and the jet has
   twin plumes.
6. **`cart-6-sea.png 1000 deck 1440 900 0.12`**: the whole ship at sea. The wake is visible for more
   than 1 nm. Crew are not drawn. Airborne pattern jets in view are chart-style arrows with shadows and
   modex labels. The inset has faded. The iris is closed.
7. **`cart-7-iris.png 1000 deck 1440 900 0.05`**: a half-open iris. A dark scope disc around the ship
   with a labelled range-edge ring; the chart is outside. Each airborne jet is drawn **exactly once** (count
   the symbols against the readout "AIRBORNE n").
8. **`cart-8-scope.png 1000 pattern 1440 900 1`**: the full scope. Rings 1-5 nm, relative bearing ticks,
   "000R BRC" to the right. The racetrack and final-approach course carry their labels. 10 airborne,
   with the stack collapsed to one block and the rest as data blocks with **no overlapping blocks**.
   The ship symbol has its velocity leader. `ON DECK / AIRBORNE / DECK` readout. Header text is light.
   No inset. Also check **390×844** at `1000 pattern`: the scope fits above the bottom sheet, with
   one-line blocks.

Readability checks:
- With steam at its peak (t = 301, bow, zoom 2), sample the pixel colours of 5 crew dots near the
  steam. They must equal the jersey token hexes (R1: crew above fx).
- Saturation audit: in shots 1-3, the only pixels with HSL saturation above 50% are jersey dots, deck
  markings (yellow, red), burner, hatching and status lights.
- Scrub test: load `?t=301` directly and compare with playing from 295 to 301. Steam, smoke and the sea
  phase must match pixel-for-pixel, apart from the flicker and sweep (cosmetic).
- `prefers-reduced-motion` (Playwright `reducedMotion: 'reduce'`): two shots 1 s apart at the same `t` are
  identical. No sweep; the sea is frozen.
- Performance: `?perf=1&play=1` at t = 290 on the deck view at 4×, then the pattern view at 4×. p95 frame
  time is at most 16.7 ms (target ≤ 5 ms of new render work).
- `npm run typecheck` passes and the shot tool reports no page errors.
