# 12 - Gap fill: taxi routes, queueing at the cats, and the path from the wires to the pack

Scope: where the moving jets actually go. This file covers how jets queue behind each JBD and when wings spread, the path from the arresting wires across the foul line to the de-arm stop, the bow pack and the six-pack/street, and how far apart the director handoffs are. Jets only: F/A-18E/F and EA-18G.

**Coordinate frame:** the same as `01-deck-geometry.md` §12. x is feet forward of the stern ramp (0 to 1092). y is feet from centerline, **positive to starboard**. Foul line: `y = 60.7 - 0.1584*x`. Landing centerline: `y = 5 - 0.1584*x`. JBD 1 is at (715, +25), JBD 2 at (715, -25), JBD 3 at (381, -22) and JBD 4 at (361, -64).

**Tags:**
- **[N]** = NAVAIR 00-80T-120, CVN Flight/Hangar Deck NATOPS (15 Dec 2010 copy), quoted directly.
- **[A]** = Navy Airman training manual (NAVEDTRA 14014).
- **[T]** = CNATRA T-45 CQ manual P-1211.
- **[D]** = DCS Supercarrier Operations Guide (Nov 2024). It was built with Navy SME input, but it is still a game.
- **[P]** = my reading of overhead Navy photos (navy.mil/DVIDS releases of Vinson and of Truman with a Nimitz-class sister).
- **[E]** = engineering estimate built from the geometry and the documented rules.

I could not frame-time any video directly. All timings below are either documented or derived from documented distances and speed limits, and each one is tagged.

---

## 1. Hard rules that shape every path (all [N] unless tagged)

| Rule | Source text (abridged) | Effect on paths |
|---|---|---|
| Every move is under a director | "A director shall not leave an aircraft unattended after chocks and tiedowns have been removed. All movement of aircraft shall be under the positive control of a plane director." | One active director per jet at all times |
| Handoff protocol | "Control of a taxiing aircraft shall not be passed from one director to another until the receiving director signals, by extending one arm vertically, that he is ready to accept control." | Handoff = the receiver raises one arm, then the sender points the jet to him |
| Director stays put | "The director shall stay in view of the pilot at all times and strive to remain stationary while controlling aircraft. If it is necessary to change his position ... signal the pilot to hold brakes while moving ... then resume movement." | Directors do not walk along with the jet. They stand at a waypoint and pass it on. This is why handoffs exist. |
| Lost director means stop | "If a pilot loses sight of his director, he shall stop immediately." [T]: "if you are receiving signals from more than one director at a time, stop." | Jets stop-start when a director is blocked or busy |
| Director position | "The standard position for the director is slightly ahead of the aircraft and in line with the left wing tip" [A] | The director sprite stands ~15-30 ft ahead of and ~20-25 ft left of the nose |
| Flow control | "The flight deck supervisor shall control the rate at which aircraft are moved toward the catapult(s) ... ensuring a steady flow of traffic while avoiding unnecessary crowding." | Queues are metered and kept short (see §2) |
| No folded wings behind an active JBD | "Aircraft with wings folded (except C-2/E-2) or aircraft with an open canopy shall not be taxied, spotted, or towed behind a JBD" when an aircraft is at high power on the catapult | The jet waiting directly behind the JBD **must already be spread** |
| No fold/spread cycle near the JBD | "Wing fold/spread cycles shall not be initiated when aircraft is close behind JBD." | Spread happens **before** the jet closes up behind the JBD |
| Waiting jet must take the blast | "Aircraft directly behind the JBD shall be positioned and properly configured for military-rated power of the launching aircraft." Also: "the angle of the catapult approach behind the JBD shall be such as to prevent [exhaust ingestion]." | The waiting jet is canted rather than dead astern when needed |
| Don't park on the JBD | "The parking of aircraft on the deflector panel should be avoided. The panels are designed to withstand only the temporary weight of the aircraft taxiing over them." (NAVEDTRA ABE ch. 5) | The waiting jet holds **aft of the lowered panel**, then rolls across it |
| Cat 3/4 interlock | "While catapult 4 is loaded, the Aircraft Director shall hold aircraft to be loaded on Catapult 3 aft of the Jet Blast Deflector (JBD 3) until the aircraft on Catapult 4 is launched." | The waist pair works in strict alternation. The cat 3 jet waits aft of JBD 3. |
| Ready before crossing the shuttle | "Aircraft shall not be taxied across the shuttle ... until ... gross weight confirmed, wings spread and locked, flaps set, ordnance armed, green beacon, CSV set, and the catapult in first ready/cat ready." Holdback and launch bar are not lowered "before the aircraft reaches the lead-in wye area". | Spread → weight board → JBD crossing → wye stop |
| Weight board before the JBD | [T]: "complete the takeoff checklist, compute the aircraft's gross weight, and acknowledge the weight board **prior to crossing the jet blast deflector (JBD)**." | The weight check happens in the waiting slot behind the JBD |
| Speed into the cat | "Aircraft taxi speed shall not exceed 4 mph while approaching the buffer." | ≤ 5.9 ft/s on the final ~50 ft |
| Leaving the wires | "allowed to roll back a few feet ... The director shall give the pilot the signal to raise the hook ... In directing aircraft clear of the landing area, the director shall give the fold wings and close flaps signal when required and pass control to the next director." | Rollback → hook up → taxi → fold on the move → handoff |
| Leaving power | [T]: "advance power to no more than 70 percent, engage high gain nose wheel steering, and follow the yellow shirt's signals as you taxi past the foul deck line. You will be passed from one yellow shirt to another." | A brisk exit, then a chain of directors |
| De-arm | "Aircraft dearming shall be conducted as soon as practicable after taxiing clear of the landing area ... only when the aircraft is at a complete stop, the area in front of the aircraft is clear and remains clear, and only after the director has turned the aircraft over to the dearming crew coordinator." | A real stop just past the foul line (§4) |
| Ordnance pointing | "When taxiing aircraft from the landing area to the dearming area, care must be taken to minimize exposure of the armed forward firing ordnance to personnel and equipment." | Turn the nose toward open water as early as possible |
| Clear deck | The AGO switches the deck light to green only after the gear puller's "CLEAR DECK FORWARD", with pendants retracted, engines set, and no "violations of the safe parking line". | The trap → clear sequence is gated on the jet's tail crossing the foul line |

