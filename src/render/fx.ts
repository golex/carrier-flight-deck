// Lane C: deck and sea effects (spec §5). Every effect is stateless and closed-form in sim time t:
// triggers come from the FxIndex by binary search, puff positions are hashed, nothing is remembered
// between frames. Only the burner flicker uses the wall clock (and not under reduced motion).
import type { CatId, Frame, ShotFx, TensionFx } from './frame'
import { hash01, ramp, withAlpha } from './frame'
import { jbdGeometry, nmToWorld, withWorld } from './world'
import { cssVar } from './tokens'
import { assetsVersion, burnerSprite, glowSprite, hatchPattern, steamCell } from './sprites'
import { catOfJet, fxExtra, inWindow, lastBefore, tensionAt } from './fxIndex'
import { airbornePosition } from './airborne'
import { DECK } from '../data/deck'
import { SILHOUETTES, type SilhouetteSpec } from '../data/silhouettes'
import type { Catapult } from '../data/deckTypes'
import type { AircraftEntity, Vec2 } from '../sim/types'
import { sampleAircraft, sampleEquipment, samplePattern, type AircraftState } from '../sim/sample'

// ---------------------------------------------------------------------------------------------
// shared helpers

const DEG = Math.PI / 180
const STEAM_DRIFT = 24 // ft/s aft (D16)
const SMOKE_DRIFT = 14 // ft/s aft (D17)
const MAX_PUFFS = 300
/** R2: nothing but the burner core goes over a jet above this alpha. */
const OVER_JET_MAX = 0.55

/** Zoom floor: invisible at or below `floor`, full a little above it (R5). */
function gate(z: number, floor: number): number {
  return ramp(z, floor, floor * 1.15)
}
/** FX alpha multiplier: highlight mode dims every effect to 0.4. */
function fxA(f: Frame): number {
  return f.dim ? 0.4 : 1
}
function strHash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h | 0
}
function trackPoint(c: Catapult, u: number): Vec2 {
  return { x: c.start.x + (c.end.x - c.start.x) * u, y: c.start.y + (c.end.y - c.start.y) * u }
}
/** Lateral drift direction (+1 starboard, -1 port): steam blows outboard of its own track. */
function outboard(c: Catapult): number {
  return c.start.y + c.end.y >= 0 ? 1 : -1
}
function catOf(id: CatId): Catapult {
  return DECK.catapults[id - 1]!
}
function entity(f: Frame, id: string): AircraftEntity | undefined {
  return fxExtra(f.fxi)?.byId.get(id)
}
function sampleOf(f: Frame, id: string): AircraftState | null {
  for (const j of f.jets) if (j.a.id === id) return j.s
  return null
}
/** Shuttle fraction along the stroke at time tau for a shot at S (constant acceleration over 2 s). */
function shuttleU(S: number, tau: number): number {
  const v = (tau - S) / 2
  return v <= 0 ? 0 : v >= 1 ? 1 : v * v
}
function smooth01(x: number): number {
  const c = x < 0 ? 0 : x > 1 ? 1 : x
  return c * c * (3 - 2 * c)
}

/** 'rgba(r,g,b,a)' or '#rrggbb' -> opaque rgb string and its alpha. */
function splitColor(color: string): { rgb: string; a: number } {
  const s = withAlpha(color, 1)
  const m = s.match(/[\d.]+/g) ?? ['255', '255', '255', '1']
  return { rgb: `rgb(${m[0]},${m[1]},${m[2]})`, a: m[3] !== undefined ? +m[3] : 1 }
}

// tinted copies of the white sprites (cached per asset version and colour)
const tintCache = new Map<string, HTMLCanvasElement>()
let tintVersion = -1
function tinted(key: string, img: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, rgb: string): HTMLCanvasElement {
  const v = assetsVersion()
  if (v !== tintVersion) {
    tintCache.clear()
    tintVersion = v
  }
  const k = `${key}|${rgb}`
  let c = tintCache.get(k)
  if (!c) {
    c = document.createElement('canvas')
    c.width = Math.max(1, Math.round(sw))
    c.height = Math.max(1, Math.round(sh))
    const g = c.getContext('2d')!
    g.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height)
    g.globalCompositeOperation = 'source-in'
    g.fillStyle = rgb
    g.fillRect(0, 0, c.width, c.height)
    tintCache.set(k, c)
  }
  return c
}
function glowTinted(rgb: string): HTMLCanvasElement {
  const g = glowSprite()
  return tinted(`glow:${g.width}`, g, 0, 0, g.width, g.height, rgb)
}

// hatch patterns, cached per colour and asset version
const hatchCache = new Map<string, CanvasPattern>()
let hatchVersion = -1
let hatchCtx: CanvasRenderingContext2D | null = null
function hatch(ctx: CanvasRenderingContext2D, color: string): CanvasPattern {
  const v = assetsVersion()
  if (v !== hatchVersion || ctx !== hatchCtx) {
    hatchCache.clear()
    hatchVersion = v
    hatchCtx = ctx
  }
  let p = hatchCache.get(color)
  if (!p) {
    p = hatchPattern(ctx, color)
    hatchCache.set(color, p)
  }
  return p
}

