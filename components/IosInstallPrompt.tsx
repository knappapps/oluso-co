'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'oluso-ios-install-prompt'

export default function IosInstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches

    if (!isIos || !isSafari || isStandalone) return

    let state: { dismissedAt?: number; count?: number } = {}
    try {
      state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {}

    if (state.dismissedAt) {
      const snoozeDays = (state.count ?? 0) >= 1 ? 30 : 15
      const daysSince = (Date.now() - state.dismissedAt) / (1000 * 60 * 60 * 24)
      if (daysSince < snoozeDays) return
    }

    const timer = setTimeout(() => setShow(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    let state: { dismissedAt?: number; count?: number } = {}
    try {
      state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {}
    const count = (state.count ?? 0) + 1
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now(), count }))
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-gray-900">Add Oluso to your Home Screen</p>
          <button onClick={dismiss} aria-label="Close" className="text-gray-400 hover:text-gray-600 ml-2 text-lg leading-none">&times;</button>
        </div>
        <ol className="mt-3 space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>Tap the <span className="font-medium">Share</span> icon in Safari&apos;s toolbar</li>
          <li>Scroll down and tap <span className="font-medium">Add to Home Screen</span></li>
          <li>Tap <span className="font-medium">Add</span> in the top right corner</li>
        </ol>
        <button onClick={dismiss} className="mt-4 w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700">Got it</button>
      </div>
    </div>
  )
}
