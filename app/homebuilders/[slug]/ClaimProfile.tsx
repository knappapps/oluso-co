'use client'

import { useState } from 'react'
import { Building2, Check, Loader2 } from 'lucide-react'

interface ClaimProfileProps {
  builderSlug: string
  builderName: string
}

export default function ClaimProfile({ builderSlug, builderName }: ClaimProfileProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    contact_name: '',
    work_email: '',
    company: builderName || '',
    role: '',
    annual_closings: '',
    message: '',
  })

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.contact_name.trim() || !form.work_email.trim() || !form.company.trim()) {
      setError('Please fill in your name, work email and company.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/.netlify/functions/builder-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, builder_slug: builderSlug }),
      })
      if (!res.ok) throw new Error('request failed')
      setDone(true)
    } catch (err) {
      setError('Something went wrong. Please try again or email support@oluso.co.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6">
      <div className="flex items-start gap-3">
        <Building2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900">
            Work at {builderName}?
          </h2>
          <p className="text-slate-600 mt-1 text-sm">
            Register your interest in claiming this profile. Builder response tools are
            coming soon — we&apos;ll reach out to verify you before anything goes live.
          </p>

          {done ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-100 text-green-800 px-4 py-3 text-sm font-medium">
              <Check className="w-4 h-4" /> Thanks — we&apos;ve received your request and
              will be in touch.
            </div>
          ) : !open ? (
            <button
              onClick={() => setOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Claim this profile
            </button>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-3">
              {error && (
                <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={form.contact_name}
                  onChange={(e) => update('contact_name', e.target.value)}
                  placeholder="Your name *"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  value={form.work_email}
                  onChange={(e) => update('work_email', e.target.value)}
                  placeholder="Work email *"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  placeholder="Company / builder name *"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  placeholder="Your role / title"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={form.annual_closings}
                  onChange={(e) => update('annual_closings', e.target.value)}
                  placeholder="Approx. annual closings or # of communities"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
                />
              </div>
              <textarea
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder="Anything you'd like us to know (optional)"
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit request
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
