import type { Camera } from './camera'
import type { CrewEntity, CrewRole } from '../sim/types'
import type { CrewState, VehicleState } from '../sim/sample'
import { ROLES } from '../data/crewRoles'
import { tokens } from './tokens'

/** Crew are drawn as small discs in jersey colour with a dark outline; 2 ft diameter in world units, with a px floor. */
export function drawCrew(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  e: CrewEntity,
  s: CrewState,
  highlight: Set<CrewRole> | null,
  timeSec: number,
): void {
  const T = tokens()
  const z = cam.zoom
  const info = ROLES[e.role]
  const colour = T.jersey[info.jersey] ?? T.jersey.white!
  const sc = cam.worldToScreen({ x: s.x, y: s.y })
  const r = Math.max(2.2, 1.1 * z)
  const dimmed = highlight !== null && !highlight.has(e.role)

  ctx.save()
  ctx.globalAlpha = dimmed ? 0.18 : 1

  // walking bob: tiny oscillation perpendicular to heading
  let ox = 0
  let oy = 0
  if (s.action === 'walk' && z > 1.5) {
    const ph = Math.sin(timeSec * 9 + s.x * 0.37) * 0.25 * z
    const hr = (s.heading * Math.PI) / 180
    ox = -Math.sin(hr) * ph
    oy = Math.cos(hr) * ph
  }

  ctx.beginPath()
  ctx.arc(sc.x + ox, sc.y + oy, r, 0, Math.PI * 2)
  ctx.fillStyle = colour
  ctx.fill()
  ctx.lineWidth = Math.max(0.6, 0.35 * z)
  ctx.strokeStyle = T.deckEdge
  ctx.stroke()

  // heading tick at mid zoom and above
  if (z > 2.2) {
    const hr = (s.heading * Math.PI) / 180
    ctx.beginPath()
    ctx.moveTo(sc.x + ox, sc.y + oy)
    ctx.lineTo(sc.x + ox + Math.cos(hr) * r * 1.7, sc.y + oy + Math.sin(hr) * r * 1.7)
    ctx.strokeStyle = T.deckEdge
    ctx.lineWidth = Math.max(0.6, 0.3 * z)
    ctx.stroke()
  }

  // role glyphs at high zoom: shooter gets a ring, LSO a bar, checker a checker dot
  if (z > 3.5) {
    ctx.lineWidth = Math.max(0.6, 0.3 * z)
    if (e.role === 'shooter' || e.role === 'lso' || e.role === 'safety') {
      ctx.beginPath()
      ctx.arc(sc.x + ox, sc.y + oy, r * 1.6, 0, Math.PI * 2)
      ctx.strokeStyle = colour
      ctx.stroke()
    }
    if (e.role === 'checker') {
      ctx.beginPath()
      ctx.arc(sc.x + ox, sc.y + oy, r * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = T.jersey.green!
      ctx.fill()
    }
    if (e.role === 'medical') {
      ctx.strokeStyle = T.jersey.red!
      ctx.beginPath()
      ctx.moveTo(sc.x + ox - r * 0.6, sc.y + oy)
      ctx.lineTo(sc.x + ox + r * 0.6, sc.y + oy)
      ctx.moveTo(sc.x + ox, sc.y + oy - r * 0.6)
      ctx.lineTo(sc.x + ox, sc.y + oy + r * 0.6)
      ctx.stroke()
    }
  }

  // action cue: signalling yellow shirt gets a small pulse ring
  if ((s.action === 'direct' || s.action === 'signal-launch' || s.action === 'wave-off') && z > 1.2 && !dimmed) {
    const ph = (timeSec * 1.5) % 1
    ctx.beginPath()
    ctx.arc(sc.x + ox, sc.y + oy, r * (1.4 + ph * 1.6), 0, Math.PI * 2)
    ctx.strokeStyle = colour
    ctx.globalAlpha = (1 - ph) * 0.8
    ctx.lineWidth = Math.max(0.6, 0.3 * z)
    ctx.stroke()
  }

  ctx.restore()
}

export function drawVehicle(ctx: CanvasRenderingContext2D, cam: Camera, v: VehicleState): void {
  const T = tokens()
  const z = cam.zoom
  const sc = cam.worldToScreen({ x: v.x, y: v.y })
  ctx.save()
  ctx.translate(sc.x, sc.y)
  ctx.rotate((v.heading * Math.PI) / 180)
  ctx.scale(z, z)
  ctx.fillStyle = v.kind === 'tractor' ? T.jersey.yellow! : v.kind === 'fire-truck' ? T.jersey.red! : T.island2
  if (v.kind === 'tractor') {
    // A/S32A-32 style low tow tractor: ~10 ft x 6 ft
    ctx.fillRect(-5, -3, 10, 6)
    ctx.fillStyle = T.deckEdge
    ctx.fillRect(-1, -2, 2, 4)
  } else if (v.kind === 'fire-truck') {
    ctx.fillRect(-9, -4, 18, 8)
  } else {
    // crash crane ("Tilly"): ~ 28 ft x 10 ft with a boom
    ctx.fillRect(-14, -5, 28, 10)
    ctx.fillStyle = T.deckEdge
    ctx.fillRect(0, -1, 22, 2)
  }
  ctx.strokeStyle = T.deckEdge
  ctx.lineWidth = 0.5
  ctx.strokeRect(-5, -3, 10, 6)
  ctx.restore()
}

/** Legend swatch helper for the DOM panel. */
export function jerseyColour(role: CrewRole): string {
  const T = tokens()
  return T.jersey[ROLES[role].jersey] ?? T.jersey.white!
}
