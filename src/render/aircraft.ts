import type { Camera } from './camera'
import type { AircraftEntity } from '../sim/types'
import type { AircraftState } from '../sim/sample'
import { SILHOUETTES, type SilhouetteSpec } from '../data/silhouettes'
import { tokens } from './tokens'

interface CompiledSilhouette {
  spec: SilhouetteSpec
  parts: Record<string, Path2D>
}

const compiled = new Map<string, CompiledSilhouette>()

function compile(type: AircraftEntity['type']): CompiledSilhouette {
  let c = compiled.get(type)
  if (c) return c
  const spec = SILHOUETTES[type]
  const parts: Record<string, Path2D> = {}
  for (const [k, d] of Object.entries(spec.parts)) parts[k] = new Path2D(d)
  c = { spec, parts }
  compiled.set(type, c)
  return c
}

/** Draw order: things underneath first. Outer wings are handled separately for the fold. */
const ORDER = ['stabR', 'stabL', 'wingInnerR', 'wingInnerL', 'podsUnderwing', 'fuselage', 'intakes', 'nozzles', 'finR', 'finL', 'canopy']

export interface AircraftDrawOpts {
  selected?: boolean
  dim?: boolean
  showModex?: boolean
}

/**
 * Draws one aircraft at its sampled state. The canvas transform is set so that
 * 1 unit = 1 foot in the aircraft frame (x forward, y starboard), origin at mid-length.
 */
export function drawAircraft(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  e: AircraftEntity,
  s: AircraftState,
  opts: AircraftDrawOpts = {},
): void {
  if (!s.visible) return
  const T = tokens()
  const z = cam.zoom
  const sc = cam.worldToScreen({ x: s.x, y: s.y })
  const { spec, parts } = compile(e.type)

  ctx.save()
  ctx.translate(sc.x, sc.y)
  ctx.rotate((s.heading * Math.PI) / 180)
  ctx.scale(z, z)

  // afterburner / power glow behind the nozzles
  if (s.power && s.power > 0 && z > 0.4) {
    const len = s.power === 2 ? 22 : 9
    const grad = ctx.createLinearGradient(-spec.length / 2, 0, -spec.length / 2 - len, 0)
    grad.addColorStop(0, s.power === 2 ? 'rgba(255,177,74,0.85)' : 'rgba(255,220,180,0.35)')
    grad.addColorStop(1, 'rgba(255,177,74,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(-spec.length / 2 + 2, -3.2)
    ctx.lineTo(-spec.length / 2 - len, -1.2)
    ctx.lineTo(-spec.length / 2 - len, 1.2)
    ctx.lineTo(-spec.length / 2 + 2, 3.2)
    ctx.closePath()
    ctx.fill()
  }

  const fill = opts.dim ? T.jet2 : T.jet
  ctx.fillStyle = fill
  ctx.globalAlpha = opts.dim ? 0.55 : 1

  // low zoom: a simple arrow-like silhouette reads better than detail
  if (z < 0.35) {
    ctx.beginPath()
    ctx.moveTo(spec.length / 2, 0)
    ctx.lineTo(-spec.length / 2, (s.wingSpread > 0.5 ? spec.span : spec.spanFolded) / 2)
    ctx.lineTo(-spec.length / 2 + 8, 0)
    ctx.lineTo(-spec.length / 2, -(s.wingSpread > 0.5 ? spec.span : spec.spanFolded) / 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    return
  }

  // folding outer panels: scale toward the hinge. Residual 0.12 = panel seen edge-on when vertical.
  const sy = 0.12 + 0.88 * s.wingSpread
  const hinge = spec.hingeY
  if (parts.wingOuterR) {
    ctx.save()
    ctx.translate(0, hinge)
    ctx.scale(1, sy)
    ctx.translate(0, -hinge)
    ctx.fill(parts.wingOuterR)
    if (parts.podR) {
      ctx.fillStyle = '#5a6570'
      ctx.fill(parts.podR)
      ctx.fillStyle = fill
    }
    ctx.restore()
  }
  if (parts.wingOuterL) {
    ctx.save()
    ctx.translate(0, -hinge)
    ctx.scale(1, sy)
    ctx.translate(0, hinge)
    ctx.fill(parts.wingOuterL)
    if (parts.podL) {
      ctx.fillStyle = '#5a6570'
      ctx.fill(parts.podL)
      ctx.fillStyle = fill
    }
    ctx.restore()
  }
  for (const k of ORDER) {
    const p = parts[k]
    if (!p) continue
    if (k === 'canopy') ctx.fillStyle = T.canopy
    else if (k === 'finR' || k === 'finL' || k === 'nozzles') ctx.fillStyle = opts.dim ? T.jet2 : '#1e2124'
    else if (k.startsWith('pod')) ctx.fillStyle = '#5a6570'
    else ctx.fillStyle = fill
    ctx.fill(p)
  }

  // hook / launch bar cues at high zoom
  if (z > 2.5) {
    ctx.strokeStyle = T.markYellow
    ctx.lineWidth = 0.5
    if (s.hook) {
      ctx.beginPath()
      ctx.moveTo(-spec.length / 2 + 6, 0)
      ctx.lineTo(-spec.length / 2 - 2, 0)
      ctx.stroke()
    }
    if (s.launchBar) {
      ctx.beginPath()
      ctx.moveTo(spec.length / 2 - 18, 0)
      ctx.lineTo(spec.length / 2 - 12, 0)
      ctx.stroke()
    }
  }

  ctx.globalAlpha = 1
  if (opts.selected) {
    ctx.strokeStyle = T.markYellow
    ctx.lineWidth = 1.2 / Math.max(0.3, Math.min(1, z))
    ctx.setLineDash([3, 2])
    ctx.strokeRect(-spec.length / 2 - 4, -spec.span / 2 - 4, spec.length + 8, spec.span + 8)
    ctx.setLineDash([])
  }
  ctx.restore()

  // modex label (upright, not rotated)
  if (opts.showModex && z > 1.6) {
    ctx.save()
    ctx.font = `${Math.max(9, Math.min(12, 6 + z * 2))}px ${T.fontMono}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = T.markWhite
    ctx.globalAlpha = Math.min(1, (z - 1.6) * 1.5)
    ctx.fillText(e.modex, sc.x, sc.y - (spec.span / 2 + 7) * z)
    ctx.restore()
  }
}

/** Hit test: returns true if the screen point lies within the aircraft's bounding box. */
export function hitAircraft(cam: Camera, e: AircraftEntity, s: AircraftState, screen: { x: number; y: number }): boolean {
  if (!s.visible) return false
  const spec = SILHOUETTES[e.type]
  const w = cam.screenToWorld(screen)
  const dx = w.x - s.x
  const dy = w.y - s.y
  const r = (-s.heading * Math.PI) / 180
  const lx = dx * Math.cos(r) - dy * Math.sin(r)
  const ly = dx * Math.sin(r) + dy * Math.cos(r)
  return Math.abs(lx) <= spec.length / 2 + 3 && Math.abs(ly) <= spec.span / 2 + 3
}
