# 02 - The Catapult Launch Cycle (Nimitz-class, F/A-18E/F and EA-18G)

Scope: everything from a jet taxiing toward a catapult to the shot itself and the reset for the next aircraft. Covers who does what, where they stand, the signals they use, the lights and buttons involved, and realistic timings.

Confidence key: **[M]** = taken from a Navy manual (CVN Flight/Hangar Deck NATOPS NAVAIR 00-80T-120 (2010) or the ABE training manual NAVEDTRA 14310 Ch. 4/5); **[S]** = secondary source (navy.mil/DVIDS, PBS, Wikipedia, pilot accounts); **[E]** = engineering estimate for the simulation, not found stated in a source.

---

## 1. The hardware

### 1.1 Catapults on a Nimitz-class carrier
| Cat | Location | Notes |
|---|---|---|
| 1 | Bow, starboard | Bow pair. Usable during recovery. |
| 2 | Bow, port | Bow pair. Its deckedge station sits near the landing area, but NATOPS lets cat 2 operate during recovery ("simultaneous recovery and Catapult No. 2 operations") **[M]** |
| 3 | Waist, inboard (port side of angled deck) | Lies in the landing area. Not usable while recovering. |
| 4 | Waist, outboard (port deck edge) | Lies in the landing area. Not usable while recovering. Aircraft on cat 4 often block the cat 3 JBD operator's view, so cat 3 always needs a JBD safety observer **[M]** |

- Steam catapult type: C-13 Mod 1 (CVN-68 to CVN-71) and C-13 Mod 2 (CVN-72 onward) **[M][S]**.
  - Power stroke: C-13-1 = 309 ft 8.75 in; C-13-2 = 306 ft 9 in. Track length 324 ft 10 in for both **[M]**.
  - Shuttle plus pistons weigh 6,350 lb. Cylinder bore is 18 in (Mod 1) or 21 in (Mod 2) **[M]**.
  - Rated capacity (Mod 1): 80,000 lb at 140 kt **[S, Wikipedia]**.
- Bow pair and waist pair are each normally **interlocked**: "the first catapult to reach STANDBY/MIL PWR shall be fired or suspended before the other catapult can attain STANDBY/MIL PWR." **[M]** So cats 1 and 2 alternate, and cats 3 and 4 alternate. A bow cat and a waist cat can be ready at the same moment.
- Steam per shot is about 1,200 lb **[S]**.

### 1.2 Parts the simulation should show
- **Shuttle**: the only part of the catapult above the deck. It is a small "spreader" (the nose gear launch shuttle spreader) that rides in the track slot. The F/A-18's launch bar drops into its throat **[M]**.
- **Grab**: below deck. The retraction engine drives it to pull the shuttle aft to the "battery" position, then pushes it forward a little to take tension **[M]**.
- **Battery position**: the aft end of the stroke, where the aircraft is hooked up. A red flashing deck suspend light sits at the deck edge near battery for each cat **[M]**.
- **Approach tracks / lead-in "wye"**: a Y-shaped guide groove aft of the shuttle. The director stops the jet here. The holdback bar is fitted and the launch bar is lowered here, and not earlier, because dragging the bars over non-skid damages them **[M]**.
- **Buffer / buffer hook (holdback fitting)**: a deck fitting aft of the shuttle. The RRHB clips into it **[M]**.
- **Water brakes**: at the forward end of the stroke. Piston "spears" ram into water-filled cylinders and stop the 6,350 lb shuttle and pistons in a few feet **[M]**. On deck you see the shuttle slam to a halt at the bow.
- **Jet Blast Deflector (JBD)**: hinged panels set flush in the deck aft of each cat. They are hydraulically raised to roughly 45-50 degrees, and seawater runs through them for cooling **[M][S]**. Mk 7 Mod 0/2 has 6 panels worked in pairs. Mk 7 Mod 1 has 4 panels **[M]**. A JBD is raised only once the jet's tail has cleared the panels' swing arc **[M]**.
- **Bridle catcher ramps (historical)**: the angled "horns" at the bow end of older cats that caught wire bridles. US aircraft stopped using bridles after the Cold War. CVN-71 onward were built without the ramps, and CVN-68/69/70 had theirs removed in late-1990s/2000s refits **[S]**. **A Nimitz deck shown today should have no bridle ramps.**

