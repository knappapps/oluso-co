import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { ArrowLeft, ExternalLink, Building2, Users, Share2 } from 'lucide-react'
import { getHomebuilderBySlug, getAllHomebuilderSlugs } from '@/lib/homebuilders-data'
import type { Metadata } from 'next'
import { NATIONAL_TO_UTAH_BUILDER_SLUG } from '@/lib/builder-crosslinks'

export async function generateStaticParams() {
  return getAllHomebuilderSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const builder = getHomebuilderBySlug(params.slug)
  if (!builder) return { title: 'Not Found' }
  return {
    title: `${builder.company} - Homebuilder Profile | Oluso`,
    description: `${builder.company} (HQ: ${builder.hq}) closed an estimated ${builder.closings2024} homes in 2024. See ownership, leadership, and social channels for ${builder.company} homebuyers.`,
    openGraph: {
      title: `${builder.company} - Homebuilder Profile | Oluso`,
      description: `Homebuyer resources and company info for ${builder.company}.`,
      url: `https://oluso.co/homebuilders/${builder.slug}`,
      siteName: 'Oluso',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${builder.company} - Homebuilder Profile | Oluso` },
  }
}

export default function HomebuilderProfilePage({ params }: { params: { slug: string } }) {
  const builder = getHomebuilderBySlug(params.slug)
  if (!builder) notFound()
  const utahSlug = NATIONAL_TO_UTAH_BUILDER_SLUG[builder.slug]

  const socialLinks = Object.entries(builder.social).filter(([, url]) => !!url) as [string, string][]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <Link href="/homebuilders" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft size={14} /> All homebuilders
        </Link>

        <div className="mb-8">
          <p className="text-sm text-blue-600 font-medium mb-1">Rank #{builder.rank}</p>
          <h1 className="text-3xl font-bold text-gray-900">{builder.company}</h1>
          <p className="text-gray-500 text-sm mt-1">{builder.hq} - {builder.ownership}</p>
        </div>
        {utahSlug && (
      <Link href={`/builders/${utahSlug}`} className="block bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-700 hover:bg-blue-100">
      See real Utah warranty claim data for {builder.company} →
      </Link>
      )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400">2024 Closings</p>
            <p className="text-lg font-bold text-gray-900">{builder.closings2024}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400">2024 Revenue ($M)</p>
            <p className="text-lg font-bold text-gray-900">{builder.revenue2024 ?? 'N/A'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400">Ticker</p>
            <p className="text-lg font-bold text-gray-900">{builder.ticker ?? 'Private'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400">Social Reach</p>
            <p className="text-lg font-bold text-gray-900">{builder.ownChannelReach}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" /> Company & Leadership Structure
          </h2>
          <p className="text-sm text-gray-600">{builder.orgChart}</p>
        </div>

        {builder.executives.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={16} className="text-blue-600" /> Leadership Team
            </h2>
            <div className="space-y-3">
              {builder.executives.map(exec => (
                <div key={exec.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{exec.name}</p>
                    <p className="text-xs text-gray-500">{exec.title}</p>
                  </div>
                  {exec.linkedin ? (
                    <a href={exec.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      LinkedIn <ExternalLink size={12} />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 size={16} className="text-blue-600" /> Official Social Channels
            </h2>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-xs capitalize px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50">
                  {platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
