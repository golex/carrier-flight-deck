// Lane A: the sea, the wake, the bow wave and the ship's shadow on the water (spec §3.A).
// Everything here is world-scaled and closed-form in sim time t; reduced motion freezes every scroll at t = 0.
import type { Frame } from './frame'
import type { DeckGeometry } from '../data/deckTypes'
import type { Vec2 } from '../sim/types'
import { cssVar } from './tokens'
import { noise1, ramp, withAlpha } from './frame'
import { DECK_H, KELVIN_TAN, STEM, TRANSOM_X, V_SHIP, shadowOffset, withWorld } from './world'
import { foamPattern, seaTiles } from './sprites'

// ---------------------------------------------------------------------------------------------
// Sea (drawSea)
// ---------------------------------------------------------------------------------------------

interface SeaLayer {
  kind: 'swell' | 'chop'
  tileFt: number
  deg: number
  vx: number // scroll velocity, ft/s (world)
  vy: number
  weight: (z: number) => number
  trough: number
  crest: number
  strobe: boolean
}

const LAYERS: SeaLayer[] = [
  // Swell in two incommensurate periods (review V1): the 900 ft tile only shows once it is >= ~300 px on
  // screen (z >= 0.33); below that a 5000 ft tile (>= 300 px for z >= 0.06) rotated 23 deg carries the far band, so the sea never
  // repeats every 50-110 px. The two weights sum to the spec's single swell weight.
  { kind: 'swell', tileFt: 5000, deg: 23, vx: -(V_SHIP + 6), vy: 2,
    weight: z => ramp(z, 0.02, 0.04) * (1 - ramp(z, 0.33, 0.6)), trough: 0.32, crest: 0.18, strobe: false },
  { kind: 'swell', tileFt: 900, deg: 0, vx: -(V_SHIP + 6), vy: 2,
    weight: z => ramp(z, 0.33, 0.6) * (1 - ramp(z, 1.5, 3)), trough: 0.32, crest: 0.18, strobe: false },
  { kind: 'chop', tileFt: 160, deg: 12, vx: -(V_SHIP + 3), vy: -1.5,
    weight: z => ramp(z, 0.12, 0.25), trough: 0.30, crest: 0.35, strobe: true },
  { kind: 'chop', tileFt: 28, deg: -20, vx: -(V_SHIP + 1), vy: 0,
    weight: z => ramp(z, 1.4, 2.8), trough: 0.12, crest: 0.18, strobe: true },
]

function mod(a: number, n: number): number {
  return ((a % n) + n) % n
}

/** Base fill and the three texture layers: at most 6 pattern fillRects. */
export function drawSea(f: Frame): void {
  if (!f.b.world) return
  const { ctx, cam } = f
  const z = cam.zoom
  const t = f.reduced ? 0 : f.t
  ctx.save()
  ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  // the tiles are heavily minified at far zoom: ask for mipmapped sampling so they do not alias into moire
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = cssVar('--sea')
  ctx.fillRect(0, 0, cam.w, cam.h)

  // strobe guard: alpha only, never position
  const pxs = V_SHIP * z * f.speed
  const strobe = Math.min(1, Math.max(0.25, 1.6 - pxs / 500))

  for (const L of LAYERS) {
    const w = L.weight(z)
    if (w <= 0.01) continue
    const tile = seaTiles(L.kind, ctx) // lane D caches the bakes and patterns
    // World anchor = the scroll offset reduced modulo the tile period along the tile's own (rotated) axes,
    // so the wrap never shifts the texture.
    const rad = (L.deg * Math.PI) / 180
    const ux = Math.cos(rad), uy = Math.sin(rad)
    const sx = L.vx * t, sy = L.vy * t
    const su = mod(sx * ux + sy * uy, L.tileFt)
    const sv = mod(-sx * uy + sy * ux, L.tileFt)
    const ax = su * ux - sv * uy
    const ay = su * uy + sv * ux
    const ox = (ax - cam.cx) * z + cam.w / 2
    const oy = (ay - cam.cy) * z + cam.h / 2
    const s = (L.tileFt * z) / tile.px
    const m = new DOMMatrix().translate(ox, oy).rotate(L.deg).scale(s)
    const k = w * (L.strobe ? strobe : 1)
    tile.trough.setTransform(m)
    ctx.globalAlpha = L.trough * k
    ctx.fillStyle = tile.trough
    ctx.fillRect(0, 0, cam.w, cam.h)
    tile.crest.setTransform(m)
    ctx.globalAlpha = L.crest * k
    ctx.fillStyle = tile.crest
    ctx.fillRect(0, 0, cam.w, cam.h)
  }
  ctx.restore()
}

