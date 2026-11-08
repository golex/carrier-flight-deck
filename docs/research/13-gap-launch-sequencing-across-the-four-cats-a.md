# 13 - Gap fill: Launch sequencing across the four cats and real inter-shot intervals

Scope: how fast a Nimitz-class carrier actually fires jets (F/A-18E/F, EA-18G) off its four C-13 steam catapults in a cyclic event; how many cats are manned; in what order jets go; and how long after the last waist shot the landing area (LA) goes "green" for recovery. This file settles the pace disagreement between `02-launch-cycle.md` (25-30 s combined, 20 s surge), `06-cyclic-ops.md` (45-60 s combined) and secondary sources (20 s).

Evidence key used throughout:
- **[DOC]** Navy doctrine text (CVN Flight/Hangar Deck NATOPS, NAVAIR 00-80T-120, 2010; ABE training manual NAVEDTRA 14310 ch. 4). These are rules, not measurements.
- **[CLAIM]** A number stated by a journalist, a ship's public affairs tour, a veteran's recollection, or a simulator manual written with Navy consultants. It was not measured by me.
- **[DERIVED]** Arithmetic from the above.
- **[EST]** My engineering estimate for the simulation, from the procedure steps and general knowledge of deck footage. No source states it.

**Limitation (read first):** the brief asked for values measured from timestamped deck video. I could not do that here. The tools cannot play video, several primary pages (USNI Proceedings "Surge '97", USNI News Ford sortie test, MIT/Duke flight-deck simulation theses, DCS "How cyclic ops really works" thread) refused automated fetches (403/429), and the session's web-search budget ran out. **No value below is a frame-timed measurement.** Section 7 gives a short protocol for timing a DVIDS video later, so someone can replace the [EST] values.

---

## 1. Hard constraints that set the pace (doctrine)

| Constraint | Effect on sequencing | Source |
|---|---|---|
| **Paired interlock.** "When catapults are being operated as interlocked pairs, the first catapult to reach STANDBY/MIL PWR shall be fired or suspended before the other catapult can attain STANDBY/MIL PWR." | Cats 1 and 2 (bow pair) alternate. Cats 3 and 4 (waist pair) alternate. Only one jet per pair can be at launch power at a time. A bow jet and a waist jet **can** be at launch power at the same moment. | [DOC] 00-80T-120 sec. 4.5 note |
| **Night / Case III:** procedures are the same as day "with one exception; a minimum departure (launch) interval of 30 seconds shall be utilized between aircraft." The Air Officer "shall monitor the launch to ensure that the bow and waist catapults do not launch simultaneously." | Night: whole deck no faster than **1 shot / 30 s**, and bow and waist never fire together. | [DOC] 00-80T-120 sec. 4.7 |
| "During night operations, do not attempt to speed up the prelaunch check ... or take unnecessary chances in an effort to maintain rapid aircraft launching intervals." | Night shots are slower than the 30 s floor in practice. | [DOC] NAVEDTRA 14310 ch. 4; 00-80T-120 |
| **Day Case I/II:** launches from bow and waist are "nearly simultaneous". Aircraft make a clearing turn, **right off the bow cats, left off the waist cats**, for lateral separation. | Day: bow and waist pairs run independently and can fire within seconds of each other. | [CLAIM] Wikipedia "Modern US Navy carrier air operations"; DCS Supercarrier guide glossary "Clearing Turn" |
| **Waist cat GO/NO-GO charts** (Aircraft Launching Bulletin 0-16) are kept at the centerdecks, the cat 2/3/4 deckedges, Pri-Fly and Flight Deck Control. Waist bow/angle safety may not give a green light without checking them. | What is parked or spotted on or along **cat 2** and the foul line can block a waist shot. The handler has to sequence cat 2 and the waist cats together. | [DOC] 00-80T-120 sec. 4.4.6 |
| "Subsequent aircraft shall be spotted and tensioned as rapidly and safely as possible" after LAUNCH COMPLETE. The monitor operator retracts the shuttle once the track is clear. | The per-cat cycle is a tight serial chain: shot, retract, JBD down, next jet over the JBD, hook up. | [DOC] 00-80T-120 sec. 4.6.4 |
| Cat 4 aircraft often block the cat 3 JBD operator's view, so a JBD safety observer is needed. | Waist pair slightly slower to turn around than the bow pair. [EST: about 5 s] | [DOC] 00-80T-120 |
| **Pre-recovery checklist (waist cat officer):** launching accessories clear of the LA; cat 3 and 4 shuttles aft, cat 3 grab latch off, spreader covers on; centerdeck console hatch and other waist hatches **closed and dogged**; JBDs fully lowered and hydraulics secured; track slot seals out and **at least 12 slot buttons installed** (after the shuttle is retracted); waist safety light off; waist ICCS bubble "DOWN AND LOCKED". Then, if the recovery follows a launch, the waist cat officer raises an arm overhead (day) or shows a green wand (night) to the Arresting Gear Officer. | Sets the minimum time from the last waist shot to a clear deck (sec. 5). | [DOC] 00-80T-120 sec. 5.x (pre-recovery) |
| "During simultaneous recovery and Catapult No. 2 operations, deck-edge mode, the Catapult No. 2 Deckedge Operator and JBD Operator ... shall not be considered fouling the landing area." | **Bow cats can keep shooting during a recovery**, including cat 2 at the port bow, which sits near the LA. Only the waist cats are locked out. | [DOC] 00-80T-120 sec. 4.5 |
| Lens/LA lights "may be turned on a short time before the ship is completely ready to commence recoveries" (wave-off lights on until clear deck). | The first recovering jet can already be on approach while the waist is being secured. | [DOC] 00-80T-120 sec. 6.x |

