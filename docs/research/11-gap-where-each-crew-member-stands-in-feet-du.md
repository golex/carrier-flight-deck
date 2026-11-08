# 11 (gap fill): Where each crew member stands, in feet, during each phase

Scope: positions of flight deck crew around a jet (F/A-18E/F, EA-18G) on a bow catapult and a waist catapult, and around the landing area during recovery. This file settles the port/starboard conflicts between notes 01, 02, 03 and 04, and gives x/y placements that a renderer can use.

**Evidence tags**
- **[NATOPS x.y]**: NAVAIR 00-80T-120, *CVN Flight/Hangar Deck NATOPS Manual*, 15 Dec 2010. The full text was extracted from a public mirror and quoted below.
- **[ABE-ch3] / [ABE-ch4]**: NAVEDTRA 14310, *Aviation Boatswain's Mate E*, ch. 3 (Mk 7 recovery equipment) and ch. 4 (steam catapults).
- **[2SRC]**: two or more independent sources agree.
- **[EST]**: my estimate. It comes from geometry constraints (span, NATOPS clearance rules) plus the general layout seen in published launch and recovery footage and photos. **Neither NATOPS nor the ABE manuals give any crew position in feet.** Every number in feet below is an estimate built to satisfy the cited rules.

---

## 1. Conflict resolutions (read this first)

| Conflict in notes | Resolution | Evidence |
|---|---|---|
| AG (arresting gear) deck-edge operator: port catwalk (03) vs starboard catwalk (04) | **Starboard.** The note in 03 is wrong. | [ABE-ch3]: "The deckedge control station ... is located on the **starboard side aft**, where the operator has a clear, unobstructed view of the landing area." [NATOPS 5.1.2 item 4]: "During recovery operations, with the exception of the LSO and his assistants, **no personnel shall be permitted in the port catwalk** without authorization from the Air Officer." [NATOPS 5.2.1]: the AGO is "on deck", defined as "a position in the **starboard catwalk** or on the flight deck, from which the entire landing area may be viewed." [2SRC] |
| Catapult deck-edge stations: port edge for cats 2-4 (02) vs starboard catwalk beside the bow cats (04) | **Each catapult's deck-edge panel is in the catwalk outboard of that catapult.** Cat 1 is in the **starboard** bow catwalk. Cat 2 is in the **port** bow catwalk. Cats 3 and 4 are both in the **port** waist catwalk. Note 02 is right. Note 04 is right only for cat 1. | [ABE-ch4]: "The deckedge control panel is located on the bulkhead in the **catwalk outboard of the associated catapult** ... such that a clear and unimpeded view of the launching officer and hook up crew is assured." Cat 2 on the port side is confirmed by [NATOPS 4.5.1 / 5.2.2]: "During simultaneous recovery and Catapult No. 2 operations, deck-edge mode, the Catapult No. 2 Deckedge Operator and JBD Operator ... are authorized to man the deckedge station ... and **shall not be considered fouling the landing area**." That exception is only needed if the station sits beside the angled landing area, which is on the port side. Cat 3 on the port side is confirmed by [NATOPS 4.5.1 CAUTION]: "Often aircraft on catapult No. 4 block the view of the No. 3 JBD Operator." The cat 3 JBD operator must therefore be outboard (port) of cat 4. [NATOPS 4.4.5] lists GO/NO-GO charts at the "Catapult 2, 3, and 4 deckedges", the three on the port side. |
| ICCS (Integrated Catapult Control Station) bubble on the waist: between cats 3 and 4 (04) vs port of cat 4 (01, from a DCS game guide) | **Between cats 3 and 4.** The coordinate in 01 should move. | Trafficnews.jp (Nimitz-class): "one between catapults 1 and 2 on the bow, and one between catapults 3 and 4 on the angled deck", fitted from CVN-73 on and retrofitted to CVN-68 to 72. [ABE-ch4]: the ICCS "controls the operation of **two adjacent catapults**", and its console is "located **facing aft**". [NATOPS 4.6.3 Note]: "The military and combat power deck lights are located on the ICCS for catapults No. 1, 3 and 4", so the pilots on both cat 3 and cat 4 must be able to see the waist bubble. NATOPS does call it "Deckedge ICCS" ("WAIST BUBBLE DOWN AND LOCKED", 5.2.1). Treat that as the name of the system, not its position. |
| ICCS bubble on the bow | **Between cats 1 and 2**, a little forward of the battery positions. The console faces aft, toward the jets. | Trafficnews.jp; [ABE-ch4] (faces aft, two adjacent cats); DVIDS 6295115 ("bow bubble", Nimitz). Oddity: cat 2's MIL/CRT power lights are not on the bubble. They sit "on the forward deck edge left of the battery position" [NATOPS 4.6.3], which is consistent with a port-side cat 2 deck-edge area. |

