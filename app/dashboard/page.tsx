'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { 
  Plus, AlertTriangle, Clock, CheckCircle, 
  MessageSquare, Send, ChevronDown, ChevronUp,
  Mail, User, Building, Calendar
} from 'lucide-react'

interface Message {
  id: string
  direction: 'outbound' | 'inbound'
  from_email: string
  to_email: string
  subject: string | null
  body: string | null
  sent_at: string
}

interface Claim {
  id: string
  title: string
  description: string
  category: string
  severity: string
  status: string
  email_thread_address: string | null
  builder_email: string | null
  created_at: string
  first_response_at: string | null
  resolved_at: string | null
  messages?: Message[]
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  awaiting_builder: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  escalated: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800'
}

const SEVERITY_COLORS: Record<string, string> = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600'
}

const CATEGORIES = ['structural','water','electrical','hvac','plumbing','cosmetic','landscaping','other']
const SEVERITIES = ['low','medium','high','critical']

export default function DashboardPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewClaim, setShowNewClaim] = useState(false)
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null)
  const [threadMessages, setThreadMessages] = useState<Record<string, Message[]>>({})
  const [replyText, setReplyText] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [newClaim, setNewClaim] = useState({
    title: '', description: '', category: 'other', severity: 'medium',
    builder_email: '', builder_name: ''
  })

  useEffect(() => {
    loadClaims()
  }, [])

  async function loadClaims() {
    try {
      const resp = await fetch('/.netlify/functions/get-thread?claim_id=list')
      // Use demo data until real API is wired up
      setClaims([
        {
          id: 'demo-1',
          title: 'Foundation crack in garage',
          description: 'Hairline crack running vertically 18 inches near NW corner of garage foundation.',
          category: 'structural',
          severity: 'high',
          status: 'awaiting_builder',
          email_thread_address: 'claim-demo001@mail.oluso.co',
          builder_email: 'warranty@builder.com',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          first_response_at: null,
          resolved_at: null
        },
        {
          id: 'demo-2', 
          title: 'Master bathroom tile grout cracking',
          description: 'Grout lines cracking in shower pan and around tub surround.',
          category: 'plumbing',
          severity: 'medium',
          status: 'in_progress',
          email_thread_address: 'claim-demo002@mail.oluso.co',
          builder_email: 'warranty@builder.com',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          first_response_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          resolved_at: null
        },
        {
          id: 'demo-3',
          title: 'HVAC not reaching temp in upstairs rooms',
          description: 'Upstairs bedrooms consistently 5-8 degrees cooler than thermostat setting in winter.',
          category: 'hvac',
          severity: 'medium',
          status: 'open',
          email_thread_address: null,
          builder_email: null,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          first_response_at: null,
          resolved_at: null
        }
      ])
    } catch (e) {
      console.error('loadClaims error', e)
    } finally {
      setLoading(false)
    }
  }

  async function createClaim() {
    if (!newClaim.title) return
    try {
      const resp = await fetch('/.netlify/functions/create-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClaim)
      })
      const data = await resp.json()
      if (data.claim) {
        setClaims(prev => [data.claim, ...prev])
        setNewClaim({ title: '', description: '', category: 'other', severity: 'medium', builder_email: '', builder_name: '' })
        setShowNewClaim(false)
      }
    } catch (e) {
      console.error('createClaim error', e)
    }
  }

  async function loadThread(claimId: string) {
    try {
      const resp = await fetch(`/.netlify/functions/get-thread?claim_id=${claimId}`)
      const data = await resp.json()
      setThreadMessages(prev => ({ ...prev, [claimId]: data.messages || [] }))
    } catch (e) {
      console.error('loadThread error', e)
    }
  }

  async function sendEmail(claim: Claim) {
    if (!claim.builder_email || !replyText) return
    setSendingEmail(true)
    try {
      const resp = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: claim.id,
          to_email: claim.builder_email,
          body: replyText,
          subject: `Re: Warranty Claim - ${claim.title}`
        })
      })
      const data = await resp.json()
      if (data.success) {
        setReplyText('')
        await loadThread(claim.id)
      }
    } catch (e) {
      console.error('sendEmail error', e)
    } finally {
      setSendingEmail(false)
    }
  }

  function toggleClaim(claimId: string) {
    if (expandedClaim === claimId) {
      setExpandedClaim(null)
    } else {
      setExpandedClaim(claimId)
      if (!threadMessages[claimId]) {
        loadThread(claimId)
      }
    }
  }

  function daysSince(dateStr: string) {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  }

  const openClaims = claims.filter(c => !['resolved', 'closed'].includes(c.status))
  const resolvedClaims = claims.filter(c => ['resolved', 'closed'].includes(c.status))
  const awaitingResponse = claims.filter(c => c.status === 'awaiting_builder' && !c.first_response_at)

  return (
    <AuthGuard>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
              <p className="text-gray-500 text-sm mt-1">Track warranty issues and builder communications</p>
            </div>
            <button
              onClick={() => setShowNewClaim(!showNewClaim)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              New Claim
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{openClaims.length}</div>
              <div className="text-xs text-gray-500 mt-1">Open Claims</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-orange-500">{awaitingResponse.length}</div>
              <div className="text-xs text-gray-500 mt-1">Awaiting Response</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{resolvedClaims.length}</div>
              <div className="text-xs text-gray-500 mt-1">Resolved</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">{claims.length}</div>
              <div className="text-xs text-gray-500 mt-1">Total Claims</div>
            </div>
          </div>

          {/* New Claim Form */}
          {showNewClaim && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">File a New Claim</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Claim Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Foundation crack in garage"
                    value={newClaim.title}
                    onChange={e => setNewClaim(p => ({ ...p, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the issue in detail..."
                    value={newClaim.description}
                    onChange={e => setNewClaim(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newClaim.category}
                    onChange={e => setNewClaim(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={newClaim.severity}
                    onChange={e => setNewClaim(p => ({ ...p, severity: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Builder Email</label>
                  <input
                    type="email"
                    placeholder="warranty@builder.com"
                    value={newClaim.builder_email}
                    onChange={e => setNewClaim(p => ({ ...p, builder_email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Builder Company</label>
                  <input
                    type="text"
                    placeholder="e.g. David Weekley Homes"
                    value={newClaim.builder_name}
                    onChange={e => setNewClaim(p => ({ ...p, builder_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={createClaim}
                  disabled={!newClaim.title}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Claim
                </button>
                <button
                  onClick={() => setShowNewClaim(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Claims List */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading claims...</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No claims yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "New Claim" to document your first warranty issue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map(claim => (
                <div key={claim.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Claim Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleClaim(claim.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{claim.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[claim.status] || 'bg-gray-100 text-gray-700'}`}>
                            {claim.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs font-medium ${SEVERITY_COLORS[claim.severity] || 'text-gray-600'}`}>
                            {claim.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 truncate">{claim.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Filed {daysSince(claim.created_at)}d ago
                          </span>
                          {claim.first_response_at ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle size={12} />
                              Responded {daysSince(claim.first_response_at)}d ago
                            </span>
                          ) : claim.status === 'awaiting_builder' ? (
                            <span className="flex items-center gap-1 text-orange-500">
                              <Clock size={12} />
                              Waiting {daysSince(claim.created_at)}d for response
                            </span>
                          ) : null}
                          {claim.email_thread_address && (
                            <span className="flex items-center gap-1 text-blue-500">
                              <Mail size={12} />
                              {claim.email_thread_address}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 shrink-0">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{claim.category}</span>
                        {expandedClaim === claim.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Thread + Reply */}
                  {expandedClaim === claim.id && (
                    <div className="border-t border-gray-100">
                      {/* Email Thread */}
                      <div className="p-4 bg-gray-50">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <MessageSquare size={12} />
                          Communication Thread
                        </h4>

                        {!threadMessages[claim.id] || threadMessages[claim.id].length === 0 ? (
                          <div className="text-sm text-gray-400 italic py-2">
                            No messages yet. Send the first email to your builder below.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {threadMessages[claim.id].map(msg => (
                              <div
                                key={msg.id}
                                className={`rounded-lg p-3 text-sm ${
                                  msg.direction === 'outbound'
                                    ? 'bg-blue-50 border border-blue-100 ml-4'
                                    : 'bg-white border border-gray-200 mr-4'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs font-medium ${msg.direction === 'outbound' ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {msg.direction === 'outbound' ? 'You → Builder' : 'Builder → You'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(msg.sent_at).toLocaleDateString()} {new Date(msg.sent_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                                {msg.subject && <div className="font-medium text-gray-700 text-xs mb-1">{msg.subject}</div>}
                                <div className="text-gray-600 whitespace-pre-wrap text-xs">{msg.body}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reply Composer */}
                      <div className="p-4 border-t border-gray-100">
                        {!claim.builder_email ? (
                          <div className="text-sm text-gray-400 italic flex items-center gap-2">
                            <Mail size={14} />
                            Add a builder email to this claim to enable messaging
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                              <Send size={11} />
                              Send to: <span className="font-medium text-gray-700">{claim.builder_email}</span>
                              {claim.email_thread_address && (
                                <span className="ml-2">via <span className="text-blue-500">{claim.email_thread_address}</span></span>
                              )}
                            </div>
                            <textarea
                              rows={3}
                              placeholder="Type your message to the builder..."
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                            />
                            <button
                              onClick={() => sendEmail(claim)}
                              disabled={!replyText || sendingEmail}
                              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Send size={14} />
                              {sendingEmail ? 'Sending...' : 'Send to Builder'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
