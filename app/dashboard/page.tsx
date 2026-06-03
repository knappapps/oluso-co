'use client'

import { useState, useEffect, useRef } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import type { Claim, Message, Attachment } from '@/lib/supabase'
import {
  Plus, AlertTriangle, Clock, CheckCircle,
  MessageSquare, Send, ChevronDown, ChevronUp,
  Mail, Calendar, Paperclip, Upload, X, Image, FileText, Loader2
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  awaiting_builder: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  escalated: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800'
}
const SEVERITY_COLORS: Record<string, string> = {
  low: 'text-green-600', medium: 'text-yellow-600', high: 'text-orange-600', critical: 'text-red-600'
}
const CATEGORIES = ['structural','water','electrical','hvac','plumbing','cosmetic','landscaping','other']
const SEVERITIES = ['low','medium','high','critical']

export default function DashboardPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [threads, setThreads] = useState<Record<string, Message[]>>({})
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>({})
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userProfile, setUserProfile] = useState<{ id: string; builder_name?: string; builder_email?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newClaim, setNewClaim] = useState({
    title: '', description: '', category: 'other', severity: 'medium',
    builder_email: '', builder_name: ''
  })
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Load user profile
      const { data: profile } = await supabase
        .from('users').select('id, builder_name, community_name')
        .eq('auth_id', session.user.id).single()
      if (profile) {
        setUserProfile(profile)
        // Pre-fill builder in new claim form
        if (profile.builder_name) {
          setNewClaim(prev => ({ ...prev, builder_name: profile.builder_name || '' }))
        }
      }

      // Load claims
      if (profile) {
        const { data: claimsData } = await supabase
          .from('claims').select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
        setClaims(claimsData || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function createClaim() {
    if (!newClaim.title || !userProfile) return
    try {
      const resp = await fetch('/.netlify/functions/create-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClaim, user_id: userProfile.id })
      })
      const data = await resp.json()
      if (data.claim) {
        const claim = data.claim

        // Upload any pending files
        if (pendingFiles.length > 0) {
          await uploadFiles(pendingFiles, claim.id)
        }

        setClaims(prev => [claim, ...prev])
        setNewClaim({ title: '', description: '', category: 'other', severity: 'medium', builder_email: '', builder_name: userProfile ? (userProfile as any).builder_name || '' : '' })
        setPendingFiles([])
        setShowNew(false)
        setExpanded(claim.id)
      }
    } catch (e) { console.error(e) }
  }

  async function uploadFiles(files: File[], claimId: string) {
    setUploading(true)
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `${claimId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('claim-photos')
          .upload(path, file, { contentType: file.type, upsert: false })

        if (!uploadError) {
          await supabase.from('claim_attachments').insert({
            claim_id: claimId,
            file_name: file.name,
            file_path: path,
            file_size: file.size,
            file_type: file.type,
            storage_bucket: 'claim-photos'
          })
        }
      }
      // Refresh attachments
      await loadAttachments(claimId)
    } finally {
      setUploading(false)
    }
  }

  async function loadAttachments(claimId: string) {
    const { data } = await supabase
      .from('claim_attachments').select('*')
      .eq('claim_id', claimId).order('uploaded_at', { ascending: true })
    setAttachments(prev => ({ ...prev, [claimId]: data || [] }))
  }

  async function loadThread(claimId: string) {
    const { data } = await supabase
      .from('messages').select('*')
      .eq('claim_id', claimId).order('sent_at', { ascending: true })
    setThreads(prev => ({ ...prev, [claimId]: data || [] }))
    await loadAttachments(claimId)
  }

  async function toggleClaim(claimId: string) {
    if (expanded === claimId) { setExpanded(null); return }
    setExpanded(claimId)
    if (!threads[claimId]) await loadThread(claimId)
  }

  async function sendEmail(claim: Claim) {
    if (!claim.builder_email || !replyText) return
    setSending(true)
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
        // Update local claim status
        setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'awaiting_builder', email_thread_address: data.from } : c))
      }
    } finally { setSending(false) }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setPendingFiles(prev => [...prev, ...files])
  }

  async function handleUploadToExisting(claimId: string, files: FileList) {
    await uploadFiles(Array.from(files), claimId)
  }

  function getAttachmentUrl(attachment: Attachment) {
    const { data } = supabase.storage.from('claim-photos').getPublicUrl(attachment.file_path)
    return data.publicUrl
  }

  function daysSince(d: string) {
    return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  }

  function fileIcon(type: string | null) {
    if (!type) return <FileText size={14} />
    if (type.startsWith('image/')) return <Image size={14} />
    return <FileText size={14} />
  }

  const openClaims = claims.filter(c => !['resolved','closed'].includes(c.status))
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
            <button onClick={() => setShowNew(!showNew)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Plus size={16} /> New Claim
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Open Claims', value: openClaims.length, color: 'text-blue-600' },
              { label: 'Awaiting Response', value: awaitingResponse.length, color: 'text-orange-500' },
              { label: 'Resolved', value: claims.filter(c => c.status === 'resolved').length, color: 'text-green-600' },
              { label: 'Total Claims', value: claims.length, color: 'text-gray-700' }
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* New Claim Form */}
          {showNew && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">File a New Claim</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Claim Title *</label>
                  <input type="text" placeholder="e.g. Foundation crack in garage"
                    value={newClaim.title} onChange={e => setNewClaim(p => ({ ...p, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} placeholder="Describe the issue in detail..."
                    value={newClaim.description} onChange={e => setNewClaim(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select value={newClaim.category} onChange={e => setNewClaim(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                  <select value={newClaim.severity} onChange={e => setNewClaim(p => ({ ...p, severity: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Builder Email</label>
                  <input type="email" placeholder="warranty@builder.com"
                    value={newClaim.builder_email} onChange={e => setNewClaim(p => ({ ...p, builder_email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Builder Company</label>
                  <input type="text" placeholder="e.g. David Weekley Homes"
                    value={newClaim.builder_name} onChange={e => setNewClaim(p => ({ ...p, builder_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Photo upload */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1"><Paperclip size={12} /> Attach photos / documents</span>
                  </label>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                    <Upload size={16} /> Click to add photos or documents
                  </button>
                  {pendingFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pendingFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 text-xs text-blue-700">
                          {fileIcon(f.type)}
                          <span className="max-w-24 truncate">{f.name}</span>
                          <button onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} className="text-blue-400 hover:text-blue-600 ml-1">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={createClaim} disabled={!newClaim.title}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  Create Claim
                </button>
                <button onClick={() => { setShowNew(false); setPendingFiles([]) }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Claims List */}
          {loading ? (
            <div className="text-center py-12 text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" /> Loading claims...
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No claims yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "New Claim" to document your first warranty issue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map(claim => (
                <div key={claim.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Claim Header */}
                  <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleClaim(claim.id)}>
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
                        {claim.description && <p className="text-sm text-gray-500 mt-1 truncate">{claim.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1"><Calendar size={12} /> Filed {daysSince(claim.created_at)}d ago</span>
                          {claim.first_response_at ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle size={12} /> Responded {daysSince(claim.first_response_at)}d ago
                            </span>
                          ) : claim.status === 'awaiting_builder' ? (
                            <span className="flex items-center gap-1 text-orange-500">
                              <Clock size={12} /> Waiting {daysSince(claim.created_at)}d
                            </span>
                          ) : null}
                          {claim.email_thread_address && (
                            <span className="flex items-center gap-1 text-blue-400"><Mail size={12} /> {claim.email_thread_address}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 shrink-0">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{claim.category}</span>
                        {expanded === claim.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
                  {expanded === claim.id && (
                    <div className="border-t border-gray-100">
                      {/* Attachments */}
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                            <Paperclip size={12} /> Photos & Documents
                            {attachments[claim.id]?.length > 0 && (
                              <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 text-xs ml-1">
                                {attachments[claim.id].length}
                              </span>
                            )}
                          </h4>
                          <label className="flex items-center gap-1 text-xs text-blue-600 cursor-pointer hover:text-blue-700">
                            <Upload size={12} />
                            {uploading ? 'Uploading...' : 'Add files'}
                            <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden"
                              onChange={e => e.target.files && handleUploadToExisting(claim.id, e.target.files)} />
                          </label>
                        </div>
                        {!attachments[claim.id] || attachments[claim.id].length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No attachments yet</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {attachments[claim.id].map(att => (
                              <a key={att.id} href={getAttachmentUrl(att)} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                                {att.file_type?.startsWith('image/') ? (
                                  <img src={getAttachmentUrl(att)} alt={att.file_name}
                                    className="w-8 h-8 object-cover rounded" />
                                ) : <FileText size={14} />}
                                <span className="max-w-32 truncate">{att.file_name}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Thread */}
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                          <MessageSquare size={12} /> Communication Thread
                        </h4>
                        {!threads[claim.id] || threads[claim.id].length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No messages yet. Send the first email to your builder below.</p>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {threads[claim.id].map(msg => (
                              <div key={msg.id}
                                className={`rounded-lg p-3 text-sm ${msg.direction === 'outbound' ? 'bg-blue-50 border border-blue-100 ml-4' : 'bg-white border border-gray-200 mr-4'}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs font-medium ${msg.direction === 'outbound' ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {msg.direction === 'outbound' ? 'You → Builder' : 'Builder → You'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(msg.sent_at).toLocaleDateString()} {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {msg.subject && <div className="font-medium text-gray-700 text-xs mb-1">{msg.subject}</div>}
                                <div className="text-gray-600 whitespace-pre-wrap text-xs">{msg.body}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reply */}
                      <div className="p-4 border-t border-gray-100">
                        {!claim.builder_email ? (
                          <p className="text-sm text-gray-400 italic flex items-center gap-2"><Mail size={14} /> No builder email on this claim — edit the claim to add one</p>
                        ) : (
                          <div>
                            <div className="text-xs text-gray-500 mb-2">
                              Send to: <span className="font-medium text-gray-700">{claim.builder_email}</span>
                              {claim.email_thread_address && <span className="ml-2 text-blue-400">via {claim.email_thread_address}</span>}
                            </div>
                            <textarea rows={3} placeholder="Type your message to the builder..."
                              value={replyText} onChange={e => setReplyText(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
                            <button onClick={() => sendEmail(claim)} disabled={!replyText || sending}
                              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                              <Send size={14} /> {sending ? 'Sending...' : 'Send to Builder'}
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