// Lane D: generated FX textures (public/img/fx/*.webp) with a procedural fallback for every one.
// Everything is baked lazily on first use and cached; a bake is redone only when an asset lands
// (assetsVersion) or the CSS tokens are re-read (resetSprites). No getter ever throws or returns
// something undrawable, except burnerSprite(), whose null means "draw the procedural cone".

import { cssVar } from './tokens'
import { hash01, sstep, withAlpha } from './frame'

export type FxAsset = 'sea' | 'steam' | 'burner' | 'foam'

const FILES: Record<FxAsset, string> = {
  sea: 'sea-height.webp',
  steam: 'steam-sheet.webp',
  burner: 'burner.webp',
  foam: 'foam.webp',
}

const imgs: Partial<Record<FxAsset, HTMLImageElement>> = {}
let version = 0
let loading: Promise<void> | null = null

async function loadOne(a: FxAsset): Promise<void> {
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = `${import.meta.env.BASE_URL}img/fx/${FILES[a]}`
    await img.decode() // rejects on 404, on an HTML fallback page, or on a bad file
    if (!img.naturalWidth || !img.naturalHeight) return
    imgs[a] = img
    version++
  } catch {
    // silent: the procedural fallback stays in use
  }
}

/** Fetch from `${import.meta.env.BASE_URL}img/fx/…`; never rejects. Safe to call more than once. */
export function loadFxAssets(): Promise<void> {
  if (!loading) {
    loading = typeof Image === 'undefined'
      ? Promise.resolve()
      : Promise.all((Object.keys(FILES) as FxAsset[]).map(loadOne)).then(() => undefined, () => undefined)
  }
  return loading
}

export function assetReady(a: FxAsset): boolean {
  return imgs[a] !== undefined
}

/** Increments whenever an asset finishes loading (and on resetSprites); consumers re-key caches on it. */
export function assetsVersion(): number {
  return version
}

export interface SpriteCell { img: CanvasImageSource; sx: number; sy: number; sw: number; sh: number }

// ------------------------------------------------------------------------------------------------
// helpers

function canvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}
function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  return c.getContext('2d', { willReadFrequently: true })!
}

/** Per-context pattern cache, keyed by a string that includes the bake generation. */
let patCache = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasPattern>>()
function cachedPattern(ctx: CanvasRenderingContext2D, key: string, src: () => CanvasImageSource): CanvasPattern {
  let m = patCache.get(ctx)
  if (!m) { m = new Map(); patCache.set(ctx, m) }
  let p = m.get(key)
  if (!p) {
    p = ctx.createPattern(src(), 'repeat')!
    m.set(key, p)
  }
  return p
}
/** Bumped by resetSprites(): token-coloured bakes and patterns are keyed on it. */
let tokenGen = 0

// ------------------------------------------------------------------------------------------------
// glow

let glow: HTMLCanvasElement | null = null

/** 64 px radial white -> transparent (beacons, lights, cat lights). */
export function glowSprite(): HTMLCanvasElement {
  if (!glow) {
    glow = canvas(64, 64)
    const g = glow.getContext('2d')!
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.25, 'rgba(255,255,255,0.55)')
    grad.addColorStop(0.6, 'rgba(255,255,255,0.14)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
  }
  return glow
}

// ------------------------------------------------------------------------------------------------
// steam

let puffSheet: HTMLCanvasElement | null = null
let puffCells: SpriteCell[] | null = null
let steamCells: SpriteCell[] | null = null

/** 4 procedural puffs side by side (256x64): a soft core plus three hashed lobes, so not a perfect disc. */
function proceduralPuffs(): SpriteCell[] {
  if (!puffCells) {
    puffSheet = canvas(256, 64)
    const g = puffSheet.getContext('2d')!
    const blob = (x: number, y: number, r: number, a: number): void => {
      const grad = g.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, `rgba(255,255,255,${a})`)
      grad.addColorStop(0.45, `rgba(255,255,255,${a * 0.6})`)
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grad
      g.beginPath()
      g.arc(x, y, r, 0, Math.PI * 2)
      g.fill()
    }
    puffCells = []
    for (let v = 0; v < 4; v++) {
      const cx = v * 64 + 32
      blob(cx, 32, 20, 0.8)
      for (let l = 0; l < 3; l++) {
        const ang = (l / 3 + hash01(v, l, 1) * 0.3) * Math.PI * 2
        const d = 6 + 5 * hash01(v, l, 2)
        const r = 11 + 6 * hash01(v, l, 3)
        blob(cx + Math.cos(ang) * d, 32 + Math.sin(ang) * d, r, 0.5 + 0.3 * hash01(v, l, 4))
      }
      puffCells.push({ img: puffSheet, sx: v * 64, sy: 0, sw: 64, sh: 64 })
    }
  }
  return puffCells
}

