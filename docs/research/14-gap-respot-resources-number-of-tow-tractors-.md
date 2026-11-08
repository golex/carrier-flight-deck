# 14 - Gap fill: Respot resources (tow tractors, tow vs. taxi, move order, fuel stations, hot refueling)

Scope: the resources that limit the respot on a Nimitz-class CVN with a jet-only air wing (F/A-18E/F, EA-18G). It answers five gaps left by 05-aircraft-handling.md and 06-cyclic-ops.md:
1. How many flight-deck tow tractors and spotting dollies there are.
2. What share of moves are towed versus taxied, and how many run at once.
3. The order of a respot.
4. Where the JP-5 deck-edge fuel stations are, how many there are, and how far a hose reaches.
5. Where hot refueling happens during cyclic ops.

Confidence tags (same as earlier files):
- **[S]** = one source states it.
- **[C]** = two or more independent sources agree.
- **[E]** = engineering or practitioner estimate. It is consistent with the sources but not stated by them. Use it as a tunable default.

**Honest summary.** No open source gives an official tractor count for a Nimitz-class CVN, a towed-versus-taxied ratio, or a respot move order. The NATOPS CV manual (00-80T-105) and the Aircraft Handling Manual (00-80T-120) hold this material, and neither is online. The answers below rest on four things: one first-hand V-1 account (a dozen or so flight-deck tractors), Navy fuels training manual text (stations, hose reels, hose lengths, crews), a Navy fire-protection technical report (14-18 flight-deck fuel stations), and the physical logic of the deck. All the respot ratios are **[E]**.

Several primary sources could not be retrieved: a DTIC report, the Naval Safety Center "Flight Deck Awareness" guide, the MIT DSpace theses (rate-limited), the tpub ABH manual pages (certificate error) and the DCS "How cyclic ops really works" forum thread (403). Where I used them, the material came only from search-result excerpts.

---

## 1. Tow tractors and spotting dollies

### 1.1 Types (recap, see 05 §2)

| Vehicle | Where | Role |
|---|---|---|
| **A/S32A-31A** tow tractor | Flight deck (and amphib decks) | Tows jets with a tow bar on the nose gear. On carriers it is "typically equipped with a gas turbine unit to start jet aircraft engines" [C: alexsmodelling, 05 sources]. That makes the same tractor a mobile start cart for aircraft without an APU. The Super Hornet and Growler have an APU, so the starter role matters less for this air wing [E]. |
| **Shipboard Tow Tractor (STT)** | Flight deck, CVN/LHA/LHD | NAVAIR replacement for the -31A. Its "primary role is the handling of aircraft aboard the flight deck." It also "refuels and ferries the Air Start Unit" [S: NAVAIR summary via search; SlashGear]. Ford uses the **A/S32A-49** in DVIDS captions [S]. |
| **A/S32A-32 / -32A spotting dolly (SD-2)** | Hangar bay and elevators | "Tow, turn and position aircraft on hangar decks and elevators." Hangar tractors "do not tow aircraft on the flight deck and do not normally venture onto the flight deck at all" [S: alexsmodelling]. |

### 1.2 How many

| Item | Value | Basis |
|---|---|---|
| Flight-deck tow tractors | **"a dozen or so"** | [S] First-hand V-1/Crash & Salvage account, USS Kitty Hawk (CV-63), 1975-77: "There were a dozen or so tow tractors on the flight deck and a smaller number on the hangar deck." |
| Hangar-deck tractors / spotting dollies | **"a smaller number"** than the flight deck, i.e. **~4-8** | [S] same account for "smaller". The 4-8 range is [E]. |
| Crash/salvage tractors | Some flight-deck tractors are crewed by crash crew in emergencies: "4 Crash crew in the truck, and 2 Crash crew on each of two tractors" | [S] same account. So **~2 tractors** are earmarked for crash/salvage response [E: interpretation]. |
| Tractor supervision | "One designated Yellow Shirt was in charge of all the tractors and affectionately known as 'Tractor King.'" | [S] same account |
| Modern Nimitz-class figure | **Recommend 12 flight-deck tractors (range 10-15)** | [E]. This is consistent with the Kitty Hawk figure, a similar air wing size (60-70 aircraft) and a similar deck. No modern official count was found. |

