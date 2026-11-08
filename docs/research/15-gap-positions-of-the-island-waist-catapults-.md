# 15 - Gap fill: measured positions of the island, catapults, wires, lens, LSO platform and elevators

**Purpose.** Files 01 (deck geometry) and 07 (visual reference) disagree on where the main deck anchors are. This file replaces both with **measured** positions taken from orthorectified satellite imagery of Nimitz-class carriers at the pier. Where a value is measured it is tagged **[MEAS]**. Where it is inferred from measurements plus documents it is tagged **[INF]**. Where it is an engineering estimate it is tagged **[EST]**.

**Bottom line.**
- **01 has the island and all four elevators placed 80 to 150 ft too far forward.**
- **07 has the island, the elevators and the waist catapults about 100 to 150 ft too far forward.** In 07's bow-origin frame, the island at x = 520-680 converts to X = 412-572 from the ramp; the measured position is 290-430.
- **The lens is not abeam the wires.** It sits on the port deck edge about **350 to 420 ft forward of the ramp**, roughly abeam the aft half of the island and 100 to 160 ft forward of the target wire. The **LSO platform** is the thing near the wires. It sits on the port deck edge about **115 to 135 ft forward of the ramp**, just aft of elevator 4 and about 40 to 60 ft aft of wire #1.
- **The waist catapults are not parallel to the angled deck.** Cat 4 (outboard) runs almost parallel to the keel. Cat 3 (inboard) is toed about 4 deg to port and converges on cat 4 going forward.

---

## 1. Method

### 1.1 Imagery used

| ID | Image | Ship | Why it was used |
|---|---|---|---|
| **A (primary)** | Esri World Imagery, zoom 19, Naval Station Norfolk Pier 12 area (approx. 36.9591 N, 76.3289 W) | **CVN-77 *George H.W. Bush*** ("77" on the bow; 3-wire ship). The deck was nearly empty: one aircraft and some yellow gear | Orthorectified satellite image, near nadir. Every marking is visible: cat tracks, landing-area ladders, wire terminals, elevator wells |
| B (cross-check) | Esri World Imagery, zoom 19, Puget Sound Naval Shipyard Dry Dock 6 (approx. 47.5545 N, 122.6434 W) | Unidentified Nimitz-class ship in dry dock under overhaul. The deck is cluttered and the wires are removed | The dry-dock walls give a perfectly aligned keel. Used to check the angled-deck outline and the island fore/aft extent |
| C (cross-check) | Esri World Imagery, zoom 19, NAS North Island carrier quay (approx. 32.7063 N, 117.1881 W) | Unidentified Nimitz-class ship in maintenance, with the stern under tarps | Used only qualitatively (deck outline, island side). Too obscured to measure |
| D (cross-check) | Wikimedia Commons: "Top down view of USS Carl Vinson and HMAS Ballarat ... October 2021" (USN photo, 4271 x 2402 px) | CVN-70 | Oblique helicopter photo. The athwartships direction is foreshortened by about 12%. Used to check that cat 4 runs parallel to the keel and cat 3 is toed in |
| E (cross-check) | Wikimedia Commons: "Overhead view of USS Gerald R. Ford (CVN-78) and USS Harry S. Truman (CVN-75) ... 4 June 2020" | CVN-75 and CVN-78 | Qualitative. Shows the Ford island far aft and the Nimitz island at about one third of the ship length from the stern |

### 1.2 Scale and frame (image A)