// ---------------------------------------------------------------------------------------------
// puffs: one drawImage per puff from the steam sheet, culled, capped at 300 per frame

interface Puff {
  x: number
  y: number
  r: number // ft
  a: number
  h: number // hash in [0, 1): sheet cell and rotation
  age: number
  tint?: string // opaque rgb; undefined = the white sheet
  minPx?: number
}

function drawPuffs(f: Frame, puffs: Puff[]): void {
  if (!puffs.length) return
  const { ctx, cam, dpr } = f
  const z = cam.zoom
  if (puffs.length > MAX_PUFFS) {
    puffs.sort((p, q) => p.age - q.age) // keep the youngest, drop from the oldest
    puffs.length = MAX_PUFFS
  }
  ctx.save()
  const A = fxA(f)
  for (const p of puffs) {
    if (p.a <= 0.004) continue
    const rp = Math.max(p.r * z, p.minPx ?? 0)
    const sx = (p.x - cam.cx) * z + cam.w / 2
    const sy = (p.y - cam.cy) * z + cam.h / 2
    if (sx + rp < 0 || sy + rp < 0 || sx - rp > cam.w || sy - rp > cam.h) continue
    const k = Math.floor(p.h * 16) % 16
    const cell = steamCell(k)
    let img: CanvasImageSource = cell.img
    let csx = cell.sx, csy = cell.sy, csw = cell.sw, csh = cell.sh
    if (p.tint) {
      img = tinted(`steam:${k}`, cell.img, cell.sx, cell.sy, cell.sw, cell.sh, p.tint)
      csx = 0
      csy = 0
      csw = (img as HTMLCanvasElement).width
      csh = (img as HTMLCanvasElement).height
    }
    const th = p.h * Math.PI * 2
    const c = Math.cos(th) * dpr
    const s = Math.sin(th) * dpr
    ctx.setTransform(c, s, -s, c, sx * dpr, sy * dpr)
    ctx.globalAlpha = Math.min(OVER_JET_MAX, p.a) * A
    ctx.drawImage(img, csx, csy, csw, csh, -rp, -rp, rp * 2, rp * 2)
  }
  ctx.restore()
}

// ---------------------------------------------------------------------------------------------
// 1-3: catapult stroke steam, water-brake burst, slot wisps

function strokeSteam(f: Frame, sh: ShotFx, out: Puff[], sparse: boolean): void {
  const c = catOf(sh.cat)
  const ob = outboard(c)
  const hs = strHash(sh.id) ^ Math.round(sh.t * 10)
  for (let i = 0; i < 40; i++) {
    if (sparse && i % 2) continue
    const u = i / 39
    const age = f.t - (sh.t + 2 * Math.sqrt(u))
    if (age < 0) continue
    const L = 6 + 4 * (1 - u) // the aft end lingers
    if (age >= L) continue
    const p = trackPoint(c, u)
    out.push({
      x: p.x + (hash01(hs, i, 1) * 2 - 1) * 3 - STEAM_DRIFT * age,
      y: p.y + (hash01(hs, i, 2) * 2 - 1) * 3 + ob * 2 * hash01(hs, i, 3) * age,
      r: 4 + 16 * Math.sqrt(age),
      a: 0.5 * Math.pow(1 - age / L, 1.5),
      h: hash01(hs, i, 4),
      age,
      minPx: sparse ? 2 : 0,
    })
  }
}

function waterBrake(f: Frame, sh: ShotFx, out: Puff[]): void {
  const age = f.t - (sh.t + 2)
  const life = 3.5
  if (age < 0 || age >= life) return
  const c = catOf(sh.cat)
  const ob = outboard(c)
  const hs = strHash(sh.id) ^ Math.round(sh.t * 10) ^ 0x5bd1
  const radial = 30 * Math.min(age, 0.5)
  const drift = Math.max(0, age - 0.5)
  for (let i = 0; i < 8; i++) {
    const th = ((i + hash01(hs, i, 1) * 0.6) / 8) * Math.PI * 2
    out.push({
      x: c.end.x + Math.cos(th) * radial - STEAM_DRIFT * drift,
      y: c.end.y + Math.sin(th) * radial + ob * 2 * hash01(hs, i, 2) * drift,
      r: 6 + 14 * (age / life),
      a: 0.45 * (1 - age / life),
      h: hash01(hs, i, 3),
      age,
    })
  }
}