Where they park: the **junkyard** (starboard, aft of the island, by elevator 3), next to Tilly and the crash trucks. A Kitty Hawk photo caption shows "tractors positioned on the starboard side of the flight deck in preparation for aircraft movement after the conclusion of daily flight operations" [S]. During a launch or recovery, idle tractors sit chained in the junkyard, on the patio or along the starboard deck edge, clear of the foul lines and catapult tracks [E].

### 1.3 What limits simultaneous tows: crews, not tractors

- A towed move needs **at least 6 sailors**: "one aircraft director, one brake rider, one tractor driver, two chock-and-chainers, and one tail and wing safety" [S: DVIDS, USS Gerald R. Ford hangar bay, 2023]. Other sources give 6-10 per move (05 §2).
- Only **~12-15 yellowshirt directors** are on deck [C: Wikipedia, 05]. Each tow needs its own director walking ahead.
- Even with 12 tractors, the yellowshirts limit simultaneous tows to roughly **6-10 at once** [E]. Some directors stay at fixed points (elevators, bow, choke points) or taxi jets.
- Ford hangar crew benchmark: "We move around 20 aircraft a night" [S: DVIDS] (hangar bay only).

---

## 2. Towed versus taxied

### 2.1 What the sources say

- Aircraft move "some on their own power with the pilot at the controls, others towed with a tow tractor", and a squadron plane captain rides the brakes in a towed jet [S: Kitty Hawk V-1 account].
- After landing, aircraft are "taxied to parking spots and shut down" [S: Wikipedia]. **Recovery moves are taxi moves.**
- Before flight ops, jets are spotted "so that Cycle #1 aircraft could easily taxi to the catapults once they had been inspected and started" [S: V-1 account]. **Launch moves are taxi moves.**
- "Taxiing aircraft and towed aircraft with drawbar are two typical dispatch modes on the flight deck" [S: carrier deck trajectory-optimization literature]. A deck-scheduling paper models the respot as tractor tows and the move to the catapult as a taxi [S].
- An MIT deck-planning paper says aircraft "must be towed and guided by ground crew and must be routed around traffic" [S: Michini & How 2011, via abstract/search].

### 2.2 Reasoning: why the respot is mostly towed

- After recovery a jet is **shut down, chained, and being fueled, armed and serviced**. Restarting engines just to reposition it would cost fuel and starter time. Jet blast would also endanger the dense crowd of crew working other jets during the respot. So a parked, shut-down jet moves by **tractor** [E, strong].
- A jet is taxied when its engines are already running:
  - (a) after the trap, from the landing area to its first parking spot;
  - (b) at launch, from its spot to the catapult;
  - (c) when it is hot refueled (see §5) and goes straight back to a cat;
  - (d) at the handler's discretion, when a turning jet is quicker to taxi than to shut down [E].
- **Elevator moves are always towed.** Engines are never run on an elevator, and the hangar uses spotting dollies [C: alexsmodelling, DVIDS Ford].

### 2.3 Recommended ratios for the sim [E]

| Phase | Taxi share | Tow share | Notes |
|---|---|---|---|
| Recovery (trap → first parking spot) | ~100% | ~0% | Every jet taxis out of the landing area under a yellowshirt. |
| Respot (45-60 min window) | **~10-25%** | **~75-90%** | Taxi only for jets kept turning (hot-refuel/hot-seat). Everything shut down is towed. |
| Launch (spot → cat) | ~100% | ~0% (rare tow to the cat for a jet that won't start in place, or an aircraft spotted where it can't start) | Jets start in place with tails pointed outboard, then taxi. |
| End-of-day respot (pack for morning) | ~0% | ~100% | Night, engines off, all tractors. |
| Elevator moves | 0% | 100% | |

