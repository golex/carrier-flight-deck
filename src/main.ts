import { Camera, CameraTween, tweenDuration } from './render/camera'
import { attachInput } from './ui/input'
import { Clock } from './sim/clock'
import { DECK, VIEWS } from './data/deck'
import { drawDeck, drawDeckLabels } from './render/deck'
import { drawAircraft, hitAircraft } from './render/aircraft'
import { drawCrew, drawVehicle } from './render/crew'
import { drawControl } from './render/control'
import type { CrewState } from './sim/sample'
import { sampleAircraft, sampleCrew, sampleEquipment, sampleVehicle } from './sim/sample'
import { resetTokens } from './render/tokens'
import type { CrewRole, PatternKeyframe, Timeline, Vec2 } from './sim/types'
import { buildTimeline } from './sim/planner/index'
import { mountUI, type UIState } from './ui/panel'
import { drawPatternInset, patternInsetBox } from './render/pattern'
import { phaseAt, samplePattern } from './sim/sample'
import { fxLevel, reducedMotion, zoomBands, type Frame, type JetSample } from './render/frame'
import { perfBegin, perfEnd, drawPerf } from './render/perf'
import { drawSea, drawWake, drawBowWave, drawShipShadow } from './render/sea'
import { drawShipUnder, drawIsland } from './render/ship'
import { buildFxIndex } from './render/fxIndex'
import { drawSeaFx, drawSkids, drawDeckFxUnder, drawDeckFxOver } from './render/fx'
import { loadFxAssets, resetSprites } from './render/sprites'
import { irisGeometry, drawScope, hitScope, type Iris } from './render/scope'
import { airborneJets, drawAircraftShadows, drawAirborne, hitAirborne, airbornePosition, type AirJet } from './render/airborne'
import { drawCatTags, drawCallouts, drawScaleBar } from './render/hud'

const canvas = document.getElementById('deck') as HTMLCanvasElement
const ctx = canvas.getContext('2d', { alpha: false })!
const cam = new Camera()
const tween = new CameraTween(cam)

const timeline: Timeline = buildTimeline()
const clock = new Clock(timeline.duration)
const query = new URLSearchParams(location.search)
const showPerf = query.get('perf') === '1'

/**
 * Dev-only hook for the overhead-pattern inset: `?fakepattern=1` pushes two synthetic pattern tracks
 * (one jet flying the Case I pattern to the ramp around t = 960-1063 s, one bolter climbing out) and
 * `?fakepattern=stack` adds six jets holding in marshal. Harmless when absent; never used by the planner.
 */
{
  const mode = new URLSearchParams(location.search).get('fakepattern')
  const ids = timeline.aircraft.map(a => a.id)
  type W = [number, number, number, number, PatternKeyframe['leg']]
  const track = (ws: W[]): PatternKeyframe[] => ws.map(([t, x, y, alt, leg]) => ({ t, x, y, alt, leg }))
  if (mode === '1' && ids.length >= 2) {
    timeline.pattern.push({
      aircraftId: ids[0]!,
      track: track([
        [940, -3.2, 0.15, 800, 'initial'], [990, 0, 0.08, 800, 'break'], [1000, 1.2, -0.56, 800, 'break'],
        [1008, 0.6, -1.2, 600, 'downwind'], [1025, -0.1, -1.2, 600, 'abeam'], [1037, -1.15, -0.55, 450, 'ninety'],
        [1047, -0.83, 0.12, 360, 'groove'], [1063, -0.09, 0, 60, 'none'],
      ]),
    })
    timeline.pattern.push({
      aircraftId: ids[1]!,
      track: track([[985, -0.05, 0, 60, 'bolter'], [1020, 1.6, -0.2, 1200, 'bolter'], [1021, 1.6, -0.2, 1200, 'none']]),
    })
  }
  if (mode === 'stack') {
    ids.slice(0, 6).forEach((id, i) => {
      const a = (i / 6) * Math.PI * 2
      timeline.pattern.push({
        aircraftId: id,
        track: track([[0, 0.5 + Math.cos(a), -2.6 + Math.sin(a), 2000 + 1000 * (i % 3), 'marshal'], [2400, 0.5, -2.6, 2000, 'marshal']]),
      })
    })
  }
}