---

## 2. Queueing at the catapults

### 2.1 How many jets per JBD

- **Standard picture: 1 + 1 per cat.**
  - One jet is on the catapult, with the JBD raised behind it.
  - One "next" jet sits immediately aft of that JBD with **wings spread**, flaps set, checklist complete and the weight board acknowledged.
  - Sources: [N] repeatedly speaks of "the aircraft directly behind the JBD" and "aircraft immediately aft of the JBD" (singular); [A]: "As the catapult officer launches an aircraft, the directors move another aircraft into the launch position." [N]/[A]
- **A third jet** for the same cat is normally **not lined up in a column behind the second**.
  - It waits in its parking spot or a nearby holding position, **off the shot line**, under its own director.
  - Its wings may still be folded, because it is not "immediately behind a JBD".
  - It is called forward once the "next" jet crosses the lowered JBD.
  - Reasons:
    - (a) The supervisor meters flow "avoiding unnecessary crowding".
    - (b) Blast spills around the JBD edges, especially at the waist.
    - (c) The deck between the bow cats and the island is mostly taxi lane and parking.
  - Tag: [E], consistent with [N] and [D]. The DCS routes "end at the catapults behind the holdback bar attachment points", and its directors give a second jet STOP when "the taxi route is blocked by another aircraft".
- **Cat 3 special case:** when cat 4 is loaded, the cat 3 jet waits aft of JBD 3 even when cat 3 itself is empty. [N]
  - Viewers therefore often see **two jets waiting side by side at the waist**: one aft of JBD 3 and one aft of JBD 4.
  - They wait while a third jet is on cat 4.
- **Whole-deck numbers in a cyclic launch of 12-20 jets** [E]:
  - 4 on cats + 4 waiting behind JBDs = **up to 8 jets in the "launch zone" at once**.
  - 2-4 more are taxiing or holding with directors.
  - The rest are still chained in their spots with engines running.

### 2.2 Where the waiting jet sits (feet)

