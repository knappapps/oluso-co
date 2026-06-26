'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import {
  Building2, TrendingUp, Clock, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Calendar, Star
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  awaiting_builder: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  escalated: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
}

const SEVERITY_COLORS: Record<string, string> = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
}

interface BuilderClaim {
  id: string
  title: string
  category: string
  severity: string
  status: string
  created_at: string
  days_to_first_response: number | null
  resolved_at: string | null
  defect_location: string | null
}

interface BuilderScore {
  accountability_score: number | null
  total_claims: number | null
  resolve_rate_pct: number | null
  avg_days_to_first_response: number | null
  avg_days_to_resolution: number | null
}

interface Props {
  builderName: string
  claims: BuilderClaim[]
  score: BuilderScore | null
}

export default function BuilderDashboardClient({ builderName, claims, score }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const openClaims = claims.filter(c => !['resolved', 'closed'].includes(c.status))
  const resolvedClaims = claims.filter(c => ['resolved', 'closed'].includes(c.status))
  const pendingResponse = claims.filter(c => c.status === 'awaiting_builder' && c.days_to_first_response == null)

  const accountabilityScore = score?.accountability_score ?? null
  const scoreColor =
    accountabilityScore == null ? 'text-gray-400'
    : accountabilityScore >= 70 ? 'text-green-600'
    : accountabilityScore >= 40 ? 'text-yellow-600'
    : 'text-red-600'

  function daysSince(d: string) {
    return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Builder Dashboard</h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <Building2 size={14} /> {builderName}
          </p>
        </div>

        {/* Accountability Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
            <div className={`text-5xl font-black ${scoreColor}`}>
              {accountabilityScore != null ? accountabilityScore.toFixed(0) : '—'}
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-0.5">Accountability Score</div>
              <div className="text-xs text-gray-400">
                {accountabilityScore == null
                  ? 'Score calculated once claims are filed'
                  : accountabilityScore >= 70
                  ? 'Good standing — keep it up!'
                  : accountabilityScore >= 40
                  ? 'Room for improvement'
                  : 'Needs attention — response times are lagging'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Claims', value: score?.total_claims ?? claims.length, icon: <Star size={15} className="text-blue-400" /> },
              { label: 'Resolve Rate', value: score?.resolve_rate_pct != null ? score.resolve_rate_pct.toFixed(0) + '%' : (claims.length > 0 ? Math.round((resolvedClaims.length / claims.length) * 100) + '%' : 'N/A'), icon: <CheckCircle size={15} className="text-green-500" /> },
              { label: 'Avg First Response', value: score?.avg_days_to_first_response != null ? score.avg_days_to_first_response.toFixed(1) + 'd' : 'N/A', icon: <Clock size={15} className="text-orange-400" /> },
              { label: 'Avg Resolution', value: score?.avg_days_to_resolution != null ? score.avg_days_to_resolution.toFixed(1) + 'd' : 'N/A', icon: <TrendingUp size={15} className="text-purple-400" /> },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1">{s.icon}<span className="text-xs">{s.label}</span></div>
                <div className="text-xl font-bold text-gray-900">{String(s.value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Open Claims', value: openClaims.length, color: 'text-blue-600' },
            { label: 'Awaiting Your Response', value: pendingResponse.length, color: 'text-orange-500' },
            { label: 'Resolved', value: resolvedClaims.length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Claims List */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Claims Filed Against Your Builds</h2>
        {claims.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No claims filed yet</p>
            <p className="text-gray-400 text-sm mt-1">Claims will appear here when homeowners file them.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map(claim => (
              <div key={claim.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === claim.id ? null : claim.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-900">{claim.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[claim.status] || 'bg-gray-100 text-gray-700'}`}>
                          {claim.status.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs font-medium capitalize ${SEVERITY_COLORS[claim.severity] || 'text-gray-600'}`}>
                          {claim.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                        <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{claim.category}</span>
                        {claim.defect_location && <span>{claim.defect_location}</span>}
                        <span className="flex items-center gap-1"><Calendar size={11} /> Filed {daysSince(claim.created_at)}d ago</span>
                        {claim.days_to_first_response != null ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={11} /> Responded in {claim.days_to_first_response}d
                          </span>
                        ) : claim.status === 'awaiting_builder' ? (
                          <span className="flex items-center gap-1 text-orange-500">
                            <AlertCircle size={11} /> Awaiting response ({daysSince(claim.created_at)}d)
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="shrink-0 text-gray-400">
                      {expandedId === claim.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {expandedId === claim.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 text-sm text-gray-600 space-y-1.5">
                    <div><span className="font-medium text-gray-700">Claim ID:</span> <span className="font-mono text-xs">{claim.id}</span></div>
                    <div><span className="font-medium text-gray-700">Filed:</span> {new Date(claim.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    {claim.days_to_first_response != null && (
                      <div><span className="font-medium text-gray-700">Days to first response:</span> {claim.days_to_first_response}</div>
                    )}
                    {claim.resolved_at && (
                      <div><span className="font-medium text-gray-700">Resolved:</span> {new Date(claim.resolved_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/builders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View your public builder scorecard →
          </Link>
        </div>
      </main>
    </div>
  )
}
