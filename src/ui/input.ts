import type { Camera, CameraTween } from '../render/camera'

/** Mouse / touch / wheel handling for pan and zoom on the canvas. */
export function attachInput(
  canvas: HTMLCanvasElement,
  cam: Camera,
  tween: CameraTween,
  onInteract: () => void,
  onClick: (screen: { x: number; y: number }) => void,
): void {
  let dragging = false
  let moved = false
  let last = { x: 0, y: 0 }
  const pointers = new Map<number, { x: number; y: number }>()
  let pinchDist = 0

  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId)
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 1) {
      dragging = true
      moved = false
      last = { x: e.clientX, y: e.clientY }
      canvas.classList.add('dragging')
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinchDist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    }
  })

  canvas.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      if (pinchDist > 0) {
        const mid = { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 }
        tween.cancel()
        cam.zoomAt(mid, d / pinchDist)
        onInteract()
      }
      pinchDist = d
      return
    }
    if (!dragging) return
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true
    if (moved) {
      tween.cancel()
      cam.panBy(dx, dy)
      onInteract()
    }
    last = { x: e.clientX, y: e.clientY }
  })

  const end = (e: PointerEvent) => {
    pointers.delete(e.pointerId)
    if (pointers.size < 2) pinchDist = 0
    if (pointers.size === 0) {
      if (dragging && !moved) onClick({ x: e.clientX, y: e.clientY })
      dragging = false
      canvas.classList.remove('dragging')
    }
  }
  canvas.addEventListener('pointerup', end)
  canvas.addEventListener('pointercancel', end)

  canvas.addEventListener(
    'wheel',
    e => {
      e.preventDefault()
      tween.cancel()
      const factor = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0015))
      cam.zoomAt({ x: e.clientX, y: e.clientY }, factor)
      onInteract()
    },
    { passive: false },
  )

  canvas.addEventListener('dblclick', e => {
    tween.cancel()
    cam.zoomAt({ x: e.clientX, y: e.clientY }, 1.8)
    onInteract()
  })
}