// FX triggers, indexed once (after the dev pattern hook so every track is in)
const fxi = buildFxIndex(timeline, DECK)
// generated textures; every consumer has a procedural fallback until (or unless) they arrive
void loadFxAssets()
// canvas palette and baked sprites re-read the CSS tokens when the colour scheme flips
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  resetTokens()
  resetSprites()
})

const ui: UIState = {
  selectedAircraft: null,
  highlightRoles: null,
  showLabels: true,
  follow: false,
  muted: true,
}

let dpr = 1
function resize(): void {
  dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  cam.resize(w, h)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
window.addEventListener('resize', resize)
resize()

/** Screen areas covered by UI chrome, so views are framed in the free part of the canvas. */
function chromeInset() {
  const narrow = window.innerWidth <= 760
  const app = document.getElementById('app')
  const panelOpen = !narrow && !(app?.classList.contains('panel-hidden') ?? false)
  return { left: 0, right: panelOpen ? 352 : 0, top: narrow ? 90 : 64, bottom: narrow ? 76 + 0.42 * window.innerHeight : 76 }
}

function panelOpen(): boolean {
  return !document.getElementById('app')?.classList.contains('panel-hidden')
}

/** The inset is on screen: labels on, inside its zoom band, and the same pattern / recovery rule pattern.ts fades on. */
function insetShown(t: number, insetBand: number): boolean {
  if (!ui.showLabels || insetBand <= 0.01) return false
  if (phaseAt(timeline, t)?.id === 'recovery') return true
  return timeline.pattern.some(e => {
    const s = samplePattern(e, t)
    return !!s && s.leg !== 'none'
  })
}

function goView(id: string, instant = false): void {
  const v = VIEWS.find(x => x.id === id) ?? VIEWS[0]!
  const target = new Camera()
  target.resize(cam.w, cam.h)
  target.fit(v.minX, v.minY, v.maxX, v.maxY, 24, chromeInset())
  const dur = tweenDuration(cam.zoom, target.zoom)
  if (instant || dur <= 0) {
    tween.cancel()
    cam.state = target.state
  } else tween.to(target.state, dur)
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
    // 1. the pattern inset opens the whole-pattern view
    const box = patternInsetBox(cam, panelOpen())
    if (box && insetShown(t, zoomBands(cam.zoom).inset) && inBox(screen, box)) {
      goView('pattern')
      return
    }
    // 2. deck aircraft, 3. airborne silhouettes, 4. scope tracks
    let hit: string | null = null
    if (!last || last.f.b.world) {
      for (const a of timeline.aircraft) {
        const s = sampleAircraft(a, t)
        if (s && hitAircraft(cam, a, s, screen)) {
          hit = a.id
          break
        }
      }
    }
    if (!hit && last) hit = hitAirborne(last.f, last.air, screen)
    if (!hit && last && last.f.b.scope > 0) hit = hitScope(last.f, last.iris, last.air, screen)
    ui.selectedAircraft = hit === ui.selectedAircraft ? null : hit
    panel.refresh()
  },
)

function inBox(p: Vec2, b: { x: number; y: number; w: number; h: number }): boolean {
  return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h
}

// pointer cursor over the inset (input.ts and the CSS own grab / grabbing)
canvas.addEventListener('pointermove', e => {
  const r = canvas.getBoundingClientRect()
  const box = patternInsetBox(cam, panelOpen())
  const over = !!box && insetShown(clock.t, zoomBands(cam.zoom).inset) && inBox({ x: e.clientX - r.left, y: e.clientY - r.top }, box)
  canvas.style.cursor = over ? 'pointer' : ''
})

const panel = mountUI({ timeline, clock, ui, goView, views: VIEWS, cam, tween })