### 1.3 Launch bar (nose-tow) vs. bridle
- **Bridle (1950s to 1980s)**: a wire-rope bridle hooked between the shuttle and hooks on the aircraft's fuselage (F-4, A-6, A-7 and others). The bridle flew off the bow with each shot and the bridle-catcher ramp caught it. A separate holdback cable held the tail, and a frangible "tension bar" link broke at release, so each shot used up one link.
- **Launch bar / nose gear launch (NGL, since the 1960s-70s and universal today)**: a bar hinged on the front of the nose gear strut. The pilot lowers it from the cockpit (the F/A-18 has a LAUNCH BAR switch). It drops into the shuttle spreader. After the stroke the bar separates from the shuttle and return springs pull it up **[S, NATOPS quote via forum]**. Hookup is faster and safer, and there is nothing to recover afterward.
- **Holdback**: a bar from the back of the nose gear to the buffer hook in the deck. Older holdbacks used a frangible tension bar that broke on every shot. The Super Hornet and Growler use the **Repeatable Release Holdback Bar (RRHB)**, a spring and collet mechanism that lets go at a set combined force (engine thrust plus catapult) and is reset and reused **[M][S]**. Reset is checked visually: the strain release rod groove fully visible, the spring retainer groove partly covered, and the "candy stripe" painted area completely covered **[M]**. Each shot counts one cycle against the bar's service life, and a 100-shot inspection applies **[M]**.
- On an F/A-18 the pilot puts the launch bar switch back to UP (retract) after tension and turnup. The bar stays held in the shuttle until the shot, and there is no external indication that the switch has been moved **[M]**.

---

## 2. People at and around the catapult

| Role | Jersey | Where they stand | Night wand(s) **[M]** | Job |
|---|---|---|---|---|
| **Catapult Officer / "Shooter"** (Launching Officer) | Yellow (commissioned officer) | Deckedge mode: on deck beside the cat, forward-abeam the jet's nose and in the pilot's view. At the bow this is the centerdeck area between cats 1 and 2. ICCS mode: inside the ICCS "bubble" | 1 red + 1 green standard | Owns the shot: sets the capacity selector valve (CSV, the steam setting), takes control of the jet, gives final turnup, takes the salute, gives the fire signal (deckedge mode) or presses FIRE (ICCS mode) |
| **Catapult Safety Observer (CSO)** | Yellow | On deck when the Cat Officer is in the ICCS. He or she is the visible "shooter" the pilot salutes | 1 red + 1 green standard | Catapult Officer's eyes on deck. Takes the salute, crouches, kneels and gives thumbs-up to the bubble |
| **Aircraft Director** | Yellow | Ahead of and to one side of the jet, in the pilot's view | 2 amber standard | Taxis the jet onto the cat, gives the lower-launch-bar signal, gives HOLD BRAKES / RELEASE BRAKES and TAKE TENSION, then passes control to the shooter |
| **Topside Safety Petty Officer (TSPO)** (sometimes called "hookup petty officer") | Green (ABE) | Under and beside the nose gear during hookup, then just clear of the jet | 1 white stubby | Checks the RRHB, supervises holdback install, signals tension, inspects the launch bar's seat in the spreader after tension. **Last man out from under the jet**. Holds thumbs-up until the jet launches **[M]** |
| **Holdback operator ("holdback man")** | Green | Kneeling at the nose gear | - | Fits the RRHB between the nose gear and the buffer hook **[M]** |
| **Hookup crew** | Green | Around the nose gear | - | Help line up the launch bar and shuttle |
| **Weight Board Operator** | Green | Next to the director, in the pilot's field of view **[M]** | 1 white stubby | Shows the gross weight board to the pilot, then to the shooter and the centerdeck/deckedge operators |
| **Deckedge Operator (DEO)** | Green | Deck-edge control station in the catwalk beside the cat (cat 1 starboard edge; cat 2 port edge forward; cats 3/4 port edge at the waist) | 1 red standard | Presses BRIDLE TENSION, STANDBY/MIL PWR, FINAL READY and **FIRE** (deckedge mode). Signals the catapult state with his hands. Retracts the shuttle |
| **Centerdeck Operator** | Green | Centerdeck station between the paired cats | 1 white stubby | Watches the anemometer (wind over deck) and holds a thumbs-up if the wind is within limits |
| **JBD Operator / JBD Safety Observer** | Green | Beside the JBD. The safety observer stands on the side of the JBD farthest from the operator **[M]** | 1 white stubby | Raises and lowers the JBD once the arc is clear |
| **ICCS Monitor / CCP Operator** | Green / below deck | Monitor sits in the ICCS with the Cat Officer. The Central Charging Panel (CCP) operator is below deck | - | Verify the CSV setting, steam pressure and readiness lights; retract the shuttle in ICCS mode; can SUSPEND |
| **Squadron Plane Checkers / Final Checkers** (squadron QA "troubleshooters") | White jersey, often with a checkerboard pattern on helmet/jersey | Abeam the jet, clear of the wing sweep, where they can see the nozzles and control surfaces | 1 blue stubby | Final walk-around for panels, leaks, flaps/trim, pins. Watch the nozzles and afterburner light. Thumbs-up to the shooter, or SUSPEND if an afterburner fails to light **[M]** |
| **Ordnance Safety** | Red | In the arming area short of the shuttle | 2 red banded | Arms weapons before the launch bar goes over the shuttle **[M]** |
| **Bow / Angle Safety Observer** | - | Watching the landing area and shot line | 1 red + 1 green | GO light or thumbs-up that the deck forward is clear, plus waist GO/NO-GO checks **[M]** |
| **Pilot** | - | Cockpit | Exterior / navigation lights | Confirms weight, runs up power, wipes out the controls, salutes |

Air Boss (Air Officer, Pri-Fly): sets the **rotating beacon** green to clear launching (red/amber = no launch), watches wind, and can SUSPEND **[M]**.

