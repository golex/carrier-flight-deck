# Flight Deck

A top-down, to-scale schematic of one cyclic-operations cycle on a Nimitz-class aircraft carrier:
twelve jets launched off four catapults, twelve recovered (with a bolter and a foul-deck wave-off),
and the deck respotted for the next event. Every dot on deck is a person in a colour-coded jersey.

Static site: Vite + vanilla TypeScript + Canvas 2D, no framework.

Live: https://golex.github.io/carrier-flight-deck/ (deployed from `master` by the Pages workflow).

## Run

```
npm install
npm run dev          # http://localhost:5173
npm run build        # dist/ (index.html + about.html)
npm run typecheck
```

Deep links for testing: `?t=900&view=wires&zoom=2&nointro=1` (views: deck, bow, waist, wires, island).

## Layout

- `src/data/deck.ts` — measured deck geometry (feet; x forward of the ramp, y positive to starboard), slots, catapults, wires, stations.
- `src/sim/planner/` — the choreography. `toolkit.ts` holds the keyframe builders; `scenario.ts` the roster and times; `launch.ts`, `recovery.ts`, `respot.ts`, `ambient.ts` each build one part of the cycle into a shared `World`; `index.ts` assembles the `Timeline`.
- `src/sim/sample.ts` — samples any entity at a time (binary search over keyframes), which is what makes scrubbing free.
- `src/render/` — deck, aircraft silhouettes, crew, pattern inset, camera.
- `src/ui/` — side panel, transport bar, input, narration.
- `docs/research/` — the research notes; `00-DOMAIN-REFERENCE.md` is the consolidated reference the planner follows.
- `tools/` — `shot.mjs` (headless screenshots of the dev server), `tts.mjs` (narration clips, Azure Speech), `image.mjs`, silhouette generator.

## Credentials

`.env` is git-ignored and read only by `tools/env.mjs`. Nothing in the site itself needs a key.
