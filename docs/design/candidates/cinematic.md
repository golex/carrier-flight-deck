# Candidate direction: "Cinematic" (documentary overhead)

The reference is deck footage shot from a helicopter hovering straight above the ship, as in Top Gun. The sea is
dark and moving, the carrier throws a long turquoise and white wake, the island throws a hard shadow, steam
drifts aft off the catapult slots, a burner lights against a raised JBD and the deck crew still read clearly as
dots of jersey colour. When you zoom out, the camera rises through a thin cloud layer and the picture becomes
the CATCC approach scope: the whole Case I pattern on a phosphor display.

The test is that it should feel alive and still be readable. Every rule below protects one thing: the jersey dots,
the jets and the deck markings always sit above any atmosphere, and nothing that moves on its own ever looks
like part of the choreography.

Frame reminders: world feet, x forward of the ramp (0..1092), y to starboard. Screen: bow points right, starboard
points down. The ship steams at **27 kt = 45.6 ft/s** (`SHIP_FPS`). The wind over the deck is **30 kt from dead
ahead = 50.6 ft/s toward -x** (`WOD_FPS`). Pattern frame: nm, origin at the ship's mid-length, so
`world = { x: 546 + xNm * 6076, y: yNm * 6076 }`.

Timing rule: everything that represents the world (water flow, wake texture, steam, smoke, shadows, cloud drift,
radar trails) is a pure function of **sim time t** plus deterministic hashes, so scrubbing is exact and a paused
frame is a true still. Purely cosmetic motion (burner flicker, heat shimmer phase, radar sweep) uses wall-clock
time and is switched off under `prefers-reduced-motion`.

---

## A. Ocean and ship

### A.1 Light: one sun for everything

- `src/render/lighting.ts` defines one sun: azimuth such that shadows fall **down-left on screen**, toward
  starboard and slightly aft, unit vector `SHADOW_DIR = { x: -0.35, y: 0.937 }`, elevation 50 deg, so
  `shadowOffset(h) = SHADOW_DIR * h / tan(50 deg) = SHADOW_DIR * 0.839 * h` (ft).
- Shadows fall toward starboard so they never cover the angled deck, the landing area or the port-side LSO, which
  is where the choreography is densest. Toward starboard they land on the sea beside the island and the elevators.
- Heights (ft above the surface the shadow falls on): flight deck above the water 60; island roof above the deck
  95; mast top above the deck 150; jet on deck 8 (fuselage above the non-skid); raised JBD 10.7; tractor 4.
  Airborne jets use their altitude (see B and C).

### A.2 Sea, by zoom band

The sea is drawn once per frame as full-screen pattern fills. There are no per-pixel loops.

| Band | Zoom (px/ft) | Sea treatment |
|---|---|---|
| Close | z >= 0.35 | Texture layer A: the generated ocean tile mapped to **480 ft** of world. Layer B: the same tile mapped to **1,700 ft**, `globalAlpha 0.35`, `globalCompositeOperation 'soft-light'`, and offset by half a tile so the two never line up. |
| Far | 0.08 <= z < 0.35 | Layer A crossfades out between z 0.35 and 0.2 (log-space smoothstep), so a 480 ft tile never becomes a visible repeating grid. Layer B carries the sea alone, plus a large-scale **swell modulation**: a 256x256 offscreen value-noise canvas (built once) mapped to 9,000 ft, `alpha 0.18`, `'multiply'`. |
| Radar crossfade | 0.045 <= z < 0.08 | Sea as in Far, darkened by the radar background fading in on top (see B). |
| Radar | z < 0.045 | No sea is drawn at all (the scope is opaque). |

- Motion: the ship is fixed in the frame, so the water flows aft. Layer A is offset by `-(SHIP_FPS + 6) * t` ft in
  x (wind waves run downwind, so slightly faster than the hull); layer B by `-(SHIP_FPS + 2) * t`; the swell by
  `-(SHIP_FPS - 4) * t` and `+3 * t` in y (a cross swell). The offsets are applied through
  `CanvasPattern.setTransform(new DOMMatrix().translate(...).scale(...))`, taken modulo the tile size to avoid
  float drift. Because the motion depends only on t, a paused frame is still and scrubbing is exact.
- Base colour under the textures is `--sea` and the swell tints toward `--sea-deep`, so a texture that fails to
  load still leaves a correct flat sea (the page renders before the images arrive).
- Reduced motion: the offsets still follow t, since that is simulation state, not decoration. Nothing in the sea
  moves while the clock is paused.

### A.3 Stern wake (the money shot)

A Nimitz-class carrier leaves a wake several nautical miles long. Close to the stern it is a churned white band
about the width of the waterline beam. Behind that comes a long turquoise band of aerated water, then a pale
slick that fades over 3-4 nm.

Geometry, in ship-frame feet with d = feet aft of the transom (the transom is at x = 26, the waterline hull's aft
end):

- Centreline: y = 0 (the ship is on the BRC, so the wake is straight).
- **Foam band** half-width `wF(d) = 52 + 0.012 d + 14 * n1((d + SHIP_FPS * t) / 180)`, where `n1` is a 1-D value
  noise in [-1, 1]. Note the sign: water features are fixed in the water and move aft in the ship frame, so a
  feature's ship-frame position is d0 + V t, and the noise is sampled at `d + V t`. The band is drawn to
  **d = 2,400 ft**.
- **Aerated band** (turquoise): half-width `wA(d) = 70 + 0.018 d`, drawn to **d = 12,000 ft** (about 2 nm).
- **Slick**: half-width `wS(d) = 90 + 0.022 d`, drawn to **d = 24,000 ft** (about 4 nm), which reaches past the
  initial at 3 nm, so on the pattern view the wake points straight at the jets on the initial.
- Opacity along d:
  - foam: `0.92 * exp(-d / 650) + 0.20 * exp(-d / 2,800)`
  - aerated: `0.55 * exp(-d / 3,500)`
  - slick: `0.10 * exp(-d / 9,000)`
- Two **propeller lobes** close to the stern: for d < 400, two bright foam ellipses centred at y = +/-28, rx 160,
  ry 26, alpha 0.6, drawn with the foam texture. They show the four screws churning, and they read as boiling
  water directly under the ramp, where every groove ends.
- Rendering: one offscreen **wake layer**, sized to the viewport at **0.5x** device resolution and rebuilt each
  frame:
  1. Fill the slick polygon with `--wake-slick`.
  2. Fill the aerated polygon with `--wake-aerated`.
  3. Clip to the foam polygon and fill it with the **foam texture** as a pattern (mapped to 900 x 600 ft,
     offset `-(SHIP_FPS + 9) * t` in x, because the prop wash runs aft faster than the ambient water) using
     `'screen'`.
  4. Apply the d-falloff with `'destination-in'` and a linear gradient along x built from the three curves above
     (12 stops).

  The layer is then composited onto the main canvas with `drawImage`, after the sea and before the ship shadow.
  Polygons have 48 samples per edge, spaced geometrically in d, so they are dense near the stern.