---

## 2. Claimed and documented rates (no measurements)

| # | Statement | Ship / era / aircraft | Type | Implied value |
|---|---|---|---|---|
| A | "Each of the four catapults ... can launch an F-14 every one minute and 45 seconds, for a total rate of about one plane every 30 seconds." | USS *Enterprise* (CVN-65), ~2000, F-14 | [CLAIM] PBS Frontline | Same cat **105 s**. Four cats **26-30 s**. |
| B | Daytime "two planes every 37 seconds" (some retellings: "launch two and land one every 37 s"); "one per minute at night". | USS *Harry S. Truman* (CVN-75), public tour / journalist | [CLAIM] SlashGear; USNA aviation page via search snippet | Day **~18.5 s** per launch. Night **~60 s**. |
| C | Four catapults "on average ... can launch one aircraft every 20 seconds." | Nimitz class (DCS Supercarrier manual, made with Navy SMEs) | [CLAIM] | **20 s** combined |
| D | "One aircraft every 20 seconds" from four C-13s (repeated widely, e.g. the WION piece on *George H.W. Bush*) | CVN-77 | [CLAIM, likely the same lineage as C] | **20 s** combined (surge) |
| E | From the jet reaching the catapult until launch takes "about twenty to thirty seconds". | USS *Kitty Hawk*, 1975-77, ABH recollection (bridle era) | [CLAIM] Adkins blog | **20-30 s** time *on* the cat (not the cycle) |
| F | Event 1 launch "takes generally about 15 minutes" for events of ~12-20 aircraft. | General | [CLAIM] Wikipedia | Event average **45-75 s** per jet |
| G | Nimitz sortie generation: ~120 sorties per 12-hour fly day, surge 240 per 24 h. | DOT&E figure quoted by USNI News (Ford SGR test, Aug 2026) | [CLAIM, official origin] | ~10 launches/hour sustained. This is a cycle limit, not a cat limit. |
| H | Night/Case III minimum 30 s between launches; bow and waist never together. | All CVN | [DOC] | Night floor **30 s** |
| I | "Four aircraft launched within ten seconds" | Forum anecdote | [CLAIM, weak] | Shows four can fire almost together in day ops. Do not use as a rate. |
| J | Hobby-sim CASE I briefs use "~10 second intervals". | Master Arms DCS wiki | [CLAIM, sim community] | Not authoritative |