/** 16 sheet cells, or 4 procedural puff variants (k % 4) as the fallback. */
export function steamCell(k: number): SpriteCell {
  const i = (((k | 0) % 16) + 16) % 16
  const sheet = imgs.steam
  if (sheet) {
    if (!steamCells || steamCells[0]!.img !== sheet) {
      const cw = sheet.naturalWidth / 4, ch = sheet.naturalHeight / 4
      steamCells = []
      for (let j = 0; j < 16; j++) steamCells.push({ img: sheet, sx: (j % 4) * cw, sy: Math.floor(j / 4) * ch, sw: cw, sh: ch })
    }
    return steamCells[i]!
  }
  return proceduralPuffs()[i % 4]!
}

// ------------------------------------------------------------------------------------------------
// burner

let burnerCell: SpriteCell | null = null

/** null -> the caller draws the procedural cone. RGB on black, meant for `lighter`; plume flows +x from sx. */
export function burnerSprite(): SpriteCell | null {
  const img = imgs.burner
  if (!img) return null
  if (!burnerCell || burnerCell.img !== img) burnerCell = { img, sx: 0, sy: 0, sw: img.naturalWidth, sh: img.naturalHeight }
  return burnerCell
}

// ------------------------------------------------------------------------------------------------
// foam

let stipple: HTMLCanvasElement | null = null

/**
 * Procedural foam strip, the same size and layout as foam.webp (1024x256, a dense band through the
 * middle breaking into filaments above and below) so the caller's pattern scale suits either.
 * Ridged value noise (1 - |n|) thresholded into lace, baked at 512x128 and drawn up 2x; plus fine bubbles.
 */
function foamStipple(): HTMLCanvasElement {
  if (!stipple) {
    const W = 512, H = 128
    const lace = noiseField(W, H, 48, 12, 3, 91, 0.55)
    const dens = noiseField(W, H, 8, 2, 2, 93, 0.5)
    const half = canvas(W, H)
    const g = half.getContext('2d')!
    const id = g.createImageData(W, H)
    const o = id.data
    for (let y = 0; y < H; y++) {
      const v = (y + 0.5) / H - 0.5
      const band = Math.exp(-(v * v) / (2 * 0.17 * 0.17)) // dense through the middle third
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        const d = band * (0.55 + 0.45 * sstep(dens[i]!, -0.5, 0.5))
        const ridge = 1 - Math.abs(lace[i]!) * 1.5
        const a = sstep(ridge, 0.86 - 0.5 * d, 0.99) * (0.15 + 0.7 * d) + 0.35 * d * d
        const k = i * 4
        o[k] = o[k + 1] = o[k + 2] = 255
        o[k + 3] = Math.round(255 * Math.min(0.9, a))
      }
    }
    g.putImageData(id, 0, 0)
    stipple = canvas(W * 2, H * 2)
    const g2 = stipple.getContext('2d')!
    g2.imageSmoothingQuality = 'high'
    g2.drawImage(half, 0, 0, W * 2, H * 2)
    // fine bubbles, mostly inside the band, wrapped across the edges
    const SW = W * 2, SH = H * 2
    for (let i = 0; i < 700; i++) {
      const x = hash01(i, 1, 92) * SW
      const y = SH * (0.5 + (hash01(i, 2, 92) - 0.5) * (0.35 + 0.65 * hash01(i, 5, 92)))
      const r = 0.6 + 1.4 * hash01(i, 3, 92) ** 2
      g2.fillStyle = `rgba(255,255,255,${(0.25 + 0.5 * hash01(i, 4, 92)).toFixed(3)})`
      for (const ox of [-SW, 0, SW]) {
        if (x + ox + r < 0 || x + ox - r > SW) continue
        g2.beginPath()
        g2.arc(x + ox, y, r, 0, Math.PI * 2)
        g2.fill()
      }
    }
  }
  return stipple
}

