'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ShieldAlert, Megaphone, Code, LayoutTemplate, Users, Search, ChevronDown, ChevronUp, RefreshCw, BarChart2, TrendingUp, Clock, CheckCircle, Database, LogIn, Check, Download, CheckSquare, X, Edit2, RotateCcw, Building2, SlidersHorizontal } from 'lucide-react'


interface Ad {
  id: string; sponsor_name: string; title: string; description: string; cta_text: string; link_url: string; bg_color: string; text_color: string; active: boolean; display_order: number; embed_html?: string
}
interface AdminUser {
  id: string; email: string; name: string | null; builder_name: string | null; community_name: string | null; plan: string; role: string | null; onboarding_complete: boolean; created_at: string; warranty_start: string | null; city?: string | null; state?: string | null; claim_count?: number
}
interface AnalyticsData {
  totalUsers: number; newUsersLast30: number; totalClaims: number; newClaimsLast30: number; resolvedClaims: number; avgDaysToResolution: number; avgDaysToFirstResponse: number; referralConversions: number; claimsByCategory: { category: string; count: number }[]; signupsByWeek: { week: string; count: number }[]; claimsByWeek: { week: string; count: number }[]; topBuilders: { name: string; claims: number; resolved: number; avg_response: number | null }[]
}
interface BuilderRollup {
  builder_id: string; builder_name: string; total_claims: number; open: number; in_progress: number; awaiting_builder: number; resolved: number; closed: number; escalated: number; resolve_rate: number; avg_days_to_first_response: number | null; avg_days_to_resolution: number | null; critical_claims: number; high_claims: number; structural: number; water: number; electrical: number; hvac: number; plumbing: number; cosmetic: number; landscaping: number; other: number; accountability_score: number | null; unique_users: number; claims: BuilderClaim[]
}
interface BuilderClaim {
  id: string; title: string; category: string; severity: string; status: string; city: string; state: string; warranty_year: number | null; days_to_first_response: number | null; created_at: string
}

function parseEmbedHtml(html: string): { sponsor_name: string; link_url: string; title: string } {
  const result = { sponsor_name: '', link_url: '', title: '' }
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const anchor = doc.querySelector('a[href]')
    if (anchor) {
      const href = anchor.getAttribute('href') || ''
      result.link_url = href
      try { const url = new URL(href); const host = url.hostname.replace('www.', ''); if (host.includes('homedepot')) result.sponsor_name = 'Home Depot'; else if (host.includes('lowes')) result.sponsor_name = "Lowe's"; else result.sponsor_name = host.split('.')[0].replace(/-/g, ' ') } catch {}
    }
    const img = doc.querySelector('img[alt]')
    if (img) result.title = img.getAttribute('alt') || ''
    if (!result.title) result.title = doc.body?.textContent?.trim()?.slice(0, 60) || ''
  } catch {}
  return result
}

const PLAN_COLORS: Record<string, string> = { free: 'bg-gray-100 text-gray-600', basic: 'bg-blue-100 text-blue-700', pro: 'bg-purple-100 text-purple-700' }
const ROLE_COLORS: Record<string, string> = { admin: 'bg-red-100 text-red-700', user: 'bg-gray-100 text-gray-500', builder: 'bg-emerald-100 text-emerald-700' }

