import type { Camera } from './camera'
import type { AircraftEntity } from '../sim/types'
import type { AircraftState, CrewState } from '../sim/sample'
import { SILHOUETTES } from '../data/silhouettes'
import { tokens } from './tokens'

/** half-angle of the pilot's gaze cone, degrees */
const CONE_HALF_DEG = 9
/** the gaze swings from the old director to the new one over this many simulation seconds */
const SWING_S = 1.0
/** the hand-off pointer (old director to new) stays visible this long */
const PASS_S = 2.5

const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u))

/**
 * Who has this jet: a green cone from the cockpit to the director (or shooter) the pilot is taking
 * direction from, a ring on that director, and for a moment after each hand-off a pointer from the
 * previous director to the new one.
 */
export function drawControl(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  e: AircraftEntity,
  s: AircraftState,
  crew: Map<string, CrewState>,
  strong: boolean,
): void {
  if (!s.director) return
  const d = crew.get(s.director)
  if (!d) return
  const T = tokens()
  const z = cam.zoom
  const len = SILHOUETTES[e.type].length
  const h = (s.heading * Math.PI) / 180
  const cockpit = { x: s.x + Math.cos(h) * (len / 2 - 14), y: s.y + Math.sin(h) * (len / 2 - 14) }

  // the gaze: swings from the previous director to the new one just after a hand-off
  let aim = { x: d.x, y: d.y }
  const prev = s.prevDirector ? crew.get(s.prevDirector) : undefined
  if (prev && s.directorSince < SWING_S) {
    const k = smooth(s.directorSince / SWING_S)
    aim = { x: prev.x + (d.x - prev.x) * k, y: prev.y + (d.y - prev.y) * k }
  }
  const dx = aim.x - cockpit.x
  const dy = aim.y - cockpit.y
  const reach = Math.hypot(dx, dy)
  if (reach < 2) return
  const ang = Math.atan2(dy, dx)
  const half = Math.tan((CONE_HALF_DEG * Math.PI) / 180)
  const sc = cam.worldToScreen(cockpit)

  ctx.save()
  ctx.translate(sc.x, sc.y)
  ctx.rotate(ang)
  ctx.scale(z, z)
  const far = reach + 6
  const grad = ctx.createLinearGradient(0, 0, far, 0)
  grad.addColorStop(0, T.vision)
  grad.addColorStop(0.75, T.vision)
  grad.addColorStop(1, T.vision2)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(far, -far * half)
  ctx.arc(0, 0, far, -Math.atan(half), Math.atan(half))
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.globalAlpha = strong ? 1 : 0.5
  ctx.fill()
  ctx.restore()

  // the director who has the jet
  const ds = cam.worldToScreen({ x: d.x, y: d.y })
  const r = Math.max(z < 0.6 ? 1.3 : 2.2, 1.1 * z)
  ctx.save()
  ctx.strokeStyle = T.visionInk
  ctx.lineWidth = Math.max(1, 0.35 * z)
  ctx.globalAlpha = strong ? 0.9 : 0.5
  ctx.beginPath()
  ctx.arc(ds.x, ds.y, r * 2.4, 0, Math.PI * 2)
  ctx.stroke()

  // the hand-off: a pointer from the old director to the new one, fading out
  if (prev && s.directorSince < PASS_S) {
    const ps = cam.worldToScreen({ x: prev.x, y: prev.y })
    const vx = ds.x - ps.x
    const vy = ds.y - ps.y
    const L = Math.hypot(vx, vy)
    if (L > 4) {
      const ux = vx / L
      const uy = vy / L
      const tipBack = r * 2.4 + 2
      const tx = ds.x - ux * tipBack
      const ty = ds.y - uy * tipBack
      ctx.globalAlpha = (1 - s.directorSince / PASS_S) * (strong ? 1 : 0.6)
      ctx.strokeStyle = T.markYellow
      ctx.fillStyle = T.markYellow
      ctx.lineWidth = Math.max(1.2, 0.4 * z)
      ctx.setLineDash([Math.max(3, z), Math.max(2, 0.7 * z)])
      ctx.beginPath()
      ctx.moveTo(ps.x + ux * (r * 1.6), ps.y + uy * (r * 1.6))
      ctx.lineTo(tx, ty)
      ctx.stroke()
      ctx.setLineDash([])
      const ah = Math.max(5, 1.6 * z)
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(tx - ux * ah - uy * ah * 0.5, ty - uy * ah + ux * ah * 0.5)
      ctx.lineTo(tx - ux * ah + uy * ah * 0.5, ty - uy * ah - ux * ah * 0.5)
      ctx.closePath()
      ctx.fill()
    }
  }
  ctx.restore()
}
