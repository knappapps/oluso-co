// Item 5: WarrantyClock.tsx
// Displays warranty countdown, open claim count, and milestone alerts.
// Triggers Resend emails at 90/30/7-day marks via send-warranty-alert Netlify function.
'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, Bell, Shield } from 'lucide-react'

interface WarrantyClockProps {
    warrantyStart: string | null
    warrantyEnd: string | null
    openClaimsCount: number
    resolvedClaimsCount: number
    totalClaimsCount: number
    userId: string
}

interface WarrantyPeriod {
    label: string
    end: Date
    color: string
    urgency: 'safe' | 'warning' | 'critical'
}

function getDaysRemaining(endDate: Date): number {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function computeWarrantyPeriods(start: string, end: string): WarrantyPeriod[] {
    const s = new Date(start)
    const e = new Date(end)
    const year1End = new Date(s)
    year1End.setFullYear(year1End.getFullYear() + 1)
    const year2End = new Date(s)
    year2End.setFullYear(year2End.getFullYear() + 2)

  const periods: WarrantyPeriod[] = []

      const now = new Date()
    if (year1End > now) {
          const d = getDaysRemaining(year1End)
          periods.push({
                  label: 'Year 1 Warranty',
                  end: year1End,
                  color: d <= 30 ? 'text-red-600' : d <= 90 ? 'text-orange-500' : 'text-green-600',
                  urgency: d <= 30 ? 'critical' : d <= 90 ? 'warning' : 'safe'
          })
    }

  if (year2End > now && year2End <= e) {
        const d = getDaysRemaining(year2End)
        periods.push({
                label: 'Year 2 Warranty',
                end: year2End,
                color: d <= 30 ? 'text-red-600' : d <= 90 ? 'text-orange-500' : 'text-blue-600',
                urgency: d <= 30 ? 'critical' : d <= 90 ? 'warning' : 'safe'
        })
  }

  if (e > now) {
        const d = getDaysRemaining(e)
        periods.push({
                label: 'Full Warranty Period',
                end: e,
                color: d <= 30 ? 'text-red-600' : d <= 90 ? 'text-orange-500' : 'text-purple-600',
                urgency: d <= 30 ? 'critical' : d <= 90 ? 'warning' : 'safe'
        })
  }

  return periods
}

export default function WarrantyClock({
    warrantyStart,
    warrantyEnd,
    openClaimsCount,
    resolvedClaimsCount,
    totalClaimsCount,
    userId
}: WarrantyClockProps) {
    const [periods, setPeriods] = useState<WarrantyPeriod[]>([])
    const [alertSent, setAlertSent] = useState(false)

  useEffect(() => {
        if (!warrantyStart || !warrantyEnd) return
        const computed = computeWarrantyPeriods(warrantyStart, warrantyEnd)
        setPeriods(computed)

                // Send milestone alerts for critical/warning periods (once per session)
                const criticalPeriod = computed.find(p => p.urgency === 'critical')
        if (criticalPeriod && !alertSent && userId) {
                fetch('/.netlify/functions/send-warranty-alert', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                                      user_id: userId,
                                      days_remaining: getDaysRemaining(criticalPeriod.end),
                                      period_label: criticalPeriod.label
                          })
                }).catch(() => {})
                setAlertSent(true)
        }
  }, [warrantyStart, warrantyEnd, userId, alertSent])

  if (!warrantyStart || !warrantyEnd) {
        return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertTriangle size={18} className="text-yellow-600 shrink-0" />
                        <div>
                                  <p className="text-sm font-semibold text-yellow-800">Warranty dates not set</p>p>
                                  <p className="text-xs text-yellow-600 mt-0.5">
                                              <a href="/profile" className="underline hover:text-yellow-800">Add your warranty dates</a>a> to track your clock and get milestone alerts.
                                  </p>p>
                        </div>div>
                </div>div>
              )
  }
  
    return (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                        <Shield size={18} className="text-blue-600" />
                        <h2 className="font-bold text-gray-900 text-sm">Warranty Clock</h2>h2>
                </div>div>
          
            {/* Claim summary bar */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
            { label: 'Total Claims', value: totalClaimsCount, color: 'text-gray-900' },
            { label: 'Open', value: openClaimsCount, color: openClaimsCount > 0 ? 'text-orange-600' : 'text-gray-500' },
            { label: 'Resolved', value: resolvedClaimsCount, color: 'text-green-600' }
                    ].map(item => (
                                <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                                            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>p>
                                </div>div>
                              ))}
                </div>div>
          
            {/* Warranty period countdowns */}
                <div className="space-y-3">
                  {periods.map((period) => {
                      const days = getDaysRemaining(period.end)
                                  const isExpired = days <= 0
                                              const pct = Math.max(0, Math.min(100, (days / 365) * 100))
                                                
                                                          return (
                                                                        <div key={period.label} className={`p-3 rounded-lg border ${
                                                                                        period.urgency === 'critical' ? 'border-red-200 bg-red-50' :
                                                                                        period.urgency === 'warning' ? 'border-orange-200 bg-orange-50' :
                                                                                        'border-gray-200 bg-gray-50'
                                                                        }`}>
                                                                                      <div className="flex items-center justify-between mb-1.5">
                                                                                                      <div className="flex items-center gap-2">
                                                                                                        {isExpired ? (
                                                                                              <CheckCircle size={14} className="text-gray-400" />
                                                                                            ) : period.urgency === 'critical' ? (
                                                                                              <Bell size={14} className="text-red-500 animate-pulse" />
                                                                                            ) : (
                                                                                              <Clock size={14} className={period.color} />
                                                                                            )}
                                                                                                                        <span className="text-xs font-semibold text-gray-700">{period.label}</span>span>
                                                                                                        </div>div>
                                                                                                      <span className={`text-sm font-bold ${isExpired ? 'text-gray-400' : period.color}`}>
                                                                                                        {isExpired ? 'Expired' : `${days} days`}
                                                                                                        </span>span>
                                                                                        </div>div>
                                                                        
                                                                          {/* Progress bar */}
                                                                          {!isExpired && (
                                                                                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                                                            <div
                                                                                                                                  className={`h-1.5 rounded-full transition-all ${
                                                                                                                                                          period.urgency === 'critical' ? 'bg-red-500' :
                                                                                                                                                          period.urgency === 'warning' ? 'bg-orange-400' : 'bg-green-500'
                                                                                                                                    }`}
                                                                                                                                  style={{ width: `${pct}%` }}
                                                                                                                                />
                                                                                            </div>div>
                                                                                      )}
                                                                        
                                                                                      <p className="text-xs text-gray-500 mt-1">
                                                                                                      Expires {period.end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                                                        </p>p>
                                                                        
                                                                          {period.urgency === 'critical' && !isExpired && (
                                                                                          <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                                                                                            <AlertTriangle size={11} /> File remaining claims before expiration
                                                                                            </p>p>
                                                                                      )}
                                                                        </div>div>
                                                                      )
                  })}
                </div>div>
          </div>div>
        )
}</div>
