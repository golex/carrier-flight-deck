# 08 — Edge Cases, Hazards, and the Rules That Constrain Movement

Scope: Nimitz-class CVN, jet aircraft only (F/A-18E/F, EA-18G). This file covers what makes the flight deck "dance" hard: night operations, emergencies, abnormal recoveries, and the safety rules that decide **where people and aircraft may and may not be at any instant**. Numbers are given where sources support them. Where a value is an estimate or comes from one weak source, it is flagged **(approx.)** or **(unverified)**.

---

## 1. Why the dance is hard (the constraints)

| Factor | Value | Notes / source quality |
|---|---|---|
| Flight deck size | ~1,092 ft long overall x 252 ft wide; ~4.5 acres | Navy fact file (length/width); "4.5 acres" widely repeated. "Most dangerous 4.5 acres in the world" is a popular saying, not an official term. |
| People on the deck | "Nearly a thousand Sailors" use the flight deck as a workplace across a fly day; **more than a hundred jobs going on at the same time** | Naval Safety Center, *Flight Deck Awareness* (4th ed.). A single cycle typically has ~150-250 people topside (approx.). |
| Engines running | During a launch/recovery transition, 15-25 jets may have engines turning at once (approx.: 12-20 aircraft per event launching, plus the previous event recovering) | Event size 12-20 aircraft (Wikipedia, Modern USN carrier air ops). |
| Wind over deck (WOD) | Typically ~25-30 kt down the angle for recovery; ship speed + natural wind. Example: 25 kt ship speed into 5 kt wind = 30 kt WOD | Multiple secondary sources agree on 25-30 kt. Launch WOD requirement varies by aircraft weight. |
| Noise | Measured on-duty levels up to ~127 dBA (Navy 24-h noise study); jet launch peaks higher. Verbal communication is impossible: **hand signals and wands only**; double hearing protection required | USUHS noise study; *Flight Deck Awareness*. 150+ dB claims are unsourced marketing. |
| Ship motion | Pitch and roll move the landing area (rough seas make the meatball hard to read); ship heels in hard turns | TWZ Case III article; 2025 Truman hangar-deck loss (see §11). |
| Cycle length | ~90 min typical (range 60-105 min); ~10-12 jets airborne per cycle at night | Airman manual (tpub 14014); Wikipedia; TWZ. |

### 1.1 Why launch and recovery are sequential, not simultaneous
- The Nimitz angled (landing) deck is offset ~9 degrees to port of the ship's centerline (commonly cited; the Wikipedia air-ops article says "about 10 degrees").
- **Waist catapults 3 and 4 lie inside the landing area.** Before every recovery the Arresting Gear Officer must confirm "the shuttle is retracted and the cover is in place on the No. 3 catapult" and that "catapult gear is clear of the landing area" (Airman manual, tpub 14014_247).
- The bow catapults (1, 2) are physically clear of the landing area, but during cyclic ops the bow is used as the parking area ("the pack") for recovered jets and for the next event's spotting, so standard cyclic practice is: **launch event N+1, then immediately recover event N**, then respot. The landing area must be completely empty for each trap.
- Consequence for the simulation: one cycle = [launch window ~15-20 min] then [recovery window ~20-30 min] then [respot/fuel/arm ~40 min], with no overlap of landing-area use.

### 1.2 Turning into the wind ("Fox Corpen")
- **Fox Corpen** = the ship's planned course for flight operations (the course that puts the required WOD straight down the angled deck). It is broadcast to aircraft and the strike group. ("Corpen" = course; "Fox" = the flag signal historically flown for flight ops.)
- The ship turns to Fox Corpen just before the launch/recovery window and may turn away between cycles to regain station. For recovery, the ship's heading is offset from the wind so the wind runs **down the angle** (about 9-10 degrees right of the bow), with minimal crosswind.
- The ship cannot turn during a recovery (TWZ Case III article): heading changes are made between recoveries or with the deck red.
- **Heeling:** a 100,000-ton carrier at 25-30+ kt heels noticeably in a hard rudder turn (several degrees, approx.; no published figure found). Hard-turn warnings must reach every crew moving aircraft, and every aircraft not being moved must be chocked and chained. See the April 2025 Truman loss (§11).

---

## 2. Deck status: who says the deck is "green" or "red"

### 2.1 Pri-Fly and the rotating beacon
- The **Air Boss** (Air Officer) in Primary Flight Control (Pri-Fly, high on the aft island) controls flight-deck status.
- A **rotating beacon at the aft end of the island** shows deck status: **red** = landing and takeoff prohibited; **green** = clear deck / cleared for landing ops (Airman manual; deck-status light conventions).
- Pre-recovery checklist run by the Arresting Gear Officer (AGO, "the Hook") before he calls *"Gear manned and ready; need a green light from Pri-Fly"* (Airman manual, tpub 14014_247):
  1. Catapult gear clear of the landing area.
  2. No. 3 catapult shuttle retracted, cover in place.
  3. Sheaves up in the aircraft area.
  4. Fresnel lens (FLOLS/IFLOLS) on, or MOVLAS rigged.
  5. Barricade hatch clear; a tractor hooked to the stowed barricade in case it is needed.
  6. Green rotating beacon on.
  7. **All aircraft clear of the foul (fouled-deck) line.**
  8. Arresting gear crews manned and ready.
  9. LSO platform manned and ready.
  10. Gear set for the first aircraft (weight setting).
  - Plus, for angled-deck elevator ships: stanchions down, removable coamings stowed, elevators up and locked.