**Layout along a bow cat** (cat 1 shown; cat 2 is the mirror at y = -25) [E]:

| Item | Position | Note |
|---|---|---|
| Shuttle / launch position (nose gear) | x 765 | 01 doc |
| Tailpipes of the jet on the cat | x ≈ 765 - 47 = **718** | F/A-18E nose gear is ~13 ft aft of the nose; tailpipe ~60 ft aft of the nose |
| JBD hinge line | x ≈ 715 | |
| Lowered JBD panel footprint (fore-aft) | **~14 ft** (10.7 ft raised height ÷ sin 50°) → x ≈ 701-715 | |
| Nose of the waiting jet | **~10-20 ft aft of the panel's aft edge** → x ≈ 680-690 | |
| Waiting jet's nose gear | x ≈ 670-678 | |
| Waiting jet's tail | x ≈ 620-630 | |

- **Lateral offset of the waiting jet** [E]: on or within ~10 ft of the cat centerline, nose canted 0-15° toward the track it will enter.
  - The bow pair's JBDs are 50 ft apart (centers at y ±25), and a spread Super Hornet is 44.7 ft wide.
  - So the two bow "next" jets sit almost wingtip to wingtip at x ≈ 625-690, y -50 to +50.
  - That is exactly the area in front of the six-pack. This is why the bow lineup looks crowded.
- **Waist cats:** the waiting jets sit aft of JBD 3 and JBD 4, along the 9° waist heading.
  - Behind JBD 3 (381, -22): nose at about (360, -19), tail at about (300, -10).
  - Behind JBD 4 (361, -64): nose at about (340, -61), tail at about (280, -52).
  - Both jets are inside the landing area, which is legal because waist launches never overlap a recovery. [E]
  - People stand 30-40 ft aft of these jets, and the fantail jets are just aft of that.

### 2.3 When wings spread

- **Before** the jet closes up behind the JBD, never in the slot while the jet ahead is at power.
  - The rules: no fold/spread cycle "close behind JBD", and no folded-wing jet "immediately behind a jet blast deflector when another aircraft is at high power setting". [N]
- The usual practice [E, consistent with [N]/[T]]:
  - The director gives the **spread wings** signal as the jet pulls out of its spot, or at a holding position one to two aircraft lengths (60-120 ft) aft of the JBD.
  - The pilot completes the takeoff checklist while taxiing (flaps to takeoff, trim).
  - The pilot acknowledges the weight board in the waiting slot.
  - Then the jet **crosses the lowered JBD already spread**, stops at the wye, and the launch bar comes down.
- Exception:
  - If the JBD ahead is down and no jet is at power on that cat (the first jet of the event, or the cat idle), the spread can be done right behind the JBD.
  - The DCS guide models this simplest case: step 1, "Unfold wings", is given by the cat director once the jet is behind the JBD. [D]
- Wikipedia's "As an aircraft is taxied onto the catapult, the wings are spread" is a loose summary. Treat NATOPS as governing.
- Spread time: ~10-15 s (see `05-aircraft-handling.md`, use 12 s).

### 2.4 Micro-timeline at one bow cat (steady state) [E, built on `02-launch-cycle.md`]

| t (s) | Jet on cat (A) | Next jet (B), behind JBD | Third jet (C) |
|---|---|---|---|
| 0 | Shot fires | Wings spread, holding ~15 ft aft of the raised JBD, director in front | Chained in spot, wings folded, director assigned |
| 2-15 | Airborne; shuttle retracts | Holds; weight board shown and acknowledged | Chocks and chains pulled on the director's signal |
| 15-25 | JBD lowers, then cools briefly | Holds | Starts to taxi and spreads on the move, or holds in spot |
| 25-40 | - | Cat director (yellow, near the wye) takes control. B rolls ~40-55 ft over the panel to the wye at ≤ 4 mph | Taxis toward the slot under the 2nd director |
| 40-55 | - | Stops at the wye; holdback on, launch bar down; JBD rises behind B once its tail is clear of the arc | Arrives in the slot aft of the JBD (now raised), wings already spread |
| 55-100 | - | Hook-up, tension, run-up, salute, shot | Weight board; waits |

