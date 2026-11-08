/** Reads CSS custom properties once so canvas drawing uses the same palette as the DOM. */
export interface Tokens {
  paper: string
  ink: string
  ink2: string
  ink3: string
  line: string
  panel: string
  sea: string
  sea2: string
  deck: string
  deck2: string
  deckEdge: string
  markWhite: string
  markYellow: string
  markRed: string
  island: string
  island2: string
  jet: string
  jet2: string
  canopy: string
  burner: string
  burnerGlow: string
  jetPod: string
  jetFin: string
  steam: string
  jersey: Record<string, string>
  fontSans: string
  fontMono: string
}

let cache: Tokens | null = null

export function tokens(): Tokens {
  if (cache) return cache
  const cs = getComputedStyle(document.documentElement)
  const v = (name: string) => cs.getPropertyValue(name).trim()
  cache = {
    paper: v('--paper'),
    ink: v('--ink'),
    ink2: v('--ink-2'),
    ink3: v('--ink-3'),
    line: v('--line'),
    panel: v('--panel'),
    sea: v('--sea'),
    sea2: v('--sea-2'),
    deck: v('--deck'),
    deck2: v('--deck-2'),
    deckEdge: v('--deck-edge'),
    markWhite: v('--mark-white'),
    markYellow: v('--mark-yellow'),
    markRed: v('--mark-red'),
    island: v('--island'),
    island2: v('--island-2'),
    jet: v('--jet'),
    jet2: v('--jet-2'),
    canopy: v('--canopy'),
    burner: v('--burner'),
    burnerGlow: v('--burner-glow'),
    jetPod: v('--jet-pod'),
    jetFin: v('--jet-fin'),
    steam: v('--steam'),
    jersey: {
      yellow: v('--jersey-yellow'),
      green: v('--jersey-green'),
      blue: v('--jersey-blue'),
      red: v('--jersey-red'),
      brown: v('--jersey-brown'),
      purple: v('--jersey-purple'),
      white: v('--jersey-white'),
    },
    fontSans: v('--font-sans'),
    fontMono: v('--font-mono'),
  }
  return cache
}

export function resetTokens(): void {
  cache = null
}
