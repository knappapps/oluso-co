import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import BuilderDashboardClient from './BuilderDashboardClient'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const dynamic = 'force-dynamic'

export default async function BuilderDashboardPage() {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('id, role, email, name, builder_name')
    .eq('auth_id', user.id)
    .single()

  if (!userRow || userRow.role !== 'builder') {
    redirect('/dashboard')
  }

  const { data: claims } = await supabaseAdmin
    .from('claims')
    .select('id, title, category, severity, status, created_at, days_to_first_response, resolved_at, defect_location')
    .eq('builder_name', userRow.builder_name)
    .order('created_at', { ascending: false })

  const { data: scoreRow } = await supabaseAdmin
    .from('builder_scores')
    .select('accountability_score, total_claims, resolve_rate_pct, avg_days_to_first_response, avg_days_to_resolution')
    .eq('name', userRow.builder_name)
    .single()

  return (
    <BuilderDashboardClient
      builderName={userRow.builder_name || ''}
      claims={claims || []}
      score={scoreRow || null}
    />
  )
}
