const STORAGE_KEY = 'oluso-ios-install-prompt'

type LocalState = { dismissedAt?: number; count?: number }

function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
  return isIos && isSafari
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches
}

function getLocalState(): LocalState {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

// Decides whether to show the "Add to Home Screen" prompt.
// pwaInstalledAt comes from the user's row in Supabase (set once we detect
// the app running in standalone mode while they're logged in), so this stays
// accurate even across storage contexts (regular Safari vs. the installed app).
export function shouldShowIosInstallPrompt(pwaInstalledAt: string | null | undefined): boolean {
  if (!isIosSafari() || isStandaloneMode()) return false
  if (pwaInstalledAt) return false

  const state = getLocalState()
  if (state.dismissedAt) {
    const snoozeDays = (state.count ?? 0) >= 1 ? 30 : 15
    const daysSince = (Date.now() - state.dismissedAt) / (1000 * 60 * 60 * 24)
    if (daysSince < snoozeDays) return false
  }
  return true
}

export function recordIosInstallPromptDismissal(): void {
  const state = getLocalState()
  const count = (state.count ?? 0) + 1
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now(), count }))
  } catch {}
}
