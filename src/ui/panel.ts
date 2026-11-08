import type { Clock } from '../sim/clock'
import { fmtTime } from '../sim/clock'
import type { CrewRole, Timeline } from '../sim/types'
import type { Camera, CameraTween } from '../render/camera'
import { ROLES, ROLE_ORDER, JERSEY_LABEL, type JerseyColour } from '../data/crewRoles'
import { eventsUpTo, phaseAt, sampleCrew } from '../sim/sample'
import { Narrator } from './audio'
import { SIGNALS } from '../render/crew'

export interface UIState {
  selectedAircraft: string | null
  highlightRoles: Set<CrewRole> | null
  showLabels: boolean
  follow: boolean
  muted: boolean
}

export interface UIDeps {
  timeline: Timeline
  clock: Clock
  ui: UIState
  goView: (id: string) => void
  views: { id: string; name: string; key: string }[]
  cam: Camera
  tween: CameraTween
}

const JERSEY_ORDER: JerseyColour[] = ['yellow', 'green', 'blue', 'red', 'brown', 'purple', 'white']

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text !== undefined) e.textContent = text
  return e
}

export function mountUI(d: UIDeps) {
  const { timeline, clock, ui } = d
  const root = document.getElementById('app')!
  const narrator = new Narrator()

  // ---------- header ----------
  const header = el('header', 'hdr')
  const title = el('h1', 'hdr-title', 'Flight Deck')
  const sub = el('p', 'hdr-sub', 'Launch and recovery on a Nimitz-class carrier')
  const phaseLine = el('p', 'hdr-phase')
  header.append(title, sub, phaseLine)

  // ---------- side panel ----------
  const panel = el('aside', 'panel')
  const panelToggle = el('button', 'panel-toggle')
  panelToggle.type = 'button'
  panelToggle.setAttribute('aria-label', 'Toggle information panel')
  panelToggle.textContent = 'i'
  panelToggle.addEventListener('click', () => {
    root.classList.toggle('panel-hidden')
    panelToggle.setAttribute('aria-expanded', String(!root.classList.contains('panel-hidden')))
  })

  const nowSec = el('section', 'sec')
  const nowTitle = el('h2', 'sec-h', 'Now')
  const nowPhase = el('p', 'now-phase')
  const nowBlurb = el('p', 'now-blurb')
  const ticker = el('ol', 'ticker')
  ticker.setAttribute('aria-live', 'polite')
  nowSec.append(nowTitle, nowPhase, nowBlurb, ticker)

  const selSec = el('section', 'sec sel')
  const selTitle = el('h2', 'sec-h', 'Selected aircraft')
  const selBody = el('p', 'sel-body', 'Click a jet on the deck to follow it.')
  const followBtn = el('button', 'btn', 'Follow')
  followBtn.type = 'button'
  followBtn.addEventListener('click', () => {
    ui.follow = !ui.follow
    refresh()
  })
  selSec.append(selTitle, selBody, followBtn)

  const crewSec = el('section', 'sec')
  const crewTitle = el('h2', 'sec-h', 'Crew by jersey')
  const crewNote = el('p', 'sec-note', 'Select a colour to highlight those people on deck.')
  const legend = el('ul', 'legend')
  const counts = new Map<JerseyColour, HTMLElement>()
  const buttons = new Map<JerseyColour, HTMLButtonElement>()
  for (const j of JERSEY_ORDER) {
    const roles = ROLE_ORDER.filter(r => ROLES[r].jersey === j && r !== 'air-boss' && r !== 'handler')
    const li = el('li', 'legend-item')
    const btn = el('button', 'legend-btn')
    btn.type = 'button'
    btn.setAttribute('aria-pressed', 'false')
    const sw = el('span', `swatch swatch-${j}`)
    const name = el('span', 'legend-name', JERSEY_LABEL[j])
    const cnt = el('span', 'legend-count', '')
    btn.append(sw, name, cnt)
    btn.addEventListener('click', () => {
      const set = new Set(roles)
      const same = ui.highlightRoles && [...ui.highlightRoles].every(r => set.has(r)) && ui.highlightRoles.size === set.size
      ui.highlightRoles = same ? null : set
      refresh()
    })
    const desc = el('p', 'legend-desc', roles.map(r => ROLES[r].name).join(' · '))
    li.append(btn, desc)
    legend.append(li)
    counts.set(j, cnt)
    buttons.set(j, btn)
  }
  const sigNote = el('p', 'sec-note', 'Hand signals appear beside a person while they are given (zoom in to see them).')
  const sigList = el('ul', 'signals')
  for (const s of SIGNALS) {
    const li = el('li', 'signal')
    li.append(el('span', 'signal-glyph', s.glyph), el('span', 'signal-label', s.label))
    sigList.append(li)
  }
  crewSec.append(crewTitle, crewNote, legend, sigNote, sigList)

  const viewSec = el('section', 'sec')
  const viewTitle = el('h2', 'sec-h', 'View')
  const viewList = el('div', 'views')
  for (const v of d.views) {
    const b = el('button', 'btn btn-view', v.name)
    b.type = 'button'
    b.dataset.key = v.key
    b.addEventListener('click', () => d.goView(v.id))
    viewList.append(b)
  }
  const labelsBtn = el('button', 'btn', 'Labels on')
  labelsBtn.type = 'button'
  labelsBtn.setAttribute('aria-pressed', 'true')
  labelsBtn.addEventListener('click', () => {
    ui.showLabels = !ui.showLabels
    refresh()
  })
  const voiceBtn = el('button', 'btn', 'Narration off')
  voiceBtn.type = 'button'
  voiceBtn.setAttribute('aria-pressed', 'false')
  voiceBtn.addEventListener('click', () => {
    ui.muted = !ui.muted
    narrator.muted = ui.muted
    if (ui.muted) narrator.stop()
    refresh()
  })
  const viewOpts = el('div', 'views')
  viewOpts.append(labelsBtn, voiceBtn)
  const hint = el('p', 'sec-note', 'Drag to pan, scroll to zoom. Keys: space play, [ ] speed, 1–5 views, ← → skip 30 s.')
  viewSec.append(viewTitle, viewList, viewOpts, hint)

  const aboutSec = el('section', 'sec about')
  const aboutTitle = el('h2', 'sec-h', 'About')
  const aboutBody = el('p', 'sec-note')
  aboutBody.innerHTML =
    'A schematic, not a drill manual. Positions and timings are reconstructed from public sources; the ship is drawn to scale (1,092 ft by 252 ft) with four catapults, four wires and an air wing of Super Hornets and Growlers. <a href="./about.html">Sources and notes</a>.'
  aboutSec.append(aboutTitle, aboutBody)

  panel.append(nowSec, selSec, crewSec, viewSec, aboutSec)

  // ---------- transport ----------
  const bar = el('div', 'transport')
  const playBtn = el('button', 'btn btn-play')
  playBtn.type = 'button'
  playBtn.setAttribute('aria-label', 'Play or pause')
  playBtn.addEventListener('click', () => {
    clock.toggle()
    refresh()
  })
  const timeEl = el('span', 'time mono', '00:00')
  const speedBtn = el('button', 'btn btn-speed mono', '4×')
  speedBtn.type = 'button'
  speedBtn.setAttribute('aria-label', 'Playback speed')
  speedBtn.addEventListener('click', () => {
    const i = clock.speeds.indexOf(clock.speed as 1)
    clock.speed = clock.speeds[(i + 1) % clock.speeds.length]!
    refresh()
  })

  const scrub = el('div', 'scrub')
  scrub.setAttribute('role', 'slider')
  scrub.tabIndex = 0
  scrub.setAttribute('aria-label', 'Timeline')
  scrub.setAttribute('aria-valuemin', '0')
  scrub.setAttribute('aria-valuemax', String(Math.round(timeline.duration)))
  const segs = el('div', 'scrub-segs')
  for (const p of timeline.phases) {
    const s = el('button', `seg seg-${p.id}`)
    s.type = 'button'
    s.style.left = `${(p.tStart / timeline.duration) * 100}%`
    s.style.width = `${((p.tEnd - p.tStart) / timeline.duration) * 100}%`
    s.title = p.title
    const lab = el('span', 'seg-label', p.title)
    s.append(lab)
    s.addEventListener('click', e => {
      e.stopPropagation()
      clock.seek(p.tStart)
      clock.playing = true
      refresh()
    })
    segs.append(s)
  }
  const marks = el('div', 'scrub-marks')
  for (const ev of timeline.events) {
    if (ev.kind !== 'cat' && ev.kind !== 'trap' && ev.kind !== 'bolter' && ev.kind !== 'waveoff') continue
    const m = el('span', `mark mark-${ev.kind}`)
    m.style.left = `${(ev.t / timeline.duration) * 100}%`
    marks.append(m)
  }
  const head = el('div', 'scrub-head')
  scrub.append(segs, marks, head)
  let scrubbing = false
  const seekFromEvent = (e: PointerEvent) => {
    const r = scrub.getBoundingClientRect()
    const u = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    clock.seek(u * timeline.duration)
    refresh()
  }
  scrub.addEventListener('pointerdown', e => {
    scrubbing = true
    scrub.setPointerCapture(e.pointerId)
    seekFromEvent(e)
  })
  scrub.addEventListener('pointermove', e => {
    if (scrubbing) seekFromEvent(e)
  })
  scrub.addEventListener('pointerup', () => {
    scrubbing = false
  })
  scrub.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') clock.seek(clock.t - 30)
    else if (e.key === 'ArrowRight') clock.seek(clock.t + 30)
    else return
    e.preventDefault()
    refresh()
  })

  const durEl = el('span', 'time mono dim', fmtTime(timeline.duration))
  bar.append(playBtn, timeEl, scrub, durEl, speedBtn)

  // ---------- intro ----------
  const intro = el('div', 'intro')
  intro.setAttribute('role', 'dialog')
  intro.setAttribute('aria-labelledby', 'intro-title')
  const card = el('div', 'intro-card')
  const ih = el('h2', 'intro-title', 'The most crowded four and a half acres at sea')
  ih.id = 'intro-title'
  const ip1 = el('p', '', 'A Nimitz-class carrier launches and recovers its jets in cycles. Every cycle is a choreographed sequence: taxi, hook up, tension, shoot; then clear the deck, catch a wire every fifty seconds, and move everything again.')
  const ip2 = el('p', '', 'This page animates one cycle from above. Each dot is a person, coloured by the jersey that tells everyone on deck what they are allowed to do.')
  const beginBtn = el('button', 'btn btn-primary', 'Begin')
  beginBtn.type = 'button'
  const voiceRow = el('label', 'intro-voice')
  const voiceCb = el('input')
  voiceCb.type = 'checkbox'
  voiceCb.checked = false
  voiceRow.append(voiceCb, document.createTextNode(' Play narration'))
  const actions = el('div', 'intro-actions')
  actions.append(beginBtn, voiceRow)
  card.append(ih, ip1, ip2, actions)
  intro.append(card)
  beginBtn.addEventListener('click', () => {
    ui.muted = !voiceCb.checked
    narrator.muted = ui.muted
    narrator.unlock()
    intro.classList.add('hidden')
    clock.playing = true
    refresh()
  })

  root.append(header, panel, panelToggle, bar, intro)

  // ---------- keyboard ----------
  window.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.key === ' ') {
      e.preventDefault()
      clock.toggle()
    } else if (e.key === ']') clock.faster()
    else if (e.key === '[') clock.slower()
    else if (e.key === 'ArrowRight') clock.seek(clock.t + 30)
    else if (e.key === 'ArrowLeft') clock.seek(clock.t - 30)
    else if (e.key === 'l') ui.showLabels = !ui.showLabels
    else if (e.key === 'f') ui.follow = !ui.follow
    else if (e.key === 'Escape') {
      ui.selectedAircraft = null
      ui.highlightRoles = null
      ui.follow = false
    } else {
      const v = d.views.find(x => x.key === e.key)
      if (v) d.goView(v.id)
      else return
    }
    refresh()
  })

  // ---------- refresh ----------
  let lastEventT = -1
  let lastPhaseId = ''
  let lastCountT = -1

  function refresh(): void {
    playBtn.textContent = clock.playing ? '❚❚' : '▶'
    playBtn.classList.toggle('playing', clock.playing)
    speedBtn.textContent = `${clock.speed}×`
    labelsBtn.textContent = ui.showLabels ? 'Labels on' : 'Labels off'
    labelsBtn.setAttribute('aria-pressed', String(ui.showLabels))
    voiceBtn.textContent = ui.muted ? 'Narration off' : 'Narration on'
    voiceBtn.setAttribute('aria-pressed', String(!ui.muted))
    followBtn.textContent = ui.follow ? 'Following' : 'Follow'
    followBtn.setAttribute('aria-pressed', String(ui.follow))
    followBtn.disabled = ui.selectedAircraft === null
    for (const [j, b] of buttons) {
      const roles = ROLE_ORDER.filter(r => ROLES[r].jersey === j)
      const on = ui.highlightRoles !== null && roles.some(r => ui.highlightRoles!.has(r))
      b.setAttribute('aria-pressed', String(on))
      b.classList.toggle('on', on)
    }
    const a = ui.selectedAircraft ? timeline.aircraft.find(x => x.id === ui.selectedAircraft) : null
    if (a) {
      const typeName = a.type === 'EA18G' ? 'EA-18G Growler' : a.type === 'FA18F' ? 'F/A-18F Super Hornet' : 'F/A-18E Super Hornet'
      selBody.textContent = `${a.modex} · ${typeName} · ${a.squadron} · event ${a.event}`
    } else {
      selBody.textContent = 'Click a jet on the deck to follow it.'
    }
    tick(clock.t, true)
  }

  function tick(t: number, force = false): void {
    timeEl.textContent = fmtTime(t)
    head.style.transform = `translateX(${(t / timeline.duration) * scrub.clientWidth}px)`
    scrub.setAttribute('aria-valuenow', String(Math.round(t)))
    scrub.setAttribute('aria-valuetext', fmtTime(t))

    const ph = phaseAt(timeline, t)
    if (ph && (ph.id !== lastPhaseId || force)) {
      lastPhaseId = ph.id
      nowPhase.textContent = ph.title
      nowBlurb.textContent = ph.blurb
      phaseLine.textContent = ph.title
      for (const s of segs.children) s.classList.toggle('active', (s as HTMLElement).classList.contains(`seg-${ph.id}`))
    }

    // ticker: last 6 events
    const evs = eventsUpTo(timeline, t, 6)
    const newest = evs[evs.length - 1]
    if (newest && (newest.t !== lastEventT || force)) {
      const wasSeek = Math.abs(newest.t - lastEventT) > 120 || lastEventT < 0
      lastEventT = newest.t
      ticker.replaceChildren(
        ...evs
          .slice()
          .reverse()
          .map((ev, i) => {
            const li = el('li', `tick tick-${ev.kind}${i === 0 ? ' newest' : ''}`)
            const tm = el('span', 'mono tick-t', fmtTime(ev.t))
            const tx = el('span', 'tick-text', ev.text)
            li.append(tm, tx)
            return li
          }),
      )
      if (wasSeek) narrator.stop()
      if (newest.narration && clock.playing && !force && !wasSeek) narrator.play(newest.narration)
    }

    // crew counts on deck (cheap: every ~2 s of sim time)
    if (Math.abs(t - lastCountT) > 2 || force) {
      lastCountT = t
      const c = new Map<JerseyColour, number>()
      for (const cr of timeline.crew) {
        const s = sampleCrew(cr, t)
        if (!s) continue
        const j = ROLES[cr.role].jersey
        c.set(j, (c.get(j) ?? 0) + 1)
      }
      for (const [j, elc] of counts) elc.textContent = String(c.get(j) ?? 0)
    }
  }

  refresh()
  return { refresh, tick }
}