Per-cat cycle ~90-105 s; the bow pair alternates every ~45-50 s.

---

## 3. From the wires to the foul line

### 3.1 Where the jet stops

- Typical target: **3-wire** (x 252, y -35).
- Rollout ~300-340 ft along the landing centerline, then a 5-10 ft rollback.
- The **stop point** is on the landing centerline at s ≈ 560-590 ft from the ramp, about **(x 560, y -84)**, with heading 9° to port of the ship's heading. [E from documented runout]
- At that x, the foul line is at y ≈ -28. The jet's centerline is ~55 ft inside the line.
- The jet stops **across or between the waist cat tracks** (cat 3 track at y ≈ -51 there, cat 4 at y ≈ -96), roughly abeam the forward end of the island.
  - Those cats are dead during recovery, so crossing them is legal.
- The **gear puller** (yellow, the landing-area director) stands at the pilot's **1 o'clock**, ~40-60 ft ahead and right, about (600, -60). [T: "Yellow shirt director at 1 o'clock - watch signals (off brakes, pull back, raise hook)"]; [A: "the gear puller, a director assigned to direct aircraft from the landing area"]

### 3.2 Exit path

**Sequence:** pullback/rollback → "hook up" → "come ahead" → hard right turn → taxi forward-right at ~40-60° to the ship's axis. [N]/[A]/[E]

**Where it crosses:** the foul line at about **x 600-640, y -35 to -40**.
- That is just forward of the island's forward face (island x 410-560) and abeam elevator 2 (x 580-650).
- That is the stretch of foul line "forward of the waist catapults", which NATOPS ties to the de-arm area (§4).

**Distances** [E]:

| Segment | Distance |
|---|---|
| Stop → nose crosses the foul line | ~60-75 ft |
| Tail clears the line | ~50-60 ft more (the jet is 60 ft long and crosses obliquely) |
| **Total, stop → "tail clear of the foul line"** | **≈ 110-135 ft** |

**Time** [E]:
- 3-5 s rollback and hook up.
- About 20-25 s of taxiing at an average ~5 ft/s (≈ 3.4 mph): accelerate, turn, then 6-7 ft/s.
- Total: **~25-30 s from stop to clear deck**.
- This matches the 20-30 s in `03-recovery-cycle.md`, and the ~45-60 s Case I interval leaves ~15-30 s for wire retract and the AGO's checks.

**Wings and flaps:** fold and flaps-up are signalled **on the move**, usually as the nose approaches the foul line. [N] "give the fold wings and close flaps signal ... and pass control to the next director." The fold finishes ~10-15 s later, by about the de-arm stop.

**Handoff #1:** gear puller → Fly 2 director. The Fly 2 director stands **starboard of the foul line**, ~40-60 ft ahead of where the jet will cross, about (650, -5). He raises one arm and takes the jet as its nose reaches the line. [N]/[E]

**Does it cross a cat track?**
- **Waist (cat 3, and often cat 4): yes.** Both are dead during recovery, with shuttles aft and covers in.
- **Bow cats 1/2: no.** The exit is aft of JBDs 1/2 (x 715).

---

## 4. The de-arm stop

**Where (best evidence):**
- [N] twice warns about "turbojet aircraft ... spotted on or along the No. 2 catapult (4 Row) or along the foul deck line forward of the waist catapults with the turbojet exhaust blowing to the port side. **This includes aircraft in the de-arm area blowing turbojet exhaust to port.**"
- [A]: "The fly one director then taxies the aircraft to a position so the **nose of the aircraft is pointed over the side**, and then stops the aircraft. The director then ensures that the area directly in front of the aircraft is clear ... turns the aircraft over to the ordnance crew for disarming. He/she displays a hold signal to the pilot with one hand and points to the ordnance director with the other. Once the disarming is accomplished, the V-1 director then directs the aircraft for parking or to be spotted."
- Put together: the de-arm area is **immediately starboard of the foul line, in the stretch forward of the waist cats**. The jet stops **nose toward the starboard deck edge**, pointing out over the water, so its exhaust blows **to port across the foul line**.

