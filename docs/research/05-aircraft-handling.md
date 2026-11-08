# 05 - Aircraft Handling and Movement on the Flight Deck ("Respot")

Scope: how jets physically move around a Nimitz-class flight deck between launch and recovery. Covers the airframe constraints of the F/A-18E/F and EA-18G, wing fold, launch bar and tailhook, tow tractors and tow bars, chocks and tie-down chains, the move crew, the Handler and his Ouija board, launch vs. recovery spots, the respot, elevators, taxi routes, jet-blast hazards, and FOD walkdowns.

Confidence tags used below:
- **[C]** confirmed by two or more independent sources, or by one official source
- **[S]** single secondary source (study deck, journalism, forum), plausible
- **[E]** engineering estimate or practitioner convention for simulation use, not found in a source

Some primary pages (navy.mil fact files, NAVAIR, the tpub ABH training manual NAVEDTRA 14014, the FM 1-564 shipboard-ops chapter, the Smithsonian "How Things Work: The Ouija Board" article) block automated fetches. Their content was taken from search-engine excerpts and the secondary pages that quote them.

---

## 1. The airframes: F/A-18E/F Super Hornet and EA-18G Growler

The Growler is a two-seat F/A-18F airframe with the gun removed and electronic-warfare pods on the wingtips. **For deck handling, treat the two as dimensionally identical.**

| Parameter | F/A-18E/F | EA-18G | Notes / tag |
|---|---|---|---|
| Length | 60 ft 1.25 in (18.31 m). Navy fact file rounds to **60.3 ft** | 60 ft 1.25 in (18.31 m). Some quote 60.2 to 60.4 ft | [C] Wikipedia, aerospaceweb, Aviation Week |
| Wingspan, spread | 44 ft 8.5 in (13.62 m) incl. wingtip missile rails. Navy rounds to **44.9 ft** | 44 ft 8.5 in incl. ALQ-218 wingtip pods | [C] |
| Width, wings folded | **~30 ft 6 in (9.32 m)** | same | [S] Aeropedia, Global Military tables. *The brief's 32.6 ft was not found; use 30.5 ft.* |
| Height (to top of fins) | **16 ft (4.88 m)**. Aerospaceweb gives 15.79 ft | 16 ft | [C] |
| Folded height (outer panels up) | ~17-18 ft at the folded wingtip | same | [E] The fold hinge is near mid-span and the tip rises above the fin line. Not sourced. |
| Wing area | 500 ft² (46.5 m²) | same | [C] |
| Empty weight | **~32,081 lb** (14,552 kg). Aerospaceweb lists 30,600 lb | ~33,094 lb (15,011 kg) | [C] Range 30.6k-32.1k |
| Max takeoff (cat) weight | **66,000 lb** (29,937 kg) | ~66,000 lb (29,964 kg) | [C] |
| Max trap (landing) weight | **~44,000 lb** | ~44,000 lb (est. same) | [S] The War Zone: "can land at a gross weight of 44,000 lbs." Informal forum figures run 36k-44k depending on configuration. |
| Bring-back | "in excess of 9,000 lb" of fuel plus stores | — | [S] Wikipedia |
| Approach speed (on-speed AoA) | **~125-145 kt** depending on weight. **~135 kt** typical | similar, slightly higher | [S] 134 kt in one spec table. 125 kt at 34,943 lb in another. |
| Engines | 2 × GE F414-GE-400, 22,000 lbf each in afterburner | same | [C] |
| Crew | E: 1, F: 2 | 2 (pilot + EWO) | [C] |
| Main-gear track / wheelbase | ~10.5 ft track / ~18 ft wheelbase | same | [E] Legacy Hornet is 10 ft 2.5 in / 17 ft 9.5 in. The Super Hornet is slightly larger. |
| Deck taxi speed | **Brisk walk: ~3-5 mph typical.** ≤ 4 mph into the cat buffer | same | [S] launch NATOPS (see 02-launch-cycle.md). [E] for general deck taxi. |
| Turning | Nosewheel steering (low/high gain). Can pivot on one locked main wheel. Effective turn radius at the outer wingtip ~ one wingspan or less | same | [E] |

### Key physical features that matter on deck

- **Wing fold.** Each outer wing panel folds **upward** about a hinge roughly at mid-span. The panel ends up near vertical, tilted slightly inboard. This cuts the jet's footprint from ~45 ft to ~30.5 ft wide. The fold is hydraulic and runs on engine or APU hydraulic pressure, commanded by a cockpit wing-fold handle. **[C]** (general mechanism). Timing: a generic Navy wing-fold system text gives **5-7 s** to extend and **9-11 s** to retract. That text does not name the aircraft. Practitioner footage of Super Hornets suggests **~10-15 s** for a full fold or spread. **[E]** Use 12 s.
  - **When folded:** immediately after a trap, while the jet taxis out of the landing area ("hook up, fold wings" as it crosses the foul line). Also while parked, while towed, and on the elevators. **[C]**
  - **When spread:** while the director is taxiing the jet toward the catapult, typically just before or as it is lined up behind the jet blast deflector (JBD). Wings must be spread and locked before tension. Wikipedia: "Aircraft spread their wings as they taxi onto the catapult." **[C]**
  - Folded jets park nose-to-tail and wing-to-wing with only a couple of feet of clearance. **[S]/[E]**