### Reconciling the contradiction (20 s vs 25-30 s vs 45-60 s)

All three numbers can be right. They measure different things:

1. **Burst rate with a full queue (every cat has a jet waiting behind its JBD): about 18-30 s between shots across 4 cats.** Sources A, B, C and D agree on this. Interlocking means each pair gives at most one shot per ~15-25 s (the time a jet spends at MIL power before firing). Each cat gives one shot per ~75-105 s. [DERIVED] Four cats at ~90 s each average ~22 s between shots.
2. **Event-average rate across a whole 12-20 jet event: about 40-60 s per jet.** Source F (15 min per event). The event starts and ends with a partly filled queue. Jets taxi from all over the deck through a chain of directors, some are late (maintenance, fuel, pilot), there are suspends, and as the deck empties fewer cats are fed. `06-cyclic-ops.md`'s "45-60 s combined" is this **average**, not the instantaneous rate.
3. **Night: 30 s is the legal floor. About 45-60 s is typical** (source B: one per minute). Fewer cats are manned and checks are deliberate.

**Decision for the simulation:** model the per-cat cycle and the interlock bottom-up, and let the combined rate come out of that. It should give ~20-25 s bursts mid-event and a 12-jet day event of **~8-11 minutes** from first shot to last shot. Calibration targets are in section 8.

---

## 3. Per-catapult cycle (same cat, shot to shot)

Step chain for one cat, day, F/A-18E/F, with the next jet already waiting behind the JBD. Times are from the shot (t = 0). Step order comes from 00-80T-120 and `02-launch-cycle.md`. Durations are [EST] unless marked.

| t (s) | Event | Notes |
|---|---|---|
| 0 | FIRE; ~2 s power stroke, ~150 kt end speed | [CLAIM] Wikipedia / MigFlug |
| 2-4 | LAUNCH COMPLETE; JBD operator starts lowering the JBD once the jet is past | JBD lowers in ~3-5 s [EST] |
| 4-15 | Shuttle and grab retract aft to battery (retraction engine). Water brakes stop the pistons. | [EST 6-10 s]. The ABE manual describes the retraction engine but gives no time. |
| 8-25 | Next jet taxis over the lowered JBD and into the wye/lead-in under the cat director (yellow). Wings spread, weight board confirmed. | ~10-15 s taxi of ~60-100 ft [EST] |
| 25-45 | Launch bar down into the shuttle spreader, holdback (RRHB) fitted, final checkers' walkaround, ordies arm if loaded, JBD up | [EST]. Adkins' "20-30 s on the cat" fits this step plus the next. |
| 45-55 | TAKE TENSION, jet to MIL power. This is the moment the interlock takes this pair. | |
| 55-70 | Wipeout (control check), "normally a 4-second delay" before the salute [DOC], shooter's final scan, deck-pitch timing | |
| 60-90 | FIRE (next shot from this cat) | |

**Same-cat interval:**
- **Best case, day:** ~55-65 s [EST]
- **Typical, day cyclic:** **~75-100 s** [EST, fits PBS 105 s for the heavier F-14 and the 90-100 s in `02-launch-cycle.md`]
- **Night:** ~120-180 s per cat [EST]. Because of the 30 s deck-wide floor and no simultaneous bow/waist shots, each cat is effectively gated by the other cats.
- **Waist cats** run ~5-10 s slower per cycle than the bow [EST]: cat 3 JBD observer, GO/NO-GO checks against what is at cat 2, and taxi lanes that cross the LA.

**Pair interval (cat 1 then cat 2, alternating):** with both cats fed, the pair fires about every **~35-50 s** (each cat ~80-90 s, offset by half a cycle) [DERIVED/EST]. The interlock floor is the time from MIL power to fire, about **15-25 s**, so two shots from one pair cannot come closer than that [DERIVED].

---

## 4. Combined launch rate by number of cats manned

[DERIVED] from a per-cat cycle of ~85 s (bow) / ~90 s (waist) with a full queue, day.