const WISP_LIFE = 3
function slotWisps(f: Frame, sh: ShotFx, out: Puff[], detail: number): void {
  const t0 = sh.t + 2
  const t1 = sh.t + 45
  if (f.t < t0 || f.t > t1 + WISP_LIFE) return
  const c = catOf(sh.cat)
  const ob = outboard(c)
  const hs = strHash(sh.id) ^ Math.round(sh.t * 10) ^ 0x2c1b
  for (let v = 0; v < 12; v++) {
    const phase = hash01(hs, v, 1) * 1.6
    const kMin = Math.max(0, Math.ceil((f.t - WISP_LIFE - t0 - phase) / 1.6))
    const kMax = Math.floor((Math.min(f.t, t1) - t0 - phase) / 1.6)
    const base = trackPoint(c, (v + 0.5) / 12)
    for (let k = kMin; k <= kMax; k++) {
      const te = t0 + phase + 1.6 * k
      const age = f.t - te
      if (age < 0 || age >= WISP_LIFE) continue
      const amp = Math.exp(-(te - t0) / 14)
      const q = age / WISP_LIFE
      out.push({
        x: base.x - STEAM_DRIFT * age,
        y: base.y + ob * 2 * hash01(hs, v, k + 7) * age,
        r: 3 + 7 * Math.sqrt(q),
        a: 0.22 * amp * (1 - q) * detail,
        h: hash01(hs, v, k + 101),
        age,
      })
    }
  }
}

// 4: battery venting while tensioned
const VENT_LIFE = 2.4
function batteryVent(f: Frame, w: TensionFx, out: Puff[]): void {
  const c = catOf(w.cat)
  const ob = outboard(c)
  const hs = strHash(w.id) ^ Math.round(w.t0 * 10) ^ 0x7a3
  const phase = hash01(hs, 1) * 1.2
  const kMin = Math.max(0, Math.ceil((f.t - VENT_LIFE - w.t0 - phase) / 1.2))
  const kMax = Math.floor((Math.min(f.t, w.t1) - w.t0 - phase) / 1.2)
  for (let k = kMin; k <= kMax; k++) {
    const te = w.t0 + phase + 1.2 * k
    const age = f.t - te
    if (age < 0 || age >= VENT_LIFE) continue
    const q = age / VENT_LIFE
    out.push({
      x: c.start.x - STEAM_DRIFT * age,
      y: c.start.y + ob * 2 * hash01(hs, k, 2) * age,
      r: 3 + 5 * Math.sqrt(q),
      a: 0.25 * (1 - q),
      h: hash01(hs, k, 3),
      age,
    })
  }
}

// 9: JBD cooling spray (raised JBD, its jet in burner)
const SPRAY_LIFE = 2.4
function jbdSpray(f: Frame, w: TensionFx, out: Puff[]): void {
  const c = catOf(w.cat)
  const a = entity(f, w.id)
  if (!a) return
  const ob = outboard(c)
  const hs = strHash(w.id) ^ Math.round(w.t0 * 10) ^ 0x1f9
  const kMin = Math.max(0, Math.ceil((f.t - SPRAY_LIFE - w.t0) / 1.2))
  const kMax = Math.floor((Math.min(f.t, w.t1) - w.t0) / 1.2)
  for (let k = kMin; k <= kMax; k++) {
    const te = w.t0 + 1.2 * k
    const age = f.t - te
    if (age < 0 || age >= SPRAY_LIFE) continue
    // the condition is evaluated at the emission time, so a puff's existence never depends on "now"
    const s = sampleAircraft(a, te)
    if (!s || s.power !== 2) continue
    const raise = sampleEquipment(f.tl.equipment, te).jbd[w.cat - 1]!
    if (raise <= 0.5) continue
    const g = jbdGeometry(c, raise)
    const q = age / SPRAY_LIFE
    for (let e = 0; e < 2; e++) {
      const end = g.top[e]!
      for (let j = 0; j < 2; j++) {
        const hh = hash01(hs, k, e * 2 + j)
        out.push({
          x: end.x + (hh * 2 - 1) * 2 - STEAM_DRIFT * age,
          y: end.y + (hash01(hs, k, e * 2 + j + 9) * 2 - 1) * 2 + ob * 2 * hh * age,
          r: 4 + 8 * Math.sqrt(q),
          a: 0.35 * (1 - q),
          h: hash01(hs, k, e * 2 + j + 31),
          age,
        })
      }
    }
  }
}

// 10: JBD cooling steam after the panel comes down
function jbdCooling(f: Frame, idx: number, T: number, out: Puff[]): void {
  const c = DECK.catapults[idx]
  if (!c) return
  const fp = jbdGeometry(c, 0).footprint
  const [h0, h1, a1, a0] = fp as [Vec2, Vec2, Vec2, Vec2]
  const hs = 0x3e5 ^ Math.round(T * 10) ^ (idx << 20)
  const life = 3
  for (let k = 0; k < 12; k++) {
    const age = f.t - (T + k)
    if (age < 0 || age >= life) continue
    const u = hash01(hs, k, 1)
    const v = hash01(hs, k, 2)
    // bilinear point on the lowered panel
    const fx0 = h0.x + (h1.x - h0.x) * u, fy0 = h0.y + (h1.y - h0.y) * u
    const ax0 = a0.x + (a1.x - a0.x) * u, ay0 = a0.y + (a1.y - a0.y) * u
    const q = age / life
    out.push({
      x: fx0 + (ax0 - fx0) * v - 10 * age,
      y: fy0 + (ay0 - fy0) * v,
      r: 5 + 11 * Math.sqrt(q),
      a: 0.3 * (1 - q),
      h: hash01(hs, k, 3),
      age,
    })
  }
}

