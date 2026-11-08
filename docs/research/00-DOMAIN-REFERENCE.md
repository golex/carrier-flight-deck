# 00 - Domain Reference: Nimitz-class Flight Deck Operations (consolidated)

**What this is.** One deduplicated reference for building the simulation. It merges research files 01-08 and the gap fills 10-15 and resolves the conflicts between them. When this file and an older file disagree, **this file wins**. Go to the numbered files only for background and longer argument.

**Scope.** Nimitz class (CVN-68 to CVN-77). Jets only: F/A-18E/F Super Hornet ("Rhino") and EA-18G Growler. Cyclic operations: launch, recovery and respot.

**Confidence tags (used everywhere)**

| Tag | Meaning |
|---|---|
| **[DOC]** | Documented. A Navy manual (CVN Flight/Hangar Deck NATOPS 00-80T-120, NAVEDTRA ABE/ABH/ABF/Airman manuals, CNATRA), an official Navy release, or two or more independent sources that agree. |
| **[MEAS]** | Measured from orthorectified satellite imagery of CVN-77 at the pier, cross-checked on other hulls (file 15). About ±5 ft for sharp features unless the row says otherwise. |
| **[SRC]** | One secondary source: journalism, a practitioner or veteran account, a forum, or the DCS Supercarrier simulator guide (written with Navy SME input). |
| **[EST]** | Estimate derived for the simulation. Every [EST] number should be a tunable config value. |

---

## 0. Decision log: contradictions resolved

The critic flagged 25 contradictions. All are settled below; rows 26-33 settle further ones found during consolidation.

| # | Topic | Conflict | **Decision** | Basis |
|---|---|---|---|---|
| 1 | Named parking areas | The "point", "street", "patio", "corral" and "finger" were placed differently in 01, 05 and 06 | Use the **combat.ws + Hoggit naming** (two independent labeled diagrams agree; navysite.de mostly agrees). **Point** = starboard bow, forward of El 1. **Street** = fore-aft lane inboard of El 1, the corral and El 2. **Patio** = starboard quarter, aft of El 3. **Corral** = starboard deck-edge gap between El 1 and El 2. **Finger** = port side by El 4 (see §1.12). 01's "point" (the forward-port tip of the angle) has no sourced name. Here it is the **angle tip**. | File 10 (two diagrams + DCS + NATOPS "4 Row") |
| 2 | Combined launch rate | 20 s (01), 25-30 s (02), 45-60 s (06) | All three are right; they measure different things. **Burst, 4 cats, full queue: 20-25 s** between shots. **Event average: 40-60 s.** **Same cat: 75-100 s.** **12-jet day event: about 8-10 min first shot to last.** Night: **30 s legal floor**, about 45-60 s in practice. Model each cat bottom-up and let the deck rate emerge. | File 13 (PBS 1:45 per cat / 30 s combined [SRC]; Truman 2 per 37 s [SRC]; DCS 20 s [SRC]; Wikipedia 15 min per event; NATOPS 30 s night [DOC]) |
| 3 | Bow cats during recovery | 02: usable. 05/06/08: blocked by parked jets | **Legal but rarely used.** NATOPS expressly allows "simultaneous recovery and Catapult No. 2 operations" [DOC]. In practice the bow fills with recovered jets within minutes. **Sim default: bow cats idle during recovery.** Optional scenario: a straggler or tanker shot off cat 2 (or cat 1) in the first minutes of a recovery. | NATOPS 4.5; file 13 §5 |
| 4 | Arresting-gear deck-edge operator | Port catwalk (03) vs starboard (04) | **Starboard catwalk, aft.** | ABE ch. 3: "deckedge control station ... located on the starboard side aft" [DOC]. NATOPS 5.1.2: no one in the port catwalk during recovery except the LSOs [DOC] |
| 5 | Catapult deck-edge operator stations | 02 vs 04 | **Each in the catwalk outboard of its own cat.** Cat 1: starboard bow catwalk. Cat 2: port side (the angled-deck forward edge). Cats 3 and 4: port waist catwalk. | ABE ch. 4 [DOC]; NATOPS cat 2 exception and cat 3 JBD caution [DOC] (file 11) |
| 6 | Waist ICCS bubble | Port of cat 4 (01) vs between cats 3 and 4 (04) | **Between cats 3 and 4.** Bow bubble between cats 1 and 2. Both consoles face aft. | Trafficnews.jp; ABE ch. 4 "two adjacent catapults" [DOC] |
| 7 | Wire spacing | 40 / 40-50 / ~50 / 35-40 ft | **Measured 40 ft and 49 ft (±5) on CVN-77.** Use about 40-43 ft. | File 15 [MEAS] |
| 8 | Ramp to #1 wire | 175 / 143 / 150-200 ft | **177 ft** along the landing centerline on 4-wire ships. The 143 ft figure is a generic design default, not Nimitz. | File 15 [MEAS] + inference; matches the 175 ft forum figure in 01 |
| 9 | Foul-deck wave-off cutoff | 100 ft / 8 s (03), at 1/2 nm or more (04), 1/4-1/2 nm (08) | **If the deck is not clear when the jet reaches about 1/2 nm (about 15 s before touchdown), wave off.** The separate "pass at least 100 ft above the highest obstacle" rule is a clearance requirement that this cutoff satisfies. | NATOPS 1.7.24/5.1.2 via 04 and 13 [DOC]; the 8 s figure is a single forum post |
| 10 | Case III time window | 30 min before sunset to 30 min after sunrise (03) vs 1/2 h after sunset to 1/2 h before sunrise (08) | **1/2 hour after sunset to 1/2 hour before sunrise**, plus any time the weather is below Case II minima. | Navy weather-criteria table (tpub 14342A) cited by 08 [DOC]. 03 has the offsets reversed. |
| 11 | Case I bolter/wave-off climb | 1,200 ft (03, 08) vs about 600 ft (06) | **Case I: climb straight ahead, level at the 600 ft pattern altitude and turn downwind when the interval allows** (about 600-800 ft per the Boss). **Case III: climb straight ahead to 1,200 ft** and take CATCC vectors. 03 and 08 do not separate the two cases. Every source puts the Case I downwind at 600 ft, and 08 itself gives "day: re-enter downwind at 600-800 ft". **Flagged uncertain.** | 06, 08 §7.1; Case III rule [DOC] |
| 12 | Time a bolter or wave-off adds | 2.5-4 / 1.5-3 / 3-6 min | **Case I bolter about 2.5 min (range 1.5-4). Case I wave-off about 2 min. Case III, either one: 4-6 min.** All [EST]. | Overlap of 03, 06 and 08 |
| 13 | Cycle phase durations | Respot 30-60 min; launch 12-20 min; recovery 12-30 min | **1+30 cycle: launch about 8-10 min first to last shot (about 15 min including the taxi-out); waist secure and green deck 1-2 min; recovery about 12-15 min for 12 jets; then about 65-70 min from the last trap to the next first shot.** The last ~30 min of that gap overlap man-up, start and taxi, so the **active respot (tows, elevators) takes about 35-45 min**. | navy.mil "re-spotted in 60 min, launched in 15" [DOC]; 13 calibration; 06 timeline |
| 14 | Elevator capacity | 105,000 / 130,000 / 75,000 lb | **47 long tons (about 105,000 lb), two jets per lift.** The 75,000 lb figure is almost certainly Tilly's main hoist (75,000 lb [DOC]) mistaken for elevator capacity. 130,000 lb is unsourced. Two Super Hornets at landing weight (about 2 × 44,000 lb) fit inside 105,000 lb. | losbarcosdeeugenio [SRC]; "two aircraft" [DOC] |
| 15 | Landing area width | 110 ft (01) vs 120 ft (07, Wikipedia) | **Painted strip: 59 ft between the inner ladder lines, about 75 ft between the outer ladders [MEAS].** The must-be-clear zone between the foul lines is about 95 ft (centerline ±47 ft) [EST]. At the waist it runs to the port deck edge, about 120-140 ft. Wikipedia's 120 ft is that whole clear zone. | File 15 |
| 16 | JBD geometry | 50 deg / 36 × 10.7 ft (01) vs 45-50 deg (02) vs about 60 deg / 35-40 × 14 ft (07) | **Mk 7 Mod 0/2: 6 panels, 36 ft wide, raises to 50 deg, raised height 10.7 ft.** The lowered panel footprint is **14 ft fore-aft** (10.7 / sin 50°). That is where 07's "14 ft" comes from. 07's 60 deg is a guess. | Navy SBIR N192-100 + tpub NAVAIR TM [DOC] |
| 17 | Lens (IFLOLS) position | 420 ft fwd of ramp (01, 07) vs "abeam the wire set" (03) | **X ≈ 385 ft (range 350-420), port deck edge at Y ≈ -132**, roughly abeam the aft half of the island and 100-160 ft forward of the target wire. "Abeam the wires" describes the **LSO platform**, not the lens. | File 15 [MEAS candidate + glideslope geometry] |
| 18 | Deck coordinates | 01 vs 07 (island 120 ft apart, waist cats parallel to the angle) | **Use file 15's measured anchors.** 01 put the island and elevators 80-150 ft too far forward. 07 put the island and waist cats 100-150 ft too far forward. The waist cats are **not** parallel to the angle: cat 4 is parallel to the keel and cat 3 is toed 4.3° to port. | File 15 [MEAS] |
| 19 | Tie-down padeye grid | 6-10 ft (01) vs 4-5 ft (05) | **Render as rows about 10 ft apart, alternate rows offset 5 ft** (01, from a Midway measurement [SRC]). 05's 4-5 ft is an unsourced estimate. This is cosmetic only. | 01 [SRC] |
| 20 | Intake danger radius at idle | 9 ft (05) vs 25 ft (08) | **Use 25 ft as the keep-out radius for crew pathing** (Naval Safety Center *Flight Deck Awareness*: "at least 25 ft from all intakes" [DOC]). The EAWS study-deck danger radius (9 ft idle, 25 ft MIL) can be an optional inner ring. | 08 [DOC] beats 05 [SRC] |
| 21 | Wing-fold duration | 15-20 s (03) vs about 12 s (05) | **About 12 s (range 10-15 s).** | 05 (Navy wing-fold text plus footage) [SRC/EST] |
| 22 | Pri-Fly height | About 7 stories / O-10 (01, 06) vs about 6 decks above the flight deck (04) | **Consistent.** The flight deck is the 04 level, so Pri-Fly at the 010 level is **6 levels above the deck**, the "7th story" counting the deck itself. | FAS "seven stories" [DOC] |
| 23 | Three-wire Nimitz ships | 4 wires (01) vs "some reconfigured to 3" (06) | **CVN-76 and CVN-77 have 3 wires [DOC]. Treat CVN-68 to 75 as 4-wire** (default). Offer a 3-wire toggle. Removal of the #1 wire on older hulls is a single forum claim. | Wikipedia [DOC]; PPRuNe [SRC] |
| 24 | Shooter's afterburner (CRT) signal | Open palm pushed up (02) vs both arms overhead (04) | **Open hand pushed upward ("raise the roof")**; night: green wand. 04 cites the same FighterSweep pilot account, so it is not independent support for "both arms". | 02 [DOC/SRC] |
| 25 | First launcher of an event | Recovery tanker off cat 1 (06) vs the LA jets from the waist cats (05) | **Both pairs start together.** The **first shot is the recovery tanker (default cat 1)**, and the waist pair begins draining the jets spotted in the landing area within seconds. The waist queue is the **critical path** to the next recovery. | File 13 §6 (Safety Command account [SRC] + sim + doctrine logic) |
| 26 | Island and elevator positions | 01: island X 410-560 | **Island X 290-435; E1 591-661; E2 439-509; E3 182-251; E4 about 145-215 (port).** | 15 [MEAS] |
| 27 | Landing centerline at the ramp | Y +5 (01) | **Y +18.6 ft (starboard of the ship centerline), 9.0° to port.** | 15 [MEAS] |
| 28 | LSO platform | X 150-185, Y -100/-120 (01) | **X 115-135, Y -66 to -82**, aft of El 4 at the port quarter. | 15 [MEAS candidate] + Wikipedia LSO [DOC] |
| 29 | El 4 during recovery | "In the landing area, not used" (01, 14) vs DCS parks recovered jets there (10) | **The El 4 platform lies just outboard of the port foul line, so jets may park on it during recovery. The elevator is not cycled during recovery** (NATOPS pre-recovery: elevators up and locked). | 15 [MEAS], 10, 08 [DOC] |
| 30 | Six-pack heading | Nose to the foul line (DCS) vs exhaust to port (NATOPS) | **Recovery: heading about +45 (nose forward-starboard, tail toward the LA).** **Launch spot: spun to about -135.** | 10 (NATOPS de-arm wording [DOC]) |
| 31 | Bow pack heading | Nose aft (10) vs nose forward (Dengeki) | **Nose aft (heading 180) for the centre columns.** Edge rows sit tail over the edge. Both are documented; nose-aft simplifies the respot. | 10 [EST choice] |
| 32 | Recovery parking fill order | DCS "stern toward bow" vs bow-first (photos, Wikipedia) | **Bow first, front to back, then the deck-edge row, six-pack last.** The DCS order is a game convenience. | 12 [DOC/photo] |
| 33 | Flight deck area | 4.5 acres (documented) vs the measured outline | The measured outline below encloses about 221,600 sq ft (5.1 acres), because it includes the deck-edge elevator platforms and sponsons. Keep the measured outline. | 15 [MEAS] |

---

## 1. Deck geometry

### 1.1 Frames

- **Primary frame (used throughout this file):** **X** = feet forward of the stern ramp (aft edge of the flight deck), measured along the keel, 0 to 1092. **Y** = feet from the ship centerline, **positive to starboard**. This is the frame of files 01, 10-15.
- **Ship-centred frame:** **xc = X - 546** (origin at mid-length on the centerline; xc runs -546 at the ramp to +546 at the bow). **yc = Y.** The main geometry tables give both.
- **Heading convention:** degrees from +X (bow) toward +Y (starboard). 0 = nose to the bow, +90 = nose to starboard, -90 = nose to port, 180 = nose aft.
- Screens usually have Y pointing down. Flip Y once in the renderer and keep the data in this frame. Put all of §1 in one JSON config with tags.
- Converting legacy files: 07 used x measured aft of the bow, so X = 1092 - x07. **Do not reuse 01's or 07's anchor coordinates.**

### 1.2 Overall dimensions

