# 01 - Nimitz-class Flight Deck Geometry and Layout

Purpose: give a developer enough numbers to draw an accurate top-down schematic of a Nimitz-class (CVN-68 to CVN-77) flight deck. The deck is the stage for the launch and recovery animation.

**Confidence tags used below**
- **[DOC]**: documented in at least one reasonably authoritative source (Navy, NAVAIR/NAVSEA, FAS, Wikipedia citing Navy data). Cross-checked where noted.
- **[SRC-WEAK]**: from a single secondary source, simulator documentation (DCS Supercarrier guide, written with SME input) or a practitioner forum post.
- **[EST]**: my estimate. It is derived from the documented numbers, plan-view proportions and geometric consistency, and is **not** a published figure.

The NATOPS CV manual (NAVAIR 00-80T-105) and the ship's Air Department SOP/LSO bulletins hold the exact numbers. Neither is openly available, so all coordinates below are a geometrically consistent reconstruction, not official drawings.

---

## 1. Overall dimensions

| Item | Value | Tag / notes |
|---|---|---|
| Length overall (flight deck length) | **1,092 ft** (332.8 m). CVN-68 to 70 are often quoted as 1,088 ft | [DOC] Wikipedia, FAS, Hazegray |
| Length at waterline | **1,040 ft** (317 m) | [DOC] Wikipedia, Hazegray |
| Flight deck max width (extreme beam) | **252 ft** (76.8 m). Quoted values range from 250 to 257 ft depending on ship and how the measurement is taken | [DOC] Wikipedia/FAS 252, Hazegray 257 (CVN-68 to 70) and 250 (CVN-71+) |
| Waterline beam | **134 ft** (40.8 m) | [DOC] |
| Flight deck area | **~4.5 acres** (~196,000 sq ft) | [DOC] FAS, TWZ |
| Flight deck height above waterline | ~60 ft | [EST] |
| Hangar clear height | 7.6 m (~25 ft). The hangar occupies about 2/3 of the ship length in 3 fire bays | [DOC] |
| Overhang of flight deck beyond waterline | ~52 ft total (1,092 - 1,040), mostly at the bow flare and the stern round-down | [EST] derived |

The deck is **asymmetric**. The angled-deck sponson makes the port side extend much farther from the keel line than the starboard side. My estimate is that the port extreme is about 150 ft from the centerline (at the forward tip of the angled deck, "the point") and the starboard extreme is about 100 ft (the starboard deck edge, island and elevator outer edges) [EST]. The two add up to the documented 252 ft.

## 2. Angled deck / landing area

| Item | Value | Tag |
|---|---|---|
| Angle of landing-area centerline to ship centerline | **9 deg to port**. Wikipedia notes it was slightly reduced from earlier carriers for better airflow. The DCS guide's "14 deg" is wrong | [DOC] Wikipedia |
| Angled deck length (ramp to forward edge along the angle) | **~780 ft** (237.7 m) | [DOC] losbarcosdeeugenio (single source); geometrically consistent |
| Landing area painted width | **~110 ft** (edge line to edge line) | [EST] |
| Landing centerline position at the ramp | Approximately on the ship centerline, about 5 ft starboard in my model | [EST] |
| Ramp / round-down | The aft edge of the flight deck at the stern. The deck curves down here and is the hazard for a low approach ("ramp strike") | [DOC] concept |
| Bolter exit | An aircraft that misses the wires rolls off the forward-port end of the angle (near "the point") and flies away | [DOC] concept |

The **foul line** (also called the "safe parking line") is an alternating red and white striped line along the starboard boundary of the landing area. It separates the landing area from the parking and taxi area. No aircraft, equipment or person may be across it during a recovery. A Navy ABH training manual (tpub) describes it as "the alternating red and white striped line ... called the foul line or safe parking line" [DOC]. The **landing area centerline** is a dashed white line and the edge lines are solid white [EST, consistent with photos]. A run of white **centerline lights** is set into the deck along the landing centerline. The **drop line** is a vertical string of lights hanging down the stern below the ramp, which extends the landing centerline for night line-up [DOC concept, details EST].