- Only then does the ship (already on Fox Corpen) get the Boss to switch the beacon **red to green**.
- For launches: the catapult officer (shooter) cannot fire without a **Pri-Fly "GO" light** on his console (ABE manual, tpub 14001_210).

### 2.2 Clear deck vs. foul deck (per trap)
- **"Clear deck"** for each landing requires: previous aircraft taxied clear of the landing area (behind the foul line), the hook released, the wire retracted and reset to battery, the next weight set, and deck checkers' confirmation that no people, FOD, or equipment are inside the landing area.
- **"Foul deck"** = anything in the landing area: a person, an aircraft or part of one (a wingtip or tail over the foul line counts), a tractor, a wire not retracted, a fouled arresting engine, or a lowered/raised barricade.
- The **Deck Status LSO** (one of the LSO team on the platform) watches deck status. The controlling LSO **holds the pickle (light switch) overhead while the deck is foul** and lowers it when the deck goes clear (LSO article, Wikipedia).
- **Foul-deck wave-off timing rules** (Wikipedia LSO; derived from CV NATOPS):
  - People or aircraft **in** the landing area: the wave-off must come early enough that the aircraft passes **at least 100 ft above the highest obstacle**.
  - Deck foul but nothing physically in the landing area (e.g., gear not reset): wave-off must come in time for the aircraft to pass **no lower than 10 ft above the landing area**.
  - A "Foul Deck Wave-off" is not scored against the pilot.
- Typical clear-deck turnaround between traps: the recovery interval is **~45-60 s** (Case I ideal 50-60 s). The deck has ~35-45 s to go from "aircraft stopped in wires" to "clear deck" (approx.). If it takes longer, the next aircraft gets a foul-deck wave-off.

### 2.3 The foul line ("safe parking line")
- An **alternating red-and-white striped line running the length of the flight deck** separates the landing area from the rest of the deck: the "foul line" or "safe parking line" (Airman manual, tpub 14014_248).
- During recovery **no aircraft (including tail, nose, or wingtip) and no person may be inside it** unless their job requires it (arresting-gear crew, hook runner, gear puller, crash crew at their stations in the catwalks).
- Safe-shot lines exist for catapults too. Rule: "**Stand clear of safe-park and safe-shot lines when flight operations are in progress**" (*Flight Deck Awareness*).
- Recovered aircraft are taxied **out of the landing area across the foul line within seconds**, typically forward and to starboard toward the bow, or into the "six-pack" area near the island. Arming/dearming is done with the nose pointed over the side.

---

## 3. Rules of movement (personnel)

From the Naval Safety Center *Flight Deck Awareness* guide and Airman/ABE manuals:

**Distances**
- Stay **at least 25 ft from all intakes** (and propellers).
- Avoid jet exhaust by **at least 150 ft when possible**.
- (Student study-guide figures for the F/A-18: intake danger radius 25 ft at idle; exhaust hazard to ~850-925 ft at max power. Unverified, but they show the order of magnitude.)
- Jet blast can blow a person down and **over the side**. Four Sailors were blown overboard or into the deck-edge nets in one year (early 2000s). If blown down, **do not stand up**: grab a padeye or tiedown and hold on.

**Where you may not be**
- Never walk in front of a **tensioned aircraft** on a catapult. "At no time are personnel to walk in front of a tensioned aircraft." Stay clear of the shuttle track during no-load (dead-load) firings (ABE manual).
- **Don't cross behind jet blast deflectors while aircraft are at high power** and ready for launch.
- Crossing a catapult track while a jet is in tension or at power is a recorded mishap pattern: a Sailor ran across Cat 2 as the jet was commanded to combat power, and the launch was immediately suspended (Naval Safety Command, *Approach* Vol. 65 No. 2).
- Don't walk onto the flight deck via the **bow catwalks during launches** or via the **port catwalk during recoveries**.
- **Never turn your back to the landing area during recovery**, or to aircraft taxiing out of the gear.
- Don't stand near arresting-gear wires during recovery or gear maintenance.
- Don't be on the **outboard side** of a taxiing or towed aircraft (the side toward the deck edge).
- Don't pass under tailhooks, drop tanks, or moving aircraft. Don't walk in front of aircraft while forward-firing ordnance is being armed or dearmed.
- Don't cross elevator stanchions while raised. Don't stand in front of a "huffer" (start cart) exhaust.
- **Assume engines are turning if someone is in the cockpit.** Avoid intakes and exhausts, especially at night.
- Enter the flight deck **from behind the starboard side of the island**.
- If you have no job topside, **stay below**. During landings, all hands not involved clear the flight deck, catwalks, and gun tubs.

**Directors and pilots**
- Only one director controls an aircraft at a time; others signal it only to avert an accident.
- The director must be in plain view of the pilot. **If the pilot loses sight of the director, the pilot must stop immediately.**
- Control passes hand-to-hand between directors across the deck. The handoff is an explicit signal: the outgoing director points to the next director.
- Wing walkers, tail walkers, and chockmen escort every tow move. Never move an aircraft when clearance is in doubt.
- Don't spot, tow, or taxi a folded-wing aircraft immediately behind a JBD while another aircraft is at high power on that catapult.

**Required personal gear ("six items")**: cranial helmet with reflective strips, goggles, MK-1 float coat (auto-inflating, with light and whistle), steel-toe boots, colored jersey with sleeves down, gloves. Plus double hearing protection.

---

## 4. Jet blast and the JBD

