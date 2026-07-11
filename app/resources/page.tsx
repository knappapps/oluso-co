import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import Link from 'next/link'
import { ExternalLink, Phone, Scale, MapPin } from 'lucide-react'
import { stateResources } from '@/lib/state-resources'
import ResourceDownloadItem from '@/components/ResourceDownloadItem'
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

export default function ResourcesPage() {
return (
<AuthGuard>
<Header />
<main className="min-h-screen bg-gray-50 pt-16">
<div className="max-w-4xl mx-auto px-4 py-8">
<div className="mb-8">
<h1 className="text-2xl font-bold text-gray-900">Resources</h1>
<p className="text-gray-500 text-sm mt-1">Tools, templates, and contacts for navigating warranty disputes</p>
</div>

<div className="space-y-6">
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

<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
<h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
<MapPin size={16} className="text-blue-600" /> Browse by State
</h2>
<p className="text-xs text-gray-500 mb-4">State-specific warranty law and licensing board contacts</p>
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
{stateResources.map(state => (
<Link key={state.slug} href={`/resources/${state.slug}`} className="text-sm text-gray-700 hover:text-blue-600 hover:underline px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
{state.name}
</Link>
))}
</div>
</div>
</div>
</div>
</main>
</AuthGuard>
)
}