**Respot move counts [E]** for a typical 1+30 cycle with ~12-16 jets recovered and ~12-16 to launch next:
- **~15-30 tractor moves.** Some jets move twice: once to clear a path, once to their final spot.
- **~2-6 elevator trips** (2 jets per lift).
- Peak concurrency: **6-10 tows at once**, with **1-2 elevators cycling**.
- At 3-6 min per tow (05 §2), 6-8 parallel crews finish 25 moves in ~15-25 min of moving time. The rest of the 45-60 min goes to fueling, arming, maintenance and FOD walk, and moves wait for these "service locks" [E].

---

## 3. Order of a respot

No source gives a canonical sequence. The order below comes from deck constraints that the sources do state:
- the landing area must stay clear for recovery;
- after the last recovery jets are "stored on the bow" [S: Wikipedia];
- launchers sit with tails pointed outboard where they can start and taxi to a cat;
- nothing crosses a cat track in use;
- fueling or arming locks a jet in place.

All sequencing is **[E]**.

### 3.1 State at the start of the respot (just after recovery of Event N)

- The landing area (angle) is clear. The Event N jets just trapped are parked forward: **bow (rows 1-4), crotch, street, six-pack, patio**. The bow cats (1/2) are covered by parked jets. On a recovery-heavy deck the waist cats (3/4) are often free.
- Note on cyclic order: in standard cyclic ops the **launch of Event N+1 comes before the recovery of Event N** (06). The respot therefore runs between recovery N and launch N+2, which is the ~60 min gap in 06. During that gap, jets just recovered (packed forward) must be shuffled so Event N+2 launchers (some just recovered, some fresh from the hangar, some parked aft) end up in start-and-taxi spots.

### 3.2 Recommended sequence [E]

1. **T+0-5 min. Recovery cleanup.** The last trapped jet taxis forward and is chained. Fuel (purple) and ordnance (red) crews start on the bow and street jets. The Air Boss reopens the deck for moves. The handler finalizes the plan on the Ouija board with squadron maintenance (which jets are "up" or "down").
2. **T+5-20 min. Elevator moves early ("down jets down, spares up").** Down (broken) jets are towed to **elevators 1/2** (bow side) or **3** (aft starboard) and struck below. Spares and fixed jets for the next event come up. Do this early, because elevators are the slowest resource (~3-5 min per trip) and a jet arriving late would block the final spot. **Elevator 4 (port, aft) sits in the landing area**, so it is used only when no recovery is near. It is usually reserved for the end-of-day respot or a long gap.
3. **T+10-35 min. Open the bow cats.** Jets on the bow are towed off cats 1/2 and their JBD areas, **outermost/most-accessible first**, a "peel the pack" order. They are moved aft to the street, the six-pack, along the starboard edge or onto the waist (outside the landing-area foul lines if a recovery is coming). The aim is clear lanes into cats 1 and 2 for the next launch.
4. **T+15-40 min. Spot the next launchers.** Next-event jets are towed to launch spots that allow a start and taxi to a cat: **tails over the deck edge** around the bow, the patio, and the waist behind cats 3/4. First launches (e.g. the tanker) go nearest the cats. The bow spots that feed cats 1/2 are filled last, after the bow is clear.
5. **Throughout: fuel and ordnance locks.** A jet hooked to a fuel hose or being loaded cannot move. The handler **sequences around those locks**. Jets are fueled where they sit after recovery, if a station hose reaches, or after they reach their final spot. Moving a jet before it is fueled is better when its current spot is in the way (bow/cat lead-in), because a station reaches it in the new spot too.
6. **T+40-55 min. Final checks.** The deck is set for the next launch. A FOD walkdown may run if the window allows. Final chains go on. Plane captains preflight. Engines start ~10-20 min before the launch (06).
7. **Recovery window prep.** Before the following recovery, the landing area and foul lines must be clear. Anything spotted on the angle must move or launch first.