## 3. Arresting gear (Mk 7 Mod 3)

| Item | Value | Tag |
|---|---|---|
| Number of cross-deck pendants | **4** on CVN-68 to 75. **3** on CVN-76 *Ronald Reagan* and CVN-77 *George H.W. Bush* (built that way because the 4th wire was rarely used) | [DOC] Wikipedia (two articles) |
| Later reductions to 3 wires | There are anecdotal reports that the #1 wire has been removed or left unrigged on some older Nimitz ships in recent years. I could not confirm which ships. Treat all of CVN-68 to 75 as 4-wire | [SRC-WEAK] forum anecdote; open question |
| Numbering | 1 (aft) to 4 (forward) | [DOC] |
| Target wire | **3-wire** on 4-wire ships; **2-wire** on 3-wire ships (on 3-wire ships the 2-wire sits roughly where the 3-wire would be) | [DOC] Wikipedia, DCS guide |
| Pendant spacing | **~40 ft** between wires. HowStuffWorks and similar sources say "~50 ft", but the USN design default (40 ft) and a thesis describing the touchdown zone as "a 40-foot section between the 2nd and 3rd wires" support 40 ft | [DOC/SRC-WEAK] mnvdet design spreadsheet (USN typical 40 ft); UTK thesis; forum. Use 40 ft |
| Ramp to #1 wire | **~175 ft** along the landing centerline. The USN design-rule default is 143 ft from the aft end of the landing zone | [SRC-WEAK] practitioner forum post (175 ft); mnvdet (143 ft) |
| Ramp to target hook touchdown point | **~230 ft** (between the 2- and 3-wires, so a good pass engages the 3-wire) | [SRC-WEAK] two independent forum citations of 230 to 235 ft; consistent with a 3.5 deg glideslope giving ~14 ft hook-to-ramp clearance (14 / tan 3.5 deg = 229 ft) |
| Wire positions from the ramp along the landing centerline | #1 ~175 ft, #2 ~215 ft, #3 ~255 ft, #4 ~295 ft | [EST] from the two rows above |
| Pendant span across deck | ~100 to 110 ft (sheave to sheave, roughly the landing area width) | [EST] |
| Cable diameter | 1-3/8 in (1, 1-1/4 or 1-3/8 in used) | [DOC] Wikipedia |
| Pendant life | Replaced after **125 arrestments** | [DOC] Wikipedia, DVIDS |
| Engines | 4 arresting engines plus 1 barricade engine below deck (one carrier reports 5 engines in total). About 55 ABE sailors maintain them | [DOC] DVIDS, FAS |
| Runout | Stops a 50,000 lb aircraft at 130 kt in **344 ft** in about 2 s. Typical trap rollout is ~300 to 350 ft | [DOC] Wikipedia; DCS "about 300 ft" |
| Barricade | Mk 7 barricade (nylon net), rigged only for emergencies, stanchions at the landing area edges forward of the #4 wire | [DOC] presence; position [EST] |

## 4. Catapults (C-13 steam)

| Item | Value | Tag |
|---|---|---|
| Number | 4. Cats **1 and 2 on the bow** (cat 1 starboard, cat 2 port). Cats **3 and 4 on the waist** (port side of the angled deck; cat 3 inboard, cat 4 outboard to port) | [DOC] DCS guide, Wikipedia |
| Type | **C-13-1** on CVN-68, 69, 70, 71. **C-13-2** on CVN-72 to 77 | [DOC] Wikipedia (C-13-1 list); C-13-2 assignment [SRC-WEAK] |
| Power stroke | C-13-1 **309 ft 8-3/4 in** (~310 ft). C-13-2 ~306 ft | [DOC] tpub NAVEDTRA table (C-13-1); C-13-2 value from memory [EST] |
| Track length | C-13-1 **324 ft 10 in** (~325 ft) | [DOC] tpub |
| Capacity | 80,000 lb at 140 kt | [DOC] Wikipedia |
| Bow cat orientation | Nearly parallel to the ship centerline, with a slight toe-out (~1 deg) to separate launch tracks | [EST] |
| Waist cat orientation | Roughly parallel to the angled deck (~9 deg to port). They lie inside the landing area, so **waist cats cannot launch during a recovery**; bow cats can | [DOC concept]; angle [EST] |
| Launch rate | All 4 cats together average about 1 launch every 20 s | [SRC-WEAK] DCS guide |
| Control | ICCS "bubble": a small dome set into the deck between cats 1 and 2 on the bow, and one to the left (port) of cat 4 on the waist | [SRC-WEAK] DCS guide |

