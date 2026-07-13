import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import CommunityClient from './CommunityClient'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Community Warranty Stories | Oluso',
  description: 'Real, anonymized warranty experiences from Utah homeowners. See how builders handle claims and compare builder accountability scores.',
  openGraph: {
    title: 'Community Warranty Stories | Oluso',
    description: 'Real warranty experiences from Utah homeowners. No names, just facts.',
    url: 'https://oluso.co/community',
    siteName: 'Oluso',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Community Warranty Stories | Oluso' },
}

const PAGE_SIZE = 20

interface PageProps {
  searchParams?: { page?: string }
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt((searchParams && searchParams.page) || '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Paginated stories
  const { data: rawStories, count: totalCount } = await supabaseAdmin
    .from('claims')
    .select('id, category, severity, status, created_at, days_to_first_response, defect_location, warranty_year, users!inner(city, state, builder_name, community_name), builders(name)', { count: 'exact' })
    .eq('public_story', true)
    .in('status', ['resolved', 'closed', 'in_progress', 'awaiting_builder'])
    .order('created_at', { ascending: false })
    .range(from, to)

  // Stats row (all public claims, not paginated)
  const { data: statsRow } = await supabaseAdmin
    .from('claims')
    .select('id, days_to_first_response, status')
    .eq('public_story', true)

  const { data: builderScores } = await supabaseAdmin
    .from('builder_scores')
    .select('name, total_claims, resolve_rate_pct, avg_days_to_first_response, accountability_score')
    .gt('total_claims', 0)
    .order('total_claims', { ascending: false })
    .limit(5)

  return (
    <CommunityClient
      rawStories={rawStories || []}
      statsRow={statsRow || []}
      builderScores={builderScores || []}
      totalCount={totalCount || 0}
      currentPage={page}
      pageSize={PAGE_SIZE}
    />
  )
}