/** Generated foam, else a procedural stipple. White with alpha; the caller sets the pattern transform. */
export function foamPattern(ctx: CanvasRenderingContext2D): CanvasPattern {
  const img = imgs.foam
  return img ? cachedPattern(ctx, `foam:img:${version}`, () => img) : cachedPattern(ctx, 'foam:proc', foamStipple)
}

// ------------------------------------------------------------------------------------------------
// sea

/**
 * Signed tileable value-noise fBm on a W x H tile. Octave o has (px << o) by (py << o) lattice cells
 * across the tile (integers, so it wraps); amplitude falls by `gain` per octave.
 */
function noiseField(W: number, H: number, px: number, py: number, octaves: number, seed: number, gain: number): Float32Array {
  const out = new Float32Array(W * H)
  const ux = new Float32Array(W), i0x = new Int32Array(W), i1x = new Int32Array(W)
  let amp = 1
  for (let o = 0; o < octaves; o++) {
    const Px = px << o, Py = py << o
    const lat = new Float32Array(Px * Py)
    // nested hash: no linear structure left in the lattice (which showed as diagonal streaks)
    for (let j = 0; j < Py; j++) for (let i = 0; i < Px; i++) lat[j * Px + i] = hash01(i, (hash01(j, seed, o) * 1e9) | 0, seed + o) * 2 - 1
    for (let x = 0; x < W; x++) {
      const fx = (x * Px) / W, ix = Math.floor(fx), t = fx - ix
      ux[x] = t * t * (3 - 2 * t); i0x[x] = ix % Px; i1x[x] = (ix + 1) % Px
    }
    for (let y = 0; y < H; y++) {
      const fy = (y * Py) / H, iy = Math.floor(fy), ty = fy - iy, uy = ty * ty * (3 - 2 * ty)
      const r0 = (iy % Py) * Px, r1 = ((iy + 1) % Py) * Px
      for (let x = 0; x < W; x++) {
        const u = ux[x]!, i0 = i0x[x]!, i1 = i1x[x]!
        const a = lat[r0 + i0]!, b = lat[r0 + i1]!, c = lat[r1 + i0]!, d = lat[r1 + i1]!
        const top = a + (b - a) * u, bot = c + (d - c) * u
        out[y * W + x]! += amp * (top + (bot - top) * uy)
      }
    }
    amp *= gain
  }
  return out
}

/** Square tileable fBm normalised to mean 0.5 and SD 0.18 (the same statistics as the generated tile). */
function fbm(size: number, octaves: number, seed: number, px: number, py: number, gain: number): Float32Array {
  const H = noiseField(size, size, px, py, octaves, seed, gain)
  normalise(H)
  return H
}

function normalise(H: Float32Array): void {
  let m = 0
  for (let i = 0; i < H.length; i++) m += H[i]!
  m /= H.length
  let s = 0
  for (let i = 0; i < H.length; i++) s += (H[i]! - m) ** 2
  s = Math.sqrt(s / H.length) || 1
  for (let i = 0; i < H.length; i++) H[i] = Math.min(1, Math.max(0, 0.5 + ((H[i]! - m) / s) * 0.18))
}

interface Height { H: Float32Array; size: number }
let swellH: Height | null = null
let chopProcH: Height | null = null
let chopImgH: { img: HTMLImageElement; h: Height } | null = null

function heightField(kind: 'swell' | 'chop'): Height {
  if (kind === 'swell') return (swellH ??= { H: fbm(256, 3, 7, 8, 8, 0.5), size: 256 })
  const img = imgs.sea
  if (img) {
    if (!chopImgH || chopImgH.img !== img) {
      const size = Math.min(img.naturalWidth, img.naturalHeight)
      const c = canvas(size, size)
      const g = ctx2d(c)
      g.drawImage(img, 0, 0)
      const d = g.getImageData(0, 0, size, size).data
      const H = new Float32Array(size * size)
      for (let i = 0; i < H.length; i++) H[i] = d[i * 4]! / 255
      chopImgH = { img, h: { H, size } }
    }
    return chopImgH.h
  }
  return (chopProcH ??= { H: fbm(256, 5, 11, 6, 12, 0.62), size: 256 }) // crests stretched along x, as in the generated tile
}

