import { Camera, CameraTween } from './render/camera'
import { attachInput } from './ui/input'
import { Clock } from './sim/clock'
import { DECK, VIEWS } from './data/deck'
import { drawDeck } from './render/deck'
import { drawAircraft, hitAircraft } from './render/aircraft'
import { drawCrew, drawVehicle } from './render/crew'
import { sampleAircraft, sampleCrew, sampleEquipment, sampleVehicle } from './sim/sample'
import { tokens } from './render/tokens'
import type { CrewRole, Timeline } from './sim/types'
import { buildTimeline } from './sim/planner/index'
import { mountUI, type UIState } from './ui/panel'

const canvas = document.getElementById('deck') as HTMLCanvasElement
const ctx = canvas.getContext('2d', { alpha: false })!
const cam = new Camera()
const tween = new CameraTween(cam)

const timeline: Timeline = buildTimeline()
const clock = new Clock(timeline.duration)

const ui: UIState = {
  selectedAircraft: null,
  highlightRoles: null,
  showLabels: true,
  follow: false,
  muted: true,
}

function resize(): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  cam.resize(w, h)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
window.addEventListener('resize', resize)
resize()

function goView(id: string, instant = false): void {
  const v = VIEWS.find(x => x.id === id) ?? VIEWS[0]!
  const target = new Camera()
  target.resize(cam.w, cam.h)
  target.fit(v.minX, v.minY, v.maxX, v.maxY, 48)
  if (instant) cam.state = target.state
  else tween.to(target.state, 0.7)
  ui.follow = false
}
goView('deck', true)

attachInput(
  canvas,
  cam,
  tween,
  () => {
    ui.follow = false
  },
  screen => {
    const t = clock.t
    let hit: string | null = null
    for (const a of timeline.aircraft) {
      const s = sampleAircraft(a, t)
      if (s && hitAircraft(cam, a, s, screen)) {
        hit = a.id
        break
      }
    }
    ui.selectedAircraft = hit === ui.selectedAircraft ? null : hit
    panel.refresh()
  },
)

const panel = mountUI({ timeline, clock, ui, goView, views: VIEWS, cam, tween })

// URL parameters for deep links and automated screenshots: ?t=120&view=bow&zoom=2&cx=800&cy=0&nointro=1
{
  const q = new URLSearchParams(location.search)
  const t = Number(q.get('t'))
  if (q.get('view')) goView(q.get('view')!, true)
  if (q.get('cx') && q.get('cy')) {
    cam.cx = Number(q.get('cx'))
    cam.cy = Number(q.get('cy'))
  }
  const z = Number(q.get('zoom'))
  if (z > 0 && z !== 1) cam.zoomAt({ x: cam.w / 2, y: cam.h / 2 }, z)
  if (Number.isFinite(t) && q.has('t')) clock.seek(t)
  if (q.get('nointro')) {
    document.querySelector('.intro')?.classList.add('hidden')
    clock.playing = false
  }
  if (q.get('play')) clock.playing = true
  panel.refresh()
}

let last = performance.now()
function frame(now: number): void {
  const dt = Math.min(0.1, (now - last) / 1000)
  last = now
  const ended = clock.tick(dt)
  if (ended) panel.refresh()
  tween.update(dt)

  const t = clock.t
  const T = tokens()

  // background sea
  ctx.fillStyle = T.sea
  ctx.fillRect(0, 0, cam.w, cam.h)

  const eq = sampleEquipment(timeline.equipment, t)
  drawDeck(ctx, cam, DECK, eq, ui.showLabels)

  // vehicles under aircraft
  for (const v of timeline.vehicles) {
    const s = sampleVehicle(v, t)
    if (s) drawVehicle(ctx, cam, s)
  }

  // aircraft (parked first, moving last so movers draw on top)
  const states = timeline.aircraft.map(a => ({ a, s: sampleAircraft(a, t) }))
  states.sort((p, q) => {
    const mp = p.s && (p.s.status !== 'parked' && p.s.status !== 'manned') ? 1 : 0
    const mq = q.s && (q.s.status !== 'parked' && q.s.status !== 'manned') ? 1 : 0
    return mp - mq
  })
  let followTarget: { x: number; y: number } | null = null
  for (const { a, s } of states) {
    if (!s) continue
    const selected = ui.selectedAircraft === a.id
    drawAircraft(ctx, cam, a, s, { selected, dim: ui.highlightRoles !== null, showModex: true })
    if (selected && s.visible) followTarget = { x: s.x, y: s.y }
  }

  // crew
  const hl: Set<CrewRole> | null = ui.highlightRoles
  for (const c of timeline.crew) {
    const s = sampleCrew(c, t)
    if (s) drawCrew(ctx, cam, c, s, hl, now / 1000)
  }

  if (ui.follow && followTarget && !tween.active) {
    cam.cx += (followTarget.x - cam.cx) * Math.min(1, dt * 4)
    cam.cy += (followTarget.y - cam.cy) * Math.min(1, dt * 4)
  }

  panel.tick(t)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
