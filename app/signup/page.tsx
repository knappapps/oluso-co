'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Home, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle, Shield, Clock, BarChart2, Users, Star, ArrowRight } from 'lucide-react'

function SignupPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [referrer, setReferrer] = useState<{ name: string | null; builder_name: string | null } | null>(null)

  useEffect(() => {
    if (!refCode) return
    supabase
      .from('users')
      .select('name, builder_name')
      .eq('referral_code', refCode)
      .single()
      .then(({ data }) => { if (data) setReferrer(data) })
  }, [refCode])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      })
      if (authError) { setError(authError.message); return }
      if (data.user) {
        await supabase.from('users').insert({
          auth_id: data.user.id,
          email,
          name,
          plan: 'free',
          onboarding_complete: false
        })
        const qs = searchParams.toString()
        const onboardingUrl = '/onboarding' + (qs ? '?' + qs : '')
        if (data.session) {
          router.push(onboardingUrl)
        } else {
          setSuccess(true)
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and get started.</p>
          <Link href="/login" className="mt-6 inline-block text-blue-600 text-sm font-medium hover:underline">Back to sign in</Link>
        </div>
      </div>
    )
  }

  // The signup form card (reused in both layouts)
  const formCard = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-1">{refCode ? 'Join your neighbor on Oluso' : 'Get started free'}</h1>
      <p className="text-gray-500 text-sm mb-6">{refCode ? 'Free to use. No credit card required.' : 'Track your warranty claims and hold builders accountable.'}</p>
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2 flex items-center justify-center gap-2">
          {loading ? 'Creating account...' : <><span>Create free account</span><ArrowRight size={15} /></>}
        </button>
      </form>
      <p className="text-center text-xs text-gray-400 mt-4">By signing up you agree to our terms of service.</p>
      <p className="text-center text-sm text-gray-500 mt-3">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  )

  // Non-referral: simple centered layout (unchanged experience)
  if (!refCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-2xl mb-2">
              <Home size={28} /> Oluso
            </Link>
            <p className="text-gray-500 text-sm">Create your free account</p>
          </div>
          {formCard}
        </div>
      </div>
    )
  }

  // Referral landing: two-column pitch + form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Top nav bar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Home size={22} /> Oluso
        </Link>
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          Already have an account? <span className="text-blue-600 font-medium">Sign in</span>
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* LEFT — pitch column */}
        <div className="space-y-8">

          {/* Referrer callout */}
          {referrer && (
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full">
              <Users size={15} />
              <span>
                {referrer.name ? referrer.name : 'Your neighbor'} invited you
                {referrer.builder_name ? ` · ${referrer.builder_name} homeowner` : ''}
              </span>
            </div>
          )}

          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Hold your homebuilder <span className="text-blue-600">accountable.</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              File warranty claims, track every builder response with timestamps, and build a documented paper trail. Because delays and ignored repairs shouldn't cost you tens of thousands of dollars.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Shield size={18} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">File & Track Claims</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Document every defect with photos, descriptions, and severity ratings. Timestamped and permanent.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <Clock size={18} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Warranty Countdown</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Never miss a deadline. Get alerts at 30, 11-month, and 30-day-before-expiry milestones automatically.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <BarChart2 size={18} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Builder Accountability</h3>
              <p className="text-xs text-gray-500 leading-relaxed">See how your builder compares on response times and resolution rates against real data from other homeowners.</p>
            </div>
          </div>

          {/* Social proof strip */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
              <span className="text-sm text-gray-500 ml-1">Loved by new homeowners</span>
            </div>
            <blockquote className="text-sm text-gray-700 italic leading-relaxed">
              "Oluso helped me document 14 warranty issues in our first year. Our builder responded within days once they saw everything was tracked and timestamped."
            </blockquote>
            <p className="text-xs text-gray-400 font-medium">— New homeowner, Lehi UT</p>
          </div>

          {/* Free badge */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <CheckCircle size={16} className="text-green-500 shrink-0" />
            <span>Free to use — no credit card required</span>
            <CheckCircle size={16} className="text-green-500 shrink-0" />
            <span>Set up in under 2 minutes</span>
          </div>

        </div>

        {/* RIGHT — form column */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {formCard}
        </div>

      </div>
    </div>
  )
}

export default function SignupPage() {
  return <Suspense><SignupPageInner /></Suspense>
}