### 3.3 Rules of thumb for the move planner

- **Cat lead-ins first, deep spots last.** Clear what blocks the catapults first. Fill the hardest-to-reach spots before the easy ones (the bow pack is filled from the front back and emptied from the back front).
- **Elevators early.** Hangar swaps go at the start of the window.
- **Zones run in parallel.** Two tows rarely share a lane at once. Moves run in parallel in separate zones: Fly 1 (bow), Fly 2 (waist/six-pack/street) and Fly 3 (aft/fantail), each with its own directors (01 §Fly zones).
- **No cat track crossings during launch.** No moves forward of a tensioned cat (05).
- **"Locked deck" is the failure mode.** A badly ordered respot leaves a jet that can't reach its cat, or a landing area that can't be cleared [C].

---

## 4. JP-5 flight-deck fuel stations

### 4.1 How many and where

| Fact | Value | Basis |
|---|---|---|
| Flight-deck JP-5 fueling stations | **14-18** | [S] NAWCWD TP 8516 (Darwin & Bowman, *Aircraft Carrier Flight and Hangar Deck Fire Protection*, 2005), via a search excerpt: "Anywhere from 14 to 18 JP-5 fueling stations are on the flight deck." |
| Hangar-deck fueling stations | **6-7** | [S] same report |
| Hose reels per station | **3-4**, each with its own Cla-Val fuel/defuel valve | [S] NAVEDTRA 14003 (ABF) ch. 5: "each refueling station contains three or four hose reels, each having its own Cla-Val." |
| Location | **Deck-edge catwalks/sponsons** just below flight-deck level, around the perimeter. Station positions are marked on the deck-edge bumper (purple marking) | [S] search excerpts (Navy fuels manual, deck-edge markings). [E] for purple. Typical of all CVN imagery. |
| Plumbing layout | Service-station risers come up from an **outboard distribution main** in **four quadrants** (forward/aft × port/starboard), with forward and aft "legs" per quadrant. Crossovers let "any service pump in either pump room" feed "any service station on the flight or hangar decks" | [S] NAVEDTRA 14003 ch. 4 |
| Service pump | Each delivers **1,100 gpm at 150 psi**. There are **four service pumps** (two pump rooms) | [S] NAVEDTRA 14003 ch. 4 |
| Station delivery pressure | Cla-Val pressure-reducing pilot adjustable **15-100 psi**. The example setting is **50-55 psi** | [S] NAVEDTRA 14003 ch. 5 |
| Station defuel pump | **100 gpm at 15 psi** | [S] NAVEDTRA 14003 ch. 5 |
| Station manning | Fueling stations manned **1 hour before fueling time** | [S] NAVEDTRA 14003 ch. 4 (general rule) |

### 4.2 Hose reach

- Each hose reel stores **150 ft of 2½-inch collapsible hose** (refueling) or **1½-inch non-collapsible hose** (defuel, tractor fill) [S: NAVEDTRA 14003 ch. 5].
- Hoses come in **50 ft or 100 ft** standard lengths [S].
- **Effective reach is about 120-140 ft** from the deck edge, after routing around chocks, chains and other jets [E].
- The deck is ~252 ft wide and stations line both edges, so **any parking spot can be reached by some station**. Mid-deck spots (centerline street, the bow between cats 1 and 2) are at the limit, ~100-125 ft from either edge.
- A hose run across a lane **blocks tows through that lane**: hoses must not be run over by "aircraft, tractors, or other rolling stock" [S]. So fueling at a spot locks the jet **and** its neighbors' paths.

### 4.3 Recommended station layout for the sim [E]

These use the deck coordinates from 01 §12. x is measured from the stern, y is positive to starboard, units are feet. There are 16 stations, placed in deck-edge catwalks and kept clear of the elevator cutouts, the LSO platform and the lens.