- Each catapult has a **jet blast deflector (JBD)**: hydraulic panels that rise from the deck behind the jet once it taxis onto the catapult, deflecting exhaust upward. When lowered they are flush and aircraft and people can cross them.
- Panels are **water-cooled by seawater**. Panel cooling time between afterburner launches sets a floor on the per-catapult launch interval (patent literature). The usual per-cat cycle is ~60-120 s (approx.).
- **JBD operator** (green shirt, catapult crew) raises and lowers the JBD for each aircraft and must confirm no person or aircraft is fouling the panels' range of motion before moving them. This is a hazardous position. Navy SBIR N08-1 sought to remove the JBD and weight-board operators from it.
- Sequence: the jet taxis over the lowered JBD, then onto the shuttle. **The JBD goes up once the jet's exhaust is clear of the panels**, and must be up before tension and power. The next jet waits **behind the JBD**, often with crew working right behind the panels. After the shot, the JBD lowers and the next jet moves forward over it.
- The topside safety petty officer and catapult director each verify "appropriate jet blast deflectors are raised and all personnel clear of jet blast" before tension (ABE manual).
- Jet blast still sweeps the deck at the waist and bow, and blast from jets taxiing or turning in the pack is a constant hazard. A turning jet's exhaust can sweep people, tow bars, chocks, and FOD around.

---

## 5. Catapult hazards (shuttle, suspend, "no talking")

- Once the deck-edge operator presses tension, the words "**TAKING TENSION**" are the **last words spoken until the launch is complete**, so that "fire", "misfire", and "hangfire" can't be confused (ABE manual).
- The catapult director passes control to the shooter by **pointing both hands toward the catapult officer** after tension is confirmed.
- Shooter's full-power signal (day): two fingers overhead, then rapid rotation. The pilot goes to MRT, or afterburner if lights indicate. The military-power light is **green**; the combat (afterburner) power light is **amber**.
- **Suspend**: if anything is wrong, the catapult safety observer signals suspend. At night the shooter holds a **red wand high overhead** and turns the green wand off. Red flashing SUSPEND lights come on along the deck. The pilot **must stay at full power and ready** until given "untension" and then "throttle back". The shooter physically steps in front of the aircraft to give "throttle back" only after positively confirming the shuttle is forward of the launch bar.
- A pilot who wants to stop the launch shakes his head "no" (never thumbs down, which could be mistaken) and transmits "SUSPEND, SUSPEND". At night he simply **does not turn his lights on**.
- **Hangfire** (the catapult fails to fire after the fire button) and **cold shot** (the cat fires with insufficient end speed, so the aircraft goes off the bow too slow) are recognized emergencies. A cold shot often ends in ejection off the bow.
- Brakes applied during the stroke can blow a tire (T-45 CQ manual warning).
- The shuttle moves at ~150+ kt. No one is forward of a tensioned aircraft or on the track during a no-load shot.

---

## 6. Night operations

### 6.1 Case III
- **Case III applies at night (from 1/2 hour after sunset to 1/2 hour before sunrise) and whenever weather is below Case II minima** (ceiling < 1,000 ft or visibility < 5 nm) (Navy weather criteria table; Wikipedia).
- **Launch**: minimum **30 s interval** between launches. Each jet climbs straight ahead, then flies a 7 nm / 10 nm arc departure.
- **Marshal**: each aircraft holds at its own altitude on a radial behind the ship. Example from TWZ: 240 radial, 21 nm, 6,000 ft. The common rule of thumb is distance = altitude in thousands + 15 nm, with 1,000 ft separation (Wikipedia: marshal ~150 degrees relative to the base recovery course, 6-min left-hand racetrack).
- **Push**: aircraft leave marshal **1 minute apart** on exact "Expected Approach Times". Pushing late interferes with everyone behind.
- **Descent**: 250 kt, 4,000 fpm to 5,000 ft ("platform"), then 2,000 fpm. Level at **1,200 ft by 10 nm**. Dirty up (gear, flaps, hook) by ~8 nm. 150 kt at the 6 nm fix.
- **Glideslope**: intercept ~3 nm (begin ~700 fpm descent). Without other aids: 1,200 ft at 3 nm, 860 ft at 2 nm, 460 ft at 1 nm, ~360 ft at the ball call (Wikipedia). Approach aids: ICLS "bullseye", ACLS (Mode I coupled to touchdown, Mode II needles), laser lineup system.
- **Ball call at 3/4 nm**: CATCC hands off to the LSO, the pilot calls "[side number], Rhino/Hornet/Growler ball, [fuel state]". About **15-20 s to touchdown**.
- **Interval at the ramp**: one jet per ~60 s+ (1-minute push spacing produces ~1-min landing spacing). That gives the deck about the same ~45-60 s to clear and reset as in day, but in the dark.
- Bolter and wave-off at night: climb straight ahead to **1,200 ft**, then CATCC vectors the aircraft back into the **bolter/wave-off pattern** (a racetrack downwind at 1,200 ft) to re-intercept final. That takes ~4-6 min per extra pass (approx.).

