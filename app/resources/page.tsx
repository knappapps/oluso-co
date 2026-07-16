import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import Link from 'next/link'
import { ExternalLink, Phone, Scale, MapPin, Building2, ChevronRight, Newspaper } from 'lucide-react'
import ResourceDownloadItem from '@/components/ResourceDownloadItem'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

const resources = [
  {
    category: 'Legal',
    icon: Scale,
    items: [
      { title: 'NAHB Consumer Resources', desc: 'National homebuilder consumer guidance and dispute resources', url: 'https://www.nahb.org/other/consumer-resources', type: 'link' },
      { title: 'Sample Demand Letter Template', desc: 'Template for formal written demands', url: '/documents/sample-demand-letter-template.txt', type: 'download' },
    ]
  },
  {
    category: 'Expert Contacts',
    icon: Phone,
    items: [
      { title: 'Better Business Bureau', desc: 'File builder complaints publicly', url: 'https://www.bbb.org', type: 'link' },
    ]
  },
]

export const metadata: Metadata = {
  title: 'New Home Warranty Resources | Oluso',
  description: 'Resources for new homeowners in all 50 states — state warranty law, consumer protection contacts, legal help, and tools to document and escalate builder warranty claims.',
  openGraph: {
    title: 'New Home Warranty Resources | Oluso',
    description: 'Warranty resources and guides for new homeowners in every state.',
    url: 'https://oluso.co/resources',
    siteName: 'Oluso',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'New Home Warranty Resources | Oluso' },
}



const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
  )

type NewsItem = {
  id: string
  source: string
  title: string
  url: string
  published_at: string | null
}


export default async function ResourcesPage() {
  const { data: newsData } = await supabaseAdmin
  .from('industry_news')
  .select('id, source, title, url, published_at')
  .order('published_at', { ascending: false })
  .limit(6)

const news = (newsData || []) as NewsItem[]

return (
  <AuthGuard>
  <Header />
  <main className="min-h-screen bg-gray-50 pt-16">
  <div className="max-w-5xl mx-auto px-4 py-8">
  <div className="mb-8">
  <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
  <p className="text-gray-500 text-sm mt-1">Tools, templates, and contacts for navigating warranty disputes</p>
  </div>
  <div className="grid lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 space-y-6">
{resources.map(({ category, icon: Icon, items }) => (
<div key={category} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
<h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
<Icon size={16} className="text-blue-600" /> {category}
</h2>
<div className="space-y-3">
{items.map(item => (
item.type === 'link' && item.url ? (
<a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
<div>
<p className="text-sm font-medium text-gray-800">{item.title}</p>
<p className="text-xs text-gray-500">{item.desc}</p>
</div>
<ExternalLink size={14} className="text-gray-400" />
</a>
) : item.type === 'download' && item.url ? (
<ResourceDownloadItem key={item.title} title={item.title} desc={item.desc} url={item.url} />
) : (
<div key={item.title} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
<div>
<p className="text-sm font-medium text-gray-800">{item.title}</p>
<p className="text-xs text-gray-500">{item.desc}</p>
</div>
</div>
)
))}
</div>
</div>
))}

<div className="grid sm:grid-cols-2 gap-4">
<Link href="/resources/states" className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-shadow">
<div className="flex items-center gap-3">
<MapPin size={18} className="text-blue-600" />
<div>
<p className="font-semibold text-gray-900">Browse by State</p>
<p className="text-xs text-gray-500 mt-0.5">State-specific warranty law and licensing board contacts</p>
</div>
</div>
<ChevronRight size={16} className="text-gray-300" />
</Link>
<Link href="/homebuilders" className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-shadow">
<div className="flex items-center gap-3">
<Building2 size={18} className="text-blue-600" />
<div>
<p className="font-semibold text-gray-900">Browse by Builder</p>
<p className="text-xs text-gray-500 mt-0.5">Profiles for the top 50 U.S. homebuilders</p>
</div>
</div>
<ChevronRight size={16} className="text-gray-300" />
</Link>
</div>
</div>

<aside className="space-y-4">
<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
<h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
<Newspaper size={16} className="text-blue-600" /> Latest Industry News
</h2>
<div className="space-y-4">
{news.length === 0 && (
<p className="text-xs text-gray-500">No news yet. Check back soon.</p>
)}
{news.map(item => (
<a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
<p className="text-xs uppercase tracking-wide text-gray-400">{item.source}</p>
<p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 mt-0.5">{item.title}</p>
{item.published_at && (
<p className="text-xs text-gray-400 mt-0.5">{new Date(item.published_at).toLocaleDateString()}</p>
)}
</a>
))}
</div>
<Link href="/news" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 mt-4 hover:underline">
View all industry news <ChevronRight size={12} />
</Link>
</div>
</aside>
</div>
</div>
</main>
</AuthGuard>
)
}
