# 06 — Cyclic Flight Operations: Events, Cycles, Launch/Recovery Overlap, and Authorities

Scope: how a Nimitz-class carrier runs a flying day as a chain of "events", how each launch is followed by a recovery, who controls what, and what the simulation needs to model. Jet-only focus (F/A-18E/F "Rhino", EA-18G "Growler"). Where sources were secondary (forums, flight-sim community docs, journalism), the text says so. Values marked **(est.)** are reasoned estimates for simulation use, not doctrine.

---

## 1. The flight day at a glance

| Item | Typical value | Notes / confidence |
|---|---|---|
| Flying day | ~12–16 h (e.g. first launch ~0800, last recovery ~2300–0100) | Night ops often run past midnight. Jalopnik's embark describes night ops ending ~0130. A Stennis time-lapse shows: morning FOD walk → helo launch → E-2 launch → day cyclic → evening FOD walk → sunset → night ops → respot → "lights out". |
| Cycle length (launch-to-launch) | **1+30** (90 min) is standard. 1+00, 1+15 and 1+45 are common | Wikipedia; CNATRA-derived material. Shorter cycles launch fewer aircraft. Longer cycles leave airborne jets shorter on fuel. |
| Events per day | ~7–10 at 1+30 over a 12–15 h day | Events are numbered 1, 2, 3… through the 24-h fly day. |
| Aircraft per event | **12–20** (TWZ: 10–12 airborne per cycle is typical in normal ops) | Includes tanker(s), E-2, sometimes helos. Jet-only sim: about 10–14 jets per event is realistic. |
| Launch duration | ~**15 min** per event | Wikipedia ("Event 1 launch takes roughly 15 minutes"). |
| Recovery duration | ~**15 min** for ~12–20 aircraft (Case I) | Case I landing interval is **45–60 s**. One source says "around 20 aircraft recovered in about 15 minutes". |
| Respot / turnaround | ~**60 min** between the end of one recovery and the next launch | Same source: "re-spotted and prepared for another mission in 60 minutes and then launched in 15 minutes." |
| Sortie duration | About one cycle plus the launch-to-recovery offset: **~1+30 to ~1+50** airborne at a 1+30 cycle | A jet launched in Event N lands in the recovery that follows the Event N+1 launch. |

### Cycle size trade-off (Wikipedia)
"The shorter the cycle, the fewer aircraft can be launched/recovered; the longer the cycle, the more critical fuel becomes for airborne aircraft."

### Day/night composition (Stennis time-lapse, Fighter Sweep)
1. Morning FOD walkdown of the whole deck
2. SAR / plane-guard helicopter launches. Helos **launch first and land last**.
3. Day ops open with an E-2 launch (jet sim: Event 1 can open with the recovery tanker)
4. Day cyclic ops, with a pause for a helicopter break
5. Evening FOD walkdown
6. Sunset → night cyclic ops on all four catapults
7. After the last recovery: **respot for the next morning's first launch**, with jets packed on the bow
8. Lights out (maintenance continues through the night)

---

## 2. The Air Plan