| ID | Side | x | y | Serves |
|---|---|---|---|---|
| F1 | Stbd bow | 1000 | +62 | Patio, cat 1 area, bow rows |
| F2 | Stbd bow | 900 | +82 | Bow/patio |
| F3 | Stbd, fwd of El 1 | 790 | +100 | Bow, cat 1 lead-in |
| F4 | Stbd, between El 1/2 | 660 | +100 | Six-pack, street |
| F5 | Stbd, island fwd | 570 | +102 | Six-pack (island end) |
| F6 | Stbd, aft of island | 405 | +100 | Junkyard |
| F7 | Stbd, aft of El 3 | 300 | +100 | Fantail fwd |
| F8 | Stbd fantail | 150 | +96 | Fantail |
| F9 | Stbd stern | 40 | +92 | Fantail aft |
| F10 | Port stern | 60 | -102 | LA aft edge (only when no recovery) |
| F11 | Port, aft of El 4 | 270 | -120 | Waist/El 4 area |
| F12 | Port waist | 480 | -132 | Waist, cats 3/4 |
| F13 | Port sponson fwd | 640 | -145 | Waist forward, the point |
| F14 | Port bow | 900 | -55 | Bow port side, cat 2 lead-in |
| F15 | Port bow | 1000 | -50 | Finger, bow rows |
| F16 | Port crotch | 790 | -58 | Crotch |

---

## 5. Hot refueling during cyclic ops

### 5.1 Procedure facts

- Hot refueling means pressure refueling with engines running. The procedure is the same as cold refueling, with these additions [S: NAVEDTRA 14003 ch. 5]:
  - The pilot keeps UHF contact with **Primary (Air Boss)**.
  - Armament switches are SAFE.
  - **Canopy closed**.
  - The aircraft must pass **pre-check** (fuel flow stops "within a few seconds to 1 minute" of actuating it) or it may not be hot refueled.
  - No pilot-in-command changes during fueling.
  - Pressure nozzle only.
  - "Assume both engines on a dual-engine aircraft are operating." For the F-18, "most aircraft currently do not" shut down the engine on the refueling side.
- **Crew:** a minimum of 3 (refueling crewman/nozzleman, station operator, plane captain). A crewleader/safety is recommended and can cover several fuelings [S: NAVEDTRA 14003].
- **Tie-downs:** "Aircraft tiedowns will not be removed or altered during the aircraft refueling evolution", and the aircraft must have initial tie-downs first [S]. So **a hot-refueled jet is chained (initial tie-downs) at a fixed spot near a station**. It is not fueled while rolling.
- **Firefighting:** the flight deck P-16 crash truck, manned whenever aircraft are aboard, satisfies the manned firefighting requirement [S].
- **Fuel load:** asked with hand signals as soon as the jet lands ("What is your fuel load?") [S].
- The handler sets fueling assignments through the **Aviation Fuels Flight Deck Control Talker** in Flight Deck Control, working with the CAG maintenance chief [S: NAVEDTRA 14003].

### 5.2 Where it happens [E]

- No open source names a fixed "hot pit" spot on a Nimitz-class CVN. A forum claim says hot pitting is standard for carrier qualification (trap, refuel, taxi forward to the cat) [S, anecdotal].
- In cyclic ops most turnarounds are **cold** (shut down, chained, fueled during the respot). **Hot refueling is the exception.** It is used for:
  - a jet that will launch in the very next event without shutting down (a "hot turn", sometimes with a "hot seat" pilot swap with engines running);
  - the **recovery tanker** cycle;
  - carrier qualification periods.
- **Recommended location:** jets taxi out of the landing area and hot pump at a station that lets them go straight to a catapult without a tow:
  - **Primary:** the **starboard bow/patio and forward six-pack** (stations F1-F4), feeding cats 1/2.
  - **Secondary:** the **port waist** (F12-F13), feeding cats 3/4, when the bow is packed and no recovery is due.
  - Avoid the fantail during a recovery, because it is too close to the landing area and the jet would have to cross the deck.
- Typical F/A-18E hot top-off: ~5,000-8,000 lb JP-5 (~750-1,200 gal) at ~200-300 gpm through one nozzle, so **~4-6 min hooked up**, plus ~1-2 min to hook up and unhook [E].