**Rule summary for the renderer**
- Recovery: port catwalk = LSO platform only. All arresting-gear crew watch from the starboard side or the starboard catwalk.
- Launch: deck-edge station = the catwalk outboard of each cat. Cat 1 is starboard. Cats 2, 3 and 4 are port.

---

## 2. Reference geometry for a jet on the catapult

These dimensions are needed to turn the rules into feet (F/A-18E/F and EA-18G):
- Length 60.3 ft; span with tip missiles 44.9 ft, so the **half-span is about 22.5 ft**; folded span 30.6 ft. [Wikipedia/Boeing]
- Main gear track about 10.5 ft (VRS sim data). Wheelbase about 17.8 ft (F/A-18C value; E/F assumed similar) [EST].
- Taking the **nose gear as the origin**: the nose tip is about 13 ft forward, the pilot's eye about 3-5 ft aft (above the nose gear), the main gear about 18 ft aft, the wingtips at about -18 to -24 ft, and the exhaust nozzles at about -46 ft. The JBD hinge is about -50 to -55 ft. [EST from the planform]
- **NATOPS clearance rule** that sets the minimum lateral offset [NATOPS 4.5.3 step 17]: "All personnel **except centerdeck operator** in the vicinity of launching aircraft shall remain in a position prohibiting the aircraft wing from passing over them." At the shot, everyone except the centerdeck operator must therefore be at **|v| >= ~25 ft** (half-span plus margin) or forward of the nose, and **crouched**.
- Paired cats are close. In the deck model (01), cats 1 and 2 are about 50 ft apart, and cats 3 and 4 are about 45 ft apart with cat 3's battery about 13 ft forward of cat 4's. The strip between paired cats is therefore only about 22-25 ft from each track. That is why NATOPS exempts only the centerdeck operator, who works at the centerdeck console hatch between the tracks.

**Local frame used below:** u = feet forward of the nose gear, along the launch direction. v = feet to the jet's **right** (starboard of its heading); negative v = the jet's left (port).

---

## 3. Launch: positions relative to the nose gear

The phases follow notes 02/04: (A) taxi-in and weight board, (B) arming stop, (C) hookup and tension, (D) turnup and final checks, (E) the shot.