// URL parameters for deep links and automated screenshots: ?t=120&view=bow&zoom=2&cx=800&cy=0&nointro=1
{
  const q = query
  const t = Number(q.get('t'))
  if (q.get('view')) goView(q.get('view')!, true)
  if (q.get('cx') && q.get('cy')) {
    cam.cx = Number(q.get('cx'))
    cam.cy = Number(q.get('cy'))
  }
  const z = Number(q.get('zoom'))
  if (z > 0 && z !== 1) {
    // zoom about the centre of the free canvas (where goView framed the view), not the raw canvas centre under the panel
    const ins = chromeInset()
    cam.zoomAt({ x: ins.left + (cam.w - ins.left - ins.right) / 2, y: ins.top + (cam.h - ins.top - ins.bottom) / 2 }, z)
  }
  if (Number.isFinite(t) && q.has('t')) clock.seek(t)
  if (q.get('nointro')) {
    document.querySelector('.intro')?.classList.add('hidden')
    clock.playing = false
  }
  if (q.get('play')) clock.playing = true
  // dev hooks: sel=<modex> selects a jet, hl=yellow highlights the yellow shirts
  if (q.get('sel')) ui.selectedAircraft = timeline.aircraft.find(a => a.modex === q.get('sel'))?.id ?? null
  if (q.get('hl') === 'yellow') ui.highlightRoles = new Set<CrewRole>(['director', 'shooter', 'handler', 'air-boss'])
  panel.refresh()
}

/** The previous frame's context, for hit testing between frames. */
let last: { f: Frame; iris: Iris; air: AirJet[] } | null = null
/** Offscreen layer for the crew while it fades with zoom (drawCrew sets globalAlpha itself, so a plain multiplier would be lost). */
let crewLayer: HTMLCanvasElement | null = null
let crewCtx: CanvasRenderingContext2D | null = null

function crewTarget(): CanvasRenderingContext2D {
  if (!crewLayer || !crewCtx || crewLayer.width !== canvas.width || crewLayer.height !== canvas.height) {
    crewLayer = document.createElement('canvas')
    crewLayer.width = canvas.width
    crewLayer.height = canvas.height
    crewCtx = crewLayer.getContext('2d')!
  }
  crewCtx.setTransform(1, 0, 0, 1, 0, 0)
  crewCtx.clearRect(0, 0, crewLayer.width, crewLayer.height)
  crewCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return crewCtx
}

