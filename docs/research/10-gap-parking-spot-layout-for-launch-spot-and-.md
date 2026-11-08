# 10 — Gap fill: parking-spot layout for the launch spot and the recovery spot

Scope: Nimitz-class (CVN-68 to 77) flight deck, F/A-18E/F and EA-18G only. This file **resolves the conflicting placements of the named deck areas** in `01-deck-geometry.md`, `05-aircraft-handling.md` and `06-cyclic-ops.md`. It also gives a **slot-by-slot parking plan** (position plus heading) for a launch spot and a recovery spot, and a cat-feed table.

Confidence tags:
- **[DOC]**: primary or official document (NATOPS 00-80T-120).
- **[DIAG]**: a deck diagram that labels the area (sailor/fan diagram or DCS manual).
- **[SIM]**: DCS Supercarrier model (built with SME input, but simplified).
- **[EST]**: my own estimate. These are geometry-checked against the 01 frame but not sourced.

---

## 1. Bottom line

Two independent labeled diagrams agree on almost every name: the combat.ws "Flight Deck Overview" diagram and the Hoggit DCS deck-layout table. The navysite.de diagram agrees on most names. **01, 05 and 06 put the point, patio, finger and corral in the wrong places.** The resolved layout, going from the bow aft:

| Area | Resolved location | Sources | What 01/05/06 said |
|---|---|---|---|
| **Bow / Rows 1-4** | Forward of the bow JBDs, over and around cats 1 and 2. **One Row** = starboard of cat 1. **Two Row** = port of cat 1. **Three Row** = starboard of cat 2. **Four Row** = port of cat 2. | combat.ws diagram [DIAG]. NATOPS uses "No. 2 catapult (4 Row)" [DOC]. navysite marks "the Rows" either side of cats 1/2, "where F/A-18s are parked in rows during landing operations" [DIAG] | 01/05 have no rows. |
| **Point** | **Starboard bow**, forward of Elevator 1, outboard (starboard) of cat 1's aft half. Runs aft to about JBD 1. | combat.ws [DIAG]. Hoggit "Point: Starboard bow", QRA/alert parking [DIAG] | 01 and 06 put it at the forward-port tip of the angle. 05 puts it on the bow over cats 1/2. **Both wrong.** |
| **Crotch** | Port side, where the angled deck's forward edge meets the port bow edge, between the forward ends of cat 2 and cat 3 | combat.ws, navysite ("where the angled deck ends and the port bow begins"), Hoggit [DIAG] | 01 is right. 05 is right. |
| **Box** | Between the aft ends of cats 1 and 2 (the ICCS "bubble") | combat.ws, Hoggit [DIAG] | not in 01/05 |
| **Elevator 1** | Starboard edge, just aft of JBD 1 | combat.ws, DCS [DIAG/SIM] | ok |
| **Corral** | **Starboard deck-edge gap between Elevator 1 and Elevator 2**. 1 jet (DCS), roughly one elevator-length on combat.ws | combat.ws, Hoggit "between elevators", DCS spot 13 [DIAG/SIM]. *Variant:* navysite calls the whole area in front of the island, foul line to El 1, the "Corral" | 05/06 put it port-aft near El 4. **Wrong.** 01 is right. |
| **Elevator 2** | Starboard edge, just forward of the island | all | ok |
| **The Street** | Fore-aft taxi lane just inboard of El 1 / corral / El 2, from about JBD 1 aft to the island | combat.ws (box inboard of EL1-CORRAL-EL2), Hoggit ("Midship/center: access to elevators, corral, sixpack") [DIAG]. *Variant:* navysite puts "the Street" between cats 1 and 2 on the bow | 01 has it hugging the foul line (too far port). 05 is close. |
| **Six-pack** | Strip just **port of the street**, along the starboard (landing-area) foul line, from abeam JBD 1 aft to abeam El 2 / the island's forward end | combat.ws, navysite ("row of planes parked along the foul line"), Hoggit (midship), DCS spots 1-4 [DIAG/SIM] | 01 is roughly right. 05 ("between El 2 and the island") is too far starboard/aft. |
| **Island** | Starboard, between El 2 and El 3 | all | ok |
| **Hummer hole** | Next to the island, where the E-2/C-2 park. On navysite it sits on the island's inboard side | navysite [DIAG] only | 01 put it against the island's aft end. Low confidence either way. |
| **Junkyard** | **Aft of the island, forward of El 3**, starboard. Holds the crash crane (Tilly), tractors and fire trucks | combat.ws, navysite, Hoggit ("between island and elevator #3") [DIAG] | 01 is right in concept, but 01's geometry leaves only 15 ft between the island and El 3. |
| **Elevator 3** | Starboard edge, aft of the junkyard | all | ok |
| **Patio** | **Starboard quarter, aft of El 3**, starboard of the landing-area foul line | combat.ws, Hoggit ("Starboard stern"), DCS spots 14-16 [DIAG/SIM] | 01 put it on the starboard bow. **Wrong.** 05 lumps it with the junkyard. |
| **Stern / fantail** | Aft end of the deck, across the ramp. The port and centre parts are inside the landing area | combat.ws "STERN (FANTAIL)" [DIAG]. NATOPS: the LA runs "from the fantail to the forward end of the angled deck" [DOC] | ok |
| **Elevator 4** | Port side aft. On combat.ws it is outboard of the port landing-area foul line | combat.ws, DCS [DIAG/SIM] | ok |
| **Finger** | **Small strip aft of El 4, port side**, 1 jet, just forward of the LSO platform | navysite ("small area aft of Elevator #4 where a single plane can be parked"), combat.ws, Hoggit ("Port stern") [DIAG] | 01 put it on the port bow. **Wrong.** |
| **Safe-shot lines** | Painted lines alongside each cat. A cat may fire only if nothing is on its side of its line. Cat 2's line sits just port of cat 1, and so on | combat.ws (four numbered "SAFE-SHOT LINE"s). NATOPS: "All aircraft are clear of the 'safe park launch lines' on the waist and bow catapults" [DOC] | missing from 01/05 |

