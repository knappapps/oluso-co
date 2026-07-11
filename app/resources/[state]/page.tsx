import { notFound } from 'next/navigation'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { ExternalLink, Phone, Scale, ArrowLeft } from 'lucide-react'
import { getStateBySlug, getAllStateSlugs } from '@/lib/state-resources'
import ResourceDownloadItem from '@/components/ResourceDownloadItem'
import type { Metadata } from 'next'

export async function generateStaticParams() {
return getAllStateSlugs().map(state => ({ state }))
}

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
const stateData = getStateBySlug(params.state)
if (!stateData) return { title: 'Not Found' }
return {
title: `${stateData.name} New Home Warranty Resources | Oluso`,
description: `Resources for ${stateData.name} new homeowners — ${stateData.name} warranty law, consumer protection contacts, legal help, and tools to document and escalate builder warranty claims.`,
openGraph: {
title: `${stateData.name} New Home Warranty Resources | Oluso`,
description: `Warranty resources and guides for ${stateData.name} new homeowners.`,
url: `https://oluso.co/resources/${stateData.slug}`,
siteName: 'Oluso',
type: 'website',
},
twitter: { card: 'summary_large_image', title: `${stateData.name} New Home Warranty Resources | Oluso` },
}
}

export default function StateResourcesPage({ params }: { params: { state: string } }) {
const stateData = getStateBySlug(params.state)
if (!stateData) notFound()

const sections = [
{ category: 'Legal', icon: Scale, items: stateData.legal },
{ category: 'Expert Contacts', icon: Phone, items: stateData.contacts },
]

return (
<AuthGuard>
<Header />
<main className="min-h-screen bg-gray-50 pt-16">
<div className="max-w-4xl mx-auto px-4 py-8">
<Link href="/resources" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
<ArrowLeft size={14} /> All resources
</Link>
<div className="mb-8">
<h1 className="text-2xl font-bold text-gray-900">{stateData.name} Resources</h1>
<p className="text-gray-500 text-sm mt-1">Tools, templates, and contacts for navigating warranty disputes in {stateData.name}</p>
</div>
<div className="space-y-6">
{sections.map(({ category, icon: Icon, items }) => (
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
</div>
</div>
</main>
</AuthGuard>
)
}