- **Launch bar.** A T-shaped bar on the front of the nose gear strut. The pilot lowers it on the director's signal as the jet creeps into the catapult shuttle approach. It drops into the shuttle spreader. The **repeatable-release holdback (RRHB)** bar attaches behind the nose gear and pins the jet until the cat fires. Launch bar is up for all other taxiing. **[C]** (see 02-launch-cycle.md)
- **Tailhook.** A centerline hook under the tail between the engine nozzles. It is lowered by the pilot for landing and raised on the yellowshirt's "hook up" signal after the wire is disengaged. The **hook runner** (green shirt) checks it clears the wire. **[C]**
- **Tow points.** Tow bars clip to the **nose landing gear** tow fitting. Tie-down chains hook to tie-down rings on the main and nose landing gear and the fuselage. **[C]** (general NAVEDTRA 14014 description: "landing gear tow rings")

### Footprint for simulation (top-down rectangles/sprites)

| State | Length × width (ft) | At 1 px = 1 ft |
|---|---|---|
| Spread | 60.3 × 44.9 | 60 × 45 |
| Folded | 60.3 × 30.5 | 60 × 31 |

Jet exhaust plane is ~3 ft aft of the tail. Nose is ~8 ft ahead of the nose gear.

---

## 2. Tractors, tow bars and support vehicles (resolving designations)

| Designation | Common name | Role | Key data |
|---|---|---|---|
| **A/S32A-31A** | "Tow tractor", "mule" (successor to the 1960s-90s **MD-3**) | **The flight-deck aircraft tow tractor** on CVNs. Driven by blueshirts (yellowshirts are qualified too). Rear can carry a gas-turbine start unit or a firefighting module. | 3-cyl diesel, automatic, rear-wheel dual tires. **117 in L × 70 in W × 40 in H**, turning radius 132 in. **GVW 12,400 lb**, drawbar pull **8,500 lb**, 85 gal fuel. **[S]** brainscape (dims). **[C]** tpub (drivetrain), Hyperscale. |
| **Shipboard Tow Tractor (STT)** | — | NAVAIR program to replace the -31A for CVN/LHA/LHD flight decks. Primary role: "handling of aircraft aboard the flight deck." | **[S]** NAVAIR STT product page (title/summary only). |
| **A/S32A-32** | **Spotting dolly** | Hangar-bay and elevator tow vehicle. Lifting arms grab the nose or tail wheel and lift it off the deck. Turns the aircraft in its own length. Far more maneuverable than the tow tractor. | **[C]** tpub + Hyperscale |
| A/S32A-42 / -45 | Mid-range tow tractor | Shore-based / heavier. Not a CVN flight-deck tractor. | **[S]** |
| **A/S32A-35A** (CVCC) | **"Tilly"** crash crane | **Not a tractor.** Aircraft carrier crash and salvage crane. Lifts and removes a crashed or disabled jet from the landing area. Parked by the island and moved only for crashes. No aircraft may fly without it aboard. -36A is the amphib version. An Allied Systems replacement is in fielding. | **[C]** navy.mil, GlobalSecurity, Sea Power |
| Tow bar | "Tractor bar", universal tow bar | Rigid bar from the tractor pintle to the nose-gear tow fitting. Fitted and removed by blueshirts. | **[C]** |

So: **tow tractor = A/S32A-31A** (flight deck), **spotting dolly = A/S32A-32** (hangar), **Tilly = A/S32A-35A** (crash crane).

**Hook-up and tow timings** [E] (no sourced figures):
- Tractor drives up and the bar is pinned to the nose gear: **30-60 s**.
- Chocks/chains off and brake rider set: **30-60 s**. This runs in parallel when the crew is ready.
- Tow speed: **≤ 5 mph or the pace of the slowest walker** [S, two study decks + commercial manuals]. A short 100-200 ft reposition takes **~1-2 min**. A deck-length tow takes 3-5 min.
- Unhook, chock and chain at the new spot: **~1-2 min**.
- **Total typical tow move: 3-6 min per aircraft.**

---

## 3. The move crew and the chock-and-chain sequence

### Minimum crew for a towed move (flight or hangar deck)

Sources: a DVIDS move-brief article, a Naval Safety Command towing mishap advisory (SA 25-01), study decks, and Army FM 1-564 (shipboard ops).