Crew size: a carrier has about 11 qualified shooters (USS George Washington, 2014). Qualification takes 3-6 months of on-the-job training **[S, DVIDS]**.

---

## 3. Step-by-step: a Super Hornet on cat 1 (daytime, deckedge mode)

Times are offsets from the jet stopping in the wye. The step logic comes from NATOPS **[M]**. Durations are **[E]**, calibrated so the whole cycle matches the published per-cat rate of about 1 min 45 s **[S, PBS]**.

### Phase A - approach and spot (about T-30 s to T+0)
1. **Taxi to the cat**: a yellow-shirt director taxis the jet aft of the JBD with wings spread. NATOPS says pilots should avoid excess power **[M]**. The director signals the pilot to **lower flaps** as the jet approaches the cat (on the Super Hornet this is takeoff flaps / half or full per NATOPS) **[M]**.
2. **Weight board**: as the jet approaches, the weight board operator holds up the board showing the computed gross weight (for example "44.5" for 44,500 lb). The pilot gives a **thumbs-up** to confirm (at night, a circular flashlight motion). "Thumbs-down" is never used **[M]**.
   - To raise the weight: palm up, moving vertically. To lower it: palm down, moving horizontally. The board steps by 500/1,000 lb, or **100 lb for F/A-18E/F/G** using "rapid" signal movements **[M]**.
   - If more than 2 correction steps are needed, the jet does not launch until the Air Boss, pilot and Cat Officer agree **[M]**.
   - The board operator then shows the confirmed weight to the Cat Officer, Centerdeck and Deckedge Operators. They relay it to the console/CCP operator, who cross-checks the Cat Officer's **CSV (capacity selector valve) setting** against the launch bulletin charts (weight, configuration, temperature, wind over deck) **[M][S]**. The weight on the board is not changed again until the jet is off the cat **[M]**.
3. **JBD up**: once the jet's tail clears the JBD arc, the JBD operator raises it behind the jet. The next jet waits behind it with its nose pointed at the raised JBD **[M]**.
4. **Arming (if loaded)**: the jet stops short of the shuttle. Red shirts arm the weapons while the pilot shows both hands **[M][S]**.
5. **Stop at the wye**: the director stops the jet in the lead-in wye and signals **disengage nosewheel steering** (forefinger to the nose, then an arm sweep in the direction of movement) **[M]**.

### Phase B - hookup (about T+0 to T+25 s)
6. **Holdback install**: the holdback operator checks the RRHB reset marks and fits the bar between the nose gear and the buffer hook. The TSPO supervises **[M]**. [E: about 8-15 s]
7. **Lower launch bar**: on the TSPO's direction, the director gives the **LOWER LAUNCH BAR** signal (one arm extended forward / specific hand signal). The pilot flips the launch bar switch and the bar drops **[M][S]**.
8. **Taxi over the shuttle**: the TSPO re-checks the RRHB reset and gives a thumbs-up to the shooter. The director then has the pilot creep forward, **≤ 4 mph**, through the approach tracks. The launch bar drops into the shuttle spreader and the holdback seats in the buffer **[M]**. Moving onto the cat takes a lot of power to push against the holdback **[S, pilot]**. [E: about 5-8 s]
   - Rule: the jet must not reach a point where the launch bar can engage the spreader until it is **ready for flight in every respect**: weight confirmed, wings spread and locked, flaps set, ordnance armed, **green beacon**, CSV set, and the catapult in **FIRST READY / CAT READY** **[M]**.

### Phase C - tension (about T+25 to T+40 s)
9. **Two-minute warning** (at the start of a launch series): the Cat Officer points to his wrist and holds up two fingers ("TWO MINUTES"). The phone circuit goes quiet from then on **[M]**.
10. **First Ready / Cat Ready**: the console operator selects FIRST READY. The Deckedge Operator raises **one hand overhead with forefinger extended** so everyone topside can see **[M]**.
11. **TSPO pre-tension checks**: jet configured, cat in First Ready, JBD up, **only the TSPO under the jet**, deck clear forward, bow/angle lights green. The TSPO then gives **TAKE TENSION** to the director: one arm swept and forefinger pointed in the launch direction, held until tension is taken (white stubby wand at night) **[M]**.
12. **Director**: signals **HOLD BRAKES**, checks forward and aft of the shot line, confirms the JBD is up and everyone (himself included) is laterally clear. He then signals the pilot **RELEASE BRAKES** with one hand and the DEO **TAKE TENSION** with the other **[M][S]**.
13. **DEO presses BRIDLE TENSION** and says **"TAKING TENSION"** on the sound-powered phones. These are **the last words spoken until the jet has launched**, so that "misfire", "hangfire" and "fire" can never be confused **[M]**. The grab pushes the shuttle forward a few inches and the jet squats onto the nose gear against the holdback. (Tensioner creep rate: about 6 ft in 30-50 s **[M]**, but the actual travel to take up slack is only inches.) [E: tension taken in about 2-4 s]
14. **TSPO post-tension inspection**: checks that the launch bar sits correctly in the spreader (the F/A-18 launch bar has a paint scheme for this check, and a jet with missing or wrong paint must not launch) and that the RRHB release element is seated. The TSPO then **exits from under the jet** and gives a **thumbs-up**, held until the launch **[M]**. [E: about 5-8 s]
15. **Director passes control** by pointing both hands at the shooter, which hands the jet over **[M]**. "The Director shall not pass control of the aircraft until all personnel are clear." **[M]**