| Role (jersey) | Phase A-C (spotting, hookup) | Phase D-E (turnup, shot) | Source for the rule / [EST] numbers |
|---|---|---|---|
| **Director** (yellow) | Ahead of the jet, roughly on the track centerline: **u +30 to +40, v 0**. He walks it onto the shuttle and signals the pilot. | After the TSPO's tension signal he "check[s] forward and aft ensuring all personnel (**director included**) ... are laterally clear", then passes control. Moves to **u +15 to +25, abs(v) 28-35**, usually on the side opposite the shooter, and crouches. | [NATOPS 4.6.3 step 9]; numbers [EST] |
| **Weight-board operator** (green) | "Positioned **next to the aircraft director**, remaining within the pilot's field of view" while the jet taxis toward the JBD: **u +25 to +40, abs(v) 8-15** beside the director. He then turns to show the board to the Cat Officer, the centerdeck operator and the deck-edge operator (or JBD operator in ICCS mode). | Holds the board until the shooter acknowledges, then clears laterally: **abs(v) >= 30**, forward of the wing. | [NATOPS 4.4.2 Note, step 4]; numbers [EST] |
| **Shooter / Catapult Officer**, deck-edge mode (yellow) | On deck forward-abeam the nose, on the side the pilot can see. For the bow cats this is the centerdeck area between cats 1 and 2: **u +10 to +20, abs(v) 25-30**. | Same spot. At "fire" he lunges, touches the deck and points down the track. He stays crouched and laterally clear "until the signaled aircraft has passed". | [NATOPS 4.5.3 step 17]; [ABE-ch4] (the launching officer directs "from the center deck station"); [NATOPS 4.2.1.3] ("vary his position accordingly to ensure all his signals may be seen by the pilot"; "avoid standing in a position where the wing tip passes overhead"); numbers [EST] |
| **Shooter**, ICCS mode | Inside the bubble, between the paired cats, about 10-30 ft forward of battery, facing aft. | Presses FIRE himself. | [ABE-ch4]; Trafficnews.jp |
| **Catapult Safety Observer (CSO)** (green jersey, yellow vest; ICCS mode) | Takes the deck-edge shooter's spot: **u +10 to +20, abs(v) 25-30**, between the jet and the bubble so he can see both the pilot and the Cat Officer. Gives the TSPO the hookup signal. | Returns the salute, crouches everyone, then **drops to one knee** with a thumbs-up to the bubble. | [NATOPS 4.6.3 steps 5-6]; numbers [EST] |
| **TSPO** (green) | **Under the nose at the nose gear, u 0 to +3, v 0**, checking the launch bar in the shuttle spreader. "Shall be the **last man to exit** from underneath the aircraft." | After tension he inspects the seating, exits forward and to the side to about **u +5, abs(v) 25-28**, and gives a thumbs-up to the CSO or shooter, then stays crouched. | [NATOPS 1.7.13, 4.6.3 step 10]; numbers [EST] |
| **Holdback man** (green) | **u -2 to -5, v 0**, under the jet at the holdback bar and buffer just aft of the nose gear. | Exits before tension, laterally to about **u -5 to -10, abs(v) 25-30**, crouched. | [NATOPS 1.7.14, 4.5.2]; numbers [EST] |
| **Squadron final checkers** (white checkerboard, 2) | Walk alongside, inspecting configuration as the jet is spotted. | Must be clear before tension ("Squadron Plane Checkers are clear from under the aircraft"). At turnup they "position themselves so they may observe the lighting of the afterburners and normal nozzle action": about **u -20 to -35, abs(v) 30-40**, one each side, outboard of the wingtips and forward of the JBD. Blue stubby wand at night. | [NATOPS 4.6.3 step 7d and turnup step 3]; numbers [EST] |
| **JBD operator** (green) | Bow cats use JBD deck-edge control boxes, so the operator is at the deck edge abeam the JBD: **u -50 to -55**, at the outboard catwalk. Cat 1: starboard. Cat 2: port. Cats 3/4: port catwalk (cat 3's operator looks across cat 4). | Same. Raises the JBD when the tail clears its arc. | [NATOPS 4.5.1 CAUTION]; numbers [EST] |
| **JBD safety observer** | "Shall be positioned on the **side of the JBD farthest away from JBD Operator**." One per bow cat that uses deck-edge control boxes. **Cat 3 always** needs one. Position: **u -50 to -55**, at the inboard end of the JBD, abs(v) about 20-25, on the side opposite the operator. | Same. | [NATOPS 4.5.1 CAUTION] |
| **Deck-edge operator** (green) | In the catwalk outboard of the cat, roughly abeam the battery position: **u -10 to +20**, at the deck edge. The offset is about 35-40 ft (cat 2), 55-75 ft (cat 1) or 55-60 ft (cat 4) from the track on the deck model (01). Holds both arms overhead at Final Ready. | Fires (deck-edge mode), then crouches against the **inboard catwalk bulkhead**. | [ABE-ch4]; [NATOPS 4.5.3 steps 18-19]; numbers [EST] |
| **Centerdeck operator** (green) | At the centerdeck console hatch between the paired cats, abeam the battery: **u -5 to +10**, about halfway between the tracks (about 22-25 ft from each). Watches the anemometer, relays type, weight and CSV, and holds spare shooter wands. | The **only** person exempt from the "wing must not pass over him" rule [NATOPS 4.5.3 step 17]. Gives a thumbs-up or a vertical white stubby wand when the wind is within limits. | [NATOPS 4.4.6, 4.5.3]; [ABE-ch4]; numbers [EST] |
| **Ordnance arming crew** (red; supervised by an arming safety coordinator) | Arming area: the jet is stopped "**forward of the raised JBD**, flaps in takeoff position, the nose launch bar **resting on top of the shuttle**". The crew is at the weapon stations under the wings, **u -10 to -25, abs(v) 5-20**. The coordinator stands in front where the aircrew can see him: **u +15, abs(v) 10**. "The area in front of and behind the aircraft ... shall remain clear." | Exits along briefed paths before the launch bar is moved over the shuttle. Air Wing Arming Coordinators are "positioned on the bow and waist catapults during launch". Waits clear at the deck edge or between cats, abs(v) >= 30. | [NATOPS 4.4.4, 11.1.4]; numbers [EST] |
| **Bow safety / angle safety observers** | **Bow safety:** at the forward end of the stroke, in the bow catwalk, about **u +280 to +310**, at the deck edge. **Angle safety (waist cats):** at the forward-port end of the angled deck near "the point", **u +250 to +300**. Both watch the shot line, the parked-aircraft wingtip clearance (GO/NO-GO charts) and the pattern. | Show a green light or thumbs-up; red to stop. The deck-edge operator must see their signal before firing. | [NATOPS 4.4.5, 4.5.3 step 18]; numbers [EST] |

**Catwalks at the shot:** everyone in a catwalk "remain[s] as low as possible and attempt[s] to hug the inboard catwalk bulkhead" [NATOPS 4.5.3]. No one is "forward of the catapult battery position" except authorized operators [NATOPS 4.1.1 item 9].

### 3a. Ship-frame example coordinates

These use the 01 deck frame: x in feet forward from the stern, y in feet from centerline, positive to starboard. All values are [EST].

**Cat 1** (nose gear at 765, +25; heading about +x):

| Role | x | y |
|---|---|---|
| Director, pre-tension / cleared | 800 / 785 | +25 / +57 |
| Weight board | 798 | +37 |
| Shooter or CSO (port side of jet, centerdeck strip) | 780 | -3 |
| Bow ICCS bubble | ~785 | 0 |
| Centerdeck operator | 770 | 0 |
| TSPO after exit | 770 | +52 |
| Holdback man after exit | 757 | +53 |
| Final checkers | 740 / 740 | +60 / -5 |
| JBD operator / JBD safety | 715 / 715 | +95 (starboard edge) / 0 |
| Deck-edge operator (starboard catwalk) | 775 | ~+102 |
| Bow safety | ~1060 | +45 to +55 |

**Cat 4** (nose gear at 410, -72; heading 9 deg to port):

| Role | x | y |
|---|---|---|
| Director forward / cleared | 445 / 434 | -77 / -47 |
| Shooter or CSO (port side) / CSO (inboard side, toward bubble) | 420 / 426 | -102 / -50 |
| Waist ICCS bubble (between cats 3 and 4) | ~440 | -55 |
| TSPO after exit | 419 | -47 |
| Holdback man after exit | 406 | -43 |
| Final checkers | 380 / 390 | -100 / -36 |
| Deck-edge operator, cats 3 and 4 (port catwalk) | ~411 | -131 |
| JBD 4 operator / JBD 4 safety | 352 / 364 | -121 / -42 |
| JBD 3 operator (port, looking across cat 4) / JBD 3 safety | ~360 / 384 | -120 / 0 |
| Angle safety | ~690-740 | -140 |

---

## 4. Recovery: who stands where

Landing frame (01): the jet touches down at about (229, -31), traps on wire 3 at about (252, -35), and rolls out about 300-340 ft. The hook stops near s = 560-590 ft from the ramp and the nose near **(610, -91)**. The foul line is y = 60.7 - 0.1584x.

| Role (jersey) | Where | Movement | Source |
|---|---|---|---|
| **Arresting Gear Officer, AGO** (yellow) | "On deck ... a position in the **starboard catwalk or on the flight deck**, from which the entire landing area may be viewed." Usually on the flight deck just starboard of the foul line abeam the wires: **about (270-300, +20 to +30)**. Holds the deck-status "pickle". | Gives the LSO "clear deck" (deck light green) and goes red at touchdown. Points individuals across the landing area. | [NATOPS 5.2.1, 5.2.2, 5.2.3]; numbers [EST] |
| **AG deck-edge operator** (green) | **Starboard side aft**, at the deck-edge control station in the starboard catwalk abeam the landing area: **about (220-260, +97 to +100)**. Retract levers are on the deck-edge bulkhead. | Ducks "behind cable shields or below flight deck level" at touchdown. Retracts only on the hook runner's positive signal, and "shall stand well clear of the retract lever while personnel are on deck". | [ABE-ch3]; [NATOPS 5.1.2, 5.2.3]; numbers [EST] |
| **AG Topside Petty Officer** (green) | "Is stationed in the catwalk", the starboard one, near the deck-edge station. Supervises the topside crew; 1 red + 1 green wand. | | Flight Deck Awareness guide; [NATOPS 5.2.3] wand list |
| **Hook runner(s)** (green, "A") | Wait **outside the landing area, at the starboard foul line, abeam the expected rollout end**: about **(520-560, -15)** and a second at about (470-490, -5). NATOPS uses the plural; 1-2 is typical. | Enter only once the jet "has come to a complete stop". Approach "from the **front and side**" (away from jet blast and cable backlash) to the hook, about 45 ft aft of the nose. Give "WIRE CLEAR" to the gear puller, then "RETRACT" to the deck-edge operator, and confirm it was received before leaving. | [NATOPS 5.1.2 item 7, 5.2.3 steps 2-7]; [ABE-ch3]; numbers [EST] |
| **Gear puller** (yellow director, 2 amber wands) | Before the trap: forward of the rollout, at or just outside the foul line, **about (650-670, -35)**, facing aft. Gives the AGO "CLEAR DECK FORWARD". | After the stop: steps into the landing area to "position himself so as to be clearly visible to the pilot", about **30-50 ft ahead of the nose, slightly to the jet's right: (645-660, -80)**. Signals hook up, hold brakes, off brakes, then taxis the jet out of the landing area to starboard and forward. | [NATOPS 5.2.2 step 8a, 5.2.3 steps 3-5]; numbers [EST] |
| **A/G deck checker(s)** (green; 1 white stubby wand) | Starboard side by the wires, at the foul line near the pendant ends, **about (200-300, +15 to +25)**. Enter only on a fouled deck with AGO clearance, and stay "at least 10 feet aft of the No. 1 wire" when crossing. | Check that the pendants are seated and taut and the wire supports are up between traps. | [NATOPS 5.1.2 item 8, 5.2.3]; numbers [EST] |
| **A/G safety, VLA safety** (1 red wand each) | A/G safety: forward of any AG crew working in the landing area, "facing aft with arms crossed over head". VLA (visual landing aid) safety: at the lens, on the port side near (420, -128). | | [NATOPS 5.1.2 WARNING, 5.2.3]; position [EST] |
| **LSO platform team** (at most 6: controlling LSO, backup LSO, spotter/talker or hook spotter, writer(s), CAG or senior LSO) | **Port side aft**, at the deck edge abeam roughly wires 1-2: **x 150-185, y -100 to -120**. The only people allowed in the port catwalk during recovery. | The controlling LSO stands at the aft or outboard rail with the pickle. The backup LSO stands beside him watching lineup. The spotter/talker is on phones at the deck-status light box ("GEAR SET, THREE SIX ZERO, HORNET, CLEAR DECK"). The writer stands behind them. Everyone jumps into the safety net or pit on a bad pass. | [NATOPS 1.7 (LSO, "limited to six"), 5.1.2 item 4, 5.2.2 step 9]; CNATRA 3740.9D; positions [EST] |
| **Crash & salvage line crew** (red; supervisor + 2) | "Stationed at a **predesignated area** for immediate response". In practice this is starboard, aft of the island by the junkyard: **about (400-440, +20 to +40)**. | Responds to a crash or disabled aircraft with equipment. | [NATOPS 3.4.2 Note]; position [EST] |
| **Tilly** (crash crane) | Junkyard, aft of the island, inboard of elevator 3: **about (380, +60)**. Started, warmed up and "remain[s] running throughout the recovery". | Moves only if a jet can't be towed. | [NATOPS 3.4.2 item 5]; position from 01 [EST] |
| **P-25 MFFV** (mobile firefighting vehicle; driver + 2 rescue) | Manned for every recovery. Parked inside the safe-parking line on the starboard side, nose toward the landing area, typically by the island at **about (440-480, +15 to +25)**. | Drives to the jet on a crash or fire. | [NATOPS 3.4.2 Note, 5.2.1 item 4 (all mobile equipment inside the safe-parking line)]; position [EST] |
| **Hot-chocks crew** (2 crash & salvage crewmen with chocks + a tractor driver with a hot tractor and tow bar) | "Located for **immediate access to the landing area**". Starboard, just inside the safe-parking line, out of the street taxi path: **about (430-460, +30)**, next to the crash line crew. | Chock or tow a jet with failed brakes or one that has to be pulled out of the gear. | [NATOPS 7.4 Note]; position [EST] |
| **Blue-shirt chock and chain teams** (2-3 per team) and **plane captains** (brown) | "Aircraft handling crews shall **stand by in designated areas** during recoveries". Each team waits at the edge of its assigned spot, on the bow (x 880-1060), the six-pack (560-690, +5 to +48), the crotch, the finger or the street, about 15-20 ft clear of the wingtip path and usually on the deck-edge side. | Close in on the jet's final stop, chock it and put on the initial tiedowns. The plane captain adds tiedowns up to the intermediate requirement. | [NATOPS 7.4 item 6]; positions [EST] |
| Everyone in the starboard catwalk or at the deck-edge control station | | Duck "behind cable shields or below flight deck level" at each touchdown. Nobody turns their back on a landing jet. | [NATOPS 5.1.2 items 5-6, 5.2.3 step 1] |

---

## Simulation implications

1. **Fix the side errors now.**
   - AG deck-edge operator: starboard catwalk aft, about (240, +98).
   - Catapult deck-edge operators: cat 1 in the starboard bow catwalk; cat 2 in the port bow catwalk; cats 3 and 4 in the port waist catwalk outboard of cat 4.
   - Waist ICCS bubble: move from (450, -100) to between cats 3 and 4, about (440, -55).
   - Bow bubble: between cats 1 and 2, about (785, 0).
2. **Port catwalk during recovery holds the LSO team only.** At most 6 figures on the platform. If cat 2 is launching in deck-edge mode at the same time, also show the cat 2 deck-edge operator and JBD operator.
3. **Lateral clearance rule.** At the shot, every figure around a cat jet except the centerdeck operator must be at abs(v) >= 25 ft from the track (or forward of the nose) and crouched. Use this as an assertion in the layout code.
4. **Choreography around the nose gear** (local u/v in feet). The TSPO and holdback man start at v = 0 under the nose; the TSPO exits last. The director starts at u +35, v 0, and then everyone moves out to about abs(v) 28.
5. **Waypoints per role per phase.** Each crew figure gets a waypoint for phases A-E (launch) and for the recovery states clear, trap, stop, wire clear, retract, taxi out. Tween between waypoints over 1-3 s; hook runners and the gear puller sprint at about 15-20 ft/s.
6. **Recovery idle positions.**
   - AGO: starboard foul line abeam the wires.
   - Hook runners: crouched at the starboard foul line near x = 480-560.
   - Gear puller: forward at about (660, -35).
   - Crash line crew, hot-chocks tractor, P-25 and Tilly (engine running): clustered starboard aft of the island, inside the safe-parking line.
   - Blue shirts: waiting at the spots where recovered jets will park.
7. **Gate on events.** Hook runners and the gear puller enter the landing area only after the jet's speed is 0. Retraction starts only after the hook runner's "retract" signal and once he is clear of the cable bite.
8. **Catwalk figures duck** at each touchdown and each catapult fire. Render them smaller or faded at those moments.
9. Label every [EST] coordinate in the code. They satisfy the NATOPS rules but are not measured.

## Open questions

- No public source gives measured crew distances. All feet are estimates; checking against overhead DVIDS or Smarter Every Day frames would refine them.
- The exact bow bubble position relative to the cat 1 and cat 2 batteries. Why are cat 2's power lights at the deck edge rather than on the bubble? Possibly a fore-aft stagger of the cat 2 battery.
- The exact parking spots for the P-25 and hot-chocks crew vary by ship and air boss. NATOPS says only "predesignated" and "immediate access".
- Whether the shooter or CSO works from the inboard side (toward the bubble) or the outboard side of cat 4 varies. NATOPS says only "vary his position" so the pilot can see him.

## Sources

- NAVAIR 00-80T-120, CVN Flight/Hangar Deck NATOPS Manual (15 Dec 2010), sections 1.7, 3.4.2, 4.1, 4.4-4.6, 4.11.6, 5.1.2, 5.2.1-5.2.3, 7.4, 11.1: https://www.mnvdet.com/CV/References/USNavy-CVN-FlightDeck.pdf
- NAVEDTRA 14310, Aviation Boatswain's Mate E, ch. 3 (deckedge control station "starboard side aft"; hook runners approach "from the front and side"): https://www.globalsecurity.org/military/library/policy/navy/nrtc/14310_ch3.pdf
- NAVEDTRA 14310, ch. 4 (catapult deckedge control panel "in the catwalk outboard of the associated catapult"; ICCS controls two adjacent catapults, console facing aft; suspend light outboard): https://www.globalsecurity.org/military/library/policy/navy/nrtc/14310_ch4.pdf
- tpub mirror of the ABE pages (deckedge control station, topside and deckedge areas): https://navyaviation.tpub.com/14001/css/Deckedge-Control-Station-80.htm , https://navyaviation.tpub.com/14310/css/Topside-And-Deckedge-Areas-130.htm
- Trafficnews.jp, ICCS on Nimitz-class (between cats 1/2 and 3/4; from CVN-73, retrofitted to CVN-68 to 72): https://trafficnews.jp/post/664675
- DVIDS, "Shooter ... test fires catapult from bow bubble, USS Nimitz" (2020): https://www.dvidshub.net/image/6295115
- Naval Safety Center, Flight Deck Awareness (AG Topside PO "stationed in the catwalk"; LSO portside aft): https://www.airpac.navy.mil/Portals/53/Flight%20Deck%20Awareness%20V2.pdf
- DVIDS, "Eyes on Deck" (P-25: 750 gal water, 60 gal AFFF, 3-person crew): https://www.dvidshub.net/news/255118/eyes-deck
- CNATRAINST 3740.9D (LSO platform manning: hook spotter, phone talker, LSOs, writer): https://navyflightmanuals.tpub.com/3740.9Dwch1&2&3&4/3740.9Dwch1&2&3&40036.htm
- Wikipedia, Landing signal officer (controlling and backup LSO roles): https://en.wikipedia.org/wiki/Landing_signal_officer
- Super Hornet dimensions (Wikipedia; VRS track data): https://en.wikipedia.org/wiki/Boeing_F/A-18E/F_Super_Hornet , https://forums.vrsimulations.com/support/index.php/Superbug_General_Aircraft_Information
- Deck coordinate frame: docs/research/01-deck-geometry.md (this project)