---

## Simulation implications

1. **Tractor pool:** model **12 A/S32A-31A tractors on the flight deck** (tunable 10-15). Park them in the **junkyard** (aft of the island) and along the starboard edge when idle. **2** are reserved for crash/salvage and do no respot moves. Model **4-6 spotting dollies in the hangar** (off-screen, abstracted). The STT is a skin option.
2. **Concurrency limiter = directors.** Cap simultaneous tows at **min(free tractors, free yellowshirts, free move crews)**. Defaults:
   - 12-15 yellowshirts. 2-3 are pinned to elevators, the bow and Fly-zone posts.
   - **6-10 concurrent tows.**
   - Each tow is a formation of **≥ 6 crew**: yellow director, blue tractor driver, brown brake rider in the cockpit, 2 blue chock/chain, 1 blue wing/tail walker. Add a white safety observer optionally.
   - Show a "Tractor King" yellowshirt dispatching tractors.
3. **Movement mode by phase:**
   - Recovery: taxi 100%.
   - Launch: taxi 100%.
   - Respot: **~80% tow / 20% taxi** (taxi only for hot-turn jets).
   - End-of-day pack: 100% tow.
   - Elevators: 100% tow.
4. **Respot script:** ~15-30 tractor moves plus 2-6 elevator trips in a 45-60 min window (time-compressible). Order:
   - (1) cleanup and fueling starts;
   - (2) **elevator swaps early**, using El 1/2/3 and El 4 only when the landing area is cold;
   - (3) **peel the bow pack outermost-first** to open cats 1/2;
   - (4) tow next launchers to start-ready spots with tails outboard, nearest-cat jets first, bow spots last;
   - (5) final chains, FOD walk, engine start.
   Allow some jets to make 2 moves (a "shuffle").
5. **Service locks:** a jet with a fuel hose, ordnance or maintenance attached cannot move. A **fuel hose across a lane blocks tows through that lane.** The planner must sequence around the locks. That is the core of "the dance".
6. **Fuel stations:**
   - Render **16 deck-edge stations** (table in §4.3) with a purple bumper mark.
   - Each has **3-4 reels**, so up to 3-4 jets fuel at once per station. Practical cap is 2-3 [E].
   - Hose reach: **150 ft max, ~130 ft effective**. Draw a hose line from the station to the jet's single-point refuel receptacle.
   - Cold-fuel crew: nozzleman and station operator (stays at the station), both purple, plus the brown plane captain.
   - Fuel time ~5-10 min per jet [E].
7. **Hot refuel:**
   - An optional event flag. A recovered jet taxis straight to a **bow/patio station (F1-F4)** or the port waist (F12-F13), is chained with initial tie-downs, and is hot pumped for **~5-7 min** with the canopy closed and engines running. It then taxis directly to a cat.
   - Visual cue: purple crew plus a hose at a running jet, with a jet-exhaust hazard zone kept clear.
   - Use it for the recovery tanker and an occasional hot turn, at most **1-3 jets per cycle** [E].
8. **Fuel Control Talker** in Flight Deck Control: an optional UI annotation showing which station is assigned to which jet. The Ouija board purple nut marks a jet that needs or is getting fuel (05).
9. **Failure mode demo:** an optional "locked deck" scenario. A wrongly ordered respot leaves a jet unable to reach its cat, or a fuel hose blocks a lane. The handler must reshuffle.

---

## Open questions

- An official tractor allowance per CVN (the NAVAIR support-equipment allowance list). It is not public. 12 is extrapolated from a 1970s Kitty Hawk account.
- The exact number and frame positions of flight-deck fuel stations on CVN-68 to CVN-77. This needs ship drawings or the full TP 8516 text, which DTIC refused (403).
- A measured tow-versus-taxi ratio in modern cyclic ops. 00-80T-120 (Aircraft Handling Manual) or the MIT MASCS/Ryan dissertation might have calibration data. MIT DSpace was rate-limited (429).
- Whether modern Nimitz-class air departments name a standing "hot pump" spot in cyclic ops, or use hot refueling mainly in CQ.
- The F/A-18E/F single-point pressure-refuel rate. Assumed 200-300 gpm.

