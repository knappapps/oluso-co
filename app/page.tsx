import Link from 'next/link'
import Header from '@/components/Header'
import { Shield, Zap, Users, CheckCircle, Star, Lock, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="Home" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-100 to-gray-200 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            Protect your warranty. Move your builder.
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-navy-600 mb-6 leading-tight">
            Track home warranty claims<br />with clarity and leverage.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Oluso Home helps new homeowners organize issues, automate follow-ups to builder reps, and coordinate with neighbors so important fixes don't slip through the cracks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/dashboard" className="btn-amber text-base">Get started free</Link>
            <Link href="/dashboard" className="border-2 border-navy-600 text-navy-600 hover:bg-navy-600 hover:text-white font-semibold px-6 py-3 rounded-full transition-colors text-base">Log in to your dashboard</Link>
          </div>
          <a href="#how" className="text-teal-600 font-medium hover:underline text-sm">Learn how Oluso works ↓</a>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 text-sm text-gray-600">
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" /> Built for warranty windows and punch lists</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-teal-500" /> Stronger together with community visibility</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-teal-600 py-8 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center text-white">
          {[{label:'Open claims',value:'6'},{label:'Overdue this week',value:'2'},{label:'Neighbors using Oluso',value:'24'}].map(s=>(
            <div key={s.label} className="bg-white/20 rounded-xl p-4">
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-teal-100 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="how" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-navy-600 mb-4">Stay on top of claims without chasing your builder.</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">From first photo to final sign-off, Oluso keeps everything organized, documented, and ready when you need leverage.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: 'ClaimGuard Documentation', color: 'text-teal-600', desc: 'Create structured warranty claims with photos, categories, and severity so your builder gets clear, professional documentation from day one.', bullets: ['Capture title, description, room, and due dates','Attach multiple photos for each issue','Track status from Draft to Resolved'] },
              { icon: Zap, title: 'Automated Follow-ups for You', color: 'text-amber-500', desc: "Stop setting calendar reminders. ClaimGuard sends polite, persistent follow-ups to your builder reps on a schedule you control.", bullets: ['SMS and email reminders to builder reps','Clear view of next scheduled outreach','Pause or resume automation anytime'] },
              { icon: Users, title: 'Community Leverage', color: 'text-teal-600', desc: 'Join or create your community to see anonymized patterns and shared issues. Approach your builder with facts, not guesses.', bullets: ['View common problems across your subdivision','Share selected claims with neighbors','Export summaries for group escalation'] },
            ].map(f=>(
              <div key={f.title} className="card">
                <f.icon className={`w-10 h-10 ${f.color} mb-4`} />
                <h3 className="font-bold text-navy-600 text-lg mb-3">{f.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{f.desc}</p>
                <ul className="space-y-1">{f.bullets.map(b=><li key={b} className="text-sm text-gray-500 flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />{b}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup CTA inline */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy-600 mb-3">Create your free Oluso Home account.</h2>
          <p className="text-gray-500 mb-6">Start with core claim tracking, basic automation, and community visibility. Upgrade later for AI-powered communications and premium escalation resources.</p>
          <ul className="text-sm text-gray-600 text-left inline-block mb-8 space-y-1">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" />Free plan includes unlimited claims for a single home</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" />Role defaults to homeowner with Free subscription</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" />Upgrade to unlock AI follow-ups and resource library</li>
          </ul>
          <h3 className="font-semibold text-navy-600 mb-4">Sign up in under a minute.</h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
            <div className="flex flex-col gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email address</label><input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="you@example.com" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <Link href="/dashboard" className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg text-center block hover:bg-amber-600 transition-colors">Create my free account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-teal-600 text-center mb-8">Homeowners turning stress into progress.</h2>
          <div className="card flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">🏠</div>
              <div className="text-center mt-2"><div className="font-bold text-navy-600">Alex</div><div className="text-sm text-teal-600">Willow Oaks, Austin</div></div>
            </div>
            <div>
              <p className="text-gray-700 mb-3">"We used ClaimGuard to track 14 issues and our builder fixed them before year one."</p>
              <div className="flex items-center gap-1 mb-3">{[1,2,3,4,5].map(i=><Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
              <div className="font-semibold text-teal-600 mb-2">Repairs completed 3x faster</div>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" />Evidence-backed timeline for every issue</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-teal-500" />Clear status view before warranty deadlines</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy-600 mb-3">Your home data, handled with care.</h2>
          <p className="text-teal-600 mb-10">You are trusting us with sensitive details about your home and community. We design Oluso Home to be private by default and transparent by design.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'You control what is shared', desc: 'Claims are private to your account unless you explicitly choose to share limited details with your community.' },
              { icon: Shield, title: 'Secure by design', desc: 'We separate claim content, contact details, and communities behind authenticated access. Email verification and role-based controls.' },
              { icon: FileText, title: 'Clear paper trails', desc: 'Every automated follow-up and AI-assisted draft is logged so you can see exactly what was sent, when, and through which channel.' },
            ].map(p=>(
              <div key={p.title} className="card text-left">
                <p.icon className="w-8 h-8 text-teal-600 mb-3" />
                <h3 className="font-bold text-navy-600 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored */}
      <section className="py-8 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs text-gray-400 mb-2">Sponsored partner</div>
          <div className="font-semibold text-navy-600 mb-1">Upgrade your home while you protect it.</div>
          <p className="text-sm text-teal-600">Exclusive offers from trusted home improvement partners appear here for Free plan users. Premium members see fewer ads.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-teal-600 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-3">Ready to feel in control of your builder warranty?</h2>
        <p className="text-teal-100 mb-8 max-w-xl mx-auto">Join other homeowners using Oluso to document issues, automate follow-ups, and show builders that your neighborhood is paying attention.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full transition-colors">Create my free account</Link>
          <Link href="/dashboard" className="border-2 border-white text-white hover:bg-white hover:text-teal-600 font-semibold px-8 py-3 rounded-full transition-colors">Preview the dashboard</Link>
        </div>
      </section>

      <footer className="bg-navy-600 text-white py-8 px-4 text-center">
        <div className="text-sm text-gray-300">© 2026 Oluso Home. Built for new-home owners who deserve a calmer warranty experience.</div>
      </footer>
    </div>
  )
}