- **What it is:** the daily flight schedule. It is published the evening before, usually as a printed foldout circulated to every ready room, Pri-Fly, Flight Deck Control, CATCC, and the departments.
- **Who builds it:** the air wing's Strike Ops / CVW Operations drafts it from tasking (ATO, training needs, strike group requirements). It is coordinated with the ship's **Air Operations** (Air Ops / "the Air Plan officer") and approved by **CAG** and the ship's **Commanding Officer**.
- **Contents (typical fields):**
  - Event number, launch time (L), recovery time (R), cycle length
  - Per event: squadron, side number / call sign, mission (CAP, strike training, SSC, tanker, EW, CQ, etc.), number of aircraft, fuel and ordnance loads
  - **Recovery tanker** and mission tanker assignments, with give-away fuel
  - Alert posture by period (Alert 5/15/30 assignments)
  - Spares
  - Case (I/II/III), sunrise/sunset/moonrise, PIM (ship's intended movement), BRC estimate, divert fields and bingo info (or "blue water")
  - Plane-guard helo and E-2 coverage
- **Execution:** Air Ops tracks the live state of the plan on status boards in CATCC. Pri-Fly (Air Boss) runs the deck to the plan's launch and recovery times, and the Handler respots to meet the next launch.

(Sources: general domain knowledge, consistent with Wikipedia and CNATRA-derived descriptions. No public copy of the CV NATOPS manual text was retrievable to quote.)

---

## 3. Why "launch before land": the cyclic ordering

On a Nimitz-class deck (~1,092 ft long, ~4.5 acres), the **angled landing area (LA)** shares space with the **waist catapults (Cat 3, Cat 4)**. Before a launch, the jets of the next event are spotted all over the deck, including areas that would foul the LA. So the sequence each cycle is:

1. **Launch Event N.** This clears the deck. Bow cats 1 and 2 and waist cats 3 and 4 all work at once.
2. **Clear and rig the landing area.** Waist cats stop, the angle is cleared of jets, people and equipment, and the arresting gear is set.
3. **Recover Event N-1.** These jets launched one cycle earlier and have been holding overhead in the Case I stack (or in marshal for Case III). The first trap comes roughly **10–15 min after the first launch**, i.e. a few minutes after the last cat shot.
4. Recovered jets taxi forward and **pack on the bow, street, six-pack and crotch**. The waist area aft of the foul line stays clear. Bow cats are blocked by the parked jets during recovery.
5. **Respot** (~60 min): refuel, rearm, swap aircraft via elevators, and spot Event N+1 jets.
6. Repeat. Event N+1 launches at L + cycle time, then Event N recovers.

> "The ship launches airplanes at the start of each cycle to clear the flight deck, giving the deck crew enough space to reposition remaining aircraft for the next recovery." (Wikipedia, paraphrased by search) / TWZ: "Launches clear the deck so crews can reposition the remaining aircraft."

**Day boundaries:** the first event of the day only launches (nothing is airborne yet). The last event of the day only recovers (after the final launch, the last recovery brings everyone home). At the end of the day, aircraft are respotted for the next morning's Event 1.

**Recovery tanker interleave:** the tanker that launches **first** in Event N's launch (often the first cat shot) supports Event N-1's recovery. It holds overhead in the tanker pattern with give-away fuel for low-state or boltering jets. It then recovers with Event N in the next cycle, or the ship keeps a tanker airborne continuously. Flight-sim descriptions say "the tanker launches as the first plane… and lands last". That matches the real "first off, last on" habit for the recovery tanker in a given window.

---

## 4. Alert aircraft

| Posture | Meaning (best available. Sources differ) |
|---|---|
| **Alert 5** (Ready 5) | Aircraft spotted **on a catapult** (or at the cat), with electrical/start power hooked up, aircrew **strapped in** and engines not running. Airborne within 5 min. The duration limit is cited as 4–8 h (flashcard and NATOPS-derived sources). |
| **Alert 15** | Aircraft preflighted, armed and spotted near the cats. Crew in full flight gear in the ready room. Airborne within 15 min. |
| **Alert 30 / 60** | Aircraft ready and spotted for an easy launch. Crew available on call. |

Sim implication: an Alert 5 jet occupies a cat spot (often Cat 1 or a waist cat outside cyclic hours). The handler has to work around it, and it is visible as a manned jet with a yellowshirt and plane captain standing by.

---

## 5. Cyclic vs flex deck vs "ready deck"

- **Cyclic ops (the norm):** fixed-interval launch and recovery windows per the Air Plan. The deck crew gets a predictable respot window. A 2018 navy.mil article on USS Abraham Lincoln called cyclic ops "our new standard": launch and recover aircraft over a set period, with brief pauses for maintenance and fuel/ordnance exchange.
- **Flex deck (flex-deck ops):** launches and recoveries are **not** locked to fixed windows. Aircraft launch and recover on demand, and the deck alternates between a launch configuration and a **ready deck** (LA clear, wires set) as needed. It is used in carrier qualification (CQ), surge/combat tempo, and when the plan needs early "ready deck" times. It is more flexible but harder on the deck crew (anecdotal: sailors call cyclic "easier on crews").
- **Ready deck:** the landing area is clear, arresting gear is set, the lens/IFLOLS is on and the ship is steady on BRC with adequate wind over deck. The deck can take a trap now. It is shown in Pri-Fly by the **green** deck status light.
- **Alpha strike** (historical/large): a deckload launch of the whole air wing. It is not cyclic.

---

## 6. Recovery details that drive the timeline

### Case I (day VMC: ceiling ≥3,000 ft, vis ≥5 nm)
- Jets hold overhead in the **Case I stack**: a left-hand circle, max 5 nm diameter, minimum holding altitude 2,000 ft, and 1,000 ft between altitudes by squadron/flight.
- Tower (Air Boss) clears flights down with **"Charlie"** (commence landing). **"Delta"** means delay/hold and conserve fuel. "99" addresses all aircraft.
- Flights enter at the initial point (3 nm astern at 800 ft) and **break** over the ship at 800 ft. Break intervals are a few seconds apart. Downwind at 600 ft, "the 180" abeam at 1.1–1.3 nm, "the 90" at ~450 ft, groove ~15–18 s.
- **Landing interval: 45–60 s.** More than six in the pattern prompts a "spin".
- **Zip lip:** radio calls are minimal. Pilots call "ball" with fuel state, e.g. "205, Rhino ball, 6.2". The LSO responds "Roger ball".

### Case III (night or IMC)
- Marshal: stack on a radial ~150° relative to BRC. Left-hand 6-min racetrack, aircraft separated 1 nm/1,000 ft. **Push times 1 min apart**, so one jet per minute. 12 jets take ≥12–15 min.
- Platform at 5,000 ft. Gear and flaps at 10 nm. 6 nm at 1,200 ft. **"Ball" call at ¾ nm**, where control passes from CATCC to the LSO.
- Case III launch interval: ≥30 s between launches.

### Wires and traps
- Nimitz class has **4 wires** (Ford has 3, and some Nimitz-class ships have since been reconfigured to 3). Target wire: **3** (#1 is closest to the stern). Stop from ~150 mph in ~1.5–2 s. Throttles go to MIL for ~3 s on touchdown in case of a bolter.
- "OK 3-wire" = a good pass that caught the target wire. LSO grades: **_OK_** (underlined OK, perfect), **OK**, **(OK)** fair, **—** no-grade, **C** cut (unsafe), **B** bolter, **WO** wave-off, **WOFD** wave-off foul deck. Grades are posted on the squadron "greenie board".

### Foul deck
- The landing area is **foul** if any aircraft, person or equipment is over the foul line, or the gear isn't reset (retraction ~ seconds after the trap).
- After a trap, the jet must: raise the hook on the yellowshirt's signal, taxi clear of the LA, and fold its wings while the wire retracts. All of this has to happen within roughly the 45–60 s interval **(est. 20–30 s to clear)**.
- If the deck is still foul when the next jet is on short final, the LSO waves it off: **"Wave off, foul deck."** Red wave-off lights flash on the lens. The jet goes around into the pattern and costs ~1–2 min.

### Bolters and wave-offs
- **Bolter:** the hook misses all wires and the jet, already at MIL, flies off the angle. "Bolter, bolter, bolter". It climbs straight ahead (to ~600 ft in Case I, or 1,200 ft per Case III procedures), turns downwind, and re-enters. It adds ~1.5–3 min per bolter **(est.)**.
- **Wave-off:** the LSO aborts the approach (bad pass, foul deck, insufficient wind) with flashing red lights and the radio call.
- **End-of-cycle bolter:** the recovery window stays open. The ship stays on BRC (it can't turn while recovering). The respot and the next launch prep may slip. The recovery tanker "hawks" a low-state jet (stays nearby, ready to tank). In **blue water ops** (no divert field) the last resorts are tanking and ultimately the **barricade**. With a divert in range, a jet at **bingo** fuel leaves for shore.
- The LSO and Air Boss watch fuel state on each "ball" call. Low-state jets get priority.

---

## 7. Authorities and where they sit

| Role | Who | Location | Controls |
|---|---|---|---|
| **Commanding Officer** | Captain (O-6), naval aviator | Bridge (navigation bridge, island) | Ship. Sets course/speed to give the required wind over deck (WOD ~25–35 kt). |
| **Air Boss ("Boss")**, Air Officer | Commander (O-5) | **Pri-Fly** (Primary Flight Control), top of the island, glass-walled, overlooking the deck aft and angle | Flight deck, hangar deck, and all aircraft within the **5 nm control zone up to 2,500 ft** (Case I). Talks to aircraft on "Tower" and to the deck over the **5MC**. Sets the deck status (red/amber/green). |
| **Mini Boss** | Assistant Air Officer, O-4/O-5 | Pri-Fly, next to the Boss | Carries out the Boss's plan. Often runs the launch while the Boss runs the recovery, or vice versa. |
| **Handler** (Aircraft Handling Officer, ACHO) | LCDR, often a former enlisted ABH (LDO) | **Flight Deck Control**, base of the island at flight deck level | Every aircraft's position on the flight and hangar decks. Plans the respot and avoids a **"locked deck"**. Directs ~12–15 yellowshirts. Uses the **Ouija board** (scale 1/16 in = 1 ft, deck and hangar outlines with aircraft cutouts; colored nuts, bolts and pins mark fuel, maintenance, ordnance and status). Some ships have trialed the electronic ADMACS display. |
| **Air Ops / CATCC** | Ship's Air Operations officer, CATCC controllers | CATCC (below decks) | Air Plan execution, marshal, Case II/III approach control out to the 50 nm carrier control area. |
| **CAG** | Commander, Carrier Air Wing (O-6), plus DCAG | Flies, works from CVW spaces and Pri-Fly/CATCC when needed | All squadrons. Approves the Air Plan with the CO. The "CAG LSO" is the senior LSO. |
| **LSO ("Paddles")** | Squadron pilots, trained at LSO School. A team: Controlling LSO, Backup LSO, sometimes a "Wave" (CAG) LSO, plus a writer | **LSO platform**, port side aft, beside the landing area | Terminal phase of each approach (in Case III from ¾ nm). Wave-off authority and grades every pass. |
| **Shooter** (Catapult Officer) | Commissioned officer in a **yellow** jersey (like the handler and directors) | At each cat. Bow and waist each have a shooter | Gives the final launch signal (touches the deck and points forward). Sets catapult steam pressure / CSV from aircraft weight and wind. |
| **Arresting Gear Officer** | Officer | Near the LA | Sets arresting engine weight per aircraft. Reports the deck clear or foul. |
| **Plane-guard helo** | HSC squadron | Airborne, starboard side | SAR during every launch and recovery. Launches first, lands last. |

### Pri-Fly
- Sits roughly at the O-10 level atop the island (the island is the starboard superstructure).
- **Vulture's Row:** the open catwalk/balcony on the island just below Pri-Fly. Off-duty crew and visitors watch flight ops from there. Personnel must hold on and stay out of the way. It is the classic "spectator" view.
- **5MC** is the flight deck loudspeaker, used by the Boss and Mini Boss. **1MC** is the ship-wide announcing system (flight quarters is announced on the 1MC).

---

## 8. The day's chain of calls: FOD walkdown to last recovery

Exact phrasing varies by ship and Boss. The typical forms are below. "L" = first launch time.

| Approx. time | Call / action | Channel |
|---|---|---|
| L-2h to L-1h | **"Flight quarters, flight quarters. All hands man your flight quarters stations."** (Also heard: "Man all stations for flight quarters.") | 1MC |
| L-1h+ | **FOD walkdown:** all available Air Department plus squadron personnel line up shoulder to shoulder across the deck and walk its whole length, picking up debris (nuts, bolts, safety wire, trash). It is repeated before the day's ops, at shift change, and before night ops. | 5MC: "Commence FOD walkdown" / "Walkdown complete" |
| L-1h | "On the flight deck: all personnel not in the proper flight deck uniform, clear the flight deck. Sleeves rolled down, helmets on and buckled, goggles down." | 5MC |
| L-45 | **"Aircrew, man aircraft"** / "Aircrew are manning up for the 1000 launch." Walk-arounds, plane captains (brown) with aircraft. | 5MC / ready-room squawk |
| L-35 | "Check chocks and chains, tie-downs, intakes clear, loose gear, FOD..." | 5MC |
| L-30 | **"Start the go."** Ship-specific phrasing, often: "Stand clear of intakes, exhausts, props and rotors. Start 'em up." Engines start, then flight control checks with troubleshooters. | 5MC |
| L-20 | Ship turns into the wind to **BRC (base recovery course)**. The plane-guard helo is airborne. | — |
| L-15 | Yellowshirts break jets down: chains off (blueshirts), taxi to cats. Wings spread at the cat. JBDs (jet blast deflectors) up. Final checkers (white/QA, troubleshooters) inspect. Ordies arm. | — |
| L-0 | **"Now launch aircraft"** / "Launch the go." Green deck for launch. The first cat shot is usually the recovery tanker. | 5MC / Tower |
| L+10–13 | Last launch. **"Clear the landing area"** / "Clear the angle." Waist cats secured, LA clear, arresting gear set. **"Rig for recovery."** | 5MC |
| L+13 | Lens on. Ship steady on BRC. WOD checked. **"Green deck"**: deck status light goes green. Tower: "99, Charlie." | Tower |
| L+14 | **"Land aircraft"** (or "Recover aircraft"). First break, then first trap ~1 min later. | 5MC |
| L+14–28 | Traps every 45–60 s. Recovered jets taxi forward and pack on the bow. | — |
| L+~28 | Last trap: "Recovery complete." Next: respot for the following launch. | — |
| After last recovery of the day | Night respot for the morning, then **"Secure from flight quarters."** | 1MC |

---

## 9. Example annotated timeline: one full 1+30 cycle, 12 launch / 12 recover

Assumptions: daytime Case I, 1+30 cycle. **Event 2 launch L = 1000.** Event 1 (12 jets incl. 1 recovery tanker) launched at 0830 and is airborne. Event 2 = 12 jets: 1 recovery tanker (Super Hornet with buddy store, call sign often "Texaco" informally), 9 F/A-18E/F, 2 EA-18G. Event 3 launches at 1130. All four cats in use for the launch. Times are a model, not a quote **(est. built from the cited intervals)**.

| Clock | T (min from Event 2 launch) | Deck / air action | Crew (jersey) highlights |
|---|---|---|---|
| 0915 | T-45 | 5MC: "Aircrew man up for the 1000 launch." Event 2 aircrew walk from ready rooms. Event 2 jets are spotted across the bow, street, six-pack, waist, and partly on the angle (legal because no recovery is pending until after the launch). | Plane captains (brown) at each jet. Ordies (red) finishing loads. Fuelers (purple) topping off. |
| 0925 | T-35 | Preflight walk-arounds. Chocks and chains on. | Brown, red, purple, troubleshooters (white w/ black checkerboard). |
| 0930 | T-30 | **"Start the go."** Engines start (huffer/start carts or APU), control checks. | Brown signals, troubleshooters (white). |
| 0940 | T-20 | Ship turns to BRC, ~25–30 kt WOD. Plane-guard helo airborne. Event 1 jets (airborne since 0830) start checking in overhead. Event 1 tanker overhead. | Bridge / Pri-Fly. |
| 0945 | T-15 | Breakdown: chains off. Yellowshirts start taxiing the first jets to Cats 1, 2, 3, 4. Wings spread approaching the cat. | Blue (chocks/chains), yellow (directors). |
| 0950 | T-10 | First jets on cats: hold-back fitted, launch bar into the shuttle. JBD up behind each cat. Weight board shown to the pilot and confirmed. Final checkers inspect. Ordies arm (hands raised to show they are clear). | Green (cat crew, hookup). Yellow (shooter at the cat). White (final checkers, LSE). Red (arming). |
| 1000 | T+0 | **First cat shot: recovery tanker off Cat 1.** | Shooter (yellow) gives the launch signal. |
| 1000–1011 | T+0–11 | Launch rate: each cat ~1 shot per ~2–3 min (hookup, tension, launch, shuttle retract, JBD cycle). With 4 cats the combined rate is **~1 shot every 45–60 s** → 12 jets in ~11–12 min. Cats alternate so the airborne jets keep clear separation. | Green cat crews reset each shuttle. Yellow directors queue the next jet behind each JBD. |
| 1011 | T+11 | **Last Event 2 jet off (a waist cat).** Waist cats secured. **"Clear the landing area."** | Green (arresting gear crews to stations). |
| 1012 | T+12 | LA clear. Arresting gear set to F/A-18 weight. Lens on. LSOs on the platform (they took station before the launch ended). Deck status light **green** = "Green deck". Tower: **"99, Charlie."** | Pri-Fly (Boss). Arresting gear officer reports clear. |
| 1013 | T+13 | Event 1, first division (4 jets) breaks at 800 ft. Second and third divisions descend in the stack. | — |
| 1014 | T+14 | **Trap 1** (Event 1 lead). "Rhino ball, 5.8" → "Roger ball" → OK 3-wire. Hook up, taxi clear of the LA in ~20–30 s, wings fold. Directed forward to the bow. | Yellow (taxi director), green (hook runner; arresting gear wire retract), blue (chain the jet once parked). |
| 1015–1022 | T+15–22 | Traps 2–9 at ~50 s intervals. Recovered jets packed on the bow cats, street, crotch and six-pack. Event 3 jets that were waiting in the six-pack and junkyard stay put. | Constant yellow-director handoffs, foot to foot along the taxi path. |
| 1022 | T+22 | **Trap 10 attempt: BOLTER.** The jet flies off the angle at MIL, climbs straight ahead, re-enters downwind. | LSO: "Bolter, bolter, bolter." |
| 1023 | T+23 | Trap 10 (next jet in sequence). | — |
| 1024 | T+24 | **Wave-off, foul deck:** the previous jet was slow to clear (hook didn't retract). The jet goes around. | LSO waves off. Red lights on the lens. |
| 1025–1027 | T+25–27 | Traps 11 and 12 (the boltered and waved-off jets come back around). | — |
| 1028 | T+28 | **Event 1 tanker traps last.** Recovery complete: 12 jets aboard, plus the Event 2 tanker now overhead for the next cycle. Ship may leave BRC. | Pri-Fly: "Recovery complete." |
| 1030–1100 | T+30–60 | **Respot:** tow tractors (blue) and directors (yellow) reposition. Down jets go to the hangar via elevators. Event 3 jets come up and get spotted. Hot or cold refuel on the bow (purple). Rearm (red). Maintenance and troubleshooting (green squadron maintainers, white/checker QA). The angle (LA) is used for spotting the next launch. | Biggest "dance" of the cycle. |
| 1045 | T+45 | 5MC: "Aircrew man up for the 1130 launch." Event 3 aircrew walk. | — |
| 1100 | T+60 | "Start the go" for Event 3. | — |
| 1115 | T+75 | Breakdown and taxi for Event 3. Event 2 jets check in overhead. | — |
| 1130 | T+90 | **Event 3 launch → Event 2 recovery ~1142.** The cycle repeats. | — |

Rule of thumb for the sim: **recovery window opens ~L+12 to L+15 and lasts ~12–18 min. Deck work fills the remaining ~55–65 min of the cycle.**

---

## 10. Glossary

| Term | Meaning |
|---|---|
| **Air Boss / "Boss"** | Air Officer. Runs Pri-Fly, the flight deck and the 5 nm/2,500 ft control zone. |
| **Mini Boss** | Assistant Air Officer in Pri-Fly. |
| **Pri-Fly** | Primary Flight Control, the "control tower" atop the island. |
| **Vulture's Row** | Observation catwalk on the island below Pri-Fly. |
| **Handler** | Aircraft Handling Officer in Flight Deck Control. Owns aircraft positions. |
| **Ouija board** | The handler's 1/16-scale deck and hangar plot with aircraft cutouts and colored markers. |
| **CAG** | Commander, Carrier Air Wing (from the old "Commander, Air Group"). |
| **Paddles** | The LSO (from the paddles LSOs waved before optical landing aids). |
| **Shooter** | Catapult officer. |
| **Cat shot** | A catapult launch. |
| **Trap** | Arrested landing. |
| **Ball / meatball** | The optical landing system light. "Calling the ball" = the pilot reports seeing it, e.g. "Rhino ball, 6.2" (type, fuel in thousands of lb). |
| **Roger ball** | LSO acknowledgment of the ball call. |
| **OK 3-wire** | A good pass that caught the target #3 wire. |
| **Bolter** | Hook misses all wires and the jet goes around (at MIL power). |
| **Wave-off** | LSO-ordered abort of an approach (lens wave-off lights plus radio). Mandatory. |
| **Foul deck / "deck's foul"** | Landing area not clear or gear not ready. No landing. |
| **Green deck / Clear deck** | LA clear, gear set, cleared to land (green status light). |
| **Hook skip** | The hook bounces over the wires and causes a bolter. Often graded as not the pilot's fault. |
| **Charlie** | Tower call to commence the approach/landing. "Delta" = delay/hold. |
| **Bingo** | Fuel needed to divert to shore. "Bingo" = go now. |
| **Blue water ops** | No divert field in range. The ship is the only runway. |
| **Hawk** | Tanker shadowing a low-fuel jet. |
| **Texaco** | Informal name for the tanker (many tanker call signs exist). On a carrier this is a Super Hornet with a 5-store config: buddy store on centerline plus 4 drop tanks. |
| **Rhino** | F/A-18E/F Super Hornet nickname (avoids confusion with "Hornet" legacy calls). |
| **Growler** | EA-18G electronic attack aircraft. |
| **Grapes** | Purple-shirted aviation fuels crew (ABF). |
| **Ordie** | Ordnanceman (red shirt, AO). |
| **Bears / yellowshirts** | Aircraft directors (ABH). |
| **Plane captain** | Brown-shirted squadron sailor who owns a jet's preflight and tie-down. |
| **Bow cats** | Cats 1 (starboard) and 2 (port) on the bow. |
| **Waist cats** | Cats 3 and 4 on the port waist, inside the angled landing area. Unusable during recovery. |
| **The LA** | The landing area: the angled deck (~9° off centerline on Nimitz), marked by the foul line. |
| **Foul line** | Painted line bounding the LA. Nothing may cross it during recovery. |
| **Six-pack** | Starboard parking area just forward of the island. Holds roughly six jets. |
| **Street** | The fore-aft lane on the forward starboard side between the island/six-pack area and the bow cats. A taxi/parking lane. **(Informal; confirm position against deck-layout research.)** |
| **Crotch** | The inside corner where the angled deck's forward edge meets the bow (port side, ahead of the LA, between Cat 2 and the angle). Jets park there during recovery. **(Informal.)** |
| **Point** | The forward-port tip of the angled deck (the point of the angle sponson). The DCS model has 2 parking spots there. **(Informal.)** |
| **Patio** | Starboard parking area near the island. The DCS Nimitz model has 3 spots, with a taxi path toward Elevator 1 / Cat 1. **(Informal. Position varies by source.)** |
| **Junkyard** | Area aft of the island on the starboard side where support equipment, the crash crane ("Tilly") and spare jets sit. DCS model: 4 parking spots. **(Informal.)** |
| **Corral** | A small single-aircraft parking spot (DCS model: 1 spot). Commonly placed on the port side near Elevator 4 / aft of the waist. **(Informal; low confidence on position.)** |
| **Fantail** | The stern area. The hangar-level fantail is aft of the hangar bay. "Fantail" on the flight deck usually means the aft end near the ramp. |
| **Ramp / round-down** | The aft edge of the flight deck. |
| **Locked deck** | So many misplaced jets that no more can land or launch until there is a respot. |
| **Respot** | Repositioning aircraft between cycles. |
| **Air Plan** | Daily flight schedule. |
| **Event** | One launch group in the Air Plan. |
| **Cycle** | Time from one event's launch to the next (1+30, etc.). |
| **Flex deck** | Non-cyclic, on-demand launch/recover ops. |
| **Ready deck** | The deck is configured to take a trap now. |
| **BRC** | Base Recovery Course: the ship's heading for flight ops. |
| **WOD** | Wind over deck: ship speed plus true wind, ~25–35 kt for jets. |
| **JBD** | Jet blast deflector, the panel that rises behind each cat. |
| **Greenie board** | The squadron's posted LSO grades. |
| **Zip lip** | Minimal-radio Case I ops. |
| **FOD walkdown** | Shoulder-to-shoulder sweep of the deck for debris. |

---

## 11. Viewer-context media (optional citations)
- **"Carrier" (PBS, 2008):** a 10-part documentary filmed aboard USS *Nimitz* (CVN-68) during its 2005 deployment. Good for the human side of the deck crew. (From knowledge; not re-fetched.)
- **Smarter Every Day (Destin Sandlin), aircraft carrier series:** filmed aboard USS *George H.W. Bush* (CVN-77), with deep dives on cats, arresting gear and the LSO. (From knowledge; not re-fetched.)
- **USS John C. Stennis "day on the flight deck" time-lapse** (Fighter Sweep, cited above). It compresses a full flight day and is a good reference for the sim's "fast-forward" mode.
- The "ballet" metaphor is widely used: Naval Safety Center publications note that "many writers have called the activity on the flight deck a 'ballet'."

---

## Simulation implications

What the simulation should model from this topic:

1. **A cycle clock:** configurable cycle length (1+00 / 1+15 / **1+30 default** / 1+45), with event numbers. Show a timeline bar: "Event N launch", "Event N-1 recovery", "Respot", "Man up", "Start the go".
2. **Strict ordering per cycle:** launch Event N (~12 min) → clear LA and rig (~1–2 min) → recover Event N-1 (~12–16 min at 45–60 s intervals) → respot (~55–60 min) → repeat. First event: launch only. Last event: recovery only, then the night respot.
3. **Deck-state machine for the LA:** `LAUNCH_CONFIG` (waist cats active, LA may hold parked jets) → `CLEARING` → `READY/GREEN` → `FOUL` (after each trap until clear, ~20–30 s) → `GREEN` … → `RECOVERY_COMPLETE`. Show the Pri-Fly deck status light (red/amber/green).
4. **Cats:** 4 cats. Each cycles hookup → tension → launch → retract (~2–3 min per cat per shot, est.). Combined launch rate ~1 jet per 45–60 s. Waist cats are disabled when the LA is in recovery mode. Bow cats are blocked once recovered jets are packed forward.
5. **Recovery:** Case I pattern: overhead stack → break → downwind → groove → trap. Interval 45–60 s. Case III mode: straight-in at 1/min.
6. **Stochastic events:** bolter (~5–10% of passes, est.), foul-deck wave-off (occasional), technique wave-off. Each adds ~1.5–3 min for that jet. End-of-cycle bolters delay "recovery complete" and compress the respot.
7. **Recovery tanker:** the first cat shot of each launch is a Super Hornet tanker that orbits overhead during the following recovery and lands last in the next window. Optional "hawk" behavior for a low-state jet.
8. **Alert 5 jet:** optionally parked on a cat with crew strapped in.
9. **Respot choreography:** recovered jets taxi forward to bow/street/crotch/six-pack. During the respot, jets move via tow tractors and elevators (down jets to the hangar, Event N+1 up). Fuel (purple) and ordnance (red) service. Event N+1 jets get spotted, including on the angle.
10. **Authorities as overlays:** Pri-Fly (Boss/Mini Boss) issuing 5MC/tower calls. Flight Deck Control (Handler + Ouija board view as an alternate "map" view). LSO platform with ball calls and grades. Shooters at each cat. Optional text or voice for: "Flight quarters…", "Commence FOD walkdown", "Aircrew man aircraft", "Start the go", "Launch aircraft", "Clear the landing area", "99, Charlie", "Land aircraft", "Bolter, bolter, bolter", "Wave off, foul deck", "Recovery complete", "Secure from flight quarters".
11. **Day-level mode:** a compressed 12–16 h day with 7–10 events, morning and evening FOD walkdowns, a day/night transition (lighting change, Case I → Case III), and the end-of-day respot for the morning.
12. **Realistic numbers:** 10–14 jets per event (jet-only), Super Hornet/Growler mix (~4:1), sorties ~1+30 to 1+50, ship on BRC during launch and recovery with WOD 25–35 kt.
13. **Area labels** (toggleable): Bow cats, Waist cats, LA/foul line, Six-pack, Street, Crotch, Point, Patio, Junkyard, Corral, Fantail, Island/Pri-Fly, Vulture's Row, LSO platform, Elevators 1–4. Positions of the informal names need cross-checking with the deck-geometry research file.

---

## Sources

- Wikipedia, "Modern United States Navy carrier air operations": https://en.wikipedia.org/wiki/Modern_United_States_Navy_carrier_air_operations
- Wikipedia, "Launch and recovery cycle": https://en.wikipedia.org/wiki/Launch_and_recovery_cycle
- Wikipedia, "Ready 5": https://en.wikipedia.org/wiki/Ready_5
- Wikipedia, "Alpha strike (United States Navy)": https://en.wikipedia.org/wiki/Alpha_strike_(United_States_Navy)
- U.S. Navy, "Cyclic Ops: Our New Standard" (USS Abraham Lincoln): https://www.navy.mil/Press-Office/News-Stories/Article/2250055/cyclic-ops-our-new-standard
- Naval Aviation News / USFF, "Embarked airwing conducts F-35C cyclic operations aboard George Washington" (2024): https://navalaviationnews.navy.mil/Editorial-Staff-Tools/Article-Submission/Article/3728099/embarked-airwing-conducts-f-35c-cyclic-operations-aboard-george-washington/
- The War Zone, "How to land a fighter on an aircraft carrier on a stormy night": https://www.twz.com/3559/how-to-land-a-fighter-on-an-aircraft-carrier-on-a-stormy-night
- Fighter Sweep, "Watch: time-lapse of a day on a carrier flight deck" (USS John C. Stennis): https://fightersweep.com/6143/watch-time-lapse-day-carrier-flight-deck/
- Fighter Sweep / SOFREP, "Carrier flight ops aboard the Stennis": https://sofrep.com/fightersweep/carrier-flight-ops-aboard-the-stennis/
- Air & Space / Smithsonian, "How Things Work: The Ouija Board": https://www.smithsonianmag.com/air-space-magazine/how-things-work-the-ouija-board-10048217/
- We Are The Mighty, "The crazy way an aircraft carrier tracks all of its aircraft": https://www.wearethemighty.com/articles/the-crazy-way-an-aircraft-carrier-tracks-all-of-its-aircraft-on-ship/
- StrategyPage, "Taking the Ouija Board out of flight operations" (2011): https://www.strategypage.com/htmw/htnavai/articles/20110812.aspx
- HowStuffWorks, "How Aircraft Carriers Work: The Island": https://science.howstuffworks.com/aircraft-carrier5.htm
- GovExec, "Truman Thursdays: The Handler Explains It All": https://www.govexec.com/management/2010/02/truman-thursdays-the-handler-explains-it-all/39667/
- Jalopnik, "I Spent 24 Hours On Board A US Navy Aircraft Carrier At Sea": https://www.jalopnik.com/i-spent-24-hours-on-board-a-us-navy-aircraft-carrier-at-1541114300/
- AIRPAC, "Flight Deck Awareness" (PDF): https://www.airpac.navy.mil/Portals/53/Flight Deck Awareness V2.pdf
- CNATRA P-481 (shipboard ops FTI): https://www.cnatra.navy.mil/local/docs/pat-pubs/P-481.pdf
- Hoggit wiki, "DCS editor carrier spawns" (named deck areas in the sim community's Nimitz model): https://wiki.hoggitworld.com/view/DCS_editor_carrier_spawns
- 132nd Virtual Wing carrier brief (flight-sim community model of recovery windows and tanker): https://132nd-vwing.github.io/OPAC-Brief/MISSION%20INFORMATION/Carrier.html
- DCS forum, "How cyclic ops really works" (CNATRA-derived, secondary): https://forum.dcs.world/topic/262004-how-cyclic-ops-really-works-by-gb-and-pieter
- Naval Safety Command, Approach magazine (recovery tanker incident, VFA-27): https://issuu.com/navalsafetycommand/docs/vol64_no2/s/14803803
- Task & Purpose, "9 naval aviation slang terms": https://taskandpurpose.com/news/9-naval-aviation-slang-terms-never-knew-needed
- Wiktionary, "Appendix: Glossary of U.S. Navy slang": https://en.wiktionary.org/wiki/Appendix:Glossary_of_U.S._Navy_slang
