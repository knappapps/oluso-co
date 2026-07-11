import Link from 'next/link'
import Header from '@/components/Header'
import { Building2, ChevronRight } from 'lucide-react'
import { getAllHomebuildersSortedByRank } from '@/lib/homebuilders-data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Top 50 U.S. Homebuilders | Oluso',
  description: 'Browse company profiles for the top 50 U.S. homebuilders by 2024 closings, including ownership, leadership, and official social channels.',
  openGraph: {
    title: 'Top 50 U.S. Homebuilders | Oluso',
    description: 'Company profiles for the top 50 U.S. homebuilders.',
    url: 'https://oluso.co/homebuilders',
    siteName: 'Oluso',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Top 50 U.S. Homebuilders | Oluso' },
}

export default function HomebuildersIndexPage() {
  const builders = getAllHomebuildersSortedByRank()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Top 50 U.S. Homebuilders</h1>
          <p className="text-gray-500 max-w-2xl">Company profiles ranked by 2024 closings, with ownership, leadership, and official social channels for each builder.</p>
        </div>
        <div className="space-y-3">
          {builders.map(b => (
            <Link key={b.slug} href={`/homebuilders/${b.slug}`} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-blue-200 transition-shadow">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-mono w-8">#{b.rank}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 size={14} className="text-blue-500" /> {b.company}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{b.hq} - {b.ownership}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400">{b.closings2024} closings</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
