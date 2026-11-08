import type { Camera } from './camera'
import type { CrewAction, CrewEntity, CrewRole } from '../sim/types'
import type { CrewState, VehicleState } from '../sim/sample'
import { ROLES } from '../data/crewRoles'
import { tokens } from './tokens'

/** Hand signals shown as a small glyph at the top-left of a person while the signal is given. */
export const SIGNALS: { glyph: string; label: string }[] = [
  { glyph: '👋', label: 'Director signalling a pilot' },
  { glyph: '☝️', label: 'Arm overhead: engine start, JBD, wire clear' },
  { glyph: '👍', label: 'Ready: hook-up crew and final checkers' },
  { glyph: '🙌', label: 'Shooter: final turn-up to full power' },
  { glyph: '🫡', label: 'Salute: plane captain, then the pilot' },
  { glyph: '👉', label: 'Shooter: launch' },
  { glyph: '👇', label: 'Deck edge: fire' },
  { glyph: '🙅', label: 'Checker: suspend, arms crossed' },
  { glyph: '✋', label: 'Shooter: hold' },
  { glyph: '🙋', label: 'LSO with the pickle up' },
  { glyph: '🔴', label: 'LSO: wave-off lights' },
]

/** The glyph a person shows for an action, if it is a hand signal. */
export function signalGlyph(role: CrewRole, action: CrewAction): string | null {
  const yellow = role === 'director' || role === 'shooter' || role === 'handler'
  switch (action) {
    case 'direct':
      return yellow ? '👋' : '☝️'
    case 'thumbs-up':
      return '👍'
    case 'hands-up':
      return '🙌'
    case 'salute':
      return '🫡'
    case 'pickle':
      return '🙋'
    case 'signal-launch':
      return role === 'shooter' ? '👉' : '👇'
    case 'wave-off':
      return role === 'lso' ? '🔴' : role === 'checker' ? '🙅' : '✋'
    default:
      return null
  }
}

/** Font size in px for a signal glyph at this zoom; null below the zoom where people are legible. */
export function signalSize(z: number): number | null {
  if (z <= 1.2) return null
  return Math.max(12, Math.min(24, 4.2 * z))
}

/**
 * Draw one signal glyph with its top-left-of-the-dot placement and a short pop-in.
 * `since` is simulation seconds since the signal began.
 */
export function drawSignal(ctx: CanvasRenderingContext2D, glyph: string, x: number, y: number, r: number, z: number, since: number): void {
  const fs = signalSize(z)
  if (fs === null) return
  const T = tokens()
  // pop-in over the first 1.2 s of simulation time, with a little overshoot
  const p = Math.min(1, since / 1.2)
  const scale = p < 1 ? 0.6 + 0.55 * Math.sin((p * Math.PI) / 2) - 0.15 * Math.sin(p * Math.PI) ** 2 : 1
  const cx = x - r - fs * 0.5
  const cy = y - r - fs * 0.5
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.font = `${fs}px ${T.fontEmoji}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = Math.min(1, 0.4 + p)
  ctx.fillText(glyph, 0, 0)
  ctx.restore()
}

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
  // at whole-deck and phone zoom a smaller floor keeps a person well under half a jet's span
  const r = Math.max(z < 0.6 ? 1.3 : 2.2, 1.1 * z)
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
  if (z >= 0.6) {
    // small dots stay flat jersey colour
    ctx.lineWidth = Math.max(0.6, 0.35 * z)
    ctx.strokeStyle = T.deckEdge
    ctx.stroke()
  }

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

  // action cue: a signalling person gets a small pulse ring and the hand-signal glyph
  const glyph = dimmed ? null : signalGlyph(e.role, s.action)
  if (glyph && z > 1.2) {
    const ph = (timeSec * 1.5) % 1
    ctx.beginPath()
    ctx.arc(sc.x + ox, sc.y + oy, r * (1.4 + ph * 1.6), 0, Math.PI * 2)
    ctx.strokeStyle = colour
    ctx.globalAlpha = (1 - ph) * 0.8
    ctx.lineWidth = Math.max(0.6, 0.3 * z)
    ctx.stroke()
    ctx.globalAlpha = 1
    drawSignal(ctx, glyph, sc.x + ox, sc.y + oy, r, z, s.since)
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