function SvgBarChart({ data, color = '#3b82f6', height = 120 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  if (!data.length) return <p className="text-xs text-gray-400 text-center py-6">Not enough data yet</p>
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barW = Math.max(20, Math.floor(480 / data.length) - 6)
  const chartH = height - 32
  return (
    <svg viewBox={`0 0 ${data.length * (barW + 6)} ${height}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = Math.max(2, Math.round((d.value / maxVal) * chartH))
        const x = i * (barW + 6)
        const y = chartH - barH
        return (<g key={d.label}><rect x={x} y={y} width={barW} height={barH} fill={color} rx={3} opacity={0.85} /><text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="#6b7280">{d.value > 0 ? d.value : ''}</text><text x={x + barW / 2} y={height - 2} textAnchor="middle" fontSize={9} fill="#9ca3af">{d.label}</text></g>)
      })}
    </svg>
  )
}

function exportRollupCsv(rollupData: any[]) {
  const rows: string[][] = []
  rows.push(['User Name','Email','Plan','Role','City','Builder','Community','Onboarding','Joined','Claim Title','Category','Severity','Status','Location','Filed','1st Resp (days)','Resolved (days)','Public Story'])
  for (const u of rollupData) {
    if (u.claims.length === 0) { rows.push([u.name || '', u.email, u.plan, u.role || 'user', u.city || '', u.builder_name || '', u.community_name || '', u.onboarding_complete ? 'yes' : 'no', u.created_at?.slice(0,10), '', '', '', '', '', '', '', '', '']) }
    else { for (const c of u.claims) { rows.push([u.name || '', u.email, u.plan, u.role || 'user', u.city || '', u.builder_name || '', u.community_name || '', u.onboarding_complete ? 'yes' : 'no', u.created_at?.slice(0,10), c.title || '', c.category || '', c.severity || '', c.status || '', c.defect_location || '', c.created_at?.slice(0,10), c.days_to_first_response != null ? String(Math.round(c.days_to_first_response)) : '', c.days_to_resolution != null ? String(Math.round(c.days_to_resolution)) : '', c.public_story ? 'yes' : 'no']) } }
  }
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `oluso-data-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url)
}

function exportBuilderReportCsv(builders: BuilderRollup[], visibleCols: Record<string, boolean>) {
  const allCols = [
    { key: 'builder_name', label: 'Builder' }, { key: 'total_claims', label: 'Total Claims' }, { key: 'open', label: 'Open' }, { key: 'in_progress', label: 'In Progress' },
    { key: 'awaiting_builder', label: 'Awaiting Builder' }, { key: 'resolved', label: 'Resolved' }, { key: 'closed', label: 'Closed' }, { key: 'resolve_rate', label: 'Resolve Rate %' },
    { key: 'avg_days_to_first_response', label: 'Avg Days 1st Resp' }, { key: 'avg_days_to_resolution', label: 'Avg Days Resolution' }, { key: 'critical_claims', label: 'Critical' },
    { key: 'high_claims', label: 'High' }, { key: 'structural', label: 'Structural' }, { key: 'water', label: 'Water' }, { key: 'electrical', label: 'Electrical' },
    { key: 'hvac', label: 'HVAC' }, { key: 'plumbing', label: 'Plumbing' }, { key: 'accountability_score', label: 'Acct Score' }, { key: 'unique_users', label: 'Unique Users' },
  ]
  const cols = allCols.filter(c => visibleCols[c.key] !== false)
  const rows: string[][] = [cols.map(c => c.label)]
  for (const b of builders) { rows.push(cols.map(c => { const v = (b as any)[c.key]; return v != null ? String(v) : '' })) }
  const csv = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `oluso-builder-report-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url)
}

function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <Check size={15} /> : <X size={15} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={13} /></button>
    </div>
  )
}

function UserMetricsDrawer({ user, onClose, onGoToData }: { user: AdminUser; onClose: () => void; onGoToData: (uid: string) => void }) {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('claims').select('id, title, status, category, created_at, days_to_first_response').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setClaims(data || []); setLoading(false) })
  }, [user.id])
  const statusCounts: Record<string, number> = {}
  const catCounts: Record<string, number> = {}
  let respSum = 0, respCount = 0
  for (const c of claims) { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; catCounts[c.category] = (catCounts[c.category] || 0) + 1; if (c.days_to_first_response != null) { respSum += c.days_to_first_response; respCount++ } }
  const avgResp = respCount > 0 ? (respSum / respCount).toFixed(1) : null
  const recent = claims[0]
  const STATUS_PILL: Record<string, string> = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', awaiting_builder: 'bg-orange-100 text-orange-700', resolved: 'bg-green-100 text-green-700', escalated: 'bg-red-100 text-red-700', closed: 'bg-gray-100 text-gray-600' }
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div><h2 className="font-semibold text-gray-900">{user.name || user.email}</h2><p className="text-xs text-gray-400">{user.email}</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <div className="flex-1 p-6 space-y-5">
          {loading ? <p className="text-gray-400 text-sm text-center py-8">Loading...</p> : (<>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-gray-900">{claims.length}</div><div className="text-xs text-gray-400 mt-0.5">Total Claims</div></div>
              <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-blue-600">{avgResp ? avgResp + 'd' : '—'}</div><div className="text-xs text-gray-400 mt-0.5">Avg 1st Resp</div></div>
              <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-green-600">{statusCounts['resolved'] || 0}</div><div className="text-xs text-gray-400 mt-0.5">Resolved</div></div>
            </div>
            {Object.keys(statusCounts).length > 0 && (<div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">By Status</p><div className="flex flex-wrap gap-1.5">{Object.entries(statusCounts).map(([s, n]) => (<span key={s} className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_PILL[s] || 'bg-gray-100 text-gray-600'}`}>{s.replace(/_/g,' ')} ({n})</span>))}</div></div>)}
            {Object.keys(catCounts).length > 0 && (<div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">By Category</p><div className="flex flex-wrap gap-1.5">{Object.entries(catCounts).map(([c, n]) => (<span key={c} className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">{c} ({n})</span>))}</div></div>)}
            {recent && (<div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Most Recent Claim</p><div className="bg-gray-50 rounded-xl p-3 space-y-1"><p className="text-sm font-medium text-gray-800">{recent.title}</p><div className="flex items-center gap-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_PILL[recent.status] || 'bg-gray-100 text-gray-600'}`}>{recent.status.replace(/_/g,' ')}</span><span className="text-xs text-gray-400">{new Date(recent.created_at).toLocaleDateString()}</span></div></div></div>)}
            {claims.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No claims filed yet.</p>}
            {claims.length > 0 && (<button onClick={() => onGoToData(user.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 border border-blue-100"><Database size={14} /> View in Data Tab</button>)}
          </>)}
        </div>
      </div>
    </div>
  )
}

function EditUserModal({ user, builders, session, onClose, onSaved, onToast }: { user: AdminUser; builders: { id: string; name: string }[]; session: any; onClose: () => void; onSaved: (u: AdminUser) => void; onToast: (msg: string, type: 'success' | 'error') => void }) {
  const [form, setForm] = useState({ name: user.name || '', role: user.role || 'user', city: user.city || '', state: user.state || '', builder_name: user.builder_name || '', community_name: user.community_name || '' })
  const [saving, setSaving] = useState(false)
  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/.netlify/functions/admin-update-user', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }, body: JSON.stringify({ userId: user.id, ...form }) })
      const json = await res.json()
      if (json.success) { onSaved({ ...user, ...form }); onToast('User updated successfully', 'success'); onClose() }
      else { onToast('Error: ' + (json.error || 'Unknown error'), 'error') }
    } catch (e) { onToast('Error: ' + String(e), 'error') }
    finally { setSaving(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between mb-1"><h2 className="font-semibold text-gray-900">Edit User</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button></div>
        <p className="text-xs text-gray-400 -mt-2">{user.email} — email cannot be changed here</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Role</label><select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="user">user</option><option value="builder">builder</option><option value="admin">admin</option></select></div>
          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">City</label><input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">State</label><input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} maxLength={2} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Builder</label><input value={form.builder_name} onChange={e => setForm(p => ({ ...p, builder_name: e.target.value }))} list="builder-list-edit" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /><datalist id="builder-list-edit">{builders.map(b => <option key={b.id} value={b.name} />)}</datalist></div>
          <div className="col-span-2 flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Community</label><input value={form.community_name} onChange={e => setForm(p => ({ ...p, community_name: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save Changes'}</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [tab, setTab] = useState('users')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Ads
  const [ads, setAds] = useState<Ad[]>([])
  const [embedMode, setEmbedMode] = useState(false)
  const [embedHtml, setEmbedHtml] = useState('')
  const [parsedFields, setParsedFields] = useState({ sponsor_name: '', link_url: '', title: '' })
  const [embedPreview, setEmbedPreview] = useState(false)
  const [formKey, setFormKey] = useState(0)

  // Users
  const [users, setUsers] = useState<AdminUser[]>([])
  const [builders, setBuilders] = useState<{ id: string; name: string }[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [hideSeed, setHideSeed] = useState(true)
  const [userPage, setUserPage] = useState(1)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [metricsUser, setMetricsUser] = useState<AdminUser | null>(null)
  const [loginAsLoading, setLoginAsLoading] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [resettingPw, setResettingPw] = useState<string | null>(null)

  // Analytics
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Data tab
  const [rollupData, setRollupData] = useState<any[]>([])
  const [rollupLoading, setRollupLoading] = useState(false)
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkUpdating, setBulkUpdating] = useState(false)

  // Builder Reports
  const [builderReport, setBuilderReport] = useState<BuilderRollup[]>([])
  const [builderReportLoading, setBuilderReportLoading] = useState(false)
  const [builderDateRange, setBuilderDateRange] = useState('all')
  const [builderWarrantyYear, setBuilderWarrantyYear] = useState('all')
  const [builderFilter, setBuilderFilter] = useState<Set<string>>(new Set())
  const [builderSortCol, setBuilderSortCol] = useState('total_claims')
  const [builderSortDir, setBuilderSortDir] = useState<'asc' | 'desc'>('desc')
  const [expandedBuilder, setExpandedBuilder] = useState<string | null>(null)
  const [colVisible, setColVisible] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(localStorage.getItem('builder_report_cols') || '{}') } catch { return {} }
  })
  const [showColToggle, setShowColToggle] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!s) { router.replace('/login'); return }
      setSession(s)
      const { data: profile } = await supabase.from('users').select('role').eq('auth_id', s.user.id).single()
      if (!profile || profile.role !== 'admin') { router.replace('/dashboard'); return }
      setIsAdmin(true)
      setAuthChecked(true)
    })
  }, [router])

  const loadAds = useCallback(async () => {
    const { data } = await supabase.from('ads').select('*').order('display_order')
    setAds((data as Ad[]) || [])
  }, [])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const { data: bData } = await supabase.from('builders').select('id, name').order('name')
      setBuilders(bData || [])
      const { data } = await supabase.from('users').select('id, email, name, builder_name, community_name, plan, role, onboarding_complete, created_at, warranty_start, city, state').order('created_at', { ascending: false })
      const userList = (data as AdminUser[]) || []
      const { data: claimData } = await supabase.from('claims').select('user_id')
      const claimCounts: Record<string, number> = {}
      for (const c of (claimData || [])) { claimCounts[c.user_id] = (claimCounts[c.user_id] || 0) + 1 }
      setUsers(userList.map(u => ({ ...u, claim_count: claimCounts[u.id] || 0 })))
    } finally { setUsersLoading(false) }
  }, [])

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const [{ data: allUsers }, { data: newUsers }, { data: allClaims }, { data: newClaims }, { data: resolvedClaims }, { data: builderScores }, { data: referrals }] = await Promise.all([
        supabase.from('users').select('id, created_at, referred_by'),
        supabase.from('users').select('id, created_at').gte('created_at', thirtyDaysAgo),
        supabase.from('claims').select('id, created_at, status, category, days_to_first_response, resolved_at, user_id'),
        supabase.from('claims').select('id, created_at').gte('created_at', thirtyDaysAgo),
        supabase.from('claims').select('id, resolved_at, created_at').in('status', ['resolved', 'closed']).not('resolved_at', 'is', null),
        supabase.from('builder_scores').select('name, total_claims, resolve_rate_pct, avg_days_to_first_response').order('total_claims', { ascending: false }).limit(8),
        supabase.from('users').select('id').not('referred_by', 'is', null),
      ])
      const resolutionDays = (resolvedClaims || []).map((c: any) => c.resolved_at && c.created_at ? Math.floor((new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / 86400000) : null).filter((d: any) => d !== null) as number[]
      const avgDaysToResolution = resolutionDays.length ? Math.round(resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length) : 0
      const respDays = (allClaims || []).map((c: any) => c.days_to_first_response).filter((d: any) => d !== null && d !== undefined) as number[]
      const avgDaysToFirstResponse = respDays.length ? Math.round(respDays.reduce((a, b) => a + b, 0) / respDays.length * 10) / 10 : 0
      const catMap: Record<string, number> = {}
      for (const c of (allClaims || [])) { const cat = (c as any).category || 'other'; catMap[cat] = (catMap[cat] || 0) + 1 }
      const weekKey = (d: string) => { const date = new Date(d); const day = date.getDay(); const diff = date.getDate() - day; const monday = new Date(date.setDate(diff)); return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
      const signupWeeks: Record<string, number> = {}; const claimWeeks: Record<string, number> = {}
      const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000).toISOString()
      for (const u of (allUsers || [])) { if (u.created_at >= eightWeeksAgo) { const w = weekKey(u.created_at); signupWeeks[w] = (signupWeeks[w] || 0) + 1 } }
      for (const c of (allClaims || [])) { if ((c as any).created_at >= eightWeeksAgo) { const w = weekKey((c as any).created_at); claimWeeks[w] = (claimWeeks[w] || 0) + 1 } }
      setAnalytics({ totalUsers: (allUsers || []).length, newUsersLast30: (newUsers || []).length, totalClaims: (allClaims || []).length, newClaimsLast30: (newClaims || []).length, resolvedClaims: (resolvedClaims || []).length, avgDaysToResolution, avgDaysToFirstResponse, referralConversions: (referrals || []).length, claimsByCategory: Object.entries(catMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count), signupsByWeek: Object.entries(signupWeeks).map(([week, count]) => ({ week, count })), claimsByWeek: Object.entries(claimWeeks).map(([week, count]) => ({ week, count })), topBuilders: (builderScores || []).map((b: any) => ({ name: b.name, claims: b.total_claims, resolved: Math.round((b.resolve_rate_pct || 0) * b.total_claims / 100), avg_response: b.avg_days_to_first_response })) })
    } finally { setAnalyticsLoading(false) }
  }, [])

  const loadRollup = useCallback(async () => {
    setRollupLoading(true)
    try {
      const { data: usersRaw } = await supabase.from('users').select('id, name, email, city, plan, role, onboarding_complete, builder_name, community_name, created_at, warranty_start').order('created_at', { ascending: false })
      const { data: claimsRaw } = await supabase.from('claims').select('id, user_id, title, status, category, severity, created_at, defect_location, days_to_first_response, days_to_resolution, public_story').order('created_at', { ascending: false })
      const byUser: Record<string, any[]> = {}
      for (const c of (claimsRaw || [])) { if (!byUser[c.user_id]) byUser[c.user_id] = []; byUser[c.user_id].push(c) }
      setRollupData((usersRaw || []).map((u: any) => ({ ...u, claims: byUser[u.id] || [] })))
    } finally { setRollupLoading(false) }
  }, [])

  const loadBuilderReport = useCallback(async (sess?: any) => {
    const s = sess || session
    if (!s) return
    setBuilderReportLoading(true)
    try {
      let start_date: string | undefined; let end_date: string | undefined
      const now = new Date()
      if (builderDateRange !== 'all') { const days = parseInt(builderDateRange); start_date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString(); end_date = now.toISOString() }
      const res = await fetch('/.netlify/functions/admin-builder-report', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.access_token}` }, body: JSON.stringify({ start_date, end_date, warranty_year: builderWarrantyYear === 'all' ? null : builderWarrantyYear }) })
      const json = await res.json()
      if (json.success) { setBuilderReport(json.data.builders || []) }
      else { setToast({ message: 'Error loading report: ' + (json.error || 'Unknown'), type: 'error' }) }
    } catch (e) { setToast({ message: 'Error: ' + String(e), type: 'error' }) }
    finally { setBuilderReportLoading(false) }
  }, [session, builderDateRange, builderWarrantyYear])

  useEffect(() => { if (isAdmin) { loadAds(); loadUsers() } }, [isAdmin, loadAds, loadUsers])
  useEffect(() => { if (isAdmin && tab === 'analytics' && !analytics) { loadAnalytics() } }, [isAdmin, tab, analytics, loadAnalytics])
  useEffect(() => { if (isAdmin && tab === 'data') { loadRollup() } }, [isAdmin, tab, loadRollup])
  useEffect(() => { if (isAdmin && tab === 'builder_reports' && session) { loadBuilderReport(session) } }, [isAdmin, tab, session])

  async function loginAsUser(user: any) {
    setLoginAsLoading(user.id)
    try {
      const res = await fetch('/api/admin/login-as', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email }) })
      const json = await res.json()
      if (json.url) { await navigator.clipboard.writeText(json.url); setCopiedLink(user.id); setTimeout(() => setCopiedLink(null), 3000) }
      else { setToast({ message: 'Could not generate link: ' + (json.error || 'Unknown'), type: 'error' }) }
    } catch (e) { setToast({ message: 'Error: ' + String(e), type: 'error' }) }
    finally { setLoginAsLoading(null) }
  }

  async function resetPassword(user: AdminUser) {
    if (!session) return
    setResettingPw(user.id)
    try {
      const res = await fetch('/.netlify/functions/admin-reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }, body: JSON.stringify({ email: user.email, name: user.name }) })
      const json = await res.json()
      if (json.success) { setToast({ message: 'Password reset email sent to ' + user.email, type: 'success' }) }
      else { setToast({ message: 'Error: ' + (json.error || 'Unknown'), type: 'error' }) }
    } catch (e) { setToast({ message: 'Error: ' + String(e), type: 'error' }) }
    finally { setResettingPw(null) }
  }

  function handleEmbedPaste(html: string) { setEmbedHtml(html); if (html.trim()) { setParsedFields(parseEmbedHtml(html)); setEmbedPreview(true) } else { setEmbedPreview(false) } }
  async function submitEmbedAd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const { error } = await supabase.from('ads').insert({ sponsor_name: (fd.get('sponsor_name') as string) || parsedFields.sponsor_name || 'Sponsored', title: (fd.get('title') as string) || parsedFields.title || 'Sponsored', description: '', cta_text: '', link_url: parsedFields.link_url || '', bg_color: '#ffffff', text_color: '#000000', display_order: parseInt(fd.get('display_order') as string) || 0, active: true, embed_html: embedHtml })
    if (!error) { setEmbedHtml(''); setParsedFields({ sponsor_name: '', link_url: '', title: '' }); setEmbedPreview(false); setFormKey(k => k + 1); loadAds() } else setToast({ message: 'Error: ' + error.message, type: 'error' })
  }

  function toggleClaimSelection(claimId: string) { setSelectedClaims(prev => { const next = new Set(prev); if (next.has(claimId)) next.delete(claimId); else next.add(claimId); return next }) }
  function selectAllClaims() { setSelectedClaims(new Set(rollupData.flatMap(u => u.claims.map((c: any) => c.id)))) }
  function clearSelection() { setSelectedClaims(new Set()) }
  async function applyBulkStatus() {
    if (!bulkStatus || selectedClaims.size === 0) return
    setBulkUpdating(true)
    try { const ids = Array.from(selectedClaims); await supabase.from('claims').update({ status: bulkStatus }).in('id', ids); setRollupData(prev => prev.map(u => ({ ...u, claims: u.claims.map((c: any) => selectedClaims.has(c.id) ? { ...c, status: bulkStatus } : c) }))); setSelectedClaims(new Set()); setBulkStatus('') } finally { setBulkUpdating(false) }
  }

  function toggleCol(key: string) {
    setColVisible(prev => { const next = { ...prev, [key]: prev[key] === false ? true : false }; try { localStorage.setItem('builder_report_cols', JSON.stringify(next)) } catch {} return next })
  }
  function builderSortBy(col: string) { if (builderSortCol === col) { setBuilderSortDir(d => d === 'asc' ? 'desc' : 'asc') } else { setBuilderSortCol(col); setBuilderSortDir('desc') } }

  const USERS_PER_PAGE = 20
  const filteredUsers = users.filter(u => {
    if (hideSeed && (u.email || '').includes('@seed.oluso.fake')) return false
    if (roleFilter !== 'all' && (u.role || 'user') !== roleFilter) return false
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    return (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q)
  })
  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  const pagedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE)

  const BUILDER_COLS = [
    { key: 'total_claims', label: 'Total Claims' }, { key: 'open', label: 'Open' }, { key: 'in_progress', label: 'In Progress' }, { key: 'awaiting_builder', label: 'Awaiting' },
    { key: 'resolved', label: 'Resolved' }, { key: 'closed', label: 'Closed' }, { key: 'resolve_rate', label: 'Resolve %' }, { key: 'avg_days_to_first_response', label: 'Avg Resp' },
    { key: 'avg_days_to_resolution', label: 'Avg Res' }, { key: 'critical_claims', label: 'Critical' }, { key: 'high_claims', label: 'High' },
    { key: 'structural', label: 'Structural' }, { key: 'water', label: 'Water' }, { key: 'hvac', label: 'HVAC' }, { key: 'plumbing', label: 'Plumbing' },
    { key: 'accountability_score', label: 'Acct Score' }, { key: 'unique_users', label: 'Users' },
  ]
  const visibleBuilderCols = BUILDER_COLS.filter(c => colVisible[c.key] !== false)
  const filteredBuilderReport = builderReport.filter(b => builderFilter.size === 0 || builderFilter.has(b.builder_id)).sort((a, b) => {
    const va = (a as any)[builderSortCol] ?? -1; const vb = (b as any)[builderSortCol] ?? -1
    if (va < vb) return builderSortDir === 'asc' ? -1 : 1; if (va > vb) return builderSortDir === 'asc' ? 1 : -1; return 0
  })
  const STATUS_PILL_COLORS: Record<string, string> = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', awaiting_builder: 'bg-orange-100 text-orange-700', resolved: 'bg-green-100 text-green-700', escalated: 'bg-red-100 text-red-700', closed: 'bg-gray-100 text-gray-600' }

  if (!authChecked) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Checking access...</p></div>
  if (!isAdmin) return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4"><ShieldAlert size={48} className="text-red-400" /><h1 className="text-xl font-semibold text-gray-800">Access Denied</h1><p className="text-gray-500">This page is restricted to administrators.</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {editingUser && <EditUserModal user={editingUser} builders={builders} session={session} onClose={() => setEditingUser(null)} onSaved={updated => setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u))} onToast={(msg, type) => setToast({ message: msg, type })} />}
      {metricsUser && <UserMetricsDrawer user={metricsUser} onClose={() => setMetricsUser(null)} onGoToData={uid => { setTab('data'); setMetricsUser(null) }} />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Manage users, ads, analytics, and builder reports.</p>
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-lg p-1 w-fit flex-wrap">
          {[
            { key: 'users', label: 'Users', icon: <Users size={14} /> },
            { key: 'ads', label: 'Ads', icon: <Megaphone size={14} /> },
            { key: 'analytics', label: 'Analytics', icon: <BarChart2 size={14} /> },
            { key: 'data', label: 'Data', icon: <Database size={14} /> },
            { key: 'builder_reports', label: 'Builder Reports', icon: <Building2 size={14} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by email or name..." value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1) }} className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setUserPage(1) }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All roles</option><option value="user">user</option><option value="builder">builder</option><option value="admin">admin</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" checked={hideSeed} onChange={e => setHideSeed(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Hide seed accounts
                </label>
                <button onClick={loadUsers} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"><RefreshCw size={13} /> Refresh</button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
                <span className="text-xs text-gray-400">Page {userPage} of {Math.max(1, totalUserPages)}</span>
              </div>
              {usersLoading ? <div className="py-12 text-center text-gray-400 text-sm">Loading users...</div> : pagedUsers.length === 0 ? <div className="py-12 text-center text-gray-400 text-sm">No users found.</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 text-left bg-gray-50">
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium">Name / Email</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium">Role</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium">City, State</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium">Builder</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium">Community</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Claims</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium">Joined</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagedUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5">
                            <button className="text-sm font-medium text-blue-600 hover:underline text-left" onClick={() => setMetricsUser(user)}>{user.name || <span className="text-gray-400 italic">—</span>}</button>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </td>
                          <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role || 'user'] || 'bg-gray-100 text-gray-500'}`}>{user.role || 'user'}</span></td>
                          <td className="px-4 py-2.5 text-xs text-gray-600">{[user.city, user.state].filter(Boolean).join(', ') || '—'}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-600 max-w-[120px] truncate" title={user.builder_name || ''}>{user.builder_name || '—'}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-600 max-w-[120px] truncate" title={user.community_name || ''}>{user.community_name || '—'}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-700 text-right font-medium">{user.claim_count || 0}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setEditingUser(user)} className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"><Edit2 size={11} /> Edit</button>
                              <button onClick={() => resetPassword(user)} disabled={resettingPw === user.id} className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-medium disabled:opacity-50"><RotateCcw size={11} /> {resettingPw === user.id ? '…' : 'Reset PW'}</button>
                              <button onClick={() => loginAsUser(user)} disabled={!!loginAsLoading} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border ${copiedLink === user.id ? 'border-green-400 bg-green-50 text-green-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'} disabled:opacity-40`}>
                                {loginAsLoading === user.id ? <RefreshCw size={10} className="animate-spin" /> : copiedLink === user.id ? <Check size={10} /> : <LogIn size={10} />}
                                {copiedLink === user.id ? 'Copied!' : 'Login'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {totalUserPages > 1 && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                  <span className="text-xs text-gray-500">Page {userPage} of {totalUserPages}</span>
                  <button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ADS TAB ── */}
        {tab === 'ads' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Megaphone size={16} className="text-blue-500" /> Add New Ad</h3>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setEmbedMode(false)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!embedMode ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}><LayoutTemplate size={12} /> Manual</button>
                  <button onClick={() => setEmbedMode(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${embedMode ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}><Code size={12} /> Paste HTML</button>
                </div>
              </div>
              {!embedMode && (
                <form key={formKey} onSubmit={async (e) => {
                  e.preventDefault()
                  const f = e.currentTarget as HTMLFormElement; const fd = new FormData(f)
                  const { error } = await supabase.from('ads').insert({ sponsor_name: fd.get('sponsor_name') as string, title: fd.get('title') as string, description: fd.get('description') as string, cta_text: fd.get('cta_text') as string, link_url: fd.get('link_url') as string, bg_color: fd.get('bg_color') as string, text_color: fd.get('text_color') as string, display_order: parseInt(fd.get('display_order') as string) || 0, active: true })
                  if (!error) { f.reset(); loadAds() } else setToast({ message: 'Error: ' + error.message, type: 'error' })
                }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Sponsor Name</label><input name="sponsor_name" required placeholder="e.g. Home Depot" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Headline</label><input name="title" required placeholder="Short catchy headline" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col gap-1 md:col-span-2"><label className="text-xs text-gray-500 font-medium">Description</label><input name="description" required placeholder="One-line description" className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">CTA Button Text</label><input name="cta_text" required defaultValue="Shop now" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Link URL</label><input name="link_url" required type="url" placeholder="https://..." className="border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Background Color</label><input name="bg_color" required defaultValue="#FFF3E0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Text/Button Color</label><input name="text_color" required defaultValue="#BF360C" className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Display Order</label><input name="display_order" type="number" defaultValue="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                  <div className="md:col-span-2"><button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add Ad</button></div>
                </form>
              )}
              {embedMode && (
                <form key={formKey} onSubmit={submitEmbedAd} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><Code size={12} /> Paste HTML embed code</label>
                    <textarea rows={6} value={embedHtml} onChange={e => handleEmbedPaste(e.target.value)} placeholder={"Paste your affiliate HTML here..."} className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {embedPreview && (
                    <div className="space-y-3">
                      <div className="border border-blue-100 bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-700 mb-2">Auto-detected — confirm or edit:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Sponsor Name</label><input name="sponsor_name" defaultValue={parsedFields.sponsor_name} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" /></div>
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Label / Title</label><input name="title" defaultValue={parsedFields.title} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" /></div>
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Display Order</label><input name="display_order" type="number" defaultValue="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" /></div>
                        </div>
                      </div>
                      <div><p className="text-xs font-medium text-gray-500 mb-1">Preview:</p><div className="border border-gray-200 rounded-lg p-3 bg-white overflow-auto" dangerouslySetInnerHTML={{ __html: embedHtml }} /></div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button type="submit" disabled={!embedHtml.trim()} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40">Save Embed Ad</button>
                    <button type="button" onClick={() => { setEmbedHtml(''); setParsedFields({ sponsor_name: '', link_url: '', title: '' }); setEmbedPreview(false) }} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Clear</button>
                  </div>
                </form>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-800">{ads.filter(a => a.active).length} active / {ads.length} total</h3></div>
              <div className="divide-y divide-gray-50">
                {ads.map(ad => (
                  <div key={ad.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: ad.embed_html ? '#f0f9ff' : ad.bg_color, color: ad.embed_html ? '#0369a1' : ad.text_color }}>{ad.sponsor_name}</span>
                          {ad.embed_html && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Code size={10} /> HTML embed</span>}
                          <span className={ad.active ? 'text-xs text-green-600 font-medium' : 'text-xs text-gray-400'}>{ad.active ? '● Active' : '○ Paused'}</span>
                          <span className="text-xs text-gray-400">Order {ad.display_order}</span>
                        </div>
                        <p className="font-medium text-gray-800 text-sm">{ad.title}</p>
                        {ad.embed_html ? <div className="mt-2 border border-gray-100 rounded-lg p-2 bg-gray-50 overflow-auto max-h-24" dangerouslySetInnerHTML={{ __html: ad.embed_html }} /> : <><p className="text-xs text-gray-500 mt-0.5">{ad.description}</p><div className="flex items-center gap-3 mt-1"><span className="text-xs text-gray-400">CTA: &quot;{ad.cta_text}&quot;</span><a href={ad.link_url} target="_blank" rel="noopener" className="text-xs text-blue-500 hover:underline truncate max-w-48">{ad.link_url}</a></div></>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={async () => { await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id); loadAds() }} className={ad.active ? 'px-3 py-1 text-xs rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-medium' : 'px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium'}>{ad.active ? 'Pause' : 'Activate'}</button>
                        <button onClick={async () => { if (!confirm('Delete this ad?')) return; await supabase.from('ads').delete().eq('id', ad.id); loadAds() }} className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {!ads.length && <p className="text-center py-8 text-gray-400 text-sm">No ads yet. Add one above.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Platform-wide stats. Data pulled live from Supabase.</p>
              <button onClick={loadAnalytics} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"><RefreshCw size={13} /> Refresh</button>
            </div>
            {analyticsLoading ? <div className="py-24 text-center text-gray-400 text-sm">Loading analytics...</div> : !analytics ? null : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: analytics.totalUsers, sub: `+${analytics.newUsersLast30} last 30d`, icon: <Users size={18} className="text-blue-500" /> },
                    { label: 'Total Claims', value: analytics.totalClaims, sub: `+${analytics.newClaimsLast30} last 30d`, icon: <BarChart2 size={18} className="text-orange-500" /> },
                    { label: 'Resolved Claims', value: analytics.resolvedClaims, sub: analytics.totalClaims > 0 ? Math.round(analytics.resolvedClaims / analytics.totalClaims * 100) + '% rate' : '0%', icon: <CheckCircle size={18} className="text-green-500" /> },
                    { label: 'Referral Signups', value: analytics.referralConversions, sub: analytics.totalUsers > 0 ? Math.round(analytics.referralConversions / analytics.totalUsers * 100) + '% of users' : '0%', icon: <TrendingUp size={18} className="text-purple-500" /> },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between mb-2">{s.icon}<span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{s.sub}</span></div>
                      <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock size={15} className="text-blue-500" /> Response & Resolution</h3>
                    <div className="space-y-4">
                      <div><div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Avg days to first builder response</span><span className="text-sm font-bold text-gray-800">{analytics.avgDaysToFirstResponse}d</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(analytics.avgDaysToFirstResponse / 14 * 100, 100)}%` }} /></div></div>
                      <div><div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Avg days to resolution</span><span className="text-sm font-bold text-gray-800">{analytics.avgDaysToResolution}d</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(analytics.avgDaysToResolution / 60 * 100, 100)}%` }} /></div></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart2 size={15} className="text-orange-500" /> Claims by Category</h3>
                    <SvgBarChart data={analytics.claimsByCategory.slice(0, 8).map(c => ({ label: c.category.slice(0, 6), value: c.count }))} color="#f97316" height={130} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="text-sm font-semibold text-gray-800 mb-4">Signups per week (last 8 weeks)</h3><SvgBarChart data={analytics.signupsByWeek.map(d => ({ label: d.week, value: d.count }))} color="#3b82f6" height={130} /></div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5"><h3 className="text-sm font-semibold text-gray-800 mb-4">New claims per week (last 8 weeks)</h3><SvgBarChart data={analytics.claimsByWeek.map(d => ({ label: d.week, value: d.count }))} color="#f59e0b" height={130} /></div>
                </div>
                {analytics.topBuilders.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-purple-500" /> Builder Activity</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100 text-left"><th className="pb-2 text-xs text-gray-500 font-medium">Builder</th><th className="pb-2 text-xs text-gray-500 font-medium text-right">Claims</th><th className="pb-2 text-xs text-gray-500 font-medium text-right">Resolved</th><th className="pb-2 text-xs text-gray-500 font-medium text-right">Avg Response</th></tr></thead>
                        <tbody className="divide-y divide-gray-50">{analytics.topBuilders.map(b => (<tr key={b.name} className="hover:bg-gray-50"><td className="py-2 font-medium text-gray-800">{b.name}</td><td className="py-2 text-right text-gray-600">{b.claims}</td><td className="py-2 text-right text-gray-600">{b.resolved}</td><td className="py-2 text-right text-gray-500">{b.avg_response != null ? b.avg_response.toFixed(1) + 'd' : '—'}</td></tr>))}</tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── DATA TAB ── */}
        {tab === 'data' && (
          <div className="max-w-7xl mx-auto pb-8 space-y-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
              <p className="text-sm text-gray-500">Master rollup — every user and all their claims in one view.</p>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedClaims.size > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                    <span className="text-xs font-medium text-blue-700">{selectedClaims.size} selected</span>
                    <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="text-xs border border-blue-300 rounded px-2 py-1 text-blue-800 bg-white focus:outline-none">
                      <option value="">Set status…</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="awaiting_builder">Awaiting Builder</option><option value="resolved">Resolved</option><option value="escalated">Escalated</option><option value="closed">Closed</option>
                    </select>
                    <button onClick={applyBulkStatus} disabled={!bulkStatus || bulkUpdating} className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded font-medium hover:bg-blue-700 disabled:opacity-40">{bulkUpdating ? 'Updating…' : 'Apply'}</button>
                    <button onClick={clearSelection} className="text-xs text-blue-500 hover:text-blue-700">Clear</button>
                  </div>
                )}
                <button onClick={selectAllClaims} className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"><CheckSquare size={13} /> Select All Claims</button>
                <button onClick={() => exportRollupCsv(rollupData)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white font-medium"><Download size={13} /> Export CSV</button>
                <button onClick={loadRollup} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"><RefreshCw size={13} /> Refresh</button>
              </div>
            </div>
            {rollupLoading ? <div className="py-24 text-center text-gray-400 text-sm">Loading…</div> : (
              <div className="space-y-4">
                {rollupData.map((u2: any) => (
                  <div key={u2.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 text-sm">{u2.name || u2.email}</span>
                        <span className="text-xs text-gray-400">{u2.email}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[u2.plan] || 'bg-gray-100 text-gray-600'}`}>{u2.plan}</span>
                        {u2.role === 'admin' && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">admin</span>}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                        {u2.city && <span>{u2.city}</span>}
                        {u2.builder_name && <span>· {u2.builder_name}</span>}
                        <span className="font-medium text-gray-600">{u2.claims.length} claim{u2.claims.length !== 1 ? 's' : ''}</span>
                        <button onClick={() => loginAsUser(u2)} disabled={!!loginAsLoading} className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-medium ${copiedLink === u2.id ? 'border-green-400 bg-green-50 text-green-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'} disabled:opacity-40`}>
                          {loginAsLoading === u2.id ? <RefreshCw size={10} className="animate-spin" /> : copiedLink === u2.id ? <Check size={10} /> : <LogIn size={10} />}
                          {copiedLink === u2.id ? 'Copied!' : 'Login as'}
                        </button>
                      </div>
                    </div>
                    {u2.claims.length === 0 ? <div className="px-5 py-3 text-xs text-gray-400 italic">No claims yet</div> : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead><tr className="border-b border-gray-100 text-left">
                            <th className="px-3 py-2 text-gray-400 font-medium w-8"><input type="checkbox" checked={u2.claims.every((c: any) => selectedClaims.has(c.id))} onChange={e => { u2.claims.forEach((c: any) => { if (e.target.checked) { setSelectedClaims(prev => { const n = new Set(prev); n.add(c.id); return n }) } else { setSelectedClaims(prev => { const n = new Set(prev); n.delete(c.id); return n }) } }) }} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></th>
                            <th className="px-4 py-2 text-gray-400 font-medium">Title</th><th className="px-4 py-2 text-gray-400 font-medium">Category</th><th className="px-4 py-2 text-gray-400 font-medium">Sev</th><th className="px-4 py-2 text-gray-400 font-medium">Status</th><th className="px-4 py-2 text-gray-400 font-medium">Location</th><th className="px-4 py-2 text-gray-400 font-medium">Filed</th><th className="px-4 py-2 text-gray-400 font-medium">1st Resp</th><th className="px-4 py-2 text-gray-400 font-medium">Resolved</th><th className="px-4 py-2 text-gray-400 font-medium">Public</th>
                          </tr></thead>
                          <tbody className="divide-y divide-gray-50">
                            {u2.claims.map((c: any) => (
                              <tr key={c.id} className={`hover:bg-gray-50 ${selectedClaims.has(c.id) ? 'bg-blue-50' : ''}`}>
                                <td className="px-3 py-2"><input type="checkbox" checked={selectedClaims.has(c.id)} onChange={() => toggleClaimSelection(c.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></td>
                                <td className="px-4 py-2 text-gray-800 font-medium max-w-[200px] truncate" title={c.title}>{c.title}</td>
                                <td className="px-4 py-2 capitalize text-gray-600">{c.category}</td>
                                <td className="px-4 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.severity === 'high' || c.severity === 'critical' ? 'bg-red-100 text-red-700' : c.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{c.severity}</span></td>
                                <td className="px-4 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${['resolved','closed'].includes(c.status) ? 'bg-green-100 text-green-700' : c.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status.replace(/_/g,' ')}</span></td>
                                <td className="px-4 py-2 text-gray-500 max-w-[100px] truncate" title={c.defect_location}>{c.defect_location || '—'}</td>
                                <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
                                <td className="px-4 py-2 text-gray-500 text-center">{c.days_to_first_response != null ? Math.round(c.days_to_first_response) + 'd' : '—'}</td>
                                <td className="px-4 py-2 text-gray-500 text-center">{c.days_to_resolution != null ? Math.round(c.days_to_resolution) + 'd' : '—'}</td>
                                <td className="px-4 py-2 text-center">{c.public_story ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BUILDER REPORTS TAB ── */}
        {tab === 'builder_reports' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Date Range</label>
                <select value={builderDateRange} onChange={e => setBuilderDateRange(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All time</option><option value="30">Past 30 days</option><option value="90">Past 90 days</option><option value="180">Past 180 days</option><option value="365">Past 365 days</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Warranty Year</label>
                <select value={builderWarrantyYear} onChange={e => setBuilderWarrantyYear(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All years</option><option value="1">Year 1</option><option value="2">Year 2</option><option value="10">Year 10</option>
                </select>
              </div>
              {builderReport.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">Filter Builders</label>
                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {builderReport.map(b => (
                      <label key={b.builder_id} className="flex items-center gap-1 text-xs cursor-pointer select-none">
                        <input type="checkbox"
                          checked={builderFilter.size === 0 || builderFilter.has(b.builder_id)}
                          onChange={e => {
                            setBuilderFilter(prev => {
                              const all = builderReport.map(x => x.builder_id)
                              const current = prev.size === 0 ? new Set(all) : new Set(prev)
                              if (e.target.checked) current.add(b.builder_id); else current.delete(b.builder_id)
                              return current.size === all.length ? new Set() : current
                            })
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-600">{b.builder_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 ml-auto items-center flex-wrap">
                <div className="relative">
                  <button onClick={() => setShowColToggle(v => !v)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"><SlidersHorizontal size={13} /> Columns</button>
                  {showColToggle && (
                    <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-48 space-y-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Toggle Columns</p>
                      {BUILDER_COLS.map(c => (
                        <label key={c.key} className="flex items-center gap-2 text-xs cursor-pointer select-none hover:bg-gray-50 rounded p-1">
                          <input type="checkbox" checked={colVisible[c.key] !== false} onChange={() => toggleCol(c.key)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-gray-700">{c.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => loadBuilderReport()} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"><RefreshCw size={13} /> Refresh</button>
                <button onClick={() => exportBuilderReportCsv(filteredBuilderReport, colVisible)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white font-medium"><Download size={13} /> Export CSV</button>
              </div>
            </div>

            {builderReportLoading ? <div className="py-16 text-center text-gray-400 text-sm">Loading builder report…</div> : filteredBuilderReport.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">No builder data. Click Refresh to load.</div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-xs text-gray-500 font-medium text-left sticky left-0 bg-gray-50 z-10">Builder</th>
                        {visibleBuilderCols.map(c => (
                          <th key={c.key} className="px-3 py-3 text-xs text-gray-500 font-medium text-right whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none" onClick={() => builderSortBy(c.key)}>
                            {c.label}{builderSortCol === c.key ? (builderSortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                          </th>
                        ))}
                        <th className="px-3 py-3 text-xs text-gray-500 font-medium text-center">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredBuilderReport.map(b => (
                        <>
                          <tr key={b.builder_id} className={`hover:bg-gray-50 ${expandedBuilder === b.builder_id ? 'bg-blue-50' : ''}`}>
                            <td className="px-4 py-3 font-semibold text-gray-900 sticky left-0 bg-white z-10 whitespace-nowrap">{b.builder_name}</td>
                            {visibleBuilderCols.map(c => {
                              const val = (b as any)[c.key]
                              let display: React.ReactNode = val != null ? val : '—'
                              if (c.key === 'resolve_rate') display = val != null ? val + '%' : '—'
                              if (c.key === 'avg_days_to_first_response' || c.key === 'avg_days_to_resolution') display = val != null ? val + 'd' : '—'
                              if (c.key === 'accountability_score') display = val != null ? <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${val >= 80 ? 'bg-green-100 text-green-700' : val >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{val}</span> : '—'
                              return <td key={c.key} className="px-3 py-3 text-right text-gray-700 text-xs whitespace-nowrap">{display}</td>
                            })}
                            <td className="px-3 py-3 text-center">
                              <button onClick={() => setExpandedBuilder(expandedBuilder === b.builder_id ? null : b.builder_id)} className="text-blue-600 hover:text-blue-800">
                                {expandedBuilder === b.builder_id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </td>
                          </tr>
                          {expandedBuilder === b.builder_id && (
                            <tr key={b.builder_id + '_exp'}>
                              <td colSpan={visibleBuilderCols.length + 2} className="bg-blue-50 px-4 py-3">
                                <p className="text-xs font-semibold text-blue-700 mb-2">{b.builder_name} — {b.claims.length} claim{b.claims.length !== 1 ? 's' : ''} in current filters</p>
                                {b.claims.length === 0 ? <p className="text-xs text-gray-400 italic">No claims match current filters.</p> : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead><tr className="border-b border-blue-100 text-left">
                                        <th className="pb-1 text-gray-500 font-medium pr-4">Title</th><th className="pb-1 text-gray-500 font-medium pr-4">Category</th><th className="pb-1 text-gray-500 font-medium pr-4">Severity</th><th className="pb-1 text-gray-500 font-medium pr-4">Status</th><th className="pb-1 text-gray-500 font-medium pr-4">City</th><th className="pb-1 text-gray-500 font-medium pr-4">Warranty Yr</th><th className="pb-1 text-gray-500 font-medium pr-4">1st Resp</th><th className="pb-1 text-gray-500 font-medium">Filed</th>
                                      </tr></thead>
                                      <tbody className="divide-y divide-blue-50">
                                        {b.claims.map(c => (
                                          <tr key={c.id} className="hover:bg-blue-100">
                                            <td className="py-1 pr-4 text-gray-800 max-w-[180px] truncate" title={c.title}>{c.title}</td>
                                            <td className="py-1 pr-4 capitalize text-gray-600">{c.category}</td>
                                            <td className="py-1 pr-4"><span className={`px-1 py-0.5 rounded text-[9px] font-medium ${c.severity === 'critical' || c.severity === 'high' ? 'bg-red-100 text-red-700' : c.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{c.severity}</span></td>
                                            <td className="py-1 pr-4"><span className={`px-1 py-0.5 rounded text-[9px] font-medium ${STATUS_PILL_COLORS[c.status] || 'bg-gray-100 text-gray-500'}`}>{c.status.replace(/_/g,' ')}</span></td>
                                            <td className="py-1 pr-4 text-gray-500">{c.city || '—'}</td>
                                            <td className="py-1 pr-4 text-gray-500 text-center">{c.warranty_year || '—'}</td>
                                            <td className="py-1 pr-4 text-gray-500 text-center">{c.days_to_first_response != null ? Math.round(c.days_to_first_response) + 'd' : '—'}</td>
                                            <td className="py-1 text-gray-400 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'})}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