- In the radar band the wake survives as one dim phosphor streak (see B.4).

### A.4 Bow wave and Kelvin pattern

At 27 kt the Froude number on 1,040 ft is about 0.25, so the classical Kelvin pattern applies: the cusp lines lie
at +/-19.47 deg and the transverse wavelength is `2 pi V^2 / g = 395 ft`. That pattern is **stationary in the ship
frame**, so it does not flow. Only its texture does.

- **Bow moustache**: two foam crescents from the waterline stem at (1066, 0), one per side, hugging the hull line
  outward and aft to x = 760. The outer edge is `y = +/-(67 * (1066 - x) / 226 + 10 + 0.06 (1066 - x))` until
  the hull reaches full beam, then it flares away at 19.47 deg. The width tapers from 28 ft to 6 ft, the alpha
  from 0.85 to 0.15, and the band is filled with the foam texture flowing at `SHIP_FPS`. Because it is drawn
  **before the deck**, the overhanging flight deck hides most of it. That is correct: the moustache appears from
  under the bow and the starboard sponson, exactly as in overhead photos.
- **Kelvin arms**: from (1066, 0), lines `y = +/-0.3536 * (1066 - x)`, drawn as **feathered divergent crests**:
  short white strokes 110 ft long at 35 deg to the course, one every 140 ft along each arm, alpha
  `0.22 * exp(-dist / 3,000)`, width `max(1, 2.5 z)` px. A second, fainter set starts from the stern shoulder
  (26, +/-46). The strokes do not move. Their positions are fixed in the ship frame.
- **Transverse crests**: arcs between the arms every 395 ft aft of the bow, alpha 0.05, only for z < 0.6, where
  they read as a pattern rather than lines.

### A.5 The ship itself: what changes in deck.ts

From directly overhead the waterline hull is fully hidden by the flight deck (§1.2: the hull is 134 ft wide, the
deck reaches -142 to +120). The ship therefore reads through its **shadow, edge detail and height cues**, not a
visible hull side.

1. **Ship shadow on the sea** (new, before the deck): the deck `outline` polygon translated by
   `shadowOffset(60)` = (-17.6, +47.2) ft, filled `--shadow-sea`. Where it peeks out beyond the starboard edge it
   gives a 47 ft dark band, the cue that the deck stands six stories above the water. Under the port angled deck
   it is hidden, which is correct.