**Ship-to-ship and source variation**
- All of these names are informal handler slang. NATOPS 00-80T-120 uses only "4 Row", "safe parking line", "safe park launch lines", "dearming area", "high point (aft of Navigation Pole)", helo spots 1-8, and "Fly 1/2/3".
- The two variants worth knowing:
  - (a) navysite calls the big area in front of the island the "Corral" and the bow lane between cats 1/2 the "Street".
  - (b) Hoggit/DCS and combat.ws call the starboard bow the "Point". 01's "point" (the forward tip of the angle sponson) has no sourced name.
- **Recommendation:** use the combat.ws/Hoggit naming (two sources agree) and mention the navysite variant in a tooltip.

---

## 2. Source notes (what each one actually shows)

1. **combat.ws "SailorSpeak: Flight Deck Overview"** (diagram FLYTDECK.JPG, 3119x1042, hand-labeled, bow on the left). It lists 20 positions in order: Bow, Row 1-4, Safe Shot Line, Crotch, Point, Box, JBD x4, Elevator 1-4, Corral, The Street, The Six Pack, Starboard Side, Port Side, The Island, Landing Area Foul Line, Junk Yard, Patio, Finger, LSO Platform, Stern (Fantail).
   - The diagram is **not to scale**. It compresses the island and aft deck.
   - Relative order along the starboard edge, bow to stern: Point → EL1 → Corral → EL2 → Island → Junk Yard → EL3 → Patio → Stern.
   - Port side: Four Row → Crotch → cats 3/4 → JBDs 3/4 → EL4 → Finger → LSO.
   - The Street and The Sixpack are two parallel fore-aft boxes. The Street is outboard (starboard), next to the elevators. The Sixpack is inboard, bordering the landing-area foul line. Both span from about JBD 1 aft to the island's forward end.
   - "ONE ROW" is labeled just starboard of cat 1, "TWO ROW" just port of it, "THREE ROW" starboard of cat 2, "FOUR ROW" port of cat 2.
   - Safe-shot lines are numbered by cat: line 2 runs just port of Two Row, line 1 just starboard of Three Row, and lines 3 and 4 run starboard of cat 3.