| Cats in use | Burst interval (deck) | Shots/min | Notes |
|---|---|---|---|
| 1 cat | ~85 s | 0.7 | Single-cat ops: CQ, an alert launch, or a cat down |
| 2 cats, same pair (e.g. 1+2) | ~40-45 s | 1.4 | Interlock keeps them alternating. Typical bow-only flight and night-ish pace |
| 2 cats, one bow + one waist (e.g. 1+3) | ~40-45 s (day, can be near-simultaneous) / ≥30 s spaced (night) | 1.4 | Common night pattern [EST] |
| 3 cats (1, 2 + 3 or 4) | ~28-32 s | ~2 | Common day cyclic when one waist cat is down or used for parking [EST] |
| 4 cats | **~20-25 s**; surge ~18-20 s | ~2.5-3 | Sources B, C, D. Real events average lower (sec. 2) |

12-jet event duration from first shot to last shot, with feed losses included: 4 cats **~7-10 min**; 3 cats **~9-12 min**; 2 cats **~12-16 min** [EST]. Night, 2-3 cats at ~45-60 s average: **~10-13 min** for 12 jets [DERIVED from B/H].

---

## 5. How many cats are manned

No doctrine source gives a required number. What the evidence supports:

- **Day Case I cyclic, 10-14 jets:** the deck is set up to use **all four cats** if the launch is spotted that way. The waist cats exist mainly to drain the jets spotted in the LA, and Wikipedia and the DCS manual describe bow and waist firing "nearly simultaneously". Three cats is common when a cat is down for maintenance (catapults go "down" for hangfires, slot seal problems, two no-loads after repair) or when the handler parks jets on or near cat 4 or cat 2 for the next event [EST, not sourced]. **Sim default: 4 cats; option 3.**
- **Night Case III:** the 30 s floor and the no-simultaneous bow/waist rule mean 4 cats add little throughput. Night events are usually smaller. Ships commonly run **2-3 cats** (typically the bow pair plus one waist cat) [EST, not sourced]. **Sim default: cats 1, 2 and 3 at ≥30 s spacing, with an actual average of ~45-60 s.**
- **During the recovery window:** waist cats 3 and 4 are locked out (pre-recovery checklist). Bow cats 1 and 2 can legally shoot (cat 2 deckedge exception [DOC]). In practice the bow quickly fills with recovered jets, so bow shots during recovery are limited to the first few minutes: a late launcher, the recovery tanker, or an alert jet [EST].

---

## 6. Launch order within the event

### 6.1 What leads
1. **Plane-guard / SAR helicopter** (not a catapult launch): off before the first jet, last to land. [CLAIM] Adkins (Kitty Hawk); `06-cyclic-ops.md`. Out of the jet-only scope, but it can be shown as a marker.
2. **E-2 / tanker first among fixed-wing.** For a jet-only sim, the **recovery tanker (a Super Hornet with a buddy store) is normally the first, or among the first, jets off.** Support:
   - A Naval Safety Command *Approach*-type account (vol. 64 no. 2) describes the primary tanker as "the first Super Hornet launched for the event". [CLAIM, real-world, 1 source; the page was not re-fetchable]
   - The DCS carrier documentation (132nd VW TRMA; Supercarrier guide) has the recovery tanker launch at the opening of the window and land last. [CLAIM, sim]
   - Hobby forums: tankers and E-2/C-2 "normally" go first. [weak]
   - Reason: the tanker has to climb, do a package (drogue/flow) check and be on station overhead **before** the recovery it protects begins. That recovery starts only ~1-3 min after the last launch (sec. 7).
   - **Which cat:** not sourced. Cat 1 is the cat least affected by LA/recovery restrictions and closest to the starboard-side parking around the island, so **tanker off cat 1 (or cat 2)** is a reasonable default [EST]. Do **not** present it as a rule. Wikipedia: "launch order is somewhat random, based on deck position."
3. **Mission tankers and escort jets** for the event often go before the strikers they will refuel [EST].

