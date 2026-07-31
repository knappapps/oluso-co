'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { Building2, Send, CheckCircle2, Clock, XCircle, ShieldAlert } from 'lucide-react'

const MAX_LEN = 2000

interface Statement {
  body: string
  status: string
  published_at: string | null
  updated_at: string
}

function BuilderStatementEditor() {
  const [loading, setLoading] = useState(true)
  const [notBuilder, setNotBuilder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<string>('')
  const [statement, setStatement] = useState<Statement | null>(null)
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const call = useCallback(async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { status: 401, json: {} }
    const res = await fetch('/.netlify/functions/builder-statement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token,
      },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))
    return { status: res.status, json }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { status, json } = await call({ action: 'get' })
    if (status === 401) {
      setNotBuilder(true)
      setLoading(false)
      return
    }
    if (status !== 200) {
      setError('Could not load your statement.')
      setLoading(false)
      return
    }
    setCompany(json.builder?.company || '')
    if (json.statement) {
      setStatement(json.statement)
      setBody(json.statement.body || '')
    }
    setLoading(false)
  }, [call])

  useEffect(() => { load() }, [load])

  const save = async () => {
    const trimmed = body.trim()
    if (!trimmed) return
    setSaving(true)
    setSaved(false)
    setError(null)
    const { status, json } = await call({ action: 'save', body: trimmed })
    setSaving(false)
    if (status === 200) {
      setStatement(json.statement)
      setSaved(true)
    } else {
      setError(json.error || 'Could not save your statement.')
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-slate-500">Loading…</div>
  }

  if (notBuilder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={24} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Not yet verified as a builder</h2>
          <p className="text-slate-500 text-sm">
            This page is for builders who have claimed and been verified for their
            profile. If you have requested access, our team will reach out to verify
            you before anything goes live.
          </p>
        </div>
      </div>
    )
  }

  const status = statement?.status
  const remaining = MAX_LEN - body.length

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Building2 className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Your builder statement</h1>
      </div>
      <p className="text-slate-500 mb-6">
        {company ? company + '. ' : ''}
        Write a short public statement that appears on your Oluso profile. Every
        change is reviewed by our team before it goes live.
      </p>

      {status && (
        <div className="mb-4">
          {status === 'published' ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <CheckCircle2 className="w-4 h-4" /> Published on your profile
            </span>
          ) : status === 'rejected' ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-500">
              <XCircle className="w-4 h-4" /> Not approved — please revise
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" /> Pending review
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
          <ShieldAlert className="w-4 h-4" /> {error}
        </div>
      )}

      <textarea
        value={body}
        onChange={(e) => { setBody(e.target.value.slice(0, MAX_LEN)); setSaved(false) }}
        rows={8}
        placeholder="Share how your team supports homeowners after move-in…"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400">{remaining} characters left</span>
        {saved && (
          <span className="text-xs text-green-600 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Saved — sent for review
          </span>
        )}
      </div>

      <button
        onClick={save}
        disabled={saving || !body.trim()}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        <Send className="w-4 h-4" /> {saving ? 'Saving…' : 'Save & submit for review'}
      </button>

      <p className="text-xs text-slate-400 mt-4">
        Note: saving any change returns your statement to “pending” until it is
        reviewed again.
      </p>
    </div>
  )
}

export default function BuilderDashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <BuilderStatementEditor />
      </div>
    </AuthGuard>
  )
}