2. **navysite.de "Installations on the Flight Deck"** (numbered diagram, bow right). Definitions quoted:
   - Six Pack: "the row of planes parked along the 'foul line'".
   - Corral: "the area in front of the island: from the 'foul line' on the left, all the way up to elevator#1".
   - Junkyard: "aft of the island where the tractors, fire engines and the crane are parked".
   - Hummer Hole: "next to the island where the E-2C and C-2 planes are parked".
   - Finger: "small area aft of Elevator #4 where a single plane can be parked".
   - Rows: "right of Catapult#1 and left of Catapult#2 where F/A-18s are parked in rows during landing operations".
   - Street: "space between Catapult #1 and #2".
   - Crotch: "where the angled deck ends and the port bow begins".
3. **Hoggit wiki "Carrier Air Operations"** (DCS community).
   - Areas: Point = starboard bow (QRA parking); Corral = between elevators; Street = midship (access to elevators, corral, sixpack); Six pack = midship; Junkyard = between island and El 3 (E-2/tanker/transport parking); Patio = starboard stern; Finger = port stern; Crotch = bow ("do NOT use for landing lineup").
4. **DCS Supercarrier Operations Guide (Eagle Dynamics, updated 20 Nov 2024)**, p. 100 diagram and pp. 44, 54-55. Reading the numbered diagram:
   - Hornet-size layout: 16 deck parking spots plus 4 cats (20 spawns).
   - **1-4** = six-pack (angled, forward of the island, along the foul line).
   - **5-6** = El 2.
   - **7-8** = El 4 (tails over the port edge).
   - **9-10** = El 3.
   - **11-12** = El 1.
   - **13** = corral (between El 1 and El 2).
   - **14-16** = patio / starboard quarter. 15-16 are canted about 45 deg at the stern corner.
   - Deck-edge jets sit perpendicular to the edge, **nose inboard, tail over the edge**.
   - Recovery allocation: "During recoveries, aircraft are directed to parking spots starting from the stern towards the bow." If the area opposite the island is obstructed, the spots opposite the island (El 1, corral, El 2, point) fill first. Overflow goes to **El 4**, then the hangar's 16 spots. DCS therefore treats El 4 as usable during recovery.
   - The p. 55 figure marks the point area plus the El 3 / aft-island spots as spots "from which no taxi route to the catapults is provided".
   - Spots 1-4 are deactivated once a multiplayer mission un-pauses, "to clear the taxi route for other launching and recovering aircraft". **The six-pack is the taxi lane's neighbour and gets cleared for flow.**
   - Hoggit counts: 4 "spawn once" in the six-pack; 12 spawn points (2 per elevator, 3 patio, 1 corral); 16 parking.
5. **Hoggit "DCS editor carrier spawns"**: AI spawn-to-cat routing is **cat 1 ← 1,5,9,11,14; cat 2 ← 2,6,10,12,13; cat 3 ← 3,7,15; cat 4 ← 4,8,16.** In words:
   - Six-pack slots split one per cat, forward→cat 1 through aft→cat 4.
   - El 4 and the stern corner feed the waist cats.
   - Everything else on the starboard edge (El 1, corral, El 2, El 3, forward patio) feeds the bow cats.
