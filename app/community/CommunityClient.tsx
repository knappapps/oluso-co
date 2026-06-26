'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Users, MapPin, Clock, CheckCircle, AlertCircle, Building2, TrendingUp, Search, X } from 'lucide-react'
import Header from '@/components/Header'

const CATEGORIES = ['structural', 'water', 'electrical', 'hvac', 'plumbing', 'cosmetic', 'landscaping', 'other']
const SEVERITIES = ['low', 'medium', 'high', 'critical']
const STATUSES = ['resolved', 'closed', 'in_progress', 'awaiting_builder']

const SEVERITY_COLORS: Record<string, string> = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_DISPLAY: Record<string, string> = {
    resolved: 'Resolved',
    closed: 'Closed',
    in_progress: 'In Progress',
    awaiting_builder: 'Awaiting Builder',
}

function nameToSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface Props {
    rawStories: any[]
    statsRow: any[]
    builderScores: any[]
}

export default function CommunityClient({ rawStories, statsRow, builderScores }: Props) {
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
    const [severityFilter, setSeverityFilter] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'response'>('newest')

  const stats = statsRow || []
      const totalClaims = stats.length
    const resolved = stats.filter((s: any) => ['resolved', 'closed'].includes(s.status)).length
    const respStats = stats.filter((s: any) => s.days_to_first_response != null)
    const avgResponse = respStats.length
      ? respStats.reduce((a: number, b: any) => a + b.days_to_first_response, 0) / respStats.length
          : 0

  const filtered = useMemo(() => {
        let results = [...rawStories]

                               if (search.trim()) {
                                       const q = search.toLowerCase()
                                       results = results.filter((s: any) => {
                                                 const user = s.users as any
                                                 const builder = s.builders as any
                                                 return (
                                                             s.category?.toLowerCase().includes(q) ||
                                                             s.defect_location?.toLowerCase().includes(q) ||
                                                             builder?.name?.toLowerCase().includes(q) ||
                                                             user?.city?.toLowerCase().includes(q) ||
                                                             user?.community_name?.toLowerCase().includes(q)
                                                           )
                                       })
                               }

                               if (categoryFilter) results = results.filter((s: any) => s.category === categoryFilter)
        if (severityFilter) results = results.filter((s: any) => s.severity === severityFilter)
        if (statusFilter) results = results.filter((s: any) => s.status === statusFilter)

                               if (sortBy === 'newest') results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        else if (sortBy === 'oldest') results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        else if (sortBy === 'response') results.sort((a, b) => {
                if (a.days_to_first_response == null) return 1
                if (b.days_to_first_response == null) return -1
                return a.days_to_first_response - b.days_to_first_response
        })

                               return results
  }, [rawStories, search, categoryFilter, severityFilter, statusFilter, sortBy])

  const hasActiveFilters = search || categoryFilter || severityFilter || statusFilter

  function clearFilters() {
        setSearch('')
        setCategoryFilter(null)
        setSeverityFilter(null)
        setStatusFilter(null)
        setSortBy('newest')
  }

  return (
        <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="max-w-5xl mx-auto px-4 py-12 pt-24">
                      <div className="text-center mb-12">
                                <h1 className="text-3xl font-bold text-gray-900 mb-3">Community Warranty Stories</h1>h1>
                                <p className="text-gray-500 max-w-xl mx-auto">Real warranty experiences. No names. No addresses. Just the facts.</p>p>
                      </div>div>
              
                {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {[
          { label: 'Stories Shared', value: totalClaims, icon: <Users size={18} /> },
          { label: 'Issues Resolved', value: resolved, icon: <CheckCircle size={18} /> },
          { label: 'Avg Response (days)', value: avgResponse.toFixed(1), icon: <Clock size={18} /> },
          { label: 'Resolution Rate', value: totalClaims > 0 ? Math.round((resolved / totalClaims) * 100) + '%' : 'N/A', icon: <TrendingUp size={18} /> },
                    ].map(s => (
                                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                                                <div className="flex justify-center text-blue-500 mb-2">{s.icon}</div>div>
                                                <div className="text-2xl font-bold text-gray-900">{s.value}</div>div>
                                                <div className="text-xs text-gray-500 mt-1">{s.label}</div>div>
                                  </div>div>
                                ))}
                      </div>div>
              
                {/* Builder Scores */}
                {builderScores && builderScores.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                              <Building2 size={18} className="text-blue-500" /> Builder Accountability Scores
                                </h2>h2>
                                <div className="overflow-x-auto">
                                              <table className="w-full text-sm">
                                                              <thead>
                                                                                <tr className="border-b border-gray-100">
                                                                                                    <th className="text-left py-2 text-gray-500 font-medium">Builder</th>th>
                                                                                                    <th className="text-right py-2 text-gray-500 font-medium">Claims</th>th>
                                                                                                    <th className="text-right py-2 text-gray-500 font-medium">Resolved %</th>th>
                                                                                                    <th className="text-right py-2 text-gray-500 font-medium">Avg Resp</th>th>
                                                                                                    <th className="text-right py-2 text-gray-500 font-medium">Score</th>th>
                                                                                </tr>tr>
                                                              </thead>thead>
                                                              <tbody>
                                                                {builderScores.map((b: any) => (
                                          <tr key={b.name} className="border-b border-gray-50 hover:bg-gray-50">
                                                                <td className="py-2 font-medium text-gray-900">{b.name}</td>td>
                                                                <td className="py-2 text-right text-gray-600">{b.total_claims}</td>td>
                                                                <td className="py-2 text-right">
                                                                                        <span className={b.resolve_rate_pct >= 70 ? 'text-green-600' : b.resolve_rate_pct >= 40 ? 'text-yellow-600' : 'text-red-600'}>
                                                                                          {b.resolve_rate_pct?.toFixed(0)}%
                                                                                          </span>span>
                                                                </td>td>
                                                                <td className="py-2 text-right text-gray-600">{b.avg_days_to_first_response?.toFixed(1)}d</td>td>
                                                                <td className="py-2 text-right font-bold">
                                                                                        <span className={b.accountability_score >= 70 ? 'text-green-600' : b.accountability_score >= 40 ? 'text-yellow-600' : 'text-red-600'}>
                                                                                          {b.accountability_score?.toFixed(0)}
                                                                                          </span>span>
                                                                </td>td>
                                          </tr>tr>
                                        ))}
                                                              </tbody>tbody>
                                              </table>table>
                                </div>div>
                    </div>div>
                      )}
              
                {/* Search + Filters */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
                        {/* Search bar */}
                                <div className="relative">
                                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                            type="text"
                                                            placeholder="Search by category, location, builder, city..."
                                                            value={search}
                                                            onChange={e => setSearch(e.target.value)}
                                                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                          />
                                  {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X size={14} />
                        </button>button>
                                            )}
                                </div>div>
                      
                        {/* Filter pills row */}
                                <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-xs text-gray-400 font-medium shrink-0">Category:</span>span>
                                  {CATEGORIES.map(cat => (
                        <button
                                          key={cat}
                                          onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                                          className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors capitalize ${categoryFilter === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                                        >
                          {cat}
                        </button>button>
                      ))}
                                </div>div>
                      
                                <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-xs text-gray-400 font-medium shrink-0">Severity:</span>span>
                                  {SEVERITIES.map(sev => (
                        <button
                                          key={sev}
                                          onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}
                                          className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors capitalize ${severityFilter === sev ? 'bg-gray-800 text-white border-gray-800' : `bg-white border ${SEVERITY_COLORS[sev]} hover:opacity-80`}`}
                                        >
                          {sev}
                        </button>button>
                      ))}
                                </div>div>
                      
                                <div className="flex flex-wrap gap-2 items-center justify-between">
                                            <div className="flex flex-wrap gap-2 items-center">
                                                          <span className="text-xs text-gray-400 font-medium shrink-0">Status:</span>span>
                                              {STATUSES.map(st => (
                          <button
                                              key={st}
                                              onClick={() => setStatusFilter(statusFilter === st ? null : st)}
                                              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${statusFilter === st ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                                            >
                            {STATUS_DISPLAY[st]}
                          </button>button>
                        ))}
                                            </div>div>
                                            <div className="flex items-center gap-2 ml-auto">
                                                          <span className="text-xs text-gray-400 font-medium">Sort:</span>span>
                                                          <select
                                                                            value={sortBy}
                                                                            onChange={e => setSortBy(e.target.value as any)}
                                                                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                                                          >
                                                                          <option value="newest">Newest first</option>option>
                                                                          <option value="oldest">Oldest first</option>option>
                                                                          <option value="response">Fastest response</option>option>
                                                          </select>select>
                                            </div>div>
                                </div>div>
                      
                        {/* Active filter summary */}
                        {hasActiveFilters && (
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">
                                                    Showing <span className="font-semibold text-gray-800">{filtered.length}</span>span> of {rawStories.length} stories
                                    </span>span>
                                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                                    <X size={12} /> Clear all filters
                                    </button>button>
                      </div>div>
                                )}
                      </div>div>
              
                {/* Stories grid */}
                      <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                  {hasActiveFilters ? `Filtered Stories (${filtered.length})` : 'Recent Stories'}
                                </h2>h2>
                        {filtered.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                                    <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        {hasActiveFilters ? (
                                        <>
                                                          <p className="text-gray-500 font-medium">No stories match your filters</p>p>
                                                          <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">Clear filters</button>button>
                                        </>>
                                      ) : (
                                        <>
                                                          <p className="text-gray-500">No stories yet. Be the first!</p>p>
                                                          <Link href="/dashboard" className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                                                                              Join and share
                                                          </Link>Link>
                                        </>>
                                      )}
                      </div>div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {filtered.map((story: any) => {
                                        const user = story.users as any
                                                          const builder = story.builders as any
                                                                            return (
                                                                                                <div key={story.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                                                                                                                    <div className="flex items-start justify-between mb-3 gap-2">
                                                                                                                                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded capitalize">
                                                                                                                                            {story.category}{story.defect_location ? ' / ' + story.defect_location : ''}
                                                                                                                                            </span>span>
                                                                                                                                          <div className="flex items-center gap-1.5 shrink-0">
                                                                                                                                                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${SEVERITY_COLORS[story.severity] || 'bg-gray-100 text-gray-600 border-gray-200'} capitalize`}>
                                                                                                                                                                    {story.severity}
                                                                                                                                                                    </span>span>
                                                                                                                                                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${['resolved','closed'].includes(story.status) ? 'bg-green-100 text-green-700' : story.status === 'awaiting_builder' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                                                                                                                    {story.status.replace(/_/g, ' ')}
                                                                                                                                                                    </span>span>
                                                                                                                                            </div>div>
                                                                                                                      </div>div>
                                                                                                                    <div className="space-y-1.5 text-sm text-gray-600">
                                                                                                                      {builder?.name && (
                                                                                                                          <div className="flex items-center gap-2">
                                                                                                                                                    <Building2 size={13} className="text-gray-400 shrink-0" />
                                                                                                                                                    <span className="font-medium text-gray-800">{builder.name}</span>span>
                                                                                                                            </div>div>
                                                                                                                                          )}
                                                                                                                      {user?.city && (
                                                                                                                          <div className="flex items-center gap-2">
                                                                                                                                                    <MapPin size={13} className="text-gray-400 shrink-0" />
                                                                                                                                                    <span>{user.city}{user.state ? ', ' + user.state : ''}</span>span>
                                                                                                                            </div>div>
                                                                                                                                          )}
                                                                                                                      {story.days_to_first_response != null && (
                                                                                                                          <div className="flex items-center gap-2">
                                                                                                                                                    <Clock size={13} className="text-gray-400 shrink-0" />
                                                                                                                                                    <span>{story.days_to_first_response === 0 ? 'Same-day response' : 'Response in ' + story.days_to_first_response + ' days'}</span>span>
                                                                                                                            </div>div>
                                                                                                                                          )}
                                                                                                                      {story.warranty_year && (
                                                                                                                          <div className="text-xs text-blue-500">Year {story.warranty_year} warranty claim</div>div>
                                                                                                                                          )}
                                                                                                                      </div>div>
                                                                                                                    <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                                                                                                                      {new Date(story.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                                                                                      </div>div>
                                                                                                  {(user?.community_name || user?.city) && (
                                                                                                                        <Link
                                                                                                                                                  href={`/community/${nameToSlug(user.community_name || user.city)}`}
                                                                                                                                                  className="mt-3 pt-2 flex items-center justify-end text-xs text-blue-500 hover:text-blue-700 font-medium"
                                                                                                                                                >
                                                                                                                                                View neighborhood →
                                                                                                                          </Link>Link>
                                                                                                                    )}
                                                                                                  </div>div>
                                                                                              )
                        })}
                      </div>div>
                                )}
                      </div>div>
              
                      <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
                                <h2 className="text-2xl font-bold mb-3">Have a warranty story?</h2>h2>
                                <p className="text-blue-100 mb-6">Join homeowners holding builders accountable.</p>p>
                                <Link href="/dashboard" className="inline-block bg-white text-blue-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50">
                                            Go to Dashboard
                                </Link>Link>
                      </div>div>
              </main>main>
        </div>div>
      )
}</></></div>
