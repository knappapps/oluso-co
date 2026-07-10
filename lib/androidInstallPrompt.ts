const STORAGE_KEY = 'oluso-android-install-prompt'

type LocalState = { dismissedAt?: number; count?: number }

let deferredPrompt: any = null

export function setDeferredPrompt(event: any): void {
  deferredPrompt = event
}

export function getDeferredPrompt(): any {
  return deferredPrompt
}

export function clearDeferredPrompt(): void {
  deferredPrompt = null
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

// Decides whether to show the custom Android "Install app" prompt.
// Relies on a captured beforeinstallprompt event (only fires when Chrome
// determines the site is installable and not already installed), plus the
// same server-tracked pwa_installed_at flag used for iOS so this stays
// accurate across sessions.
export function shouldShowAndroidInstallPrompt(pwaInstalledAt: string | null | undefined): boolean {
  if (!deferredPrompt || isStandaloneMode()) return false
  if (pwaInstalledAt) return false

  const state = getLocalState()
  if (state.dismissedAt) {
    const snoozeDays = (state.count ?? 0) >= 1 ? 30 : 15
    const daysSince = (Date.now() - state.dismissedAt) / (1000 * 60 * 60 * 24)
    if (daysSince < snoozeDays) return false
  }
  return true
}

export function recordAndroidInstallPromptDismissal(): void {
  const state = getLocalState()
  const count = (state.count ?? 0) + 1
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now(), count }))
  } catch {}
}
