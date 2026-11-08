/** Playback clock: simulation seconds, with speed multiplier and pause. */
export class Clock {
  t = 0
  speed = 4
  playing = false
  duration: number

  readonly speeds = [1, 2, 4, 8, 16] as const

  constructor(duration: number) {
    this.duration = duration
  }

  /** Advance by real seconds; returns true if the clock wrapped/ended. */
  tick(realDt: number): boolean {
    if (!this.playing) return false
    this.t += realDt * this.speed
    if (this.t >= this.duration) {
      this.t = this.duration
      this.playing = false
      return true
    }
    return false
  }

  seek(t: number): void {
    this.t = Math.min(this.duration, Math.max(0, t))
  }

  toggle(): void {
    if (!this.playing && this.t >= this.duration) this.t = 0
    this.playing = !this.playing
  }

  faster(): void {
    const i = this.speeds.indexOf(this.speed as (typeof this.speeds)[number])
    this.speed = this.speeds[Math.min(this.speeds.length - 1, i + 1)] ?? this.speed
  }

  slower(): void {
    const i = this.speeds.indexOf(this.speed as (typeof this.speeds)[number])
    this.speed = this.speeds[Math.max(0, i - 1)] ?? this.speed
  }
}

/** Format sim seconds as mm:ss. */
export function fmtTime(t: number): string {
  const s = Math.max(0, Math.floor(t))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
