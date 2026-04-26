// Mirror of the prototype's tweak constants + a localStorage-backed state.

export const PAPER_TEXTURES = {
  'dot-grid': { bg: '#f7f4ec', dot: 'rgba(28, 36, 64, 0.18)', line: null as string | null, label: 'dot grid', grid: false },
  'plain':    { bg: '#f8f5ec', dot: null as string | null, line: null as string | null, label: 'plain bristol', grid: false },
  'lined':    { bg: '#f9f6ed', dot: null as string | null, line: 'rgba(28, 36, 64, 0.13)', label: 'lined', grid: false },
  'graph':    { bg: '#f7f5ec', dot: null as string | null, line: 'rgba(28, 36, 64, 0.10)', label: 'graph', grid: true },
  'cream':    { bg: '#f1e9d4', dot: null as string | null, line: null as string | null, label: 'aged cream', grid: false },
} as const

export type PaperKey = keyof typeof PAPER_TEXTURES

export const INK_COLORS = {
  navy:   'oklch(0.24 0.05 255)',
  black:  'oklch(0.18 0.01 270)',
  sepia:  'oklch(0.32 0.07 60)',
  indigo: 'oklch(0.30 0.10 265)',
  iron:   'oklch(0.30 0.02 250)',
} as const

export type InkKey = keyof typeof INK_COLORS

export type Theme = 'light' | 'dark'

export interface TweakState {
  paperTexture: PaperKey
  inkColor: InkKey
  layout: 'feed' | 'grid'
  animateIn: boolean
  theme: Theme
}

const DEFAULTS: TweakState = {
  paperTexture: 'graph',
  inkColor: 'black',
  layout: 'feed',
  animateIn: true,
  theme: 'light',
}

// Dark-mode ink and paper. Light values come from INK_COLORS / PAPER_TEXTURES.
export const DARK_INK = 'oklch(0.94 0 0)'
export const DARK_PAPER_BG = '#16161a'
export const DARK_PAPER_LINE = 'rgba(255, 255, 255, 0.08)'

// Bumped to invalidate older sessions that persisted dot-grid / navy tweaks.
const KEY = 'angelo.tweaks.v2'

export function useTweaks() {
  const state = useState<TweakState>('tweaks', () => ({ ...DEFAULTS }))

  if (import.meta.client) {
    onMounted(() => {
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as { layout?: string, theme?: string }
          const layout = parsed.layout === 'feed' || parsed.layout === 'grid' ? parsed.layout : DEFAULTS.layout
          const theme: Theme = parsed.theme === 'dark' ? 'dark' : 'light'
          state.value = { ...DEFAULTS, layout, theme }
        }
      } catch { /* ignore */ }
    })
    watch(state, (v) => {
      try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ }
    }, { deep: true })
  }

  function setTweak<K extends keyof TweakState>(key: K, value: TweakState[K]) {
    state.value = { ...state.value, [key]: value }
  }

  return { tweaks: state, setTweak }
}