// ---------------------------------------------------------------------------------------------
// Wake (drawWake) and bow wave (drawBowWave)
// ---------------------------------------------------------------------------------------------

const SLICK_L = 24000
const AERATED_L = 12000
const FOAM_L = 2400
const FOAM_N = 48
const KELVIN_END_X = -9000
const KELVIN_COS = 1 / Math.sqrt(1 + KELVIN_TAN * KELVIN_TAN) // cos 19.47 deg
const FEATHER_STEP = 90
const CREST_LAMBDA = 405 // 2*pi*V^2/g at 27 kt
const RAMP_X = 0
/** Transom half-width at the waterline (hull polygon): the slick and aerated bands start this wide. */
const TRANSOM_HW = 46
/** Foam texture scale: ft per texture px (256 px strip -> 160 ft across the band). */
const FOAM_FT_PER_PX = 0.625
const FOAM_TILE_H_FT = 256 * FOAM_FT_PER_PX
/** Typical |y| of the visible moustache (where it shows past the deck edge). */
const MOUSTACHE_Y = 90

const slickCurve = (d: number): number => Math.exp(-d / 9000)
const aeratedCurve = (d: number): number => Math.exp(-d / 3500)
const foamCurve = (d: number): number => 0.92 * Math.exp(-d / 650) + 0.2 * Math.exp(-d / 2800)

/** Half-width easing from the transom's own beam into the spec band (keeps the band from starting as a square block). */
function taper(hwSpec: number, d: number): number {
  return hwSpec - (hwSpec - TRANSOM_HW) * Math.exp(-d / 70)
}

/** Band edge samples: every 40 ft out to 6000 ft (so the edge wobble resolves), then geometric to len. */
function bandDs(len: number): number[] {
  const ds = [0, 10, 25]
  for (let d = 40; d <= 6000 && d < len; d += 40) ds.push(d)
  for (let d = 6000 * 1.25; d < len; d *= 1.25) ds.push(d)
  ds.push(len)
  return ds
}

/** Edge feathering: each band is filled as 3 nested layers, inset by these fractions of its half-width. */
const FEATHER_INSETS = [0, 0.15, 0.3]
/** Edge wobble: the foam band's noise1 term at half its amplitude (static in the ship frame; the band paths are built once). */
const EDGE_WOBBLE_FT = 7

/**
 * A band symmetric about y = 0 from the transom aft, half-width hw(d), inset by `inset` of the half-width,
 * its edges wobbled by noise1 (phase differs per side and per layer so the three feather edges never line up).
 */
function bandPath(len: number, hw: (d: number) => number, inset: number, phase: number): Path2D {
  const ds = bandDs(len)
  const y = (d: number, side: number): number => {
    const h = hw(d)
    // fade the wobble in over the first 120 ft so the band still starts at the transom's beam
    const wob = EDGE_WOBBLE_FT * Math.min(1, d / 120) * noise1(d / 180 + phase + (side < 0 ? 53.17 : 0))
    return side * Math.max(0, h * (1 - inset) + wob)
  }
  const p = new Path2D()
  ds.forEach((d, i) => {
    const x = TRANSOM_X - d
    if (i === 0) p.moveTo(x, y(d, 1))
    else p.lineTo(x, y(d, 1))
  })
  for (let i = ds.length - 1; i >= 0; i--) p.lineTo(TRANSOM_X - ds[i]!, y(ds[i]!, -1))
  p.closePath()
  return p
}

/** The 3 feather layers of one band. */
function featheredBand(len: number, hw: (d: number) => number, phase: number): Path2D[] {
  return FEATHER_INSETS.map((k, i) => bandPath(len, hw, k, phase + 31.7 * i))
}

/** Per-layer alpha so 3 stacked layers composite to the spec alpha `a` in the band's middle: 1 - (1 - p)^3 = a. */
function layerAlpha(a: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, a)), 1 / FEATHER_INSETS.length)
}

