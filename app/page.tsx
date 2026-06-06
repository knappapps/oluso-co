import Link from 'next/link'
import { Home, Shield, Clock, BarChart3, ChevronRight, Star, Building2, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Oluso — Track Your New Home Warranty Claims',
  description: 'File and track warranty claims, communicate with your builder, and see how other homeowners in your community are holding builders accountable. Free to use.',
  keywords: ['home warranty', 'builder warranty', 'new home defects', 'warranty claims', 'homebuilder accountability'],
  openGraph: {
    title: 'Oluso — Track Your New Home Warranty Claims',
    description: 'File warranty claims, track builder responses, and see real data from homeowners in your community.',
    url: 'https://oluso.co',
    siteName: 'Oluso',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oluso — Track Your New Home Warranty Claims',
    description: 'Free tool for new homeowners to document and track builder warranty claims.',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Home size={24} /> Oluso
        </div>
        <div className="flex items-center gap-3">
          <Link href="/builders" className="text-sm text-gray-500 hover:text-gray-700">Builders</Link>
          <Link href="/community" className="text-sm text-gray-500 hover:text-gray-700">Community</Link>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-700">Blog</Link>
          <Link href="/login" className="text-sm text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Sign in</Link>
          <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <Star size={12} /> Free to use · No credit card required
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Hold your homebuilder<br />
          <span className="text-blue-600">accountable.</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
          File warranty claims, track every builder response with timestamps, and build a documented paper trail.
          Because delays and ignored repairs shouldn't cost you tens of thousands of dollars.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
            Start tracking for free <ChevronRight size={16} />
          </Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 px-4 py-3">
            Already have an account →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield, color: 'text-blue-600 bg-blue-50',
              title: 'File & Track Claims',
              desc: 'Document every defect with photos, descriptions, and severity ratings. Your claims are timestamped and permanent.',
            },
            {
              icon: Clock, color: 'text-orange-500 bg-orange-50',
              title: 'Warranty Countdown',
              desc: 'Never miss a deadline. Get alerts at 30, 11-month, and 30-day-before-expiry milestones automatically.',
            },
            {
              icon: BarChart3, color: 'text-green-600 bg-green-50',
              title: 'Builder Accountability',
              desc: 'See how your builder compares on response times and resolution rates against real data from other homeowners.',
            },
          ].map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Social proof / community section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users size={20} className="text-blue-500" />
            <Building2 size={20} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your neighbors are already using Oluso</h2>
          <p className="text-gray-500 mb-6 max-w-xl mx-auto">See how builders in your area are performing, and share your experience anonymously with your community.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/builders" className="text-sm font-medium text-blue-600 hover:text-blue-700">View builder scores →</Link>
            <Link href="/community" className="text-sm font-medium text-blue-600 hover:text-blue-700">Community stories →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
