/**
 * Plays pre-generated narration clips from /audio/<id>.mp3.
 * Clips are generated offline with tools/tts.mjs (Azure Speech). Nothing is fetched until play().
 *
 * A clip is never interrupted by the next one: if a clip is still playing, the newest request waits
 * in a one-deep queue and starts when the current clip ends (a newer request replaces an older one
 * that is still waiting). Seeking or muting clears everything.
 */
export class Narrator {
  muted = true
  private current: HTMLAudioElement | null = null
  private pending: string | null = null
  private unlocked = false
  private cache = new Map<string, HTMLAudioElement>()

  /** Call from a user gesture so later playback is allowed by autoplay policy. */
  unlock(): void {
    if (this.unlocked) return
    this.unlocked = true
    try {
      const a = new Audio()
      a.muted = true
      void a.play().catch(() => undefined)
    } catch {
      /* ignore */
    }
  }

  play(id: string): void {
    if (this.muted) return
    if (this.current && !this.current.paused && !this.current.ended) {
      this.pending = id
      return
    }
    this.start(id)
  }

  private start(id: string): void {
    let a = this.cache.get(id)
    if (!a) {
      a = new Audio(`${import.meta.env.BASE_URL}audio/${id}.mp3`)
      a.preload = 'auto'
      this.cache.set(id, a)
    }
    const clip = a
    clip.onended = () => {
      if (this.current !== clip) return
      this.current = null
      const next = this.pending
      this.pending = null
      if (next && !this.muted) this.start(next)
    }
    this.current = clip
    clip.currentTime = 0
    void clip.play().catch(() => undefined)
  }

  stop(): void {
    this.pending = null
    if (this.current) {
      this.current.onended = null
      this.current.pause()
      this.current = null
    }
  }
}