| Role | Shirt | Duties |
|---|---|---|
| **Move director** (plane director) | Yellow | In charge. Walks ahead in the tractor driver's view. Gives the hand or wand signals. Does a walk-around before moving. |
| **Tractor driver** | Blue | Drives the A/S32A-31A on the director's signals only. "Controls the safe, slow movement." |
| **Brake rider** | Brown (plane captain) or a qualified squadron maintainer/pilot | Sits in the cockpit with the parking brake off. Applies brakes **only** on a tow-bar separation or an imminent collision. Must have battery/hydraulic brake pressure (accumulator). |
| **Wing walkers ×2** | Blue | One at each wingtip. Watch clearance and whistle or signal to stop. |
| **Tail walker ×1** | Blue | Watches the tail and stabilators swinging during turns. |
| **Chock walkers ×2** | Blue | Carry the chocks alongside the main wheels and chock instantly on a stop or emergency. |
| **Safety observer** | White (or senior yellow) | Confirms the aircraft is ready to tow. Overall safety. |

Total **6-10 people per moving jet** [S]. FM 1-564's minimum: "two safety observers, a qualified plane director, and two chock handlers or tie-down men" plus a brake rider [S]. "Use wing and tail walkers in all movements" [S, tpub]. **A respot with 8-12 simultaneous moves therefore puts roughly 60-100 handlers in motion at once [E].**

### Chocks and chains

- **Chocks:** one fore-and-aft wheel chock (NWC-type, adjustable bar with two blocks) on each main wheel. The nose wheel is also chocked when required. **[C]/[E]**
- **Tie-down chains:** TD-1A / TD-1B quick-release chains. They hook to a padeye (flush tie-down fitting set in the deck in a grid of roughly 4-5 ft spacing [E]) and to a tie-down ring on the jet.

| Tie-down category | Wind | Chains | Tag |
|---|---|---|---|
| **Initial** (just parked, engines turning, or before launch) | ≤ 45 kt | **6 minimum** | [S] two study decks. A forum adds "on the Hornet, 6 chains for startup and shutdown." |
| **Normal / intermediate** | ≤ 45 kt | **9** | [S] two study decks |
| **Moderate weather** | 46-60 kt | **14** | [S] |
| **Heavy weather** | > 60 kt | **20** | [S]. One forum gives 18. |

