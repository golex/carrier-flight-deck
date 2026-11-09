import type { Camera } from './camera'
import { cssVar } from './tokens'

/** ?perf=1: rolling p95 of the main draw time in ms, over the last 120 frames. */
const N = 120
const samples = new Float64Array(N)
let count = 0
let head = 0
let start = 0

export function perfBegin(): void {
  start = performance.now()
}

export function perfEnd(): void {
  samples[head] = performance.now() - start
  head = (head + 1) % N
  if (count < N) count++
}

export function perfP95(): number {
  if (count === 0) return 0
  const sorted = Array.from(samples.subarray(0, count)).sort((a, b) => a - b)
  return sorted[Math.min(count - 1, Math.floor(count * 0.95))]!
}

/** A small readout at the top centre (CSS px), clear of the header block and the side panel. */
export function drawPerf(ctx: CanvasRenderingContext2D, cam: Camera): void {
  const text = `p95 ${perfP95().toFixed(1)} ms · ${count} f`
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