/** Linear gradient along world x from the transom aft over len ft, 10 stops sampling curve(d). */
function wakeGradient(
  ctx: CanvasRenderingContext2D, color: string, len: number, curve: (d: number) => number, geometric: boolean, layered = false,
): CanvasGradient {
  const g = ctx.createLinearGradient(TRANSOM_X, 0, TRANSOM_X - len, 0)
  const a0 = layered ? +(withAlpha(color, 1).match(/[\d.]+/g)?.[3] ?? 1) : 1
  for (let i = 0; i < 10; i++) {
    const u = i / 9
    const v = geometric ? u * u : u
    const c = curve(v * len)
    // layered: the stop is one of 3 stacked feather layers, so it carries the per-layer share of the token alpha
    g.addColorStop(v, layered ? withAlpha(color, a0 > 0 ? layerAlpha(a0 * c) / a0 : 0) : withAlpha(color, c))
  }
  return g
}

interface Static {
  /** Feather layers, outermost first (FEATHER_INSETS). */
  slick: Path2D[]
  aerated: Path2D[]
  crests: Path2D[]
  crestEnd: number
  /** Feathers in chunks of 8 per arm so only the chunks on screen are stroked (one huge path rasterises slowly on the GPU). */
  feathers: FeatherChunk[]
  arms: Path2D
  lobes: Path2D
  moustache: Path2D
  stemFoam: Path2D
}
let stat: Static | null = null
/** A run of 8 consecutive feathers on one arm. f: [px, py, len, alpha] per feather; dir: the feathers' unit direction. */
interface FeatherChunk { f: number[]; even: boolean[]; dx: number; dy: number; x0: number; x1: number; y0: number; y1: number }

function moustacheOuter(x: number): number {
  const dm = 1066 - x
  if (x >= 840) return (67 * dm) / 226 + 10 + 0.06 * dm
  return moustacheOuter(840) + KELVIN_TAN * (840 - x)
}
function hullHalf(x: number): number {
  return x >= 840 ? (67 * (1066 - x)) / 226 : 67
}

function buildStatic(): Static {
  const slick = featheredBand(SLICK_L, d => taper(90 + 0.022 * d, d), 0)
  const aerated = featheredBand(AERATED_L, d => taper(70 + 0.018 * d, d), 211.3)

  // Transverse crests: arcs between the Kelvin arms every 405 ft from 200 ft astern of the ramp, convex aft.
  const crests: Path2D[] = []
  let crestEnd = 0
  for (let i = 0; i < 10; i++) {
    const x = RAMP_X - 200 - i * CREST_LAMBDA
    const Y = KELVIN_TAN * (STEM.x - x)
    const sag = 0.06 * 2 * Y
    const c = new Path2D()
    c.moveTo(x, -Y)
    c.quadraticCurveTo(x - 2 * sag, 0, x, Y) // the quadratic's midpoint sits sag aft of the chord
    crests.push(c)
    crestEnd = x - sag
  }

  // Kelvin feathers: every 90 ft of arc length along each arm, 35 deg outboard-aft of the arm.
  const feathers: FeatherChunk[] = []
  const arms = new Path2D()
  const armLen = (STEM.x - KELVIN_END_X) / KELVIN_COS
  const armA = Math.atan(KELVIN_TAN)
  const fa = armA + (35 * Math.PI) / 180
  for (const side of [1, -1]) {
    arms.moveTo(STEM.x, STEM.y)
    arms.lineTo(KELVIN_END_X, side * KELVIN_TAN * (STEM.x - KELVIN_END_X))
    let k = 0
    let ch: FeatherChunk | null = null
    for (let s = FEATHER_STEP; s <= armLen; s += FEATHER_STEP, k++) {
      if (k % 8 === 0) {
        ch = { f: [], even: [], dx: -Math.cos(fa), dy: side * Math.sin(fa), x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }
        feathers.push(ch)
      }
      const px = STEM.x - s * Math.cos(armA)
      const py = side * s * Math.sin(armA)
      const len = 40 + 0.012 * s
      const qx = px - len * Math.cos(fa)
      const qy = py + side * len * Math.sin(fa)
      const c = ch!
      c.f.push(px, py, len, 0.40 * Math.exp(-s / 3500))
      c.even.push(k % 2 === 0)
      c.x0 = Math.min(c.x0, px, qx); c.x1 = Math.max(c.x1, px, qx)
      c.y0 = Math.min(c.y0, py, qy); c.y1 = Math.max(c.y1, py, qy)
    }
  }

  const lobes = new Path2D()
  lobes.ellipse(-134, 28, 160, 26, 0, 0, Math.PI * 2)
  lobes.ellipse(-134, -28, 160, 26, 0, 0, Math.PI * 2)

  // Moustache: one crescent per side from the stem aft to x = 760, width 28 -> 6 ft.
  const moustache = new Path2D()
  const N = 40
  for (const side of [1, -1]) {
    const outer: Vec2[] = []
    const inner: Vec2[] = []
    for (let i = 0; i <= N; i++) {
      const x = STEM.x - (i / N) * (STEM.x - 760)
      const u = (STEM.x - x) / (STEM.x - 760)
      const o = moustacheOuter(x)
      const w = 28 + (6 - 28) * u
      outer.push({ x, y: side * o })
      inner.push({ x, y: side * Math.max(hullHalf(x), o - w) })
    }
    moustache.moveTo(STEM.x, 0)
    for (const p of outer) moustache.lineTo(p.x, p.y)
    for (let i = inner.length - 1; i >= 0; i--) moustache.lineTo(inner[i]!.x, inner[i]!.y)
    moustache.closePath()
  }

  // Stem foam: a crescent ahead of the bow, x 1092-1112, y +-22, convex forward.
  const stemFoam = new Path2D()
  stemFoam.moveTo(1092, -22)
  stemFoam.quadraticCurveTo(1132, 0, 1092, 22)
  stemFoam.quadraticCurveTo(1108, 0, 1092, -22)
  stemFoam.closePath()

  return { slick, aerated, crests, crestEnd, feathers, arms, lobes, moustache, stemFoam }
}
function S(): Static {
  if (!stat) stat = buildStatic()
  return stat
}

