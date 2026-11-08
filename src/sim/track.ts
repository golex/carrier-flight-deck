import type { Vec2 } from './types'

/** Shortest-arc interpolation between two headings (degrees). */
export function lerpHeading(a: number, b: number, u: number): number {
  const d = ((b - a + 540) % 360) - 180
  return (a + d * u + 360) % 360
}

export function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u
}

export const smooth = (u: number) => u * u * (3 - 2 * u)
export const clamp01 = (u: number) => (u < 0 ? 0 : u > 1 ? 1 : u)

/**
 * Generic keyframe sampler. Finds the segment containing t and returns the
 * surrounding keyframes with the interpolation fraction. Keyframes must be
 * sorted by t. Before the first keyframe → first; after the last → last.
 */
export function segmentAt<K extends { t: number }>(
  track: readonly K[],
  t: number,
): { a: K; b: K; u: number } | null {
  const n = track.length
  if (n === 0) return null
  const first = track[0]!
  if (t <= first.t || n === 1) return { a: first, b: first, u: 0 }
  const last = track[n - 1]!
  if (t >= last.t) return { a: last, b: last, u: 0 }
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (track[mid]!.t <= t) lo = mid
    else hi = mid
  }
  const a = track[lo]!
  const b = track[hi]!
  const span = b.t - a.t
  const u = span > 0 ? (t - a.t) / span : 0
  return { a, b, u }
}

/** 0 = +x (bow), clockwise positive toward +y (starboard). */
export function headingTo(from: Vec2, to: Vec2): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
}

export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function fromHeading(heading: number, length: number): Vec2 {
  const r = (heading * Math.PI) / 180
  return { x: Math.cos(r) * length, y: Math.sin(r) * length }
}

/** Point offset from `p` by `forward` feet along `heading` and `right` feet to its right (starboard side). */
export function offset(p: Vec2, heading: number, forward: number, right: number): Vec2 {
  const r = (heading * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  return { x: p.x + c * forward - s * right, y: p.y + s * forward + c * right }
}

export interface PathPoint {
  x: number
  y: number
  heading: number
}

/**
 * Build a smooth taxi path from `from` (with heading) to `to` (with final heading)
 * using a cubic bezier whose control points extend along the start and end headings.
 * Returns n+1 sampled points with headings.
 */
export function taxiPath(
  from: Vec2,
  startHeading: number,
  to: Vec2,
  endHeading: number,
  n = 24,
  tension = 0.4,
): PathPoint[] {
  const d = dist(from, to)
  const c1 = add(from, fromHeading(startHeading, d * tension))
  const c2 = add(to, fromHeading(endHeading, -d * tension))
  const pts: PathPoint[] = []
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const p = cubic(from, c1, c2, to, u)
    const q = cubic(from, c1, c2, to, Math.min(1, u + 1e-3))
    const p0 = cubic(from, c1, c2, to, Math.max(0, u - 1e-3))
    const h = headingTo(p0, q)
    pts.push({ x: p.x, y: p.y, heading: i === 0 ? startHeading : i === n ? endHeading : h })
  }
  return pts
}

function cubic(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, u: number): Vec2 {
  const v = 1 - u
  return {
    x: v * v * v * p0.x + 3 * v * v * u * p1.x + 3 * v * u * u * p2.x + u * u * u * p3.x,
    y: v * v * v * p0.y + 3 * v * v * u * p1.y + 3 * v * u * u * p2.y + u * u * u * p3.y,
  }
}

/** Total length of a polyline. */
export function pathLength(pts: readonly Vec2[]): number {
  let L = 0
  for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1]!, pts[i]!)
  return L
}

/**
 * Convert a sampled path into keyframes between t0 and t1 with an ease-in/out
 * speed profile (slow start, slow stop) so motion looks like a taxiing aircraft.
 * The caller spreads any extra fields over each keyframe via `extra`.
 */
export function pathToKeyframes<E extends object>(
  pts: readonly PathPoint[],
  t0: number,
  t1: number,
  extra: E,
  ease = true,
): (PathPoint & { t: number } & E)[] {
  const n = pts.length - 1
  if (n <= 0) return pts.map(p => ({ ...p, t: t0, ...extra }))
  // cumulative arc length for constant-speed parametrisation
  const cum: number[] = [0]
  for (let i = 1; i <= n; i++) cum.push(cum[i - 1]! + dist(pts[i - 1]!, pts[i]!))
  const L = cum[n]! || 1
  const out: (PathPoint & { t: number } & E)[] = []
  for (let i = 0; i <= n; i++) {
    const s = cum[i]! / L // 0..1 arc fraction
    // invert the ease: find u such that smooth(u) = s (bisection)
    let u = s
    if (ease) {
      let lo = 0
      let hi = 1
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2
        if (smooth(mid) < s) lo = mid
        else hi = mid
      }
      u = (lo + hi) / 2
    }
    out.push({ ...pts[i]!, t: t0 + (t1 - t0) * u, ...extra })
  }
  return out
}
