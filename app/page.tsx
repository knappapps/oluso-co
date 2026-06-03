import Link from 'next/link'
import { Home, Shield, Clock, BarChart3, ChevronRight, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Home size={24} /> Oluso
        </div>
        <div className="flex items-center gap-3">
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
              desc: 'Document every defect with photos, descriptions, and severity ratings. Your claims are timestamped and permanent.'
            },
            {
              icon: Clock, color: 'text-orange-600 bg-orange-50',
              title: 'Email Threading',
              desc: 'Every claim gets a unique email address. Send to your builder and their replies are automatically captured and stored.'
            },
            {
              icon: BarChart3, color: 'text-purple-600 bg-purple-50',
              title: 'Builder Accountability',
              desc: 'We track response times, resolution rates, and patterns across builders — creating the data record that creates leverage.'
            }
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Your warranty clock is ticking.</h2>
          <p className="text-blue-100 mb-6 text-sm">Most builder warranties are 1-year structural. Don't let delays run out your clock.</p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm">
            Create your free account <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © 2026 Oluso.co · <Link href="/blog" className="hover:text-gray-600">Blog</Link>
      </footer>
    </div>
  )
}