// ---- the foam band's sinuous edge: rebuilt when floor(t*4) changes ----
let foamEdge: { key: number; path: Path2D } | null = null
const FOAM_DS: number[] = (() => {
  const out = [0]
  const d0 = 6
  for (let i = 1; i < FOAM_N; i++) out.push(d0 * Math.pow(FOAM_L / d0, (i - 1) / (FOAM_N - 2)))
  return out
})()
const FOAM_HW_MAX = 52 + 0.012 * FOAM_L + 14

function foamPath(t: number): Path2D {
  const key = Math.floor(t * 4)
  if (foamEdge && foamEdge.key === key) return foamEdge.path
  const tq = key / 4
  // The noise is advected aft with the water (d - V t); port uses a phase offset so the edges are not mirrored.
  const hw = (d: number, side: number): number =>
    52 + 0.012 * d + 14 * noise1((d - V_SHIP * tq) / 180 + (side < 0 ? 97.31 : 0))
  const p = new Path2D()
  FOAM_DS.forEach((d, i) => {
    const x = TRANSOM_X - d, y = hw(d, 1)
    if (i === 0) p.moveTo(x, y)
    else p.lineTo(x, y)
  })
  for (let i = FOAM_DS.length - 1; i >= 0; i--) p.lineTo(TRANSOM_X - FOAM_DS[i]!, -hw(FOAM_DS[i]!, -1))
  p.closePath()
  foamEdge = { key, path: p }
  return p
}

// ---- gradients (world space, so they are independent of zoom and pan; re-keyed on token values) ----
interface Grads {
  key: string
  slick: CanvasGradient
  aerated: CanvasGradient
  foamFlat: CanvasGradient
  crest: CanvasGradient
}
let grads: Grads | null = null
function mainGrads(ctx: CanvasRenderingContext2D): Grads {
  const slickC = cssVar('--wake-slick'), aerC = cssVar('--wake-aerated'), foam2 = cssVar('--foam-2')
  const crestC = cssVar('--sea-crest'), foamC = cssVar('--foam'), wl = cssVar('--waterline')
  const key = [slickC, aerC, foam2, crestC, foamC, wl].join('|')
  if (grads && grads.key === key) return grads
  const st = S()
  const crest = ctx.createLinearGradient(RAMP_X - 200, 0, st.crestEnd, 0)
  const span = RAMP_X - 200 - st.crestEnd
  for (let i = 0; i < 10; i++) {
    const u = i / 9
    crest.addColorStop(u, withAlpha(crestC, 0.25 * Math.exp(-(200 + u * span) / 2500)))
  }
  grads = {
    key,
    slick: wakeGradient(ctx, slickC, SLICK_L, slickCurve, false, true),
    aerated: wakeGradient(ctx, aerC, AERATED_L, aeratedCurve, false, true),
    foamFlat: wakeGradient(ctx, foam2, FOAM_L, foamCurve, true),
    crest,
  }
  return grads
}

// ---- the one reusable offscreen foam canvas (CSS px, no DPR) ----
let off: HTMLCanvasElement | null = null
let octx: CanvasRenderingContext2D | null = null
let offGrads: { foam: CanvasGradient; moustache: CanvasGradient } | null = null