**Simulation placement** [E]:
- Centre about **(x 620-660, y -25 to 0)**.
- Heading roughly **60-90° right of the ship's heading**: nose toward the deck edge at elevator 2 / the gap between the island and elevator 1.
- A **clear lane ~30 ft wide ahead of the nose** out to the starboard deck edge (y +100) must be kept empty of people and jets while armed.
- This lane crosses the six-pack/street, so the first de-arm happens before that area fills, or the lane is left open.

**Crew:**
- The CAG arm/de-arm crew wears red jerseys with a 3-in black stripe and "CA" in 6-in white reflective letters. [N, App. H]
- They approach from the side and aft. Entry paths are set per type "to avoid exposure to exhaust end of missiles, gun barrels, and aircraft intake/exhaust". [N]
- The Air Gunner or Air Wing Ordnance Coordinator "shall indicate to the director those aircraft that require safing before taxi to the recovery spot"; others skip the stop. [N]
- The pilot shows hands. Common practice is hands on the canopy bow or visible; this detail is not in the NATOPS copy. [E]

**Duration** [E]: 30-90 s for a gun plus AIM-9/AIM-120 safing.
- Jets with nothing forward-firing armed (most training, CQ and many cyclic events) **skip** the stop or pause only a few seconds.
- Other safing "authorized to be conducted after engine shutdown may be accomplished after taxi to the shutdown spot". [N]
- Exceptions:
  - Emergencies: "Armed aircraft returning to the ship with an emergency shall be de-armed immediately after landing in the landing area prior to the aircraft being towed." [N]
  - A suspected gun jam: the jet is de-armed in the de-arm area, then parked "with aircraft pointing over the water". [N]

**Handoff #2:** after de-arm, the Fly 2 director (or the next one up the line, "the V-1 director") takes it back and leads it forward or to its spot.

---

## 5. From the de-arm stop to the pack

### 5.1 Fill order

- **Real practice:** recovered jets are **"packed on the bow to keep the landing area clear"** (Wikipedia).
  - The bow pack fills **front to back**, so later arrivals never have to squeeze past parked jets.
  - Then the crotch / port bow edge fills.
  - Then the **street / "fighter row"**: the starboard deck-edge row from elevator 1 aft to the island.
  - Last, the **six-pack** in front of the island and any slots aft of the island that are clear of the foul line (junkyard, fantail corner).
  - Tags: [P] from overhead photos. The Truman-pair photo shows a Nimitz-class bow packed in about three columns plus a starboard-edge row from elevator 1 to the island, with the angle clear. The Vinson photo shows a starboard row of ~9 jets from the island forward and a port bow row of ~6, nose-in with tails over the edges. Also [A]: "Most carriers have a basic spotting order. This spotting order varies from carrier to carrier".
- **DCS differs:** it allocates "from the stern towards the bow", with priority to spots opposite the island. That is a game convenience; do not copy it. [D]
- The Naval Safety Center notes the fighter-row spot is "a dangerous spot because it's so close to the foul line": jets there sit within a few feet of the line.

### 5.2 Path to the bow [E]

| Leg | Route | Distance | Speed |
|---|---|---|---|
| De-arm stop → turn forward | Pivot left ~60-90° on nosewheel steering | ~20 ft | 2-3 ft/s |
| Up "the street" | From (650, -10) forward to (760, 0), between the island-side parking and the foul line; lane ~40 ft wide | ~110 ft | 5-7 ft/s |
| Across JBD 1/2 | Over the **lowered** JBD panels at x 701-715 (they are flush and taxiable). The 14 ft gap between the panels is too narrow for a folded Hornet (30.5 ft), so the jet rolls over one panel. | ~20 ft | 4-5 ft/s |
| Up the bow | Along the centerline between or over the cat 1 and cat 2 tracks, x 715 → 950-1040 | ~250-320 ft | 5-7 ft/s |
| Spin into the spot | Turn so the **tail is over the deck edge** and the nose points inboard (or angled aft, herringbone). Tow or back-in is used for the tightest bow spots. | ~40-60 ft plus a pivot | 2-3 ft/s |

- **Total from crossing the foul line to the bow spot:** ~**450-550 ft**.
- **Time:**
  - About 1.5-2.5 min moving.
  - Plus 0-90 s de-arm.
  - Plus stops for blocked directors.
  - Total **~2-4 min**.