2. **Island shadow** (replaces today's fixed 3 px offset): sweep the island polygon from height 0 to 150 ft. In
   practice that is the union of the polygon at offsets `shadowOffset(h)` for h = 0, 30, 60, 95, plus the mast
   footprint (a 14 x 14 ft square at (412, 92)) out to h = 150, filled once as one path with the `'nonzero'` rule.
   The part on the deck uses `--shadow-deck`. The part beyond the deck edge falls on the water and is drawn in the
   sea shadow pass, with the polygon set offset by an extra `shadowOffset(60)`. The shadow falls across the E2/E3
   junkyard and out to sea. It is visible at every zoom and gives the island height immediately.
3. **Catwalks** become a two-tone rim: the outer 12 ft stays `--deck-edge`, and from z >= 1.5 a grating hatch is
   added (1 px lines every 2 ft at 45 deg, `--catwalk-grate`, alpha 0.5), drawn as a `CanvasPattern` clipped to
   the rim (outline stroked at 24 ft, minus the deck fill).
4. **Sponsons and deck-edge mounts** [EST, decorative only, new `src/data/shipDetail.ts`]: small grey blocks with
   their own shadows outboard of the catwalk. CIWS (circle 10 ft) at (40, 92), (1030, -58) and (770, -150); RAM
   (12 x 8 ft rect) at (60, -78) and (860, 72); Sea Sparrow (16 x 12 ft) at (20, -58) and (880, -64). Fill
   `--island-2`, shadow `shadowOffset(10)`. Visible at z >= 0.6.
5. **Island detail**: three stacked tone levels instead of one block. The base polygon is `--island-2`. An inset
   superstructure (the polygon shrunk by 8 ft) is `--island-top`. The Pri-Fly glass band is a 3 ft strip on the
   aft-port face in `--glass`. The mast is a 14 ft square with two radar slabs: SPS-48 as a 16 x 4 ft slab and
   SPS-49 as a thin 24 ft bar. The SPS-48 rotates with `t` (12 rpm, sim time). At z >= 2, a 1 px highlight on the
   sun-facing (top-left) edges and a darker stroke on the shaded edges give the "lit block" look of overhead
   photography.
6. **Island beacon**: a 4 ft glowing dot at (360, 100) in the eq.deck colour: `--light-green`, `--light-red`, or a
   flashing red/amber for `foul` (2 Hz on sim t). Drawn with the glow sprite and `'lighter'`, visible at
   z >= 0.5. It is one of the few saturated non-jersey marks, and it carries state.
7. **Elevators**: a perimeter hazard stripe (`--mark-yellow` alpha 0.55, dash 4/4 ft, 1.5 ft wide) from
   z >= 1.2. The fill stays `--deck-2` with a 1 px shadow line on the outboard edge (the elevator is a separate
   plate).
8. **Deck surface "grime plate"** (new, cached): an offscreen canvas at **2 px/ft** (2,184 x 540 px, built once at
   startup, procedural and deterministic):
   - LA tyre-mark streaks: 220 thin dark strokes along the landing centreline, s 150-420, alpha 0.035 each,
     lengths 30-160 ft, lateral sigma 9 ft.
   - Hook scuffs across the wire band.
   - Soot fans **forward** of each JBD hinge (the blast footprint on the panels) and a darker smear just aft of
     each battery position.
   - Oil spots under the parking slots (`DECK.slots`, 2-3 per slot, 2-4 ft, alpha 0.08).
   - A faint lighter non-skid wear path along the bow taxi routes.

   It is drawn after the deck fill and before the markings with `drawImage` (smoothing on), alpha 1 (the plate is
   pre-multiplied), and it is the only deck texture. Markings stay crisp vector on top. The padeye grid (research
   §9.1) is a 10 ft dot `CanvasPattern` at alpha 0.12 for z >= 2.5.
9. **Jets**: switch to the research's ghost grey (§9.1 `--aircraft`) and give each jet a ground shadow. A light
   jet over a dark deck reads like the real thing, and the shadow lifts it off the deck. The shadow is the same
   Path2D parts drawn at `shadowOffset(8)` in `--shadow-deck`, before any jet (one pass for all jets). Token
   changes are in A.6.

### A.6 How the ship reads at far zoom (0.08-0.35)

The deck stays vector, but markings below 0.75 device px are dropped. The island shadow, beacon, wake and bow
moustache carry the read. Crew dots fade out between z 0.18 and 0.12 (`alpha = smoothstep(0.12, 0.18, z)`),
because 190 dots on a 130 px deck are noise. Jets keep the arrow glyph with a **9 px length floor** and a 0.6 px
`--deck-edge` outline so they separate from the deck.

### A.7 Token additions and changes (src/styles.css :root, mirrored in tokens.ts)

```
/* sea */
--sea:            #1b2a38;   /* changed from #cfd6d8: deep navy-grey, under the texture */
--sea-2:          #223444;   /* changed: lighter sea for UI references */
--sea-deep:       #0f1a24;   /* swell troughs */
--shadow-sea:     rgba(4, 10, 16, 0.55);
--shadow-deck:    rgba(10, 12, 14, 0.42);
--wake-foam:      #f2f6f7;
--wake-aerated:   rgba(74, 168, 170, 0.55);  /* turquoise of aerated water */
--wake-slick:     rgba(150, 190, 200, 0.10);
/* ship */
--catwalk-grate:  #3a3d42;
--island-top:     #7a7e85;
--glass:          #31424f;
/* aircraft (research §9.1) */
--jet:            #a3a9ae;   /* changed from #2a2d31: ghost grey */
--jet-2:          #6e747a;   /* changed: dimmed jets while a jersey is highlighted */
--jet-fin:        #858b92;   /* changed */
--jet-pod:        #8d939a;   /* changed */
--canopy:         #2b3944;   /* changed: dark glass on a light jet */
--jet-outline:    rgba(20, 22, 25, 0.55);    /* new: 0.6 px edge so a light jet reads on white steam */
/* fire and light: the only other saturated colours; always transient, always light-emitting */
--burner-core:    #fff3d6;
--burner:         #ffb14a;   /* unchanged */
--burner-tail:    rgba(255, 106, 42, 0);
--burner-glow:    rgba(255, 196, 120, 0.35);
--light-green:    #39d353;
--light-red:      #ff3b30;
--light-amber:    #ffb000;
--spark:          #ffd27a;
/* atmosphere */
--steam:          rgba(240, 244, 246, 0.55);  /* changed tint, same alpha */
--smoke:          rgba(70, 72, 76, 0.45);     /* tyre smoke, burnt rubber */
--cloud:          rgba(244, 246, 248, 0.9);
--cloud-shadow:   rgba(6, 12, 18, 0.16);
--vignette:       rgba(2, 6, 10, 0.38);
/* radar */
--scope-bg:       #03110c;
--scope-bg-2:     #010806;
--scope-grid:     #12402e;
--scope-ink:      #6dffb8;   /* phosphor primary */
--scope-ink-2:    #3aa877;   /* phosphor dim / labels */
--scope-ink-3:    #1f6a49;   /* rings, nominal legs */
--scope-amber:    #ffb000;   /* bolter / wave-off / foul */
```

The header (`.hdr`) now sits over a dark sea, so its text switches to `--paper` / `--line` through a new
`.on-dark` class on `#app`. That class is always on in this direction. Panels, the transport bar and the intro
card keep their light paper style. They are opaque cards, and the contrast between the cards and the dark sea is
part of the editorial look.

### A.8 Layering (world, bottom to top)

1. sea A/B and swell
2. cloud shadows (z < 0.6 only, see C)
3. wake layer
4. bow moustache and Kelvin crests
5. ship shadow on the sea, island shadow on the sea
6. airborne-jet shadows on the sea
7. sponson mounts
8. deck fill, grime plate, markings, catwalk grating
9. island shadow on the deck
10. elevators and island (lit), beacon

---

## B. Zoom-out and radar

### B.1 Camera

- `minZoom = 0.006` (a 390 px phone can fit the 6.4 nm pattern view). `maxZoom` stays 14.
- **Pan clamp** (new `Camera.clampCentre()`): the centre is kept within the box x -40,000..42,000 ft and
  y -30,000..20,000 ft, so you cannot get lost at sea. It is called after `panBy` and `zoomAt`, and in the tween.
- Wheel zoom already works in log space, so the extra range needs no input changes. `dblclick` zoom stays 1.8x.

### B.2 Zoom bands (one function, `src/render/bands.ts`)

`s(a, b, z)` is a smoothstep on **log z** between a and b (it returns 0 at a and 1 at b, with a < b allowed or
reversed).

| Quantity | Formula | Meaning |
|---|---|---|
| `crew` | `s(0.12, 0.18, z)` | crew dots, signals and control cones |
| `deckFine` | `s(0.30, 0.45, z)` | silhouettes vs arrows, cat dashes, deck labels |
| `seaClose` | `s(0.20, 0.35, z)` | sea layer A |
| `air` | 1 always (clipped to the view) | airborne jets in world space |
| `airLabels` | `1 - s(0.35, 0.6, z)` | modex and altitude tags on airborne jets (at deck zoom only the selected one) |
| `clouds` | `s(0.05, 0.08, z) * (1 - s(0.14, 0.22, z))` | cloud-layer transition, peaking around z 0.1 |
| `radar` | `1 - s(0.045, 0.08, z)` | the scope fades in |
| `inset` | `s(0.10, 0.14, z)` | the overhead-pattern inset fades out as the main view takes its job |

Crossfade widths: radar z 0.08 to 0.045 is a factor of 1.78 (0.25 decade, about 3 wheel notches). Crew 0.18 to
0.12 is a factor of 1.5.

### B.3 The middle band (0.045-0.35): "helicopter at altitude"

This band has no separate style. It is the cinematic world seen from higher up: the ship with its wake, airborne
jets in world space with shadows, and a light cloud layer near 0.1. Airborne jets (B.5) appear here first, so a
viewer can follow a jet from the cat stroke out to the clearing turn, and later from the break back to the groove,
without changing scale abruptly.

### B.4 The radar style (z < 0.045): the CATCC approach scope

At this zoom the whole picture is one opaque scope. If `radar === 1`, the world pass is skipped entirely, which
saves performance. During the crossfade the scope is drawn over the world with `globalAlpha = radar`.

- **Background**: `--scope-bg`, with a radial gradient to `--scope-bg-2` at the screen corners. Scanlines are a
  2 px period horizontal `CanvasPattern` (1 px at rgba(0,0,0,0.18)) at alpha 0.5. There is also a faint 0.6 px
  pixel grid, the cached scope frame.
- **Range rings**: centred on the ship's mid-length (546, 0), every **1 nm** to 8 nm, `--scope-ink-3` 1 px. Every
  second ring is drawn as `[2, 4]` dashes. Labels `1`, `2`, ... `NM` sit at the 30 deg position, in 10 px mono
  `--scope-ink-2`.
- **Bearing ticks**: relative bearing ticks every 10 deg on the outermost visible ring (short 6 px, long 12 px
  every 30 deg). Spokes are drawn every 30 deg at alpha 0.25.
- **BRC line**: from the bow out to 8 nm ahead, dashed `[6, 6]`, `--scope-ink-3`, labelled `BRC` at 2 nm.
  **Final bearing**: from the ramp, 9 deg left of the BRC, aft to 4 nm, dotted, labelled `FINAL -9 deg` at 2.5 nm.
- **Nominal Case I legs**: the same geometry as the inset, moved to a shared module (D), drawn as `[1.5, 3]`
  dotted `--scope-ink-3`. Leg labels are 11 px mono `--scope-ink-2`, in caps: `INITIAL 800`, `BREAK`,
  `DOWNWIND 600`, `THE 90 450`, `GROOVE`, and `MARSHAL 2000` on the stack ring, which is drawn when any jet is in
  marshal. Labels use the inset's taken-box avoidance (B.6).
- **Own ship**: the true-scale `DECK.outline` polygon filled with `--scope-ink` at 0.55 and stroked 1 px at 0.9
  (29 px long at the pattern view). The ship has a px floor: below 14 px long, a 14 x 5 px rounded rect is drawn
  instead. A 24 px heading vector points ahead. The label `CVN` sits below it, with the **deck state lamp**: a
  6 px disc in `--light-green` / `--light-red` / flashing `--scope-amber` (foul), plus the word `GREEN DECK`,
  `RED DECK` or `FOUL DECK` (research §9.2: never colour alone).
- **Own-ship wake**: the slick polygon from A.3 stroked as a 0.3-alpha `--scope-ink-3` band to 4 nm. It reads as
  the ship's track history.
- **Sweep**: a `createConicGradient` wedge centred on the ship. The leading edge is `--scope-ink` at alpha 0.20,
  fading to 0 over 50 deg, with a 4 s period (SPN-43 class, 15 rpm), on wall-clock time. It is cosmetic.
  Returns do **not** depend on the sweep for their visibility: each blip is drawn at full intensity, plus a
  +35 % flare for 0.6 s after the sweep passes it. The scope is never unreadable, even mid-rotation. Under
  reduced motion: no sweep and no flare.
- **Aircraft returns**:
  - **Blip**: a 5 px disc in `--scope-ink` with a 14 px pre-rendered glow sprite (`'lighter'`).
  - **Heading vector**: 12 px, from the track direction (`sample(t)` minus `sample(t - 1)`).
  - **Afterglow trail**: 6 dots at `t - 3k` s (k = 1..6), radius 2 px, alpha `0.55 * 0.72^k`. These are sampled
    from the pattern track, so the trail is deterministic and scrubs exactly.
  - Departures use `--scope-ink-2`. A **bolter or wave-off** turns blip and data block `--scope-amber` for the
    whole bolter leg. Jets still on deck are not plotted. The deck lamp and one count, `ON DECK 9`, stand in for
    them.
- **Data blocks** (ATC style): a 16 px leader line at one of 8 candidate angles (preferred NE, then E, SE, NW, W,
  SW, N, S), the first that clears all taken boxes. Line 1: modex, 12 px mono `--scope-ink`, bold. Line 2:
  `ALT/10` and the leg in caps, e.g. `060 DNWD`, `008 INIT`, `045 90`, `037 GRV`, 10 px `--scope-ink-2`.
  Leg abbreviations: MRSH, INIT, BRK, DNWD, 180, 90, GRV, DEP, BOLT. Ground speed is not shown, because the
  planner does not model it.
- **Marshal crowding**: with more than 6 jets in marshal, the stack collapses to one ring with the label
  `x7 MARSHAL 2000-4000` (the inset's rule).
- **Caption**: top-left under the header: `CATCC  ·  CASE I  ·  10 AIRBORNE  ·  ON DECK 9`, 11 px mono
  `--scope-ink-2`, so the mode change is announced in words.

### B.5 Airborne jets in the main view (all non-radar bands)

New `src/render/airborne.ts` turns `timeline.pattern` into world-space states:
`{ id, modex, x, y, heading, alt, leg }`.

- `x = 546 + p.x * 6076`, `y = p.y * 6076`.
- Heading from the track tangent.
- Suppressed while `sampleAircraft(id, t).visible` is true (the deck renderer owns the jet then: the last 6 s of
  the groove, the stroke and the clearing turn). No jet is ever drawn twice.
- Drawn as the silhouette at true scale, with a px floor of 12 px length, in `--jet`. The **ground shadow** sits
  at `shadowOffset(alt)`: a jet on the downwind at 600 ft has its shadow 503 ft away. That makes altitude
  readable at a glance. The shadow converges on the jet through the groove and meets it at touchdown, and
  separates after the shot.
- Shadow alpha: `0.42 * clamp(1 - alt / 2,500, 0.25, 1)`.
- Over the deck the shadow falls on the deck, because airborne shadows are drawn after the deck (A.8 step 6 is
  re-run for any part over the deck, using the same `--shadow-deck`).
- Label when `airLabels > 0`: modex plus `600 ft` in mono with the existing dark halo.

### B.6 The overhead-pattern inset

- It fades out as the main view takes over (`inset` band, 0.10 to 0.14), using its own alpha machinery. A new
  `opts.zoomFade` multiplies its target.
- It becomes a **button**: click or tap on it calls `goView('pattern')`. Hover outline is `--focus`. The title gets
  a small `↗` affordance. Hit-testing reuses `layout()`, exported as `patternInsetRect(cam, panelOpen)`.
- The Case I geometry constants and the racetrack path move to `src/render/patternGeom.ts`, so the inset and the
  scope draw the identical pattern.

### B.7 New view preset (data/deck.ts VIEWS)

```ts
{ id: 'pattern', name: 'Overhead pattern', key: '6',
  minX: 546 - 3.4 * 6076, minY: -3.1 * 6076, maxX: 546 + 3.0 * 6076, maxY: 0.9 * 6076 }
// = minX -20112, minY -18836, maxX 18774, maxY 5468
```

At 1440x900 with the panel open, `fit` gives z = 0.0267 (radar band: the scope fills the frame and the ship is
29 px). On a phone it gives about 0.0088. The views tween in log space already, so pressing `6` from the deck is
one continuous 0.7 s move through the helicopter and cloud bands into the scope. That move is the "wow"
transition. Make it **1.4 s** for this preset only (`goView` passes a per-view duration).

Also widen two existing presets so the new sea effects appear without zooming:

- `deck`: minX -20 becomes **-90**, showing the boiling wake under the ramp. The zoom drops about 6 % (0.92 to
  0.87).
- `bow`: maxX 1100 becomes **1160**, showing the moustache.

### B.8 UI chrome

- `.on-dark` header text (A.7). In the radar band the subtitle under the title is replaced by the caption (B.4) via
  `ui.setMode('scope' | 'world')` from main.ts when `radar` crosses 0.5.
- The panel's views list gains "Overhead pattern (6)".
- The jersey legend dims to 40 % opacity in the radar band (no crew are drawn) and stays interactive.
- The transport bar is unchanged.

---

## C. Flair (prioritised)

**Readability rules** (every effect must obey all four):

- **R1**: Crew dots, signal glyphs, control cones, modex labels and deck labels are always drawn after every
  effect. Nothing ever paints over a person.
- **R2**: No effect exceeds alpha 0.6 over the landing-area centreline, a catapult track or a foul line, except
  for at most 2.5 s.
- **R3**: Every effect is triggered by simulation state and explains that state. No effect fires for nothing.
- **R4**: Saturated non-jersey colour only for things that emit light: burners, sparks and lamps.

Shared mechanism: `src/render/fx/index.ts` builds an **FX index** once from the timeline:

- Per cat, the shot times: equipment keyframes where the shuttle goes from at most 0.02 to 1. These equal
  `T_FIRST_SHOT + shotOffset`, but are derived from data.
- The live window per cat: from the first `jbd > 0` to the last shot + 30 s.
- Touchdowns: `events` of kind `trap`, plus each trap aircraft's `status === 'trap'` first keyframe for the
  engagement point.
- Bolter and wave-off times and modex.
- Wire engage/release times from `eq.wire` rising and falling edges.
- LSO wave-off windows: crew with `role === 'lso'` and `action === 'wave-off'`.

Particles are **stateless**. A puff k of emitter E has birth time `tb = E.t0 + k * period + jitter(hash(E, k))`.
At time t, only the k with `0 <= t - tb < life` are enumerated, with position, size and alpha computed in closed
form from `age = t - tb`. Scrubbing backward is therefore exact. Each puff is one `drawImage` of a sprite from the
steam sheet (cell = `hash % 16`, rotation = `hash * 2 pi`) with `globalAlpha`.

| # | Effect | Trigger | Geometry and motion | Duration | Layer | Zoom |
|---|---|---|---|---|---|---|
| P1 | **Catapult stroke steam** | shot time S per cat | 40 emitters, one every 8 ft along the 310 ft stroke. Emitter i fires when the shuttle passes it: `tb = S + 2 * sqrt(i / 40)` (ease-in stroke). Each puff starts at r 5 ft, grows to `5 + 22 * sqrt(age)` ft, drifts at **-0.55 WOD** = 28 ft/s in x, plus a +/-6 ft/s lateral hash. Alpha `0.55 * (1 - age / life)^1.5`. Life 5-8 s (hash). | about 10 s per shot | **over jets, under crew** | z >= 0.3. Below 0.3, one combined smear sprite per cat. |
| P2 | **Water-brake burst** | S + 2 | 10 puffs at the stroke end, radial burst at 30 ft/s, then the WOD drift. Alpha 0.6. The jet has left the deck by then, so it hides nothing. | 4 s | over jets | z >= 0.3 |
| P3 | **Ambient slot wisps** (the "breathing" deck) | cat live window | 1 puff per 0.7 s per cat at a hashed u along the track. r 3 to 10 ft, alpha 0.18, drift 0.4 WOD. This is the always-on "this deck is live" cue. | continuous | under jets | z >= 0.6 |
| P4 | **Afterburner plume** | `s.power === 2` (heavy launches, bolter, wave-off) | Twin cores from the two nozzles (y = +/-1.6 ft in the jet frame), each a tapered teardrop 26 ft long: `--burner-core` → `--burner` → `--burner-tail`, with `'lighter'`. At z >= 3, 4 shock diamonds (ellipses 2 x 1.2 ft at 3.5 ft spacing, alpha 0.7). Flicker: length times `1 + 0.08 sin(wall * 31 + id)`, off under reduced motion. Outer glow: the glow sprite 40 ft, alpha 0.35. | while power 2 | **over the jet's own tail, under crew** | z >= 0.4 (below: a 3 px dot) |
| P5 | **Military-power glow** | `s.power === 1` | Today's short gradient (9 ft) kept, re-tinted `--burner-glow`. No flame. | while power 1 | under jet | z >= 0.6 |
| P6 | **Heat shimmer** | power >= 1 on deck, or a raised JBD with a powered jet within 60 ft ahead of it | A screen-space displacement: the region from the nozzles to the JBD (or 70 ft aft) is redrawn from the canvas itself in 3 px wide strips **perpendicular to the jet axis**, the axis rounded to screen-horizontal or vertical. Each strip is offset along the axis normal by `A sin(0.9 strip - wall * 9)`, A = `min(1.6, 0.25 z)` px. Implementation: `ctx.drawImage(canvas, sx*dpr, sy*dpr, w*dpr, h*dpr, dx, dy, w, h)` per strip, with the source and destination region clipped to a cone path. At most 4 jets and 30 strips each. | while active | **after jets, before burners and crew** (no person is ever distorted) | z >= 0.8. Off under reduced motion. |
| P7 | **JBD blast** | `eq.jbd[i] > 0.5` and its cat's jet at power >= 1 | The raised panel is drawn lit (`--island-top`) with a `shadowOffset(10.7)` shadow. Exhaust deflected upward: steam sheet puffs spawning on the panel's forward face at 4 per s, r 6 to 24 ft, `--smoke` tint at alpha 0.22, drifting 0.7 WOD aft (over the panel and toward the next jet in line). This is the visible "wall" between queue and cat. | while active | under jets (the jet behind the JBD sits in the haze) | z >= 0.5 |
| P8 | **JBD cooling steam** | jbd lowered after a shot (falls below 0.5 within S..S+5) | 12 puffs over 12 s rising off the panel, alpha 0.3. It shows the 10-20 s cooldown of research §1.7 step 10. | 12 s | under jets | z >= 0.6 |
| P9 | **Touchdown tyre smoke** | each trap and bolter touchdown T | 2 puffs at the main gear (laPoint(230, +/-5)) at T, `--smoke`, r 2 to 14 ft, drift -WOD. One more at the nose gear 0.4 s later. | 2.5 s | over jets | z >= 0.6 |
| P10 | **Wire run-out** | `eq.wire[n]` rising | The bowed wire gets a 2x wider bright `--mark-white` core while running. After release (the falling edge), a damped standing wave: midpoint offset `14 ft * e^{-age/1.2} * sin(age * 9)`, deterministic from t. The deck-edge sheaves (the wire ends) get a 0.5 s white flash. | about 4 s | deck layer | z >= 0.5 |
| P11 | **Hook-skip sparks** (bolter only) | bolter T | 14 short streaks along the LA centreline from s 230 to 330, each 3-8 ft, `--spark` with `'lighter'`, lifetime 0.35 s staggered over 0.6 s. | 0.6 s | over jets | z >= 1.0 |
| P12 | **Wave-off lights** | LSO wave-off window | IFLOLS at (385, -132): 2 red glow sprites flashing at 3 Hz (sim t), r 10 ft, plus the waving-off jet's burner (P4). The LSO platform gets a pulsing red rim. | window | over deck, under crew | z >= 0.4 |
| P13 | **Deck beacon** | eq.deck | See A.5 item 6. | always | island | z >= 0.5 |
| P14 | **Cloud layer** | camera zoom | 18 world-space cumulus puffs (each 4 steam-sheet sprites scaled to 1,500-4,000 ft) at hashed positions within +/-5 nm, drifting at the true wind relative to the ship, `-(WOD_FPS - SHIP_FPS)` = -5 ft/s in x. Alpha `0.32 * clouds`. Their **shadows** are drawn on the sea at z < 0.6 with `--cloud-shadow` (a darker sea patch slides under the ship: cinematic, harmless). | always (alpha from the band) | clouds: above everything world-side **except airborne jets and labels**. Shadows: at sea level. | 0.05 < z < 0.22 |
| P15 | **Vignette** | always | Pre-rendered radial gradient to `--vignette` at the corners, rebuilt on resize. | always | top of world (under UI) | world bands |
| P16 | **Plane-guard helicopter** | launch and recovery phases | One MH-60S flying a starboard delta at 300 ft: a 300 x 150 ft racetrack centred at (600, +900), period 120 s on sim t. Rotor disc of 54 ft, `--jet-2` at 0.35, and a 120 ft rotor-downwash ring (concentric faint white rings, alpha 0.1) on the sea at its shadow point. Labelled `plane guard` when `airLabels > 0`. It is a real part of flight ops, it explains itself with its label, and it is never near the deck flow. | phases | airborne layer | z < 0.9 (never in the close deck views) |

### Rejected, and why

- **Film grain and noise per frame**: random per frame, so it breaks "a paused frame is a still" and costs a
  full-screen pass. The vignette gives the photographic feel instead.
- **Real-time blur (`ctx.filter = 'blur'`)** on steam or shadows: too slow at dpr 2 with 300 sprites. The soft
  edges come pre-baked in the steam sprites.
- **Sun glint or specular hotspot on the sea**: it reads as a UI glow and pulls the eye off the deck.
- **Full-deck steam fog after each shot** (what footage really shows on humid days): it breaks R2 for 5+ s on the
  bow cats while the next jet is being taxied in. P1 is capped at alpha 0.55 and fades with a 1.5 power.
- **Afterburner on every launch**: the planner only puts heavy jets in burner. Showing it on all of them would lie.
  Burner frequency is therefore exactly the data's.
- **Hook sparks on traps and night lighting**: in day footage sparks only show on skips. Night ops are a separate
  scenario.
- **Escort ships, other traffic and a horizon**: they add radar clutter and suggest data the sim does not have.
- **Camera shake on the shot**: it fights scrubbing and the follow camera, and it is motion-sickness bait.
- **WebGL water**: out of scope (Canvas 2D only).
- **Water flow scaled to playback speed** (to calm 16x): it would make the frame depend on playback rate, not just
  t. True flow is kept. At 16x the sea streams, which honestly says "fast-forward".

---

## D. Architecture

### D.1 New modules (src/render/)

```ts
// lighting.ts
export const SUN: { dir: Vec2; k: number }            // dir (-0.35, 0.937), k = 1 / tan(50 deg)
export function shadowOffset(heightFt: number): Vec2
export const SHIP_FPS = 45.6
export const WOD_FPS = 50.6
export function drawVignette(ctx: CanvasRenderingContext2D, cam: Camera): void   // cached per size

// bands.ts
export interface Bands { crew: number; deckFine: number; seaClose: number; airLabels: number;
                         clouds: number; radar: number; inset: number }
export function zoomBands(z: number): Bands

// assets.ts (async texture loading, luminance-to-alpha conversion, sprite caches)
export function loadAssets(): Promise<void>            // resolves even on failure, so drawing falls back to flat
export function seaPattern(ctx: CanvasRenderingContext2D, which: 'A' | 'B'): CanvasPattern | null
export function foamPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null
export function puffSprite(i: number): CanvasImageSource | null   // 16 cells, 64 px, white with alpha
export function glowSprite(): HTMLCanvasElement                    // procedural radial

// sea.ts
export function drawSea(ctx: CanvasRenderingContext2D, cam: Camera, t: number, b: Bands): void

// wake.ts
export function drawWake(ctx: CanvasRenderingContext2D, cam: Camera, t: number, b: Bands): void  // incl. bow wave and Kelvin
export function wakeSlickPath(cam: Camera): Path2D                   // reused by the radar

// ship.ts
export function drawShipShadows(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry): void
export function drawShipDetail(ctx: CanvasRenderingContext2D, cam: Camera, g: DeckGeometry, eq: EquipmentKeyframe, t: number): void
export function buildGrimePlate(g: DeckGeometry): HTMLCanvasElement

// airborne.ts
export interface AirState { id: string; modex: string; x: number; y: number; heading: number; alt: number; leg: PatternKeyframe['leg'] }
export function airborneStates(tl: Timeline, t: number, onDeckVisible: (id: string) => boolean): AirState[]
export function drawAirShadows(ctx: CanvasRenderingContext2D, cam: Camera, tl: Timeline, air: AirState[]): void
export function drawAirborne(ctx: CanvasRenderingContext2D, cam: Camera, tl: Timeline, air: AirState[], b: Bands, selected: string | null): void

// fx/index.ts
export interface FxIndex { shots: number[][]; live: [number, number][]; touchdowns: { t: number; modex: string }[];
                           bolters: number[]; wireEdges: { n: number; on: number; off: number }[]; lsoWaveoff: [number, number][] }
export function buildFxIndex(tl: Timeline): FxIndex
// fx/steam.ts
export function drawSteamUnder(ctx, cam, g: DeckGeometry, fx: FxIndex, eq: EquipmentKeyframe, t: number): void   // P3, P7, P8
export function drawSteamOver(ctx, cam, g: DeckGeometry, fx: FxIndex, t: number): void                          // P1, P2, P9, P11
// fx/exhaust.ts
export function drawShimmer(ctx, canvas: HTMLCanvasElement, dpr: number, cam, jets: { a: AircraftEntity; s: AircraftState }[], eq, wall: number): void
export function drawBurner(ctx, cam, a: AircraftEntity, s: AircraftState, wall: number): void   // P4, P5; replaces the glow block in aircraft.ts
// fx/lights.ts
export function drawLights(ctx, cam, g, fx, eq, t: number): void   // P12, P13
// clouds.ts
export function drawCloudShadows(ctx, cam, t: number, b: Bands): void
export function drawClouds(ctx, cam, t: number, b: Bands): void
// radar.ts
export function drawRadar(ctx, cam, tl: Timeline, t: number, air: AirState[], eq: EquipmentKeyframe, onDeck: number, mix: number, wall: number): void
// patternGeom.ts (moved out of pattern.ts)
export const CASE_I: { initialStart: Vec2; breakPoint: Vec2; downwindY: number; abeamX: number; ninety: Vec2; finalDeg: number; rampX: number; grooveNm: number }
export function traceCaseI(ctx: CanvasRenderingContext2D, P: (nm: Vec2) => Vec2): void
// fx/rand.ts
export function hash(...n: number[]): number   // [0, 1)
export function noise1(x: number): number      // value noise, [-1, 1]
```

`src/data/shipDetail.ts` holds the sponson mounts, mast and radar slabs, and the beacon position, all [EST].

### D.2 main.ts frame (new order)

```
b = zoomBands(cam.zoom); eq = sampleEquipment(...); wall = now / 1000
states = aircraft samples (as today)
air = airborneStates(timeline, t, id => visibleOnDeck(id))
if (b.radar < 1) {
  drawSea(ctx, cam, t, b)
  drawCloudShadows(ctx, cam, t, b)
  drawWake(ctx, cam, t, b)
  drawShipShadows(ctx, cam, DECK)
  drawDeck(ctx, cam, DECK, eq)                       // now includes the grime plate, grating, mounts, lit island
  drawShipDetail(ctx, cam, DECK, eq, t)
  drawAirShadows(ctx, cam, timeline, air)            // on sea and deck
  drawSteamUnder(...)                                // P3 P7 P8
  vehicles (as today)
  jet ground shadows (one pass)
  drawShimmer(...)                                   // reads the canvas: must follow everything it distorts
  jets (as today, ghost grey; drawBurner per jet after its body)
  drawSteamOver(...)                                 // P1 P2 P9 P11
  drawLights(...)
  crew (globalAlpha *= b.crew; skipped at 0)
  control cones (skipped when b.crew < 0.5)
  drawAirborne(...)
  drawClouds(...)
  deck labels (alpha *= b.deckFine)
  drawVignette(ctx, cam)
}
if (b.radar > 0) drawRadar(ctx, cam, timeline, t, air, eq, onDeckCount, b.radar, wall)
drawPatternInset(..., { ..., zoomFade: b.inset })
```

Hit-testing gains the airborne jets (radius 10 px around each blip or silhouette). Selecting one sets
`ui.selectedAircraft`, and follow mode tracks the airborne position. You can follow 211 off the cat, round the
pattern and back to the wire across all zoom bands.

### D.3 Other changes

- **camera.ts**: `minZoom = 0.006`, `clampCentre()`, and a per-call duration in `CameraTween.to` (already there).
  `goView` passes 1.4 s for `pattern`.
- **pattern.ts**: geometry imported from patternGeom.ts, `zoomFade` option, export `patternInsetRect`.
- **aircraft.ts**: the low-zoom arrow gets the 9 px floor and an outline. The power glow moves to
  `fx/exhaust.ts`. New `drawAircraftShadow(ctx, cam, e, s)` reuses the compiled Path2D parts (wing-fold
  transform included). The silhouette parts get a 0.6 px `--jet-outline` stroke (one stroke on the fuselage and
  wing paths only).
- **deck.ts**: the island shadow is replaced (A.5 item 2), the grime plate and grating are added, and markings
  below 0.75 device px are skipped. JBD raised rendering moves to lit and shadowed (P7).
- **crew.ts**: `drawCrew` takes an alpha multiplier. No other change (R1).
- **tokens.ts and styles.css**: the A.7 tokens plus `.on-dark` header rules.
- **data/deck.ts VIEWS**: add `pattern`, widen `deck` and `bow` (B.7).
- **ui**: views list entry, `setMode('scope' | 'world')`, inset click handler.

### D.4 Performance plan (1440x900 at dpr 2, budget 16.6 ms; today's frame is about 4-5 ms)

| Item | Technique | Budget |
|---|---|---|
| Sea | 2-3 `fillRect` with `CanvasPattern` + `setTransform` | 1.2 ms |
| Wake | half-res offscreen layer, 3 polygons + 1 pattern + 1 gradient mask | 1.5 ms |
| Ship shadows and detail | cached Path2D in world space, drawn under the camera transform; grime plate as 1 `drawImage` | 0.8 ms |
| Steam and smoke | at most 320 sprite `drawImage` per frame (hard cap, oldest dropped) | 1.2 ms |
| Shimmer | at most 4 jets x 30 strips of canvas self-blit | 1.0 ms |
| Burners, lights | gradients cached per jet type and length bucket | 0.3 ms |
| Airborne + shadows | at most 24 silhouettes | 0.3 ms |
| Clouds | at most 72 sprites, only in band | 0.6 ms |
| Radar | cached static scope frame (rings, ticks, scanlines) per size and zoom bucket; dynamic blips, trails and blocks | 1.5 ms |
| Vignette | 1 `drawImage` of a cached canvas | 0.1 ms |

- **Quality governor**: an EMA of frame time. Above 14 ms for 1.5 s, step down a tier: tier 2 (full) → tier 1 (no
  shimmer, wake at 0.33 res, particle cap 160, no cloud shadows) → tier 0 (flat sea colour + swell, no particles
  except P1 at cap 60). It steps back up after 5 s below 9 ms. `?fx=0|1|2` forces a tier for screenshots.
- **Reduced motion**: shimmer off, flicker off, radar sweep off. Sim-driven motion (water flow, steam drift)
  stays, because it is the state of the world at t, and it stops whenever the clock is paused.
- Textures are lazy-loaded after the first frame (`loadAssets()` without await). Before they arrive, flat
  fallbacks draw. Total payload under 600 KB as WebP.

---

## E. Image generation

The direction depends on photographic textures for the sea, the foam and the steam. Everything else (wake
geometry, Kelvin crests, shadows, burner, radar, grime) is procedural.

Test images generated for this proposal (medium; all three proved viable):

| File | Result |
|---|---|
| `tools/out/visuals/cand-cinematic-ocean.png` | Good navy sea, even density. It needs an edge blend to tile. |
| `tools/out/visuals/cand-cinematic-foam.png` | Excellent foam band on black, usable as-is with `'screen'`. It needs a horizontal tile blend. |
| `tools/out/visuals/cand-cinematic-steam.png` | A clean 4x4 puff sheet. There are faint vertical stripes in the black background, which a levels step (black point 14/255) removes. |

Implementation set: final quality, run once each, with one retry allowed.

| # | Asset | Prompt | Size | Quality | Est. |
|---|---|---|---|---|---|
| 1 | `public/tex/sea-a.webp` | The ocean prompt above, plus: "sea state 3-4, waves about 40-80 feet apart, very sparse small whitecaps, no large dominant swell lines, colour deep navy blue-grey around #1b2a38" | 1024x1024 | high | $0.20 |
| 2 | `public/tex/sea-b.webp` | "Seamless tileable straight-down aerial texture of a long ocean swell seen from 3,000 feet, broad soft undulating light and dark bands of navy grey water, almost no whitecaps, very low contrast, no glare, no objects, no text" | 1024x1024 | medium | $0.07 |
| 3 | `public/tex/foam.webp` | The foam prompt above, plus: "seamless left to right" | 1536x1024 | high | $0.30 |
| 4 | `public/tex/steam.webp` | The steam sheet prompt above | 1024x1024 | high | $0.20 |
| 5 | `public/tex/cloud.webp` | "A 2 by 2 grid of four isolated small fair-weather cumulus clouds seen from directly above, bright white tops with soft grey shaded undersides, pure black background, no ground, no text" | 1024x1024 | medium | $0.07 |
| | Retries (worst case, 1 per asset) | | | | $0.84 |
| | **Total** | | | | **about $1.70** (under the $12 cap; tests spent $0.245) |

Post-processing is a build-time, one-off script, `tools/tex.mjs`, run in the existing Playwright headless browser
so it needs no new dependency:

- Tiles 1, 2 and 3: offset by half the tile and crossfade the seam with a 12 % cosine feather (classic
  offset-and-blend), then check a 2x2 preview screenshot.
- Images 3-5: luminance to alpha (white RGB, alpha = levels(L, 14, 235)).
- Steam: split into a 16-cell sprite atlas of 128 px cells.
- Export WebP at quality 78.

The outputs are committed under `public/tex/`. The raw PNGs stay in `tools/out/` (git-ignored).

---

## F. Acceptance

Screenshots via `node tools/shot.mjs tools/out/visuals/<name>.png <t> <view> 1440 900 [zoom] [cx] [cy]`, plus
`?fx=2`.

| # | Shot | Must be visible | Readability check |
|---|---|---|---|
| 1 | `t=330 deck` (zoom from the view) | Dark textured sea. The boiling prop-wash wake leaving the ramp to the left edge (deck view now starts at x -90). The island shadow falling down-left across the sea. The ship's 47 ft shadow band below the starboard edge. Ghost-grey jets with ground shadows. Ambient slot wisps on the live cats. | Every jersey dot is distinguishable at the same count as `base-deck.png`. Cat labels and the foul line are unobstructed. |
| 2 | `t=352 bow 1440 900 2.2` (just after cat 1's shot at 300+50=350 on cat 2) | A stroke-steam trail along cat 2 drifting aft. The water-brake burst at the bow end. The cooling steam starting on JBD 2. The bow moustache at the right edge. | The shooter, deck-edge operator and TSPO dots (and their glyphs) are drawn over the steam at full opacity. |
| 3 | the first launch with `power === 2` (from the FX index, t = S-4), its cat's view at zoom 3.0 | Twin burner cores with shock diamonds against the raised JBD. Heat shimmer between the nozzles and the JBD. JBD blast haze. | The jet silhouette outline stays crisp. Shimmer never covers a crew dot (compare against `?fx=1`). |
| 4 | `t=900 wires 1440 900 1.6` (trap 1 touchdown) | Tyre smoke at s≈230. The engaged wire bright and bowed. The jet with its shadow converging. The wake boiling under the ramp. | The gear puller and hook runner are visible. The wire numbers are legible. |
| 5 | the bolter touchdown (from the FX index), `wires 1.4` | Hook-skip sparks. The afterburner. The airborne shadow separating from the jet past the angle. | Sparks last at most 0.6 s (check two frames 0.7 s apart). |
| 6 | the first wave-off window, `wires 1.2` | Flashing red lights at the IFLOLS. The burner on the waving-off jet. The beacon showing FOUL. | The `FOUL DECK` word is present (radar caption, panel) and colour is not the only cue. |
| 7 | `t=1000 deck 1440 900 0.12` (helicopter band) | The ship with a 2 nm turquoise wake and Kelvin arms. Airborne jets with shadows at altitude-scaled offsets. A thin cloud layer with cloud shadows. No crew dots. | The modex labels of airborne jets are readable over the clouds (clouds under the labels). |
| 8 | `t=1000 pattern` (fit about 0.027) | The CATCC scope: rings 1-6 nm, BRC and final bearing, the nominal Case I legs labelled, the ship to scale with `GREEN/FOUL DECK`, every airborne jet as a blip with an afterglow trail and an ATC block (modex + alt + leg). The marshal ring. The caption `CATCC · CASE I · n AIRBORNE · ON DECK m`. The inset hidden. | No two data blocks overlap. The blip count equals the inset's airborne count at the same t. |

Extra checks:

- **Crossfades**: shots at zoom 0.09, 0.06 and 0.04 at t=1000 must look like intermediate blends, with no pop.
- **Scrub determinism**: `t=352` reached by seeking from 0 and by seeking back from 600 must give pixel-identical
  frames with `?fx=2&reduced=1`. The steam must match.
- **Performance**: `?play=1` at 4x through t 300-420 and 880-1000 on the dev machine: frame time p95 at most
  14 ms in the Performance panel. The governor must not drop below tier 2.
- **Reduced motion**: emulate `prefers-reduced-motion`. There must be no shimmer, no flicker and no sweep. A
  paused frame must be static across 2 screenshots taken 1 s apart.
- **Highlight mode** (`hl=yellow` at t=330): dimmed jets in `--jet-2`, while steam and burners drop to 40 % alpha,
  so the yellow shirts dominate.
