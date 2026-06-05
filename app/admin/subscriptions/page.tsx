'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { DataSubscription } from '@/lib/supabase'
import { Key, Plus, RefreshCw, Trash2, Eye, EyeOff, Copy, Check, Shield, ArrowLeft } from 'lucide-react'

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const arr = new Uint8Array(40)
  crypto.getRandomValues(arr)
  return 'odk_' + Array.from(arr, b => chars[b % chars.length]).join('')
}

const PLAN_COLORS: Record<string, string> = {
  basic: 'bg-gray-100 text-gray-700',
  premium: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const [subs, setSubs] = useState<DataSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [form, setForm] = useState({ buyer_name: '', buyer_email: '', plan: 'basic' as DataSubscription['plan'] })

  const loadSubs = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('data_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
    setSubs(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      await loadSubs()
    })
  }, [router, loadSubs])

  async function createSubscription() {
    if (!form.buyer_name.trim() || !form.buyer_email.trim()) return
    setCreating(true)
    const api_key = generateApiKey()
    const { data, error } = await supabase
      .from('data_subscriptions')
      .insert({ buyer_name: form.buyer_name.trim(), buyer_email: form.buyer_email.trim(), api_key, plan: form.plan, active: true })
      .select()
      .single()
    if (data && !error) {
      setSubs(prev => [data, ...prev])
      setForm({ buyer_name: '', buyer_email: '', plan: 'basic' })
      setShowKeys(prev => ({ ...prev, [data.id]: true }))
    }
    setCreating(false)
  }

  async function toggleActive(sub: DataSubscription) {
    setRevoking(sub.id)
    const { data } = await supabase.from('data_subscriptions').update({ active: !sub.active }).eq('id', sub.id).select().single()
    if (data) setSubs(prev => prev.map(s => s.id === sub.id ? data : s))
    setRevoking(null)
  }

  async function deleteSub(id: string) {
    if (!confirm('Permanently delete this API key? This cannot be undone.')) return
    await supabase.from('data_subscriptions').delete().eq('id', id)
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  async function copyKey(key: string, id: string) {
    await navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-blue-600" />
          <span className="font-semibold text-gray-900">Data API Subscriptions</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total subscribers', value: subs.length },
            { label: 'Active keys', value: subs.filter(s => s.active).length },
            { label: 'Revoked', value: subs.filter(s => !s.active).length },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Issue new key */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-blue-600" /> Issue New API Key
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Buyer name</label>
              <input type="text" value={form.buyer_name} onChange={e => setForm(p => ({ ...p, buyer_name: e.target.value }))}
                placeholder="e.g. Smith Law Firm"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact email</label>
              <input type="email" value={form.buyer_email} onChange={e => setForm(p => ({ ...p, buyer_email: e.target.value }))}
                placeholder="contact@firm.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Plan</label>
              <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value as DataSubscription['plan'] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <button onClick={createSubscription} disabled={creating || !form.buyer_name.trim() || !form.buyer_email.trim()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Key size={14} /> {creating ? 'Generating...' : 'Generate API Key'}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Subscribers</span>
            <button onClick={loadSubs} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
          ) : subs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No subscribers yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Buyer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">API Key</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Last used</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.map(sub => (
                  <tr key={sub.id} className={`hover:bg-gray-50/50 ${!sub.active ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{sub.buyer_name}</div>
                      <div className="text-xs text-gray-400">{sub.buyer_email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PLAN_COLORS[sub.plan]}`}>{sub.plan}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600 max-w-[180px] truncate">
                          {showKeys[sub.id] ? sub.api_key : sub.api_key.slice(0, 12) + '...'}
                        </span>
                        <button onClick={() => setShowKeys(p => ({ ...p, [sub.id]: !p[sub.id] }))} className="text-gray-300 hover:text-gray-500">
                          {showKeys[sub.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button onClick={() => copyKey(sub.api_key, sub.id)} className="text-gray-300 hover:text-blue-500">
                          {copied === sub.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${sub.active ? 'text-green-600' : 'text-gray-400'}`}>
                        {sub.active ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {sub.last_accessed_at ? new Date(sub.last_accessed_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleActive(sub)} disabled={revoking === sub.id}
                          className={`text-xs px-2 py-1 rounded-md border disabled:opacity-50 ${sub.active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                          {revoking === sub.id ? '...' : sub.active ? 'Revoke' : 'Reinstate'}
                        </button>
                        <button onClick={() => deleteSub(sub.id)} className="text-gray-300 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Endpoint: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">https://oluso.co/.netlify/functions/data-api</code>
        </p>
      </main>
    </div>
  )
}