// 13: tyre smoke, fixed in the deck frame, drifting aft
function tyreSmoke(f: Frame, td: { t: number; id: string; x: number; y: number; heading: number }, out: Puff[], tint: string, a0: number): void {
  const life = 2.5
  const h = td.heading * DEG
  const fx = Math.cos(h), fy = Math.sin(h)
  const hs = strHash(td.id) ^ Math.round(td.t * 10) ^ 0x51
  const pts: { x: number; y: number; tb: number }[] = [
    { x: td.x - fy * 5, y: td.y + fx * 5, tb: td.t },
    { x: td.x + fy * 5, y: td.y - fx * 5, tb: td.t },
  ]
  // nose gear slams down 0.15 s later, 17 ft ahead of where the jet then is
  const a = entity(f, td.id)
  const sn = a ? sampleAircraft(a, td.t + 0.15) : null
  const nb = sn ?? { x: td.x + fx * 40, y: td.y + fy * 40 }
  pts.push({ x: nb.x + fx * 17, y: nb.y + fy * 17, tb: td.t + 0.15 })
  pts.forEach((p, i) => {
    const age = f.t - p.tb
    if (age < 0 || age >= life) return
    const q = age / life
    out.push({
      x: p.x - SMOKE_DRIFT * age,
      y: p.y,
      r: 2 + 12 * Math.sqrt(q),
      a: a0 * (1 - q),
      h: hash01(hs, i, 1),
      age,
      tint,
    })
  })
}

// ---------------------------------------------------------------------------------------------
// 3 (layer S): low-pass ruffle on the sea under a departing jet