let lastNow = performance.now()
function frame(now: number): void {
  const dt = Math.min(0.1, (now - lastNow) / 1000)
  lastNow = now
  const ended = clock.tick(dt)
  if (ended) panel.refresh()
  tween.update(dt)
  perfBegin()

  const t = clock.t
  const eq = sampleEquipment(timeline.equipment, t)
  // every aircraft sampled once per frame (unsorted; the draw loop sorts a copy)
  const jets: JetSample[] = timeline.aircraft.map(a => ({ a, s: sampleAircraft(a, t) }))
  const f: Frame = {
    ctx,
    cam,
    dpr,
    t,
    nowMs: now,
    speed: clock.playing ? clock.speed : 0,
    reduced: reducedMotion(),
    fx: fxLevel(),
    dim: ui.highlightRoles !== null,
    b: zoomBands(cam.zoom),
    tl: timeline,
    eq,
    jets,
    fxi,
  }
  const iris = irisGeometry(f)
  const air = airborneJets(f)
  const selectedId = ui.selectedAircraft
  let followTarget: Vec2 | null = null

  if (f.b.world) {
    drawSea(f) // 1
    drawWake(f) // 2
    drawSeaFx(f) // 3 low-pass ruffle
    drawBowWave(f) // 4
    drawShipShadow(f, DECK) // 5
    drawShipUnder(f, DECK) // 6 sponsons, catwalk, net, grating
    drawDeck(f, DECK) // 7 surface, markings, JBDs, wires
    drawSkids(f) // 8
    drawDeckFxUnder(f) // 9 blast-cone hatching, heat lines
    drawIsland(f, DECK) // 10

    // 11 vehicles under aircraft
    for (const v of timeline.vehicles) {
      const s = sampleVehicle(v, t)
      if (s) drawVehicle(ctx, cam, s)
    }

    drawAircraftShadows(f, air) // 12

    // 13 aircraft (parked first, moving last so movers draw on top)
    const order = jets.slice().sort((p, q) => {
      const mp = p.s && p.s.status !== 'parked' && p.s.status !== 'manned' ? 1 : 0
      const mq = q.s && q.s.status !== 'parked' && q.s.status !== 'manned' ? 1 : 0
      return mp - mq
    })
    for (const { a, s } of order) {
      if (!s) continue
      const selected = selectedId === a.id
      drawAircraft(ctx, cam, a, s, { selected, dim: f.dim, showModex: true, frame: f })
      if (selected && s.visible) followTarget = { x: s.x, y: s.y }
    }

    drawDeckFxOver(f) // 14 steam, smoke, sparks, lights, speed lines

    // 15 crew, faded by the zoom band and skipped below it; nothing but labels is drawn over them
    const hl: Set<CrewRole> | null = ui.highlightRoles
    const crewStates = new Map<string, CrewState>()
    if (f.b.crew > 0) {
      const fading = f.b.crew < 0.999
      const cctx = fading ? crewTarget() : ctx
      for (const c of timeline.crew) {
        const s = sampleCrew(c, t)
        if (!s) continue
        crewStates.set(c.id, s)
        drawCrew(cctx, cam, c, s, hl, f.reduced ? 0 : now / 1000) // cosmetic jiggle and pulse stop under reduced motion
      }
      if (fading && crewLayer) {
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalAlpha = f.b.crew
        ctx.drawImage(crewLayer, 0, 0)
        ctx.restore()
      }
    }
    // 16 who has each jet: the pilot's line of sight to the director, strong for the selected jet,
    // for every directed jet while the yellow shirts are highlighted
    const allControl = hl !== null && hl.has('director')
    for (const { a, s } of order) {
      if (!s || !s.visible || !s.director) continue
      const strong = selectedId === a.id
      if (strong || allControl) drawControl(ctx, cam, a, s, crewStates, strong)
    }
    // 17 deck labels over the jets and crew so parked aircraft never hide them; hud.ts owns the cat tags
    if (ui.showLabels) {
      drawDeckLabels(ctx, cam, DECK, { skipCats: true })
      drawCatTags(f, DECK)
      drawCallouts(f)
    }

    drawAirborne(f, air, iris, selectedId) // 18
  }
  if (f.b.scope > 0) drawScope(f, iris, air, selectedId) // 19

  // 20
  const open = panelOpen()
  drawPatternInset(ctx, cam, timeline, t, { visible: ui.showLabels, panelOpen: open, alphaMul: f.b.inset })

  // 21 scale bar: its right end and baseline in screen CSS px; bottom-right of the free canvas, above the
  // transport bar (or the phone sheet), clear of the side panel; the inset sits bottom-left (top-right on phones)
  const narrow = cam.w <= 760
  drawScaleBar(f, {
    right: cam.w - 16 - (open && !narrow ? 352 : 0),
    bottom: cam.h - (narrow ? 76 + 0.42 * cam.h : 76) - 10,
  })

  // follow the selected jet across bands: its deck sample while visible, else its pattern position
  if (ui.follow && selectedId && !followTarget) followTarget = airbornePosition(f, selectedId)
  if (ui.follow && followTarget && !tween.active) {
    cam.cx += (followTarget.x - cam.cx) * Math.min(1, dt * 4)
    cam.cy += (followTarget.y - cam.cy) * Math.min(1, dt * 4)
  }

  last = { f, iris, air }
  perfEnd()
  if (showPerf) drawPerf(ctx, cam)

  panel.tick(t)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