- **Ground sample distance.** Web-Mercator zoom 19 at latitude 36.959 deg: 0.29858 m x cos(36.959 deg) = **0.2386 m/px = 0.783 ft/px**.
- **Check against the known length.** Measured stern deck edge to bow deck edge is 1,398-1,403 px, which is **1,095-1,098 ft**. The published length is 1,092 ft overall, so the independent scale agrees to within 0.3-0.6%. I did not rescale. Every X below may be up to about 0.5% long, which is at most 5 ft at the bow.
- **Keel alignment.** The pier face was fitted as a line through 31 edge points: it lies at 9.35 deg in the image (rms 2 px). The deck centre points at the bow and stern give 9.5 deg. I rotated the image by 9.5 deg, so the keel runs horizontally and the residual rotation is ±0.3 deg.
- **Frame.** This is the same frame as 01. **X = feet forward of the stern ramp (the aft edge of the flight deck), measured along the keel. Y = feet from the ship centerline, positive to starboard.** To convert to 07's frame (x aft of the bow tip), use x07 = 1092 - X.
- **Centerline.** The midpoint of the deck at the bow tip (Y from -48 to +42) and at the stern (Y from -60 to +67) puts the ship centerline within ±3 ft.
- **Reading.** Features were read off ship-frame foot grids (10 ft spacing) overlaid on 2.6x to 5x enlargements. The landing-area lines were measured numerically: bright-pixel rows at 9 stations, then a straight-line fit.

### 1.3 Uncertainty

| Feature type | X (fore/aft) | Y (athwartships) | Notes |
|---|---|---|---|
| Sharp painted or recessed features: cat tracks, elevator wells, wire terminals, deck edges | **±5 ft** | **±4 ft** | About ±5 px of reading plus 0.5% scale |
| Angles (landing area, cat tracks) | ±0.4 deg | | Residual frame rotation ±0.3 deg plus line-fit error |
| Island footprint | **±10 ft** | **±8 ft** | Satellite lean displaces tall structure outboard (+Y). The inboard base edge is the reliable one |
| LSO platform, lens, elevator 4 | **±15-25 ft** | ±8 ft | Identification is uncertain at 0.78 ft/px. The text sources and glideslope geometry agree with the chosen candidates |
| Ship-to-ship variation (CVN-68 to 77) | ±10 ft typical | | CVN-76/77 have a redesigned island and 3 wires. The island fore/aft extent agreed with image B to within 20 ft |

---

## 2. Measured anchors (ship frame: X fwd of ramp, Y + starboard, feet)

### 2.1 Deck outline (image A, CVN-77; image B agrees on the angled-deck corner to within 3 ft)

| Point | X | Y | Tag |
|---|---|---|---|
| Stern ramp, port end | 0 | -60 | [MEAS] |
| Stern ramp, starboard end | 0 | +67 | [MEAS] |
| Starboard quarter step-out (fantail edge to the E3 run) | 56 to 73 | +66 to +97 | [MEAS] |
| Starboard edge abeam E3, island, E2 and E1 (outer face of elevator platform or island) | 180 to 770 | +120 to +125 | [MEAS] |
| Starboard bow taper begins | ~770 | +120 | [MEAS] |
| Starboard bow taper ends | ~850 | +65 | [MEAS] |
| Bow tip, starboard corner | 1092 (meas. 1095) | +42 | [MEAS] |
| Bow tip, port corner | 1092 | -48 | [MEAS] |
| Port bow edge, aft end (start of the angled-deck forward edge) | ~842 | -63 | [MEAS] (image B: 820, -60) |
| **"The point"**: forward port corner of the angled deck | **739** | **-142** | [MEAS] (image B: 740, -140) |
| Port sponson edge | 739 to 150 | -140 to -125 | [MEAS] |
| Aft end of the port sponson (raked aft edge) | 150 to 141 | -128 to -66 | [MEAS] |
| Port quarter edge | 140 to 0 | -66 to -60 | [MEAS] |

- **Maximum width at a single station** is about 248-250 ft, at X ≈ 600-650: the outer edge of the E1 platform (+120) to the port sponson (-128). The published figure is 252 ft. ✓
- **Overall Y envelope** runs from -142 to +125 (267 ft). This is wider than 252 ft because the two extremes occur at different stations.

### 2.2 Landing area (angled deck), image A

