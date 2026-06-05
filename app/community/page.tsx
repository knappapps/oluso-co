import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Users, MapPin, Clock, CheckCircle, AlertCircle, Building2, TrendingUp } from 'lucide-react'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const revalidate = 1800

export default async function CommunityPage() {
  const { data: rawStories } = await supabaseAdmin
    .from('claims')
    .select('id, category, severity, status, created_at, days_to_first_response, defect_location, warranty_year, users!inner(city, state, builder_name), builders(name)')
    .eq('public_story', true)
    .in('status', ['resolved', 'closed', 'in_progress', 'awaiting_builder'])
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: statsRow } = await supabaseAdmin
    .from('claims')
    .select('id, days_to_first_response, status')
    .eq('public_story', true)

  const stats = statsRow || []
  const totalClaims = stats.length
  const resolved = stats.filter((s: any) => ['resolved', 'closed'].includes(s.status)).length
  const respStats = stats.filter((s: any) => s.days_to_first_response)
  const avgResponse = respStats.length
    ? respStats.reduce((a: number, b: any) => a + b.days_to_first_response, 0) / respStats.length
    : 0

  const { data: builderScores } = await supabaseAdmin
    .from('builder_scores')
    .select('name, total_claims, resolve_rate_pct, avg_days_to_first_response, accountability_score')
    .gt('total_claims', 0)
    .order('total_claims', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Building2 size={22} /> Oluso
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium">
            Get started
          </Link>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Community Warranty Stories</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Real warranty experiences. No names. No addresses. Just the facts.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Stories Shared', value: totalClaims, icon: <Users size={18} /> },
            { label: 'Issues Resolved', value: resolved, icon: <CheckCircle size={18} /> },
            { label: 'Avg Response (days)', value: avgResponse.toFixed(1), icon: <Clock size={18} /> },
            { label: 'Resolution Rate', value: totalClaims > 0 ? Math.round((resolved / totalClaims) * 100) + '%' : 'N/A', icon: <TrendingUp size={18} /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="flex justify-center text-blue-500 mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        {builderScores && builderScores.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-500" /> Builder Accountability Scores
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Builder</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Claims</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Resolved %</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Avg Resp</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {builderScores.map((b: any) => (
                    <tr key={b.name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 font-medium text-gray-900">{b.name}</td>
                      <td className="py-2 text-right text-gray-600">{b.total_claims}</td>
                      <td className="py-2 text-right">
                        <span className={b.resolve_rate_pct >= 70 ? 'text-green-600' : b.resolve_rate_pct >= 40 ? 'text-yellow-600' : 'text-red-600'}>
                          {b.resolve_rate_pct?.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2 text-right text-gray-600">{b.avg_days_to_first_response?.toFixed(1)}d</td>
                      <td className="py-2 text-right font-bold">
                        <span className={b.accountability_score >= 70 ? 'text-green-600' : b.accountability_score >= 40 ? 'text-yellow-600' : 'text-red-600'}>
                          {b.accountability_score?.toFixed(0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Stories</h2>
          {!rawStories || rawStories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No stories yet. Be the first!</p>
              <Link href="/signup" className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                Join and share
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {rawStories.map((story: any) => {
                const user = story.users as any
                const builder = story.builders as any
                return (
                  <div key={story.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded capitalize">
                        {story.category}{story.defect_location ? ' / ' + story.defect_location : ''}
                      </span>
                      <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (['resolved','closed'].includes(story.status) ? 'bg-green-100 text-green-700' : story.status === 'awaiting_builder' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700')}>
                        {story.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      {builder?.name && (
                        <div className="flex items-center gap-2">
                          <Building2 size={13} className="text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-800">{builder.name}</span>
                        </div>
                      )}
                      {user?.city && (
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-gray-400 shrink-0" />
                          <span>{user.city}{user.state ? ', ' + user.state : ''}</span>
                        </div>
                      )}
                      {story.days_to_first_response != null && (
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-gray-400 shrink-0" />
                          <span>{story.days_to_first_response === 0 ? 'Same-day response' : 'Response in ' + story.days_to_first_response + ' days'}</span>
                        </div>
                      )}
                      {story.warranty_year && (
                        <div className="text-xs text-blue-500">Year {story.warranty_year} warranty claim</div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                      {new Date(story.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Have a warranty story?</h2>
          <p className="text-blue-100 mb-6">Join homeowners holding builders accountable.</p>
          <Link href="/signup" className="inline-block bg-white text-blue-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50">
            Create free account
          </Link>
        </div>
      </main>
    </div>
  )
}
