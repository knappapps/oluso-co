'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Home, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) { setError(resetError.message); return }
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={24} className="text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 mb-6">
          We sent a password reset link to <strong>{email}</strong>. It should arrive in a minute or two.
        </p>
        <Link href="/login" className="text-sm text-blue-600 font-medium hover:underline">
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Reset your password</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/login" className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </p>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-2xl mb-2">
            <Home size={28} /> Oluso
          </Link>
          <p className="text-gray-500 text-sm">Password recovery</p>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-400">Loading...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