- After the stop:
  - Blue shirts chock and chain at once: "initial tiedowns" by the handling crew, added to by the plane captain. [N]
  - The brown-shirt plane captain takes over.
  - Engines are shut down on signal.
- **Six-pack / street spot:**
  - ~100-250 ft from the foul line, ~1-2 min.
  - These are the last jets of a recovery, or the first if the bow is kept open (see 5.3).

### 5.3 Does the bow route cross cat 1 or cat 2?

- **Normal cyclic recovery:** the bow cats are idle, shuttles stowed. Recovered jets taxi **over both tracks** and park on them. That is why the next launch needs a respot or "breakdown" of the bow. [P]/[E]
- **Simultaneous recovery and launch:**
  - NATOPS explicitly provides for "**simultaneous recovery and Catapult No. 2 operations**, deck-edge mode", in which the cat 2 deck-edge and JBD operators "shall not be considered fouling the landing area". [N]
  - Inference [E]: in that mode **cat 1 / the starboard bow is the recovery parking side**.
  - Recovered jets must stay starboard of cat 2's shot line. They must not cross it while a jet is on cat 2 in tension, and no folded-wing jet may sit behind JBD 2 while it is at power.
  - Directors hold recovered jets short (STOP) near (700, +10) until the shot goes.
- **Cat 1 active during recovery** is the mirror case: recovered jets fill the port bow and crotch and stay off the cat 1 line.

---

## 6. Launch-side routes and handoffs (for completeness)

| Route | Path | Distance | Directors | Time to the slot behind the JBD |
|---|---|---|---|---|
| Six-pack → cat 1/2 | Pull out nose-to-port, spread in the open, ~30-60 ft forward to the slot | 50-150 ft | 1-2 (spot director → cat director) | 1-2 min [E] |
| Street (starboard row) → cat 1 | Out of spot, forward along the street to the slot aft of JBD 1 | 100-250 ft | 2 | 1.5-2.5 min [E] |
| Fantail / junkyard → cat 3/4 | Out of spot, port across the (empty) landing area, then forward along the waist to aft of JBD 3/4 | 150-300 ft | 2-3 | 2-3 min [E] |
| Bow pack → cat 1/2 | Broken down outermost-first; often towed | 50-200 ft | 1-2 plus a tow crew | n/a |

- **Plane captain → director:** the brown shirt releases the jet from its spot, then gives the "Hand off to Next" gesture to the yellow-shirt director. [D] NATOPS: "The plane captain shall not cause any tiedown chains to be removed or wings to spread without specific clearance from a flight deck director." [N]
- **Final director → cat director** at the JBD, then **cat director → Catapult Officer** after tension and once the TSPO has cleared. [N]

---

## 7. Director spacing and handoff points

- One director handles **one leg between turning points**. "After the center of the aircraft enters the TP area, it is handed off to the next TP." "At any given time, the aircraft's movement is only controlled by one deck crew member." [D]
- Directors stand still while controlling. [N]
- **Leg length** [E from deck geometry and route turns]: ~**60-150 ft**, so a director is spaced every ~100 ft on average.

**Recovery route (wires → bow), 4-5 directors:**