function offscreen(w: number, h: number): CanvasRenderingContext2D | null {
  if (!off) {
    off = document.createElement('canvas')
    off.width = 1
    off.height = 1
    octx = off.getContext('2d')
  }
  if (!octx) return null
  if (w > off.width || h > off.height) {
    off.width = Math.max(off.width, w)
    off.height = Math.max(off.height, h)
  }
  return octx
}
function offGradients(c: CanvasRenderingContext2D): { foam: CanvasGradient; moustache: CanvasGradient } {
  if (!offGrads) {
    const foam = wakeGradient(c, 'rgba(0,0,0,1)', FOAM_L, foamCurve, true)
    const moustache = c.createLinearGradient(STEM.x, 0, 760, 0)
    for (let i = 0; i < 10; i++) {
      const u = i / 9
      moustache.addColorStop(u, `rgba(0,0,0,${0.85 + (0.15 - 0.85) * u})`)
    }
    offGrads = { foam, moustache }
  }
  return offGrads
}

/**
 * Composite foam-textured shapes through the offscreen canvas: fill `shape` with the foam pattern
 * (placed by patM, world ft), mask with `mask` via destination-in, optionally add `extra`, then blit.
 * The world rectangle [x0,x1]x[y0,y1] bounds everything drawn.
 */
function foamComposite(
  f: Frame, x0: number, x1: number, y0: number, y1: number, patM: DOMMatrix,
  shape: Path2D, mask: (c: CanvasRenderingContext2D) => CanvasGradient, extra?: (c: CanvasRenderingContext2D) => void,
): void {
  const { cam, ctx } = f
  const z = cam.zoom
  const sx0 = (x0 - cam.cx) * z + cam.w / 2, sx1 = (x1 - cam.cx) * z + cam.w / 2
  const sy0 = (y0 - cam.cy) * z + cam.h / 2, sy1 = (y1 - cam.cy) * z + cam.h / 2
  const bx = Math.max(0, Math.floor(sx0)), by = Math.max(0, Math.floor(sy0))
  const bx1 = Math.min(Math.ceil(cam.w), Math.ceil(sx1)), by1 = Math.min(Math.ceil(cam.h), Math.ceil(sy1))
  const bw = bx1 - bx, bh = by1 - by
  if (bw < 1 || bh < 1) return
  const c = offscreen(bw, bh)
  if (!c) return
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.globalCompositeOperation = 'source-over'
  c.globalAlpha = 1
  c.clearRect(0, 0, bw, bh)
  c.setTransform(z, 0, 0, z, cam.w / 2 - cam.cx * z - bx, cam.h / 2 - cam.cy * z - by)
  const pat = foamPattern(c) // cached per context by lane D
  pat.setTransform(patM)
  c.fillStyle = pat
  c.fill(shape)
  c.globalCompositeOperation = 'destination-in'
  c.fillStyle = mask(c)
  c.fillRect(x0, y0, x1 - x0, y1 - y0)
  c.globalCompositeOperation = 'source-over'
  c.fillStyle = pat
  if (extra) extra(c)
  c.globalAlpha = 1
  ctx.save()
  ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0)
  ctx.drawImage(off!, 0, 0, bw, bh, bx, by, bw, bh)
  ctx.restore()
}

const FAR_Z = 0.06


