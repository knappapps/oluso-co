'use client'

import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { Users, MapPin } from 'lucide-react'

const stories = [
  { name: 'Sarah M.', city: 'Lehi, UT', builder: 'Woodside Homes', issue: 'Foundation drainage', resolved: true, days: 23 },
  { name: 'James K.', city: 'Herriman, UT', builder: 'Ivory Homes', issue: 'HVAC undersized', resolved: false, days: 47 },
  { name: 'Maria L.', city: 'South Jordan, UT', builder: 'David Weekley', issue: 'Stucco cracking', resolved: true, days: 89 },
  { name: 'Tom R.', city: 'Draper, UT', builder: 'Toll Brothers', issue: 'Window leaks', resolved: true, days: 12 },
]

export default function CommunityPage() {
  return (
    <AuthGuard>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-500 text-sm mt-1">Real stories from homeowners navigating builder warranty claims</p>
          </div>
          <div className="grid gap-4">
            {stories.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">{s.name.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={11} /> {s.city}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.resolved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {s.resolved ? 'Resolved' : 'In progress'}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">{s.builder}</span>
                  <span className="text-gray-400">·</span>
                  <span>{s.issue}</span>
                  <span className="text-gray-400">·</span>
                  <span className={`${s.days > 30 ? 'text-red-500' : 'text-green-600'} font-medium`}>{s.days} days</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 text-center border border-blue-100">
            <Users size={32} className="mx-auto text-blue-500 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Share your story</h3>
            <p className="text-sm text-gray-500">Your experience helps other homeowners and creates accountability for builders.</p>
          </div>
        </div>
      </main>
    </AuthGuard>
  )
}