/** Height field -> one RGBA tile: colour = token RGB, alpha = token alpha x curve(H). */
const LUT_N = 1024
const littleEndian = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1
function bakeLayer(h: Height, color: string, curve: (v: number) => number): HTMLCanvasElement {
  const c = canvas(h.size, h.size)
  const g = c.getContext('2d')! // GPU-backed: this tile is only ever a pattern source
  const id = g.createImageData(h.size, h.size)
  const m = withAlpha(color || 'rgba(0,0,0,0)', 1).match(/[\d.]+/g)!
  const r = +m[0]!, gr = +m[1]!, b = +m[2]!, a = +m[3]! * 255
  // one packed RGBA word per quantised height (H is 8-bit from the image, so 1024 steps lose nothing)
  const lut = new Uint32Array(LUT_N + 1)
  for (let q = 0; q <= LUT_N; q++) {
    const al = Math.round(a * curve(q / LUT_N))
    lut[q] = littleEndian ? ((al << 24) | (b << 16) | (gr << 8) | r) >>> 0 : ((r << 24) | (gr << 16) | (b << 8) | al) >>> 0
  }
  const o = new Uint32Array(id.data.buffer)
  const H = h.H
  for (let i = 0; i < H.length; i++) o[i] = lut[(H[i]! * LUT_N + 0.5) | 0]!
  g.putImageData(id, 0, 0)
  return c
}

const seaBakes = new Map<string, { crest: HTMLCanvasElement; trough: HTMLCanvasElement; px: number }>()

export function seaTiles(kind: 'swell' | 'chop', ctx: CanvasRenderingContext2D): { crest: CanvasPattern; trough: CanvasPattern; px: number } {
  const src = kind === 'chop' && imgs.sea ? 'img' : 'proc'
  const key = `sea:${kind}:${src}:${tokenGen}`
  let bake = seaBakes.get(key)
  if (!bake) {
    const h = heightField(kind)
    bake = {
      crest: bakeLayer(h, cssVar('--sea-crest'), v => sstep(v, 0.58, 0.88)),
      trough: bakeLayer(h, cssVar('--sea-trough'), v => sstep(v, 0.42, 0.12)),
      px: h.size,
    }
    for (const k of seaBakes.keys()) if (k.startsWith(`sea:${kind}:`)) seaBakes.delete(k)
    seaBakes.set(key, bake)
  }
  const b = bake
  return {
    crest: cachedPattern(ctx, `${key}:crest`, () => b.crest),
    trough: cachedPattern(ctx, `${key}:trough`, () => b.trough),
    px: b.px,
  }
}

// ------------------------------------------------------------------------------------------------
// hatching

const hatchTiles = new Map<string, HTMLCanvasElement>()

/** 16 px tile, 45 deg 1 px lines (wraps seamlessly). */
export function hatchPattern(ctx: CanvasRenderingContext2D, color: string): CanvasPattern {
  return cachedPattern(ctx, `hatch:${color}`, () => {
    let c = hatchTiles.get(color)
    if (!c) {
      c = canvas(16, 16)
      const g = c.getContext('2d')!
      g.strokeStyle = color
      g.lineWidth = 1
      g.beginPath()
      g.moveTo(-4, 20); g.lineTo(20, -4)
      g.moveTo(-4, 4); g.lineTo(4, -4)
      g.moveTo(12, 20); g.lineTo(20, 12)
      g.stroke()
      hatchTiles.set(color, c)
    }
    return c
  })
}

// ------------------------------------------------------------------------------------------------

/**
 * The integrator calls it next to resetTokens(). Drops every token-coloured bake and cached pattern
 * (loaded images and colour-free bakes stay), and bumps assetsVersion so consumers' caches re-key.
 */
export function resetSprites(): void {
  tokenGen++
  patCache = new WeakMap()
  seaBakes.clear()
  hatchTiles.clear()
  version++
}