### Phase D - run-up and final checks (about T+40 to T+60 s)
16. **Shooter's pre-control checklist** (a quick scan): green beacon, wind and crosswind, CSV, centerline offset and alignment, nosewheel cock, deck pitch, JBD up, everyone clear, wing/tail locks, flaps/slats/trim, canopy, pins pulled, panels closed, TSPO thumbs-up **[M]**.
17. **FINAL TURNUP signal**: the shooter raises a hand with **two fingers** up and **rotates it rapidly overhead** (the "run-up" signal) **[M][S]**.
18. **Pilot to MIL (military/full dry) power**, feet off the brakes **[M]**. Both F414 engines spool up. The pilot sets the launch bar switch to retract and checks engine instruments **[M][S]**.
19. **DEO presses STANDBY / MIL PWR**. When its light comes on he **holds two fingers overhead** **[M]**.
20. **Afterburner, if required**: if the launch is to be made at combat rated thrust (CRT, max afterburner), which is common for heavy Super Hornets and requested on the weight chit, the shooter gives the CRT/afterburner signal (an open hand pushed up, "raise the roof"). The pilot lights the afterburners **[M][S]**. Plane checkers watch for both afterburners lighting and normal nozzle movement **[M]**.
21. **Wipeout (control check)**: the pilot sweeps the stick fully through all four corners and pushes each rudder pedal. The shooter and checkers watch the stabilators, ailerons, flaps and rudders move **[S]**. NATOPS: "Normally a **4-second delay** follows completion of control wipeout before the pilot gives his final salute." **[M]** [E: wipeout about 4-6 s]
22. **Pilot's ready signal**: pilot checks gauges, puts **head back against the headrest**, turns head slightly toward the shooter, and **salutes** (either hand) **[M]**. The Super Hornet launch is "hands-off": after saluting, the pilot holds the canopy-frame handgrip (the "towel rack") or keeps a hand near the stick and lets the flight controls rotate the jet **[S, pilot account; technique varies]**. After turnup the pilot must make **no movement that could look like a salute** (not even adjusting the visor) until ready **[M]**.
   - Pilot abort: shake head side to side and radio **"SUSPEND, SUSPEND, CATAPULT ONE"**. Never thumbs-down **[M]**.
23. **DEO presses FINAL READY** after the shooter salutes the pilot (ICCS deckedge mode). The DEO then raises **both arms overhead, hands open**, which also keeps his hands off the FIRE button. He may lower them only to press FIRE or SUSPEND **[M]**.

### Phase E - the shot (about T+60 to T+65 s)
24. **Shooter returns the salute and does a final scan** (about 3-5 s **[E]**): green beacon, aircraft configuration, flight controls in position, jet **sounds normal at full power**, cat still in Final Ready, **Centerdeck thumbs-up** (wind OK), **plane checkers thumbs-up**, **TSPO thumbs-up**, deck pitch, airborne traffic clear (no wave-off or bolter crossing the shot line), and **bow/angle safety GO** **[M]**.
   - **Deck pitch timing**: the shot is timed so the deck is level, pitching up, or at the top of its pitch cycle when the stroke ends **[M]**. This can hold the shot for a few seconds in a seaway.
25. **FIRE signal**: the shooter **sweeps the raised hand down in the direction of launch, touches the deck, and brings the hand back up level, pointing down the catapult** (a lunge or kneel with arm forward) **[M]**. Everyone near the jet is crouched and laterally clear, outside where the wing will pass **[M]**.
26. **DEO fires**: after seeing the touch and point, the DEO checks the deck, aircraft and catwalks forward and aft, and the bow/angle safety signal. He then **lowers his hand and presses FIRE** **[M]**. He must never anticipate the signal **[M]**. [E: about 1-2 s after the touch]
   - In **ICCS ("bubble") mode** the Cat Officer in the bubble presses FIRE himself, after the CSO on deck has taken the salute, crouched, and **dropped to one knee with a thumbs-up** **[M]**.
27. **The stroke**: the launch valve opens and steam drives the pistons. The RRHB lets go at its set force. The jet goes from **0 to about 150 kt in about 2 s** over about 300 ft **[S, Wikipedia; migflug]**. The pilot feels about **3-4 g for 2-3 s** **[S]**. Commonly quoted figures run from "0-165 mph (~143 kt) in about 2 s" to "about 150 kt (170 mph)". The real end speed depends on gross weight and wind over deck: the CSV is set so the jet leaves at or above its minimum end airspeed, with the ship's 20-30 kt of wind over the deck added on top **[S]**. [E: end ground speed for a typical Super Hornet about 130-150 kt; airspeed at the bow about 150-170 KIAS]
28. **Shuttle hits the water brakes** at the bow and stops violently. The launch bar comes out of the spreader and springs up. The jet climbs away, normally with a clearing turn in day Case I/II (about 10 degrees) **[S]**.
29. **Catwalk personnel duck** below deck level, hugging the inboard bulkhead **[M]**.