---

## Sources

- Kitty Hawk V-1 / Crash & Salvage first-hand account ("a dozen or so tow tractors on the flight deck", "Tractor King"): https://azadkinsiii.com/blog/67-flight-ops-a-day-in-the-life-of-crash-salvage/
- Same author, towed vs. own-power moves and respot: https://azadkinsiii.com/blog/136-what-makes-the-flight-deck-so-exciting/
- NAVEDTRA 14003 (Aviation Boatswain's Mate F), ch. 5 "JP-5 Afloat Flight Deck Systems and Operations" (hose reels, 150 ft hose, Cla-Val, cold/hot refueling procedure, crew): https://www.globalsecurity.org/military/library/policy/navy/nrtc/14003_ch5.pdf
- NAVEDTRA 14003, ch. 4 "JP-5 Afloat Below Decks Systems and Operations" (quadrants, service stations, 1,100 gpm service pumps): https://www.globalsecurity.org/military/library/policy/navy/nrtc/14003_ch4.pdf
- Darwin & Bowman, NAWCWD TP 8516, *Aircraft Carrier Flight and Hangar Deck Fire Protection: History and Current Status* (2005): "14 to 18 JP-5 fueling stations on the flight deck", 6-7 on the hangar deck (search excerpt only, PDF returned 403): https://apps.dtic.mil/sti/pdfs/ADA432176.pdf
- DVIDS, "Always Moving: USS Gerald R. Ford's Show Behind the Curtain" (6-person tow crew, ~20 hangar moves a night): https://www.dvidshub.net/news/printable/458054
- AlexS Modelling, US Navy flight deck tractor models (A/S32A-31A role, hangar dollies stay off the flight deck): https://alexsmodelling.blogspot.com/2014/12/us-navy-flight-deck-tractor-models.html
- NAVAIR, Shipboard Tow Tractor (STT) product page: https://www.navair.navy.mil/product/Shipboard-Tow-Tractor-STT
- SlashGear, tow tractors on aircraft carriers (STT ferries/refuels the air start unit): https://www.slashgear.com/1912459/owing-on-aircraft-carriers-what-are-tow-tractors/
- Wikipedia, Modern United States Navy carrier air operations (taxi to parking after landing, bow storage, 12-15 yellowshirts, handler): https://en.wikipedia.org/wiki/Modern_United_States_Navy_carrier_air_operations
- Michini & How, "A Human-Interactive Course of Action Planner for Aircraft Carrier Deck Operations" (MIT, AIAA Infotech 2011), abstract: https://dspace.mit.edu/handle/1721.1/81478
- Ryan, J.C., MIT PhD dissertation (MASCS), record: https://dspace.mit.edu/handle/1721.1/97255
- Proactive robust scheduling for carrier flight deck operations (respot by tractor tow, taxi to cat): https://www.researchgate.net/publication/328692146_A_Proactive_Robust_Scheduling_Method_for_Aircraft_Carrier_Flight_Deck_Operations_with_Stochastic_Durations
- Autonomous sortie scheduling under towing mode (tractors as a constrained resource): https://www.sciencedirect.com/science/article/pii/S2214914724001818
- GovExec, "Truman Thursdays: The Handler Explains It All" (2010; handler and Ouija board, no numbers): https://www.govexec.com/management/2010/02/truman-thursdays-the-handler-explains-it-all/39667/
- Army FM 1-564 ch. 6 (shipboard tractor rules, minimum move crew): https://www.globalsecurity.org/military/library/policy/army/fm/1-564/CH6.HTM
- f-16.net forum (anecdotal: hot pitting standard in Navy CQ): https://www.f-16.net/forum/viewtopic.php?p=10627
