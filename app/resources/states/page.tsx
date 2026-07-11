import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { ArrowLeft, MapPin } from 'lucide-react'
import { stateResources } from '@/lib/state-resources'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Warranty Resources by State | Oluso',
  description: 'State-specific home warranty law and licensing board contacts for all 50 states.',
  openGraph: {
    title: 'Browse Warranty Resources by State | Oluso',
    description: 'State-specific warranty law and licensing board contacts.',
    url: 'https://oluso.co/resources/states',
    siteName: 'Oluso',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Browse Warranty Resources by State | Oluso' },
}

export default function ResourcesByStatePage() {
  return (
    <AuthGuard>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/resources" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
            <ArrowLeft size={14} /> All resources
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" /> Browse by State
            </h1>
            <p className="text-gray-500 text-sm mt-1">State-specific warranty law and licensing board contacts</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stateResources.map(state => (
                <Link key={state.slug} href={`/resources/${state.slug}`} className="text-sm text-gray-700 hover:text-blue-600 hover:underline px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  {state.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  )
}
