import Link from 'next/link'
import Header from '@/components/Header'
import { Building2, MessageSquare, PhoneCall, TrendingUp, LayoutList } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Builders | Oluso',
  description: 'Your company already has a public profile on Oluso. Register your interest to claim it and help shape how you show up to new homeowners.',
  alternates: { canonical: '/for-builders' },
  openGraph: {
    title: 'For Builders | Oluso',
    description: 'Register your interest to claim your builder profile on Oluso.',
    url: 'https://oluso.co/for-builders',
    siteName: 'Oluso',
    type: 'website',
  },
}

export default function ForBuildersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header publicNav />
      <main>
        <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-3">For homebuilders</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Your buyers are already talking about you. Soon you can claim your profile and join the conversation.
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Oluso hosts public profiles for the top U.S. homebuilders, with company details, leadership, and official channels. We are building a way for builders to claim their profile and add their own side. Register your interest and we will reach out as claiming opens up.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/builderscontact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
              Register your interest
            </Link>
            <Link href="/homebuilders" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition">
              See your current profile
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-400">No cost, no commitment.</p>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">What claiming will let you do</h2>
          <p className="text-center text-gray-500 text-sm mb-10">These features are on our roadmap. Register now to be first in line.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <MessageSquare className="text-blue-600 mb-3" size={24} />
              <h3 className="font-semibold text-gray-900 mb-2">Add your side</h3>
              <p className="text-gray-600 text-sm">Respond to claims and add context on your profile, so prospective buyers see how you handle issues, not just the complaint. (Coming soon.)</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <PhoneCall className="text-blue-600 mb-3" size={24} />
              <h3 className="font-semibold text-gray-900 mb-2">Keep your info accurate</h3>
              <p className="text-gray-600 text-sm">Make sure your leadership, contacts, and official channels are correct so homeowners reach the right team. (Coming soon.)</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <TrendingUp className="text-blue-600 mb-3" size={24} />
              <h3 className="font-semibold text-gray-900 mb-2">Show responsiveness</h3>
              <p className="text-gray-600 text-sm">Builders who engage and resolve issues will be able to reflect that on their profile. (Coming soon.)</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <LayoutList className="text-blue-600 mb-3" size={24} />
              <h3 className="font-semibold text-gray-900 mb-2">One organized view</h3>
              <p className="text-gray-600 text-sm">See the warranty issues homeowners are documenting about your communities, all in one place. (Coming soon.)</p>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why register early</h2>
            <p className="text-gray-700">
              Oluso exists because new homeowners want a clear, documented way to resolve warranty issues. That is better for you too: an organized claim with photos and dates is easier to act on than an angry post in a neighborhood Facebook group. Registering now means you are first to claim your profile and shape how you show up when the feature launches.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 pt-8 pb-20 text-center">
          <Building2 className="mx-auto text-blue-600 mb-4" size={32} />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Want first access?</h2>
          <p className="text-gray-600 mb-6">Register your interest and we will reach out as claiming opens up.</p>
          <Link href="/builderscontact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
            Register your interest
          </Link>
        </section>
      </main>
    </div>
  )
}