*(The brief's "3-4 minimum" is not supported. Use 6 as the minimum during flight ops.)*

### Sequence after a recovered jet reaches its parking spot

All [C] in outline (Navy flight-deck procedures, tpub, Naval Safety Command). Timings are [E].
1. A yellowshirt directs the jet into the final spot. Wings are already folded.
2. Director gives the **"chocks/chains in"** signal. **Blueshirts** dart under, chocks first, then initial chains (6). ~**20-40 s**.
3. Pilot sets the parking brake.
4. Director passes control to the **plane captain (brown)**. The PC gives the shutdown signal and monitors shutdown. The final director signal "releases" the pilot. Engines off ~**30-60 s** later.
5. PC installs intake/exhaust covers if required, pins, and the boarding ladder. Pilot climbs down.
6. **Purple shirts** hot- or cold-fuel, **red shirts** download or upload ordnance, and **green** troubleshooters work squadron maintenance. Chains go to 9 if the jet will sit.

### Sequence to "break down" a jet for launch (L-15 min)

1. The plane captain has completed the preflight. Engines are started at ~L-30 on PC signals, on initial tie-down (6 chains).
2. A yellowshirt takes control from the PC. He signals **"remove chocks and chains."** Blueshirts pull all chains and drape them over their shoulders (often 6 chains, ~10 lb each [E]), then pull the chocks. They hold up the chains so the director and pilot can see they are all clear. ~**20-40 s**.
3. The director signals the brake release and taxi. He passes the jet foot-to-foot to the next director.

### The plane captain's role at the jet

Brown shirt, squadron enlisted. Owns "his" jet. Does the daily/turnaround inspection, fluid checks, cockpit setup, start signals, shutdown monitoring and post-flight. He is the brake rider for tows (or another qualified person is). He stands by his jet's spot with tie-downs when it recovers. He does not direct taxi; directing is yellow's job only. **[C]**

---

## 4. The Handler and the Ouija board

- **Aircraft Handling Officer ("Handler", ACHO).** Typically a LCDR, often an LDO up from ABH enlisted. "Responsible to the Air Boss for planning and controlling all aircraft movement on the flight and hangar deck." He works in **Flight Deck Control (FDC)**, a windowed space at the base of the island at flight-deck level, starboard side. Assisted by the "mini-boss"/deck handler, a hangar deck officer (by phone), squadron maintenance reps, fuels and ordnance reps, and ~12-15 yellowshirts on deck reporting to him. **[C]**
- His main concern is avoiding a **"locked deck"**: aircraft placed so that no more can land or launch until a respot. **[C]**

### The Ouija board (physical)

| Attribute | Value | Tag |
|---|---|---|
| Scale | **1/16 inch = 1 foot (≈1:192)** | [C] eFlightLevel/Business Insider, StrategyPage, Smithsonian snippet |
| Size | Waist-high table, ~**6 ft long** (1,092 ft ship ÷ 192 ≈ 5.7 ft) | [C] |
| Construction | Two-tier table: **flight deck on top, hangar deck below**. Etched/painted deck outline on stainless steel or aluminum, under Plexiglas. Deck markings shown (cats, foul lines, elevators). | [C]/[S] |
| Aircraft | Flat metal/plastic **cutout templates** of each aircraft, to scale, **with wings folded or spread**, labeled with the side number ("modex", e.g. 200, 201...). Placed exactly as the real jets sit. If it fits on the board, it fits on the deck. | [C] |
| Status markers | **Thumbtacks, colored nuts, bolts, wing nuts and washers** placed on the templates. Conventions **vary by carrier**. | [C] |
| Who moves pieces | FDC sailors (often junior, green or yellow shirts) on phone/radio reports from the deck. | [C] |
| Electronic version | ADMACS electronic Ouija display (flat-screen) tested from 2015-16. Physical boards remain as backup on most carriers, Ford included ("if ship's power goes down, you don't lose a thing"). | [C] |

**Marker conventions documented in sources** (these vary carrier to carrier):

| Marker | Meaning | Tag |
|---|---|---|
| **Purple** hex nut | Needs fuel / is being fueled (purple = fuel, as with the shirt color) | [C] two sources |
| **Green** thumbtack | **First to go** (first launcher of the event) | [S] eFlightLevel |
| **Orange** thumbtack | Must be parked **with its tail over the deck edge** (stabilator or rudder maintenance) | [C] Smithsonian quote in two outlets |
| Colored tacks/nuts generally | Maintenance, fuel, flight status | [C] navy.mil (ONR), MIT |

**Plausible conventions for a simulation legend** [E]. These were not found in sources but fit the jersey color code. Label them "illustrative" in the UI.

| Marker | Meaning |
|---|---|
| Red tack | Ordnance loaded or hot |
| Wing nut | Aircraft "down" for maintenance |
| White washer | Needs QA/final inspection |
| Blue tack | Scheduled for the next event |
| Yellow | Needs a tow / to elevator |

Pieces are also tilted or flipped to show "down" jets.

### Planning workflow

1. The air plan arrives (from the Air Ops / CAG schedule): which side numbers fly in which event.
2. On the board, the Handler lays out the **launch sequence** (who goes to which cat, in what order). He leaves room for recovering jets and decides which jets go to or come up from the hangar via which elevator.
3. He talks the plan to the yellowshirts by radio and "bitch box". FDC updates the pieces as the deck reports moves.

---

## 5. Deck areas used for spotting

These match the naming in 06-cyclic-ops.md. Positions of the informal names come from practitioner usage and flight-simulator deck models (DCS). Confidence is moderate; confirm with the deck-geometry research.

| Area | Location (Nimitz) | Typical use |
|---|---|---|
| **Bow / "the point"** | Forward end, over and between **Cat 1 (starboard) and Cat 2 (port)** | Main recovery parking. Packed solid during recovery. Bow cats are unusable while jets are parked on them. |
| **The crotch** | Port side forward, where the angled-deck edge meets the bow, between Cat 2 and Cat 3 | Parking (a few jets). |
| **The street** | Starboard side, fore-aft lane forward of the island, outboard of Cat 1, by **Elevators 1 and 2** | Taxi lane and parking. |
| **Six-pack** | Just **forward of the island**, starboard, between Elevator 2 and the island | ~6 jets, nose-in or angled. The "ready" area for the next launch. |
| **Patio / junkyard** | **Aft of the island** on the starboard side, by **Elevator 3**. The "junkyard" is where Tilly, the crash/fire trucks and tractors park, next to the island. | Parking. Support equipment. |
| **Fantail** | Aft end, starboard of the landing area (right-hand rear corner) and across the stern when no recovery is pending | Parking. |
| **Corral** | Port side aft near **Elevator 4** (deck-edge, in the landing area) | 1-2 spots. Only usable when no recovery is pending. |
| **Waist** | The **Cat 3 / Cat 4** area on the port side amidships, inside the angled landing area | Launch area. Fouls the landing area. |
| **Landing area (LA) / "the angle"** | 9° angled deck, ~780 ft long, bounded by the **foul lines** | Must be **completely clear** for recovery. During a launch it can be used for parking and staging. |

### Elevators (Nimitz class)

- **4 deck-edge elevators**, **3,880 ft² each** [S/C]. They have historically been described as able to carry two aircraft; Elevators 2 and 3 were widened on later hulls (from Reagan on) [S, FAS].
- Capacity: commonly quoted around **130,000 lb** (two loaded jets plus a tractor). One secondary source gives 75,000 lb. Neither figure was confirmed; treat it as "two Super Hornets per lift" [E].
- **Locations:** El 1 and El 2 are starboard, forward of the island. El 3 is starboard, aft of the island. **El 4 is port side aft, inside the landing area**, so it can only be used when no recovery is pending [C/E].
- Run by blueshirts under a safety observer. **Hangar crews are V-3 division** [C]. The hangar holds **~1/3 to 1/2** of the air wing [E].
- Cycle time [E]: lift travel up or down (~30 ft) takes ~**15-20 s**. A full cycle including towing the jet on, securing, the stanchions/safety nets and towing it off takes **~3-5 min** per elevator trip.

---

## 6. Launch spot vs. recovery spot, and the respot

### Cyclic-ops order

Each ~1 h 30 min cycle runs: **launch Event N+1** (~12-15 min) → **recover Event N** immediately after (~12-20 min) → **respot** (~45-60 min) → repeat. See 06-cyclic-ops.md. [C]

### Launch spot (before the launch, ~L-45 min)

- The deck is at its most crowded. **The landing area may be used for staging** because nothing is due to land until after the launch.
- Event N+1 launchers (12-20 jets) are spread across the **fantail, LA/waist, six-pack, street and bow**. Tails point outboard, toward the deck edge, so exhaust blows over the side during engine start.
- Typically, aft-spotted jets go to the **waist cats (3/4)** and forward-spotted jets go to the **bow cats (1/2)**. Launchers in the LA leave first, which clears the angle. [C] Wikipedia: launching first "clears the deck so the crew has room."
- Non-flying jets for later events and tankers are packed into the remaining parking (six-pack, patio, bow corners) or sent below.
- **Hard rule:** by the end of the launch, the **landing area must be clear from ramp to bow**. The last waist-cat launch is the point at which the deck "goes clear" for recovery. [C]

### Recovery spot (during the recovery)

- **LA completely clear.** Cat 3/4 shuttles are stowed and the JBDs are flush.
- Recovered jets taxi out of the wires **forward and to starboard**, folding wings as they go, then park on the **bow (over Cats 1 and 2), the crotch, the street and the six-pack**. Nose-to-tail, wings folded, tails over the deck edge where possible. [C]
- The bow cats can sometimes still launch (e.g. a tanker or alert jet) **only if** the bow is not yet packed. Normally the bow cats are blocked once 6+ jets park forward. [C/E]
- Jets for the next event that are already spotted aft of the island (patio, junkyard, fantail starboard corner) **stay put** if they are clear of the foul line. [S]
- The final recovery leaves **~20-30 jets on the bow and starboard side forward** [E].

### The respot (between recovery and next launch)

The biggest "dance" of the cycle. Duration **~45-60 min** [S: navy.mil "re-spotted ... in 60 minutes and then launched in 15 minutes"]. A **minimum ~20-30 min** respot is feasible for a small event [E]. During the respot:
1. **Tow-tractor moves** (blue drivers, yellow directors, full move crews): recovered jets come off the bow and go aft, onto the angle, waist, fantail, patio and six-pack, to open the bow cats and give the next launchers clear taxi paths. **8-12 tow moves can run at once** [E]. **~12-15 yellowshirts** direct [C].
2. **Taxi moves**: some jets that will fly next are taxied under their own power to better spots (hot-pit fueling, then re-spot).
3. **Elevators**: "down" jets (maintenance) go to the hangar. Fresh jets for the next event come up. **2-6 elevator trips per respot** [E].
4. **Fuel (purple)**, **ordnance (red)** and **maintenance (green/brown)** work at every jet, which constrains move order. A jet can't move while hoses or weapons are attached.
5. **FOD walkdown** if time allows (always at the start of the flying day).
6. The deck reaches a **"ready deck"** for the next launch: all launchers manned, chained (initial), with clear taxi paths to their assigned cats.

**End-of-day respot:** after the last recovery, jets are respotted (largely towed) for the next morning's Event 1. This takes ~1-2 h at night [E]. Maintenance jets go to the hangar.

### Approximate deck load

- Modern CVW (2020s): **4 VFA squadrons × 10-12 jets** (≈ 40-44 F/A-18E/F; some air wings now replace one VFA with an F-35C squadron) + **1 VAQ × 5-7 EA-18G** + 4-5 E-2D + 2 CMV-22/C-2 + ~8 MH-60R + ~8 MH-60S. Typical deployment is **~64-70 aircraft**. [C] Wikipedia Nimitz page: 36-48 F/A-18E/F in 3-4 squadrons, 4-8 Growlers, ~64 aircraft typical.
- **Jets on the flight deck during cyclic ops: ~35-45** (the rest are in the hangar). MIT: "up to 60 aircraft are parked on a deck of 4.5 acres." [C/E]
- **Jet-only simulation:** use **~44 F/A-18E/F + 6 EA-18G** in the air wing, with **~36-42 on deck** and the rest below. **12-16 jets per event.**

---

## 7. Taxi routes and deck traffic rules

- **One director at a time.** Every move is controlled by exactly one yellowshirt. He "passes" the jet by pointing at the next director, who takes it with a signal. Handoffs occur every **~50-150 ft** along the route. If the pilot loses sight of his director, or gets signals from two directors, he **stops**. [C]
- **Six-pack → Cat 1 or 2:** pull out of the six-pack nose to port, taxi forward up the street/bow centerline, and line up facing forward behind the selected bow JBD. ~200-300 ft, ~1.5-3 min with spreads and handoffs [E].
- **Six-pack / patio → Cat 3:** taxi aft-port across the deck behind the island, then forward up the waist to line up behind the Cat 3 JBD. This crosses the LA, which is legal because no recovery is pending during a launch. ~400 ft, ~3-4 min [E].
- **Fantail → Cat 3/4:** straight forward up the angle. These jets are often the first launchers so that the LA clears.
- **Bow → Cat 1/2:** jets parked on the bow are usually towed, or broken down and taxied in a careful order (outermost first), because the bow is packed. In a launch, the bow jets go last to the bow cats, or are pre-staged behind the JBDs.
- **Jet blast discipline:** taxi turns and run-ups are planned so exhaust does not blast parked aircraft, people or the open elevator. Jets stage **behind a raised JBD**, never directly aft of a firing jet in the open. [C]
- **Cat track crossing:** a jet or tractor **does not cross an active catapult's shuttle track** or stand forward of a jet in tension. Movement in front of a tensioned cat is frozen. [C]
- **Foul lines:** nothing (aircraft, tractor, people other than authorized crash/arresting crew) may be inside the LA foul lines once the deck is called clear for recovery. **A foul deck causes a wave-off.** [C]
- **Recovery taxi-out:** after the trap the jet rolls back a few feet, raises its hook, and is taxied **forward and right across the foul line within ~20-30 s**. Wings fold on the move. The landing interval is ~45-60 s. [C] (see 03-recovery-cycle.md)

---

## 8. Hazards: jet blast, intake, FOD

### Jet-blast and intake danger distances (F/A-18)

**[S]** Two Navy EAWS (Enlisted Aviation Warfare Specialist) study decks, consistent with each other. **No primary source was confirmed.**

| Power | Intake danger radius | Exhaust danger distance aft |
|---|---|---|
| Idle | **9 ft** | **115-155 ft** (temperature / velocity) |
| Military (MIL) | **25 ft** | **325-725 ft** |
| Max afterburner | 25 ft | **850-925 ft** |

Practical deck effect: idle jets taxiing past people require them to crouch, brace or stay ≥ ~10 ft from intakes. That is why jets park tail-outboard and why the JBDs exist. A Bataan handler was blown ~25 ft off his feet when a jet went to power. [S] DVIDS

### FOD walkdown

- An **all-hands** event: hundreds of sailors (every shirt color, plus squadron personnel) line up **shoulder-to-shoulder across the deck**. They walk the full length slowly, usually **bow to stern** (or stern to bow, depending on wind), picking up debris and pocketing it. [C]
- Held **before the start of flight ops each day**, often again before the night cycle, and as needed. The hangar bay is walked twice daily. [C]
- Duration: ~**15-30 min** [E]. No sourced figure; the Stennis time-lapse shows a morning and an evening FOD walk.

---

## 9. Summary timing table (for simulation)

| Action | Duration | Tag |
|---|---|---|
| Wing spread or fold | ~12 s (range 5-15 s) | [E]/[S] |
| Chocks + chains off (6 chains) | 20-40 s | [E] |
| Chocks + chains on (initial 6) | 20-40 s | [E] |
| Engine shutdown after chained | 30-60 s | [E] |
| Tractor + tow bar hookup | 30-60 s | [E] |
| Tow speed | ≤ 5 mph (≤ 7 ft/s); typical 2-4 mph | [S] |
| Taxi speed (general) | 3-5 mph; ≤ 4 mph onto cat | [S]/[E] |
| Single tow reposition (end to end) | 3-6 min | [E] |
| Elevator one-way travel | 15-20 s; full trip 3-5 min | [E] |
| Trap → clear of foul line | 20-30 s | [C] |
| Recovery interval | 45-60 s | [C] |
| Launch event (12-20 jets) | ~12-15 min | [C] |
| Respot | ~45-60 min (min ~20-30) | [S]/[E] |
| Cycle | ~1 h 30 min (1 h-1 h 45) | [C] |
| Engine start before launch | ~L-30 min; man-up L-45; taxi L-15 | [C] |
| FOD walkdown | ~15-30 min | [E] |

---

## Simulation implications

What a simulation should model from this topic:

1. **Aircraft entity** with type (FA18E, FA18F, EA18G), side number/modex, squadron, and state machine:
   `PARKED_CHAINED → ENGINES_ON → CHAINS_OFF → TAXIING → AT_JBD → ON_CAT → LAUNCHED` and `IN_PATTERN → TRAP → HOOK_UP → TAXI_CLEAR → PARKED → CHAINED → SHUTDOWN`, plus `UNDER_TOW` and `ON_ELEVATOR` / `IN_HANGAR`.
2. **Two footprints:** spread 60 × 45 ft, folded 60 × 30.5 ft. Animate the fold over ~12 s as the outer ~7 ft of each wing panel rotates up. Folded is the default whenever not on or about to be on a cat.
3. **Launch bar and hook** as visible flags: launch bar down only within ~50 ft of the shuttle; hook down only in the pattern and trap.
4. **Taxi physics:** max ~5 mph (7.3 ft/s) on deck, ≤ 4 mph into the cat. Gentle acceleration. Turns pivot near the main gear. Paths follow pre-defined lanes and waypoints rather than free steering.
5. **Director-handoff chain:** each moving jet is "owned" by one yellowshirt agent. The director walks ahead on the jet's nose-side quarter and hands off to the next director every ~100 ft. Show a thin line from director to jet. If no director is available, the jet holds.
6. **Tow moves:** an A/S32A-31A tractor agent (blue driver) plus a move crew of 6-8: yellow director, brown brake rider (sits in the jet), 2 blue wing walkers, 1 tail walker, 2 chock walkers, white safety observer. They move as a formation at ≤ 5 mph. Hook-up 30-60 s, unhook 30-60 s. Tractor sprite ~10 × 6 ft.
7. **Chock and chain micro-sequence** at every park and break-down: 2-3 blueshirts dart under the jet, 20-40 s, then the plane captain takes over for shutdown. Initial = 6 chains; sitting = 9. Optionally show small chain marks at the wheels.
8. **Deck zones** as polygons: bow (Cat 1/2), crotch, street, six-pack, patio/junkyard, fantail, corral, waist (Cat 3/4), landing area with foul lines, Elevators 1-4. Each zone has a parking-slot list (spot positions plus heading). Hard constraints: **LA must be empty during recovery**. No crossing an active cat track. El 4 is usable only when no recovery is pending.
9. **Spot configurations as data:** a `launchSpot` (jets across fantail, LA, six-pack, street, bow; tails outboard) and a `recoverySpot` (LA clear; recovered jets fill bow → crotch → street → six-pack in order). The **respot** is the scripted set of tow, taxi and elevator moves that turns one into the other.
10. **Respot choreography:** 8-12 simultaneous tow moves, staggered, over a compressible ~45-60 min (time-accelerated). Include 2-6 elevator trips (two jets per lift, ~3-5 min per trip). Fuel, ordnance and maintenance "service" timers block a jet from moving.
11. **Ouija board view** (signature feature): a toggleable second view showing a top-down 1/16"-scale table rendering. It has a flight-deck tier and a hangar-deck tier, aircraft cutouts labeled with modex, and status markers: purple nut = fuel, green tack = first to go, orange tack = tail over deck edge, plus illustrative red (ordnance) and wing nut (down). The board mirrors the live sim. Optionally add a short "lag" to show FDC updating from radio reports.
12. **Jet-blast cones** (toggleable overlay): idle ~115-155 ft, MIL up to 725 ft (or cut off at JBDs). Intake circles of 9 ft at idle and 25 ft at power. Crew agents avoid the cones and crouch when inside the idle zone.
13. **Deck load:** air wing of ~44 F/A-18E/F + ~6 EA-18G across 4 VFA + 1 VAQ, with squadron colors and modex blocks (e.g., 100s, 200s, 300s, 400s for VFA, 500s for VAQ). ~36-42 on deck and the rest in the hangar. 12-16 jets per event.
14. **FOD walkdown** event at the start of the day: a line of ~150-300 small crew dots spanning the deck width, sweeping bow to stern over ~15-30 min (time-accelerated).
15. **Status HUD for the Handler:** counts of jets by zone, "LA CLEAR / FOUL", "LOCKED DECK" warning if no free parking remains for the remaining recoveries, and a launch-sequence list.

---

## Sources

- Wikipedia, Modern United States Navy carrier air operations: https://en.wikipedia.org/wiki/Modern_United_States_Navy_carrier_air_operations
- Wikipedia, Boeing F/A-18E/F Super Hornet: https://en.wikipedia.org/wiki/Boeing_F/A-18E/F_Super_Hornet
- Wikipedia, Boeing EA-18G Growler: https://en.wikipedia.org/wiki/Boeing_EA-18G_Growler
- Wikipedia, Nimitz-class aircraft carrier: https://en.wikipedia.org/wiki/Nimitz-class_aircraft_carrier
- Navy fact file, EA-18G Growler (403 to fetch; specs via secondary sources): https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2166036/ea-18g-growler-airborne-electronic-attack-aircraft/
- Aerospaceweb, F/A-18E/F: https://aerospaceweb.org/aircraft/fighter/f18ef/
- Aeropedia (folded width 9.32 m): https://aeropedia.com.au/?p=11460
- Aviation Week, EA-18G specs: https://aviationweek.com/ea-18g-growler-specs
- The War Zone, Super Hornet 44,000 lb landing weight: https://www.twz.com/11355/this-syria-bound-super-hornet-is-carrying-a-uniquely-massive-bomb-load
- Smithsonian Air & Space, "How Things Work: The Ouija Board": https://www.smithsonianmag.com/air-space-magazine/how-things-work-the-ouija-board-10048217/
- eFlightLevel (citing Business Insider), Ouija board details: https://eflightlevel.blogspot.com/2012/10/see-why-every-us-aircraft-carrier-needs.html
- StrategyPage, "Why Aircraft Carriers Need Ouija Board" (1:192, ADMACS): https://www.strategypage.com/htmw/htnavai/articles/20231212.aspx
- We Are The Mighty, carrier Ouija board: https://www.wearethemighty.com/articles/the-crazy-way-an-aircraft-carrier-tracks-all-of-its-aircraft-on-ship/
- navy.mil / ONR, "Old School Meets New School: Flight Deck Ouija Boards Go Digital": https://www.navy.mil/Press-Office/News-Stories/Article/2254134/old-school-meets-new-school-flight-deck-ouija-boards-go-digital/
- MIT News, "Clearing the decks" (DCAP, 60 aircraft on 4.5 acres): https://news.mit.edu/2011/automated-flight-decks-0802
- MIT DSpace, J. Ryan 2014 thesis (MASCS deck simulation; not retrieved, rate-limited): https://dspace.mit.edu/handle/1721.1/97255
- NAVAIR, Shipboard Tow Tractor (STT): https://www.navair.navy.mil/product/Shipboard-Tow-Tractor-STT
- NAVEDTRA 14014 ABH manual pages on tpub (tractors, spotting dolly, tie-downs): https://navyaviation.tpub.com/14014/css/14014_216.htm , https://navyaviation.tpub.com/14014/css/14014_267.htm , https://navyaviation.tpub.com/14014/css/14014_218.htm
- Hyperscale, MD-3/A/S32A-31A and spotting dolly kit reviews: https://mail.hyperscale.com/2010/reviews/kits/sw48005reviewrk_1.htm
- Brainscape, A/S32A-31A tow tractor flashcards: https://www.brainscape.com/flashcards/2384213/packs/4223164
- Brainscape, Aircraft Handling Fundamentals (tie-down categories, move crew, 5 mph): https://www.brainscape.com/flashcards/1946984/packs/3547114 and https://www.brainscape.com/flashcards/2486333/packs/4394884
- DVIDS, "Create an effective aircraft movement brief": https://www.dvidshub.net/news/412908/blog-create-effective-aircraft-movement-brief
- Naval Safety Command, SA 25-01 Aircraft Towing and Towing Gear Mishaps: https://navalsafetycommand.navy.mil/Portals/100/Documents/SA%2025-01%20Aircraft%20Towing%20and%20Towing%20Gear%20Mishaps.pdf
- Army FM 1-564 Ch. 6, Shipboard operations (minimum move crew): https://www.globalsecurity.org/military/library/policy/army/fm/1-564/CH6.HTM
- Navy flight deck procedures (P-1211, director handoffs, chocks/chains, shutdown): https://navyflightmanuals.tpub.com/P-1211/Flight-Deck-Procedures-50.htm
- FAS, CVN-68 Nimitz (elevators, deck): https://man.fas.org/dod-101/sys/ship/cvn-68.htm
- Herald Net, USS Nimitz stats (elevators 3,880 ft²): https://www.heraldnet.com/news/the-uss-nimitzs-stats/
- navy.mil, Crash salvage crane (Tilly) returns to Lincoln: https://www.navy.mil/Press-Office/News-Stories/display-news/Article/2254822/crash-salvage-crane-returns-to-lincoln/
- GlobalSecurity, USS Carl Vinson takes custody of Tilly: https://www.globalsecurity.org/military/library/news/2007/11/mil-071106-nns05.htm
- Cueflash EAWS VFA study guide (F/A-18 intake/exhaust distances): https://cueflash.com/decks/tag/eaws/tag/list/121377/eaws_vfa_specific
- DVIDS, Ike FOD walkdown program: https://www.dvidshub.net/news/printable/331511
- SlashGear, why crews do FOD walks: https://www.slashgear.com/1952398/why-aircraft-carrier-crew-members-do-fod-walks-before-flight-operations
- DVIDS, "A Handle on Life" (handler blown off feet): https://www.dvidshub.net/news/printable/334934
- Jalopnik, flight deck jersey colors: https://jalopnik.com/here-is-what-all-those-colored-shirts-on-an-aircraft-ca-1757896999
- DCS forum (informal deck spot naming: elevators, patio, six-pack): https://forum.dcs.world/topic/366738-query-regarding-spawn-points-orders-and-statics-parking
