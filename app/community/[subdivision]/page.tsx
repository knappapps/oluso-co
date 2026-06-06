import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Building2, MapPin, Clock, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const revalidate = 1800

// Converts slug back to display name: 'ivory-cove' => 'Ivory Cove'
function slugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export async function generateMetadata(
  { params }: { params: { subdivision: string } }
): Promise<Metadata> {
  const name = slugToName(params.subdivision)
  return {
    title: `${name} Warranty Claims | Oluso Community`,
    description: `See real warranty claim data from homeowners in ${name}. Response times, resolution rates, and builder accountability from your neighbors.`,
    openGraph: {
      title: `${name} Warranty Claims | Oluso`,
      description: `Real warranty data from ${name} homeowners.`,
      url: `https://oluso.co/community/${params.subdivision}`,
      siteName: 'Oluso',
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function SubdivisionPage({ params }: { params: { subdivision: string } }) {
  const subdivisionName = slugToName(params.subdivision)

  // Fetch public stories from this community/subdivision
  const { data: stories } = await supabaseAdmin
    .from('claims')
    .select('id, category, severity, status, created_at, days_to_first_response, defect_location, warranty_year, users!inner(community_name, city, state, builder_name)')
    .eq('public_story', true)
    .ilike('users.community_name', subdivisionName)
    .order('created_at', { ascending: false })
    .limit(30)

  // Fetch aggregate stats
  const { data: allStories } = await supabaseAdmin
    .from('claims')
    .select('id, status, days_to_first_response, category, users!inner(community_name, builder_name)')
    .eq('public_story', true)
    .ilike('users.community_name', subdivisionName)

  const stats = allStories || []
  const totalClaims = stats.length
  const resolved = stats.filter((s: any) => ['resolved', 'closed'].includes(s.status)).length
  const respStats = stats.filter((s: any) => s.days_to_first_response != null)
  const avgResponse = respStats.length
    ? respStats.reduce((a: number, b: any) => a + (b.days_to_first_response || 0), 0) / respStats.length
    : 0

  // Builder name from first story
  const builderName = stats.length > 0 ? (stats[0] as any).users?.builder_name : null

  // Category breakdown
  const catCounts: Record<string, number> = {}
  stats.forEach((s: any) => { catCounts[s.category] = (catCounts[s.category] || 0) + 1 })
  const topCategories = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Building2 size={22} /> Oluso
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/community" className="text-sm text-gray-600 hover:text-gray-800">All communities</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800">Sign in</Link>
          <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium">Get started</Link>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/community" className="text-sm text-blue-600 hover:text-blue-700 mb-3 inline-block">
            ← All communities
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <MapPin size={24} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">{subdivisionName}</h1>
          </div>
          {builderName && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Building2 size={14} />
              <span>Built by {builderName}</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Shared Stories', value: totalClaims, icon: <Users size={18} /> },
            { label: 'Resolved', value: resolved, icon: <CheckCircle size={18} /> },
            { label: 'Avg Response', value: avgResponse > 0 ? avgResponse.toFixed(1) + 'd' : 'N/A', icon: <Clock size={18} /> },
            { label: 'Resolution Rate', value: totalClaims > 0 ? Math.round((resolved / totalClaims) * 100) + '%' : 'N/A', icon: <TrendingUp size={18} /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="flex justify-center text-blue-500 mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        {topCategories.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Common Issues</h2>
            <div className="flex flex-wrap gap-2">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  <span className="capitalize">{cat}</span>
                  <span className="bg-blue-200 text-blue-800 rounded-full px-1.5 py-0.5 text-xs">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Warranty Stories from {subdivisionName}</h2>
          {!stories || stories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No stories yet from this community</p>
              <p className="text-gray-400 text-sm mt-1">Be the first neighbor to share a warranty experience.</p>
              <Link href="/signup" className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">Join and share</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {stories.map((story: any) => (
                <div key={story.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded capitalize">
                      {story.category}{story.defect_location ? ' / ' + story.defect_location : ''}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${['resolved','closed'].includes(story.status) ? 'bg-green-100 text-green-700' : story.status === 'awaiting_builder' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {story.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    {story.days_to_first_response != null && (
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-gray-400 shrink-0" />
                        <span>{story.days_to_first_response === 0 ? 'Same-day response' : `Response in ${story.days_to_first_response} days`}</span>
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
              ))}
            </div>
          )}
        </div>
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Live in {subdivisionName}?</h2>
          <p className="text-blue-100 mb-6">Join your neighbors tracking warranty claims and holding builders accountable.</p>
          <Link href="/signup" className="inline-block bg-white text-blue-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50">Start tracking for free</Link>
        </div>
      </main>
    </div>
  )
}
