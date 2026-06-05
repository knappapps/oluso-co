'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, Shield } from 'lucide-react'

interface Props {
  warrantyStart: string
  warrantyEnd?: string
  totalClaims: number
  openClaims: number
}

function getMilestones(startDate: Date) {
  return [
    { label: '30-day walkthrough', days: 30, color: 'blue' },
    { label: '11-month inspection', days: 335, color: 'orange' },
    { label: 'Year 1 ends', days: 365, color: 'red' },
    { label: 'Year 2 mechanical', days: 730, color: 'purple' },
    { label: 'Year 10 structural', days: 3650, color: 'gray' },
  ].map(m => ({
    ...m,
    date: new Date(startDate.getTime() + m.days * 86400000),
  }))
}

export default function WarrantyClock({ warrantyStart, warrantyEnd, totalClaims, openClaims }: Props) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const start = new Date(warrantyStart)
  const end = warrantyEnd ? new Date(warrantyEnd) : new Date(start.getTime() + 365 * 86400000)
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = now.getTime() - start.getTime()
  const progressPct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100))
  const daysElapsed = Math.floor(elapsedMs / 86400000)
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
  const isExpired = now > end
  const milestones = getMilestones(start)

  const nextMilestone = milestones.find(m => m.date > now)
  const daysToNext = nextMilestone
    ? Math.ceil((nextMilestone.date.getTime() - now.getTime()) / 86400000)
    : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Shield size={18} className="text-blue-500" />
          Warranty Clock
        </h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">{totalClaims} total claims</span>
          {openClaims > 0 && (
            <span className="flex items-center gap-1 text-orange-500 font-medium">
              <AlertTriangle size={14} /> {openClaims} open
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className={isExpired ? 'text-red-500 font-medium' : 'text-gray-500'}>
            {isExpired ? 'Expired' : daysRemaining + ' days left'}
          </span>
          <span>{end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={'h-full rounded-full transition-all ' + (isExpired ? 'bg-red-400' : progressPct > 75 ? 'bg-orange-400' : 'bg-blue-500')}
            style={{ width: progressPct + '%' }}
          />
          {milestones.map(m => {
            const pos = Math.min(100, ((m.date.getTime() - start.getTime()) / totalMs) * 100)
            const isPast = m.date < now
            return (
              <div
                key={m.label}
                className={'absolute top-0 bottom-0 w-0.5 ' + (isPast ? 'bg-gray-400' : 'bg-white')}
                style={{ left: pos + '%' }}
                title={m.label}
              />
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={12} /> Day {daysElapsed} of {Math.ceil(totalMs / 86400000)}
        </span>
        {nextMilestone && daysToNext !== null && (
          <span className="text-blue-500 font-medium">
            Next: {nextMilestone.label} in {daysToNext}d
          </span>
        )}
        {isExpired && (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <CheckCircle size={12} /> Year 1 warranty period complete
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1">
        {milestones.map(m => {
          const isPast = m.date < now
          const isNext = m === nextMilestone
          return (
            <div
              key={m.label}
              className={'text-center p-2 rounded-lg text-xs ' + (isPast ? 'bg-gray-50 text-gray-400' : isNext ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'bg-gray-50 text-gray-500')}
            >
              <div className="font-medium">{m.days < 365 ? m.days + 'd' : Math.round(m.days / 365) + 'yr'}</div>
              <div className="text-xs mt-0.5 leading-tight">{m.label.split(' ').slice(0, 2).join(' ')}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
