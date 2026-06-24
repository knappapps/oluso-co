'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ShieldAlert, Megaphone, Code, LayoutTemplate, Users, Search, ChevronDown, ChevronUp, RefreshCw, BarChart2, TrendingUp, Clock, CheckCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Ad {
  id: string
  sponsor_name: string
  title: string
  description: string
  cta_text: string
  link_url: string
  bg_color: string
  text_color: string
  active: boolean
  display_order: number
  embed_html?: string
}

interface AdminUser {
  id: string
  email: string
  name: string | null
  builder_name: string | null
  community_name: string | null
  plan: string
  role: string | null
  onboarding_complete: boolean
  created_at: string
  warranty_start: string | null
  claim_count?: number
}

interface AnalyticsData {
  totalUsers: number
  newUsersLast30: number
  totalClaims: number
  newClaimsLast30: number
  resolvedClaims: number
  avgDaysToResolution: number
  avgDaysToFirstResponse: number
  referralConversions: number
  claimsByCategory: { category: string; count: number }[]
  signupsByWeek: { week: string; count: number }[]
  claimsByWeek: { week: string; count: number }[]
  topBuilders: { name: string; claims: number; resolved: number; avg_response: number | null }[]
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
      try {
        const url = new URL(href)
        const host = url.hostname.replace('www.', '')
        if (host.includes('homedepot')) result.sponsor_name = 'Home Depot'
        else if (host.includes('lowes')) result.sponsor_name = "Lowe's"
        else result.sponsor_name = host.split('.')[0].replace(/-/g, ' ')
      } catch {}
    }
    const img = doc.querySelector('img[alt]')
    if (img) result.title = img.getAttribute('alt') || ''
    if (!result.title) result.title = doc.body?.textContent?.trim()?.slice(0, 60) || ''
  } catch {}
  return result
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  basic: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-purple-700',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  user: 'bg-gray-100 text-gray-500',
}