export function drawSeaFx(f: Frame): void {
  if (f.fx < 2) return
  const z = f.cam.zoom
  const gz = gate(z, 0.4)
  if (gz <= 0) return
  const shots = inWindow(f.fxi.shots, f.t - 4.7, f.t - 2.7)
  if (!shots.length) return
  const foam = splitColor(cssVar('--foam-2') || 'rgba(244,248,248,0.45)')
  const { ctx, cam, dpr } = f
  withWorld(ctx, cam, dpr, () => {
    ctx.strokeStyle = foam.rgb
    for (const sh of shots) {
      const age = f.t - (sh.t + 2.7)
      const pos = jetPosition(f, sh.id)
      if (!pos) continue
      const env = Math.min(1, age / 0.25) * (1 - smooth01((age - 1.4) / 0.6))
      for (let k = 0; k < 3; k++) {
        // three concentric arcs, staggered so they keep spreading through the 2 s
        const p = (age / 2 + k / 3) % 1
        const r = 10 + 50 * p
        const al = foam.a * (1 - p) * env * gz * fxA(f)
        if (al <= 0.01) continue
        ctx.globalAlpha = Math.min(1, al)
        ctx.lineWidth = Math.max(1.2 / z, 0.8 + 1.4 * (1 - p))
        ctx.beginPath()
        // open forward: the downwash spreads aft and out to both sides
        ctx.arc(pos.x - 6 * p, pos.y, r, 0.62 * Math.PI, 1.38 * Math.PI)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
  })
}

/** Where the jet is drawn now: its deck sample while visible, else its airborne position. */
function jetPosition(f: Frame, id: string): Vec2 | null {
  const s = sampleOf(f, id)
  if (s && s.visible) return { x: s.x, y: s.y }
  const air = airbornePosition(f, id)
  if (air) return air
  const pe = f.tl.pattern.find(p => p.aircraftId === id)
  const ps = pe ? samplePattern(pe, f.t) : null
  if (ps) return nmToWorld(ps)
  return s ? { x: s.x, y: s.y } : null
}

// ---------------------------------------------------------------------------------------------
// 8 (layer K): skid marks

export function drawSkids(f: Frame): void {
  if (f.fx === 0) return
  const gz = gate(f.cam.zoom, 0.5)
  if (gz <= 0) return
  const skid = cssVar('--skid') || 'rgba(18,19,21,0.22)'
  const { ctx, cam, dpr } = f
  const A = gz * fxA(f)
  withWorld(ctx, cam, dpr, () => {
    ctx.fillStyle = skid
    // pre-seeded old rubber, at half alpha
    ctx.globalAlpha = 0.5 * A
    ctx.beginPath()
    f.fxi.oldSkids.forEach((m, i) => skidPair(ctx, m.x, m.y, m.heading, 0x01d0 + i))
    ctx.fill()
    // one fresh pair per touchdown so far (at most 24)
    ctx.globalAlpha = A
    ctx.beginPath()
    for (const td of lastBefore(f.fxi.touchdowns, f.t, 24)) skidPair(ctx, td.x, td.y, td.heading, strHash(td.id) ^ Math.round(td.t * 10))
    ctx.fill()
    ctx.globalAlpha = 1
  })
}

/** Two parallel 30 x 1.2 ft streaks (the main gear) running forward from the touchdown point. */
function skidPair(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number, seed: number): void {
  const h = heading * DEG
  const fx = Math.cos(h), fy = Math.sin(h)
  const along = (hash01(seed, 1) * 2 - 1) * 4
  const lat = (hash01(seed, 2) * 2 - 1) * 4
  for (const side of [-5, 5]) {
    const ox = x + fx * along - fy * (side + lat)
    const oy = y + fy * along + fx * (side + lat)
    const len = 30 * (0.8 + 0.4 * hash01(seed, side + 10))
    const w = 0.6
    ctx.moveTo(ox - fy * w, oy + fx * w)
    ctx.lineTo(ox + fx * len - fy * w * 0.6, oy + fy * len + fx * w * 0.6)
    ctx.lineTo(ox + fx * len + fy * w * 0.6, oy + fy * len - fx * w * 0.6)
    ctx.lineTo(ox + fy * w, oy - fx * w)
    ctx.closePath()
  }
}

// ---------------------------------------------------------------------------------------------
// 9 (layer U): blast-cone hatching and heat lines

const BLAST_STATUS = new Set(['on-cat', 'tension', 'salute', 'manned'])

export function drawDeckFxUnder(f: Frame): void {
  if (f.fx === 0) return
  const z = f.cam.zoom
  const gz = gate(z, 0.6)
  if (gz <= 0) return
  const { ctx, cam, dpr } = f
  const A = gz * fxA(f)
  const hatchCol = cssVar('--blast-hatch') || 'rgba(200,71,59,0.30)'
  const heat = cssVar('--heat') || 'rgba(255,255,255,0.20)'

  withWorld(ctx, cam, dpr, () => {
    // 7: blast cones
    const pat = hatch(ctx, hatchCol)
    pat.setTransform(new DOMMatrix().scale(1 / z))
    for (const { a, s } of f.jets) {
      if (!s || !s.visible || !s.power || s.power < 1 || !BLAST_STATUS.has(s.status)) continue
      const spec = SILHOUETTES[a.type]
      const h = s.heading * DEG
      const fx = Math.cos(h), fy = Math.sin(h)
      const nx = s.x - fx * spec.length / 2
      const ny = s.y - fy * spec.length / 2
      const len = s.power === 2 ? 140 : 90
      const hw = len * Math.tan(10 * DEG)
      const ex = nx - fx * len, ey = ny - fy * len
      ctx.save()
      const cat = catOfJet(f.fxi, s, f.t)
      if (cat && f.eq.jbd[cat - 1]! > 0.5) {
        // clipped at the raised JBD: keep only the jet side of the hinge line
        const c = catOf(cat)
        const [h0, h1] = jbdGeometry(c, f.eq.jbd[cat - 1]!).hinge
        const dx = h1.x - h0.x, dy = h1.y - h0.y
        const dl = Math.hypot(dx, dy) || 1
        const ux = dx / dl, uy = dy / dl
        const ch = c.heading * DEG
        const cfx = Math.cos(ch), cfy = Math.sin(ch)
        ctx.beginPath()
        ctx.moveTo(h0.x - ux * 400, h0.y - uy * 400)
        ctx.lineTo(h0.x + ux * 400, h0.y + uy * 400)
        ctx.lineTo(h0.x + ux * 400 + cfx * 1000, h0.y + uy * 400 + cfy * 1000)
        ctx.lineTo(h0.x - ux * 400 + cfx * 1000, h0.y - uy * 400 + cfy * 1000)
        ctx.closePath()
        ctx.clip()
      }
      ctx.beginPath()
      ctx.moveTo(nx - fy * 3.5, ny + fx * 3.5)
      ctx.lineTo(ex - fy * (hw + 3.5), ey + fx * (hw + 3.5))
      ctx.lineTo(ex + fy * (hw + 3.5), ey - fx * (hw + 3.5))
      ctx.lineTo(nx + fy * 3.5, ny - fx * 3.5)
      ctx.closePath()
      ctx.globalAlpha = A
      ctx.fillStyle = pat
      ctx.fill()
      ctx.strokeStyle = hatchCol
      ctx.lineWidth = 1 / z
      ctx.stroke()
      ctx.restore()
    }

    // 8: heat lines off a raised JBD whose jet is at power
    if (f.fx >= 2) {
      ctx.strokeStyle = heat
      ctx.lineWidth = 0.8 / z
      for (let i = 0; i < 4; i++) {
        const raise = f.eq.jbd[i]!
        if (raise <= 0.5) continue
        const cat = (i + 1) as CatId
        if (!catJetAtPower(f, cat, 1)) continue
        const c = catOf(cat)
        const top = jbdGeometry(c, raise).top
        const ch = c.heading * DEG
        const afx = -Math.cos(ch), afy = -Math.sin(ch)
        const t0 = top[0], t1 = top[1]
        const span = Math.hypot(t1.x - t0.x, t1.y - t0.y)
        const n = Math.max(8, Math.ceil(span))
        for (let k = 0; k < 4; k++) {
          // each line rises off the top edge and drifts aft over ~2 s, fading in and out
          const d = (k / 4 + f.t * 0.5) % 1
          const off = 1 + d * 14
          ctx.globalAlpha = A * Math.sin(Math.PI * d)
          ctx.beginPath()
          for (let j = 0; j <= n; j++) {
            const u = j / n
            const sAlong = u * span
            const w = 1.2 * Math.sin((2 * Math.PI * sAlong) / 6 + f.t * 3 + k * 1.7)
            const px = t0.x + (t1.x - t0.x) * u + afx * (off + w)
            const py = t0.y + (t1.y - t0.y) * u + afy * (off + w)
            if (j === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.stroke()
        }
      }
    }
    ctx.globalAlpha = 1
  })
}

/** The jet on this cat (on-cat, tension, salute) has at least this power. */
function catJetAtPower(f: Frame, cat: CatId, min: number): AircraftState | null {
  for (const { s } of f.jets) {
    if (!s || !s.visible || (s.power ?? 0) < min) continue
    if (s.status === 'shot') continue
    if (catOfJet(f.fxi, s, f.t) === cat) return s
  }
  return null
}

// ---------------------------------------------------------------------------------------------
// 14 (layer O): steam, smoke, sparks, speed lines, cat lights, lens ring, JBD steam

export function drawDeckFxOver(f: Frame): void {
  if (f.fx === 0) return
  const z = f.cam.zoom
  const full = f.fx >= 2
  const t = f.t
  const puffs: Puff[] = []
  const fxi = f.fxi

  // 1-3 catapult steam
  const g1 = gate(z, 0.15)
  if (g1 > 0) {
    const sparse = z < 0.35
    const n0 = puffs.length
    for (const sh of inWindow(fxi.shots, t - 10, t)) strokeSteam(f, sh, puffs, sparse)
    for (let i = n0; i < puffs.length; i++) puffs[i]!.a *= g1
  }
  if (full) {
    const g2 = gate(z, 0.3)
    if (g2 > 0) {
      const n0 = puffs.length
      for (const sh of inWindow(fxi.shots, t - 5.5, t - 2)) waterBrake(f, sh, puffs)
      for (let i = n0; i < puffs.length; i++) puffs[i]!.a *= g2
    }
    if (f.b.detail > 0) {
      for (const sh of inWindow(fxi.shots, t - 45 - 2 - WISP_LIFE, t - 2)) slotWisps(f, sh, puffs, f.b.detail)
    }
    const g6 = gate(z, 0.6)
    if (g6 > 0) {
      const n0 = puffs.length
      // 4 battery venting and 9 JBD spray, both while tensioned
      for (const w of tensionAt(fxi, t, Math.max(VENT_LIFE, SPRAY_LIFE))) {
        batteryVent(f, w, puffs)
        jbdSpray(f, w, puffs)
      }
      // 10 JBD cooling steam
      for (const e of inWindow(fxi.jbdDown, t - 15, t)) jbdCooling(f, e.index, e.t, puffs)
      for (let i = n0; i < puffs.length; i++) puffs[i]!.a *= g6
    }
  }
  // 13 tyre smoke
  const g13 = gate(z, 0.3)
  if (g13 > 0) {
    const smoke = splitColor(cssVar('--tyre-smoke') || 'rgba(236,236,232,0.6)')
    for (const td of inWindow(fxi.touchdowns, t - 2.7, t)) tyreSmoke(f, td, puffs, smoke.rgb, smoke.a * g13)
  }
  drawPuffs(f, puffs)

  const { ctx, cam, dpr } = f
  const A = fxA(f)
  withWorld(ctx, cam, dpr, () => {
    // 11 shuttle streak and speed lines
    const g11 = gate(z, 0.5)
    if (g11 > 0) {
      for (const { a, s } of f.jets) {
        if (!s || !s.visible || s.status !== 'shot') continue
        const sh = inWindow(fxi.shots, t - 3, t).find(x => x.id === a.id)
        if (!sh) continue
        drawShotLines(f, sh, a, s, g11 * A)
      }
    }

    // 12 cat deck lights through tension and salute
    const g12 = gate(z, 0.5)
    if (g12 > 0) {
      for (const w of tensionAt(fxi, t)) {
        const s = sampleOf(f, w.id)
        if (!s || !s.power) continue
        const col = cssVar(s.power === 2 ? '--beacon-amber' : '--beacon-green') || (s.power === 2 ? '#ffb000' : '#39d353')
        const c = catOf(w.cat)
        const p = towardTrack(c.iccs, c, 5)
        light(ctx, p, 1.25, 5, col, g12 * A)
      }
    }

    // 15 hook-skip sparks (bolters only)
    const g15 = gate(z, 0.8)
    if (g15 > 0) {
      const spark = cssVar('--spark') || '#ffd27a'
      for (const td of inWindow(fxi.touchdowns, t - 0.6, t)) {
        if (td.kind !== 'bolter') continue
        drawSparks(f, td, spark, g15 * A)
      }
    }

    // 16 wave-off lens lights
    const g16 = gate(z, 0.4)
    if (g16 > 0 && inWindow(fxi.waveoffs, t - 6, t).length) {
      const on = f.reduced || Math.floor(t * 3.6) % 2 === 0
      if (on) {
        const red = cssVar('--beacon-red') || '#ff3b30'
        const p = DECK.iflols
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = 0.7 * g16 * A
        ctx.drawImage(glowTinted(splitColor(red).rgb), p.x - 14, p.y - 14, 28, 28)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = g16 * A
        ctx.strokeStyle = red
        ctx.lineWidth = Math.max(1.5 / z, 1)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  })
}

function towardTrack(p: Vec2, c: Catapult, d: number): Vec2 {
  const dx = c.end.x - c.start.x, dy = c.end.y - c.start.y
  const L2 = dx * dx + dy * dy
  const u = ((p.x - c.start.x) * dx + (p.y - c.start.y) * dy) / L2
  const qx = c.start.x + dx * u - p.x, qy = c.start.y + dy * u - p.y
  const l = Math.hypot(qx, qy) || 1
  return { x: p.x + (qx / l) * d, y: p.y + (qy / l) * d }
}

/** A small light: a solid dot plus an additive glow (world ft). */
function light(ctx: CanvasRenderingContext2D, p: Vec2, rDot: number, rGlow: number, color: string, alpha: number): void {
  const { rgb } = splitColor(color)
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 0.8 * alpha
  ctx.drawImage(glowTinted(rgb), p.x - rGlow, p.y - rGlow, rGlow * 2, rGlow * 2)
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(p.x, p.y, rDot, 0, Math.PI * 2)
  ctx.fill()
}

function drawShotLines(f: Frame, sh: ShotFx, a: AircraftEntity, s: AircraftState, alpha: number): void {
  const { ctx } = f
  const z = f.cam.zoom
  const c = catOf(sh.cat)
  // shuttle streak: where the shuttle was 0.3 s ago to where it is now
  const p1 = trackPoint(c, shuttleU(sh.t, f.t))
  const p0 = trackPoint(c, shuttleU(sh.t, f.t - 0.3))
  const sl = Math.hypot(p1.x - p0.x, p1.y - p0.y)
  if (sl > 0.5) {
    const g = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(1, `rgba(255,255,255,${OVER_JET_MAX})`) // spec 0.6, held to R2's 0.55 over the jet
    ctx.globalAlpha = alpha
    ctx.strokeStyle = g
    ctx.lineWidth = Math.max(1.5 / z, 1.2)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.stroke()
  }
  // speed lines: 3 hairlines trailing the jet, growing with the stroke
  const u = Math.min(1, (f.t - sh.t) / 2)
  const len = 40 * u
  if (len < 1) return
  const spec = SILHOUETTES[a.type]
  const h = s.heading * DEG
  const fx = Math.cos(h), fy = Math.sin(h)
  ctx.globalAlpha = 0.4 * alpha
  ctx.strokeStyle = cssVar('--mark-white') || '#e8e6df'
  ctx.lineWidth = 1 / z
  ctx.lineCap = 'butt'
  ctx.beginPath()
  for (const [lat, back] of [[-0.42 * spec.span, 4], [0.42 * spec.span, 4], [0, 10]] as const) {
    const bx = s.x - fx * (spec.length / 2 + back) - fy * lat
    const by = s.y - fy * (spec.length / 2 + back) + fx * lat
    ctx.moveTo(bx, by)
    ctx.lineTo(bx - fx * len, by - fy * len)
  }
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawSparks(f: Frame, td: { t: number; id: string }, color: string, alpha: number): void {
  const s = sampleOf(f, td.id)
  const a = entity(f, td.id)
  if (!s || !s.visible || !a) return
  const { ctx } = f
  const z = f.cam.zoom
  const spec = SILHOUETTES[a.type]
  const age = f.t - td.t
  const h = s.heading * DEG
  const fx = Math.cos(h), fy = Math.sin(h)
  const hx = s.x - fx * (spec.length / 2 - 2)
  const hy = s.y - fy * (spec.length / 2 - 2)
  const bucket = Math.floor(f.t * 30) // sparks re-hash on 1/30 s sim buckets
  const fade = 1 - age / 0.6
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const th = h + Math.PI + (hash01(bucket, i, 1) * 2 - 1) * 25 * DEG
    const L = 6 + 8 * hash01(bucket, i, 2)
    const st = hash01(bucket, i, 3) * 2
    const dx = Math.cos(th), dy = Math.sin(th)
    ctx.moveTo(hx + dx * st, hy + dy * st)
    ctx.lineTo(hx + dx * (st + L), hy + dy * (st + L))
  }
  // additive glow, then a thin solid core so the streaks still read over the white-hot plume
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = alpha * fade
  ctx.lineWidth = Math.max(2.5 / z, 0.6)
  ctx.stroke()
  ctx.globalCompositeOperation = 'source-over'
  ctx.lineWidth = Math.max(1 / z, 0.3)
  ctx.stroke()
  ctx.globalAlpha = 1
}

// ---------------------------------------------------------------------------------------------
// 13 (layer E): exhaust, drawn inside the aircraft transform before the body

/** In the jet-local frame: clip to the jet's side of its raised JBD's hinge line, so the plume ends on the panel. */
function clipAtJbd(ctx: CanvasRenderingContext2D, s: AircraftState, f: Frame): void {
  const cat = catOfJet(f.fxi, s, f.t)
  if (!cat || s.status === 'shot') return
  const raise = f.eq.jbd[cat - 1]!
  if (raise <= 0.5) return
  const [w0, w1] = jbdGeometry(catOf(cat), raise).hinge
  const h = -s.heading * DEG
  const c = Math.cos(h), sn = Math.sin(h)
  const loc = (p: Vec2): Vec2 => {
    const dx = p.x - s.x, dy = p.y - s.y
    return { x: dx * c - dy * sn, y: dx * sn + dy * c }
  }
  const a = loc(w0), b = loc(w1)
  const dl = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const ux = (b.x - a.x) / dl, uy = (b.y - a.y) / dl
  // normal pointing at the jet (the origin)
  let nx = -uy, ny = ux
  if (nx * -a.x + ny * -a.y < 0) {
    nx = -nx
    ny = -ny
  }
  ctx.beginPath()
  ctx.moveTo(a.x - ux * 200, a.y - uy * 200)
  ctx.lineTo(a.x + ux * 200, a.y + uy * 200)
  ctx.lineTo(a.x + ux * 200 + nx * 400, a.y + uy * 200 + ny * 400)
  ctx.lineTo(a.x - ux * 200 + nx * 400, a.y - uy * 200 + ny * 400)
  ctx.closePath()
  ctx.clip()
}

/** Jet-local frame (1 unit = 1 ft, origin at mid-length, x forward). */
export function drawExhaust(ctx: CanvasRenderingContext2D, spec: SilhouetteSpec, s: AircraftState, z: number, f: Frame): void {
  if (f.fx === 0 || !s.power || s.status === 'airborne') return
  const A = fxA(f)
  const tail = -spec.length / 2
  // the plume starts at the nozzle exit (2 ft forward of the stabilator tips); the body hides its root
  const x0 = tail + 2
  ctx.save()
  if (s.power === 2) {
    if (z < 0.25) {
      ctx.restore()
      return
    }
    const burner = cssVar('--burner') || '#ffb14a'
    if (z < 0.4) {
      // far: one 6 px glow dot
      const r = 4.5 / z
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = A
      ctx.drawImage(glowTinted(splitColor(burner).rgb), tail - r, -r, r * 2, r * 2)
      ctx.restore()
      return
    }
    const flick = f.reduced ? 1 : 1 + 0.05 * Math.sin(f.nowMs * 0.031 + (strHash(s.id) % 1000))
    const L = (s.status === 'shot' ? 40 : 26) * flick
    clipAtJbd(ctx, s, f)
    const spr = burnerSprite()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = A
    for (const ny of [-1.9, 1.9]) {
      if (spr) {
        ctx.save()
        ctx.translate(x0, ny)
        ctx.scale(-1, 1)
        ctx.drawImage(spr.img, spr.sx, spr.sy, spr.sw, spr.sh, 0, -2.5, L, 5)
        ctx.restore()
        continue
      }
      // procedural cone: outer body, white-hot core, shock diamonds up close
      const Lo = L
      const go = ctx.createLinearGradient(x0, 0, x0 - Lo, 0)
      go.addColorStop(0, withAlpha(burner, 0.95))
      go.addColorStop(0.55, withAlpha(burner, 0.45))
      go.addColorStop(1, withAlpha(burner, 0))
      ctx.fillStyle = go
      ctx.beginPath()
      ctx.moveTo(x0, ny - 1.7)
      ctx.quadraticCurveTo(x0 - Lo * 0.45, ny - 1.9, x0 - Lo, ny)
      ctx.quadraticCurveTo(x0 - Lo * 0.45, ny + 1.9, x0, ny + 1.7)
      ctx.closePath()
      ctx.fill()
      const core = cssVar('--burner-core') || '#fff4dc'
      const Lc = 9 * (L / 26) ** 0.5
      const gc = ctx.createLinearGradient(x0, 0, x0 - Lc, 0)
      gc.addColorStop(0, withAlpha(core, 1))
      gc.addColorStop(1, withAlpha(core, 0))
      ctx.fillStyle = gc
      ctx.beginPath()
      ctx.moveTo(x0, ny - 0.7)
      ctx.lineTo(x0 - Lc, ny)
      ctx.lineTo(x0, ny + 0.7)
      ctx.closePath()
      ctx.fill()
      if (f.b.plat > 0) {
        ctx.fillStyle = cssVar('--burner-diamond') || 'rgba(255,250,236,0.85)'
        const ga = ctx.globalAlpha
        ctx.globalAlpha = A * f.b.plat
        for (let k = 0; k < 4; k++) {
          ctx.beginPath()
          ctx.ellipse(x0 - 2.6 * (k + 1), ny, 0.8, 0.45, 0, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = ga
      }
    }
  } else if (s.power === 1 && z >= 0.4) {
    // MIL: today's short glow
    const len = 9
    const grad = ctx.createLinearGradient(tail, 0, tail - len, 0)
    grad.addColorStop(0, cssVar('--burner-glow') || 'rgba(255,220,180,0.35)')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.globalAlpha = A * gate(z, 0.4)
    ctx.beginPath()
    ctx.moveTo(tail + 2, -3.2)
    ctx.lineTo(tail - len, -1.2)
    ctx.lineTo(tail - len, 1.2)
    ctx.lineTo(tail + 2, 3.2)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}
