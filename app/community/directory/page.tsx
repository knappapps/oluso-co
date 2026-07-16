import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import { MapPin, ChevronLeft } from 'lucide-react'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
  )

function nameToSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Browse Communities by City | Oluso',
  description: 'Find warranty claim data and homeowner stories for neighborhoods and subdivisions across Utah, organized by city.',
  alternates: { canonical: 'https://oluso.co/community/directory' },
}

export default async function CommunityDirectoryPage() {
  const { data: claimRows } = await supabaseAdmin
  .from('claims')
  .select('users!inner(community_name, city, state)')
  .eq('public_story', true)

const seen = new Set<string>()
  const communities: { name: string, city: string, state: string | null }[] = []

    ;(claimRows || []).forEach((row: any) => {
    const name = row.users?.community_name
    const city = row.users?.city
    const state = row.users?.state
    if (typeof name === 'string' && name.length > 0 && typeof city === 'string' && city.length > 0) {
      const key = name.toLowerCase() + '|' + city.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        communities.push({ name, city, state: state || null })
      }
    }
  })

const byCity: Record<string, { name: string, state: string | null }[]> = {}
  communities.forEach(c => {
    if (!byCity[c.city]) byCity[c.city] = []
      byCity[c.city].push({ name: c.name, state: c.state })
  })

const cities = Object.keys(byCity).sort((a, b) => a.localeCompare(b))
  cities.forEach(city => {
    byCity[city].sort((a, b) => a.name.localeCompare(b.name))
  })

return (
  <div className="min-h-screen bg-gray-50">
  <Header />
  <main className="max-w-5xl mx-auto px-4 py-12 pt-24">
  
  <Link href="/community" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
  <ChevronLeft size={14} /> All community stories
  </Link>

    <div className="mb-10">
    <h1 className="text-3xl font-bold text-gray-900 mb-3">Browse Communities by City</h1>
      <p className="text-gray-500 max-w-xl">Find warranty claim data and homeowner stories for neighborhoods across Utah.</p>
    </div>
    {cities.length === 0 ? (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
    <p className="text-gray-500">No communities have shared stories yet.</p></div>
    ) : (
    <div className="space-y-10">
      {cities.map(city => (
      <div key={city}>
      <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} className="text-blue-500" /> {city}{byCity[city][0]?.state ? ', ' + byCity[city][0].state : ''}</h2>
      <div className="flex flex-wrap gap-2">
        {byCity[city].map(c => (
        <Link key={c.name} href={`/community/${nameToSlug(c.name)}`} className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 hover:border-blue-300 hover:text-blue-700">{c.name}</Link>
        ))}</div>
      </div>
        ))}
      
    </div>
    )}
  </main>
  </div>
  )
}