/** Slick, aerated band, transverse crests, Kelvin feathers, foam band, prop lobes. */
export function drawWake(f: Frame): void {
  if (!f.b.world) return
  const { ctx, cam, dpr } = f
  const z = cam.zoom
  const t = f.reduced ? 0 : f.t
  const st = S()
  const gr = mainGrads(ctx)
  const far = z < FAR_Z

  withWorld(ctx, cam, dpr, () => {
    ctx.globalAlpha = 1
    // feathered edges: 3 nested layers per band, each at a third-share of the alpha
    ctx.fillStyle = gr.slick
    for (const p of st.slick) ctx.fill(p)
    ctx.fillStyle = gr.aerated
    for (const p of st.aerated) ctx.fill(p)

    if (z < 0.6) {
      ctx.strokeStyle = gr.crest
      ctx.lineWidth = 1 / z
      for (const c of st.crests) ctx.stroke(c)
    }

    if (far) {
      ctx.strokeStyle = cssVar('--foam-2')
      ctx.lineWidth = 1 / z
      ctx.stroke(st.arms)
      ctx.fillStyle = gr.foamFlat
      ctx.fill(foamPath(t))
    } else {
      // Each feather is one fillRect in its own rotated frame, culled per chunk: measured on a GPU canvas,
      // stroking all feathers as one multi-subpath Path2D cost ~4 ms per frame; rects cost ~0.3-0.6 ms.
      // The arms themselves as faint hairlines so the feathers read as a V (as the far-zoom path does).
      ctx.strokeStyle = cssVar('--foam-2')
      ctx.lineWidth = 1 / z
      ctx.globalAlpha = 0.6
      ctx.stroke(st.arms)
      ctx.globalAlpha = 1
      // Above z 0.3 the feathers are short crest ticks on the arm (<= 25 ft): full-length strokes read as rain.
      const capW = ramp(z, 0.2, 0.3)
      const half = FEATHER_STEP * z < 6
      const vb = cam.bounds()
      const m = 200
      const A = dpr * z, ex = dpr * (cam.w / 2 - cam.cx * z), ey = dpr * (cam.h / 2 - cam.cy * z)
      const off = 1.2 / z
      const colors = [cssVar('--waterline'), cssVar('--foam')]
      for (const pass of [0, 1]) {
        ctx.fillStyle = colors[pass]!
        const hw = (pass === 0 ? 0.3 : 0.6) / z
        const sx = pass === 0 ? -off : 0
        for (const ch of st.feathers) {
          if (ch.x1 < vb.minX - m || ch.x0 > vb.maxX + m || ch.y1 < vb.minY - m || ch.y0 > vb.maxY + m) continue
          const a = A * ch.dx, b = A * ch.dy
          for (let i = 0; i < ch.even.length; i++) {
            if (half && !ch.even[i]) continue
            const px = ch.f[4 * i]! + sx, py = ch.f[4 * i + 1]!
            ctx.setTransform(a, b, -b, a, A * px + ex, A * py + ey)
            ctx.globalAlpha = ch.f[4 * i + 3]!
            const len = ch.f[4 * i + 2]!
            ctx.fillRect(0, -hw, len + (Math.min(len, 25) - len) * capW, 2 * hw)
          }
        }
      }
      ctx.globalAlpha = 1
    }
  })

  if (far) return
  const shape = foamPath(t)
  const lobeHw = 28 + 26
  foamComposite(
    f, TRANSOM_X - FOAM_L - 2, TRANSOM_X + 2, -Math.max(FOAM_HW_MAX, lobeHw) - 2, Math.max(FOAM_HW_MAX, lobeHw) + 2,
    new DOMMatrix().translate(-(V_SHIP + 9) * t, -FOAM_TILE_H_FT / 2).scale(FOAM_FT_PER_PX), shape, c => offGradients(c).foam,
    c => {
      c.globalAlpha = 0.6
      c.fill(st.lobes)
    },
  )
}

/** Moustache and stem foam (drawn BEFORE the deck so the overhang hides it). */
export function drawBowWave(f: Frame): void {
  if (!f.b.world) return
  const z = f.cam.zoom
  if (z <= 0.04) return
  const t = f.reduced ? 0 : f.t
  const st = S()
  const yMax = moustacheOuter(760) + 2
  // texture rows repeat every 2*MOUSTACHE_Y ft, so the dense middle of the foam strip lands on both crescents
  const k = (2 * MOUSTACHE_Y) / 256
  const m = new DOMMatrix().translate(-V_SHIP * t, 0).scale(k)
  foamComposite(f, 758, STEM.x + 2, -yMax, yMax, m, st.moustache, c => offGradients(c).moustache)
  withWorld(f.ctx, f.cam, f.dpr, () => {
    f.ctx.globalAlpha = 0.9
    f.ctx.fillStyle = cssVar('--foam')
    f.ctx.fill(st.stemFoam)
    f.ctx.globalAlpha = 1
  })
}

let shadowCache: { outline: Vec2[]; path: Path2D } | null = null
export function drawShipShadow(f: Frame, g: DeckGeometry): void {
  if (!f.b.world) return
  if (!shadowCache || shadowCache.outline !== g.outline) {
    const o = shadowOffset(DECK_H)
    const p = new Path2D()
    g.outline.forEach((q, i) => (i === 0 ? p.moveTo(q.x + o.x, q.y + o.y) : p.lineTo(q.x + o.x, q.y + o.y)))
    p.closePath()
    shadowCache = { outline: g.outline, path: p }
  }
  const path = shadowCache.path
  withWorld(f.ctx, f.cam, f.dpr, () => {
    f.ctx.globalAlpha = 1
    f.ctx.fillStyle = cssVar('--shadow-ship')
    f.ctx.fill(path)
  })
}
