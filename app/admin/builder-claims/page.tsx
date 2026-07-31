'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import { ShieldAlert, Check, X, RefreshCw, Building2, Clock } from 'lucide-react'

interface BuilderClaim {
  id: string
  builder_slug: string | null
  builder_id: string | null
  contact_name: string
  work_email: string
  company: string | null
  role: string | null
  annual_closings: string | null
  message: string | null
  status: string
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

const STATUS_FILTERS = ['pending', 'approved', 'rejected', 'all'] as const

export default function BuilderClaimsAdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [claims, setClaims] = useState<BuilderClaim[]>([])
  const [filter, setFilter] = useState<string>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (status: string) => {
    setLoading(true)
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.replace('/login')
      return
    }
    const body: Record<string, string> = { action: 'list' }
    if (status !== 'all') body.status = status
    const res = await fetch('/.netlify/functions/admin-builder-claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token,
      },
      body: JSON.stringify(body),
    })
    if (res.status === 401) {
      router.replace('/dashboard')
      return
    }
    if (!res.ok) {
      setError('Could not load claims.')
      setLoading(false)
      return
    }
    const json = await res.json()
    setClaims(json.claims || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', session.user.id)
        .maybeSingle()
      if (!active) return
      if (!profile || profile.role !== 'admin') {
        router.replace('/dashboard')
        return
      }
      setAuthorized(true)
      load('pending')
    })
    return () => { active = false }
  }, [router, load])

  const review = async (id: string, status: string) => {
    setBusyId(id)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.replace('/login')
      return
    }
    const res = await fetch('/.netlify/functions/admin-builder-claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token,
      },
      body: JSON.stringify({ action: 'review', id, status }),
    })
    setBusyId(null)
    if (res.ok) {
      load(filter)
    } else {
      setError('Could not update the claim.')
    }
  }

  const changeFilter = (f: string) => {
    setFilter(f)
    load(f)
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center text-slate-500">
          Checking access…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Builder profile claims</h1>
        </div>
        <p className="text-slate-500 mb-6">
          Requests from builders to claim their public profile. Approving does not yet
          grant profile access — it marks the request as verified for follow-up.
        </p>

        <div className="flex items-center gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              className={
                'px-3 py-1.5 rounded-full text-sm font-medium capitalize ' +
                (filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100')
              }
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => load(filter)}
            className="ml-auto inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
            <ShieldAlert className="w-4 h-4" /> {error}
          </div>
        )}

        {loading ? (
          <div className="text-slate-500 py-12 text-center">Loading…</div>
        ) : claims.length === 0 ? (
          <div className="text-slate-500 py-12 text-center">No claims in this view.</div>
        ) : (
          <div className="space-y-4">
            {claims.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {c.company || 'Unknown company'}
                    </div>
                    <div className="text-sm text-slate-600">
                      {c.contact_name}
                      {c.role ? ' · ' + c.role : ''} · {c.work_email}
                    </div>
                    {c.builder_slug && (
                      <div className="text-sm text-slate-500 mt-1">
                        Profile: {c.builder_slug}
                        {c.builder_id ? ' (matched)' : ' (no match)'}
                      </div>
                    )}
                    {c.annual_closings && (
                      <div className="text-sm text-slate-500 mt-1">
                        Volume: {c.annual_closings}
                      </div>
                    )}
                    {c.message && (
                      <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                        {c.message}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-3">
                      <Clock className="w-3 h-3" />
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={
                      'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ' +
                      (c.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : c.status === 'rejected'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-100 text-amber-700')
                    }
                  >
                    {c.status}
                  </span>
                </div>

                {c.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      disabled={busyId === c.id}
                      onClick={() => review(c.id, 'approved')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      disabled={busyId === c.id}
                      onClick={() => review(c.id, 'rejected')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