### 6.2 Bow vs waist and clearing the angle
- The **handler's spot sets the order**, not squadron preference. Position on deck usually decides it [CLAIM: Adkins; Wikipedia "somewhat random, based on deck position"].
- **Jets spotted in the LA / on the angle and aft (the "waist", "six-pack" and fantail side of the LA) feed the waist cats 3 and 4. Jets spotted forward, on the starboard side and around the island (street, patio, bow corners) feed cats 1 and 2.** [CLAIM, `05-aircraft-handling.md`; consistent with the GO/NO-GO and foul-line rules]
- **Both pairs start together** at launch time. The waist pair is not held back. Because the recovery cannot start until the waist checklist is done, **the waist queue is the critical path**: the handler puts jets that must get off the angle in the waist queue and sends late or spare jets to the bow [EST]. The bow can, if needed, keep shooting a straggler after the deck goes green; the waist cannot.
- Result: in a typical day event, the **last waist shot comes slightly before or at about the same time as the last bow shot**, and the angle is "cleared" by the waist cats draining their own queue, not by jets taxiing out of it [EST].
- A jet in the LA that goes **down** (won't start, gripe) must be **towed out of the LA** before recovery. This is a classic delay to show [EST; consistent with `08-edge-cases-and-hazards.md`].

### 6.3 Shot-to-shot spacing between pairs (day)
- Bow and waist can fire within ~0-5 s of each other in the day (clearing turns give separation). Within a pair, ≥15-25 s by interlock.
- Night: deck-wide ≥30 s, never bow and waist together, and the Air Boss or cat officers coordinate the interval [DOC].

---

## 7. Last waist shot to green deck

**Doctrine sequence** (00-80T-120 pre-recovery, waist cat officer, plus the arresting gear officer):
1. Last waist shot. Its shuttle retracts aft (~6-10 s) [EST].
2. Both waist JBDs fully lowered and hydraulics secured (~5-10 s) [EST].
3. Launch accessories (spare holdbacks, weight boards, tools, chocks) carried out of the LA (~20-40 s) [EST].
4. Slot seals out, **≥12 slot buttons** in along cat 3/4 tracks; spreader covers on; centerdeck console hatch and other waist hatches dogged; waist bubble down and locked (~45-90 s with a practiced crew, in parallel) [EST].
5. Waist cat officer: arm overhead or green wand to the AGO [DOC].
6. AGO confirms gear set (weight per type), retractable sheaves up, LA clear of people and jets, then the deck status (pickle) light goes green. Pri-Fly / Tower: "99, Charlie" or "ready deck" [DOC + `06-cyclic-ops.md`].

**Estimate:** **~60-120 s** from last waist shot to green deck with a well-drilled day crew. Up to **2-4 min** at night or after a problem [EST]. This matches `06-cyclic-ops.md` (last launch about L+11, green about L+12-13).

**First trap:** in Case I the first division is timed to break so the first jet is in the groove just as the deck goes green. Wikipedia: the stack descends "once the launching aircraft clear the landing area". The lens can be lit before the deck is clear [DOC]. So the **first trap comes ~1-3 min after the last waist shot** in the day [EST]. Case III: the first approach is pushed from marshal so it reaches ¾ nm after the clear deck. The LSO waves off at ≥½ nm without a clear deck signal [DOC]. Plan for **~3-5 min** from last launch to first trap at night [EST].

---

## 8. Calibration table for the simulation (recommended defaults)

| Parameter | Day Case I | Night Case III | Basis |
|---|---|---|---|
| Cats manned | 4 (option: 3) | 3 (1, 2, 3) (option: 2) | sec. 5 [EST] |
| Same-cat interval | 75-100 s (mean 85; waist +5-10 s) | 120-180 s | sec. 3 [EST], A |
| Pair interlock floor | ≥15-25 s between shots of the same pair | same | [DOC] interlock |
| Deck-wide min spacing | none (bow and waist may fire together; clearing turns) | **30 s**, never bow and waist together | [DOC] |
| Burst deck interval (full queue) | ~20-25 s | ~30-40 s | B, C, D, H |
| Event-average deck interval | ~40-50 s | ~50-60 s | F, B |
| 12-jet event, first to last shot | ~8-10 min | ~10-13 min | [DERIVED] |
| First jet | recovery tanker (Super Hornet + buddy store), cat 1 | same | sec. 6.1 [CLAIM + EST] |
| LA-spotted jets | waist queue (cats 3/4) | waist queue (cat 3) | sec. 6.2 |
| Last waist shot to green deck | 60-120 s | 120-240 s | sec. 7 [EST] |
| Last waist shot to first trap | 1-3 min | 3-5 min | sec. 7 [EST] |
| Bow shots during recovery | allowed (cat 1, cat 2) until the bow pack blocks them | allowed, rare | [DOC] cat 2 note |

---

## 9. How to replace the [EST] values with measurements (protocol)

1. Use DVIDS or Navy YouTube B-roll that shows **one cat continuously**, uncut, across two or more shots (search DVIDS: "flight deck operations" "B-roll" CVN, preferably with Super Hornets, 5+ minutes).
2. Log for each shot: frame of the shuttle start, JBD down, next jet's nose wheel over the JBD, holdback fitted, MIL power (exhaust and noise change), salute, shot.
3. For a whole deck, use an island or vulture's-row camera, or count shots against the clock in the audio (the cat stroke "thump" plus the 5MC).
4. Report the median and the 10th/90th percentiles. Expected (my prediction): same cat median ~80-90 s; deck burst ~20-25 s.

---

## Simulation implications

1. **Model each catapult as its own state machine** (Idle → JetTaxiOn → Hookup → Tensioned/MIL → Fired → Retract/JBD down → Idle), with timed steps as in sec. 3. Same-cat interval comes out at 75-100 s. Do not script a fixed deck-wide interval.
2. **Implement the pair interlock:** only one cat of {1, 2} and one of {3, 4} may be at MIL/tensioned at a time. The other jet of the pair waits hooked up but not tensioned. This creates the visible ping-pong between cats 1 and 2 and between 3 and 4.
3. **Day mode:** bow and waist fire independently, sometimes within a second or two of each other. Show clearing turns (bow right, waist left) for departing jets.
4. **Night mode:** a deck-wide 30 s minimum spacing, no simultaneous bow/waist, 3 cats manned, and deliberate step durations (+50%). The average comes out at ~45-60 s per launch.
5. **Calibration targets:** 4-cat burst 20-25 s, 12-jet day event 8-10 min first-to-last shot, night 10-13 min. Show a live "time since last shot" and "launches/min" readout so viewers can see the pace.
6. **Feed logic matters as much as the cats:** the handler assigns each jet to a cat queue by spot. LA/aft jets go to the waist queue, forward/starboard jets to the bow queue. Taxi time through director handoffs makes event-average pacing slower than the burst rate. Add occasional late jets (~10%) and suspends (~2-3%) [EST].
7. **First jet off is the recovery tanker** (Super Hornet with buddy store), default cat 1. Label it so the viewer learns why: it must be overhead before the recovery begins.
8. **Waist queue is the critical path to recovery.** When the waist queue empties, trigger the waist-secure sequence (shuttles aft, JBDs down, slot buttons, hatches, bubble down, raised-arm signal to the AGO). Green deck comes ~60-120 s after the last waist shot (day). Show the deck status light change and "99, Charlie".
9. **Bow cats may still shoot a straggler during the first minutes of recovery.** Waist cats are hard-locked once the LA is in recovery mode.
10. **Down-jet-in-the-LA event:** a jet in the waist queue that can't launch must be towed clear before green deck. This is a teachable delay.
11. **Cat-down option:** let one cat be "down" (shown with a red light / no crew). The event then runs on 3 cats, ~30 s bursts, and the queue redistributes.
12. Label pacing values in the UI as approximate and illustrative. They are reconstructed from doctrine and secondary claims, not measured.

---

## Sources

Doctrine (local copies already fetched by sibling research tasks; public mirrors exist):
- NAVAIR 00-80T-120, *CVN Flight/Hangar Deck NATOPS Manual* (2010): sec. 4.5 interlock note; 4.4.6 waist catapult GO/NO-GO; 4.6.4 launch complete; 4.7 Night/Case III (30 s minimum interval, no simultaneous bow/waist); 5.x pre-recovery checklist (waist cat officer items a-i); 6.x lens before clear deck; cat 2 simultaneous-recovery note.
- NAVEDTRA 14310, *Aviation Boatswain's Mate E* training manual, ch. 4 "Steam-Powered Catapults" (night launching intervals shall not be rushed; retraction engine).

Web:
- PBS Frontline, "Carrier: Launch" (USS Enterprise; 1:45 per cat, ~30 s combined): https://www.pbs.org/wgbh/pages/frontline/shows/navy/enterprise/launchland/launch1.html
- SlashGear, "How Many Planes Can An Aircraft Carrier Launch Per Minute?" (Truman: two per 37 s day, one per minute at night): https://www.slashgear.com/1983974/how-many-planes-can-aircraft-carriers-launch-per-minute
- USNA Naval Aviation page (37 s figure, via search snippet only): https://www.usna.edu/NavalAviation
- Wikipedia, "Modern United States Navy carrier air operations" (event ~15 min, 12-20 aircraft, launch order by deck position, clearing turns, Case III 30 s): https://en.wikipedia.org/wiki/Modern_United_States_Navy_carrier_air_operations
- DCS: Supercarrier Operations Guide (Eagle Dynamics, updated Nov 2024; "one aircraft every 20 seconds"; Case III 30 s; clearing turns). Local copy from the sibling task; publisher: https://www.digitalcombatsimulator.com
- WION, "20-second launches: how fast is the USS George H.W. Bush catapult system": https://www.wionews.com/photos/-20-second-launches-how-fast-is-the-uss-george-h-w-bush-catapult-system-1776978336700
- MigFlug, "Zero to 165 MPH in Two Seconds": https://migflug.com/afterburner/zero-to-165-mph-in-two-seconds-how-carriers-launch-jets/
- Andy Adkins (ABH, USS Kitty Hawk 1975-77), "#94 Flight Deck Operations: Aircraft Launch" (20-30 s on the cat; helo then E-2 first; handler sets order by deck position): https://azadkinsiii.com/blog/94-flight-deck-operations-aircraft-launch/
- 132nd Virtual Wing TRMA carrier brief (recovery tanker at window open; sim): https://132nd-vwing.github.io/TRMA-Brief/PAGES/Carrier.html
- Naval Safety Command magazine vol. 64 no. 2 (primary tanker first Super Hornet launched; seen via search snippet, page not re-fetchable): https://issuu.com/navalsafetycommand/docs/vol64_no2/14
- USNI News, "USS Gerald R. Ford Sortie Test Exceeded Nimitz-class Performance" (Nimitz 120 sorties / 12 h, surge 240 / 24 h, via search snippet; 403 on fetch): https://news.usni.org/2026/08/24/uss-gerald-r-ford-sortie-test-exceeded-nimitz-class-performance-says-cno-caudle
- USNI Proceedings, "Surge '97: Demonstrating Carrier's Firepower Potential" (975 sorties in 4 days; not fetchable): https://www.usni.org/magazines/proceedings/1998/september/surge-97-demonstrating-carriers-firepower-potential
- Master Arms wiki, CASE 1 (sim-community "~10 s intervals"; low weight): https://wiki.masterarms.se/index.php/CASE_1
- Cummings et al., "Modeling efficiency and safety on an aircraft carrier flight deck", JDMS 2024 (launch-cycle agent model; full text not accessed): https://doi.org/10.1177/15485129221150939
- J. C. Ryan, MIT PhD 2014, MASCS flight-deck launch simulation (calibrated on deck data; not accessed, 429): https://dspace.mit.edu/handle/1721.1/97255
- Cross-references in this project: `02-launch-cycle.md`, `05-aircraft-handling.md`, `06-cyclic-ops.md`, `08-edge-cases-and-hazards.md`.