### Phase F - reset for the next jet (about T+65 to T+100 s)
30. **Launch complete**: the console/CCP operator readies the next launch **[M]**.
31. **Retract**: once the track is clear, the DEO (deckedge mode) or the ICCS Monitor (ICCS mode) **retracts the shuttle**. The grab runs forward, latches the shuttle, and pulls it back to battery **[M]**. [E: about 10-20 s to retract]
32. **JBD lowered** after the jet has gone. In practice the panels need a short cool-down before the next jet's tires roll over them. NATOPS sets a **30 s** JBD cool-down for repeated MRT run-ups during maintenance engine checks on the cat, and the launch bulletins set cool-down periods for successive launches **[M]**. [E: lower, then about 10-20 s before the next jet crosses]
33. The next jet, already waiting behind the JBD with its weight confirmed, is taxied up. The shuttle must not stay in battery more than **5 min**, or condensation can cause a slow (weak) shot, and the shuttle must be cycled forward and back again **[M]**.

---

## 4. Timings summary

| Interval | Value | Source |
|---|---|---|
| Catapult power stroke | about 2 s (Wikipedia: about 2 s; others "2-3 s", "<3 s") | [S] |
| End speed | about 150 kt (0-165 mph is also quoted) | [S] |
| Hangfire definition | catapult has not fired within **10 s** of pressing FIRE | [M] |
| Delay from wipeout to salute (F/A-18) | about **4 s** | [M] |
| Same-cat launch interval (F-14 era) | **1 min 45 s** per catapult | [S, PBS Enterprise] |
| All 4 cats combined | about **1 jet every 30 s** typical; **every 20 s** at surge | [S, PBS; Navy/CVN-77 publication] |
| Minimum interval between departures (night / Case III) | **30 s** | [M] |
| Shuttle-in-battery limit | 5 min | [M] |
| Approach taxi speed into the buffer | ≤ 4 mph | [M] |
| Two-minute warning | signalled 2 min before the first launch of the series | [M] |
| Launching a full event | about **15 min** for 12-20 aircraft | [S, Wikipedia] |
| Cycle time (cyclic ops) | about 1 h 30 min (1:00-1:45) | [S] |
| Engine start before launch | about 30 min. Man-up about 45 min. Taxi to cats about 15 min before | [S] |
| JBD cool-down during maintenance engine checks on cat | 30 s at idle after 30 s at MRT | [M] |

**Simulation timeline for one jet on one cat** [E], tuned to land about 90-110 s per cat:
```
t=0     jet stops in wye (wings spread, flaps down, weight confirmed earlier)
t=0-12  holdback installed (green shirts kneel at nose gear)
t=12    director: LOWER LAUNCH BAR
t=14-20 jet creeps forward, launch bar drops into shuttle spreader
t=20    TSPO: TAKE TENSION -> director: RELEASE BRAKES + TENSION -> DEO presses BRIDLE TENSION
t=23    jet squats (tension taken); TSPO inspects launch bar
t=30    TSPO exits, thumbs-up; director passes control to shooter (both hands pointed)
t=32    shooter: two-finger run-up; engines to MIL (nozzles change, heat shimmer at JBD)
t=35    (optional) shooter: afterburner signal; AB lights; checkers verify
t=37-42 wipeout (control surfaces cycle)
t=46    pilot salutes; shooter returns salute; DEO hands overhead (FINAL READY)
t=46-51 shooter final scan (looks at checkers, TSPO, centerdeck, forward, deck pitch)
t=51    shooter: touch deck, point forward
t=52    DEO presses FIRE
t=52-54 catapult stroke (0 -> ~150 kt over ~300 ft), shuttle hits water brakes
t=54    jet airborne; launch bar springs up
t=56-70 shuttle retracts to battery; JBD lowers
t=70-90 next jet taxis over JBD into wye
=> about 90-100 s per cat; with bow pair alternating, one bow launch about every 45-50 s;
   bow + waist together about every 25-30 s.
```

Pairing behavior: while cat 1's jet is tensioned and running up, cat 2's jet is being hooked up. Interlocking means only one of the pair can be at STANDBY/MIL PWR at a time, so the pair "ping-pongs": cat 1 fires, then cat 2 fires about 20-30 s later, then cat 1 again once retracted and re-spotted. Waist cats 3/4 run the same way at the same time (Case I/II, nearly simultaneous with the bow, separated by clearing turns) **[M][S]**. At night the Air Boss or Cat Officers make sure bow and waist **never fire together** and keep departures at least 30 s apart **[M]**.

---

## 5. Hand and light signal catalogue (for the simulation)