6. **NAVAIR 00-80T-120 CVN Flight/Hangar Deck NATOPS** (text copy). Relevant lines:
   - "E-2/C-2 aircraft shall not be recovered … when turbojet aircraft are spotted on or along the **No. 2 catapult (4 Row)** or along the **foul deck line forward of the waist catapults** with the turbojet exhaust blowing to the port side. This includes aircraft in the **de-arm area** blowing turbojet exhaust to port." This confirms that during recovery jets park on Four Row (along cat 2) and along the foul line forward of the waist cats (the six-pack / de-arm area), some with **tails to port**.
   - Recovery checklist: "Ensure that all aircraft and mobile equipment parked on the flight deck are inside the **safe-parking line**." The landing area is "from the fantail to the forward end of the angled deck. This area includes the safe parking area near the island." The Arresting Gear Officer watches for "violations of the safe parking line". The deck goes FOUL (red light) after each trap until the LA is clear.
   - Daily checklist: "All aircraft are clear of the '**safe park launch lines**' on the waist and bow catapults."
   - "Jet high-power and afterburner turn-ups shall be permitted only with the **tailpipe extended outboard toward the flight deck edge or elevator edge**." This is the reason for the tail-outboard convention.
   - "Prior to **backing** aircraft to deckedge spots, plane handlers shall be positioned to … chock the main wheels instantly." Deck-edge spots are reached by a tractor push-back, tail first.
   - "When parking aircraft, an **access route shall be maintained** to allow MFFV the ability to respond to any emergency." **Keep a lane open; the street normally is that lane.**
   - In close quarters (5 ft or less) a safety observer is posted beside the director.
   - UNREP: aircraft from the "high point" (aft of the Navigation Pole) to aft of El 3 are spotted "tail over deck plus 10 feet", and aircraft aft of El 3 at TOD. So normally, tails overhang the edge.
   - Helo spots: inverted-T spots 1-6 on the landing area. Spots 7 and 8 are on elevators; spot 8 is incompatible with cat 3/4 ops and needs the LSO platform lowered, so it is El 4.

---

## 3. Coordinate frame and geometry fixes needed in 01

Frame (same as 01 §12):
- **x** = ft forward of the stern (0 to 1092).
- **y** = ft from the centerline, **+ = starboard**.
- **Heading** = direction the **nose** points, in degrees: 0 = toward the bow, +90 = toward starboard, -90 = toward port, 180 = toward the stern.
- Jet footprint (wings folded): **60.3 x 30.5 ft** (from 05). Slot (x, y) is the footprint centre.
- Starboard landing-area foul line: `y = 60.7 - 0.1584x`. Port: `y = -50.7 - 0.1584x` (from 01).

Geometry issues in 01 that have to be fixed for the sourced layout to fit [EST]:
1. **Corral gap.** 01 has El 2 at x 580-650 and El 1 at 670-740, a 20 ft gap. The corral needs **≥ 40 ft** (one deck-edge jet, perpendicular: 30.5 ft plus clearance). Proposal: **El 2 → x 560-630, corral = x 630-670**. El 2 then abuts the island's forward end, which matches combat.ws, where EL2 runs up to the island.
2. **Junkyard gap.** 01 has the island at x 410-560 and El 3 at 325-395, a 15 ft gap. combat.ws shows a junkyard about one elevator long between them. Proposal: **El 3 → x 280-350, junkyard = x 350-410**, with Tilly at about (380, +65).
3. **El 4 vs the landing area.** In 01's frame the port LA edge (`y = -50.7 - 0.1584x`, about -108 at x 365) runs **across** El 4 (y -75 to -127). combat.ws and DCS both put El 4 **outboard** of the port foul line, and DCS parks recovered jets there. Either narrow the LA at the El 4 station or move El 4 so its inboard edge is at about y -112. Until 01 is fixed, the slot table below marks El 4 and the finger as launch-only, with "R*".

---

## 4. Slot table

Every slot below was collision-checked with a shapely script in the 01 frame, using the proposed El 2 / El 3 positions:
- folded footprints do not overlap within each configuration (≥ ~1 ft clearance);
- the non-tail 40 ft of each jet stays on deck (tails may overhang the edge);
- every slot flagged R stays ≥ 3 ft clear of the landing area.

All positions and headings are **[EST]** within the sourced area boundaries.

**Config flags:** **R** = occupied in the full recovery spot (after the last trap). **L** = occupied in the launch spot (before an event). **RL** = in both.

### 4a. Starboard deck edge (tails over the starboard edge, nose inboard; reached by tractor push-back)

