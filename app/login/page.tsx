'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Home, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import IosInstallPrompt from '@/components/IosInstallPrompt'
import { shouldShowIosInstallPrompt, recordIosInstallPromptDismissal } from '@/lib/iosInstallPrompt'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); return }
      if (data.session) {
        // Only send to onboarding if this is a brand-new signup (onboarding_complete === false).
        // Existing users whose row is missing or whose flag is null go straight to redirectTo.
        const { data: profile } = await supabase
          .from('users').select('onboarding_complete, pwa_installed_at').eq('auth_id', data.session.user.id).single()
        const target = profile?.onboarding_complete === false
          ? '/onboarding'
            : (redirectTo === '/onboarding' ? '/dashboard' : redirectTo)
        if (shouldShowIosInstallPrompt(profile?.pwa_installed_at)) {
            setPendingRedirect(target)
            setShowInstallPrompt(true)
        } else {
            window.location.href = target
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handlePromptDismiss() {
      recordIosInstallPromptDismissal()
      setShowInstallPrompt(false)
      if (pendingRedirect) window.location.href = pendingRedirect
  }

  return (
  <>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Welcome back</h1>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'} required value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-600 font-medium hover:underline">Create one free</Link>
      </p>
    </div>
  {showInstallPrompt && <IosInstallPrompt onDismiss={handlePromptDismiss} />}
  </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-2xl mb-2">
            <Home size={28} /> Oluso
          </Link>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-400">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