| Signal | Given by -> to | Day | Night **[M]** |
|---|---|---|---|
| Weight confirm | Pilot -> Weight board | Thumbs-up | Circular flashlight motion |
| Raise / lower weight | Pilot -> Weight board | Palm up moving vertically / palm down moving horizontally | Flashlight vertical / horizontal |
| RRHB checked, ready for hookup | TSPO -> Shooter | Thumbs-up | Vertical white stubby wand |
| Disengage nose steering | Director -> Pilot | Forefinger to nose, then sweep arm in direction of travel | Amber wands equivalent |
| Lower launch bar | Director -> Pilot | Specific launch-bar-down signal (arm extended forward / hand lowered) | Amber wands |
| First Ready / Cat Ready | DEO -> all topside | One hand high, forefinger extended | Red wand |
| Two minutes | Cat Officer -> all | Points to wrist, two fingers | - |
| Take tension | TSPO -> Director | Arm swept forward, forefinger pointing down the cat, held | White stubby wand pointed forward |
| Hold brakes / release brakes | Director -> Pilot | Fists closed / hands opened (one hand) | Amber wands |
| Take tension (to DEO) | Director -> DEO | Other arm pointed forward | Amber wand |
| Pass control | Director -> Shooter | Both hands pointed at shooter | Both amber wands toward shooter |
| Hookup good | TSPO -> Shooter | Thumbs-up held until launch | Steady vertical white stubby wand |
| Final turnup (run-up) | Shooter -> Pilot | Two fingers raised, rotated rapidly overhead | Green wand rotated overhead |
| Mil power light on | DEO -> Shooter | Two fingers overhead | - |
| Afterburner / CRT | Shooter -> Pilot | Open palm pushed up ("raise the roof") | Green wand |
| Final ready | DEO -> Shooter | Both arms up, hands open | Red wand held up |
| Checkers OK | Plane checkers -> Shooter | Thumbs-up | Steady vertical blue stubby wand |
| Wind OK | Centerdeck -> Shooter | Thumbs-up | Steady vertical white stubby wand |
| Pilot ready | Pilot -> Shooter | Head back, turn toward shooter, salute | **Exterior / navigation lights ON (steady)** |
| Salute returned | Shooter -> Pilot | Returns salute | Green wand held overhead |
| CSO ready (ICCS) | CSO -> Bubble | Drops to one knee, thumbs-up | Vertical green wand |
| FIRE | Shooter -> DEO | Hand sweeps down toward launch direction, **touches deck**, comes up level pointing down the cat | Green wand swept down to deck, then forward |
| SUSPEND | Anyone -> Shooter | **Crossed arms overhead** | **Horizontal wand movement** (DEO: red wand vertical overhead) |
| Pilot abort | Pilot -> Shooter | Shake head no + radio "SUSPEND" | Lights NOT turned on + radio |
| Hangfire | Cat Officer -> all | Hangfire signal by hand | Red wand hangfire signal |
| Throttle back | Shooter -> Pilot | Standard throttle-back, given only after the shuttle is confirmed forward of the launch bar | Wands |

Deck lights (ICCS mode): green **MIL POWER** and amber **COMBAT POWER** deck lights face the pilot. On cats 1, 3 and 4 they are on the ICCS housing; for cat 2 they are at the forward deck edge, left of battery. Both lights **flash** once Final Ready is reached **[M]**. Rotating beacon: green = launch authorized, red/amber = not **[M]**.

---

## 6. Night launch differences
- **Same procedures**, slower and more deliberate. NATOPS: "the pre-launch check of catapult components or aircraft launching intervals shall not be speeded up" **[M]**.
- **Minimum 30 s between departures** (Case III). Straight-ahead climb out with no clearing turn. Bow and waist must not launch together **[M][S]**.
- All signals done with **lighted wands**: shooter has red + green, director 2 amber, TSPO white stubby, checkers blue stubby, DEO red, weight board white stubby **[M]**.
- The jet runs up with **exterior lights OFF**. The pilot ensures all exterior lights are off before the MIL/CRT lights come on. The **pilot's "salute" is switching the exterior/navigation lights ON**. If the lights do not come on, there is no launch **[M]**.
- After touching the deck, the shooter **keeps watching the nav lights**. If they go out, the shooter suspends **[M]**.
- For Case III the Cat Officer keeps "absolute control". Jets are tensioned only on his signal, never on the director's initiative **[M]**.
- Visual: the deck is lit by dim red/amber floodlighting and wand glows, and the afterburner plumes light up the JBD. This is a good "night mode" for the simulation.

---

## 7. Suspend and hangfire (rare-event branches)
- **Suspend** can be called by anyone (crossed arms / horizontal wand) at any time **before FIRE is pressed**. Suspend buttons are at Pri-Fly, the Cat Officer's console, the monitor, the CCP, the deckedge and the water-brake station. Any suspend lights the red flashing deck suspend light at the cat **[M]**.
  - Recovery sequence: suspend signal to the pilot, SUSPEND pressed, shuttle maneuvered **fully aft**, pilot signalled to **raise the launch bar**, shuttle bumped **forward of the launch bar** (BRIDLE TENSION) and then briefly aft. Only then does the shooter step in front of the jet and give **THROTTLE BACK**. No one goes under the jet until it is throttled back **[M]**.