| Slot | Area | x | y | Hdg | Cfg | Notes |
|---|---|---|---|---|---|---|
| PT1 | Point | 880 | +75 | -100 | RL | Starboard bow. Must sit outboard of cat 1's safe-shot line while cat 1 fires. QRA/alert jets often go here (Hoggit) |
| PT2 | Point | 842 | +79 | -100 | RL | |
| PT3 | Point | 804 | +83 | -100 | RL | |
| E1A | El 1 | 722 | +85 | -90 | RL | When El 1 cycles, the jet goes to/from the hangar |
| E1B | El 1 | 688 | +85 | -90 | RL | |
| CO1 | Corral | 650 | +85 | -90 | RL | 1 spot (DCS 13) |
| E2A | El 2 | 612 | +85 | -90 | RL | |
| E2B | El 2 | 578 | +85 | -90 | RL | |
| E3A | El 3 | 333 | +85 | -90 | RL | |
| E3B | El 3 | 298 | +85 | -90 | RL | |
| PA1 | Patio | 252 | +78 | -60 | RL | Canted 30 deg from perpendicular, nose forward-port, tail over the starboard quarter edge (DCS 14-16 style) |
| PA2 | Patio | 216 | +77 | -60 | RL | |
| PA3 | Patio | 180 | +76 | -60 | RL | |
| PA4 | Patio | 144 | +75 | -60 | RL | |

### 4b. Mid-deck

| Slot | Area | x | y | Hdg | Cfg | Notes |
|---|---|---|---|---|---|---|
| SP1 | Six-pack | 715 | -16 | +40 | RL | Angled herringbone along the foul line (centre = foul line + 37 ft), tail toward the LA (see §5) |
| SP2 | Six-pack | 671 | -9 | +40 | RL | |
| SP3 | Six-pack | 627 | -2 | +40 | RL | |
| SP4 | Six-pack | 583 | +5 | +40 | RL | |
| SP5 | Six-pack | 539 | +12 | +40 | RL | |
| SP6 | Six-pack | 495 | +19 | +40 | RL | |
| HH1 | Hummer hole | 445 | +55 | 180 | RL | Beside the island's inboard face. Normally E-2s; one jet if no E-2 is embarked in the sim |
| JY1 | Junkyard | 380 | +40 | 180 | RL | One jet inboard of Tilly and the tractors |
| (street) | Street | x 560-715 | y about +20 to +52 | — | lane | **Kept open** as the fire-vehicle access route and taxi lane (NATOPS). Use it as overflow (1-2 jets nose-to-tail, hdg 0) only when the deck is "locked" |

### 4c. Bow (rows), recovery pack

Jets taxi forward out of the LA and are packed into the rows **nose aft (hdg 180), nose-to-tail**. The edge rows overhang the deck edge where the bow narrows. Tractors spin and push them into place.

| Slot | Area | x | y | Hdg | Cfg |
|---|---|---|---|---|---|
| R1A | One Row (stbd of cat 1) | 937 | +60 | 180 | R |
| R1B | One Row | 1000 | +45 | 180 | R |
| R2A | Two Row (port of cat 1) | 1000 | +13 | 180 | R |
| R2B | Two Row | 935 | +28 | 180 | R |
| R2C | Two Row | 858 | +26 | 180 | R |
| R3A | Three Row (stbd of cat 2) | 935 | -4 | 180 | R |
| R3B | Three Row | 870 | -6 | 180 | R |
| R4A | Four Row (port of cat 2) | 870 | -39 | 180 | R |
| R4B | Four Row | 935 | -37 | 180 | R |
| R4C | Four Row | 1000 | -32 | 180 | R |
| CR1 | Crotch | 805 | -40 | +120 | R |

Forward of about x 980 the bow is only ~115 ft wide, so only 3 lanes fit there (One / merged Two-Three / Four). Real decks pack the tip more tightly, with canted jets and tails over both edges. Adding 2-4 extra canted jets there is realistic if the sim wants ~40.

### 4d. Aft / port (landing-area-fouling or LA-adjacent)