### 6.2 Deck appearance and light discipline at night
- Darkened ship. From the air, the carrier shows only a small **outline of the landing area** (edge lights), **centerline lights**, a vertical row of **drop lights** hanging off the stern below the centerline (lineup aid), and a few lights near the island (TWZ; drop line diagram). Red floodlighting is used on deck to protect night vision. White light is restricted.
- **Pilots**: before launch, all exterior lights are off. After full power and checks, **the pilot turns the navigation/exterior lights ON (steady) instead of saluting**: that is the "ready to launch" signal. Not turning the lights on = "suspend" (ABE manual, tpub 14001_210).
- **Wands**:
  - Aircraft directors (yellow shirts): **2 amber/yellow lighted wands**.
  - Catapult officer / catapult safety observer: **1 green + 1 red wand**. **Night launch signal**: green wand raised vertically overhead; wait 2-3 s for the pilot to put his head against the headrest; check the deck forward is clear; **sweep the wand in a wide arc, touch the deck, and point forward (in the direction of launch)**. The catapult fires ~1-2 s later. **Launch off/suspend**: red wand high overhead, green wand off.
  - Other crews use green wands (catapult/arresting crew, hook runners) and red wands for crash crews and "stop" signals (approx.: assignment varies by role; follow the NATOPS signals manual NA 00-80T-113).
- **Signal reading errors at night** are a known mishap pattern: one Safety Command report describes a crewman misreading a wand signal during a night recovery.
- Danger: a jet's engines may be turning without anyone seeing exhaust, so "assume engines are turning if someone is in the cockpit" and avoid intakes and exhausts "especially at night".

### 6.3 Optical landing aids at night (Fresnel lens / IFLOLS)
- Located on the **port side, roughly abreast of the landing area** (forward of the LSO platform).
- **Meatball ("ball")**: a bright amber (or red when very low) light that appears above or below a horizontal row of **green datum lights** (on FLOLS, 6 per side). Ball centered = on glideslope. The glideslope angle is typically ~3.5 degrees (commonly cited; varies 3-4 degrees with WOD and aircraft type).
- **Wave-off lights**: flashing **red**, vertical on each side of the lens, triggered by the LSO's pickle. They are **mandatory**: the pilot must go around.
- **Cut lights**: **4 green lights** above the lens box. In jets they mean "roger ball"/"cleared", "add power", or "divert" depending on timing and pattern. With radios silent (zip-lip/EMCON), cut lights are the LSO's way of saying "you're cleared".
- At night the ball is the pilot's only glideslope reference inside 3/4 nm. In heavy seas the lens may not stabilize, and the LSO switches to **MOVLAS** (manually operated backup) or talks the pilot down.

---

## 7. Abnormal recoveries