export default function AdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState('users')

  // Ads state
  const [ads, setAds] = useState<Ad[]>([])
  const [embedMode, setEmbedMode] = useState(false)
  const [embedHtml, setEmbedHtml] = useState('')
  const [parsedFields, setParsedFields] = useState({ sponsor_name: '', link_url: '', title: '' })
  const [embedPreview, setEmbedPreview] = useState(false)
  const [formKey, setFormKey] = useState(0)

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [userStats, setUserStats] = useState({ total: 0, free: 0, basic: 0, pro: 0, admins: 0 })

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', session.user.id)
        .single()
      if (!profile || profile.role !== 'admin') {
        router.replace('/dashboard')
        return
      }
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
      const { data } = await supabase
        .from('users')
        .select('id, email, name, builder_name, community_name, plan, role, onboarding_complete, created_at, warranty_start')
        .order('created_at', { ascending: false })
      const userList = (data as AdminUser[]) || []
      const { data: claimData } = await supabase.from('claims').select('user_id')
      const claimCounts: Record<string, number> = {}
      for (const c of (claimData || [])) {
        claimCounts[c.user_id] = (claimCounts[c.user_id] || 0) + 1
      }
      const enriched = userList.map(u => ({ ...u, claim_count: claimCounts[u.id] || 0 }))
      setUsers(enriched)
      setUserStats({
        total: enriched.length,
        free: enriched.filter(u => u.plan === 'free').length,
        basic: enriched.filter(u => u.plan === 'basic').length,
        pro: enriched.filter(u => u.plan === 'pro').length,
        admins: enriched.filter(u => u.role === 'admin').length,
      })
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [
        { data: allUsers },
        { data: newUsers },
        { data: allClaims },
        { data: newClaims },
        { data: resolvedClaims },
        { data: builderScores },
        { data: referrals },
      ] = await Promise.all([
        supabase.from('users').select('id, created_at, referred_by'),
        supabase.from('users').select('id, created_at').gte('created_at', thirtyDaysAgo),
        supabase.from('claims').select('id, created_at, status, category, days_to_first_response, resolved_at, user_id'),
        supabase.from('claims').select('id, created_at').gte('created_at', thirtyDaysAgo),
        supabase.from('claims').select('id, resolved_at, created_at').in('status', ['resolved', 'closed']).not('resolved_at', 'is', null),
        supabase.from('builder_scores').select('name, total_claims, resolve_rate_pct, avg_days_to_first_response').order('total_claims', { ascending: false }).limit(8),
        supabase.from('users').select('id').not('referred_by', 'is', null),
      ])

      // Avg days to resolution
      const resolutionDays = (resolvedClaims || [])
        .map((c: any) => c.resolved_at && c.created_at
          ? Math.floor((new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / 86400000)
          : null)
        .filter((d: any) => d !== null) as number[]
      const avgDaysToResolution = resolutionDays.length
        ? Math.round(resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length)
        : 0

      // Avg days to first response
      const respDays = (allClaims || [])
        .map((c: any) => c.days_to_first_response)
        .filter((d: any) => d !== null && d !== undefined) as number[]
      const avgDaysToFirstResponse = respDays.length
        ? Math.round(respDays.reduce((a, b) => a + b, 0) / respDays.length * 10) / 10
        : 0

      // Claims by category
      const catMap: Record<string, number> = {}
      for (const c of (allClaims || [])) {
        const cat = (c as any).category || 'other'
        catMap[cat] = (catMap[cat] || 0) + 1
      }
      const claimsByCategory = Object.entries(catMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)

      // Signups by week (last 8 weeks)
      function weekKey(d: string) {
        const date = new Date(d)
        const day = date.getDay()
        const diff = date.getDate() - day
        const monday = new Date(date.setDate(diff))
        return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      const signupWeeks: Record<string, number> = {}
      const claimWeeks: Record<string, number> = {}
      const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000).toISOString()
      for (const u of (allUsers || [])) {
        if (u.created_at >= eightWeeksAgo) {
          const w = weekKey(u.created_at)
          signupWeeks[w] = (signupWeeks[w] || 0) + 1
        }
      }
      for (const c of (allClaims || [])) {
        if ((c as any).created_at >= eightWeeksAgo) {
          const w = weekKey((c as any).created_at)
          claimWeeks[w] = (claimWeeks[w] || 0) + 1
        }
      }

      setAnalytics({
        totalUsers: (allUsers || []).length,
        newUsersLast30: (newUsers || []).length,
        totalClaims: (allClaims || []).length,
        newClaimsLast30: (newClaims || []).length,
        resolvedClaims: (resolvedClaims || []).length,
        avgDaysToResolution,
        avgDaysToFirstResponse,
        referralConversions: (referrals || []).length,
        claimsByCategory,
        signupsByWeek: Object.entries(signupWeeks).map(([week, count]) => ({ week, count })),
        claimsByWeek: Object.entries(claimWeeks).map(([week, count]) => ({ week, count })),
        topBuilders: (builderScores || []).map((b: any) => ({
          name: b.name,
          claims: b.total_claims,
          resolved: Math.round((b.resolve_rate_pct || 0) * b.total_claims / 100),
          avg_response: b.avg_days_to_first_response,
        })),
      })
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadAds()
      loadUsers()
    }
  }, [isAdmin, loadAds, loadUsers])

  useEffect(() => {
    if (isAdmin && tab === 'analytics' && !analytics) {
      loadAnalytics()
    }
  }, [isAdmin, tab, analytics, loadAnalytics])

  async function updateUserPlan(userId: string, plan: string) {
    setUpdatingUser(userId)
    await supabase.from('users').update({ plan }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u))
    setUpdatingUser(null)
  }

  async function updateUserRole(userId: string, role: string) {
    setUpdatingUser(userId)
    await supabase.from('users').update({ role }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    setUpdatingUser(null)
  }

  function handleEmbedPaste(html: string) {
    setEmbedHtml(html)
    if (html.trim()) {
      setParsedFields(parseEmbedHtml(html))
      setEmbedPreview(true)
    } else {
      setEmbedPreview(false)
    }
  }

  async function submitEmbedAd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const { error } = await supabase.from('ads').insert({
      sponsor_name: (fd.get('sponsor_name') as string) || parsedFields.sponsor_name || 'Sponsored',
      title: (fd.get('title') as string) || parsedFields.title || 'Sponsored',
      description: '',
      cta_text: '',
      link_url: parsedFields.link_url || '',
      bg_color: '#ffffff',
      text_color: '#000000',
      display_order: parseInt(fd.get('display_order') as string) || 0,
      active: true,
      embed_html: embedHtml,
    })
    if (!error) {
      setEmbedHtml('')
      setParsedFields({ sponsor_name: '', link_url: '', title: '' })
      setEmbedPreview(false)
      setFormKey(k => k + 1)
      loadAds()
    } else alert('Error: ' + error.message)
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = !userSearch ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.builder_name?.toLowerCase().includes(userSearch.toLowerCase())
    const matchesPlan = planFilter === 'all' || u.plan === planFilter
    return matchesSearch && matchesPlan
  })

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Checking access...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <ShieldAlert size={48} className="text-red-400" />
        <h1 className="text-xl font-semibold text-gray-800">Access Denied</h1>
        <p className="text-gray-500">This page is restricted to administrators.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Manage users, ads, and platform analytics.</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          {[
            { key: 'users', label: 'Users', icon: <Users size={14} /> },
            { key: 'ads', label: 'Ads', icon: <Megaphone size={14} /> },
            { key: 'analytics', label: 'Analytics', icon: <BarChart2 size={14} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Total Users', value: userStats.total, color: 'text-gray-800' },
                { label: 'Free', value: userStats.free, color: 'text-gray-500' },
                { label: 'Basic', value: userStats.basic, color: 'text-blue-600' },
                { label: 'Pro', value: userStats.pro, color: 'text-purple-600' },
                { label: 'Admins', value: userStats.admins, color: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by email, name, or builder..." value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All plans</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
                <button onClick={loadUsers} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
              </div>
              {usersLoading ? (
                <div className="py-12 text-center text-gray-400 text-sm">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No users found.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredUsers.map(user => (
                    <div key={user.id}>
                      <div className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 truncate">{user.email}</span>
                            {user.name && <span className="text-xs text-gray-400">({user.name})</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[user.plan] || 'bg-gray-100 text-gray-600'}`}>{user.plan}</span>
                            {user.role === 'admin' && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">admin</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                            {user.builder_name && <span>{user.builder_name}</span>}
                            {user.community_name && <span>· {user.community_name}</span>}
                            <span>· {user.claim_count} claim{user.claim_count !== 1 ? 's' : ''}</span>
                            <span>· Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            {!user.onboarding_complete && <span className="text-orange-400">· Onboarding incomplete</span>}
                          </div>
                        </div>
                        <div className="text-gray-400 shrink-0">
                          {expandedUser === user.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                      {expandedUser === user.id && (
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Plan</p>
                            <div className="flex gap-2 flex-wrap">
                              {['free', 'basic', 'pro'].map(p => (
                                <button key={p} onClick={() => updateUserPlan(user.id, p)}
                                  disabled={updatingUser === user.id}
                                  className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${user.plan === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'}`}>
                                  {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Role</p>
                            <div className="flex gap-2 flex-wrap">
                              {['user', 'admin'].map(r => (
                                <button key={r} onClick={() => updateUserRole(user.id, r)}
                                  disabled={updatingUser === user.id}
                                  className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${(user.role || 'user') === r ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'}`}>
                                  {r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Details</p>
                            <div className="text-xs text-gray-500 space-y-0.5">
                              <p>ID: <span className="font-mono text-gray-400">{user.id}</span></p>
                              {user.warranty_start && <p>Warranty started: {new Date(user.warranty_start).toLocaleDateString()}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Megaphone size={16} className="text-blue-500" /> Add New Ad
                </h3>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setEmbedMode(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!embedMode ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                    <LayoutTemplate size={12} /> Manual
                  </button>
                  <button onClick={() => setEmbedMode(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${embedMode ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Code size={12} /> Paste HTML
                  </button>
                </div>
              </div>
              {!embedMode && (
                <form key={formKey} onSubmit={async (e) => {
                  e.preventDefault()
                  const f = e.currentTarget as HTMLFormElement
                  const fd = new FormData(f)
                  const { error } = await supabase.from('ads').insert({
                    sponsor_name: fd.get('sponsor_name') as string,
                    title: fd.get('title') as string,
                    description: fd.get('description') as string,
                    cta_text: fd.get('cta_text') as string,
                    link_url: fd.get('link_url') as string,
                    bg_color: fd.get('bg_color') as string,
                    text_color: fd.get('text_color') as string,
                    display_order: parseInt(fd.get('display_order') as string) || 0,
                    active: true,
                  })
                  if (!error) { f.reset(); loadAds() }
                  else alert('Error: ' + error.message)
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
                    <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><Code size={12} /> Paste HTML embed code from Home Depot, Lowe&apos;s, etc.</label>
                    <textarea rows={6} value={embedHtml} onChange={e => handleEmbedPaste(e.target.value)}
                      placeholder={'Paste your affiliate HTML here, e.g.:\n<a href="https://www.homedepot.com/..."><img src="..." alt="Home Depot" /></a>'}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {embedPreview && (
                    <div className="space-y-3">
                      <div className="border border-blue-100 bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-700 mb-2">Auto-detected — confirm or edit:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Sponsor Name</label><input name="sponsor_name" defaultValue={parsedFields.sponsor_name} placeholder="e.g. Home Depot" className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" /></div>
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Label / Title</label><input name="title" defaultValue={parsedFields.title} placeholder="Short label for your records" className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" /></div>
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Display Order</label><input name="display_order" type="number" defaultValue="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" /></div>
                          {parsedFields.link_url && (<div className="flex flex-col gap-1"><label className="text-xs text-gray-500 font-medium">Detected Link</label><input readOnly value={parsedFields.link_url} className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 text-gray-500" /></div>)}
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
                          {ad.embed_html && (<span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Code size={10} /> HTML embed</span>)}
                          <span className={ad.active ? 'text-xs text-green-600 font-medium' : 'text-xs text-gray-400'}>{ad.active ? '● Active' : '○ Paused'}</span>
                          <span className="text-xs text-gray-400">Order {ad.display_order}</span>
                        </div>
                        <p className="font-medium text-gray-800 text-sm">{ad.title}</p>
                        {ad.embed_html ? (
                          <div className="mt-2 border border-gray-100 rounded-lg p-2 bg-gray-50 overflow-auto max-h-24" dangerouslySetInnerHTML={{ __html: ad.embed_html }} />
                        ) : (
                          <><p className="text-xs text-gray-500 mt-0.5">{ad.description}</p><div className="flex items-center gap-3 mt-1"><span className="text-xs text-gray-400">CTA: &quot;{ad.cta_text}&quot;</span><a href={ad.link_url} target="_blank" rel="noopener" className="text-xs text-blue-500 hover:underline truncate max-w-48">{ad.link_url}</a></div></>
                        )}
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
              <button onClick={loadAnalytics} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {analyticsLoading ? (
              <div className="py-24 text-center text-gray-400 text-sm">Loading analytics...</div>
            ) : !analytics ? null : (
              <>
                {/* KPI cards */}
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

                {/* Response + Resolution times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock size={15} className="text-blue-500" /> Response & Resolution</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Avg days to first builder response</span><span className="text-sm font-bold text-gray-800">{analytics.avgDaysToFirstResponse}d</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(analytics.avgDaysToFirstResponse / 14 * 100, 100)}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Avg days to resolution</span><span className="text-sm font-bold text-gray-800">{analytics.avgDaysToResolution}d</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(analytics.avgDaysToResolution / 60 * 100, 100)}%` }} /></div>
                      </div>
                    </div>
                  </div>

                  {/* Claims by category */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart2 size={15} className="text-orange-500" /> Claims by Category</h3>
                    <div className="space-y-2">
                      {analytics.claimsByCategory.slice(0, 6).map(c => (
                        <div key={c.category}>
                          <div className="flex justify-between mb-0.5"><span className="text-xs text-gray-600 capitalize">{c.category}</span><span className="text-xs font-medium text-gray-800">{c.count}</span></div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${analytics.totalClaims > 0 ? Math.round(c.count / analytics.totalClaims * 100) : 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Signups + Claims per week */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Signups per week (last 8 weeks)', data: analytics.signupsByWeek, color: 'bg-blue-400' },
                    { title: 'New claims per week (last 8 weeks)', data: analytics.claimsByWeek, color: 'bg-orange-400' },
                  ].map(chart => {
                    const maxVal = Math.max(...chart.data.map(d => d.count), 1)
                    return (
                      <div key={chart.title} className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-800 mb-4">{chart.title}</h3>
                        {chart.data.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-6">Not enough data yet</p>
                        ) : (
                          <div className="flex items-end gap-2 h-28">
                            {chart.data.map(d => (
                              <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] text-gray-500">{d.count}</span>
                                <div className={`w-full rounded-t ${chart.color}`} style={{ height: `${Math.max(d.count / maxVal * 80, 4)}px` }} />
                                <span className="text-[9px] text-gray-400 text-center leading-tight">{d.week}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Builder leaderboard */}
                {analytics.topBuilders.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-purple-500" /> Builder Activity</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100 text-left">
                          <th className="pb-2 text-xs text-gray-500 font-medium">Builder</th>
                          <th className="pb-2 text-xs text-gray-500 font-medium text-right">Claims</th>
                          <th className="pb-2 text-xs text-gray-500 font-medium text-right">Resolved</th>
                          <th className="pb-2 text-xs text-gray-500 font-medium text-right">Avg Response</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {analytics.topBuilders.map(b => (
                            <tr key={b.name} className="hover:bg-gray-50">
                              <td className="py-2 font-medium text-gray-800">{b.name}</td>
                              <td className="py-2 text-right text-gray-600">{b.claims}</td>
                              <td className="py-2 text-right text-gray-600">{b.resolved}</td>
                              <td className="py-2 text-right text-gray-500">{b.avg_response != null ? b.avg_response.toFixed(1) + 'd' : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
