import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Header from '@/components/Header'
import { Building2, TrendingUp, Clock, CheckCircle, ChevronRight, Star } from 'lucide-react'
import type { Metadata } from 'next'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Builder Accountability Scores | Oluso',
  description: 'See how Utah home builders handle warranty claims. Real data on response times, resolution rates, and accountability scores from homeowners like you.',
  openGraph: {
    title: 'Builder Accountability Scores | Oluso',
    description: 'Real warranty claim data for Utah home builders.',
    url: 'https://oluso.co/builders',
    siteName: 'Oluso',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Builder Accountability Scores | Oluso' },
}

const BUILDER_SLUGS: Record<string, string> = {
  'David Weekley Homes': 'david-weekley-homes',
  'Ivory Homes': 'ivory-homes',
  'Woodside Homes': 'woodside-homes',
  'Toll Brothers': 'toll-brothers',
  'Lennar Homes': 'lennar-homes',
  'KB Home': 'kb-home',
  'DR Horton': 'dr-horton',
  'Pulte Homes': 'pulte-homes',
  'Shea Homes': 'shea-homes',
  'Taylor Morrison': 'taylor-morrison',
  'Meritage Homes': 'meritage-homes',
  'Century Communities': 'century-communities',
}

export default async function BuildersPage() {
  const { data: builderScores } = await supabaseAdmin
    .from('builder_scores')
    .select('name, total_claims, resolve_rate_pct, avg_days_to_first_response, accountability_score')
    .order('total_claims', { ascending: false })

  const builders = builderScores || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Builder Accountability Scores</h1>
          <p className="text-gray-500 max-w-2xl">How well do Utah home builders handle warranty claims? These scores are calculated from real homeowner data.</p>
        </div>
        {builders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No builder data yet</p>
            <p className="text-gray-400 text-sm mt-1">Data will appear as homeowners file claims.</p>
            <Link href="/dashboard" className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">Join and share</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {builders.map((b: any, i: number) => {
              const slug = BUILDER_SLUGS[b.name]
              const score = b.accountability_score ?? 0
              const scoreColor = score >= 70 ? 'text-green-600 bg-green-50' : score >= 40 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
              return (
                <div key={b.name} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-400 font-mono w-6">#{i + 1}</span>
                        <h2 className="text-lg font-bold text-gray-900">{b.name}</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Star size={14} className="text-blue-400" />
                          <span>{b.total_claims ?? 0} claims</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-green-500" />
                          <span>{b.resolve_rate_pct != null ? b.resolve_rate_pct.toFixed(0) + '%' : 'N/A'} resolved</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock size={14} className="text-orange-400" />
                          <span>{b.avg_days_to_first_response != null ? b.avg_days_to_first_response.toFixed(1) + 'd' : 'N/A'} avg response</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={`text-2xl font-bold px-3 py-1.5 rounded-lg ${scoreColor}`}>
                        {score.toFixed(0)}
                      </div>
                      {slug ? (
                        <Link href={`/builders/${slug}`} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View scorecard <ChevronRight size={14} />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <TrendingUp size={36} className="mx-auto mb-3 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">Help hold builders accountable</h2>
          <p className="text-blue-100 mb-6">Join homeowners filing and tracking warranty claims.</p>
          <Link href="/dashboard" className="inline-block bg-white text-blue-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50">Go to Dashboard</Link>
        </div>
      </main>
    </div>
  )
}
