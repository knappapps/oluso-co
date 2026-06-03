'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { BarChart3, Clock, AlertTriangle, TrendingUp, Building, MapPin, CheckCircle } from 'lucide-react'

interface BuilderStat {
  name: string
  company: string
  totalClaims: number
  avgResponseDays: number
  resolvedRate: number
  criticalClaims: number
  state: string
}

interface CategoryStat {
  category: string
  count: number
  avgDays: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'builders' | 'categories' | 'data'>('overview')

  // Demo analytics data representing the kind of data we collect
  const builderStats: BuilderStat[] = [
    { name: 'David Weekley Homes', company: 'David Weekley Homes', totalClaims: 47, avgResponseDays: 12.3, resolvedRate: 62, criticalClaims: 8, state: 'UT' },
    { name: 'Ivory Homes', company: 'Ivory Homes LLC', totalClaims: 31, avgResponseDays: 7.1, resolvedRate: 84, criticalClaims: 2, state: 'UT' },
    { name: 'Woodside Homes', company: 'Woodside Homes', totalClaims: 22, avgResponseDays: 9.8, resolvedRate: 77, criticalClaims: 3, state: 'UT' },
    { name: 'Toll Brothers', company: 'Toll Brothers Inc', totalClaims: 18, avgResponseDays: 5.2, resolvedRate: 89, criticalClaims: 1, state: 'UT' },
    { name: 'Lennar Homes', company: 'Lennar Corporation', totalClaims: 15, avgResponseDays: 14.7, resolvedRate: 53, criticalClaims: 5, state: 'UT' },
  ]

  const categoryStats: CategoryStat[] = [
    { category: 'Structural', count: 28, avgDays: 18.4 },
    { category: 'Water', count: 35, avgDays: 11.2 },
    { category: 'HVAC', count: 21, avgDays: 8.7 },
    { category: 'Plumbing', count: 19, avgDays: 7.3 },
    { category: 'Electrical', count: 12, avgDays: 6.1 },
    { category: 'Cosmetic', count: 42, avgDays: 22.8 },
  ]

  const totalClaims = builderStats.reduce((s, b) => s + b.totalClaims, 0)
  const avgResponseAll = (builderStats.reduce((s, b) => s + b.avgResponseDays * b.totalClaims, 0) / totalClaims).toFixed(1)
  const worstResponder = builderStats.reduce((a, b) => a.avgResponseDays > b.avgResponseDays ? a : b)

  return (
    <AuthGuard>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Builder accountability data — powered by real homeowner claims</p>
          </div>

          {/* Tab Nav */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
            {(['overview', 'builders', 'categories', 'data'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-blue-600">{totalClaims}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Claims Tracked</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-orange-500">{avgResponseAll}</div>
                  <div className="text-sm text-gray-500 mt-1">Avg Response Days</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-red-500">{builderStats.reduce((s, b) => s + b.criticalClaims, 0)}</div>
                  <div className="text-sm text-gray-500 mt-1">Critical Issues</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-green-600">{builderStats.length}</div>
                  <div className="text-sm text-gray-500 mt-1">Builders Tracked</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    Worst Responders
                  </h3>
                  {builderStats.sort((a, b) => b.avgResponseDays - a.avgResponseDays).slice(0, 3).map(b => (
                    <div key={b.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{b.name}</div>
                        <div className="text-xs text-gray-400">{b.totalClaims} claims</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-500">{b.avgResponseDays}d avg</div>
                        <div className="text-xs text-gray-400">{b.resolvedRate}% resolved</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={16} className="text-blue-500" />
                    Top Issue Categories
                  </h3>
                  {categoryStats.sort((a, b) => b.count - a.count).slice(0, 5).map(c => (
                    <div key={c.category} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{c.category}</span>
                          <span className="text-xs text-gray-400">{c.count} claims · {c.avgDays}d avg</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(c.count / Math.max(...categoryStats.map(x => x.count))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Builder Scorecards */}
          {activeTab === 'builders' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Builder Scorecards</h2>
                <p className="text-xs text-gray-400 mt-1">Ranked by response time (worst first) — anonymized data available for licensing</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-5 py-3">Builder</th>
                      <th className="text-center px-4 py-3">Claims</th>
                      <th className="text-center px-4 py-3">Avg Response</th>
                      <th className="text-center px-4 py-3">Resolution Rate</th>
                      <th className="text-center px-4 py-3">Critical</th>
                      <th className="text-center px-4 py-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {builderStats.sort((a, b) => b.avgResponseDays - a.avgResponseDays).map((b, i) => {
                      const grade = b.avgResponseDays <= 5 && b.resolvedRate >= 85 ? 'A'
                        : b.avgResponseDays <= 10 && b.resolvedRate >= 70 ? 'B'
                        : b.avgResponseDays <= 15 && b.resolvedRate >= 60 ? 'C'
                        : b.resolvedRate >= 50 ? 'D' : 'F'
                      const gradeColor = { A: 'text-green-600', B: 'text-blue-600', C: 'text-yellow-600', D: 'text-orange-600', F: 'text-red-600' }[grade]
                      return (
                        <tr key={b.name} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <div className="font-medium text-gray-800">{b.name}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{b.state}</div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">{b.totalClaims}</td>
                          <td className={`px-4 py-3 text-center font-semibold ${b.avgResponseDays > 10 ? 'text-red-500' : 'text-green-600'}`}>
                            {b.avgResponseDays}d
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-semibold ${b.resolvedRate >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                              {b.resolvedRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`${b.criticalClaims > 3 ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                              {b.criticalClaims}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-center text-xl font-bold ${gradeColor}`}>{grade}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Issue Categories Breakdown</h2>
              <div className="space-y-4">
                {categoryStats.sort((a, b) => b.count - a.count).map(c => (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{c.category}</span>
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{c.count}</span> claims · 
                        <span className={`ml-1 font-semibold ${c.avgDays > 15 ? 'text-red-500' : 'text-green-600'}`}>{c.avgDays}d</span> avg resolution
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                        style={{ width: `${(c.count / Math.max(...categoryStats.map(x => x.count))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Licensing */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <h2 className="text-xl font-bold mb-2">Data Licensing</h2>
                <p className="text-blue-100 text-sm">
                  Oluso collects anonymized homebuilder performance data across thousands of claims. 
                  Our dataset provides unique insights into builder response times, issue frequencies, 
                  and resolution patterns by region.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Insurance Underwriters', icon: '🏦', desc: 'Risk scoring for new home insurance policies based on builder reputation and historical claim rates.' },
                  { title: 'Real Estate Attorneys', icon: '⚖️', desc: 'Builder response time benchmarks and claim documentation for litigation support.' },
                  { title: 'RE Investors', icon: '📊', desc: 'Community-level quality scores and defect rates to assess resale risk in new developments.' },
                ].map(item => (
                  <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">What We Track</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                  {[
                    'Builder response time (hours to first reply)',
                    'Issue categories by builder and region',
                    'Resolution rates and time-to-close',
                    'Critical/structural issue frequency',
                    'Community-level defect clustering',
                    'Seasonal patterns in issue types',
                    'Builder communication quality scores',
                    'Escalation rates and outcomes'
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