## 5. Jet Blast Deflectors (JBDs)

| Item | Value | Tag |
|---|---|---|
| Number | 4, one directly aft of the launch position of each catapult | [DOC] |
| Mk 7 Mod 0 | 6 water-cooled panels, about **36 ft wide**, raised height **10.7 ft**, raises to **50 deg** from the deck. About 9 in recess when lowered flush | [DOC] Navy SBIR N192-100, tpub NAVAIR TM |
| Mk 7 Mod 1 / Mod 2 | Mod 1 has 4 panels (~24 ft wide); Mod 2 has 6 panels (~36 ft wide). Both are in fleet service | [SRC-WEAK] patent US8360361 |
| Position | The hinge line sits about 45 to 55 ft aft of the catapult shuttle start (just aft of a Hornet's tailpipes when its nose gear is in the shuttle). The panel runs perpendicular to the catapult track | [EST] |
| Behaviour | Raised as soon as the aircraft taxis over it onto the cat and lowered after the launch. The next aircraft queues behind it | [DOC] concept |

## 6. Island

| Item | Value | Tag |
|---|---|---|
| Side | Starboard deck edge | [DOC] |
| Fore/aft | Aft of midships, with **elevators 1 and 2 forward** of it and **elevator 3 aft** of it. The Ford-class island is 140 ft farther aft than the Nimitz island | [DOC] multiple; TWZ |
| Footprint | ~150 ft long x ~30 ft wide at deck level | [EST] |
| Height | ~7 decks / stories above the flight deck (Pri-Fly ~O-10 level) | [DOC] FAS "seven stories" |
| Key spaces | **Pri-Fly** (Air Boss, top of the island, glass facing aft and port over the landing area). **Vultures' Row** (open balconies on the island just below Pri-Fly, for spectators). **Flight Deck Control** (the Handler and the "Ouija board", at the island base, flight deck level). **Navigation bridge** (CO, forward-facing) | [DOC] FunTrivia/wearethemighty/MIT; levels [EST] |
| ICLS elevation antenna | Above the flight deck, aft of the island | [SRC-WEAK] DCS guide |

## 7. Aircraft elevators

| Item | Value | Tag |
|---|---|---|
| Number | 4 deck-edge elevators: **3 starboard** (#1 and #2 forward of the island, #3 aft of the island) and **1 port** (#4, aft, roughly opposite #3, at the aft end of the angled deck) | [DOC] TWZ, Wikipedia, Hazegray |
| Size | ~3,880 sq ft each (HeraldNet fact sheet). DCS says ">4,000 sq ft". The often-quoted 85 x 52 ft belongs to the **Ford** class. Model as ~**70-75 ft (fore/aft) x 52 ft (athwartships)** | [DOC] area; dims [EST] |
| Capacity | 47 long tons (~105,000 lb) rated per losbarcosdeeugenio. Holds **two** aircraft (two Hornets) | [DOC] mixed; "two aircraft" consistent |
| #4 port elevator | Sits in the landing area runout and is **not used during recoveries** | [EST] from geometry; widely stated in practice |
| #1 | Near the bow catapults; using it interferes with cat 1 traffic | [DOC] FAS / DCS |

## 8. Fly 1 / Fly 2 / Fly 3

Flight deck supervision is divided into three zones, each run by an Aircraft Handling Officer or Chief ("Bosun") and its yellow-shirt directors:
- **Fly 1** = the **bow**: cats 1 and 2, elevator 1, the bow parking areas.
- **Fly 2** = the **waist / midships**: cats 3 and 4, the area around the island forward to about elevator 2, the six-pack and the street.
- **Fly 3** = **aft**: the landing area and arresting gear, elevators 3 and 4, the fantail, the LSO platform area.

Boundaries in my coordinates: Fly 3 for x < ~400 ft, Fly 2 for x ~400 to 740 ft, Fly 1 for x > ~740 ft [EST]. The zone terms themselves are standard Air Department usage.

## 9. Named deck areas (parking nicknames)

These are practitioner slang. They are not in public Navy documentation and vary slightly ship to ship. Verification is weak: MIT's Ouija-board project confirms "the street" and "the fantail" as handler regions, and the DCS Supercarrier module (built with Navy SME input) uses six-pack, junkyard, patio, corral and point. Placements marked (L) are low confidence.

| Name | Where (my best reconstruction) | Typical use |
|---|---|---|
| **The bow** | Forward ~300 ft of deck, around cats 1 and 2 (Fly 1) | Parking during recovery (bow cats stay usable); pack-in for the night |
| **The point** | Forward-port tip of the angled deck, outboard of the cat 4 end | 1 to 2 aircraft. Parked there between cycles. Must be cleared before waist launches or recoveries reach that far |
| **The crotch** | The inside corner where the angled deck's forward edge meets the port bow edge, between cat 2 and the angle | Tight parking / tow lane near cat 2 |
| **Six-pack** | Row of ~6 spots amidships, just forward and inboard of the island, starboard of the foul line, abeam elevator 2 | Landing aircraft taxi here first and are refuelled/rearmed here; lead-in to the bow cats |
| **The street** | The taxi lane running fore and aft between the island/six-pack and the foul line, from the waist up to the bow cats | Main taxi route forward; aircraft also park nose-in along it |
| **The corral** (L) | Starboard deck edge between elevators 1 and 2 | 1 spot; push-back parking |
| **The patio** (L) | Starboard bow, forward of elevator 1, starboard of cat 1 | ~3 spots. Moving aircraft from here to elevator 1 crosses the cat 1 lead-in |
| **The junkyard** (L) | Starboard side aft of the island, inboard of elevator 3 | Staging for crash crane "Tilly", tow tractors and support gear; ~4 aircraft spots |
| **Hummer hole** (L) | Small notch tight against the island's aft end ("Hummer" = E-2 Hawkeye) | E-2 or aircraft parking slot beside the island |
| **The finger** (L) | Unconfirmed. Probably the narrow strip of deck on the port bow between cat 2 and the port edge | Parking 1 to 2 aircraft |
| **The fantail** | The aft starboard deck, starboard of the foul line, aft of elevator 3, out to the ramp | Parking aft; aircraft must be clear of the foul line during recovery |

## 10. LSO platform and IFLOLS ("the lens", "the ball")

| Item | Value | Tag |
|---|---|---|
| LSO platform | **Port side aft**, at the deck edge just outboard of the landing area's port boundary, roughly abeam the 1/2 wires. It has a safety net and a pit to jump into | [DOC] side; position [EST] |
| IFLOLS (Improved Fresnel Lens Optical Landing System) | Mounted on the **port side** of the landing area, at the deck edge, forward of the LSO platform. Fitted to carriers since 2004 (prototype on CVN-73 in 1997) | [DOC] Wikipedia, patent, Navy film description |
| Lens position along the deck | ~400 to 450 ft forward of the ramp | [EST] |
| Glideslope | Normally **3.5 deg** for Hornet/Growler, raised toward ~4 deg in heavy deck motion. Lens roll angle sets the touchdown point per aircraft type (hook-to-eye distance) | [SRC-WEAK] |
| Construction | Vertical cell column (12 fiber-optic cells; the bottom two show red = dangerously low). Green datum lights extend horizontally each side. Red wave-off lights and green cut lights are LSO-controlled with the "pickle" | [DOC] DCS / Wikipedia |
| Ball sensitivity | The ball goes off the top when ~0.75 deg high | [SRC-WEAK] |
| ICLS azimuth antenna | At the stern, slightly below the landing area centerline | [SRC-WEAK] DCS |

## 11. Markings and lighting summary

- **Landing area**: two solid white edge lines and a dashed white centerline at 9 deg. The ship's hull number is painted large at the aft end of the landing area and on the bow [EST/photos].
- **Foul line**: red/white striped line on the starboard edge of the landing area, running from the stern up to the crotch.
- **Catapult tracks**: shuttle slot along each track, with yellow lead-in lines curving into each cat [EST/photos].
- **Elevator perimeters** and **JBD panels**: yellow/black hatching [EST].
- **Taxi lines**: yellow.
- **Tie-downs**: a recessed grid every ~6 to 10 ft across the deck. Midway measures 10 ft rows with alternate rows offset 5 ft [SRC-WEAK].
- **Night lighting**:
  - flush white centerline lights and edge lights on the landing area;
  - red/amber drop lights down the stern;
  - low-intensity deck floodlights;
  - lens datum lights;
  - a laser line-up system (Long-Range Laser Line-up System, visible to ~10 nmi) shining aft: steady red at 0.5 to 0.7 deg off the landing centerline, slow-flashing red at 0.75 to 4 deg, fast-flashing red at 4 to 6 deg [SRC-WEAK] DCS.

---

## 12. Coordinate table (for drawing)

**Frame:**
- **x** runs along the keel line from the aft edge of the flight deck (stern/ramp) at **x = 0** to the bow tip at **x = 1092 ft**.
- **y** is measured from the ship centerline and is **positive to starboard** (so port is negative).
- Units are feet. Unless marked otherwise, every coordinate is **[EST]**, built to satisfy these documented constraints: 1,092 ft length, 252 ft width, 9 deg angle, ~780 ft angle, ~4.5 acre area, 40 ft wire spacing, ~310 ft stroke, 4 elevators (3 starboard + 1 port), and island position.
- The outline below encloses ~207,000 sq ft, about 5% above the documented 4.5 acres. Acceptable for a schematic.

**Landing area helper equations** (heading 9 deg to port; s = distance from the ramp along the landing centerline):
- Point on centerline: `x = 0.9877*s`, `y = 5 - 0.1564*s`
- Centerline as y(x): `y = 5 - 0.1584*x`
- Starboard edge = foul line: `y = 60.7 - 0.1584*x`
- Port edge: `y = -50.7 - 0.1584*x`. It runs off the port deck edge at about x ≈ 560; forward of that, the deck edge is the boundary.

### 12a. Deck outline polygon (clockwise from the stern starboard corner)

| # | x | y | Note |
|---|---|---|---|
| 1 | 0 | +92 | stern, starboard corner |
| 2 | 300 | +100 | starboard edge (elevator #3 sits in it) |
| 3 | 760 | +100 | starboard edge (elevators #1 and #2, island) |
| 4 | 900 | +85 | bow flare begins |
| 5 | 1000 | +65 | |
| 6 | 1092 | +25 | bow tip, starboard |
| 7 | 1092 | -25 | bow tip, port |
| 8 | 1000 | -50 | port bow edge ("the finger" region) |
| 9 | 790 | -58 | **the crotch** |
| 10 | 774 | -62 | inner end of the angled deck's forward edge |
| 11 | 760 | -152 | **the point** (forward-port tip of the angle; port extreme) |
| 12 | 560 | -140 | port sponson edge |
| 13 | 330 | -125 | port edge (elevator #4 sits in it) |
| 14 | 150 | -112 | port quarter (LSO platform outboard here) |
| 15 | 0 | -100 | stern, port corner |

### 12b. Features

| Feature | x | y | Size / orientation | Tag |
|---|---|---|---|---|
| Ramp (landing-area aft end), centerline point | 0 | +5 | landing heading 9 deg to port | [EST] |
| Wire #1 (center of pendant) | 173 | -22 | ~105 ft span, perpendicular to the landing centerline | [EST] |
| Wire #2 | 212 | -29 | " | [EST] |
| Wire #3 (target) | 252 | -35 | " | [EST] |
| Wire #4 (absent on CVN-76/77) | 291 | -41 | " | [EST] |
| Target hook touchdown point | 229 | -31 | ~230 ft from the ramp | [SRC-WEAK] |
| Barricade stanchions (when rigged) | ~330 | -48 ± 55 | across the landing area | [EST] |
| Landing-area forward end (centerline) | 770 | -117 | s ≈ 780 ft | [DOC length]/[EST] |
| Cat 1: shuttle start (launch spot) | 765 | +25 | track runs forward ~1 deg to starboard; stroke 310 ft | [EST] |
| Cat 1: end of stroke | 1075 | +30 | | [EST] |
| Cat 2: shuttle start | 765 | -25 | ~1 deg to port | [EST] |
| Cat 2: end of stroke | 1075 | -30 | | [EST] |
| Cat 3: shuttle start (waist, inboard) | 430 | -30 | heading 9 deg to port | [EST] |
| Cat 3: end of stroke | 736 | -79 | | [EST] |
| Cat 4: shuttle start (waist, outboard) | 410 | -72 | heading 9 deg to port | [EST] |
| Cat 4: end of stroke | 716 | -121 | | [EST] |
| JBD 1 (hinge center) | 715 | +25 | 36 ft wide, perpendicular to cat 1 | [EST] |
| JBD 2 | 715 | -25 | 36 ft wide | [EST] |
| JBD 3 | 381 | -22 | 36 ft wide, perpendicular to cat 3 (rotated 9 deg) | [EST] |
| JBD 4 | 361 | -64 | 36 ft wide, perpendicular to cat 4 | [EST] |
| ICCS bubble (bow) | 800 | 0 | ~8 ft dome between cats 1 and 2 | [SRC-WEAK]/[EST] |
| ICCS bubble (waist) | 450 | -100 | port of cat 4 | [SRC-WEAK]/[EST] |
| Island | x 410-560 | y +70 to +102 | ~150 x 30 ft | [EST] |
| Pri-Fly / Vultures' Row (on the island, elevated) | ~470-540 | +80 to +100 | facing aft/port | [EST] |
| Flight Deck Control (island base) | ~520 | +75 | | [EST] |
| Elevator #1 (starboard) | x 670-740 | y +48 to +100 | ~70 x 52 ft | [EST] |
| Elevator #2 (starboard) | x 580-650 | y +48 to +100 | ~70 x 52 ft | [EST] |
| Elevator #3 (starboard, aft of island) | x 325-395 | y +48 to +100 | ~70 x 52 ft | [EST] |
| Elevator #4 (port, aft) | x 330-400 | y -75 to -127 | ~70 x 52 ft (trapezoid in reality) | [EST] |
| LSO platform | x 150-185 | y -100 to -120 | port deck edge | [EST] |
| IFLOLS (lens) | 420 | -128 | port deck edge, facing aft | [EST] |
| Drop-line lights | 0 | +5 | vertical string down the stern | [EST] |
| Crash crane "Tilly" (typical spot) | ~380 | +60 | junkyard / aft of island | [EST] |
| **Parking areas (approx. rectangles)** | | | | |
| Bow (Fly 1 parking) | x 880-1060 | y -45 to +75 | around and between cats 1 and 2 | [EST] |
| The point | x 690-760 | y -150 to -115 | | [EST] |
| The crotch | x 770-830 | y -58 to -40 | | [EST] |
| The finger (L) | x 830-1000 | y -55 to -40 | | [EST] |
| Six-pack | x 560-690 | y +5 to +48 | ~6 spots, angled | [EST] |
| The street (taxi lane) | x 400-760 | lane ~40 ft wide hugging the foul line | | [EST] |
| The corral (L) | x 640-680 | y +50 to +100 | | [EST] |
| The patio (L) | x 760-900 | y +45 to +85 | | [EST] |
| Junkyard (L) | x 340-410 | y +15 to +70 | | [EST] |
| Hummer hole (L) | x 395-415 | y +60 to +100 | | [EST] |
| Fantail | x 20-320 | from the foul line to y ≈ +95 | aft starboard | [EST] |

---

## Simulation implications

A simulation should model the following:
1. **Deck polygon** (table 12a), scaled to 1 unit = 1 ft. Draw the asymmetric angled-deck sponson so the 9 deg angle is obvious. Overall 1,092 x 252 ft.
2. **Landing area**:
   - a 9 deg strip ~110 ft wide, starting at the stern on the centerline;
   - white edge lines and a dashed centerline;
   - a **red/white foul line** on its starboard edge;
   - "deck foul / clear" state driven by whether any aircraft, vehicle or person is across the foul line.
3. **3 or 4 arresting wires** perpendicular to the landing axis at ~175/215/255/295 ft from the ramp. Use a ship-config toggle: 4 wires for CVN-68 to 75, 3 for CVN-76/77.
   - Model a target touchdown at ~230 ft and engagement of the 3-wire.
   - Wire stretch/runout ~300 to 344 ft over ~2 s, then the pendant retracts.
   - Bolter path off the forward-port end of the angle.
4. **4 catapults**:
   - cats 1 and 2 nearly parallel on the bow (start x ≈ 765, 310 ft stroke to the bow);
   - cats 3 and 4 on the waist, parallel to the angle and **inside the landing area**. Waist cats must be inhibited while recovering; bow cats can run during recovery.
   - Each cat has a hold-back/launch spot and a shuttle that travels the ~310 ft stroke in ~2 to 2.5 s, then returns.
5. **4 JBDs**, ~36 ft wide, hinged ~50 ft aft of each launch spot. Animate them rising to 50 deg (~10.7 ft) after the aircraft taxis over, and dropping after the launch. The next aircraft holds behind the raised JBD.
6. **Island** on the starboard side, aft of midships (x ≈ 410 to 560). Use it as an occluder in angled views, and as the home of Pri-Fly, Vultures' Row and Flight Deck Control (good camera presets).
7. **4 elevators**: #1 and #2 forward of the island, #3 aft (all starboard), #4 port aft in the landing runout (locked during recovery). Each takes 2 jets and animates lowering and raising.
8. **Fly 1 / Fly 2 / Fly 3 zones** (x > 740 / 400 to 740 / < 400) as optional overlays, each with its own yellow-shirt team.
9. **Named parking areas** (bow, point, crotch, six-pack, street, corral, patio, junkyard, hummer hole, fantail) as labelled overlay rectangles. Use them as parking slots for the "respot" between cycles.
   - During a recovery, everything must sit starboard of the foul line, mostly at the bow, six-pack, street and fantail.
   - During a launch, aircraft taxi from parking up the street to the cats.
10. **LSO platform** (port aft) and **IFLOLS** (port side, ~420 ft from the ramp) as small markers. Optionally show a meatball widget with datum lights and wave-off/cut lights for the recovery view.
11. **Lighting mode** (optional night): landing-area centerline and edge lights, drop line, red deck lights.
12. Put all geometry in one config file and flag [EST] values, so they can be tuned visually against reference photos without touching code.

## Open questions
- Exact Nimitz elevator dimensions (the ~3,880 sq ft area suggests ~70-75 x 52 ft, but this is unconfirmed).
- Which CVN-68 to 75 ships, if any, now run with only 3 wires (the anecdotal #1 wire removal is unverified).
- Exact ramp-to-wire distances and lens position (in NATOPS CV / ship LSO bulletins; not public).
- Exact locations and boundaries of the slang areas (finger, hummer hole, patio, corral), which vary by ship and era.
- Bow cat toe-out angle and waist cat angle relative to the landing centerline.

## Sources
- Wikipedia, Nimitz-class aircraft carrier: https://en.wikipedia.org/wiki/Nimitz-class_aircraft_carrier
- Wikipedia, Arresting gear: https://en.wikipedia.org/wiki/Arresting_gear
- Wikipedia, Aircraft catapult (C-13 table): https://en.wikipedia.org/wiki/Aircraft_catapult
- Wikipedia, Optical landing system: https://en.wikipedia.org/wiki/Optical_landing_system
- NAVEDTRA / tpub, Steam powered catapults (C-13-1 stroke 309'8-3/4", track 324'10"): https://navyaviation.tpub.com/14310/css/Chapter-4-Steam-Powered-Catapults-135.htm
- tpub, Mk 7 Mod 0 Jet Blast Deflector: https://navyaviation.tpub.com/14001/css/Mk-7-Mod-0-Jet-Blast-Deflector-216.htm
- tpub, Foul line / safe parking line (ABH manual): https://navyaviation.tpub.com/14014/css/14014_248.htm
- Navy SBIR N192-100, JBD dimensions (36 ft, 10.7 ft, 50 deg): https://navysbir.com/n19_2/N192-100.htm
- Patent US8360361 (JBD Mk 7 Mod 1/2 panel widths): https://patents.google.com/patent/US8360361
- FAS, CVN-68 Nimitz class: https://man.fas.org/dod-101/sys/ship/cvn-68.htm
- Hazegray / losthistory, US Supercarriers: https://losthistory.net/hazegray/navhist/carriers/us_super.htm
- Los Barcos de Eugenio, CVN-69 (angled deck 237.7 m, elevators 47 t): https://www.losbarcosdeeugenio.com/barcos/en/us/usn_CVN69.html
- The War Zone, Ford island placement vs Nimitz: https://www.twz.com/sea/why-the-ford-class-carriers-island-superstructure-is-located-so-far-back
- HeraldNet, USS Nimitz stats (elevators 3,880 sq ft): https://www.heraldnet.com/news/the-uss-nimitzs-stats/
- Strasam, Nimitz/Ford elevator systems: https://strasam.org/en/defense/naval-weapons-and-systems/vertical-logistics-on-floating-fortresses-the-elevator-systems-of-nimitz-and-ford-class-aircraft-carriers-4178
- DVIDS, "On the wire" (arresting gear crew, 125 arrests): https://www.dvidshub.net/news/printable/148007
- UTK thesis (FLOLS; 40 ft touchdown zone between wires 2 and 3): https://trace.tennessee.edu/utk_gradthes/9408
- MNV design spreadsheet notes (USN typical 40 ft wire spacing, 143 ft to first wire): https://mail.mnvdet.com/CV/CV-FltDkA.html
- HowStuffWorks, Landing on an aircraft carrier (50 ft spacing claim): https://science.howstuffworks.com/aircraft-carrier4.htm
- Eagle Dynamics, DCS Supercarrier Operations Guide (deck layout, ICCS, lens, LLLS, parking): https://www.digitalcombatsimulator.com/upload/iblock/e1b/430ooc582lpb0npynbsewan6omd5ohvs/DCS_Supercarrier_Operations_Guide_EN.pdf
- Hoggit wiki, DCS carrier spawns (six-pack, patio, corral, junkyard, point): https://wiki.hoggitworld.com/view/DCS_editor_carrier_spawns
- MIT News, Automated flight decks (Ouija board; "the street", "fantail"): https://news.mit.edu/2011/automated-flight-decks-0802
- FunTrivia, Contemporary US carrier lingo (Vultures' Row, roof, tower): https://www.funtrivia.com/trivia-quiz/World/Contemporary-US-Aircraft-Carrier-Lingo-172106.html
- wearethemighty, 12 most important places on a carrier: https://www.wearethemighty.com/articles/the-12-most-important-places-on-an-aircraft-carrier-top-to-bottom/
- Forum sources (practitioner, weak): bobistheoilguy "A Question for Astro" (ramp to 1-wire ~175 ft, 40 ft spacing): https://bobistheoilguy.com/forums/threads/a-question-for-astro.295069 ; Falcon BMS forum (3.5 deg, 14.1 ft hook clearance): https://forum.falcon-bms.com/post/160551 ; DCS forum meatball/ICLS angle (230 ft touchdown): https://forum.dcs.world/topic/184866-meatball-and-icls-angle