### 7.1 Wave-off
- Ordered by the LSO (radio "Wave off, wave off" plus flashing red lights), for an unsafe approach or a **foul deck**.
- Pilot: **full power (afterburner if needed)**, level wings, climb straight ahead or slightly right parallel to the angle, then up to 1,200 ft into the bolter/wave-off pattern (day: re-enter the downwind at 600-800 ft per the Boss's direction).
- Deck crew: nothing changes on deck except that the next aircraft's time slot is used up. Arresting gear stays set. If the deck was foul, the crew keeps clearing it.

### 7.2 Bolter
- **Bolter** = the hook misses all wires (or skips). The pilot went to **full military power at touchdown** (standard technique: throttles to MIL on touchdown and hold until the jet stops), so the jet simply flies off the angled deck's end. LSO call: "Bolter, bolter, bolter."
- The jet climbs straight ahead to 1,200 ft and rejoins the pattern (night: CATCC vectors). Graded 2.5 points, but it counts against the boarding rate.
- Deck crew: **no wire to retract**, so the landing area is quickly clear again.
- Most bolters come from landing long, past the last (#4) wire. Wires are ~**35-40 ft apart** on Nimitz-class (sources vary; Wikipedia's "about 20 ft" figure for the tailhook is inconsistent with Navy figures; treat as unverified). The target wire is **#3** on 4-wire ships (#2 on 3-wire ships).

### 7.3 Hook skip
- **Hook skip bolter**: the hook touches down in the wire area but **bounces over the wires** instead of engaging. The LSO calls "Hook skip bolter." It is not the pilot's fault if the approach was good.
- Causes: hook dampener problems, the hook striking at a bad angle, or landing flat. Repeated hook skips can trigger a hook inspection or, if the hook is damaged, a **barricade** recovery.

### 7.4 Wire (cross-deck pendant) failure: the 2016 Eisenhower and 2005 Kitty Hawk accidents
- **18 March 2016, USS Dwight D. Eisenhower (CVN 69)**, pre-deployment carrier quals off Virginia. An **E-2C Hawkeye** (VAW-123), not a Super Hornet, caught the **#4 wire**. The cable parted on its left (port) side. The aircraft rolled off the end of the angled deck and dropped toward the water, recovering at **10-20 ft above the water**.
  - The parted cable **whipped across the deck, hitting 8 Sailors** (injuries from lacerations to broken bones and a fractured skull; 6 airlifted to hospitals) and damaging a parked C-2 and an MH-60S (>$200,000 damage).
  - Cause: the #4 arresting engine had shown an error code earlier that day. Maintainers skipped one or two steps in an overly complicated procedure and the system was mis-programmed, so the engine could not absorb the energy and the load went into the cable (Navy Times investigation report).
- **29 January 2005, USS Kitty Hawk**: an F/A-18F (VFA-102) caught the **#3 wire**, which **parted in two places**. The jet went over the side (both crew ejected and were recovered). **Six deck personnel injured**, two seriously, including one whose leg was severed below the knee (unverified forum repost of a Navy release). The wire was reportedly set for a different aircraft weight.
- **May 2025, USS Harry S. Truman**: an F/A-18F (VFA-11) went over the side after a night arrestment failure. The investigation cited high op tempo, understaffing, and arresting-gear operator error.
- Lesson for the sim: **during each trap, everyone near the landing area is exposed to a snapping wire.** This is why non-essential people are cleared from the landing area, catwalks, and gun tubs, and why the remaining crew (hook runner, gear puller, deck-edge operator) stand at fixed positions mostly in the catwalks or well forward. The **weight setting** for each aircraft (set by the arresting gear engine operators below deck from the pilot's/LSO's reported type and fuel) is a critical step.

### 7.5 Barricade
- **What**: an emergency nylon net (upper and lower horizontal load straps with vertical engaging straps) about **20 ft high**, stretched between **two stanchions** that rise hydraulically from recesses on each side of the landing area. Energy goes through purchase cables to a dedicated arresting engine. It is stored in a deck hatch.
- **When**: the aircraft **cannot make a normal arrested landing**, e.g., tailhook won't lower or is damaged (repeated hook skips), landing gear won't extend or is damaged, battle damage, **and the aircraft cannot divert** (no tanker gas or no divert field: blue water). It is a last resort. Typically single-use: the webbing is cut and replaced.
- **Rigging time**: Navy release (USS Enterprise, 2010): **18 Sailors, ~5 minutes**. Best-case training figures of **under 3 minutes** are quoted elsewhere. Rigging is drilled frequently.
- **Sequence**: Boss calls away "Rig the barricade". **Recovery suspended (deck red)**. Wires #1-4 may be de-tensioned or left. Tractor pulls the barricade package out of its hatch. Crew stretches the webbing across the landing area and raises the stanchions. The aircraft is held overhead or on the tanker meanwhile. It flies a straight-in approach and engages the net. Crash crew is staged. Afterwards the aircraft is cut free and moved (often by Tilly), and the barricade is struck and the deck cleared. **Total deck downtime is often 20-30+ min** (approx.).
- Personnel must keep clear of the stanchion area when raising or lowering cables and webbing.

### 7.6 Hung ordnance
- A weapon that failed to release ("hung") or a store with a questionable status. The pilot reports it before recovery. The aircraft may be recovered last, with a specific approach and a deck plan.
- After landing, the jet is **normally safed after taxiing clear of the landing area** (Air Boss may order it safed in the landing area). The dearming supervisor tells the director which aircraft needs safing. The jet is pointed **with its nose/weapon over the side**, with the area in front clear of personnel and aircraft, while red-shirt ordnancemen and possibly EOD safe it (Airman / ordnance manuals).
- Forward-firing ordnance jets always go to the arming/dearming spot with nothing in front.
- On the deck: red shirts and EOD swarm the jet, directors hold it, and other traffic routes around it.

### 7.7 Tire blowout / hot brakes
- **Blown tire on landing**: the jet will yaw hard toward the blown tire. Arrestment is strongly recommended (T-45 CQ manual). Afterwards the aircraft may need towing; it may stay in the landing area (**foul deck**) until crash and salvage move it, with Tilly if needed, delaying the recovery.
- **Blown tire on the catapult**: if the brakes are applied during the stroke.
- **Hot brakes**: after heavy braking (aborted launch, long taxi, brake failure), brakes and wheels overheat. Risk of wheel fusible plugs releasing or tire/wheel explosion, which **fragments sideways in line with the axle**, so crash crew approach **from fore or aft, never from the side** (general aviation and USAF guidance; carrier-specific text not found). The jet is parked in a clear area, crash crew (red shirts, P-25 fire truck) stand by, and cooling is natural or with agent. On a carrier this ties up a spot and a crash crew during the cycle.

### 7.8 Other recovery-area emergencies
- **Ramp strike / hard landing / gear collapse** → aircraft stops in the landing area → **foul deck**. Crash crew and Tilly respond. Airborne jets go to the tanker or divert.
- **Fire on deck** ("Fire, fire, fire on the flight deck!"): red shirts with the **P-25 fire truck** (AFFF/Halon) and hose teams from deck-edge AFFF stations (marked by 18-inch green stripes on the coaming). Every person is a first responder.
- **C-2 into the port catwalk** (2003) and **E-2D landing that struck 4 parked Super Hornets** (2019) show recovered aircraft veering out of the landing area into parked jets and catwalks. That is why parking is controlled precisely relative to the foul line.

---

## 8. Crash and salvage, and "Tilly"

- **Crash and salvage team** (red jerseys, ship's company ABHs under the **Air Bos'n**, the Crash and Salvage Officer, who wears a yellow jersey): the flight deck's fire department and rescue team. They operate the P-25 mobile firefighting vehicle and Tilly. During every launch/recovery they are **manned up**, typically positioned near the island/at the foul line with the P-25 truck, in silver proximity (hot) suits for rescue (approx. positioning).
- **Tilly** (A/S32A-35A CVCC, "carrier vessel crash crane"): main hoist **75,000 lb**, auxiliary hoist 10,000 lb; crane weight **~133,500 lb**. The name comes from its **tilting boom**. **Two qualified operators** must be in the cab when operating. It is parked on the flight deck **between the island and the radio/mast area** (starboard side, near the island) (DVIDS "Let's Talk About Tilly").
- "Aircraft can't come aboard without her": **if Tilly is down, flight ops stop** (carriers need the means to clear a crashed aircraft from the landing area).
- Salvage sequence: fire out → crew rescued → aircraft lifted or dragged clear of the landing area (Tilly, tractors, or as a last resort **pushed over the side** to reopen the deck when aircraft are low on fuel overhead).
- Crash crew also free a cable or manually raise a hook if a tailhook won't retract (Airman manual).

---

## 9. Man overboard (MOB)

- Anyone who sees someone go over the side shouts "**Man overboard, [port/starboard] side!**", throws a life ring or smoke float, and points continuously at the person. The bridge sounds the alarm and announces "Man overboard, man overboard, [side]", followed by **six or more short blasts** (approx.; standard Navy practice).
- The **plane guard helicopter** (an HSC MH-60S that is airborne or on alert during flight ops, operating within **20 nm by day / 10 nm at night**) is vectored to the person. A plane guard escort ship may also respond.
- **Muster**: all hands report to their muster stations so the missing person can be identified. A full ship muster takes **~10-20 min** (approx.).
- During flight ops, a MOB can **suspend launch/recovery** (deck red), and the ship may maneuver.
- Example (*Flight Deck Awareness*): a squadron green shirt was blown off the deck by an F/A-18's exhaust ("the Hoover"), over the nets. Nobody on the flight deck saw it. A chief on a sponson called away the man overboard, and a helo recovered him; he was back in the ready room **in under an hour**.
- The float coat (auto-inflating, with strobe light and whistle) is why flight-deck crew survive the fall (~60 ft from deck to water).

---

## 10. Fuel emergencies and the recovery flow for emergency aircraft

### 10.1 Terms
- **State**: fuel in thousands of lb ("state 6.5" = 6,500 lb). Fuel is checked about every 10 min in marshal.
- **Joker**: a planned fuel at which the pilot ends the mission and heads back (approx.: prebriefed above bingo).
- **Bingo**: the minimum fuel to divert safely to the nearest suitable field. Reaching bingo is an emergency. With a usable divert field within ~**200 nm**, the carrier runs **"Bingo ops"** (CNATRA glossary). Example (TWZ): state 2.6 with 2.4 needed to reach NAS North Island means there isn't enough for another pass.
- **"Trick or treat" ("bingo on the ball")**: the aircraft has fuel for **exactly one more approach**. If it doesn't trap ("treat"), it **must bingo** to the divert field ("trick") (CNATRA glossary; F-14 RIO glossary).
- **Blue water ops**: no divert field in range. Every aircraft must get aboard. The **recovery tanker** (an F/A-18E/F with a buddy store, overhead at ~1,500-3,000 ft (approx.)) is the fuel safety net. A tanking evolution takes 2-3 min and gives enough fuel for 1-2 more passes (TWZ). With no tanker and no divert field, the **barricade** is the last resort before ejection near the plane guard.

### 10.2 Flow for a low-fuel aircraft
1. Pilot reports state. CATCC and the Air Boss track all fuel states.
2. Low-fuel aircraft may be moved up in the landing order ("priority") or put in the pattern first.
3. If it bolters or waves off: CATCC vectors it around. If fuel allows, another pass. If at the tanker threshold ("tank" call), it is sent to the recovery tanker ("hawking" overhead). If at bingo and Bingo ops: "**Bingo, bingo**", climb on bingo profile, divert.
4. "Trick or treat" pass: if it traps, done. If not, divert.
5. Blue water with fuel critical and the deck foul for a long time: Boss may order deck cleared by any means (including jettisoning a wreck) or rig the barricade.

### 10.3 Other emergency aircraft
- **Emergency aircraft** (hydraulic failure, single engine, hook problem, battle damage, hung ordnance) are generally recovered **last** (so a crash doesn't strand others airborne) or **first** if fuel or the emergency requires. The Boss and CAG representative decide.
- Single-engine approach: higher speed, so the weight setting changes.
- A suspected hook failure is checked by a fly-by. If confirmed, the aircraft diverts or goes to the barricade.

---

## 11. Hot operations (engines running)

- **Hot refueling ("hot pump")**: purple shirts ("grapes") refuel a jet with engines running, typically **after recovery** when the jet will relaunch in the next event (common in CQ, and in cyclic ops to save start-up time). The pilot stays in the cockpit. Plane captain and grape at the single-point refuel receptacle; crash crew aware; no ordnance loading at the same time (approx.: carrier-specific NATOPS text not found; hot-pit refueling is documented for F/A-18s ashore and for Navy squadrons at USAF bases).
- **Hot seat (hot switch) crew swap** (documented for carrier quals): with the aircraft **chocked and chained**, the outgoing pilot safes the ejection seat, sets the **throttle to IDLE with friction locked**, sets the parking brake, unstraps, opens the canopy on the plane captain's signal, and climbs down. The new pilot climbs in "as quickly as practical". **A FOD screen must be installed over the intake** next to the boarding ladder before the swap (T-45 CQ manual, P-1211; F/A-18 left-side boarding ladder is next to the left intake).
- CQ "hot pump and hot seat" cycles keep jets turning for hours: trap → taxi to a refuel spot → hot pump plus hot seat → taxi to cat → launch.

---

## 12. Edge-case timeline examples (for scripting)

**A. Foul-deck wave-off**
- t=0: Jet A traps on #3. t+3 s: stops ~340 ft past the wire (Super Hornet rollout ~300-350 ft (approx.)).
- t+5 s: Gear puller signals the hook up; the jet rolls back slightly to drop the wire.
- t+10 s: Hook runner checks the wire is free; jet taxis forward toward the foul line under director control.
- t+15 s: Next jet B calls the ball at 3/4 nm (~18 s to touchdown).
- t+20 s: Jet A's tail still inside the foul line (tractor in the way). Deck status LSO: "Foul deck." Controlling LSO holds the pickle overhead.
- t+28 s: Jet B ~1/4 nm out: LSO hits the wave-off lights ("Wave off, foul deck"). Jet B goes to full power, passes ≥100 ft over the deck obstacle, climbs to 600/1,200 ft, and re-enters the pattern (+3-6 min).
- t+30 s: Jet A clears the line; hook runner signals retract; deck-edge operator retracts the wire; "clear deck" at ~t+35-40 s. Jet C lands at its normal slot.

**B. Barricade recovery (hook failure, blue water)**
- Jet reports hook won't extend. Fly-by confirms. Tanker gives gas. Boss: "Rig the barricade." Deck red. ~5 min rig, 18 Sailors. Other airborne jets hold or tank. Straight-in approach. Engagement. Crash crew on scene within seconds. Jet cut free and towed/lifted clear (10-20 min). Barricade struck. Deck re-certified, then green.

**C. Bingo on the ball**
- Jet at state ~3.0 with bingo 2.4 calls the ball with "trick or treat" status. Bolter. LSO: "Bolter, bolter. Bingo, bingo." Jet climbs to the divert profile. The deck sequence continues with one fewer aircraft.

**D. Suspended launch at night**
- Jet at full power on Cat 1. Pilot sees a warning light and does not turn lights on. Safety observer signals suspend. Shooter holds the red wand overhead, green off. Red SUSPEND lights flash. Untension. Shooter walks in front and gives "throttle back". The jet is pulled off the shuttle and taxied clear. The JBD is lowered for the next aircraft. That cat loses ~2-4 min.

---

## Simulation implications

Model these explicitly; they are what convert "planes moving" into "a complicated dance":

1. **Global deck status**: `RED | GREEN` for recovery (an aft island beacon light rendered on the island) and per-catapult "GO" states. Recovery can't begin until a 10-item pre-recovery checklist completes (animate quickly: waist cat 3/4 shuttle stowed, aircraft behind foul line, barricade tractor attached, lens on).
2. **Per-trap `CLEAR` / `FOUL` landing-area state**, computed from geometry: any aircraft polygon or crew sprite (other than the authorized arresting crew in catwalks) inside the landing-area polygon, or the wire not retracted = FOUL. Show the LSO pickle state and the meatball/wave-off lights.
3. **Foul-deck wave-off logic**: if the deck is still foul when the inbound jet reaches ~1/4-1/2 nm (~8-12 s before touchdown), trigger a wave-off (red flashing lights, jet flies over and climbs away, re-enters the pattern in ~3-6 min).
4. **Sequential cycles**: no launches from waist cats 3/4 during recovery. Bow cats are typically idle or blocked by the parked "pack" during recovery. Launch window, then recovery window, then respot.
5. **Foul line and safe-shot lines** drawn on deck (red/white). Parking spots and taxi paths must respect them during recovery.
6. **Exclusion zones**: 25 ft intake circles and exhaust cones (150 ft "avoid", longer at MIL/AB) around every turning engine. Crew pathing must avoid them. JBDs block exhaust behind each cat when up.
7. **Catapult track lockout**: once "tension" is taken, no crew sprite may enter the catapult track or the area forward of the jet. If one does, trigger a suspend (red wand, flashing lights).
8. **JBD cycle**: lowered while the jet taxis over → raised before tension → lowered after the shot. Panel cooling sets a per-cat minimum interval (~60-90 s with AB).
9. **Night mode**: dark deck, red deck lighting, landing-area edge and centerline lights, drop lights, amber/yellow director wands, green/red shooter wands, pilot "lights on" ready signal instead of salute, Fresnel lens (amber ball + green datums + red wave-off + green cut lights), Case III 1-minute arrival spacing and 30 s minimum launch interval.
10. **Abnormal-event injector** (low probability per pass or user-triggered): bolter (~5-10% of passes), hook skip, wave-off (technique or foul deck), suspended launch, hung ordnance (dearm with nose over the side), blown tire (aircraft stuck in the landing area, crash crew plus Tilly), hot brakes (parked with crash crew approaching fore/aft), barricade rig (~3-5 min, 18 crew, deck red), wire parting (rare; whip arc across deck, why crew stand where they stand), man overboard (plane guard helo, deck red), fuel states with bingo / "trick or treat" / tanker.
11. **Crash and salvage presence**: red shirts with the P-25 truck staged near the island during recovery. Tilly parked starboard by the island.
12. **Ship context**: Fox Corpen turn into the wind before each window, WOD ~25-30 kt displayed. Optional small heel during the turn; aircraft chocked/chained unless moving.
13. **Communication constraint**: no speech. All coordination is shown as hand/wand signals between specific roles, with explicit director-to-director handoffs. If the pilot loses sight of the director, the aircraft stops.
14. **On-screen explainer hooks**: "Why can't they launch and land at the same time?", "What makes the deck foul?", "Why does everyone stay out of the landing area?" (2016 Eisenhower and 2005 Kitty Hawk wire failures), "What's a bolter / hook skip / trick or treat?".

---

## Sources

- Naval Safety Center, *Flight Deck Awareness*, 4th ed. (archived PDF): https://web.archive.org/web/2009/http://safetycenter.navy.mil/media/downloads/FlghtDckAware_CV_03.pdf (original listing: https://webarchive.library.unt.edu/web/20090814022730/http:/safetycenter.navy.mil/media/downloads/FlghtDckAware_CV_03.pdf)
- Airman manual (NAVEDTRA 14014), Landing Procedure (pre-recovery checklist, green beacon): https://navyaviation.tpub.com/14014/css/14014_247.htm
- Airman manual, Emergency Recovery Equipment / foul line: https://navyaviation.tpub.com/14014/css/14014_248.htm
- Airman manual, general flight deck safety precautions: https://navyaviation.tpub.com/14014/css/14014_273.htm
- ABE 3&2 manual (NAVEDTRA 14001), catapult safety precautions, night lights-on ready signal, suspend: https://navyaviation.tpub.com/14001/css/Safety-Precautions-210.htm
- ABE manual (14310), tension procedure ("TAKING TENSION" last word spoken): https://navyaviation.tpub.com/14310/css/Caution-194.htm
- CNATRA P-1211 (T-45 CQ) Hot Seat Procedures: https://navyflightmanuals.tpub.com/P-1211/Hot-Seat-Procedures-53.htm
- CNATRA P-1211 Catapult Procedures (blown-tire warning, throttle-back signal): https://navyflightmanuals.tpub.com/P-1211/Catapult-Procedures-Continued-56.htm
- CNATRA P-1211 Glossary ("trick or treat", Bingo ops 200 nm): https://navyflightmanuals.tpub.com/P-1211/Glossary-P-12110080-80.htm
- CNATRA P-1211 FLOLS component description: https://navyflightmanuals.tpub.com/P-1211/Component-Description-18.htm
- Weapons handling / hung ordnance: https://navyaviation.tpub.com/14313/css/Weapons-Handling-Procedures-336.htm
- Crash crane CVCC capacity: https://navyaviation.tpub.com/14014/css/14014_218.htm
- DVIDS, "Let's Talk About Tilly": http://www.dvidshub.net/news/438789/lets-talk-about-tilly
- Wikipedia, Modern United States Navy carrier air operations: https://en.wikipedia.org/wiki/Modern_United_States_Navy_carrier_air_operations
- Wikipedia, Landing signal officer: https://en.wikipedia.org/wiki/Landing_signal_officer
- Wikipedia, Optical landing system: https://en.wikipedia.org/wiki/Optical_landing_system
- Wikipedia, Tailhook (hook skip bolter): https://en.wikipedia.org/wiki/Tailhook
- Wikipedia, Plane guard: https://en.wikipedia.org/wiki/Plane_guard
- Wikipedia, Jet blast deflector: https://en.wikipedia.org/wiki/Jet_blast_deflector
- Navy SBIR N08-1 (JBD operator hazard): https://www.navysbir.com/08_1/35.htm
- The War Zone, "How to land a fighter on an aircraft carrier on a stormy night": https://www.twz.com/3559/how-to-land-a-fighter-on-an-aircraft-carrier-on-a-stormy-night
- Navy Times, "Horrific cable mishap caused by maintenance errors" (2016 Eisenhower): https://navytimes.com/news/your-navy/2016/07/14/horrific-cable-mishap-caused-by-maintenance-errors-navy
- Navy Times, "8 sailors injured in arresting cable accident on carrier Ike": https://www.navytimes.com/news/your-navy/2016/03/18/8-sailors-injured-in-arresting-cable-accident-on-carrier-ike/
- Stars and Stripes, 2005 Kitty Hawk F/A-18F cable accident: https://www.stripes.com/migration/pilots-sailors-recount-f-a-18-s-plunge-into-sea-from-flight-deck-of-kitty-hawk-1.31072
- Business Insider via Yahoo, Truman hard turn / F/A-18 lost from hangar (2025): https://www.yahoo.com/news/articles/us-aircraft-carriers-hard-turn-190836426.html
- USNI News, Super Hornet overboard after failed landing on Truman (2025): https://news.usni.org/?p=115853
- Migflug, carrier barricade explainer (secondary): https://migflug.com/afterburner/carrier-barricade-explained-nylon-net-aircraft-carrier/
- USS Enterprise barricade drill release (18 Sailors, 5 min): https://www.globalsecurity.org/military/library/news/2010/03/mil-100317-nns04.htm
- USNI Proceedings, "A safer way ships do plane guard" (helo 20 nm day / 10 nm night): https://www.usni.org/magazines/proceedings/2018/august/safer-way-ships-do-plane-guard
- USNI Proceedings, organic tanking / blue water: https://www.usni.org/magazines/proceedings/2019/october/stop-routine-organic-tanking-persian-gulf
- Navy weather criteria table (Case III at night): https://navyaviation.tpub.com/14342A/Table-11-4-Weather-Criteria-For-Departures-And-Recoveries-378.html
- Navy CATCC marshal procedures: https://navyaviation.tpub.com/14342A/Fixed-Wing-Aircraft-Marshal-Procedures-431.html
- Navy fact file, Nimitz class (1,092 ft; 252 ft): https://webharvest.gov/peth04/20041016160604/http:/www.chinfo.navy.mil/navpalib/factfile/ships/ship-cv.html
- Naval Safety Command, *Approach* Vol. 65 No. 2 (catapult track crossing, night wand misread): https://issuu.com/navalsafetycommand/docs/approach_vol65-no2/s/22880339
- Naval Safety Command hand signal charts: https://navalsafetycommand.navy.mil/Portals/100/Hand_signals-Chart2.pdf
- USUHS, "Living at Work: 24-hour Noise Exposure Aboard US Navy Aircraft Carriers": https://scholar.usuhs.edu/en/publications/living-at-work-24-hour-noise-exposure-aboard-us-navy-aircraft-car/
- Military.com, E-2D damages 4 Super Hornets (2019): https://365.military.com/daily-news/2019/08/20/e-2d-hawkeye-aircraft-takes-out-4-super-hornets-carrier-repairs-underway.html
