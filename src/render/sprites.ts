// STUB: lane D fills this in
// Procedural minimums only: every getter returns something drawable so callers never branch on null
// (except burnerSprite, whose null is part of the contract).

export type FxAsset = 'sea' | 'steam' | 'burner' | 'foam'

/** Fetch from `${import.meta.env.BASE_URL}img/fx/…`; never rejects. Stub: loads nothing. */
export function loadFxAssets(): Promise<void> {
  return Promise.resolve()
}

export function assetReady(_a: FxAsset): boolean {
  return false
}

/** Increments whenever an asset finishes loading; consumers re-key caches on it. */
export function assetsVersion(): number {
  return 0
}

export interface SpriteCell { img: CanvasImageSource; sx: number; sy: number; sw: number; sh: number }

let glow: HTMLCanvasElement | null = null
let blank: HTMLCanvasElement | null = null

function canvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function radial(): HTMLCanvasElement {
  const c = canvas(64, 64)
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return c
}

function blankTile(): HTMLCanvasElement {
  if (!blank) blank = canvas(8, 8)
  return blank
}

/** 16 sheet cells, or procedural puff variants as the fallback. Stub: one radial puff. */
export function steamCell(_k: number): SpriteCell {
  const img = glowSprite()
  return { img, sx: 0, sy: 0, sw: 64, sh: 64 }
}

/** 64 px radial white -> transparent (beacons, lights, cat lights). */
export function glowSprite(): HTMLCanvasElement {
  if (!glow) glow = radial()
  return glow
}

/** null -> the caller draws the procedural cone. */
export function burnerSprite(): SpriteCell | null {
  return null
}

/** Generated foam, else a procedural stipple. Stub: a transparent tile. */
export function foamPattern(ctx: CanvasRenderingContext2D): CanvasPattern {
  return ctx.createPattern(blankTile(), 'repeat')!
}

/** Stub: transparent crest and trough tiles. */
export function seaTiles(_kind: 'swell' | 'chop', ctx: CanvasRenderingContext2D): { crest: CanvasPattern; trough: CanvasPattern; px: number } {
  const p = ctx.createPattern(blankTile(), 'repeat')!
  return { crest: p, trough: p, px: 8 }
}

/** 16 px tile, 45 deg 1 px lines. */
export function hatchPattern(ctx: CanvasRenderingContext2D, color: string): CanvasPattern {
  const c = canvas(16, 16)
  const g = c.getContext('2d')!
  g.strokeStyle = color
  g.lineWidth = 1
  g.beginPath()
  g.moveTo(-4, 20)
  g.lineTo(20, -4)
  g.moveTo(-4, 4)
  g.lineTo(4, -4)
  g.moveTo(12, 20)
  g.lineTo(20, 12)
  g.stroke()
  return ctx.createPattern(c, 'repeat')!
}

/** The integrator calls it next to resetTokens(). */
export function resetSprites(): void {
  glow = null
  blank = null
}
