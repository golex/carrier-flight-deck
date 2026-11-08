/**
 * Plays pre-generated narration clips from /audio/<id>.mp3.
 * Clips are generated offline with tools/tts.mjs (Azure Speech). Nothing is fetched until play().
 */
export class Narrator {
  muted = true
  private current: HTMLAudioElement | null = null
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
    this.stop()
    let a = this.cache.get(id)
    if (!a) {
      a = new Audio(`${import.meta.env.BASE_URL}audio/${id}.mp3`)
      a.preload = 'auto'
      this.cache.set(id, a)
    }
    this.current = a
    a.currentTime = 0
    void a.play().catch(() => undefined)
  }

  stop(): void {
    if (this.current) {
      this.current.pause()
      this.current = null
    }
  }
}
