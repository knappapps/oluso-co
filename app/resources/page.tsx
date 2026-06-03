'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import { Search, Lock, Crown, MapPin, Lightbulb, CreditCard, X } from 'lucide-react'

const RESOURCES = [
  { title:"First-Time Buyer's Warranty Guide", type:'Guide', location:'Texas', phase:'Before filing claims', premium:false },
  { title:'Builder Escalation Email Templates', type:'Template', location:'National', phase:'During warranty', premium:false },
  { title:'Foundation Crack Assessment Checklist', type:'Checklist', location:'Texas', phase:'Structural issues', premium:true },
  { title:'AI Follow-up Draft Generator', type:'AI Tool', location:'National', phase:'All stages', premium:true },
  { title:'Executive Contact Directory — Austin Builders', type:'Directory', location:'Austin, TX', phase:'Escalation', premium:true },
  { title:'Punch List Best Practices', type:'Guide', location:'National', phase:'Move-in', premium:false },
]

export default function Resources() {
  const [search, setSearch] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const filtered = RESOURCES.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="Resources" />

      {/* Hero */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-400 py-12 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Resources & Billing</h1>
          <p className="text-teal-100">Guides, templates, and tools to strengthen your warranty claims.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Premium notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Crown className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <div className="font-semibold text-amber-700 text-sm">Unlock the full library with Premium</div>
            <div className="text-xs text-amber-600">Get AI tools, executive contacts, and all state-specific guides.</div>
          </div>
          <button onClick={() => setShowUpgrade(true)} className="ml-auto bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-600 flex-shrink-0">Upgrade</button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search resources..." className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        {/* Resource grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((r,i) => (
            <div key={i} className={`card ${r.premium ? 'opacity-75' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-teal-100 text-teal-700 font-medium px-2 py-0.5 rounded-full">{r.type}</span>
                    {r.premium && <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1"><Crown className="w-3 h-3" />Premium</span>}
                  </div>
                  <h3 className="font-semibold text-navy-600">{r.title}</h3>
                </div>
                {r.premium ? <Lock className="w-5 h-5 text-gray-300 flex-shrink-0" /> : null}
              </div>
              <div className="flex gap-3 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location}</span>
                <span className="flex items-center gap-1"><Lightbulb className="w-3 h-3" />{r.phase}</span>
              </div>
              {r.premium
                ? <button onClick={() => setShowUpgrade(true)} className="w-full border border-amber-200 text-amber-600 text-sm py-2 rounded-lg hover:bg-amber-50">Upgrade to Access</button>
                : <button className="w-full bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700">View Resource</button>
              }
            </div>
          ))}
        </div>

        {/* Billing */}
        <div className="card">
          <h2 className="font-bold text-navy-600 text-lg mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-teal-600" /> Billing & Plan</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Current Plan</div>
              <div className="text-2xl font-bold text-navy-600 mb-1">Free</div>
              <div className="text-xs text-gray-400 mb-4">Renews Jan 1, 2025</div>
              <div className="space-y-2">
                <button onClick={() => setShowUpgrade(true)} className="btn-amber text-sm py-2 px-4 w-full">Upgrade to Premium</button>
                <button className="border border-gray-200 text-gray-600 text-sm py-2 px-4 rounded-lg w-full hover:bg-gray-50">Change Plan</button>
                <button onClick={() => setShowCancel(true)} className="text-red-500 text-sm underline w-full text-center">Cancel Subscription</button>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-3">Premium includes:</div>
              <ul className="space-y-2 text-sm text-gray-600">
                {['AI-powered follow-up generation','Builder executive contact directory','All state-specific resource guides','Remove sponsored ads','Priority support'].map(f=>(
                  <li key={f} className="flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" />{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUpgrade(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h2 className="text-xl font-bold text-navy-600 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" /> Upgrade to Premium</h2><button onClick={() => setShowUpgrade(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <p className="text-gray-500 text-sm mb-6">Get AI-powered communications, premium escalation resources, and remove ads.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[{plan:'Monthly',price:'$9.99/mo'},{plan:'Annual',price:'$79/yr'}].map(p=>(
                <div key={p.plan} className="border border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-teal-500">
                  <div className="font-semibold text-navy-600">{p.plan}</div>
                  <div className="text-amber-500 font-bold">{p.price}</div>
                </div>
              ))}
            </div>
            <button className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg hover:bg-amber-600">Continue to Checkout</button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCancel(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-navy-600 mb-3">Cancel Subscription?</h2>
            <p className="text-gray-500 text-sm mb-6">You'll lose access to Premium features at the end of your billing period. Your claims and data will remain intact.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg hover:bg-gray-50">Keep Premium</button>
              <button onClick={() => setShowCancel(false)} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}