| Slot | Area | x | y | Hdg | Cfg | Notes |
|---|---|---|---|---|---|---|
| FT1 | Stern | 22 | -78 | 0 | L | Tail over the ramp. **Fouls the LA: must launch or move before recovery** |
| FT2 | Stern | 22 | -42 | 0 | L | same |
| FT3 | Stern | 22 | -6 | 0 | L | same |
| FT4 | Stern | 22 | +30 | 0 | L | same |
| FT5 | Stern stbd corner | 22 | +76 | 0 | L | Within 3 ft of the foul line in 01's frame. Allowed in R if the foul line is nudged |
| E4A | El 4 | 382 | -108 | +90 | L (R*) | Tail over the port edge. *R only after the 01 El 4/LA fix (DCS parks recovered jets here) |
| E4B | El 4 | 348 | -106 | +90 | L (R*) | |
| FI1 | Finger | 300 | -106 | +60 | L (R*) | 1 spot aft of El 4 |

**Counts**
- **Recovery spot:** 33 R slots, plus El 4 / finger (3) once fixed, plus 1-2 street overflow, plus 2-4 extra bow-tip slots: **~36-42**. This matches the target of 36-42 jets, with the hangar holding the rest.
- **Launch spot:** 30 L slots, plus 4 jets on the cats, plus up to 4 queued behind the raised JBDs. When a bow cat is not in use, its rows can stay packed (see §6).

---

## 5. Headings: rules and evidence

- **Tail outboard / tail over the edge** at every deck-edge spot: the point, elevators, corral, patio, El 4, finger and the outer bow rows.
  - Sources: NATOPS (turn-ups only with the tailpipe over the deck or elevator edge; the UNREP "TOD + 10 ft" exception implies a normal overhang); the DCS diagrams (all edge jets perpendicular, nose inboard).
  - Angle to the edge: **perpendicular (hdg ±90) at straight edges**. **Canted 30-45 deg** at the curved stern corner and the bow flare (DCS 15-16; patio). [SIM/EST]
  - Jets reach edge spots by **tractor push-back, tail first** (NATOPS "backing aircraft to deckedge spots"). A taxiing jet cannot put its own tail over the edge.
- **Six-pack heading: the sources conflict.**
  - DCS start positions face the jets **nose toward the foul line** (nose aft-port, hdg about -135, tail toward the street).
  - NATOPS refers to jets "along the foul deck line forward of the waist catapults … in the de-arm area blowing turbojet exhaust to port". That means **nose starboard / forward-starboard, tail toward the LA**, which is what a jet taxiing straight out of the wires and turning right into the slot ends up with.
  - **Recommendation:** recovery config hdg about **+40** (taxied in, de-arm and hot-pit stop). In the launch respot, tractors spin six-pack jets to hdg about -135 (nose to the foul line) so they can taxi straight out onto the angle toward cats 3/4 or forward. Spinning them is itself a nice visible part of the dance.
- **Bow rows:** jets arrive taxiing forward, then are pivoted or pushed so they end up nose-aft, nose-to-tail. That way they can later taxi aft or be towed out without a 180 in a packed deck [EST]. The alternative (nose forward, as taxied in; Dengeki Hobby: "aircraft gather at the bow with noses forward") is also documented. Either is defensible; nose-aft makes the morning respot simpler.
- **Stern/fantail launch spots:** tails over the ramp, nose forward (hdg 0), so they taxi straight up the angle to cats 3/4 [EST].

---

## 6. Which areas stay occupied during recovery, and which feed which cats

**Must be empty for recovery (LA plus waist cats):**
- the stern across the ramp (FT1-4);
- cats 3/4 and JBDs 3/4;
- anything port of the starboard foul line or starboard of the port foul line, from the ramp to the angle's forward end;
- El 4 / finger only if they foul the LA in the geometry used.

The safe-parking line has to be respected: the Arresting Gear Officer will not give a green deck if it is violated (NATOPS).

**Stay occupied during recovery:**
- point, El 1, corral, El 2, six-pack (inside the safe-parking line), hummer hole, junkyard, El 3, patio, stern starboard corner;
- El 4 / finger (DCS parks recovered jets there; it is outboard of the port foul line on combat.ws).

They **fill from aft forward** for recovered jets (DCS: "starting from the stern towards the bow"): the six-pack first (de-arm/hot-pit), then the bow rows in the order tip/edge rows first → inner rows → crotch. **The street stays open** as the taxi and fire lane.