| # | Director | Position | Role / handoff point |
|---|---|---|---|
| 1 | Gear puller (Fly 3) | ~(600, -60) | Rollback, hook, exit turn. Hands off at the foul line. |
| 2 | Fly 2 director | ~(650, -5) | Takes the jet across the line and to the de-arm stop. Hands to the de-arm coordinator, then takes it back. |
| 3 | Street / JBD director | ~(740, +10) | Leads it over the lowered JBD. Hands off ~100 ft on. |
| 4 | Fly 1 bow director | ~(880-950, 0) | Leads it up the bow. |
| 5 | Spot director (may be #4) | at the parking spot | Spins it into the spot, gives "stop/chocks", hands it to the plane captain. |

- Recovery spacing: #1→#2 ≈ 70-80 ft, #2→#3 ≈ 90-110 ft, #3→#4 ≈ 150-200 ft, #4→#5 ≈ 50-100 ft.
- **Launch route (spot → cat):**
  - Plane captain → spot director → (0-1 intermediate) → cat director near the wye.
  - About 2-4 handoffs over 50-300 ft.
  - The cat director stands ahead of the jet near the shuttle and pulls it over the JBD.

---

## 8. Speeds to use

| Context | Value | Source |
|---|---|---|
| Into the buffer / over the shuttle | ≤ 4 mph (5.9 ft/s); use 2-3 ft/s | [N] |
| General deck taxi | DCS recommends "a maximum speed not exceeding 5-7 km/h" (3.1-4.3 mph, 4.6-6.4 ft/s); the "come forward" signal = "safe speed (5-10 km/h)" | [D] |
| Leaving the wires | ≤ 70% power; brisk; peak ~6-8 ft/s on the straight to the foul line | [T]/[E] |
| Turns and pivots into spots | 1-3 ft/s; often a stop-pivot-go | [D]: on "Turn Left/Right", "the aircraft should stop and then begin turning" |
| Tow moves | ≤ 5 mph / walking pace | 05 doc |
| Break-away | "increase the throttle to approximately 73% engine RPM", then idle and coast | [D] |

---

## Simulation implications

1. **Route graph, not free steering.** Build a directed graph of waypoints ("turning points") in the 01 frame. Each edge is owned by one director agent standing at its downstream node.
   - **Handoff** = the next director raises one arm (a 0.5-1 s pose), then the current director points ("hand off" gesture).
   - Stop the jet if the next director is busy or blocked.
2. **Recovery path (per trap):**
   - Stop at ~(560, -84) → 3-5 s rollback/hook up.
   - Exit right at 40-60° to cross the foul line at ~(600-640, -37), about 25-30 s from stop to tail-clear.
   - Fold wings during this leg (12 s).
   - Deck light goes green once the tail is clear and the wire has retracted.
3. **De-arm stop:**
   - Flagged jets (configurable, e.g. 30-100% of jets) stop at ~(640, -10) with nose 60-90° to starboard, holding 30-90 s.
   - 2-3 red-shirt "CA" ordnancemen approach from the side and aft.
   - A clear 30 ft lane runs ahead of the nose to the deck edge.
   - Exhaust plume points to port across the foul line.
4. **Pack fill order:** bow tip → bow rows (three columns: starboard-edge, centre and port-edge, tails outboard, ~35-40 ft pitch) → crotch/port bow edge → street row (starboard edge, from elevator 1 aft to the island) → six-pack → aft-of-island slots clear of the foul line. Never park inside the foul line during recovery.
5. **Bow route:** street lane (650 → 760) → over a lowered JBD 1 or 2 → up the centreline to the spot → pivot so the tail is over the edge.
   - ~450-550 ft, about 2-4 min including the de-arm.
   - If a bow cat is active during recovery (optional scenario, NATOPS-sanctioned for cat 2), keep recovered jets off that cat's shot line and behind a director's STOP until the shot.
6. **Launch queue per cat:** 1 jet on the cat plus 1 "next" jet waiting **spread** with its nose ~10-20 ft aft of the lowered JBD footprint.
   - Bow next-jet noses at ~(685, ±25); waist at ~(360, -19) and (340, -61).
   - Any third jet waits in its spot or a holding point off the shot line, wings may be folded.
   - Enforce: no folded wings behind a raised JBD with a jet at power, no fold/spread cycle in the slot, and the cat 3 jet held aft of JBD 3 while cat 4 is loaded.
7. **Spread timing:** trigger the spread on leaving the spot or at a holding node 60-120 ft aft of the JBD. Show the weight board in the slot, then the JBD lowers, then the jet crosses at ≤ 4 mph and stops at the wye.
8. **Speeds:** cruise 5-7 ft/s, turns 1-3 ft/s, final into the buffer 2-3 ft/s. Add stop-and-go at every handoff (0-3 s pauses), as real deck traffic is jerky, not smooth.
9. **Director sprites:** stand ~15-30 ft ahead of and ~20 ft left of the jet's nose, and stay stationary while controlling. Reposition only while the jet is braked.
10. **Hard-constraint checker:** use it for path planning and as a teaching overlay ("why did that jet stop?"):
    - LA empty during recovery
    - no taxi across a cat's shot line while that cat is in tension
    - nothing parked on a JBD panel
    - JBD arc clear before it moves
    - armed jets keep their nose clear of people

---

## Open questions / confidence notes

- **Exact de-arm spot coordinates** are inferred from the NATOPS wording ("along the foul deck line forward of the waist catapults ... exhaust blowing to port") plus the Airman manual's "nose pointed over the side". The ship-specific deck marking was not found online. Confidence: medium.
- **"1 + 1 per cat"** is strongly implied by NATOPS's singular "aircraft directly behind the JBD" and the flow-control language, but no source gives an explicit maximum. Confidence: medium-high.
- **Whether cat 1 or cat 2 is the usual "live" bow cat during recovery** varies by ship and plan. NATOPS names cat 2 specifically for simultaneous ops.
- No frame-timed video measurements were possible: YouTube/DVIDS video, mil news pages and the MIT MASCS thesis (Ryan 2014, which reportedly has measured deck taxi data) were blocked or rate-limited. Timings are derived from documented distances and speed limits.
- Six-pack / patio naming varies. The Hoggit DCS page says "AI aircraft taxiing to catapult 1 may be slowed or blocked by any object from the Patio to Elevator 1", which implies the patio lies **aft** of elevator 1 on the cat 1 route. That conflicts with the 01 doc's placement forward of elevator 1. Check before labelling.
- The Airman manual says "fly one director" for the de-arm stop, which conflicts with the stop's location in Fly 2 (by the island). It may be a manual slip, or ship-specific practice.

---

## Sources

- NAVAIR 00-80T-120, CVN Flight/Hangar Deck NATOPS Manual (15 Dec 2010), §4.5 catapult launch, §5 recovery, §7.4.4-7.4.6 taxi/spotting/recovery, §11.1 arming/de-arming, App. H jerseys: https://mail.mnvdet.com/CV/References/USNavy-CVN-FlightDeck.pdf
- NAVEDTRA 14014 Airman manual, ch. 10, "Directing Taxiing Aircraft" / "Landing Procedure" / "Spotting Aircraft": http://navyaviation.tpub.com/14014/css/14014_246.htm , http://navyaviation.tpub.com/14014/css/14014_247.htm , http://navyaviation.tpub.com/14014/css/14014_248.htm
- NAVEDTRA ABE training manual ch. 5, Jet Blast Deflectors and Mk 2 NGL (JBD parking caution, approach track/wye), tpub ABE series (navyaviation.tpub.com)
- CNATRA P-1211 T-45 CQ, Flight Deck Procedures (postlanding, 70% power, handoffs, weight board before the JBD): http://navyflightmanuals.tpub.com/P-1211/Flight-Deck-Procedures-50.htm
- CNATRA P-1211 T-45 CQ Briefing Guide, Deck Procedures (director at 1 o'clock, taxi to the JBD): http://navyflightmanuals.tpub.com/P-1211/Deck-Procedures-P-12110090-90.htm
- DCS Supercarrier Operations Guide (Nov 2024): taxi routes, turning points, handoffs, speeds, parking allocation: https://www.digitalcombatsimulator.com/upload/iblock/e1b/430ooc582lpb0npynbsewan6omd5ohvs/DCS_Supercarrier_Operations_Guide_EN.pdf
- Hoggit wiki, DCS carrier spawns: https://wiki.hoggitworld.com/view/DCS_editor_carrier_spawns
- Wikipedia, Modern US Navy carrier air operations: https://en.wikipedia.org/wiki/Modern_United_States_Navy_carrier_air_operations
- Naval Safety Center, Approach/Mech winter 2010-11 (fighter row near the foul line): https://issuu.com/navalsafetycommand/docs/2010-2011_winter/s/14834265
- MIT DSpace, J. Ryan PhD thesis (MASCS deck simulation; not retrieved): https://dspace.mit.edu/handle/1721.1/97255
- Overhead deck photos of USS Carl Vinson and of Truman with a Nimitz-class sister (navy.mil/DVIDS releases), used for the pack geometry [P].
- Companion project files: 01-deck-geometry.md, 02-launch-cycle.md, 03-recovery-cycle.md, 05-aircraft-handling.md
