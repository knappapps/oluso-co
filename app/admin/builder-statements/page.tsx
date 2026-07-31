'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import { ShieldAlert, Check, X, RefreshCw, MessageSquare, Clock, Link2, Unlink } from 'lucide-react'

interface BuilderStatement {
  id: string
  builder_id: string
  builder_slug: string
  body: string
  status: string
  submitted_by: string | null
  created_at: string
  updated_at: string
  published_at: string | null
  reviewed_by: string | null
  builders: { company: string | null; slug: string | null } | null
}

const STATUS_FILTERS = ['pending', 'published', 'rejected', 'all'] as const

export default function BuilderStatementsAdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statements, setStatements] = useState<BuilderStatement[]>([])
  const [filter, setFilter] = useState<string>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [linkEmail, setLinkEmail] = useState<Record<string, string>>({})
  const [linkMsg, setLinkMsg] = useState<Record<string, string>>({})
  const [builders, setBuilders] = useState<{ id: string; company: string | null; slug: string | null }[]>([])
  const [linkBuilderId, setLinkBuilderId] = useState('')
  const [linkAcctEmail, setLinkAcctEmail] = useState('')
  const [linkResult, setLinkResult] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)

  const call = useCallback(async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.replace('/login')
      return null
    }
    const res = await fetch('/.netlify/functions/admin-builder-statements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token,
      },
      body: JSON.stringify(body),
    })
    if (res.status === 401) {
      router.replace('/dashboard')
      return null
    }
    return res
  }, [router])

  const load = useCallback(async (status: string) => {
    setLoading(true)
    setError(null)
    const body: Record<string, unknown> = { action: 'list-statements' }
    if (status !== 'all') body.status = status
    const res = await call(body)
    if (!res) return
    if (!res.ok) {
      setError('Could not load statements.')
      setLoading(false)
      return
    }
    const json = await res.json()
    setStatements(json.statements || [])
    setLoading(false)
  }, [call])

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
      call({ action: 'list-builders' }).then(async (res) => {
        if (res && res.ok) {
          const json = await res.json()
          setBuilders(json.builders || [])
        }
      })
      load('pending')
    })
    return () => { active = false }
  }, [router, load])

  const review = async (id: string, status: string) => {
    setBusyId(id)
    const res = await call({ action: 'review-statement', id, status })
    setBusyId(null)
    if (res && res.ok) {
      load(filter)
    } else {
      setError('Could not update the statement.')
    }
  }

  const linkUser = async (s: BuilderStatement) => {
    const email = (linkEmail[s.id] || '').trim()
    if (!email) return
    setBusyId(s.id)
    const res = await call({ action: 'link-user', email, builder_id: s.builder_id })
    setBusyId(null)
    if (!res) return
    const json = await res.json().catch(() => ({}))
    if (res.ok) {
      setLinkMsg({ ...linkMsg, [s.id]: 'Linked ' + (json.user?.email || email) + ' as builder.' })
    } else {
      setLinkMsg({ ...linkMsg, [s.id]: json.error || 'Could not link that account.' })
    }
  }

  const linkStandalone = async () => {
    const email = linkAcctEmail.trim()
    if (!email || !linkBuilderId) return
    setLinking(true)
    setLinkResult(null)
    const res = await call({ action: 'link-user', email, builder_id: linkBuilderId })
    setLinking(false)
    if (!res) return
    const json = await res.json().catch(() => ({}))
    if (res.ok) {
      setLinkResult('Linked ' + (json.user?.email || email) + ' as builder.')
      setLinkAcctEmail('')
    } else {
      setLinkResult(json.error || 'Could not link that account.')
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
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Builder statements</h1>
        </div>
        <p className="text-slate-500 mb-6">
          Public statements submitted by verified builders. Nothing is visible on a
          profile until you publish it here. Use the link form to grant an existing
          signed-up account builder access.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-600" /> Link a builder account
          </h2>
          <p className="text-sm text-slate-500 mb-3">
            Grant an existing signed-up account builder access to one profile. The
            person must already have an Oluso account.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={linkBuilderId}
              onChange={(e) => setLinkBuilderId(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white"
            >
              <option value="">Select a builder…</option>
              {builders.map((b) => (
                <option key={b.id} value={b.id}>{b.company || b.slug || b.id}</option>
              ))}
            </select>
            <input
              type="email"
              value={linkAcctEmail}
              onChange={(e) => setLinkAcctEmail(e.target.value)}
              placeholder="account@email.com"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            />
            <button
              disabled={linking || !linkBuilderId || !linkAcctEmail.trim()}
              onClick={linkStandalone}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Link2 className="w-4 h-4" /> {linking ? 'Linking…' : 'Link account'}
            </button>
          </div>
          {linkResult && <p className="text-xs text-slate-500 mt-2">{linkResult}</p>}
        </div>

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
        ) : statements.length === 0 ? (
          <div className="text-slate-500 py-12 text-center">No statements in this view.</div>
        ) : (
          <div className="space-y-4">
            {statements.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">
                      {s.builders?.company || s.builder_slug || 'Unknown builder'}
                    </div>
                    <div className="text-sm text-slate-500">Profile: {s.builder_slug}</div>
                    <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap">{s.body}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-3">
                      <Clock className="w-3 h-3" />
                      Updated {new Date(s.updated_at).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={
                      'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ' +
                      (s.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : s.status === 'rejected'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-100 text-amber-700')
                    }
                  >
                    {s.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  {s.status !== 'published' && (
                    <button
                      disabled={busyId === s.id}
                      onClick={() => review(s.id, 'published')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Publish
                    </button>
                  )}
                  {s.status !== 'rejected' && (
                    <button
                      disabled={busyId === s.id}
                      onClick={() => review(s.id, 'rejected')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1">
                    <Link2 className="w-3 h-3" /> Link an existing account as this builder
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={linkEmail[s.id] || ''}
                      onChange={(e) => setLinkEmail({ ...linkEmail, [s.id]: e.target.value })}
                      placeholder="builder@company.com"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    />
                    <button
                      disabled={busyId === s.id}
                      onClick={() => linkUser(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Link2 className="w-4 h-4" /> Link
                    </button>
                  </div>
                  {linkMsg[s.id] && (
                    <p className="text-xs text-slate-500 mt-1">{linkMsg[s.id]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
