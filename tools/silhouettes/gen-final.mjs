// Generates the final F/A-18E / EA-18G plan-view silhouettes (feet; x fwd, y stbd, origin mid-length).
// Usage: node tools/silhouettes/gen-final.mjs <out.json>
import { writeFileSync } from 'node:fs'
const [,, out = 'tools/out/silhouettes/final.json'] = process.argv
const r = (v) => Math.round(v * 100) / 100
const fmt = (p) => `${r(p[0])} ${r(p[1])}`
const poly = (pts) => 'M ' + pts.map(fmt).join(' L ') + ' Z'
const mirror = (pts) => pts.map(([x, y]) => [x, -y])
const sample = (n, f) => Array.from({ length: n + 1 }, (_, i) => f(i / n))
/** half outline (nose -> tail along +y) => full symmetric outline */
const symmetric = (half) => poly([...half, ...mirror(half.slice(1, -1)).reverse()])

// ---------- planform constants ----------
const NOSE = 30.15
const LE_ROOT = [6.2, 3.5]           // wing leading edge at fuselage side
const TE_ROOT = [-9.8, 3.5]
const TIP_Y = 22.45, HINGE = 16.3
const LE_TAN = Math.tan((27 * Math.PI) / 180)
const leX = (y) => LE_ROOT[0] - (y - LE_ROOT[1]) * LE_TAN
const TE_TIP = -8.95                   // slight forward sweep of the trailing edge
const teX = (y) => TE_ROOT[0] + ((y - TE_ROOT[1]) / (TIP_Y - TE_ROOT[1])) * (TE_TIP - TE_ROOT[0])

// ---------- fuselage (nose, LERX, twin-engine body) ----------
const half = [
  // ogive radome 30.15 -> 21
  ...sample(16, (t) => [NOSE - 10.15 * t, 2.25 * Math.pow(1 - (1 - t) ** 2.2, 0.85)]),
  [18.2, 2.38], [16.2, 2.5],
  // LERX: concave flare from beside the windscreen out to the shoulder at the wing leading edge
  ...sample(12, (t) => [15.2 - t * (15.2 - leX(6.35)), 2.62 + 3.73 * Math.pow(t, 1.9)]).slice(1),
  [3.4, 6.2], [1.6, 4.85],
  // parallel-sided twin F414 nacelle block (~9.6 ft wide)
  [-6, 4.8], [-14, 4.8], [-24.6, 4.75], [-25.8, 4.45], [-26.5, 3.7], [-26.5, 0.6], [-27.1, 0],
]
const fuselage = symmetric(half)

// ---------- wing ----------
const wingInnerRpts = [LE_ROOT, [leX(HINGE), HINGE], [teX(HINGE), HINGE], TE_ROOT]
const RAIL_IN = 21.95
const rail = [[leX(RAIL_IN) + 1.6, RAIL_IN], [leX(RAIL_IN) + 2.05, 22.2], [leX(RAIL_IN) + 1.6, TIP_Y], [teX(TIP_Y) - 1.0, TIP_Y], [teX(TIP_Y) - 1.0, RAIL_IN]]
const panel = (yTip) => [[leX(HINGE), HINGE], [leX(yTip), yTip], [teX(yTip), yTip], [teX(HINGE), HINGE]]
const wingOuterE = [...panel(RAIL_IN).slice(0, 2), ...rail, ...panel(RAIL_IN).slice(2)]

// ---------- ALQ-218 wingtip pod (9 ft, 1.2 ft wide) ----------
const POD_IN = 21.25, POD_C = 21.85, POD_W = 0.6
const podNose = leX(POD_C) + 2.4, podTail = podNose - 9.0
const pod218 = (() => {
  const top = [
    ...sample(8, (t) => [podNose - 2.0 * t, POD_C + POD_W * Math.pow(Math.sin((t * Math.PI) / 2), 0.8)]),
    [podTail + 1.6, POD_C + POD_W],
    ...sample(5, (t) => [podTail + 1.6 - 1.6 * t, POD_C + POD_W * (1 - 0.7 * t * t)]).slice(1),
  ]
  const bot = top.slice(1, -1).map(([x, y]) => [x, 2 * POD_C - y]).reverse()
  return [...top, [podTail, POD_C - 0.18], ...bot]
})()
const wingOuterG = panel(POD_IN)

// ---------- ALQ-99 pod (13 ft, 1.8 ft wide) ----------
const pod99 = (xNose, yc) => {
  const w = 0.9
  const top = [
    ...sample(7, (t) => [xNose - 2.6 * t, yc + w * Math.pow(Math.sin((t * Math.PI) / 2), 0.7)]),
    [xNose - 10.6, yc + w],
    ...sample(4, (t) => [xNose - 10.6 - 2.4 * t, yc + w * (1 - 0.65 * t * t)]).slice(1),
  ]
  const bot = top.slice(1).map(([x, y]) => [x, 2 * yc - y]).reverse()
  return [...top, ...bot]
}

// ---------- stabilator (all-moving, root chord ~9 ft exposed) ----------
const stabR = [[-18.4, 4.4], [-26.0, 11.05], [-26.6, 11.4], [-29.7, 11.4], [-30.15, 11.0], [-28.6, 3.8], [-25.0, 3.8]]
// ---------- canted vertical fins (plan footprint of ~20 deg outward cant) ----------
const finR = [[-11.8, 4.55], [-19.6, 7.75], [-20.4, 8.0], [-24.3, 8.0], [-22.6, 4.55]]
// ---------- canopy ----------
const canopyHalf = sample(16, (t) => [22.15 - 9.0 * t, 1.38 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.75)])
const canopy = symmetric(canopyHalf)
// ---------- intakes (caret lips under the LERX) ----------
const intakeR = [[6.6, 3.7], [6.4, 5.15], [4.6, 5.35], [-1.5, 5.0], [-5.5, 4.75], [-5.5, 3.7]]
// ---------- nozzles ----------
const nozzleR = [[-25.6, 0.95], [-27.7, 1.1], [-28.1, 1.5], [-28.1, 3.1], [-27.7, 3.5], [-25.6, 3.65]]

const both = (pts) => poly(pts) + ' ' + poly(mirror(pts))
const common = {
  fuselage,
  wingInnerR: poly(wingInnerRpts), wingInnerL: poly(mirror(wingInnerRpts)),
  stabR: poly(stabR), stabL: poly(mirror(stabR)),
  finR: poly(finR), finL: poly(mirror(finR)),
  canopy, intakes: both(intakeR), nozzles: both(nozzleR),
}
const head = { length: 60.3, span: 44.9, spanFolded: 32.6, hingeY: HINGE }
const data = {
  FA18E: { ...head, parts: { ...common, wingOuterR: poly(wingOuterE), wingOuterL: poly(mirror(wingOuterE)) } },
  EA18G: { ...head, parts: { ...common,
    // the wingtip pod is part of the outer panel outline so it folds with it; podR/podL are the lighter overlay
    wingOuterR: poly(wingOuterG) + ' ' + poly(pod218), wingOuterL: poly(mirror(wingOuterG)) + ' ' + poly(mirror(pod218)),
    podR: poly(pod218), podL: poly(mirror(pod218)),
    podsUnderwing: [pod99(7.0, 9.5), pod99(7.0, -9.5), pod99(11.0, 0)].map(poly).join(' '),
  } },
}
writeFileSync(out, JSON.stringify(data, null, 1))
console.log('wrote', out)