- **Hangfire**: the cat does not fire within 10 s of FIRE. All crew freeze in the crouch. The emergency cutout valve is rotated, the shuttle is confirmed aft, and only then is THROTTLE BACK given. The catapult is downed until two good no-load shots have been made **[M]**.
- **No-loads**: before flight ops the catapult fires the bare shuttle (or a dead-load sled) down the track to check performance. They show as a puff of steam with the shuttle flashing to the bow **[M]**.

---

## 8. Hazards to depict
- **Shot line / catapult track**: nobody stands in front of the shuttle or ahead of a jet ready to launch, and nobody except operators is forward of battery **[M]**. Crew stay laterally clear of the "safe shot line" and outside the path the wing sweeps through **[M]**.
- **Jet blast**: nobody stands immediately behind a JBD while a jet is at launch power. The jet waiting behind the JBD must be set up to take the turbulence **[M]**. In the waist area the blast spills over and around the JBDs.
- **Intakes**: crew under the jet (TSPO and holdback man) work within a few feet of running intakes. Nobody goes under the jet until it is throttled back after a suspend **[M]**.
- **Shuttle and launch bar**: misplacing the launch bar in the spreader can let the jet separate from the shuttle mid-stroke and go off the bow at low speed, hence the painted launch bar check **[M]**. Weak (cold) shots after the shuttle sits in battery more than 5 min **[M]**.
- **Steam**: live steam escapes from the track slot during every launch **[M]**, the familiar wisps along the cat track.
- **Premature holdback release**: an incorrectly fitted or worn RRHB can release during tension or run-up and send the jet down the track under engine power alone **[M][S]**.

---

## Simulation implications

What a simulation should model from this topic:

1. **Four catapults** with correct geometry: cats 1/2 at the bow (cat 1 starboard), cats 3/4 at the waist on the angled deck, each about 310 ft stroke (306-310 ft), with the battery position, a lead-in wye, a JBD aft of battery, and water brakes at the forward end. No bridle ramps.
2. **Catapult state machine** per cat: `IDLE/SAFE -> RETRACTED (shuttle in battery) -> CAT/FIRST READY -> JET IN WYE -> HOLDBACK ON -> LAUNCH BAR DOWN -> ON SHUTTLE -> TENSION -> CONTROL TO SHOOTER -> MIL PWR (STANDBY) -> [AB/CRT] -> WIPEOUT -> SALUTE -> FINAL READY -> FIRE SIGNAL -> FIRE -> STROKE (2 s) -> LAUNCH COMPLETE -> RETRACTING -> JBD LOWER/COOL -> back to READY`, with optional `SUSPEND` and `HANGFIRE` branches.
3. **Interlocks**: only one cat of each pair can be at MIL PWR/STANDBY at a time, so cat 1 and cat 2 alternate (and so do 3 and 4). Cats 3/4 are disabled whenever the recovery landing area is active. Cats 1/2 stay available during recovery.
4. **Timing**: about 50-55 s from jet stopped in wye to shot. Stroke 2 s, accelerating to about 150 kt over about 300 ft (use roughly constant acceleration of about 3.5 g; it peaks early). Retract plus JBD plus next spot about 35-45 s. Per-cat interval about 90-105 s. Bow pair alternating about every 45-50 s. Whole deck about every 25-30 s in the day (surge 20 s). Night: at least 30 s between any two launches and no simultaneous bow/waist shots. A full 12-20 aircraft event takes about 15 min. Add a speed multiplier so viewers can watch at 1x or skim.
5. **Actors per catapult**, color-coded: shooter (yellow), director (yellow), TSPO and holdback man and hookup crew (green), weight board operator (green), deckedge operator (green, at the deck edge), centerdeck operator (green, between paired cats), JBD operator (green), 2 squadron final checkers (white, checkered), ordnance (red, in the arming area when loaded), and bow/angle safety. Animate them moving in and crouching: the green shirts duck under the nose to hook up, then run out; everyone is crouched and laterally clear at the shot; the shooter lunges, touches the deck and points.
6. **Signal callouts**: show each hand signal as a short label or icon above the actor at the right moment (weight thumbs-up, TAKE TENSION, two-finger run-up, salute, crossed-arm suspend, touch deck). This makes the "dance" readable. At night, swap to colored wand glows (amber director, green/red shooter, white TSPO, blue checkers) and the pilot's nav lights coming on as the salute.
7. **Aircraft-side cues**: wings spread before the cat, flaps down, launch bar lowered (small line at the nose), squat when tension is taken, nozzles and heat shimmer at MIL, an orange plume for AB/CRT, control surfaces twitching during wipeout, then a fast slide down the cat. Launch bar springs up after the stroke.
8. **Deck-side cues**: JBD raising and lowering (an animated rectangle hinging up about 45-50 degrees), shuttle running back aft during retract, a steam wisp along the track after each shot, the rotating beacon green/red, MIL (green) and CRT (amber) deck lights, a red suspend light, and the deckedge operator's hand states (one finger up / two fingers / both hands up).
9. **Weight board step**: brief board flash with a gross weight (Super Hornet launch weights roughly 44,000-66,000 lb; Growler similar) and the pilot's thumbs-up, before the jet crosses the JBD.
10. **Optional rare events** (toggle): a suspend (crossed arms, shuttle backs off, throttle back, jet removed), a pilot head-shake abort, a hangfire, and a deck-pitch hold where the shooter delays the touch-down for a few seconds.
11. **Queueing**: one or two jets staged behind each JBD (wings folded until near the cat). Directors hand jets off from parking spots to the cat director. The next jet's weight is confirmed while the current jet is in tension.
12. **Educational overlays**: phase timeline bar for the selected cat (Spot / Hookup / Tension / Run-up / Final checks / Shot / Reset), counters for launches and interval, and a "who's doing what" sidebar listing each actor's current task.