Recovered jets on the bow block cats 1/2. 06 is right that the bow cats are unusable during and right after the recovery.

**Cat feeds for the launch spot** [EST]. Built from DCS routing plus proximity:

| Cat | Fed from (primary) | DCS AI routing for comparison |
|---|---|---|
| **Cat 1** | PT1-3, E1A, E1B, CO1, SP1, R1/R2 if parked there | 1 (six-pack fwd), 5 (El 2), 9 (El 3), 11 (El 1), 14 (patio fwd) |
| **Cat 2** | E2A, E2B, SP2, SP3, CR1, R3/R4 if parked there | 2 (six-pack), 6 (El 2), 10 (El 3), 12 (El 1), 13 (corral) |
| **Cat 3** | SP4, SP5, HH1, JY1, E3A, PA1, PA2, FT3-FT5 | 3 (six-pack aft), 7 (El 4), 15 (patio/stern) |
| **Cat 4** | SP6, E3B, PA3, PA4, E4A, E4B, FI1, FT1, FT2 | 4 (six-pack aftmost), 8 (El 4), 16 (stern corner) |

- DCS sends El 3 and the forward patio to the **bow** cats, taxiing up the street past the island. Real handlers can do either. Proximity (aft spots → waist cats) gives shorter taxis and keeps the bow area flowing.
- **Launch order:** LA-fouling jets (FT1-4, El 4/finger) go first, off cats 3/4 or towed clear. The **last waist launch "clears the angle"** for the next recovery.
- **Safe-shot logic:**
  - With **only cat 2 in use**, One and Two Row (starboard of cat 2's safe-shot line, which lies just port of Two Row) can stay packed.
  - With **only cat 1 in use**, Three and Four Row can stay.
  - Waist cats: cat 3's line runs starboard of cat 3, toward the six-pack. Cat 4's line also lies starboard of cat 3 on combat.ws.

  This is how a deck keeps a partial bow pack while launching (combat.ws safe-shot lines; NATOPS "safe park launch lines") [DIAG/DOC + EST on spacing]. Safe-shot line offsets are not published; use **about 35-40 ft from the cat centerline** (half span 22.5 ft plus margin) [EST].

---

## 7. Typical sequences (for animation)

**Launch spot (before event N, ~30-38 jets on deck)** [EST, consistent with sources]:
- the bow rows empty, or only the row(s) beside an unused bow cat packed;
- launchers on the point, El 1, corral, El 2 (cats 1/2);
- six-pack turned nose-to-foul-line;
- junkyard, hummer hole, El 3, patio (cats 3/4, or 1/2 via the street);
- stern FT1-4 and El 4/finger (cats 3/4, first to go).

**Recovery spot (after the last trap)**:
- stern, angle and waist clear;
- bow rows plus crotch packed nose-aft (11, up to ~15);
- point, elevators and corral full (8);
- six-pack hdg +40 (6);
- hummer hole, junkyard, El 3, patio (8);
- El 4 / finger (3) if geometry allows;
- street open.

**Respot (~60 min, from 06)**:
- tractors pull bow jets aft onto the angle, stern and waist spots;
- elevators swap down-jets with up-jets;
- six-pack jets are spun;
- the bow is cleared down to the rows the next launch's cats need.

---

## Simulation implications

1. **Rename or move the areas** in 01's overlay to the resolved table in §1: the point to the starboard bow, the patio to the starboard quarter aft of El 3, the finger to aft of El 4, the corral to the El 1-El 2 gap. Add **One-Four Rows**, the **Box** and four **safe-shot lines**. Optionally show the navysite variant names in a tooltip.
2. **Fix 01 geometry:** a 40 ft corral gap (El 2 → x 560-630), a 60 ft junkyard (El 3 → x 280-350), and El 4 outboard of the port foul line.
3. **Implement slots as data** (§4): `{id, area, x, y, hdg, cfg:'R'|'L'|'RL', feedsCat}`. Use the 60.3 x 30.5 ft folded footprint. Let tails overhang the edge, never noses.
4. **Two canonical spot states:** `recoverySpot` (33-42 R slots occupied, LA plus stern clear, street open) and `launchSpot` (30 L slots, plus jets on and behind the cats, bow rows empty except beside an unused bow cat).
5. **Hard constraints:**
   - nothing in the LA during recovery (deck light RED on a violation);
   - nothing on a cat's side of its safe-shot line when it fires;
   - the street (fire lane) never permanently blocked.
6. **Recovery parking allocation order:** six-pack → bow rows (tip/edge rows first, inner rows last) → crotch → elevators/corral/point. Recovered jets **taxi** to the six-pack/rows. Deck-edge spots need a **tractor push-back**.
7. **Heading behaviours:**
   - edge jets nose-inboard, tail over the edge (perpendicular; canted 30-45 deg at curves);
   - six-pack hdg +40 on recovery, spun to about -135 for launch;
   - bow rows nose-aft;
   - stern jets nose-forward.
8. **Cat-feed mapping** from §6. The launch order empties LA-fouling slots first; the last waist launch clears the angle.
9. **Optional "partial bow pack" scenario:** launch on cats 2/3/4 with One and Two Row still packed. This shows safe-shot lines in action.

## Open questions

- No official NATOPS spotting figure with slot coordinates was found. NATOPS 00-80T-120 figures are not in the text copy. The MIT theses (Ryan 2014 MASCS, DCAP papers) would likely have digitized deck layouts but **could not be downloaded** (DSpace returned 429, core.ac.uk 403). The session web-search budget ran out before DVIDS overhead photos could be checked.
- The six-pack heading conflicts (DCS nose-to-foul-line vs NATOPS exhaust-to-port). Recommendation in §5.
- Safe-shot line offsets and true elevator / island x-positions on CVN-68 to 77 are estimates. 01's island/elevator stations need a photo-scaled check.
- Hummer hole placement rests on navysite only.
- CVN-76/77 island differences could shift the junkyard/hummer-hole area. Not verified.

## Sources

- combat.ws, "SailorSpeak: Flight Deck Overview Appendix" and diagram: http://www.combat.ws/S4/SAILOR/APNDX6.HTM ; http://www.combat.ws/S4/SAILOR/IMAGES/FLYTDECK.JPG
- navysite.de, "Installations on the Flight Deck" (numbered diagram nicks.gif and definitions): https://www.navysite.de/cvn/flightdeck.htm
- Hoggit wiki, "Carrier Air Operations" (deck layout table): https://wiki.hoggitworld.com/view/Carrier_Air_Operations
- Hoggit wiki, "DCS editor carrier spawns" (spot counts, AI cat routing): https://wiki.hoggitworld.com/view/DCS_editor_carrier_spawns
- Eagle Dynamics, DCS Supercarrier Operations Guide (updated 20 Nov 2024), pp. 44-45, 54-55, 100-101: https://www.digitalcombatsimulator.com/upload/iblock/e1b/430ooc582lpb0npynbsewan6omd5ohvs/DCS_Supercarrier_Operations_Guide_EN.pdf
- NAVAIR 00-80T-120, CVN Flight/Hangar Deck NATOPS Manual (sections 2.8, 6.4, 7.2.2, 7.4.2, 7.4.6, 7.4.7, 11.x, 12.x). Local text copy used; distribution statement C.
- DCS forum, spot order and six-pack deactivation (via search summary): https://forum.dcs.world/topic/311344-parking-places-on-carriers-with-supercarriers
- Wikipedia, Modern US Navy carrier air operations (bow storage after the last recovery, locked deck, 12-20 aircraft events): https://en.wikipedia.org/wiki/Modern_United_States_Navy_carrier_air_operations
- Dengeki Hobby, March 2014 (via ourstarblazers; landing config "noses forward" at the bow): https://www.ourstarblazers.com/vault/DH1303
- Ryan, J.C., 2014, MIT PhD thesis (MASCS), record only (PDF not retrievable): https://dspace.mit.edu/handle/1721.1/97255
