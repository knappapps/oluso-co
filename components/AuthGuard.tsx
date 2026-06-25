'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (session) {
        setAuthenticated(true)
        setChecking(false)
      } else {
        // No session from cookies — wait briefly for auth state to resolve
        // (createBrowserClient may need an extra tick after a fresh page load)
        await new Promise(resolve => setTimeout(resolve, 200))
        const { data: { session: s2 } } = await supabase.auth.getSession()
        if (!mounted) return
        setAuthenticated(!!s2)
        setChecking(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
        setAuthenticated(false)
        setChecking(false)
        router.push('/login')
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setAuthenticated(true)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-sm w-full">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-500 text-sm mb-6">This page is only available to signed-in users.</p>
          <Link href="/login"
            className="block w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mb-3">
            Sign in
          </Link>
          <Link href="/signup"
            className="block w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Create a free account
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