| Item | Value | Tag |
|---|---|---|
| **Landing centerline angle** | **9.0 deg to port** of the keel (fits: 8.85, 9.23, 9.29 deg). Published: 9 deg 03 min (GlobalSecurity) | [MEAS] |
| **Landing centerline at the ramp** | **Y = +19 ft** (±4), i.e. starboard of the ship centerline, not on it | [MEAS] |
| Landing centerline equation | **Y_CL(X) = 18.6 - 0.158 X** (distance along the CL s = X / 0.988) | [MEAS] |
| Edge markings | Each edge is a "ladder" (two parallel white lines about 8-10 ft apart with rungs) | [MEAS] |
| Inner ladder lines (landing area proper) | **±30 ft** from the CL (59 ft apart) | [MEAS] |
| Outer ladder lines | +41 / -34 ft from the CL (about 75 ft apart). The red/white foul line is further starboard; not resolved | [MEAS] |
| Landing CL exits the deck (bolter run-out end) | X ≈ 786, Y ≈ -106, which is **~796 ft along the CL** from the ramp (01's "~780 ft" ✓) | [MEAS]/[INF] |
| Touchdown tire-rubber smear | X 200-360 along the CL. Heaviest at X 220-300 | [MEAS] |

### 2.3 Arresting wires

Image A is **CVN-77, a 3-wire ship**. Each pendant shows as a pair of slanted terminal/support fittings, one at each landing-area edge. The pendant runs between the inboard ends of each pair. Each pair is offset about 10 ft fore/aft across about 63 ft, which is exactly perpendicular to the 9-deg landing axis. That confirms the pairing.

| Wire (CVN-77) | Stbd inboard end (X, Y) | Port inboard end (X, Y) | Centre on CL (X, Y) | **Distance from ramp along CL** | Tag |
|---|---|---|---|---|---|
| #1 | (219, +19) | (210, -46) | (214, -14) | **217 ft** | [MEAS] |
| #2 (target) | (259, +11) | (249, -52) | (254, -20) | **257 ft** | [MEAS] |
| #3 | (307, +3) | (297, -60) | (302, -28) | **306 ft** | [MEAS] |

- **Spacing**: 40 ft and 49 ft (±5).
- **Pendant**: the span between terminal fittings is about 64 ft. The fittings angle outboard and aft for a further ~25 ft on each side.
- **Applying this to the 4-wire ships (CVN-68 to 75)** [INF]. A forum recollection (PPRuNe) says the 3-wire configuration came from **removing the #1 wire**. The measured CVN-77 wires then sit in the old #2, #3 and #4 positions. That predicts **#1 ≈ 177 ft, #2 ≈ 217, #3 (target) ≈ 257, #4 ≈ 297-306 ft**.
  - This matches 01's independent forum figure of "~175 ft ramp to #1 wire" and 40 ft spacing.
  - The target wire then sits at the same physical spot, about 255 ft, on both configurations.
  - **Recommended sim values for a 4-wire ship: 177 / 217 / 257 / 300 ft along the CL.** For 3-wire CVN-76/77: 217 / 257 / 306.
- **Glideslope check.** Smithsonian gives 14.1 ft hook-to-ramp clearance on a 3.5 deg glideslope. 14.1 / tan 3.5 deg = 230 ft, a touchdown point between the old #2 and #3 wires. ✓

### 2.4 Catapults (power-stroke track ends: the tan/white track strips, 337-346 ft long)

| Cat | Aft end, shuttle start (X, Y) | Fwd end (X, Y) | Heading vs keel | Heading vs landing CL | Tag |
|---|---|---|---|---|---|
| **1** (bow, stbd) | (731, +56) | (1074, +25) | **5.2 deg to port** | n/a | [MEAS] |
| **2** (bow, port) | (726, -16) | (1072, -25) | **1.5 deg to port** | n/a | [MEAS] |
| **3** (waist, inboard) | **(411, -71)** | **(755, -97)** | **4.3 deg to port** | 4.7 deg starboard of the CL heading | [MEAS] |
| **4** (waist, outboard) | **(357, -110)** | **(696, -110)** | **~0 deg (parallel to the keel)** | 9.0 deg starboard of the CL heading | [MEAS] |

- Track lengths are 343, 346, 344 and 339 ft. The C-13-1 power stroke is about 310 ft, so the track strip runs about 30 ft longer than the stroke. Put the shuttle start about 10 ft forward of the aft end of the strip, and the end of the power stroke about 20 ft short of the forward end. [EST]
- **The pairs converge going forward.** Cat 1 and cat 2 are 72 ft apart at the aft end and 50 ft apart at the bow. Cat 3 and cat 4 are 39 ft apart aft and 13 ft apart forward (cat 3 lies more forward). The convergence angle is about 3.7-4.3 deg in both pairs. It does not depend on any frame-rotation error. Image D (CVN-70) shows the same pattern.
- **The waist cats inside the landing area** [MEAS/INF]:
  - Cat 3 starts at the port edge of the landing area (CL at X 411 is Y -46.5, so the aft end is 25 ft port of the CL, inside the ±30 band). Cat 3 ends almost on the landing CL (at X 755 the CL is at Y -101 and cat 3 is at -97).
  - Cat 4 starts outside the landing area (72 ft port of the CL at X 357) and enters it at about X 560-600.
  - Both waist cats are fouled during recovery.
- **JBDs** (flush or raised panels just aft of each shuttle start; the aircraft sits between the JBD and the shuttle):

| JBD | X | Y | Tag |
|---|---|---|---|
| JBD 1 | 660-687 | +42 to +78 | [MEAS] |
| JBD 2 | 655-675 | -30 to +15 | [MEAS] |
| JBD 3 | ~355-370 | -51 to -70 | [MEAS, low confidence] |
| JBD 4 | 292-308 | -96 to -123 | [MEAS] |

  Each JBD is about 50-65 ft aft of its shuttle start. Each panel is about 15 ft (fore/aft) by 27-36 ft (athwartships).

### 2.5 Island (images A and B)

| Item | Value | Tag |
|---|---|---|
| **Fore/aft extent at deck level** | **X ≈ 290 to 430 ft** (CVN-77). Image B: 287 to 449 ft, with scaffolding. **Use 290-435.** Length about 140-150 ft; the centre is about 360 ft from the ramp, roughly one third of the ship length from the stern | [MEAS] ±10 |
| **Inboard face** | **Y ≈ +80** along the main body. The forward block (radome/mast base, X 395-430) reaches **Y ≈ +63** | [MEAS] ±8 |
| Outboard face | Flush with the starboard deck edge / hull side, **Y ≈ +125** | [MEAS] |
| Island off the deck edge? | **No.** It sits on the deck, with its outboard face at the deck edge. 07's "y = +95..+125" outboard band is plausible, but its x is about 120 ft too far forward | [MEAS] |
| Gaps | About 10 ft between the island's forward end and E2's aft edge. About 40 ft between the island's aft end (290) and E3's forward edge (251). That gap is the "Hummer hole" / junkyard notch | [MEAS] |
| Cross-check | TWZ: the Ford island is 140 ft further aft than Nimitz's. Image E puts the Ford island centre at about 215 ft from the stern; 360 - 140 = 220. ✓ | [DOC]+[MEAS] |

### 2.6 Elevators

| Elevator | X (fore/aft) | Y (inboard to outboard) | Size | Tag |
|---|---|---|---|---|
| **E1** (stbd, fwd) | **591-661** | +65 to +120 | 70 x 55 ft | [MEAS] |
| **E2** (stbd, fwd of island) | **439-509** | +65 to +120 | 70 x 55 ft | [MEAS] |
| **E3** (stbd, aft of island) | **182-251** | +63 to +120 | 69 x 57 ft | [MEAS] |
| **E4** (port, aft) | **~145-215**. The aft edge is raked from X 141 (inboard) to 150 (outboard). A uniform light-coloured patch extends to X 245 | **-68 to -128** | about 65 x 60 ft (trapezoid) | [MEAS, low confidence ±20 in X] |

- Area check: 70 x 55 ≈ 3,850 sq ft and 65 x 60 ≈ 3,900 sq ft, against the published 3,880 sq ft. ✓
- The well (opening) is what shows when an elevator is lowered. The platform fills it flush when raised.
- E4 lies in the landing-area run-out. The landing CL at X 145-215 is Y -4 to -15, so the port landing edge is at about -34 to -45, about 25-35 ft inboard of E4's inboard edge. **E4 is outside the inner landing lines but abuts the port side of the landing zone.** It is not used during recovery.

### 2.7 LSO platform and IFLOLS (lens)

| Item | Position | Basis | Tag |
|---|---|---|---|
| **LSO platform** | **X ≈ 115-135, Y ≈ -66 to -82** (port deck edge, in the notch just aft of the E4 sponson). About 65-80 ft port of the landing CL. **About 40-60 ft aft of wire #1** on a 4-wire ship (about 80-100 ft aft on CVN-77) | Wikipedia (LSO): the platform is "on the port side of the ship aft of the port side aircraft elevator". Image A shows a dark deck-edge pocket at that spot | [INF] ±15 |
| **IFLOLS** | **X ≈ 350-420 ft fwd of the ramp (best 375-390)**, port deck edge, **Y ≈ -128 to -140**, facing aft. That is roughly abeam the aft half of the island and **100-160 ft forward of the target wire** | (1) Image A shows a deck-edge structure at X 347-372, Y -124 to -143, plus a second object at X 383-390. (2) Glideslope geometry (next row). (3) DCS forum: the lens is "abeam the island", which is X 290-430 here | [INF] ±25 |
| Lens geometry | The eye passes through the lens centre (height h_L above the deck) on a 3.5 deg slope. The hook, h_he below the eye, touches down at the aim point. Lens X = touchdown + (h_he - h_L) / tan 3.5 deg. With touchdown 230-257 ft, h_he 14-17 ft and h_L 4-8 ft, **lens X = 335-470 ft**. Central case (h_he 15.5, h_L 6, touchdown 237): **392 ft** | Geometry | [INF] |

**Resolving the contradiction.** 07's "lens roughly abeam the wire set" conflates the **LSO platform** (aft, near the wires) with the **lens** (forward, abeam the island). 01's X = 420 is at the forward end of the plausible range. **Use X ≈ 385, Y ≈ -132.**

---

## 3. What to change in 01 and 07

| Anchor | 01 (X fwd of ramp) | 07 (converted to X fwd of ramp) | **Measured (use this)** |
|---|---|---|---|
| Island X | 410-560 | 412-572 | **290-435** |
| Island Y | +70 to +102 | +95 to +125 | **inboard +80 (fwd block +63), outboard +125** |
| E1 | 670-740 | n/a | **591-661** |
| E2 | 580-650 | n/a | **439-509** |
| E3 | 325-395 | n/a | **182-251** |
| E4 | 330-400, Y -75/-127 | n/a | **~145-215, Y -68/-128** |
| Cat 3 | (430,-30) to (736,-79), 9 deg | x 560 to 260, i.e. X 532 to 832 | **(411,-71) to (755,-97), 4.3 deg to port** |
| Cat 4 | (410,-72) to (716,-121), 9 deg | same as cat 3 | **(357,-110) to (696,-110), 0 deg** |
| Cat 1 / Cat 2 | n/a / n/a | x 320 to 20, i.e. X 772 to 1072 | **(731,+56) to (1074,+25) / (726,-16) to (1072,-25)** |
| Landing CL at the ramp | Y +5 | n/a | **Y +19, at 9.0 deg** |
| Landing-area width | n/a | ~120 ft | **59 ft between inner ladders, 75 ft between outer** |
| Wires (4-wire) | 173 / 212 / 252 / 291 X (175 / 215 / 255 / 295 along the CL) | #1 at 150-200, 40-50 ft spacing | **177 / 217 / 257 / ~300 along the CL** (CVN-77: 217 / 257 / 306) |
| Lens | X 420, Y -128 | "abeam island", 400-450 | **X ~385 (range 350-420), Y -132** |
| LSO platform | X 150-185, Y -100/-120 | "abeam the wire set" | **X 115-135, Y -66/-82** |
| The point | n/a | n/a | **(739, -142)** |
| JBD 3 / JBD 4 | (381,-22) / (361,-64) | n/a | **(~362,-60) / (300,-110)** |

---

## 4. Simulation implications

1. **Adopt one deck frame.** X = feet forward of the stern ramp along the keel, Y = feet from the ship centerline (+ starboard). Use 01's frame, and convert 07 with x07 = 1092 - X. Load every anchor below from a single JSON config so the crew stations and paths derive from it.
2. **Deck polygon** (clockwise from the stern, port side). Keep the landing-area CL crossing the ramp at Y +19.
   - Port side: (0,-60), (140,-66), (150,-128), (739,-142), (842,-63), (1092,-48).
   - Bow and starboard side: (1092,+42), (850,+65), (770,+120), (180,+120), (73,+97), (56,+66), (0,+67).
3. **Landing area.**
   - Axis Y = 18.6 - 0.158 X (9.0 deg to port).
   - Inner edges at ±30 ft and outer edge ladders at about ±37 ft from the axis.
   - The axis exits the deck at about (786,-106).
   - Draw the foul line slightly starboard of the outer starboard ladder.
4. **Wires.** Put each wire perpendicular to the landing axis.
   - 4-wire ships: centres at s = 177, 217, 257, 300 ft along the axis. Target is the #3 wire at 257.
   - 3-wire toggle: 217, 257, 306. Target is the #2 wire.
   - The visible pendant is about 65 ft long, with terminal fittings angled 25 ft outboard and aft at each end.
5. **Catapults.** Use the measured endpoints and headings. Each shuttle start is about 10 ft forward of the track's aft end, and the power stroke is about 310 ft.
   - **Cat 4 runs parallel to the keel.**
   - **Cat 3 is toed 4.3 deg to port and converges on cat 4.** This explains why the two waist cats cannot launch side by side the way the bow cats can.
   - The bow cats also converge slightly (cat 1 at 5.2 deg to port, cat 2 at 1.5 deg).
   - Place the JBDs 50-65 ft aft of each shuttle start.
6. **Waist cats and recovery conflict.**
   - Cat 3 lies inside the landing band for its whole length.
   - Cat 4 lies inside the band forward of about X 560-600.
   - Lock out cats 3 and 4 and clear the waist whenever the deck is open for recovery.
   - The aircraft and JBD at the aft end of cat 4 (X ~300-360) lie outside the band. Even so, the deck lead must clear them for the foul-line check, because their tails and the raised JBD are near the edge.
7. **Island.**
   - Footprint box X 290-435, Y +80 to +125, plus a forward block X 395-435 that reaches Y +63.
   - Pri-Fly overlooks the landing area from the island's aft/port face, at X ~300-360.
   - The "street" taxi lane runs between the island's inboard face (+80) and the landing area's starboard ladder. At X 360 that ladder is at about Y -8 to +3, so the street is about 75 ft wide.
8. **Elevators.**
   - E1 X 591-661, E2 X 439-509, E3 X 182-251, all spanning Y +65 to +120.
   - E4 X 145-215, Y -68 to -128 (trapezoid). Keep E4 locked during recovery.
9. **LSO platform** at about (125, -74), facing aft and inboard toward the approach. **Lens** at about (385, -132), facing aft, roughly abeam the aft end of the island. The LSO's sightline to the ball is a near-fore/aft look about 260 ft forward along the port edge, so both can be shown in a single "LSO view" camera preset.
10. **Error budget.**
    - Treat elevator, cat, wire and outline positions as accurate to ±5 ft.
    - Island ends ±10 ft.
    - Lens, LSO platform and E4 ±20 ft.
    - At top-down overview scale none of this is visible. It matters for crew placement near the foul line and the waist cats.

---

## 5. Open questions

- Positive identification of the IFLOLS and the LSO platform in a higher-resolution or oblique image. The positions above rest on a candidate structure plus geometry and text.
- Whether the 3-wire conversion on CVN-76/77 removed the old #1 wire. This rests on one forum recollection, but the measured positions are consistent with it.
- Island footprint on CVN-68 to 75 versus the redesigned CVN-76/77 island. Image B (an unidentified hull) agrees on fore/aft extent to within about 20 ft. The inboard face differs (+57 in B because of scaffolding/wrap, against +80 in A).
- Exact foul-line offset from the landing axis. The red/white line was not resolvable.
- Exact E4 extent. The light deck patch runs from X 145 to 245; faint joint lines near X 210 suggest the platform's forward edge.

---

## 6. Sources

- Esri World Imagery tile service (orthophoto, zoom 19). Tile URL template: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
  - Norfolk Pier 12 (CVN-77): tiles z19 x 150978-150985, y 204139-204146
  - PSNS Dry Dock 6: z19 x 83526-83535, y 183210-183221
  - NAS North Island: z19 x 91472-91479, y 211688-211695
- Wikimedia Commons, "Top down view of USS Carl Vinson and HMAS Ballarat conducting fueling-at-sea in the Bay of Bengal during October 2021": https://commons.wikimedia.org/wiki/File:Top_down_view_of_USS_Carl_Vinson_and_HMAS_Ballarat_conducting_fueling-at-sea_in_the_Bay_of_Bengal_during_October_2021.jpg
- Wikimedia Commons, "Overhead view of USS Gerald R. Ford (CVN-78) and USS Harry S. Truman (CVN-75) in the Atlantic Ocean on 4 June 2020 (200604-N-OH637-1453)": https://commons.wikimedia.org/wiki/File:Overhead_view_of_USS_Gerald_R._Ford_(CVN-78)_and_USS_Harry_S._Truman_(CVN-75)_in_the_Atlantic_Ocean_on_4_June_2020_(200604-N-OH637-1453).JPG
- GlobalSecurity, CVN-68 design (angled deck 9 deg 03 min; island aft of elevators 1 and 2): https://www.globalsecurity.org/military/systems/ship/cvn-68-design.htm
- Wikipedia, Nimitz-class aircraft carrier (1,092 ft, 252 ft, 4 elevators, 3 wires on CVN-76/77): https://en.wikipedia.org/wiki/Nimitz-class_aircraft_carrier
- Wikipedia, Landing signal officer (LSO platform on the port side aft of the port elevator, wind deflector, escape net): https://en.wikipedia.org/wiki/Landing_signal_officer
- US Patent 5,287,104 (FLOLS display "adjacent and to the port side of the landing area"): https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5287104
- Wikipedia, Optical landing system: https://en.wikipedia.org/wiki/Optical_landing_system
- Smithsonian Air & Space, "The Meatball" (3.5 deg glideslope, 14.1 ft hook-to-ramp clearance, 12 cells): https://www.smithsonianmag.com/how-things-work/the-meatball-8421491/
- The War Zone, Ford island placement (140 ft further aft than Nimitz): https://www.twz.com/sea/why-the-ford-class-carriers-island-superstructure-is-located-so-far-back
- PPRuNe forum post (#1 wire removed on some Nimitz ships, giving a 3-cable system; weak source): https://www.pprune.org/11175056-post11.html
- DCS forum, IFLOLS vs ICLS (lens abeam the island; touchdown ~230 ft; weak source): https://forum.dcs.world/topic/237785-iflols-vs-icls/
- HeraldNet, USS Nimitz stats (elevator area 3,880 sq ft): https://www.heraldnet.com/news/the-uss-nimitzs-stats/
- Internal: docs/research/01-deck-geometry.md and docs/research/07-visual-reference.md (the contradicting values)
