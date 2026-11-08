import type { Vec2 } from '../sim/types'

/**
 * 2-D camera mapping world feet → CSS pixels.
 * Screen convention: bow (+x) points RIGHT, starboard (+y) points DOWN,
 * so the island sits bottom-right and the angled deck sweeps up-left.
 */
export class Camera {
  /** world point at the screen centre */
  cx = 546
  cy = 0
  /** pixels per foot */
  zoom = 1
  /** viewport size in CSS px */
  w = 1
  h = 1

  minZoom = 0.25
  maxZoom = 14

  resize(w: number, h: number): void {
    this.w = w
    this.h = h
  }

  worldToScreen(p: Vec2): Vec2 {
    return { x: (p.x - this.cx) * this.zoom + this.w / 2, y: (p.y - this.cy) * this.zoom + this.h / 2 }
  }

  screenToWorld(p: Vec2): Vec2 {
    return { x: (p.x - this.w / 2) / this.zoom + this.cx, y: (p.y - this.h / 2) / this.zoom + this.cy }
  }

  /** Zoom by factor about a screen point so the world point under the cursor stays fixed. */
  zoomAt(screen: Vec2, factor: number): void {
    const before = this.screenToWorld(screen)
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * factor))
    const after = this.screenToWorld(screen)
    this.cx += before.x - after.x
    this.cy += before.y - after.y
  }

  panBy(dxPx: number, dyPx: number): void {
    this.cx -= dxPx / this.zoom
    this.cy -= dyPx / this.zoom
  }

  /** Frame a world rectangle with padding (px). */
  fit(minX: number, minY: number, maxX: number, maxY: number, pad = 40): void {
    const zw = (this.w - pad * 2) / Math.max(1, maxX - minX)
    const zh = (this.h - pad * 2) / Math.max(1, maxY - minY)
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, Math.min(zw, zh)))
    this.cx = (minX + maxX) / 2
    this.cy = (minY + maxY) / 2
  }

  /** Current view for tween targets. */
  get state(): CameraState {
    return { cx: this.cx, cy: this.cy, zoom: this.zoom }
  }

  set state(s: CameraState) {
    this.cx = s.cx
    this.cy = s.cy
    this.zoom = s.zoom
  }

  /** Visible world bounds. */
  bounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    const a = this.screenToWorld({ x: 0, y: 0 })
    const b = this.screenToWorld({ x: this.w, y: this.h })
    return { minX: a.x, minY: a.y, maxX: b.x, maxY: b.y }
  }
}

export interface CameraState {
  cx: number
  cy: number
  zoom: number
}

/** Smoothly tweens the camera toward a target state; call update(dt) each frame. */
export class CameraTween {
  private target: CameraState | null = null
  private from: CameraState | null = null
  private elapsed = 0
  private duration = 0.6

  constructor(private cam: Camera) {}

  to(target: CameraState, duration = 0.6): void {
    this.from = this.cam.state
    this.target = target
    this.elapsed = 0
    this.duration = duration
  }

  cancel(): void {
    this.target = null
  }

  get active(): boolean {
    return this.target !== null
  }

  update(dt: number): void {
    if (!this.target || !this.from) return
    this.elapsed += dt
    const u = Math.min(1, this.elapsed / this.duration)
    const e = u * u * (3 - 2 * u)
    // interpolate zoom in log space so it feels linear
    const lz = Math.exp(Math.log(this.from.zoom) + (Math.log(this.target.zoom) - Math.log(this.from.zoom)) * e)
    this.cam.zoom = lz
    this.cam.cx = this.from.cx + (this.target.cx - this.from.cx) * e
    this.cam.cy = this.from.cy + (this.target.cy - this.from.cy) * e
    if (u >= 1) this.target = null
  }
}
