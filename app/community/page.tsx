// Item 7: Real Community Page — pulls live anonymized data from Supabase
// Replaces hardcoded stories with real opt-in claims + aggregate stats
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Users, MapPin, Clock, CheckCircle, AlertCircle, Building2, TrendingUp } from 'lucide-react'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

export const revalidate = 1800 // 30 min

export default async function CommunityPage() {
    // Fetch public opt-in stories
  const { data: rawStories } = await supabaseAdmin
      .from('claims')
      .select(`
            id, category, severity, status, created_at,
                  days_to_first_response, days_to_resolution,
                        defect_location, warranty_year,
                              users!inner(city, state, builder_name),
                                    builders(name)
                                        `)
      .eq('public_story', true)
      .order('created_at', { ascending: false })
      .limit(20)

  const stories = rawStories || []

      // Aggregate stats across ALL claims
      const { data: allClaims } = await supabaseAdmin
      .from('claims')
      .select('id, status, severity, days_to_first_response, builder_id')

  const claims = allClaims || []
      const totalClaims = claims.length
    const resolvedClaims = claims.filter(c => c.status === 'resolved' || c.status === 'closed').length
    const criticalClaims = claims.filter(c => c.severity === 'critical').length

  const responseTimes = claims
      .filter(c => c.days_to_first_response != null)
      .map(c => c.days_to_first_response as number)
    const avgResponseDays = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 10) / 10
          : null

  // Fetch top builders by claim volume
  const { data: builderScores } = await supabaseAdmin
      .from('builder_scores')
      .select('name, total_claims, resolve_rate_pct, avg_days_to_first_response, accountability_score')
      .gt('total_claims', 0)
      .order('total_claims', { ascending: false })
      .limit(5)

  return (
        <div className="min-h-screen bg-gray-50">
          {/* Nav */}
              <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
                      <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                                <Building2 size={22} /> Oluso
                      </Link>Link>
                      <div className="flex items-center gap-3">
                                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800">Sign in</Link>Link>
                                <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium">Get started</Link>Link>
                      </div>div>
              </nav>nav>
        
              <main className="max-w-4xl mx-auto px-4 py-8">
                      <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-900">Community</h1>h1>
                                <p className="text-gray-500 text-sm mt-1">Real homeowner experiences and builder accountability data.</p>p>
                      </div>div>
              
                {/* Platform stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
          { label: 'Total Claims Filed', value: totalClaims.toString(), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          { label: 'Resolved', value: resolvedClaims.toString(), icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Critical Issues', value: criticalClaims.toString(), icon: AlertCircle, color: 'text-red-600 bg-red-50' },
          { label: 'Avg Builder Response', value: avgResponseDays != null ? avgResponseDays + 'd' : 'N/A', icon: Clock, color: 'text-orange-600 bg-orange-50' }
                    ].map(({ label, value, icon: Icon, color }) => (
                                  <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                                                                <Icon size={16} />
                                                </div>div>
                                                <p className="text-xl font-bold text-gray-900">{value}</p>p>
                                                <p className="text-xs text-gray-500 mt-0.5">{label}</p>p>
                                  </div>div>
                                ))}
                      </div>div>
              
                {/* Builder leaderboard */}
                {builderScores && builderScores.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                              <Building2 size={16} className="text-blue-600" /> Builder Accountability Scores
                                              <span className="text-xs text-gray-400 font-normal ml-1">(lower = more responsive)</span>span>
                                </h2>h2>
                                <div className="space-y-3">
                                  {builderScores.map((b, i) => (
                                      <div key={b.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                                        <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>span>
                                                        <div className="flex-1">
                                                                            <Link
                                                                                                    href={`/builders/${b.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                                                                                                    className="font-semibold text-gray-900 hover:text-blue-600 text-sm"
                                                                                                  >
                                                                              {b.name}
                                                                            </Link>Link>
                                                                            <p className="text-xs text-gray-500">{b.total_claims} claims · {b.resolve_rate_pct ?? 0}% resolved</p>p>
                                                        </div>div>
                                                        <div className={`text-lg font-bold ${
                                                            (b.accountability_score ?? 100) < 30 ? 'text-green-600' :
                                                            (b.accountability_score ?? 100) < 60 ? 'text-yellow-600' : 'text-red-600'
                                      }`}>
                                                          {b.accountability_score ?? '—'}
                                                        </div>div>
                                      </div>div>
                                    ))}
                                </div>div>
                    </div>div>
                      )}
              
                {/* Public stories */}
                {stories.length > 0 ? (
                    <div>
                                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                              <Users size={16} className="text-blue-600" /> Homeowner Stories
                                </h2>h2>
                                <div className="grid gap-4">
                                  {stories.map((s: any) => {
                                      const user = s.users
                                                        const builder = s.builders
                                                                          const isResolved = s.status === 'resolved' || s.status === 'closed'
                                                                            
                                                                                            return (
                                                                                                                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                                                                                                                    <div className="flex items-start justify-between">
                                                                                                                                                          <div className="flex items-center gap-3">
                                                                                                                                                                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                                                                                                                                                                            {user?.city ? user.city.charAt(0) : '?'}
                                                                                                                                                                                                          </div>div>
                                                                                                                                                                                  <div>
                                                                                                                                                                                                            <p className="font-semibold text-gray-900 text-sm">
                                                                                                                                                                                                                                        {user?.city}, {user?.state}
                                                                                                                                                                                                                                      </p>p>
                                                                                                                                                                                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                                                                                                                                                                                                        <MapPin size={11} /> {builder?.name || user?.builder_name || 'Unknown builder'}
                                                                                                                                                                                                                                      </p>p>
                                                                                                                                                                                                          </div>div>
                                                                                                                                                            </div>div>
                                                                                                                                                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                                                                                          isResolved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                                                                                  }`}>
                                                                                                                                                            {isResolved ? 'Resolved' : 'In progress'}
                                                                                                                                                            </span>span>
                                                                                                                                      </div>div>
                                                                                                                
                                                                                                                                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                                                                                                                                          <span className="font-medium capitalize">{s.category}</span>span>
                                                                                                                                      {s.defect_location && (
                                                                                                                                          <>
                                                                                                                                                                    <span className="text-gray-300">·</span>span>
                                                                                                                                                                    <span className="text-gray-500 capitalize">{s.defect_location.replace(/_/g, ' ')}</span>span>
                                                                                                                                            </>>
                                                                                                                                        )}
                                                                                                                                                          <span className="text-gray-300">·</span>span>
                                                                                                                                                          <span className={`font-medium ${
                                                                                                                                          s.severity === 'critical' ? 'text-red-500' :
                                                                                                                                          s.severity === 'high' ? 'text-orange-500' :
                                                                                                                                          'text-gray-500'
                                                                                                                  }`}>{s.severity} severity</span>span>
                                                                                                                                      {s.days_to_first_response != null && (
                                                                                                                                          <>
                                                                                                                                                                    <span className="text-gray-300">·</span>span>
                                                                                                                                                                    <span className={`font-medium ${(s.days_to_first_response as number) > 14 ? 'text-red-500' : 'text-green-600'}`}>
                                                                                                                                                                      {s.days_to_first_response}d to respond
                                                                                                                                                                      </span>span>
                                                                                                                                            </>>
                                                                                                                                        )}
                                                                                                                                      {s.days_to_resolution != null && (
                                                                                                                                          <>
                                                                                                                                                                    <span className="text-gray-300">·</span>span>
                                                                                                                                                                    <span className="text-gray-500">{s.days_to_resolution}d to resolve</span>span>
                                                                                                                                            </>>
                                                                                                                                        )}
                                                                                                                                      </div>div>
                                                                                                                  </div>div>
                                                                                                              )
                                  })}
                                </div>div>
                    </div>div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                                <Users size={32} className="mx-auto text-gray-300 mb-3" />
                                <h3 className="font-bold text-gray-900 mb-2">Be the first to share your story</h3>h3>
                                <p className="text-sm text-gray-500 mb-4">
                                              Your experience helps other homeowners and creates accountability for builders.
                                </p>p>
                                <Link href="/signup" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                                              File your first claim
                                </Link>Link>
                    </div>div>
                      )}
              
                {/* Opt-in CTA */}
                      <div className="mt-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-center">
                                <h3 className="font-bold text-white mb-1">Share your story publicly</h3>h3>
                                <p className="text-blue-100 text-sm mb-4">
                                            When filing claims, opt in to share anonymized data. Your experience helps others and creates builder accountability.
                                </p>p>
                                <Link href="/signup" className="inline-block bg-white text-blue-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50">
                                            Start tracking for free
                                </Link>Link>
                      </div>div>
              </main>main>
        </div>div>
      )
}</></></></div>
