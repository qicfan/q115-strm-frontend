import { ref, watch, onMounted, onUnmounted } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

const THEME_KEY = 'qms-theme-mode'

const currentMode = ref<ThemeMode>('light')
const isDark = ref(false)

let mediaQuery: MediaQueryList | null = null
let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null

function applyTheme(dark: boolean) {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function resolveDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  // auto: follow system
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

function initMediaListener() {
  if (typeof window === 'undefined' || !window.matchMedia) return
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaHandler = (e: MediaQueryListEvent) => {
    if (currentMode.value === 'auto') {
      applyTheme(e.matches)
    }
  }
  mediaQuery.addEventListener('change', mediaHandler)
}

function cleanupMediaListener() {
  if (mediaQuery && mediaHandler) {
    mediaQuery.removeEventListener('change', mediaHandler)
    mediaQuery = null
    mediaHandler = null
  }
}

export function useTheme() {
  const setMode = (mode: ThemeMode) => {
    currentMode.value = mode
    localStorage.setItem(THEME_KEY, mode)
    applyTheme(resolveDark(mode))
  }

  const initTheme = () => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null
    const mode = saved || 'light'
    currentMode.value = mode
    applyTheme(resolveDark(mode))
    initMediaListener()
  }

  onMounted(() => {
    initTheme()
  })

  onUnmounted(() => {
    cleanupMediaListener()
  })

  return {
    currentMode,
    isDark,
    setMode,
    initTheme,
  }
}