---

## Sources

Primary / manual-grade:
- NAVAIR 00-80T-120, *CVN Flight/Hangar Deck NATOPS Manual* (15 Dec 2010), Ch. 1 (roles), Ch. 4 (launch procedures, weight board, tensioning, launch, night ops, suspend/hangfire, wand table): https://mail.mnvdet.com/CV/References/USNavy-CVN-FlightDeck.pdf
- NAVEDTRA 14310, *Aviation Boatswain's Mate E*, Ch. 4 "Steam-Powered Catapults" (C-13 data table, ICCS/deckedge launching, suspend, hangfire, safety precautions): https://www.globalsecurity.org/military/library/policy/navy/nrtc/14310_ch4.pdf
- NAVEDTRA 14310, Ch. 5 "Associated Launching Equipment" (Mk 7 JBD, nose gear launch equipment): https://www.globalsecurity.org/military/library/policy/navy/nrtc/14310_ch5.pdf
- tpub mirrors of the same ABE manuals (ICCS launching / suspend / hangfire pages): https://navyaviation.tpub.com/14001/css/Integrated-Catapult-Control-Station-Iccs-Launching-Procedures-209.htm , https://navyaviation.tpub.com/14310/css/Caution-194.htm , https://navyaviation.tpub.com/14310/css/Integrated-Catapult-Control-Station-Iccs-Suspend-Procedures-195.htm
- Pilot flight deck procedures (P-1211/P-1238 training texts; weight board, launch signal): https://navyflightmanuals.tpub.com/P-1211/Catapult-Procedures-Continued-56.htm , https://navyflightmanuals.tpub.com/P-1211/Flight-Deck-Procedures-50.htm
- Navy SBIR N08-1-014 / Intelligent RRHB (holdback bar function and issues): https://www.navysbir.com/n08_1/N081-014.htm , https://navysbir.com/08_1/32.htm
- Repeatable release holdback bar patent US4101099: https://patents.justia.com/patent/4101099
- SAE 851942, "History and Development of the Repeatable Release Catapult Holdback Bar": https://saemobilus.sae.org/papers/history-development-repeatable-release-catapult-holdback-bar-851942

Secondary:
- Wikipedia, Aircraft catapult (C-13 variants, bridle vs launch bar, bridle catchers): https://en.wikipedia.org/wiki/Aircraft_catapult
- Wikipedia, Modern US Navy carrier air operations (launch timeline, event size, 15-min launch, 2 s / 150 kt, night lights): https://en.wikipedia.org/wiki/Modern_United_States_Navy_carrier_air_operations
- PBS Frontline, USS Enterprise launch pages (1 min 45 s per cat, about 30 s combined; weight board verification; first ready): https://www.pbs.org/wgbh/pages/frontline/shows/navy/enterprise/launchland/launch1.html , .../launch3.html , .../launch4.html
- Fighter Sweep, "Ask a Fighter Pilot: Hand Signals on the Flight Deck" (Hornet pilot's account of signals, AB "raise the roof", salute, touch deck): https://fightersweep.com/3864/ask-a-fighter-pilot-hand-signals-on-the-flight-deck/
- DVIDS, "Face of Defense: Navy 'shooters' launch carrier jets" (11 shooters, 3-6 months to qualify): https://www.dvidshub.net/news/505324/face-defense-navy-shooters-launch-carrier-jets
- Navy.mil, "Ike's bow catapult crew key to mission success" (shooter touches deck and points down the bow, then the deck edge operator fires): https://www.navy.mil/Press-Office/News-Stories/Article/2254992/ikes-bow-catapult-crew-key-to-mission-success
- MigFlug, "Zero to 165 MPH in Two Seconds" (stroke, g, steam per shot, 20 s surge): https://migflug.com/afterburner/zero-to-165-mph-in-two-seconds-how-carriers-launch-jets/
- Wikipedia, Jet blast deflector: https://en.wikipedia.org/wiki/Jet_blast_deflector
- DCS forums (used only to corroborate pilot-side wipeout, launch bar switch, and launch bar spring retraction; not authoritative): https://forum.dcs.world/topic/255530-sme-advice-sought-controls-wipe-out-pre-catapult-launch-afcs-aircraft , https://forum.dcs.world/topic/231148-launch-bar-not-retracting