| Item | Value | Tag |
|---|---|---|
| Length overall (flight deck) | 1,092 ft (332.8 m). CVN-68 to 70 are sometimes quoted at 1,088 ft | [DOC] |
| Max width (published) | 252 ft. Measured at one station: about 248-250 ft at X 600-650 | [DOC]/[MEAS] |
| Y envelope | -142 (angle tip) to +120 deck edge (+125 island/hull side) | [MEAS] |
| Waterline length / beam | 1,040 ft / 134 ft | [DOC] |
| Deck height above waterline | about 60 ft | [EST] |
| Angled deck | **9.0° to port** (published 9°03') | [DOC]/[MEAS] |
| Landing CL length, ramp to deck exit | about 796 ft (exits at X 786, Y -106) | [MEAS] |

### 1.3 Deck outline polygon (clockwise from the ramp's port end)

| # | X | Y | xc | Note |
|---|---|---|---|---|
| D1 | 0 | -60 | -546 | Ramp, port end |
| D2 | 140 | -66 | -406 | Port quarter edge (LSO platform hangs outboard here) |
| D3 | 150 | -128 | -396 | Aft end of the port sponson (raked edge) |
| D4 | 739 | -142 | 193 | **Angle tip**: forward-port corner of the angled deck (port extreme) |
| D5 | 842 | -63 | 296 | Inner end of the angled deck's forward edge (crotch corner) |
| D6 | 1092 | -48 | 546 | Bow tip, port |
| D7 | 1092 | 42 | 546 | Bow tip, starboard |
| D8 | 850 | 65 | 304 | Starboard bow taper ends |
| D9 | 770 | 120 | 224 | Starboard bow taper begins |
| D10 | 180 | 120 | -366 | Starboard edge, aft end of the straight run (El 3 to El 1 sit in it) |
| D11 | 73 | 97 | -473 | Starboard quarter step-out, top |
| D12 | 56 | 66 | -490 | Starboard quarter step-out, bottom |
| D13 | 0 | 67 | -546 | Ramp, starboard end |

All [MEAS] (CVN-77; the angled-deck corner was confirmed on a second hull to within 3 ft). The island's outboard face and the hull side reach Y +125.

### 1.4 Landing area (LA), foul lines and markings

| Item | Equation / value | xc form | Tag |
|---|---|---|---|
| Landing centerline (CL) | **Y = 18.6 - 0.158 X**. A point at distance s along the CL: X = 0.9877 s | Y = -67.7 - 0.158 xc | [MEAS] |
| CL at the ramp / deck exit | (0, +18.6) / (786.4, -105.7) | (-546, 18.6) / (240.4, -105.7) | [MEAS] |
| Unit vectors | forward along CL f = (0.9877, -0.1561); starboard-perpendicular r = (0.1561, 0.9877) | same | derived |
| Inner ladder lines (edges of the painted strip) | CL ± 30 ft perpendicular, i.e. Y = CL ± 30.4 | | [MEAS] |
| Outer ladder lines | CL +41 / -34 ft | | [MEAS] |
| Ladder rungs | white crossbars about 10 ft long, about every 50 ft | | [EST] |
| CL marking | white dashed (dash 20 ft / gap 20 ft), with flush white centerline lights | | [DOC] white dashed; spacing [EST] |
| Ramp athwartship marking | white line across the aft end of the LA | | [DOC] (FCLP standard) |
| **Starboard foul line** (red/white stripes, "safe parking line") | **Y = 66.2 - 0.158 X** (CL + 47 ft). Runs from the starboard stern corner (0, 66.2) to the crotch (837.9, -66.2) | Y = -20.1 - 0.158 xc | Marking [DOC]; offset [EST]: it fits the outer ladder (+41) plus margin, and it lands exactly on the stern corner and the crotch, as 01 describes |
| **Port foul line** | **Y = -29.0 - 0.158 X** (CL - 47 ft), used aft of X 300 only | Y = -115.3 - 0.158 xc | [EST] (combat.ws shows a port foul line with El 4 outboard of it) |
| Touchdown aim point | s ≈ 230 ft → (227.2, -17.3) | (-318.8, -17.3) | [DOC] 3.5° slope and 14.1 ft hook-to-ramp clearance (Smithsonian) |
| Tire smear (wear band) | X 200-360 along the CL, heaviest at X 220-300 | | [MEAS] |
| Bolter exit | Along the CL off the deck at (786, -106), between the angle tip and the crotch | | [MEAS] |
| Hull number | large white numerals at the bow; possibly also at the aft LA | | [SRC]/[EST] |
| Glideslope | 3.5° (lens set about 3.25-4.0° with wind and deck motion) | | [SRC] |

**Must-be-clear landing-area polygon** (nothing may be inside it during recovery except authorized arresting-gear and crash crew):

| # | X | Y | xc | Note |
|---|---|---|---|---|
| LA1 | 0 | 66.2 | -546 | Starboard foul line at the ramp |
| LA2 | 837.9 | -66.2 | 291.9 | Starboard foul line meets the angled-deck forward edge |
| LA3 | 739 | -142 | 193 | Angle tip |
| LA4 | 300 | -131.6 | -246 | Port sponson edge at X 300 (the whole waist out to the port edge is LA) |
| LA5 | 300 | -76.4 | -246 | Port foul line at X 300 |
| LA6 | 0 | -29.0 | -546 | Port foul line at the ramp |

The polygon encloses about 86,000 sq ft. It contains cats 3 and 4, JBDs 3 and 4 and the whole waist. **El 4, the "finger" and the LSO platform lie outside it, port of the port foul line.** [EST built on MEAS]

Foul-line Y values for quick checks (X → starboard foul / CL / port foul): 0 → 66.2 / 18.6 / -29.0; 100 → 50.4 / 2.8 / -44.8; 200 → 34.6 / -13.0 / -60.6; 300 → 18.8 / -28.8 / -76.4; 400 → 3.0 / -44.6 / -92.2; 500 → -12.8 / -60.4 / -108.0; 600 → -28.6 / -76.2 / -123.8; 700 → -44.4 / -92.0 / -139.6; 800 → -60.2 / -107.8 / off deck.

### 1.5 Arresting gear (Mk 7 Mod 3)

Each pendant is perpendicular to the CL. The visible pendant between the deck terminals is about 64 ft long; endpoints are the centre ± 32 ft along r. The terminal fittings angle a further ~25 ft outboard and aft at each end [MEAS]. Draw the wires as thin lines (#C9CCCF) with small end sheaves.

**4-wire ships (CVN-68 to 75, default).** Target = **#3**.

| Wire | s along CL (ft) | Centre (X, Y) | Starboard end | Port end | Centre xc | Tag |
|---|---|---|---|---|---|---|
| #1 | 177 | (174.8, -9.0) | (179.8, 22.6) | (169.8, -40.6) | -371.2 | [MEAS-inferred] |
| #2 | 217 | (214.3, -15.3) | (219.3, 16.3) | (209.3, -46.9) | -331.7 | [MEAS] |
| #3 (target) | 257 | (253.9, -21.5) | (258.8, 10.1) | (248.9, -53.1) | -292.1 | [MEAS] |
| #4 | 300 | (296.3, -28.2) | (301.3, 3.4) | (291.3, -59.8) | -249.7 | [MEAS] |

**3-wire toggle (CVN-76, CVN-77).** s = 217 / 257 / 306. The target is **#2**, at s 257 (the same physical spot as the 4-wire #3). The CVN-77 #3 sits at centre (302.3, -29.2), ends (307.2, 2.5) / (297.3, -60.8).

| Gear fact | Value | Tag |
|---|---|---|
| Pendant | 1-3/8 in wire rope (1 to 1-3/8 in in use), held a few inches up on leaf-spring supports | [DOC] |
| Engines | 1 hydro-pneumatic engine per wire, below deck (about 43 tons each), plus a barricade engine | [DOC] |
| Rated runout | stops 50,000 lb at 130 kt in 344 ft, about 2 s | [DOC] |
| Weight setting | Constant Runout Control Valve set per aircraft from the Aircraft Recovery Bulletin. Reported as e.g. "ALL ENGINES SET THREE SIX ZERO, HORNET" | [DOC] |
| Pendant life / change | replaced every 125 arrestments; a change takes about 2-3 min | [DOC]/[SRC] |
| Reset after a trap | as little as about 35 s | [SRC] (Smithsonian) |
| Barricade (emergency only) | nylon net about 20 ft high between 2 hydraulic stanchions at the LA edges forward of #4. Sim: stanchions at s ≈ 340, at CL ± 50 ft → (343.6, 14.9) and (328.0, -83.9) | [DOC] presence; position [EST] |

### 1.6 Catapults (C-13 steam)

Cat 1: bow starboard. Cat 2: bow port. Cat 3: waist inboard. Cat 4: waist outboard. **The waist pair lies inside the LA.** Track strips are 339-346 ft long [MEAS]. The shuttle start (battery / launch position, nose gear) is **10 ft forward of the strip's aft end**. The power stroke is **310 ft** (C-13-1: 309 ft 8.75 in; C-13-2: 306 ft 9 in) [DOC].

| Cat | Strip aft end (X, Y) | Strip fwd end | Heading (° vs keel) | **Shuttle start (battery)** | **End of stroke** | Start xc | End xc | Tag |
|---|---|---|---|---|---|---|---|---|
| 1 | (731, 56) | (1074, 25) | -5.16 (5.2° to port) | **(741.0, 55.1)** | **(1049.7, 27.2)** | 195.0 | 503.7 | [MEAS] |
| 2 | (726, -16) | (1072, -25) | -1.49 | **(736.0, -16.3)** | **(1045.9, -24.3)** | 190.0 | 499.9 | [MEAS] |
| 3 | (411, -71) | (755, -97) | -4.32 | **(421.0, -71.8)** | **(730.1, -95.1)** | -125.0 | 184.1 | [MEAS] |
| 4 | (357, -110) | (696, -110) | 0.00 (parallel to the keel) | **(367.0, -110.0)** | **(677.0, -110.0)** | -179.0 | 131.0 | [MEAS] |

- Both pairs **converge going forward**: cats 1 and 2 are 72 ft apart aft and 50 ft at the bow; cats 3 and 4 are 39 ft apart aft and 13 ft forward. The waist cats therefore cannot launch side by side the way the bow pair can [MEAS].
- Cat 3 lies inside the painted landing band along its whole length. Cat 4 enters the band at about X 515-600. Both are locked out during recovery [MEAS/DOC].
- Track parts to draw: the shuttle slot (a dark line plus a white shot line); the shuttle (a small block); the lead-in **wye** about 10-20 ft aft of battery; the holdback buffer fitting just aft of the shuttle; the water brakes at the forward end; yellow lead-in lines curving in behind each JBD [DOC parts / EST markings]. **No bridle-catcher ramps** on a modern Nimitz deck [DOC].
- White cat numbers 1-4 near the aft end of each track [EST].
- Catapult data: 80,000 lb at 140 kt rated (C-13-1); about 1,200 lb of steam per shot; shuttle plus pistons weigh 6,350 lb [DOC/SRC].
- **Safe-shot lines** (painted, alongside each cat): a cat may fire only when nothing is on its side of its line. Sim offset about **35-40 ft from the cat's centerline** [DIAG/EST].

### 1.7 Jet blast deflectors (JBDs)

Each JBD is a **36 ft wide × 14 ft** (fore-aft, lowered) panel set flush in the deck, perpendicular to its cat. Its **hinge is the forward edge**, about 52 ft aft of the shuttle start. When raised, the panel leans aft at **50°** and stands **10.7 ft** high. Mk 7 Mod 0/2 has 6 water-cooled panels worked in pairs (Mod 1 has 4 panels, about 24 ft wide) [DOC sizes; EST placement].

| JBD | Hinge centre (X, Y) | Aft-edge centre | Hinge xc | Measured box for cross-check [MEAS] |
|---|---|---|---|---|
| 1 | (689.2, 59.8) | (675.2, 61.0) | 143.2 | X 660-687, Y +42 to +78 |
| 2 | (684.0, -14.9) | (670.0, -14.5) | 138.0 | X 655-675, Y -30 to +15 |
| 3 | (369.1, -67.8) | (355.2, -66.8) | -176.9 | X 355-370, Y -51 to -70 (low confidence) |
| 4 | (315.0, -110.0) | (301.0, -110.0) | -231.0 | X 292-308, Y -96 to -123 |

Rules [DOC]:
- Raise the JBD only once the jet's tail has cleared the panel arc.
- Lower it after the shot, then allow about 10-20 s of cooling before tires roll over it.
- Never park a jet on a panel.
- Jets may taxi over lowered panels.
- Mark jet-blast danger zones with red diagonal hatching aft of each JBD [SRC].

### 1.8 Island and superstructure

| Feature | X | Y | xc | Tag |
|---|---|---|---|---|
| Island footprint polygon | (290,80) (290,120) (435,120) (435,63) (395,63) (395,80) | | -256 / -111 / -151 | [MEAS] ±10 ft |
| Island length / centre | about 145 ft / X ≈ 362 (one third of the length from the stern) | | | [MEAS] |
| Forward block (mast base) | X 395-435, reaches Y +63 | | -151 to -111 | [MEAS] |
| **Pri-Fly** (Air Boss) | aft/port face, X ≈ 300-360, about 6 levels up (010 level), glass facing aft and port | | -246 to -186 | [DOC] function; [EST] X |
| Vultures' Row | balconies just below Pri-Fly | | | [DOC] |
| Navigation bridge | forward-facing, upper island | | | [DOC] |
| **Flight Deck Control** (Handler, Ouija board) | island base, flight-deck level, window to the deck, about (360, +82) | | -186 | [DOC] function; [EST] spot |
| Rotating beacon(s) | island, separate fore and aft beacons: red = deck closed, amber, green = launch/land cleared | | | [DOC] |
| Gap: island fwd end to E2 | about 4 ft (435 → 439) | | | [MEAS] |
| Gap: E3 to island (junkyard notch) | 39 ft (251 → 290) | | | [MEAS] |

### 1.9 Elevators

Four deck-edge elevators of about 3,880 sq ft each, 47 long tons (about 105,000 lb), **2 jets per lift**. One-way travel takes about 15-20 s; a full cycle with tows, stanchions and nets takes 3-5 min [DOC area / EST times]. Each elevator has a perimeter of red/yellow hazard striping [SRC].

| Elevator | X (fore-aft) | Y (inboard to outboard) | xc | Size | Tag |
|---|---|---|---|---|---|
| E1 (stbd, fwd) | 591-661 | +65 to +120 | 45 to 115 | 70 × 55 | [MEAS] |
| E2 (stbd, fwd of island) | 439-509 | +65 to +120 | -107 to -37 | 70 × 55 | [MEAS] |
| E3 (stbd, aft of island) | 182-251 | +63 to +120 | -364 to -295 | 69 × 57 | [MEAS] |
| E4 (port, aft; trapezoid) | (145,-68) (215,-68) (215,-128) (150,-128) | -68 to -128 | -401 to -331 | about 65 × 60 | [MEAS] ±20 in X |

- Warning horn: **3 blasts before each cycle, continuous while moving**. Stanchions go up first. Each elevator is manned by **1 director + 1 operator** per level [DOC].
- **The cat 1 next-jet waiting slot overlies E1's inboard half.** E1 jets are therefore the first cat-1 launchers or must be clear in the launch spot [EST].

### 1.10 Other fixed features

| Feature | Position (X, Y) | xc | Notes | Tag |
|---|---|---|---|---|
| **LSO platform** | X 115-135, Y -66 to -82 (centre 125, -74) | -431 to -411 | Hangs outboard of the port quarter edge. Wind screen, escape net/pit. **At most 6 people.** About 40-60 ft aft of wire #1 | [MEAS candidate]/[DOC] side |
| **IFLOLS ("lens", "ball")** | **(385, -132)**, port deck edge, facing aft | -161 | Range X 350-420. The LSO's sightline to the lens runs about 260 ft forward along the port edge | [MEAS candidate + geometry] |
| Drop line | (0, +18.6), a vertical row of lights down the stern on the CL extension | -546 | 3-6 red/amber lights | [DOC] |
| ICLS azimuth antenna | stern, near the CL | | | [SRC] |
| **Bow ICCS bubble** | (760, +18), between cats 1 and 2, about 20 ft forward of battery | 214 | About 8 ft glass-topped dome, console faces aft. Green MIL / amber CRT deck lights for cat 1 are on it; cat 2's are at the forward deck edge left of battery | [DOC] position logic; [EST] coords |
| **Waist ICCS bubble** | (440, -92), between cats 3 and 4 | -106 | Cat 3/4 deck lights on it. Lowered and locked for recovery ("WAIST BUBBLE DOWN AND LOCKED") | [DOC]/[EST] |
| Bow centerdeck console hatch | (745, +19) | 199 | Centerdeck operator's station (anemometer) | [EST] |
| Waist centerdeck console hatch | (400, -92) | -146 | Closed and dogged for recovery | [EST] |
| Suspend lights | red flashing, at the deck edge near each battery | | | [DOC] |
| **Tilly** (A/S32A-35A crash crane) | (270, +100), junkyard, heading 180; footprint about 40 × 16 ft | -276 | Main hoist 75,000 lb. Started at every recovery and kept running. **No Tilly, no flight ops.** | [DOC] function; [EST] spot/size |
| P-25 fire truck (MFFV) | (280, +52), nose toward the LA | -266 | 750 gal water + 60 gal AFFF, 3 crew | [DOC] truck; [EST] spot |

### 1.11 Fly zones

| Zone | X range | xc range | Contents | Safety owner | Tag |
|---|---|---|---|---|---|
| **Fly 1** (bow) | X ≥ 660 | xc ≥ 114 | Cats 1/2, JBDs 1/2, the point, bow rows, crotch, E1 forward half | Fly 1 officer / bosun | [DOC] concept; [EST] line |
| **Fly 2** (waist / midships) | 300 ≤ X < 660 | -246 ≤ xc < 114 | Cats 3/4, island, six-pack, street, corral, E1/E2, de-arm stop | Flight Deck Officer (V-1) | [DOC]/[EST] |
| **Fly 3** (aft) | X < 300 | xc < -246 | Wires 1-4, ramp, E3, E4, patio, finger, LSO platform, fantail | Arresting Gear Officer | [DOC]/[EST] |

Each zone has its own yellow-shirt team [DOC].

### 1.12 Parking and deck areas (nicknames)

All the names are informal handler slang that varies by ship [DOC]. Polygons are [EST], fitted to the measured anchors and the sourced relative order. Starboard edge, bow to stern: **Point → E1 → Corral → E2 → Island → Junkyard → E3 → Patio → Stern.** Port side: **Four Row → Crotch → Cats 3/4 → JBDs 3/4 → Finger → E4 → LSO platform.**

| Area | Polygon vertices (X, Y) | Use | R / L | Confidence |
|---|---|---|---|---|
| **Bow** ("the rows"; **One Row** = stbd of cat 1, **Two Row** = port of cat 1, **Three Row** = stbd of cat 2, **Four Row** = port of cat 2) | (700,-44.4) (837.9,-66.2) (842,-63) (1092,-48) (1092,42) (850,65) (810,80) (700,80) | Main recovery pack. Blocks cats 1/2 when full | R | High (names); EST geometry |
| **Box** | (700,-16) (760,-16) (760,55) (700,55) | Between the aft ends of cats 1/2, around the bow bubble. Recovery taxi route passes through here, between the lowered JBDs | lane | Medium |
| **Point** (starboard bow) | (661,80) (661,120) (770,120) (810,98) (810,80) | QRA/alert parking. Must be outboard of cat 1's safe-shot line while cat 1 fires. In measured geometry cat 1 is close to this edge, so point jets sit only when cat 1 is idle or they are its next launchers | RL | Medium |
| **Crotch** | (800,-25) (800,-60.2) (837.9,-66.2) (842,-63) (900,-59.5) (900,-25) | Inside corner where the angle's forward edge meets the port bow; aft end of Four Row | R | High |
| **Corral** | (509,65) (509,120) (591,120) (591,65) | Deck-edge gap between E2 and E1; 2 jets, tail over the edge | RL | Medium (navysite variant: the whole area in front of the island) |
| **Street** | lane X 450-700 between the six-pack's outer edge (≈ starboard foul line + 68) and the E1/corral/E2 spots (Y +65) | Taxi lane and **fire-vehicle access lane (NATOPS: keep an access route)**. Overflow parking only on a locked deck. **When the six-pack and elevator spots are full it pinches to under 30 ft abeam E2**, so fill the six-pack last | lane | Medium (navysite variant: between cats 1/2) |
| **Six-pack** ("fighter row") | (445,-2) (690,-41) (690,33) (445,62) | Row of jets along the starboard foul line in front of the island. De-arm and hot-pump area. Feeds cats 2/3 | RL | High (name); EST layout |
| **Hummer hole** | (300,47) (395,47) (395,80) (300,80) | Inboard of the island. Normally E-2s; one jet in a jet-only sim | RL | Low (one source) |
| **Junkyard** | (251,40) (300,40) (300,80) (290,80) (290,120) (251,120) | Between E3 and the island: Tilly, P-25, tractors, hot-chocks crew | equipment | High |
| **Patio** | (60,57) (182,37) (182,120) (73,97) (56,66) | Starboard quarter aft of E3, starboard of the foul line | RL | High |
| **Stern / fantail** | X 0-60 across the ramp | **Inside the LA**: launch-spot only. These jets go first, off the waist cats | L | High |
| **Waist** | the LA between X 300 and the angle tip | Cats 3/4 and their queues. Launch only | L | High |
| **Finger** | (215,-70) (290,-75) (290,-131) (215,-130) | 1 jet. Sources put it "aft of El 4", but the measured sponson ends at El 4. Here it is the strip between E4 and JBD 4. **It is also the cat 4 next-jet slot during a launch** | RL | Low (relocated) |
| **E4 platform** | see §1.9 | 2 jets during recovery (outboard of the port foul line); not cycled | RL | Medium |
| **Angle tip** (unnamed; 01's "point") | around (739,-142) | Inside the LA; not a parking area | - | - |
| **De-arm area** | centre about (645,-5), along the foul line forward of the waist cats; nose toward the starboard edge | Forward-firing ordnance safed here; a clear 30 ft lane ahead of the nose to the deck edge | stop | Medium [DOC wording] |

### 1.13 Parking slots

Each slot is the centre of a **folded footprint, 60.3 × 30.5 ft**. All slots were collision-checked with shapely against the measured outline, island, JBDs, Tilly and each other (≥ 1 ft clearance). The forward 40 ft of every jet is on deck; tails may overhang the edge, noses may not. Every R slot is ≥ 2 ft outside the LA polygon. Flags: **R** = occupied in the full recovery spot. **L** = usable in the launch spot. All [EST].

| Slot | Area | X | Y | Hdg | Flag | Notes |
|---|---|---|---|---|---|---|
| B1S | Bow One Row (tip) | 1068 | 16 | 180 | R | Tail overhangs the bow tip. Fill first |
| B1P | Bow Four Row (tip) | 1068 | -17 | 180 | R | |
| B2S / B2C / B2P | Bow, 3 columns | 1005 | 33 / 0 / -33 | 180 | R | Columns over the cat tracks (cats idle) |
| B3S / B3C / B3P | Bow | 942 | 33 / 0 / -33 | 180 | R | |
| B4S / B4C / B4P | Bow | 879 | 33 / 0 / -33 | 180 | R | |
| B5S / B5C / B5P | Bow (B5P = crotch) | 816 | 33 / 0 / -33 | 180 | R | Fill last of the bow |
| PT1 | Point | 708 | 104 | -90 | RL | Nose inboard, tail 14 ft over the edge |
| PT2 | Point | 742 | 104 | -90 | RL | |
| E1A / E1B | El 1 | 608 / 643 | 96 | -90 | RL | Must be empty when E1 cycles, and in the launch spot (cat 1 queue) |
| CO1 / CO2 | Corral | 531 / 567 | 96 | -90 | RL | |
| E2A / E2B | El 2 | 456 / 491 | 96 | -90 | RL | |
| SP1 | Six-pack (also the **de-arm stop**) | 640 | 1.1 | +45 | RL | Leave it empty until the last traps. In the launch spot it is the cat 2 feeder |
| SP2 | Six-pack | 597 | 7.9 | +45 | RL | Launch spot: spin to -135 |
| SP3 | Six-pack | 554 | 14.7 | +45 | RL | |
| SP4 | Six-pack | 511 | 21.5 | +45 | RL | |
| SP5 | Six-pack | 468 | 28.3 | +45 | RL | Pinches the street |
| HH1 | Hummer hole | 362 | 63 | 180 | RL | Along the island's inboard face |
| E3A / E3B | El 3 | 199 / 234 | 96 | -90 | RL | |
| PA1 / PA2 | Patio | 150 / 113 | 97 / 90 | -62 | RL | Canted; tail over the starboard quarter |
| E4A / E4B | El 4 | 163 / 197 | -99 | +90 | RL | Nose inboard (starboard), tail over the port edge |
| FI1 | Finger | 258 | -105 | +90 | RL | Doubles as the cat 4 queue slot |
| FT1 / FT2 / FT3 | Stern | 28 | -38 / 0 / +38 | 0 | L | Inside the LA. Tail over the ramp. Launch first (cats 3/4) |

- **Totals:** 35 R slots (the full recovery spot; add 2-4 canted bow-tip jets to reach about 38-40). 24 L slots plus 4 on the cats plus 4 queued behind the JBDs.
- **Deck load:** air wing about 44 F/A-18E/F + 6 EA-18G. About 36-42 on deck, the rest in the hangar. 12-16 jets per event [EST from DOC wing composition].
- **Heading rules:** at deck-edge spots the nose is inboard and the tail over the edge; perpendicular at straight edges, canted 30-45° at curves. Deck-edge spots are reached by **tractor push-back, tail first**. NATOPS allows high-power turn-ups only with the tailpipe over the deck or elevator edge [DOC].

### 1.14 Catapult feeds and launch queues

| Cat | Next-jet waiting slot (nose 10-20 ft aft of the JBD aft edge, wings **spread**) | Fed from (primary) | Notes |
|---|---|---|---|
| 1 | nose ≈ (660, 62), centre ≈ (630, 64), hdg -5 | PT1-2, E1A/B, CO1-2, recovery tanker spot | Overlies E1. **Recovery tanker is the first shot of the event (default cat 1).** |
| 2 | nose ≈ (655, -14), centre ≈ (625, -13), hdg -1.5 | SP1-3, E2A/B, bow rows beside an unused cat 1 | |
| 3 | nose ≈ (340, -66), centre ≈ (310, -64), hdg -4 | SP4-5, HH1, E3A, PA1, FT2-3 | **While cat 4 is loaded, the cat 3 jet is held aft of JBD 3** [DOC]. That is why two jets are often seen waiting side by side at the waist. |
| 4 | nose ≈ (286, -110), centre ≈ (256, -110), hdg 0 | FI1, E4A/B, E3B, PA2, FT1 | The finger slot is this queue slot |

- **Launch order:** LA-fouling jets (stern, waist) go off cats 3/4 first. The **last waist shot "clears the angle"** for the recovery.
- **Partial bow pack:** with only cat 2 in use, One and Two Row (starboard of cat 2's safe-shot line) can stay packed. With only cat 1 in use, Three and Four Row can stay [DIAG/EST].

### 1.15 Routes and director nodes

**Recovery exit (3-wire trap, 4-wire ship)** [EST from DOC runout and procedure]:

| Point | Position | Notes |
|---|---|---|
| Touchdown | (227, -17) | s ≈ 230 |
| Wire #3 engaged | (254, -21.5) | |
| Stop (hook) | s ≈ 572 → (565, -71) | Rollout about 315 ft, then rollback about 5 ft |
| Stop (jet centre / nose) | (583, -73.5) / (609, -78) | Heading -9°. The jet sits across the dead waist cat tracks |
| Foul-line crossing | about (635, -34) | Hard right turn at 40-60°. Wings fold on the move. Tail clear ≈ 110-135 ft of travel, **25-30 s after the stop** |
| De-arm stop (if flagged) | (645, -5), hdg +75 | 30-90 s. Nose over the side, exhaust blowing to port across the foul line |
| Through the Box | (700, +20) → (760, +20) | Passes between the lowered JBDs 1 and 2 (gap Y +3 to +42, about 39 ft; a folded jet is 30.5 ft) or rolls over a lowered panel |
| Up the bow | centerline to the slot, X 760 → 1068 | 5-7 ft/s |
| Spin into the slot | pivot at 1-3 ft/s; tractor push for tight spots | |

Wires to the bow spot is about 450-550 ft and takes **about 2-4 min** including a de-arm stop.

**Recovery director chain** [EST]:

| # | Director | Stands at | Hands off at |
|---|---|---|---|
| 1 | Gear puller (Fly 3) | before the trap (655, -30), facing aft; after the stop (650, -65), at the pilot's 1 o'clock | the foul line |
| 2 | Fly 2 director | (665, -10) | the de-arm stop / the Box |
| 3 | Box director | (740, +20) | about 100 ft up the bow |
| 4 | Fly 1 bow director | (900, 0) | the slot |
| 5 | Spot director | the slot | hands the jet to the plane captain |

**Launch routes** [EST]:

| Route | Path | Distance | Directors | Time to the JBD slot |
|---|---|---|---|---|
| Six-pack → cat 2/3 | pull out, spread in the open | 50-300 ft | 1-2 | 1-3 min |
| E1/corral/point → cat 1 | short pull forward-inboard | 50-150 ft | 1-2 | 1-2 min |
| Stern/patio/E3 → cat 3/4 | forward up the empty LA | 150-300 ft | 2-3 | 2-3 min |
| Bow pack → cat 1/2 | broken down outermost first, often towed | 50-200 ft | 1-2 + tow crew | n/a |

**Director rules** [DOC]:
- Exactly one director controls a jet at a time.
- The receiver signals readiness by raising one arm vertically. The sender then points both arms at him.
- The director stays stationary while controlling, about 15-30 ft ahead of the jet in line with its left wingtip. He moves only with the jet braked.
- If the pilot loses sight of his director, or gets signals from two directors, he **stops**.
- Directors are spaced about every 60-150 ft. Movement is jerky: add a 0-3 s pause at each handoff.

### 1.16 JP-5 fuel stations (deck edge)

There are 14-18 flight-deck stations, each with 3-4 hose reels of **150 ft** of 2½ in hose (effective reach about 120-140 ft). Stations are fed from four quadrant mains; each service pump gives 1,100 gpm at 150 psi; station pressure is about 50-55 psi [DOC/SRC]. **A hose across a lane blocks tows** [DOC]. The 16 sim placements below were re-fitted to the measured edge and are all [EST]:

| ID | X | Y | Serves | ID | X | Y | Serves |
|---|---|---|---|---|---|---|---|
| F1 | 1000 | +52 | bow One Row | F9 | 40 | -61 | stern port (no recovery pending) |
| F2 | 880 | +63 | bow, point | F10 | 240 | -131 | finger, E4 |
| F3 | 760 | +121 | point, cat 1 queue | F11 | 450 | -135 | waist, cats 3/4 |
| F4 | 680 | +121 | E1, six-pack fwd | F12 | 620 | -140 | waist fwd |
| F5 | 550 | +121 | corral, six-pack | F13 | 790 | -103 | angle fwd edge, crotch |
| F6 | 270 | +121 | junkyard, hummer hole | F14 | 850 | -63 | crotch, Four Row |
| F7 | 165 | +115 | patio, E3 | F15 | 950 | -57 | bow Four Row |
| F8 | 60 | +80 | patio aft | F16 | 1040 | -51 | bow tip port |

---

## 2. Aircraft: F/A-18E/F and EA-18G

For deck handling the two are dimensionally identical (the Growler is an F-model airframe) [DOC].

| Parameter | F/A-18E (1 seat) / F (2 seat) | EA-18G | Tag |
|---|---|---|---|
| Length | 60 ft 1.25 in (**60.3 ft**, 18.31 m) | same | [DOC] |
| Span, spread | 44 ft 8.5 in (**44.9 ft**, 13.62 m) incl. tip rails | same, incl. ALQ-218 tip pods | [DOC] |
| **Span, folded** | **about 30.5 ft** (9.32 m) | same | [DOC] |
| Height | 16 ft (to the top of the fins); folded tips rise to about 17-18 ft | same | [DOC]/[EST] |
| Footprint for the sim | spread 60 × 45; folded 60 × 30.5 | same | |
| Wing fold | outer panels fold up at about 55-60% semi-span; **about 12 s** (10-15 s) | same | [SRC]/[EST] |
| Main-gear track / wheelbase | about 10.5 ft / about 18 ft; nose tip about 13 ft ahead of the nose gear; tailpipes about 47 ft aft of the nose gear | same | [EST] |
| Empty weight | about 32,000 lb (30,600-32,081) | about 33,094 lb | [DOC] |
| Max catapult weight | 66,000 lb | about 66,000 lb | [DOC] |
| Typical launch weight on the weight board | 44,000-66,000 lb | similar | [SRC] |
| Max trap weight | **about 44,000 lb** | about 44,000 lb | [SRC] (TWZ) |
| Engines | 2 × GE F414-GE-400, 22,000 lbf each in afterburner | same | [DOC] |
| **Deck taxi speed** | cruise 5-7 ft/s (3-5 mph); turns 1-3 ft/s; **≤ 4 mph (5.9 ft/s) into the buffer**, use 2-3 ft/s; leaving the wires ≤ 70% power, peak 6-8 ft/s | same | [DOC] buffer limit; [SRC]/[EST] others |
| Tow speed | ≤ 5 mph / walking pace (2-4 mph typical) | same | [SRC] |
| **Approach speed** | on-speed AoA about **135 KIAS** (125-145 with weight); closure about 105-120 kt with 25-30 kt wind over deck | similar, slightly higher | [SRC] |
| Glideslope sink | about 700-800 ft/min, no flare | | [DOC] |
| **Trap rollout** | Mk 7 rated 344 ft / about 2 s; real Hornet traps 250-340 ft. **Sim: 315 ft over 2.0 s with a strong ease-out, then about 5 ft rollback** | same | [DOC]/[EST] |
| **Catapult end speed** | about **150 kt** ground speed off the bow (130-150 kt depending on weight); about 150-170 KIAS with wind over deck; 0 to end speed in about **2 s** over the 310 ft stroke, about 3-4 g | same | [DOC]/[SRC] |
| Throttle at touchdown | MIL, held about 3 s (bolter insurance), then idle | | [DOC] |
| Launch bar | T-bar on the front of the nose strut; down only near the shuttle (inside about 50 ft) | | [DOC] |
| Tailhook | centerline, between the nozzles; down in the pattern, up on the "hook up" signal | | [DOC] |
| Jet-blast danger (aft) | idle 115-155 ft; MIL 325-725 ft; max AB 850-925 ft | | [SRC] (EAWS) |
| Intake keep-out | **25 ft** (personnel rule) | | [DOC] |

### 2.1 Silhouette (top-down)

Normalized half-outline (starboard side; mirror for port). L = 1.0 = 60.3 ft. x = fraction of L from the centerline, y = fraction of L aft of the nose [EST, tuned to published dimensions].

| Point | x | y | Point | x | y |
|---|---|---|---|---|---|
| Nose tip | 0.000 | 0.000 | Wingtip TE | 0.372 | 0.680 |
| Radome shoulder | 0.030 | 0.090 | Wing TE root | 0.105 | 0.700 |
| Canopy / LEX start | 0.045 | 0.200 | Stabilator root LE | 0.085 | 0.810 |
| LEX outer curve | 0.090 | 0.330 | Stabilator tip LE | 0.200 | 0.920 |
| Wing root LE | 0.115 | 0.430 | Stabilator tip TE | 0.200 | 0.975 |
| Dogtooth (fold region) | 0.255 | 0.540 | Stabilator root TE / nozzle | 0.060 | 0.990 |
| Wingtip LE | 0.372 | 0.610 | Tail end | 0.000 | 1.000 |

- **Vertical tails:** thin slivers from (0.055, 0.700) to (0.065, 0.880), canted out about 20°, with the top-down tip at about (0.115, 0.900).
- **Fold line:** x = 0.24, from y 0.53 to 0.69. **Folded:** drop everything outboard of x 0.24 and draw a thin bar (width about 0.02 L) along the fold line; folded span is about 0.51 L.
- **E vs F:** the F (and the Growler) has a longer two-seat canopy.
- **Growler cues:** blunt rounded **wingtip pods** (the strongest cue), plus 2-3 fat underwing or centerline jammer pods (ALQ-99 or ALQ-249 NGJ-MB) with a small ram-air turbine nose. No gun port. Squadron (VAQ) tail markings.
- **Super Hornet:** plain tips or thin missile rails.
- **Recovery tanker:** Super Hornet in the 5-store configuration: centerline buddy store plus 4 drop tanks.
- **Level of detail:** in overview, draw a fill silhouette plus a canopy spot. Close up, add the tails, fold line, stores, launch bar (a small line at the nose) and hook.
- **Colors:** ghost grey (FS 36375 / 36320), so jets read **lighter** than the deck.

---

## 3. Crew roles

Jersey and helmet colors follow NATOPS 00-80T-120 App. H [DOC]. Counts are topside per cycle [EST unless noted]. Positions use §1. Ship-frame crew coordinates for the cats are in §4.2.

| Jersey | Helmet | Role (billet marking) | Count | Launch: station and action | Recovery: station and action | Respot: station and action |
|---|---|---|---|---|---|---|
| Yellow | (in Pri-Fly) | **Air Boss / Mini Boss** | 2 | Pri-Fly: sets the beacon green, 5MC calls ("Launch aircraft"), can suspend; often the Mini Boss runs launches | Pri-Fly: "MAN ALL RECOVERY STATIONS", "99, Charlie", "LAND AIRCRAFT", watches aft | Approves moves and engine turn-ups; deck status red |
| Yellow | (in FDC) | **Handler (ACHO)**, Night Handler | 1 | Flight Deck Control: launch sequence on the Ouija board; avoids a locked deck | Plans the recovery spot; allocates slots | **Owns the respot plan**; elevator traffic |
| Yellow | Yellow (orange stripes) | **Flight Deck Officer / Flight Deck Chief** (V-1) | 2 | Fly 2 safety; meters flow to the cats | Coordinates "clear deck forward" with the AGO | Supervises tows and moves |
| Yellow | Yellow | **Aircraft directors** ("bears"; "U/I" = trainee) | **12-15** [DOC] | 1 per taxi leg; 1 cat director per cat at the wye; stands ahead, left wingtip line | 4-5 on the route (§1.15) | 1 per tow move (**caps concurrent tows at 6-10**) |
| Yellow | Green | **Catapult Officer ("Shooter")** ("BOW/WAIST CAT OFFICER") | 2 (bow + waist) | Deck-edge mode: beside the jet, forward of the nose, in the pilot's view (bow: centerdeck strip). ICCS mode: in the bubble. Final turnup, salute, **touch deck → fire** | Inactive; secures the waist (shuttles aft, JBDs flush, bubble down) and signals the AGO | No-load shots if a cat was repaired |
| Yellow | Green | **Arresting Gear Officer (AGO)** | 1 | Pre-recovery checklist | Starboard of the foul line abeam the wires, about (262, +34). Holds the **deck-status pickle**: green after the checks, **red at each touchdown**. Clears people across the LA (≥ 10 ft aft of #1) | - |
| Yellow | Yellow | **Gear puller** (landing-area director) | 1 | - | Before the trap (655, -30) facing aft: "CLEAR DECK FORWARD". After the stop: in front at the pilot's 1 o'clock; hook up, brakes, taxi out, fold wings | - |
| Yellow jersey, blue vest | Blue | **Tractor King** ("TK") | 1 | Tractors chained clear; tow bars stay on all deck jets for an emergency respot forward | Hot tractor ready | Dispatches the tractor pool (12) |
| Yellow | Yellow (orange stripes) | **Crash & Salvage Officer** ("Air Bos'n") | 1 | P-25 manned | Runs the crash response | - |
| Green jersey, **yellow vest** | Green | **Catapult Safety Observer (CSO)** (ICCS ships) | 1 per manned cat | Takes the shooter's deck spot: takes the salute, crouches the crew, **drops to one knee with a thumbs-up** to the bubble | - | - |
| Green ("C") | Green | **Topside Safety PO (TSPO)** | 1 per cat | Under the nose: checks the holdback and the launch-bar seating; gives **take tension**; **last man out**; thumbs-up held until the launch | - | - |
| Green ("C") | Green | **Holdback man** + 1-2 hookup crew | 2-3 per cat | Kneeling at the nose gear: fits the RRHB; clears before tension | - | - |
| Green | Green | **Weight board operator** | 1 per cat | Beside the director in the pilot's view: shows the board, then shows it to the shooter, centerdeck and deck-edge operators | - | - |
| Green ("C") | Green | **Deck-edge operator (cat)** | 1 per cat | Catwalk outboard of the cat (cat 1 stbd; cats 2/3/4 port). Hand states: 1 finger = first ready; 2 fingers = MIL; both hands up = final ready. **Presses FIRE**, retracts the shuttle | - | - |
| Green | Green | **Centerdeck operator** | 1 per pair | Between the paired tracks abeam battery; anemometer thumbs-up. **The only person allowed under the wing's path** | - | - |
| Green (green/white vest "JBD SAFETY") | Green | **JBD operator + JBD safety observer** | 1-2 per cat (cat 3 always 2) | Operator at the deck edge abeam the JBD; the safety observer on the far side. Raise once the tail clears the arc; lower after the shot | - | - |
| Green | Green | **Bow / angle safety observers** | 2 | At the forward end of the stroke (bow) and near the angle tip (waist): GO light or thumbs-up | - | - |
| Green ("A") | Green | **Hook runners** | 1-2 | - | Crouched at the starboard foul line near (505-545, -6 to -12). **Run in only after the jet stops**, from the front and side. Give WIRE CLEAR, then RETRACT | - |
| Green ("A") | Green | **AG deck-edge operator** | 1 | - | Starboard catwalk aft (270, +122). Calls "GROOVE"/"RAMP", retracts the pendant on the hook runner's signal, ducks at touchdown | - |
| Green ("A") | Green, **orange stripes** | **AG Topside PO**, deck checkers, A/G safety, VLA safety | 4-5 | - | Starboard catwalk and the foul line by the wires; the VLA safety at the lens | Gear maintenance |
| Green with black stripe | Green | **Squadron maintenance / troubleshooters** | 10-20 | Fix "downs" at start; stand by at the cats | Post-flight help | Maintenance between events |
| Blue (crew number) | Blue | **Plane handlers / chock-and-chain** | 30-60 (most numerous) | Pull chains and chocks on the director's signal (20-40 s), hold the chains up | Wait at the assigned spot; chock and put on **6 initial chains** (20-40 s) | 2 chock walkers + wing and tail walkers per tow |
| Blue ("Tractor") | Blue | **Tractor drivers** | 6-12 | Tractors parked clear (junkyard, starboard edge) | 1 hot tractor + 2 crash tractors | Tow under a director only, ≤ walking pace |
| Blue ("E") | **White** | **Elevator operators** | 1 per elevator per level | - | Elevators locked | 3 horn blasts, then cycle |
| Blue ("T") | **White** | **Messengers / phone talkers** | several | FDC and elevator phones | | |
| Brown (squadron) | Brown | **Plane captains** | 1 per active jet (15-25) | At the nose, left side: start, control checks, wipeout; passes the jet to a director and salutes the pilot | Meets the jet at its spot; chains up to 9, covers, downlocks, gripes | **Brake rider** in the cockpit on tows |
| Purple ("grapes") | Purple | **Aviation fuels** | 10-15 | Topping off before the start | Hot pump for a hot turn (1-3 jets) | Cold fueling at the stations: nozzleman + station operator |
| Red (3 in black stripe; "CA" for arm/de-arm) | Red | **Ordnance** (ordies, arming crew) | 20-30 (2-3 per cat arming) | Arming area just forward of the JBD: "hands up", arm, show the pins | De-arm stop (645, -5): approach from the side and aft | Load and download weapons; **service lock** |
| Red ("Crash/Salvage") | Red | **Crash & salvage** (P-25 crew 3, line crew 3, hot chocks 3, Tilly 2) | 11-15 | P-25 manned | Junkyard cluster (265-300, +45 to +55); **Tilly running throughout** | Stand by |
| Red ("EOD") | Red, orange stripes | **EOD** | on call | | Hung ordnance | |
| **White, black/white checkerboard** | **Green** | **Squadron plane inspectors / final checkers** ("troubleshooters") | 1-2 per launching jet | Walk with the jet; at turnup outboard of the wingtips, aft (u -28, v ±35). **Thumbs-up or SUSPEND. No launch without it** | - | - |
| White ("LSO"), no helmet | none | **LSOs** (controlling, backup, deck-status/talker, writer, CAG paddles) | ≤ 6 [DOC] | Man the platform before the launch ends | **Platform (125, -74)**; pickle (wave-off/cut lights); ball calls; grades | - |
| White ("SAFETY", "ALRE QA", medical red cross, "LOX") | White | **Safety observers, QA, medical, LOX**; ordnance QA wears a white jersey with a red vest | 5-10 | Around the cats | Near the LA | Around tows |

- **Total topside at the peak of a cycle: about 150-250** [EST].
- Pants show rank: blue for junior enlisted, khaki for chiefs and officers [DOC].
- Every helmet has white reflective tape. **Three orange stripes** mark Air Department officers, CPOs and LPOs, EOD, ordnance officers and the AG Topside PO [DOC]. A **blue "T"** marks trainees.

---

## 4. Launch sequence (one jet, day, deck-edge mode)

### 4.1 Step list

t = 0 when the jet stops in the wye. The step order is [DOC] (NATOPS 4.x, ABE ch. 4). Durations are [EST], calibrated to about 50-55 s from wye to shot and a 75-100 s same-cat interval.

| # | t (s) | Actor | Location | Duration (s) | Signal / cue |
|---|---|---|---|---|---|
| 0a | event | Air Boss | Pri-Fly | - | Beacon red → green; ship on BRC, 25-30 kt wind over deck |
| 0b | event, T-2 min | Shooter | his cat | - | Points to his wrist, two fingers: "TWO MINUTES". Circuits go quiet |
| 1 | about -300 | Plane captain → director | parking slot | 5 | PC's "hand off to next" gesture and a salute to the pilot; the director raises one arm |
| 2 | | Director | about 15-30 ft ahead, left wingtip line | 3 | **Hold brakes** (arms overhead, hands closed to fists); pilot nods |
| 3 | | Blue shirts (2-3) | at the wheels | 20-40 | Low outward sweep = remove chocks/chains; blues hold the chains up |
| 4 | | Director | slot exit | 5 | Release brakes (fists open), **come ahead** (both forearms beckoning) |
| 5 | about -200 to -60 | Directors (relay) | route, 60-150 ft legs | 15-20 per leg + 0-3 pause | Receiver raises one arm → sender points both arms at him |
| 6 | | Director / pilot | holding node 60-120 ft aft of the JBD | **12** | **Spread wings** (arms swept from the chest outward); flaps to takeoff; takeoff checklist. Never spread close behind the JBD |
| 7 | | Final checkers (white checker) | alongside | during taxi | Walk-around: panels, leaks, wing locks |
| 8 | -60 to -25 | Director | next-jet slot, nose 10-20 ft aft of the JBD | 0-60 (wait) | Hold brakes, behind the raised JBD of the jet ahead, wings already spread |
| 9 | | Weight board operator (green) | beside the director | 5-10 | Board (e.g. "44.5"); pilot **thumbs-up** (night: circular flashlight). Corrections step 100 lb (E/F/G); more than 2 steps = no launch without agreement |
| 10 | -25 | JBD operator | deck edge abeam the JBD | 3-5 + 10-20 cool | Previous jet airborne → JBD lowered |
| 11 | -20 to -5 | Cat director | about u +35, on the track | 10-15 | Come ahead over the lowered JBD; ≤ 4 mph |
| 12 | -8 | JBD operator / safety | JBD | 3-5 | JBD raised once the tail clears the arc |
| 13 | (optional) | Ordnance (red, "CA") | forward of the JBD, launch bar resting on the shuttle | 30-60 | Pilot "hands up"; arm; pins shown |
| 14 | 0 | Director | wye | 2 | **Disengage nosewheel steering**: forefinger to the nose, then the arm sweeps in the direction of travel |
| 15 | 0-12 | Holdback man + TSPO | under the nose | 8-15 | RRHB fitted; TSPO thumbs-up to the shooter (white stubby wand vertical at night) |
| 16 | 12 | Director → pilot | | 2 | **Lower launch bar** (arm extended forward and down) |
| 17 | 14-20 | Director | approach tracks | 5-8 | Creep forward ≤ 4 mph; the bar drops into the shuttle spreader and the holdback seats in the buffer |
| 18 | 18 | Deck-edge operator | catwalk outboard | 1 | FIRST READY: one hand overhead, forefinger extended (red wand) |
| 19 | 20 | TSPO → director | under the nose | 3 | **Take tension**: arm swept forward, forefinger down the track, held |
| 20 | 21 | Director | ahead of the jet | 3 | Checks fore and aft; one hand: **release brakes** (to the pilot); other arm pointed forward: **tension** (to the DEO) |
| 21 | 23 | Deck-edge operator | catwalk | 2-4 | Presses BRIDLE TENSION; says **"TAKING TENSION"**, the **last words spoken until the launch**. Jet squats onto the nose gear |
| 22 | 24-30 | TSPO | under the nose → u +5, ‖v‖ 27 | 5-8 | Checks the launch-bar paint and the RRHB; **exits last**; thumbs-up held to the launch |
| 23 | 30 | Director → shooter | | 1 | **Pass control**: both hands pointed at the shooter. The director moves laterally clear and crouches |
| 24 | 32 | Shooter | forward-abeam the nose, ‖v‖ 25-30 | 1 | **Final turnup**: two fingers raised and rotated rapidly overhead (green wand circled) |
| 25 | 33 | Pilot / deck-edge operator | | 3 | MIL power, feet off the brakes; launch bar switch to retract. DEO presses STANDBY/MIL PWR: **two fingers overhead**; green MIL deck light |
| 26 | 35 (optional) | Shooter → pilot | | 2 | **Afterburner/CRT**: open hand pushed up. Amber COMBAT light; checkers watch both burners light |
| 27 | 37-42 | Pilot | cockpit | 4-6 | **Wipeout**: stick to all four corners, rudders; checkers thumbs-up (blue stubby wand) |
| 28 | 42-46 | Pilot | cockpit | **4** | About 4 s delay [DOC], then head back on the headrest and a **salute** (night: **exterior lights ON**) |
| 29 | 46 | Deck-edge operator | catwalk | 1 | FINAL READY: **both arms overhead, hands open**; MIL/CRT lights flash |
| 30 | 46-51 | Shooter | | 3-5 | Returns the salute; final scan: beacon, checkers, TSPO, centerdeck wind thumbs-up, bow/angle safety GO, deck forward clear, airborne traffic, **deck pitch** (fire on the level or the up-pitch) |
| 31 | 51 | Shooter | | 1 | **FIRE**: hand sweeps down toward the launch direction, **touches the deck**, comes up pointing down the track. Everyone crouched and laterally clear. (ICCS mode: the CSO kneels with a thumbs-up and the shooter presses FIRE in the bubble) |
| 32 | 52 | Deck-edge operator | catwalk | 1-2 | Checks the deck and catwalks, lowers his hands, **presses FIRE**. Never anticipates. Catwalk crew duck against the inboard bulkhead |
| 33 | 52-54 | Catapult | track | **2** | Stroke: 0 → about 150 kt over 310 ft; the RRHB releases; a steam wisp along the slot |
| 34 | 54 | Jet | bow | 2 | Shuttle slams into the water brakes; launch bar springs up; **clearing turn: right off the bow cats, left off the waist cats** (night: straight ahead) |
| 35 | 56-70 | Deck-edge operator / ICCS monitor | | 10-20 | Shuttle retracted to battery (it must not sit in battery more than 5 min) |
| 36 | 56-75 | JBD operator | | 3-5 + 10-20 | JBD lowered, cooled; the next jet rolls over it |

### 4.2 Crew positions around the jet

The local frame is u = feet forward of the nose gear along the track, v = feet to the jet's right. Rule [DOC]: at the shot, **everyone except the centerdeck operator is at ‖v‖ ≥ 25 ft (or forward of the nose) and crouched.**

| Role | Hookup (u, v) | At the shot (u, v) | Cat 1 example (X, Y) | Cat 4 example (X, Y) |
|---|---|---|---|---|
| Director | (+35, 0) | (+20, ±28), opposite the shooter | (776, 52) → (763, 81) | (402, -110) → (387, -136)* |
| Weight board | (+32, +12) | ‖v‖ ≥ 30 | (774, 64) | (399, -98) |
| Shooter / CSO | (+15, ±28) on the pilot's visible side | same, crouched/kneeling | (753, 26) (centerdeck strip) | (382, -82) (inboard, toward the bubble) |
| TSPO | (0 to +3, 0) | (+5, ±27) | (742, 55) → (748, 83) | (368, -110) → (372, -136)* |
| Holdback man | (-3, 0) | (-8, ±28) | (738, 55) → (736, 84) | (364, -110) → (359, -136)* |
| Final checkers (2) | alongside | (-28, ±35) | (710, 23) / (716, 92) | (339, -136)* / (339, -75) |
| JBD operator | deck edge abeam the JBD | same | (682, +122) | (308, -134) |
| JBD safety | far end of the JBD | same | (681, 38) | (309, -88) |
| Deck-edge operator | catwalk outboard abeam battery | same | (750, +122) | (390, -136) (shared by cats 3/4) |
| Centerdeck operator | between the tracks abeam battery | same (exempt) | (745, +19) | (400, -92) |
| Ordnance crew / coordinator | (-18, ±12) / (+15, +10) | clear, ‖v‖ ≥ 30 | (724, 69) / (757, 64) | (349, -98) / (382, -100) |
| Bow / angle safety | forward end of the stroke / angle tip | same | (1060, +47) and (1060, -52) | (735, -138) |

\* Cat 4 is about 23 ft from the port edge, so its outboard-side crew stand in the port catwalk at about Y -136 [EST].

- Cat 2's deck-edge station is on the angled-deck forward edge near **(798, -97)**, about 100 ft from the track. NATOPS puts cat 2's power lights "at the forward deck edge left of battery", which fits [DOC logic / EST coords].
- Cat 3's JBD operator stands in the port catwalk about (362, -136) and looks across cat 4 [DOC]. **Cat 3 always has a JBD safety observer**, at about (362, -45).

### 4.3 Pacing and interlocks

| Parameter | Day Case I | Night Case III | Tag |
|---|---|---|---|
| Cats manned | 4 (option: 3) | 3 (1, 2, 3) (option: 2) | [EST] |
| Wye to shot | 50-55 s | +50% | [EST] |
| Same-cat interval | 75-100 s (mean 85; waist +5-10 s) | 120-180 s | [EST] / PBS 105 s |
| **Pair interlock** | Only one cat of {1,2} and one of {3,4} at STANDBY/MIL at a time; ≥ 15-25 s between shots of a pair | same | [DOC] |
| Deck-wide spacing | none; bow and waist may fire within seconds | **≥ 30 s, never bow and waist together** | [DOC] |
| Burst deck interval | 20-25 s | 30-40 s | [SRC] |
| Event-average interval | 40-50 s | 50-60 s | [SRC/EST] |
| 12-jet event, first to last shot | **8-10 min** | 10-13 min | [EST] |
| Queue per cat | **1 on the cat + 1 spread behind the JBD**; a third waits in its slot, wings may be folded | same | [DOC]/[EST] |
| Feed losses | about 10% late jets, about 2-3% suspends | | [EST] |
| Hangfire | no fire within 10 s of FIRE | | [DOC] |

---

## 5. Recovery sequence

### 5.1 Recovery cases

| Case | When | Minima | Control | Ramp interval |
|---|---|---|---|---|
| I | Day VMC | ceiling ≥ 3,000 ft, visibility ≥ 5 nm | Visual, "zip lip"; overhead stack | **45-60 s** [DOC] |
| II | Day, possible IMC in the descent | ceiling ≥ 1,000 ft, visibility ≥ 5 nm | CATCC descent to about 10 nm, then a Case I pattern | 45-60 s |
| III | **Night (1/2 h after sunset to 1/2 h before sunrise)** or below Case II minima | - | Full CATCC radar control; marshal; 1 min push spacing | about 60 s |

Airspace: carrier control zone is 5 nm radius, surface to 2,500 ft (Air Boss). Carrier control area is 50 nm (CATCC) [DOC].

### 5.2 Case I pattern geometry

All turns are left (to port). The final course is the angled-deck heading, about 9° left of the ship's heading. 1 nm = 6,076 ft.

| Leg | Altitude | Distance / position | Speed | Duration | Tag |
|---|---|---|---|---|---|
| Overhead stack (port holding) | lowest 2,000 ft, then every 1,000 ft (2,000 / 3,000 / 4,000) | left-hand circle ≤ 5 nm diameter, roughly tangent to the BRC, ship at the 3 o'clock; 2 groups per altitude on opposite sides | about 250-300 kt [EST] | until "Charlie". When the low group leaves, everyone above **spirals down one level** | [DOC] |
| Initial | **800 ft** | **3 nm astern** (about 18,000 ft), slightly starboard of the BRC; 2-4 ship echelon | 300-350 KIAS | about 20-30 s to the break | [DOC] |
| **Break** | 800 ft, level | over the ship to about 1-2 nm ahead, within 3 nm | decelerating; 4-6 g | about 12-15 s for the 180° turn. **Interval 15-20 s between aircraft** in a flight | [DOC]/[SRC]/[EST g] |
| Configure | | during and after the break | slows to on-speed (about 135-145 KIAS) | | Gear down, flaps full, **hook down**, speedbrake [DOC] |
| **Downwind** | **600 ft** | **1.1-1.3 nm abeam** (about 6,700-7,900 ft), reciprocal heading | on-speed | 15-25 s (extended to set the interval) | [DOC] |
| **The 180 / abeam** | 600 ft | abeam the LSO platform / LA | | turn start; landing checklist | [DOC] |
| **The 90** | **about 450 ft** | about 1.0-1.2 nm from the ship, 90° to go | | about 12 s after the 180 | [DOC]/[EST time] |
| **Wake crossing** | **about 370 ft** | crossing behind the stern; acquire the ball | | about 10 s | [DOC] |
| **Ball call** | about 360 ft | **about 3/4 nm**, rolling wings level on the angled CL | | | "Three-oh-six, Rhino ball, six-point-five" → LSO "Roger ball" [DOC] |
| **Groove** | 3.5° glideslope | about 0.5-0.75 nm of track | closure about 105-120 kt (on-speed minus wind over deck) | **15-18 s** (> 18 = long; < 15 = short) | [DOC] |
| Foul-deck decision | about 190 ft | **1/2 nm** | | about 15 s before touchdown | §0 #9 |
| Touchdown | deck | s ≈ 230 ft from the ramp | | | [DOC] |

- Break to touchdown is about **70-90 s** [EST].
- **Interval control:** each pilot delays the turn to final relative to the jet ahead, which stretches the 15-20 s break interval into a **45-60 s ramp interval**. The downwind gets longer down the line [SRC].
- **Spin:** with more than 6 jets in the pattern, a jet climbs to 1,200 ft, flies a tight 360 within 3 nm, and re-enters [DOC].
- Sim: schedule a target ramp interval of about 50 s and let the downwind length absorb it.
- The first division times its arrival so the first jet is in the groove just as the deck goes green. Too early means a foul-deck wave-off; too late wastes deck time [SRC].

### 5.3 Per-trap step list

t = 0 at touchdown.

| # | t (s) | Actor | Location | Duration (s) | Signal / call |
|---|---|---|---|---|---|
| P1 | event, R-15 min | Air Boss | Pri-Fly / 5MC | - | "MAN ALL RECOVERY STATIONS" |
| P2 | event, after the last waist shot | Waist cat officer + crew | waist | **60-120** | Shuttles aft; JBDs flush; launch accessories removed from the LA; slot seals out and ≥ 12 slot buttons in; spreader covers on; hatches dogged; bubble down and locked → **arm overhead (night: green wand) to the AGO** [DOC] |
| P3 | event | AGO | starboard of the foul line, abeam the wires | 30-60 | Pre-recovery checklist: catapult gear clear of the LA; sheaves up; lens on; barricade tractor hooked up; beacon green; **all aircraft inside the safe-parking line**; crews manned; LSO platform manned; gear set. "GEAR MANNED AND READY" |
| P4 | event | Air Boss / Tower | | | Beacon green; "99, Charlie"; 5MC "LAND AIRCRAFT" |
| 1 | -90 | Pilot | overhead → initial | | (§5.2) |
| 2 | -75 | Pilot | break, 800 ft | 12-15 | |
| 3 | about -60 | AGO + engine operators | Pri-Fly / below deck | | Weight set from the type and fuel; "ALL ENGINES SET THREE SIX ZERO, HORNET" |
| 4 | -45 | Pilot | the 180, 600 ft | | |
| 5 | -30 | Gear puller → AGO | (655, -30) | 2 | **CLEAR DECK FORWARD** (arm swept from overhead to horizontal and back). The AGO checks the pendants are taut and the sheaves up → **deck light RED → GREEN**; LSO talker: "GEAR SET, THREE SIX ZERO, HORNET, CLEAR DECK" |
| 6 | -18 | Pilot / LSO | 3/4 nm, wings level | 1 | Ball call / "Roger ball" (zip lip: green cut lights flash) |
| 7 | -18 | AG deck-edge operator | starboard catwalk | | "GROOVE" on the circuit; all stations repeat. Anyone not ready: "FOUL DECK, FOUL DECK" |
| 8 | -15 | Controlling LSO | platform | | **Deck-clear deadline**: not green → **wave-off** (red lights flash + "Wave off, foul deck") |
| 9 | -15 to 0 | LSO | platform | | Calls as needed: "Power", "Right for lineup", "You're high", "Easy with it" |
| 10 | -1 | AG deck-edge operator | | | "RAMP" as the jet crosses the stern. Catwalk crew duck behind cable shields |
| 11 | 0 | Pilot | touchdown, s ≈ 230 | | **Throttles to MIL**. AGO: **GREEN → RED** |
| 12 | 0-2 | Arresting gear | #3 at s 257 | **2** | Decelerates over about 315 ft; stops with the nose near (609, -78) |
| 13 | 2-4 | Jet | | 2 | Rollback about 5 ft so the wire drops; pilot to idle |
| 14 | 3-5 | Gear puller | steps in at the pilot's 1 o'clock (650, -65) | 2 | **Hook up**: thumb raised into the flat palm. Enters only after the stop |
| 15 | 4-8 | Hook runner | from the starboard foul line (545, -12) to the hook | 3-4 | Sprints in from the front and side at 15-20 ft/s, checks the hook is clear → **WIRE CLEAR** to the gear puller (vertical arm; night: red wand pointed). A hung wire: HOOK DOWN, pull back, then HOOK UP |
| 16 | 6-10 | Gear puller → pilot | | 2 | Hold brakes → off brakes → come ahead; **hard right turn**; ≤ 70% power |
| 17 | 8-12 | Hook runner → AG deck-edge operator | | 2 | **RETRACT** (confirms it was received before leaving). The pendant retracts and re-tensions over about 6-15 s |
| 18 | 10-22 | Gear puller → pilot | on the move | 12 | **Fold wings** + flaps up (arms from full extension swept to the chest) |
| 19 | 20-30 | Gear puller → Fly 2 director | foul line at about (635, -34) | 1 | Handoff (the receiver raises one arm). **Tail clear of the foul line at 25-30 s** |
| 20 | 30-40 | AGO | | 3-5 | Checks: pendants taut, sheaves up, engines reset, nothing across the foul line → ready for the next "clear deck forward" |
| 21 | 30-120 | Fly 2 director → de-arm coordinator (red "CA") | de-arm stop (645, -5), hdg +75 | 30-90 (only if flagged) | Director holds with one hand and points to the ordnance director with the other. The crew approaches from the side and aft |
| 22 | 60-240 | Directors 3-5 | Box → bow → slot | 90-150 | Handoffs every 60-150 ft; spin into the slot |
| 23 | +20-40 | Blue shirts | slot | 20-40 | Chocks, then **6 initial chains** |
| 24 | +30-60 | Plane captain | nose | 30-60 | Takes control; shutdown signal; chains to 9; covers |
| 25 | later | Purple / red / green | slot | 5-10 min fuel | Fuel, download, maintenance. **Service locks** block any move |

The landing area is foul for about 30-40 s of each 45-60 s interval.

### 5.4 Touchdown outcome probabilities (sim defaults, all [EST])

| Outcome | Probability per pass |
|---|---|
| #3 wire (target) | about 50% |
| #2 wire | about 25% |
| #4 wire | about 12% |
| #1 wire | about 5% |
| Bolter (including hook skips) | about 6-8% |
| Technique wave-off | about 2-3% |

A foul-deck wave-off is not drawn from these probabilities. It comes from the deck state machine.

### 5.5 Case III differences

| Item | Value | Tag |
|---|---|---|
| Marshal | radial about 150° relative to the BRC (behind the ship); DME = altitude in thousands + 15 (lowest 6,000 ft at 21 nm); 1,000 ft / 1 nm separation; left 6-min racetrack (1-min legs) | [DOC] |
| Push | Expected Approach Time ± 10 s; **1 min apart** | [DOC] |
| Descent | 250 kt, 4,000 ft/min to the "platform" at 5,000 ft, then 2,000 ft/min | [DOC] |
| Arc | at 12 nm if the radial is more than 10° off the final bearing | [DOC] |
| 10 nm | 1,200 ft; dirty up (gear, flaps, hook) by about 8-10 nm | [DOC] |
| 6 nm fix | 1,200 ft, about 150 kt; intercept the glideslope about 3 nm | [DOC] |
| Glidepath checkpoints | 3 nm 1,200 ft · 2 nm 860 ft · 1 nm 460 ft · ball call 3/4 nm about 360 ft (about 15-20 s to touchdown) | [DOC] |
| Guidance | CCA talk-down; ICLS "bullseye"; ACLS Mode I / IA / II; long-range laser line-up (red steady / slow-flash / fast-flash off the centerline) | [DOC]/[SRC] |
| Bolter / wave-off | straight ahead to 1,200 ft, CATCC vectors into the bolter racetrack: **+4-6 min** | [DOC]/[EST] |
| Ramp interval | about 60 s or more | [DOC] |

### 5.6 IFLOLS (the lens)

| Element | Description |
|---|---|
| Ball | Amber "meatball" in a vertical stack of 12 cells. **Red** in the bottom cells = dangerously low. Off the top when about 0.75° high |
| Datum lights | Horizontal **green** lights each side; ball level with them = on glideslope |
| Wave-off lights | Flashing **red**, vertical each side, worked by the LSO's pickle. **Mandatory**; all other lamps go out. Lit whenever the lens is on with no LSO on the platform or no clear deck |
| Cut lights | **4 green** above the lens: "roger ball" in zip lip; flashing = add power. Wave-off and cut lights alternating = bingo |
| Other | Stabilized for pitch and roll; roll angle set per type for the hook-to-eye distance. MOVLAS is the manual backup |

### 5.7 LSO grades (Greenie Board)

| Grade | Points | Board color |
|---|---|---|
| _OK_ (underlined, perfect pass) | 5 | green |
| OK | 4 | green |
| (OK) fair | 3 | yellow |
| B bolter | 2.5 | blue |
| — no grade | 2 | brown |
| WO technique wave-off | 1 | red |
| C cut (unsafe) | 0 | red |
| WOFD foul-deck wave-off | not scored | - |

The groove/interval readout format is "49 over 16" (49 s interval, 16 s groove).

---

## 6. Cyclic operations

### 6.1 Rules

| Rule | Detail | Tag |
|---|---|---|
| **Launch before land** | Each cycle: launch Event N → secure the waist and go green → recover Event N-1 → respot. The launch clears the deck so recovered jets have room | [DOC] |
| **No simultaneous LA use** | Nothing may be in the LA polygon (§1.4) during recovery. Any jet, tail, wingtip, tractor or person across the foul line = **FOUL DECK** | [DOC] |
| **Waist cats locked out during recovery** | Cats 3/4 lie in the LA. Secure them (P2 in §5.3) before green deck | [DOC] |
| **Bow cats during recovery** | Legal (NATOPS: cat 2 deck-edge simultaneous ops), but the bow pack blocks them within minutes. Default: idle | [DOC]/[EST] |
| **Foul deck** | Foul = anything in the LA, wire not retracted, engines not set, sheaves down, or barricade moving. Foul at the 1/2 nm point → wave-off | [DOC] |
| **Pair interlock** | One cat per pair at MIL at a time | [DOC] |
| **Night spacing** | ≥ 30 s between launches; no simultaneous bow and waist shots; procedures never rushed | [DOC] |
| **El 4** | Not cycled during recovery; jets may sit on it | [DOC]/[MEAS] |
| **Tilly** | Must be running throughout every recovery; without it, no recovery | [DOC] |
| **Ship heading** | On BRC (Fox Corpen) with 25-35 kt wind down the angle for launch and recovery; **no turns during recovery** | [DOC] |
| **Launch tanker first, land it last** | The recovery tanker is the first shot of Event N, orbits overhead with give-away fuel during the recovery of Event N-1, and traps last in the next window | [SRC] |
| **Day boundaries** | Event 1 launches only. The last event recovers only. Then the night respot packs the bow for the morning | [DOC] |
| **Respot** | Mostly towed (75-90%); recovery and launch moves are 100% taxi; elevator moves 100% tow | [SRC]/[EST] |

### 6.2 Example cycle: Day Case I, 1+30, 12 launch / 12 recover

**Setup.** Event N launches with first shot at **10:00 (T+0)**. Event N-1 (11 jets plus its recovery tanker) has been airborne since 08:30. Event N = 1 recovery tanker, 9 F/A-18E/F and 2 EA-18G. All 4 cats are in use. Times are a model built from the calibrated intervals above [EST].

**Planned shots (mm:ss after T+0):**
- Cat 1: 0:00 (tanker), 1:40, 4:20
- Cat 4: 0:20, 2:05, 5:00
- Cat 2: 0:50, 2:40, 5:40
- Cat 3: 1:15, 3:30, 7:50 (this jet is suspended at 6:10 and re-run)

| T (min) | Clock | Air | Deck / catapults | Crew highlights (jersey) |
|---|---|---|---|---|
| -45 | 09:15 | Event N-1 airborne | 5MC "Aircrew, man aircraft." Event N jets spotted in L slots: stern FT1-3, finger/E4, patio, E3, hummer hole, six-pack (spun to -135), E1/corral/point | Brown at every jet; red finishing loads; purple topping off |
| -35 | 09:25 | | Walk-arounds; chocks and 6 chains on | Brown, white checkers |
| -30 | 09:30 | | **"Start the go."** Engines start (APU); control checks | Brown signals; green troubleshooters |
| -20 | 09:40 | Plane guard helo up; Event N-1 checks in, overhead stack 2,000-4,000 ft | Ship turns to BRC, 25-30 kt wind over deck. LSOs move toward the platform | Pri-Fly, bridge |
| -15 | 09:45 | | **Breakdown**: chains off; directors start the taxi relay; wings spread at the holding nodes | Blue, yellow |
| -10 | 09:50 | | First 4 jets in the wyes; 4 more spread behind the JBDs; weight boards; holdbacks; arming | Green cat crews; red "CA"; white checkers |
| -2 | 09:58 | | Shooters: "TWO MINUTES." Beacon **green**. Cat 1 FIRST READY | Circuits silent |
| -1 | 09:59 | | Cat 1 tanker in tension, MIL, wipeout | |
| **0** | **10:00** | | **Shot 1: recovery tanker, cat 1.** Cat 4 jet (from FT1) in tension | Shooter touches the deck |
| 1 | 10:01 | Tanker climbing to the overhead tanker pattern | Shots: **cat 4 at 0:20, cat 2 at 0:50**. Cat 3 jet held aft of JBD 3 while cat 4 is loaded | JBDs cycling; shuttles retracting |
| 2 | 10:02 | | Shots: **cat 3 at 1:15, cat 1 at 1:40** | Next jets cross the lowered JBDs |
| 3 | 10:03 | | Shots: **cat 4 at 2:05, cat 2 at 2:40**. Stern now empty | Directors pull jets from the patio and E3 |
| 4 | 10:04 | | Shot: **cat 3 at 3:30** | |
| 5 | 10:05 | | Shot: **cat 1 at 4:20** (last bow-1 jet) | |
| 6 | 10:06 | | Shot: **cat 4 at 5:00** (last cat 4 jet; the finger is empty). Shot: **cat 2 at 5:40** (last bow shot) | Bow cat crews stand down |
| 7 | 10:07 | | **Cat 3 suspend at 6:10**: a checker sees one burner fail to light → crossed arms → untension → shuttle forward of the launch bar → throttle back → re-run | White checker; shooter |
| 8 | 10:08 | Event N-1 first division descends to 800 ft for the initial | **Cat 3 re-run fires at 7:50: last shot (12/12). Waist secure starts** | Green waist crew: slot buttons, hatches, bubble down |
| 9 | 10:09 | **First break at 8:40** | Waist officer signals the AGO; AGO checklist; **green deck at 9:20**; "99, Charlie," "Land aircraft" | AGO pickle green; hook runners at the foul line |
| 10 | 10:10 | | **Trap 1 at 9:50** (3-wire) → taxis to bow slot B1S | Gear puller, hook runner |
| 11 | 10:11 | | **Trap 2 at 10:40** → B1P | Blue chock teams at the bow |
| 12 | 10:12 | | **Trap 3 at 11:30** (2-wire) → B2S | |
| 13 | 10:13 | | **Trap 4 at 12:20** → B2C | |
| 14 | 10:14 | | **Trap 5 at 13:10** → B2P | |
| 15 | 10:15 | | **Trap 6 at 14:00** → B3S | |
| 15 | 10:15 | **Jet A: bolter at 14:50**; flies off the angle at MIL and re-enters downwind (+2.5 min) | No wire to retract; the LA stays clear | LSO: "Bolter, bolter, bolter" |
| 16 | 10:16 | | **Trap 7 at 15:40** (jet 8); the hook runner finds a hung wire (hook down, pull back, hook up) | Hook runner, deck-edge operator |
| 17 | 10:17 | **Jet 9: foul-deck wave-off at 16:15** (jet 8's tail still across the foul line at the 1/2 nm point) → re-enters (+2.5 min) | Red wave-off lights; "Wave off, foul deck." Clear deck at about 16:40 | Controlling LSO holds the pickle |
| 17 | 10:17 | | **Trap 8 at 17:20** (jet 10) | |
| 18 | 10:18 | | **Trap 9 at 18:10** (jet A, after its bolter) | |
| 19 | 10:19 | | **Trap 10 at 19:00** (jet 9, after its wave-off) | Six-pack starts filling |
| 20 | 10:20 | | **Trap 11 at 19:50** | |
| 21 | 10:21 | | **Trap 12 at 20:40: the Event N-1 tanker traps last. "Recovery complete."** Ship may leave BRC. Event N tanker stays overhead | Pri-Fly |
| 21-26 | 10:21-10:26 | Event N airborne | Cleanup: last jets chained; fuel and ordnance start on bow and street jets; the Handler finalizes the respot on the Ouija board | Purple, red, brown |
| 26-40 | 10:26-10:40 | | **Elevators early:** down jets to the hangar, spares up (E1/E2/E3; 2-4 trips) | Blue elevator crews; 3 horn blasts per cycle |
| 30-55 | 10:30-10:55 | | **Peel the bow pack outermost first**; tow the Event N+1 launchers to L slots, tails outboard; **6-10 tows at once**, each tow 3-6 min; fuel hoses lock lanes | Yellow directors (1 per tow), blue drivers and walkers, brown brake riders, Tractor King |
| 45 | 10:45 | | 5MC "Aircrew, man aircraft" for the 11:30 launch | |
| 55-60 | 10:55-11:00 | | Final chains (initial 6); optional FOD walk | All hands if FOD walk |
| 60 | 11:00 | | **"Start the go"** for Event N+1 | |
| 70 | 11:10 | Event N checks in overhead | BRC; plane guard up | |
| 75 | 11:15 | | Breakdown and taxi | |
| **90** | **11:30** | | **Event N+1 first shot → Event N recovers at about 11:40-11:52** (sortie about 1+40) | Cycle repeats |

**Phase budget for one cycle:**
- Launch: 8 min first to last shot (about 15 min from breakdown).
- Waist secure to green: 1.5 min.
- Recovery: 11.5 min for 12 traps, including 1 bolter and 1 foul-deck wave-off.
- Last trap to the next first shot: about 69 min, of which about 35-45 min is active respot.

### 6.3 Day-level context

- The fly day is about 12-16 h with 7-10 events at 1+30.
- The day opens with a morning FOD walkdown: shoulder to shoulder, bow to stern, about 15-30 min.
- The plane guard helo launches first and lands last.
- An evening FOD walk comes before the night events, which are Case III.
- After the last recovery: the night respot packs the bow for Event 1, about 1-2 h, all towed. Then "Secure from flight quarters."

Call sequence:

| Call | Channel |
|---|---|
| "Flight quarters, flight quarters, all hands man your flight quarters stations" | 1MC |
| "Commence FOD walkdown" | 5MC |
| "Aircrew, man aircraft" | 5MC |
| "Start the go" | 5MC |
| "Launch aircraft" | 5MC |
| "Clear the landing area" | 5MC |
| "99, Charlie" | Tower |
| "Land aircraft" | 5MC |
| "Recovery complete" | 5MC |
| "Secure from flight quarters" | 1MC |

### 6.4 Respot resources

| Resource | Value | Tag |
|---|---|---|
| Flight-deck tow tractors (A/S32A-31A, 117 × 70 × 40 in, turning radius 132 in) | **12** (range 10-15); 2 reserved for crash response; idle in the junkyard and along the starboard edge | [SRC]/[EST] |
| Tow move crew | director (yellow) + driver (blue) + brake rider (brown) + 2 chock walkers (blue) + wing and tail walkers (blue, inside 5 ft of an obstacle) + safety (white): **6-10 people** | [DOC] |
| Concurrent tows | min(free tractors, free directors, free crews) → **6-10** | [EST] |
| Tow timing | hook-up 30-60 s; move 1-5 min; unhook, chock and chain 1-2 min → **3-6 min per move** | [EST] |
| Moves per respot | 15-30 tractor moves (some jets move twice) + 2-6 elevator trips | [EST] |
| Order | (1) cleanup and fuel start → (2) **elevators early** → (3) **peel the bow outermost first** to open cats 1/2 → (4) spot launchers, nearest-cat first, bow spots last → (5) final chains, FOD, start | [EST] |
| Service locks | a jet with a fuel hose, ordnance work or maintenance can't move; a hose across a lane blocks it | [DOC] |
| Hot refuel | engines running, canopy closed, initial tie-downs on, ≥ 3 crew; stations F2-F5 or F11-F12; about 5-7 min; **1-3 jets per cycle** (hot turns, tanker) | [DOC] procedure; [EST] use |
| Failure mode | **Locked deck**: a jet can't reach its cat, or the LA can't be cleared | [DOC] |

---

## 7. Hazards and edge cases worth showing

| Event | Trigger / frequency | What the viewer sees | Time cost | Rules / crew response | Tag |
|---|---|---|---|---|---|
| **Bolter** | 6-8% of passes | Hook misses; the jet (already at MIL) flies off the angle; "Bolter, bolter, bolter" | Case I about 2.5 min; Case III 4-6 min | No wire to retract: deck clear quickly. Re-enters downwind (Case I) or bolter racetrack at 1,200 ft (Case III). Graded 2.5 | [DOC]/[EST] |
| **Hook skip** | subset of bolters | Hook touches between the wires and bounces over | as bolter | Not the pilot's fault on a good pass; repeated skips → hook check → barricade | [DOC] |
| **Technique wave-off** | 2-3% | Red lens lights flash; full power; passes over the deck | about 2 min | Mandatory | [DOC]/[EST] |
| **Foul-deck wave-off** | from the state machine | Previous jet's tail across the foul line, or wire not retracted, at the 1/2 nm point | about 2-2.5 min | Not graded. Pass ≥ 100 ft above the highest obstacle (≥ 10 ft if nothing is physically in the LA) | [DOC] |
| **Suspend** | 2-3% of launches | Crossed arms overhead (night: horizontal wand); red flashing suspend lights | that cat loses 1.5-4 min | Pilot stays at power → untension → shuttle aft → raise launch bar → shuttle forward of the bar → **only then** the shooter steps in front with THROTTLE BACK | [DOC] |
| **Pilot abort** | rare | Pilot shakes head and radios "SUSPEND, SUSPEND, CATAPULT ONE" (night: lights never come on) | as suspend | **Never thumbs-down** | [DOC] |
| **Hangfire** | very rare | Cat fails to fire within 10 s; everyone frozen in the crouch | cat down until 2 good no-loads | Emergency cutout valve, shuttle confirmed aft, then throttle back | [DOC] |
| **Cold shot** | very rare | Weak end speed; jet settles off the bow; often an ejection | major | Why the weight board and CSV checks exist | [DOC] |
| **Down jet in the LA** | about 5% of events | A jet in the waist queue won't start or has a gripe | delays green deck by a tow (3-6 min) | Must be towed clear before recovery | [EST] |
| **Hung ordnance** | rare | Jet recovered last; nose over the side at the de-arm stop; red and EOD swarm | adds a de-arm hold | Nobody in front of forward-firing weapons | [DOC] |
| **Blown tire / hot brakes** | rare | Jet stuck in the LA (foul deck), crash crew; hot brakes approached **fore or aft only** | 5-20 min | Tilly or tractors clear it; airborne jets tank or hold | [DOC]/[SRC] |
| **Barricade** | manual trigger | "Rig the barricade": deck red; 18 sailors rig a 20 ft net in **about 5 min** (best about 3); straight-in engagement | **20-30+ min** of deck downtime | Last resort: hook or gear failure with no divert (blue water) | [DOC] |
| **Wire parting** | manual trigger, very rare | Cable whips across the deck (2016 *Eisenhower*: 8 hurt; 2005 *Kitty Hawk*: jet over the side) | major | Explains the fixed crew stations, ducking behind cable shields, and the weight-set checks | [DOC] |
| **Low fuel / bingo** | scripted | Fuel state on each ball call; "Bingo, bingo" → divert; "trick or treat" = fuel for exactly 1 more pass | jet leaves the sequence | Tanker "hawks" a low-state jet; tanking takes 2-3 min for 1-2 more passes | [DOC] |
| **Man overboard** | manual trigger | "Man overboard, port side!"; plane guard helo vectored; muster | deck red; muster 10-20 min | Float coat (strobe, whistle); fall is about 60 ft | [DOC]/[EST] |
| **Jet blast / intake** | continuous | Exhaust cones and intake circles | - | Crew path avoids **25 ft** intake circles and exhaust cones (avoid by ≥ 150 ft when possible); if blown down, grab a padeye and stay down. A jet at high power behind a JBD needs the waiting jet configured for the blast | [DOC] |
| **Catapult track incursion** | teaching trigger | Someone crosses a track while a jet is in tension | instant suspend | No one forward of a tensioned jet or on the track | [DOC] |
| **Locked deck** | respot mis-order | A jet can't reach its cat, or a fuel hose blocks a lane | respot overrun | Handler reshuffles | [DOC] |
| **Tilly down** | toggle | - | no recovery allowed | - | [DOC] |

### 7.1 Night mode (deck and procedure changes)

| Item | Night value | Tag |
|---|---|---|
| Lighting | Darkened ship; dim red/amber floodlights; LA edge and flush white centerline lights; drop line; lens datum lights; white light restricted | [DOC] |
| Pilot "ready" | **Exterior/nav lights ON** replaces the salute. No lights = suspend. The shooter keeps watching the lights after touching the deck | [DOC] |
| Night launch signal | Shooter: green wand raised overhead → 2-3 s → wide arc → **touches the deck** → points forward. Suspend: red wand overhead, green wand off | [DOC] |
| Launch spacing | ≥ 30 s; never bow and waist together; straight-ahead climb-out; Cat Officer has "absolute control" of tensioning | [DOC] |
| Recovery | Case III (§5.5), about 60 s interval; crew can't see exhaust → "assume engines are turning if someone is in the cockpit" | [DOC] |
| Wand map | Directors **2 amber**; shooter/CSO **red + green**; TSPO **white stubby**; checkers **blue stubby**; deck-edge operator **red**; centerdeck, JBD safety, weight board **white stubby**; ordnance **2 red banded**; bow/angle safety **red + green**; AGO **red + green**; AG deck-edge **green stubby + red**; hook runner **red**; gear puller **2 amber**; deck checker **white stubby**; A/G and VLA safety **red**; plane captain **2 blue** [SRC]; fuels **1 amber stubby** [SRC] | [DOC] unless marked |

---

## 8. Glossary

| Term | Meaning |
|---|---|
| ACHO / Handler | Aircraft Handling Officer; runs Flight Deck Control and the Ouija board; owns every aircraft position |
| ACLS / ICLS | Automatic / Instrument Carrier Landing System (Case III aids; ICLS "bullseye") |
| AGO | Arresting Gear Officer; holds the deck-status pickle |
| Air Boss / Mini Boss | Air Officer / assistant in Pri-Fly; controls the deck and the 5 nm / 2,500 ft zone |
| Air Plan | Daily flight schedule: events, launch and recovery times, tankers, Case |
| Alert 5 / 15 / 30 | Jet airborne within 5 / 15 / 30 min; an Alert 5 jet sits at or on a cat with the crew strapped in |
| Angle / LA | The angled landing area, 9° to port, bounded by the foul lines |
| Angle tip | Forward-port corner of the angled deck (unnamed in sources) |
| Ball / meatball | Amber IFLOLS light; "calling the ball" = side number, type, "ball", fuel |
| Battery | Shuttle at the aft end of the stroke, ready for hookup |
| Bears / yellowshirts | Aircraft directors |
| Bingo | Fuel needed to divert ashore; "bingo" = go now |
| Blue water | No divert field; the ship is the only runway |
| Bolter | Hook misses all wires; the jet goes around at MIL |
| Box | Area between the aft ends of cats 1 and 2 (bow bubble) |
| BRC / Fox Corpen | Base Recovery Course / the ship's flight-ops heading into the wind |
| CAG | Commander, Carrier Air Wing |
| Case I / II / III | Recovery and launch procedures by weather and daylight (§5.1) |
| CATCC | Carrier Air Traffic Control Center (Case II/III control, 50 nm) |
| Charlie / Delta | "Commence landing" / "delay, hold" |
| Clara | Pilot does not see the ball |
| Clear deck / green deck | LA clear, gear set; deck light green |
| Corral | Starboard deck-edge gap between El 1 and El 2 |
| CRT | Combat rated thrust (afterburner launch) |
| Crotch | Inside corner where the angle's forward edge meets the port bow |
| CSO | Catapult Safety Observer (shooter's deck representative on ICCS ships) |
| CSV | Capacity selector valve: steam setting for the jet's weight |
| De-arm area | Stop along the foul line forward of the waist cats, nose over the side, for safing weapons |
| DEO | Deck-edge operator (presses FIRE; retracts the shuttle) |
| Drop line | Vertical lights down the stern on the CL extension |
| Event | One launch group in the Air Plan |
| Fantail / stern | Aft end of the flight deck across the ramp |
| Final checker / troubleshooter | Squadron plane inspector in the white checkerboard jersey |
| Finger | One-jet spot on the port quarter by El 4 |
| Flex deck | Non-cyclic, on-demand launch and recovery |
| Fly 1 / 2 / 3 | Bow / waist-midships / aft deck zones |
| FOD walkdown | Shoulder-to-shoulder sweep of the deck for debris |
| Foul deck | Anything in the LA or gear not ready: no landing |
| Foul line / safe parking line | Red/white striped line bounding the LA |
| Gear puller | Yellow-shirt landing-area director |
| Grapes | Purple-shirt fuels crew |
| Groove | Wings-level final, 15-18 s |
| Hangfire | Catapult fails to fire within 10 s of FIRE |
| Hawk | Tanker shadowing a low-fuel jet |
| Hook runner | Green shirt who checks the hook is clear of the wire |
| Hot pump / hot seat | Refuel / crew swap with engines running |
| Hummer hole | Spot beside the island (E-2 parking) |
| ICCS / bubble | Integrated Catapult Control Station; glass-topped deck console between paired cats |
| IFLOLS / lens | Improved Fresnel Lens Optical Landing System |
| JBD | Jet blast deflector |
| Junkyard | Area between El 3 and the island: Tilly, trucks, tractors |
| Locked deck | Jets placed so nothing more can launch or land until a respot |
| LSO / Paddles | Landing Signal Officer |
| MIL / MRT | Military (full dry) power |
| No-load | Catapult shot with no aircraft (a test) |
| OK 3-wire | Good pass that caught the target wire |
| Ordie | Ordnanceman (red shirt) |
| Ouija board | Handler's 1/16 in = 1 ft deck and hangar plot with aircraft cutouts and colored nuts/tacks (purple nut = fuel, green tack = first to go, orange tack = tail over the edge) |
| P-25 | Mobile firefighting vehicle |
| Patio | Starboard quarter, aft of El 3 |
| Pickle | LSO hand switch for the wave-off and cut lights; also the AGO's deck-status switch |
| Plane captain | Brown-shirt squadron sailor who owns a jet |
| Point | Starboard bow, forward of El 1 |
| Pri-Fly | Primary Flight Control, the "tower" atop the island |
| Ramp / round-down | Aft edge of the flight deck |
| Respot | Repositioning aircraft between cycles |
| Rhino / Growler | F/A-18E/F / EA-18G (radio type names) |
| Rows (One-Four) | Bow parking lanes either side of cats 1 and 2 |
| RRHB | Repeatable-release holdback bar |
| Safe-shot line | Painted line beside a cat; nothing may be on the cat's side of it when it fires |
| Shooter | Catapult officer |
| Six-pack | Row of spots along the foul line in front of the island |
| Spin | Extra 360 in the pattern to fix spacing |
| Street | Fore-aft taxi and fire lane inboard of El 1, the corral and El 2 |
| Taking tension | The last words spoken before a launch |
| Tilly | Crash crane (A/S32A-35A) |
| Trap | Arrested landing |
| Trick or treat | Fuel for exactly one more pass, then divert |
| TSPO | Topside Safety Petty Officer; last man out from under the jet |
| Vultures' Row | Spectator balconies below Pri-Fly |
| Wave-off | Mandatory LSO-ordered go-around |
| Wipeout | Full control-stick sweep before the salute |
| WOD | Wind over deck (25-35 kt for jets) |
| Wye | Y-shaped lead-in groove aft of the shuttle where the jet stops for hookup |
| Zip lip | Minimal-radio Case I ops |
| 1MC / 3MC / 5MC | Shipwide / hangar / flight-deck announcing systems |

---

## 9. Palette and visual notes

### 9.1 Neutrals and deck

| Token | Hex | Use | Basis |
|---|---|---|---|
| `--page-bg` | #15171A | page (dark default) | design choice |
| `--ocean` | #1B2228 | sea | design choice |
| `--deck` | **#3D4044** | non-skid flight deck: dark grey, not black. One flat tone, no texture | [DOC] family; [SRC] shade |
| `--deck-wear` | #35383C | LA wear band (X 200-360 smear) | [EST] |
| `--deck-edge` | #5A5E63 | outline, catwalk hint | design choice |
| `--island` | #6B7076 | island | design choice |
| `--aircraft` | #A9AEB3 | jet fill (ghost grey; lighter than the deck) | [EST] FS 36375/36320 |
| `--aircraft-edge` | #7C8288 | jet outline and tails | design choice |
| `--marking-white` | #E6E4DE @ 70-85% | LA edges, ladders, centerline, numbers | [DOC] white |
| `--marking-yellow` | #D9B42A | lead-in and taxi lines | [EST] |
| `--marking-red` | #B8332C | foul line red segments (alternating with white; dash 8/8 at 1 ft/px), blast hatching, elevator striping with yellow | [DOC] red/white foul line |
| `--wire` | #C9CCCF | arresting wires | design choice |
| `--padeye` | #4A4D51 | faint dot grid, 10 ft rows offset 5 ft | [SRC] |
| `--ui-text` / secondary | #E8E8E6 / #9AA0A6 | UI | design choice |
| Light mode | page #EEEDEA, ocean #DADDE0, deck stays #3D4044, text #1D1F22 | | design choice |

### 9.2 Jerseys (the only saturated colors on screen)

| Jersey | Hex | Shape (CVD redundancy) | Contrast on deck |
|---|---|---|---|
| Yellow | **#F5C400** | triangle | about 6.4:1 |
| Green | **#2FA84F** | circle | about 3.4:1 |
| Blue | **#2F6FDB** | square | about 2.0:1 (needs ring) |
| Red | **#E0352B** | diamond | about 2.3:1 (needs ring) |
| Brown | **#8B5A2B** | rounded square + dot | about 1.6:1 (needs ring) |
| Purple | **#8E44AD** | hexagon | about 1.7:1 (needs ring) |
| White | **#F4F4F1** | ringed circle | about 8.9:1 |
| Checkerboard (final checkers) | #F4F4F1 / #111213, 2×2 or 4×4 checks | checker-filled circle | high |

These hexes are design choices tuned for contrast on the deck; the jersey colors themselves are [DOC]. Contrast figures are approximate; check them in implementation.

Rendering rules:
- Every crew marker gets a 1 px ring: white @ 60%, or black @ 60% on white and yellow.
- **Top-down, draw the jersey as the body and the helmet as a dot.** Render the mismatches: shooter and AGO = yellow body with a green dot; CSO = green with a yellow vest; elevator operators and talkers = blue with a white dot; final checker = checker body with a green dot; LSO = white, no dot; ordnance = red with a black band.
- **Legend order:** follow the NHHC poster: Blue, Purple, Green, Yellow, Red, Brown, White.
- CVD-safe toggle: green → #1BA6A6, red → #E8590C. Keep the true colors as the default.
- Never show clear/foul by red/green alone: add the text "CLEAR DECK" / "FOUL DECK" and an icon.

### 9.3 Lights and status colors (suggested hexes; colors [DOC])

| Light | Color | Hex |
|---|---|---|
| Director wand | amber | #FFB000 |
| Shooter green / red wand | green / red | #39D353 / #FF3B30 |
| TSPO / centerdeck / weight board wand | white | #FFFFFF |
| Checker wand | blue | #3D8BFF |
| Island beacon | red / amber / green | #FF3B30 / #FFB000 / #39D353 |
| Deck-status light (AGO) | red / green | #FF3B30 / #39D353 |
| Cat deck lights | MIL green / CRT amber, flashing = final ready | #39D353 / #FFB000 |
| Suspend light | red, flashing | #FF3B30 |
| Lens | ball amber, datums green, wave-off red (flashing), cut lights green | #FFB000 / #39D353 / #FF3B30 / #39D353 |
| Night deck flood | dim red/amber | #3A1A14 |
| Drop line / LA edge lights | red-amber / white | #FF6A3D / #FFFFFF |

### 9.4 Line weights at 1 ft/px (scale with zoom, minimum 1 device px)

| Element | Weight and style |
|---|---|
| Deck outline | 1.5 px |
| LA edges | 1.5 px white @ 70% |
| Ladder rungs | 1 px, 10 ft long, every about 50 ft |
| Centerline | 1.5 px, dash 20 / gap 20 |
| Foul line | 2 px, red/white dash 8/8 |
| Cat slot | 1 px dark + 1 px white offset |
| Wires | 1 px |
| Lead-ins | 1 px yellow @ 70% |

- Labels: CAT 1-4, ELEV 1-4, wires 1-4, in the NATOPS handler line-art style.
- A raised JBD is a thick bar with a short shadow.
- Respect `prefers-reduced-motion`.

---

## 10. Sources

Grouped and deduplicated. The research files carry the per-claim attribution.

**Navy manuals and official documents**
- NAVAIR 00-80T-120, CVN Flight/Hangar Deck NATOPS (2010): https://mail.mnvdet.com/CV/References/USNavy-CVN-FlightDeck.pdf
- NAVEDTRA 14310 ABE ch. 3, 4, 5: https://www.globalsecurity.org/military/library/policy/navy/nrtc/14310_ch3.pdf ; https://www.globalsecurity.org/military/library/policy/navy/nrtc/14310_ch4.pdf ; https://www.globalsecurity.org/military/library/policy/navy/nrtc/14310_ch5.pdf
- NAVEDTRA 14003 ABF ch. 4, 5 (fuel): https://www.globalsecurity.org/military/library/policy/navy/nrtc/14003_ch4.pdf ; https://www.globalsecurity.org/military/library/policy/navy/nrtc/14003_ch5.pdf
- tpub ABE / ABH / Airman / CATCC pages:
  - https://navyaviation.tpub.com/14310/css/Chapter-4-Steam-Powered-Catapults-135.htm
  - https://navyaviation.tpub.com/14310/css/Caution-194.htm
  - https://navyaviation.tpub.com/14310/css/Integrated-Catapult-Control-Station-Iccs-Suspend-Procedures-195.htm
  - https://navyaviation.tpub.com/14310/css/Table-3-1-Leading-Particulars-Of-Mk-7-Mod-3-Recovery-Equipment-75.htm
  - https://navyaviation.tpub.com/14310/css/Aircraft-Weight-Selector-System-And-Electrical-Circuit-78.htm
  - https://navyaviation.tpub.com/14310/css/Topside-And-Deckedge-Areas-130.htm
  - https://navyaviation.tpub.com/14001/css/Mk-7-Mod-0-Jet-Blast-Deflector-216.htm
  - https://navyaviation.tpub.com/14001/css/Integrated-Catapult-Control-Station-Iccs-Launching-Procedures-209.htm
  - https://navyaviation.tpub.com/14001/css/Safety-Precautions-210.htm
  - https://navyaviation.tpub.com/14001/css/Deckedge-Control-Station-80.htm
  - https://navyaviation.tpub.com/14001/css/Sheave-Up-And-By-Pass-Switch-And-Indicator-Panel-100.htm
  - https://navyaviation.tpub.com/14014/css/14014_216.htm
  - https://navyaviation.tpub.com/14014/css/14014_218.htm
  - https://navyaviation.tpub.com/14014/css/14014_246.htm
  - https://navyaviation.tpub.com/14014/css/14014_247.htm
  - https://navyaviation.tpub.com/14014/css/14014_248.htm
  - https://navyaviation.tpub.com/14014/css/14014_267.htm
  - https://navyaviation.tpub.com/14014/css/14014_273.htm
  - https://navyaviation.tpub.com/14313/css/Weapons-Handling-Procedures-336.htm
  - https://navyaviation.tpub.com/14342A/Table-11-4-Weather-Criteria-For-Departures-And-Recoveries-378.html
  - https://navyaviation.tpub.com/14342A/Fixed-Wing-Aircraft-Marshal-Procedures-431.html
  - https://navyaviation.tpub.com/14342A/Figure-4-11-Overhead-View-Of-Airfield-And-Markings-171.html
- CNATRA P-1211, CNATRAINST 3740.9D, P-481:
  - https://navyflightmanuals.tpub.com/P-1211/Flight-Deck-Procedures-50.htm
  - https://navyflightmanuals.tpub.com/P-1211/Catapult-Procedures-Continued-56.htm
  - https://navyflightmanuals.tpub.com/P-1211/Deck-Procedures-P-12110090-90.htm
  - https://navyflightmanuals.tpub.com/P-1211/Ball-Call-38.htm
  - https://navyflightmanuals.tpub.com/P-1211/Improved-Fresnel-Lens-Optical-Landing-System-Iflols-P-12110021-21.htm
  - https://navyflightmanuals.tpub.com/P-1211/Component-Description-18.htm
  - https://navyflightmanuals.tpub.com/P-1211/Glossary-P-12110080-80.htm
  - https://navyflightmanuals.tpub.com/P-1211/Hot-Seat-Procedures-53.htm
  - https://navyflightmanuals.tpub.com/3740.9Dwch1&2&3&4/3740.9Dwch1&2&3&40036.htm
  - https://navyflightmanuals.tpub.com/3740.9Dwch1&2&3&4/3740.9Dwch1&2&3&40078.htm
  - https://www.cnatra.navy.mil/local/docs/pat-pubs/P-481.pdf
- Naval Safety Center, *Flight Deck Awareness*:
  - https://www.airpac.navy.mil/Portals/53/Flight%20Deck%20Awareness%20V2.pdf
  - https://web.archive.org/web/2009/http://safetycenter.navy.mil/media/downloads/FlghtDckAware_CV_03.pdf
  - https://webarchive.library.unt.edu/web/20090814022730/http:/safetycenter.navy.mil/media/downloads/FlghtDckAware_CV_03.pdf
- Naval Safety Command:
  - https://navalsafetycommand.navy.mil/Portals/100/Documents/SA%2025-01%20Aircraft%20Towing%20and%20Towing%20Gear%20Mishaps.pdf
  - https://navalsafetycommand.navy.mil/Portals/29/Hand_signals-Chart1.pdf
  - https://navalsafetycommand.navy.mil/Portals/100/Hand_signals-Chart2.pdf
  - https://issuu.com/navalsafetycommand/docs/2010-2011_winter/s/14834265
  - https://issuu.com/navalsafetycommand/docs/2010-2011_winter/s/14834266
  - https://issuu.com/navalsafetycommand/docs/approach_vol65-no2/s/22880339
  - https://issuu.com/navalsafetycommand/docs/vol64_no2/s/14803803
  - https://issuu.com/navalsafetycommand/docs/vol64_no2/14
- Navy SBIR:
  - https://navysbir.com/n19_2/N192-100.htm
  - https://www.navysbir.com/n08_1/N081-014.htm
  - https://navysbir.com/08_1/32.htm
  - https://www.navysbir.com/08_1/35.htm
- Patents:
  - https://patents.google.com/patent/US8360361
  - https://patents.justia.com/patent/4101099
  - https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5287104
- SAE paper (RRHB history): https://saemobilus.sae.org/papers/history-development-repeatable-release-catapult-holdback-bar-851942
- MIL-PRF-24667 / NAVSEA non-skid:
  - https://everyspec.com/MIL-PRF/MIL-PRF-010000-29999/MIL-PRF-24667B_10276/
  - https://www.nsrp.org/wp-content/uploads/2018/09/04-NSRP-SPC-Panel-NAVSEA-05-Pittsburgh-2018-public.pdf
- NAWCWD TP 8516 (fuel stations): https://apps.dtic.mil/sti/pdfs/ADA432176.pdf
- NAVAIR Shipboard Tow Tractor: https://www.navair.navy.mil/product/Shipboard-Tow-Tractor-STT
- Navy fact files:
  - https://webharvest.gov/peth04/20041016160604/http:/www.chinfo.navy.mil/navpalib/factfile/ships/ship-cv.html
  - https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2166036/ea-18g-growler-airborne-electronic-attack-aircraft/
- Army FM 1-564 (joint deck colors, ship ops):
  - https://www.globalsecurity.org/military/library/policy/army/fm/1-564/AF.HTM
  - https://www.globalsecurity.org/military/library/policy/army/fm/1-564/CH6.HTM
- NHHC "Rainbow Jerseys": https://kommandopost.com/files/FINAL_RainbowJerseys_highres_PDF.pdf

**Navy releases (navy.mil, DVIDS, All Hands)**
- navy.mil:
  - https://www.navy.mil/Press-Office/News-Stories/Article/2250055/cyclic-ops-our-new-standard
  - https://www.navy.mil/Press-Office/News-Stories/Article/2254134/old-school-meets-new-school-flight-deck-ouija-boards-go-digital/
  - https://www.navy.mil/Press-Office/News-Stories/Article/2254452/yellow-shirts-setting-the-tone-for-the-flight-deck/
  - https://www.navy.mil/Press-Office/News-Stories/Article/2254992/ikes-bow-catapult-crew-key-to-mission-success
  - https://www.navy.mil/Press-Office/News-Stories/Article/2265022/gws-v-2-geared-for-aircraft-arrest/
  - https://www.navy.mil/Press-Office/News-Stories/display-news/Article/2254822/crash-salvage-crane-returns-to-lincoln/
- Naval Aviation News: https://navalaviationnews.navy.mil/Editorial-Staff-Tools/Article-Submission/Article/3728099/embarked-airwing-conducts-f-35c-cyclic-operations-aboard-george-washington/
- DVIDS news:
  - https://www.dvidshub.net/news/printable/148007
  - https://www.dvidshub.net/news/255096/colors-flight-deck
  - https://www.dvidshub.net/news/255118/eyes-deck
  - https://www.dvidshub.net/news/printable/331511
  - https://www.dvidshub.net/news/printable/334934
  - https://www.dvidshub.net/news/printable/383371
  - https://www.dvidshub.net/news/412908/blog-create-effective-aircraft-movement-brief
  - http://www.dvidshub.net/news/438789/lets-talk-about-tilly
  - https://www.dvidshub.net/news/printable/458054
  - https://www.dvidshub.net/news/505324/face-defense-navy-shooters-launch-carrier-jets
- DVIDS images:
  - https://www.dvidshub.net/image/6295115
  - https://www.dvidshub.net/image/9784253/uss-nimitz-conducts-ordnance-offload
  - https://www.dvidshub.net/image/9578230/nimitz-conducts-flight-deck-operations
  - https://www.dvidshub.net/image/9424686/nimitz-sailors-conduct-flight-deck-operations
  - https://www.dvidshub.net/image/9200246/nimitz-conducts-flight-operations
- All Hands galleries:
  - https://allhands.navy.mil/Media/Gallery/igphoto/2002361914
  - https://allhands.navy.mil/Media/Gallery/igphoto/2003094494
- USS Enterprise barricade drill: https://www.globalsecurity.org/military/library/news/2010/03/mil-100317-nns04.htm
- Carl Vinson takes custody of Tilly: https://www.globalsecurity.org/military/library/news/2007/11/mil-071106-nns05.htm

**Imagery (deck measurement)**
- Esri World Imagery tile service (zoom 19; Norfolk Pier 12 CVN-77; PSNS Dry Dock 6; NAS North Island): https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
- Wikimedia Commons:
  - https://commons.wikimedia.org/wiki/File:Top_down_view_of_USS_Carl_Vinson_and_HMAS_Ballarat_conducting_fueling-at-sea_in_the_Bay_of_Bengal_during_October_2021.jpg
  - https://commons.wikimedia.org/wiki/File:Overhead_view_of_USS_Gerald_R._Ford_(CVN-78)_and_USS_Harry_S._Truman_(CVN-75)_in_the_Atlantic_Ocean_on_4_June_2020_(200604-N-OH637-1453).JPG

**Reference and encyclopedic**
- Wikipedia:
  - https://en.wikipedia.org/wiki/Modern_United_States_Navy_carrier_air_operations
  - https://en.wikipedia.org/wiki/Nimitz-class_aircraft_carrier
  - https://en.wikipedia.org/wiki/Arresting_gear
  - https://en.wikipedia.org/wiki/Aircraft_catapult
  - https://en.wikipedia.org/wiki/Optical_landing_system
  - https://en.wikipedia.org/wiki/Landing_signal_officer
  - https://en.wikipedia.org/wiki/Bolter_(aeronautics)
  - https://en.wikipedia.org/wiki/Tailhook
  - https://en.wikipedia.org/wiki/Jet_blast_deflector
  - https://en.wikipedia.org/wiki/Plane_guard
  - https://en.wikipedia.org/wiki/Launch_and_recovery_cycle
  - https://en.wikipedia.org/wiki/Ready_5
  - https://en.wikipedia.org/wiki/Alpha_strike_(United_States_Navy)
  - https://en.wikipedia.org/wiki/Boeing_F/A-18E/F_Super_Hornet
  - https://en.wikipedia.org/wiki/Boeing_EA-18G_Growler
- Wiktionary, US Navy slang: https://en.wiktionary.org/wiki/Appendix:Glossary_of_U.S._Navy_slang
- GlobalSecurity:
  - https://www.globalsecurity.org/military/systems/ship/cvn-68-design.htm
  - https://www.globalsecurity.org/military/systems/aircraft/f-18-specs.htm
- FAS CVN-68: https://man.fas.org/dod-101/sys/ship/cvn-68.htm
- Hazegray: https://losthistory.net/hazegray/navhist/carriers/us_super.htm
- Los Barcos de Eugenio: https://www.losbarcosdeeugenio.com/barcos/en/us/usn_CVN69.html
- HeraldNet: https://www.heraldnet.com/news/the-uss-nimitzs-stats/
- Strasam: https://strasam.org/en/defense/naval-weapons-and-systems/vertical-logistics-on-floating-fortresses-the-elevator-systems-of-nimitz-and-ford-class-aircraft-carriers-4178
- Aircraft data:
  - https://aerospaceweb.org/aircraft/fighter/f18ef/
  - https://aerospaceweb.org/question/planes/q0157.shtml
  - https://aeropedia.com.au/?p=11460
  - https://aviationweek.com/ea-18g-growler-specs
  - https://archive.aoe.vt.edu/mason/Mason_f/FA18.pdf
  - https://www.aircraftrecognitionguide.com/mcdonnell-douglas-f-18
  - https://forums.vrsimulations.com/support/index.php/Superbug_General_Aircraft_Information
- Smithsonian Air & Space:
  - https://www.smithsonianmag.com/how-things-work/the-meatball-8421491/
  - https://www.smithsonianmag.com/air-space-magazine/hook-and-release-180955352/
  - https://www.smithsonianmag.com/air-space-magazine/how-things-work-the-ouija-board-10048217/
- UTK thesis (FLOLS): https://trace.tennessee.edu/utk_gradthes/9408
- MNV carrier design notes: https://mail.mnvdet.com/CV/CV-FltDkA.html
- MIT work:
  - https://news.mit.edu/2011/automated-flight-decks-0802
  - https://dspace.mit.edu/handle/1721.1/97255
  - https://dspace.mit.edu/handle/1721.1/81478
- Academic scheduling papers:
  - https://doi.org/10.1177/15485129221150939
  - https://www.researchgate.net/publication/328692146_A_Proactive_Robust_Scheduling_Method_for_Aircraft_Carrier_Flight_Deck_Operations_with_Stochastic_Durations
  - https://www.sciencedirect.com/science/article/pii/S2214914724001818
- USUHS noise study: https://scholar.usuhs.edu/en/publications/living-at-work-24-hour-noise-exposure-aboard-us-navy-aircraft-car/

**Journalism and practitioner accounts**
- PBS Frontline (Enterprise launch): https://www.pbs.org/wgbh/pages/frontline/shows/navy/enterprise/launchland/launch1.html (also launch3.html and launch4.html)
- The War Zone:
  - https://www.twz.com/3559/how-to-land-a-fighter-on-an-aircraft-carrier-on-a-stormy-night
  - https://www.twz.com/sea/why-the-ford-class-carriers-island-superstructure-is-located-so-far-back
  - https://www.twz.com/11355/this-syria-bound-super-hornet-is-carrying-a-uniquely-massive-bomb-load
- USNI:
  - https://news.usni.org/2026/08/24/uss-gerald-r-ford-sortie-test-exceeded-nimitz-class-performance-says-cno-caudle
  - https://news.usni.org/?p=115853
  - https://www.usni.org/magazines/proceedings/1998/september/surge-97-demonstrating-carriers-firepower-potential
  - https://www.usni.org/magazines/proceedings/2018/august/safer-way-ships-do-plane-guard
  - https://www.usni.org/magazines/proceedings/2019/october/stop-routine-organic-tanking-persian-gulf
- Navy Times / Stars and Stripes:
  - https://www.navytimes.com/news/your-navy/2016/03/18/8-sailors-injured-in-arresting-cable-accident-on-carrier-ike/
  - https://navytimes.com/news/your-navy/2016/07/14/horrific-cable-mishap-caused-by-maintenance-errors-navy
  - https://www.stripes.com/migration/pilots-sailors-recount-f-a-18-s-plunge-into-sea-from-flight-deck-of-kitty-hawk-1.31072
  - https://www.stripes.com/news/navy/old-school-ouija-board-being-phased-out-on-navy-carriers-1.151711
- Fighter Sweep / SOFREP:
  - https://fightersweep.com/3864/ask-a-fighter-pilot-hand-signals-on-the-flight-deck/
  - https://fightersweep.com/3473/war-party-final-checks-prior-launch/
  - https://fightersweep.com/3339/carrier-flight-ops-aboard-the-stennis/
  - https://sofrep.com/fightersweep/carrier-flight-ops-aboard-the-stennis/
  - https://fightersweep.com/837/the-ultimate-carrier-break/
  - https://fightersweep.com/6143/watch-time-lapse-day-carrier-flight-deck/
- The Aviationist:
  - https://theaviationist.com/2012/06/18/carrier-recovery-procedures/
  - https://theaviationist.com/2014/06/16/vfa-87-slot-check-video/
- AOPA: https://www.aopa.org/news-and-media/all-news/2017/april/pilot/aircraft-carrier
- Seapower: https://seapowermagazine.org/?p=3588
- MigFlug:
  - https://migflug.com/afterburner/zero-to-165-mph-in-two-seconds-how-carriers-launch-jets/
  - https://migflug.com/afterburner/?p=28122791
  - https://migflug.com/afterburner/?p=24690531
  - https://migflug.com/afterburner/carrier-barricade-explained-nylon-net-aircraft-carrier/
- SlashGear:
  - https://www.slashgear.com/1983974/how-many-planes-can-aircraft-carriers-launch-per-minute
  - https://www.slashgear.com/1952398/why-aircraft-carrier-crew-members-do-fod-walks-before-flight-operations
  - https://www.slashgear.com/1912459/owing-on-aircraft-carriers-what-are-tow-tractors/
- WION: https://www.wionews.com/photos/-20-second-launches-how-fast-is-the-uss-george-h-w-bush-catapult-system-1776978336700
- USNA Naval Aviation: https://www.usna.edu/NavalAviation
- Trafficnews.jp (ICCS): https://trafficnews.jp/post/664675
- Sandboxx: https://www.sandboxx.us/news/why-aircraft-carrier-crews-wear-different-shirt-colors-and-what-they-mean/
- Jalopnik:
  - https://jalopnik.com/here-is-what-all-those-colored-shirts-on-an-aircraft-ca-1757896999
  - https://www.jalopnik.com/i-spent-24-hours-on-board-a-us-navy-aircraft-carrier-at-1541114300/
- 99% Invisible: https://99percentinvisible.org/?p=22000
- Military Times: https://www.militarytimes.com/photo-galleries/2010/02/06/rainbow-sideboys
- Military.com (E-2D strikes Super Hornets): https://365.military.com/daily-news/2019/08/20/e-2d-hawkeye-aircraft-takes-out-4-super-hornets-carrier-repairs-underway.html
- Yahoo / Business Insider (Truman hard turn): https://www.yahoo.com/news/articles/us-aircraft-carriers-hard-turn-190836426.html
- GovExec (Handler): https://www.govexec.com/management/2010/02/truman-thursdays-the-handler-explains-it-all/39667/
- Ouija board:
  - https://www.wearethemighty.com/articles/the-crazy-way-an-aircraft-carrier-tracks-all-of-its-aircraft-on-ship/
  - https://www.strategypage.com/htmw/htnavai/articles/20110812.aspx
  - https://www.strategypage.com/htmw/htnavai/articles/20231212.aspx
  - https://eflightlevel.blogspot.com/2012/10/see-why-every-us-aircraft-carrier-needs.html
- We Are The Mighty: https://www.wearethemighty.com/articles/the-12-most-important-places-on-an-aircraft-carrier-top-to-bottom/
- HowStuffWorks:
  - https://science.howstuffworks.com/aircraft-carrier4.htm
  - https://science.howstuffworks.com/aircraft-carrier5.htm
- FunTrivia: https://www.funtrivia.com/trivia-quiz/World/Contemporary-US-Aircraft-Carrier-Lingo-172106.html
- Task & Purpose: https://taskandpurpose.com/news/9-naval-aviation-slang-terms-never-knew-needed
- A. Adkins (ABH, Kitty Hawk):
  - https://azadkinsiii.com/blog/94-flight-deck-operations-aircraft-launch/
  - https://azadkinsiii.com/blog/67-flight-ops-a-day-in-the-life-of-crash-salvage/
  - https://azadkinsiii.com/blog/136-what-makes-the-flight-deck-so-exciting/
- Skyhawk Association: https://www.skyhawk.org/article-unit/vt7-cva66-running-the-deck
- IWM taxi signals: https://www.iwm.org.uk/collections/item/object/22336
- Brainscape study decks:
  - https://brainscape.com/flashcards/flight-deck-colors-1-18301347/packs/22735162
  - https://brainscape.com/flashcards/hand-signals-18272954/packs/22727577
  - https://www.brainscape.com/flashcards/2384213/packs/4223164
  - https://www.brainscape.com/flashcards/1946984/packs/3547114
  - https://www.brainscape.com/flashcards/2486333/packs/4394884
- Cueflash EAWS: https://cueflash.com/decks/tag/eaws/tag/list/121377/eaws_vfa_specific
- Modeling:
  - https://alexsmodelling.blogspot.com/2014/12/us-navy-flight-deck-tractor-models.html
  - https://mail.hyperscale.com/2010/reviews/kits/sw48005reviewrk_1.htm
  - https://mail.modelingmadness.com/review/misc/robertoe2.htm
  - https://forum.finescale.com/t/best-color-for-modern-carrier-flight-deck/377975
- Dengeki Hobby (via Our Star Blazers): https://www.ourstarblazers.com/vault/DH1303

**Deck diagrams, simulator and community sources [SRC]**
- combat.ws SailorSpeak:
  - http://www.combat.ws/S4/SAILOR/APNDX6.HTM
  - http://www.combat.ws/S4/SAILOR/IMAGES/FLYTDECK.JPG
- navysite.de: https://www.navysite.de/cvn/flightdeck.htm
- DCS Supercarrier Operations Guide: https://www.digitalcombatsimulator.com/upload/iblock/e1b/430ooc582lpb0npynbsewan6omd5ohvs/DCS_Supercarrier_Operations_Guide_EN.pdf
- Hoggit:
  - https://wiki.hoggitworld.com/view/Carrier_Air_Operations
  - https://wiki.hoggitworld.com/view/DCS_editor_carrier_spawns
- Master Arms:
  - https://wiki.masterarms.se/index.php/CASE_1
  - https://wiki.masterarms.se/index.php/CASE_3
- SimTuts: https://simtuts.com/guides/carrier-case-operations-guide
- 132nd Virtual Wing:
  - https://132nd-vwing.github.io/OPAC-Brief/MISSION%20INFORMATION/Carrier.html
  - https://132nd-vwing.github.io/TRMA-Brief/PAGES/Carrier.html
- DCS forums:
  - https://forum.dcs.world/topic/184866-meatball-and-icls-angle
  - https://forum.dcs.world/topic/237785-iflols-vs-icls/
  - https://forum.dcs.world/topic/231148-launch-bar-not-retracting
  - https://forum.dcs.world/topic/255530-sme-advice-sought-controls-wipe-out-pre-catapult-launch-afcs-aircraft
  - https://forum.dcs.world/topic/262004-how-cyclic-ops-really-works-by-gb-and-pieter
  - https://forum.dcs.world/topic/311344-parking-places-on-carriers-with-supercarriers
  - https://forum.dcs.world/topic/366738-query-regarding-spawn-points-orders-and-statics-parking
- Other forums:
  - https://forum.falcon-bms.com/post/160551
  - https://bobistheoilguy.com/forums/threads/a-question-for-astro.295069
  - https://www.pprune.org/11175056-post11.html
  - https://www.f-16.net/forum/viewtopic.php?p=10627

---

## Appendix: still uncertain (tune visually; do not present as fact)

| Item | Why it is uncertain | What to do |
|---|---|---|
| Starboard foul-line offset (CL + 47 ft) | Not resolved in imagery. Chosen because it fits the outer ladder and joins the stern corner to the crotch | Keep it as config; check it against an overhead photo |
| Port foul line and El 4 / finger usability | One diagram plus DCS; the finger had to be relocated | Low-confidence labels |
| Lens, LSO platform and E4 positions | Candidate structures in 0.78 ft/px imagery, ±15-25 ft | Fine at overview scale |
| Six-pack and street layout | The measured geometry leaves about 73 ft between the foul line and E2, too little for a full six-pack plus a 40 ft lane | Fill the six-pack last; show the street pinching |
| Point slots versus cat 1 | Cat 1 is measured close to the starboard edge, so the point jets foul its safe-shot line | Occupy the point only when cat 1 is idle, or with the next cat-1 launcher |
| All crew positions in feet | NATOPS gives rules, not distances | Treat as waypoints satisfying the ‖v‖ ≥ 25 ft rule |
| All catapult step durations, launch pacing, tow times, fold time | No frame-timed video measurement | Calibrate to the 20-25 s burst and 8-10 min per 12-jet event |
| Case I bolter climb altitude (600 vs 1,200 ft) | Sources do not separate the two cases | Use 600 (Case I) and 1,200 (Case III) |
| Tractor count (12), fuel-station count and positions (16) | Extrapolated from a 1970s account and a fire-protection report excerpt | Tunable |
| Hummer hole, Tilly and P-25 spots | One source, or "predesignated" only | Tunable |
| CVN-76/77 island differences; which older hulls run 3 wires | Unverified | 4-wire default + toggle |
