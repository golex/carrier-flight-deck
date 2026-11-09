import type { Camera } from './camera'
import { cssVar } from './tokens'

/**
 * ?perf=1: rolling p95s over the last 120 frames.
 * - frame: the interval between successive frames (perfBegin runs once per rAF), so it includes
 *   everything outside the timed block too (panel.tick, GPU/raster, compositor). This is the §8 number.
 * - draw: CPU time spent submitting the main draw, perfBegin → perfEnd.
 */
const N = 120
/** Frame gaps longer than this (tab hidden, debugger pause) are not frame time; skip them. */
const MAX_GAP_MS = 1000

interface Ring { buf: Float64Array; count: number; head: number }
const ring = (): Ring => ({ buf: new Float64Array(N), count: 0, head: 0 })
const frameMs = ring()
const drawMs = ring()

function push(r: Ring, v: number): void {
  r.buf[r.head] = v
  r.head = (r.head + 1) % N
  if (r.count < N) r.count++
}

function p95(r: Ring): number {
  if (r.count === 0) return 0
  const sorted = Array.from(r.buf.subarray(0, r.count)).sort((a, b) => a - b)
  return sorted[Math.min(r.count - 1, Math.floor(r.count * 0.95))]!
}

let start = 0
let prevBegin = -1

export function perfBegin(): void {
  start = performance.now()
  if (prevBegin >= 0) {
    const gap = start - prevBegin
    if (gap <= MAX_GAP_MS) perfFrame(gap)
  }
  prevBegin = start
}

export function perfEnd(): void {
  push(drawMs, performance.now() - start)
}

/** Records one frame interval in ms. perfBegin calls this itself; exported for a caller that has rAF deltas. */
export function perfFrame(dtMs: number): void {
  push(frameMs, dtMs)
}

/** Rolling p95 of the frame interval (ms): the §8 performance check. */
export function perfP95(): number {
  return p95(frameMs)
}

/** Rolling p95 of the CPU draw-submission time (ms). */
export function perfDrawP95(): number {
  return p95(drawMs)
}

/** A small readout at the top centre (CSS px), clear of the header block and the side panel. */
export function drawPerf(ctx: CanvasRenderingContext2D, cam: Camera): void {
  const text = `frame p95 ${perfP95().toFixed(1)} ms · draw p95 ${perfDrawP95().toFixed(1)} ms · ${frameMs.count} f`
  ctx.save()
  ctx.font = `11px ${cssVar('--font-mono')}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 3
  ctx.strokeStyle = cssVar('--hud-halo')
  ctx.fillStyle = cssVar('--hud-ink')
  const x = cam.w / 2
  const y = 8
  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)
  ctx.restore()
}
