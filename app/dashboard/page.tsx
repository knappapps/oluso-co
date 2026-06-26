'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import WarrantyClock from '@/components/WarrantyClock'
import { supabase } from '@/lib/supabase'
import type { Claim, Message, Attachment } from '@/lib/supabase'
import {
Plus, AlertTriangle, Clock, CheckCircle,
MessageSquare, Send, ChevronDown, ChevronUp,
Mail, Calendar, Paperclip, Upload, X, Image, FileText, Loader2, Shield,
Share2, Copy, Check, User, AlertCircle
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

const DEFECT_LOCATIONS: Record<string, string[]> = {
structural: ['Foundation','Framing','Load-bearing wall','Roof structure','Garage'],
water: ['Roof','Window','Door','Basement','Bathroom','Kitchen','Exterior wall'],
electrical: ['Panel','Outlets','Lighting','GFCI','Wiring','Smoke detectors'],
hvac: ['Furnace','AC unit','Ductwork','Thermostat','Ventilation','Water heater'],
plumbing: ['Kitchen','Master bath','Guest bath','Laundry','Exterior hose bib','Sump pump'],
cosmetic: ['Drywall','Paint','Flooring','Trim','Cabinetry','Tile','Countertops'],
landscaping: ['Grading','Drainage','Sod','Concrete','Driveway','Retaining wall'],
other: ['Other']
}
const SUB_CATEGORIES: Record<string, string[]> = {
structural: ['Crack','Settling','Movement','Separation','Deflection'],
water: ['Leak','Staining','Mold','Moisture intrusion','Ice dam'],
electrical: ['No power','Tripping breaker','Flickering','Not to code','Safety hazard'],
hvac: ['Not heating','Not cooling','Noise','Leak','Poor airflow','Not installed per spec'],
plumbing: ['Leak','Low pressure','Drainage issue','No hot water','Frozen pipe'],
cosmetic: ['Crack','Gap','Stain','Scratch','Misalignment','Poor finish'],
landscaping: ['Standing water','Erosion','Crack','Settlement','Dead sod'],
other: ['Other']
}

// Builder slug map for share URLs
const BUILDER_TO_SLUG: Record<string, string> = {
'David Weekley Homes': 'david-weekley-homes',
'Ivory Homes': 'ivory-homes',
'Woodside Homes': 'woodside-homes',
'Toll Brothers': 'toll-brothers',
'Lennar Homes': 'lennar-homes',
'KB Home': 'kb-home',
'DR Horton': 'dr-horton',
'Pulte Homes': 'pulte-homes',
'Shea Homes': 'shea-homes',
'Taylor Morrison': 'taylor-morrison',
'Meritage Homes': 'meritage-homes',
'Century Communities': 'century-communities',
}

function ShareNeighborCard({ referralCode, builderName, referralCount }: { referralCode: string; builderName?: string; referralCount?: number }) {
const [copied, setCopied] = useState(false)
const builderSlug = builderName ? BUILDER_TO_SLUG[builderName] : undefined
const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://oluso.co'
const shareUrl = `${baseUrl}/signup?ref=${referralCode}${builderSlug ? `&builder=${builderSlug}` : ''}`
const smsText = encodeURIComponent(`I've been tracking my new home warranty claims on Oluso — it's been super helpful. Same builder as us! Get started here: ${shareUrl}`)
const emailSubject = encodeURIComponent('Track your home warranty claims with Oluso')
const emailBody = encodeURIComponent(`Hey neighbor,\n\nI've been using Oluso to track my new home warranty claims and communicate with our builder. It's made a big difference in getting issues resolved faster.\n\nSince we have the same builder, I thought you'd find it useful too. Here's my link to get started:\n${shareUrl}\n\nHope it helps!`)

async function copyLink() {
try {
await navigator.clipboard.writeText(shareUrl)
setCopied(true)
setTimeout(() => setCopied(false), 2500)
} catch {
const ta = document.createElement('textarea')
ta.value = shareUrl
document.body.appendChild(ta)
ta.select()
document.execCommand('copy')
document.body.removeChild(ta)
setCopied(true)
setTimeout(() => setCopied(false), 2500)
}
}

return (
<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 mb-6 text-white shadow-sm">
  <div className="flex items-center gap-2 mb-1">
    <Share2 size={16} className="opacity-80" />
    <h3 className="font-semibold text-sm">Share with your neighbor</h3>
  </div>
  <p className="text-blue-100 text-xs leading-relaxed mb-3">
    Your neighbors have the same builder and the same warranty window. Share Oluso so they can track their claims too{builderName ? ` — ${builderName} owners` : ''}.
    {referralCount != null && referralCount > 0 && <span className="ml-1 font-semibold text-white">{referralCount} neighbor{referralCount !== 1 ? 's' : ''} joined!</span>}
  </p>
  <div className="flex flex-wrap gap-2 mb-3">
    <button
      onClick={copyLink}
      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
    <a
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
      target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
      Facebook
    </a>
    <a
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I've been tracking my home warranty claims on Oluso — same builder as us! Get started: " + shareUrl)}`}
      target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      X
    </a>
    <a
      href={`https://wa.me/?text=${encodeURIComponent("I've been tracking my home warranty claims on Oluso — same builder as us! Get started: " + shareUrl)}`}
      target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      WhatsApp
    </a>
    <a
      href={`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}`}
      target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12.065.001C9.528-.008 5.886 1.017 4.01 4.908c-.632 1.29-.506 3.476-.569 4.886-.08.05-.2.077-.338.077-.29 0-.644-.104-.932-.104-.234 0-1.11.037-1.11.795 0 .644.7.97 1.328 1.213.138.052.302.104.446.17.401.18.624.378.727.619.205.482-.007.89-.2 1.394-.007.02-.007.038-.014.056C2.9 15.37 1.35 16.28.502 16.668c-.337.156-.504.39-.504.643 0 .6.903.943 1.55 1.072.156.03.252.16.307.338.042.13.097.34.145.437.156.326.47.487.836.487.186 0 .386-.044.593-.13.398-.165.77-.244 1.108-.244.31 0 .577.058.802.174.44.233.844.698 1.42 1.12 1.009.737 2.205 1.096 3.587 1.096 1.304 0 2.47-.353 3.465-1.053l.044-.029c.57-.415.96-.86 1.37-1.102.24-.143.52-.206.836-.206.33 0 .694.078 1.104.238.22.085.43.13.625.13.447 0 .76-.207.895-.586.039-.112.082-.275.124-.394.054-.17.147-.296.306-.326.647-.13 1.55-.474 1.55-1.072 0-.254-.167-.486-.504-.643-.848-.388-2.398-1.298-2.847-2.65-.007-.018-.007-.037-.014-.056-.193-.505-.406-.912-.2-1.394.103-.241.326-.438.727-.619.144-.066.308-.118.446-.17.628-.244 1.328-.57 1.328-1.213 0-.758-.876-.795-1.11-.795-.303 0-.668.115-.966.115a.872.872 0 01-.304-.051c-.064-1.41.059-3.6-.574-4.89C18.142 1.017 14.6-.009 12.065 0z"/></svg>
      Snapchat
    </a>
    <a
      href={`https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}`}
      target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>
      TikTok
    </a>
    <a
      href={`sms:?body=${smsText}`}
      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      <MessageSquare size={12} /> Text
    </a>
    <a
      href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
    >
      <Mail size={12} /> Email
    </a>
  </div>
  <p className="text-blue-200 text-xs font-mono truncate">{shareUrl}</p>
</div>
)
}
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
const [referralCount, setReferralCount] = useState(0)
    const [activeAd, setActiveAd] = useState<{id:string;sponsor_name:string;title:string;description:string;cta_text:string;link_url:string;bg_color:string;text_color:string} | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
const [userProfile, setUserProfile] = useState<{
id: string
builder_name?: string
builder_email?: string
warranty_start?: string
warranty_end?: string
referral_code?: string
    plan?: string
} | null>(null)
const fileInputRef = useRef<HTMLInputElement>(null)

const [newClaim, setNewClaim] = useState({
title: '',
description: '',
category: 'other',
severity: 'medium',
builder_email: '',
builder_name: '',
defect_location: '',
defect_sub_category: '',
estimated_repair_cost: '',
warranty_year: '1',
public_story: false
})
const [pendingFiles, setPendingFiles] = useState<File[]>([])
const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)
const router = useRouter()

useEffect(() => {
const params = new URLSearchParams(window.location.search)
if (params.get('upgrade') === 'success') {
  setShowUpgradeBanner(true)
  router.replace('/dashboard')
  setTimeout(() => setShowUpgradeBanner(false), 8000)
}
}, [router])

useEffect(() => {
async function load() {
const { data: { session } } = await supabase.auth.getSession()
if (!session) return
const { data: profile } = await supabase
  .from('users')
  .select('id, builder_name, community_name, warranty_start, warranty_end, referral_code, plan')
  .eq('auth_id', session.user.id)
  .single()
if (profile) {
  setUserProfile(profile)
  if (profile.builder_name) {
    setNewClaim(prev => ({ ...prev, builder_name: profile.builder_name || '' }))
  }
  // Fetch referral count: how many users signed up via this user's referral code
  if (profile.referral_code) {
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', profile.referral_code)
    setReferralCount(count || 0)
  }
}
if (profile) {
  const { data: claimsData } = await supabase
    .from('claims').select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
  setClaims(claimsData || [])
}
    const { data: adsData } = await supabase.from('ads').select('*').eq('active', true).order('display_order').limit(1)
    if (adsData && adsData.length > 0) setActiveAd(adsData[0] as typeof activeAd)
        if (profile?.plan) setUserPlan(profile.plan)
    setLoading(false)
}
load()
}, [])
async function createClaim() {
if (!newClaim.title || !userProfile) return
try {
const payload = {
  ...newClaim,
  user_id: userProfile.id,
  estimated_repair_cost: newClaim.estimated_repair_cost ? parseFloat(newClaim.estimated_repair_cost) : null,
  warranty_year: newClaim.warranty_year ? parseInt(newClaim.warranty_year) : 1
}
const resp = await fetch('/.netlify/functions/create-claim', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
const data = await resp.json()
if (data.claim) {
  const claim = data.claim
  if (pendingFiles.length > 0) await uploadFiles(pendingFiles, claim.id)
  setClaims(prev => [claim, ...prev])
        setNewClaim({ title: '', description: '', category: 'other', severity: 'medium', builder_email: '', builder_name: userProfile?.builder_name ?? '', defect_location: '', defect_sub_category: '', estimated_repair_cost: '', warranty_year: '1', public_story: false })
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
  const { error: uploadError } = await supabase.storage.from('claim-photos').upload(path, file, { contentType: file.type, upsert: false })
  if (!uploadError) {
    await supabase.from('claim_attachments').insert({ claim_id: claimId, file_name: file.name, file_path: path, file_size: file.size, file_type: file.type, storage_bucket: 'claim-photos' })
  }
}
await loadAttachments(claimId)
} finally { setUploading(false) }
}

async function loadAttachments(claimId: string) {
const { data } = await supabase.from('claim_attachments').select('*').eq('claim_id', claimId).order('uploaded_at', { ascending: true })
setAttachments(prev => ({ ...prev, [claimId]: data || [] }))
}

async function loadThread(claimId: string) {
const { data } = await supabase.from('messages').select('*').eq('claim_id', claimId).order('sent_at', { ascending: true })
setThreads(prev => ({ ...prev, [claimId]: data || [] }))
await loadAttachments(claimId)
}

async function toggleClaim(claimId: string) {
if (expanded === claimId) { setExpanded(null); return }
setExpanded(claimId)
if (!threads[claimId]) await loadThread(claimId)
}

async function sendEmail(claim: Claim) {
if (!(claim as any).builder_email || !replyText) return
setSending(true)
try {
const resp = await fetch('/.netlify/functions/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ claim_id: claim.id, to_email: (claim as any).builder_email, body: replyText, subject: `Re: Warranty Claim - ${claim.title}` })
})
const data = await resp.json()
if (data.success) {
  setReplyText('')
  await loadThread(claim.id)
  setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'awaiting_builder', email_thread_address: data.from } : c))
}
} finally { setSending(false) }
}

function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
setPendingFiles(prev => [...prev, ...Array.from(e.target.files || [])])
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
const awaitingResponse = claims.filter(c => c.status === 'awaiting_builder' && !(c as any).first_response_at)
const locationOptions = DEFECT_LOCATIONS[newClaim.category] || DEFECT_LOCATIONS.other
const subCatOptions = SUB_CATEGORIES[newClaim.category] || SUB_CATEGORIES.other
return (
<AuthGuard>
<Header />
<main className="min-h-screen bg-gray-50 pt-16">
  <div className="max-w-5xl mx-auto px-4 py-8">
    {showUpgradeBanner && (
      <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-green-600 text-lg font-bold">🎉</span>
          <p className="text-green-800 font-semibold text-sm">You&apos;re now on Pro! Ads have been removed.</p>
        </div>
        <button onClick={() => setShowUpgradeBanner(false)} className="text-green-500 hover:text-green-700 text-xs font-medium shrink-0">Dismiss</button>
      </div>
    )}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
        <p className="text-gray-500 text-sm mt-1">Track warranty issues and builder communications</p>
      </div>
      <button onClick={() => setShowNew(!showNew)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
        <Plus size={16} /> New Claim
      </button>
    </div>

    {userProfile?.warranty_start && (
      <div className="mb-6">
        <WarrantyClock
          warrantyStart={userProfile.warranty_start}
          warrantyEnd={userProfile.warranty_end || undefined}
          totalClaims={claims.length}
          openClaims={openClaims.length}
        />
      </div>
    )}

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: 'Open Claims', value: openClaims.length, color: 'text-blue-600' },
        { label: 'Awaiting Response', value: awaitingResponse.length, color: 'text-orange-500' },
        { label: 'Resolved', value: claims.filter(c => c.status === 'resolved').length, color: 'text-green-600' },
        { label: 'Total Claims', value: claims.length, color: 'text-gray-700' }
      ].map(s => (
        <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
          <div className={'text-2xl font-bold ' + s.color}>{s.value}</div>
          <div className="text-xs text-gray-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>

    {/* Share with neighbor card */}
    {userProfile?.referral_code && (
      <ShareNeighborCard
        referralCode={userProfile.referral_code}
        builderName={userProfile.builder_name}
        referralCount={referralCount}
      />
    )}
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
            <select value={newClaim.category}
              onChange={e => setNewClaim(p => ({ ...p, category: e.target.value, defect_location: '', defect_sub_category: '' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
            <select value={newClaim.severity} onChange={e => setNewClaim(p => ({ ...p, severity: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SEVERITIES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Location in Home</label>
            <select value={newClaim.defect_location} onChange={e => setNewClaim(p => ({ ...p, defect_location: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select location...</option>
              {locationOptions.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Defect Type</label>
            <select value={newClaim.defect_sub_category} onChange={e => setNewClaim(p => ({ ...p, defect_sub_category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select type...</option>
              {subCatOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Est. Repair Cost ($)</label>
            <input type="number" min="0" step="50" placeholder="e.g. 2500"
              value={newClaim.estimated_repair_cost}
              onChange={e => setNewClaim(p => ({ ...p, estimated_repair_cost: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Warranty Year</label>
            <select value={newClaim.warranty_year} onChange={e => setNewClaim(p => ({ ...p, warranty_year: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="1">Year 1 (Workmanship)</option>
              <option value="2">Year 2 (Mechanical systems)</option>
              <option value="10">Year 10 (Structural)</option>
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
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only"
                  checked={newClaim.public_story}
                  onChange={e => setNewClaim(p => ({ ...p, public_story: e.target.checked })) } />
                <div className={'w-10 h-6 rounded-full transition-colors ' + (newClaim.public_story ? 'bg-green-500' : 'bg-gray-300')} />
                <div className={'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (newClaim.public_story ? 'translate-x-5' : 'translate-x-1')} />
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Shield size={14} className="text-green-500" />
                  Share anonymously with community
                </span>
                <p className="text-xs text-gray-400 mt-0.5">Your name and address are never shown.</p>
              </div>
            </label>
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
      {/* Ad Banner — shown to free users */}
      {userPlan !== 'pro' && activeAd && (
        (activeAd as any).embed_html ? (
          <div className="mb-4 overflow-auto" dangerouslySetInnerHTML={{ __html: (activeAd as any).embed_html }} />
        ) : (
          <a
            href={activeAd.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border px-5 py-4 mb-4 transition-opacity hover:opacity-90"
            style={{ background: activeAd.bg_color, borderColor: activeAd.bg_color }}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <p className="text-xs font-medium mb-0.5 opacity-60" style={{ color: activeAd.text_color }}>Sponsored · {activeAd.sponsor_name}</p>
                <p className="font-semibold text-sm" style={{ color: activeAd.text_color }}>{activeAd.title}</p>
                <p className="text-xs mt-0.5 opacity-80" style={{ color: activeAd.text_color }}>{activeAd.description}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full"
                style={{ background: activeAd.text_color, color: activeAd.bg_color }}
              >{activeAd.cta_text} →</span>
            </div>
          </a>
        )
      )}
    {loading ? (
      <div className="text-center py-12 text-gray-400 flex items-center justify-center gap-2">
        <Loader2 size={20} className="animate-spin" /> Loading claims...
      </div>
    ) : claims.length === 0 ? (
        <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No claims yet</p>
        <p className="text-gray-400 text-sm mt-1">Click "New Claim" to document your first warranty issue</p>
      </div>
    ) : (
      <div className="space-y-4">
        {claims.map(claim => (
          <div key={claim.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleClaim(claim.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{claim.title}</h3>
                    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (STATUS_COLORS[claim.status] || 'bg-gray-100 text-gray-700')}>
                      {claim.status.replace('_', ' ')}
                    </span>
                    <span className={'text-xs font-medium ' + (SEVERITY_COLORS[claim.severity] || 'text-gray-600')}>
                      {claim.severity}
                    </span>
                    {(claim as any).public_story && (
                      <span className="text-xs flex items-center gap-0.5 text-green-600">
                        <Shield size={10} /> shared
                      </span>
                    )}
                  </div>
                  {claim.description && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{claim.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Filed {daysSince(claim.created_at)}d ago</span>
                    {(claim as any).defect_location && (
                      <span className="text-gray-500">{(claim as any).defect_location}</span>
                    )}
                    {(claim as any).estimated_repair_cost && (
                      <span className="text-orange-500 font-medium">Est. ${Number((claim as any).estimated_repair_cost).toLocaleString()}</span>
                    )}
                    {(claim as any).warranty_year && (
                      <span className="text-blue-400">Yr {(claim as any).warranty_year} warranty</span>
                    )}
                    {(claim as any).first_response_at ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={12} /> Responded {daysSince((claim as any).first_response_at)}d ago
                      </span>
                    ) : claim.status === 'awaiting_builder' ? (
                      <span className="flex items-center gap-1 text-orange-500">
                        <Clock size={12} /> Waiting {daysSince(claim.created_at)}d
                      </span>
                    ) : null}
                    {(claim as any).email_thread_address && (
                      <span className="flex items-center gap-1 text-blue-400"><Mail size={12} /> {(claim as any).email_thread_address}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400 shrink-0">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{claim.category}</span>
                  {expanded === claim.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
            </div>

            {expanded === claim.id && (
              <div className="border-t border-gray-100">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Paperclip size={12} /> Photos and Documents
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
                            <img src={getAttachmentUrl(att)} alt={att.file_name} className="w-8 h-8 object-cover rounded" />
                          ) : <FileText size={14} />}
                          <span className="max-w-32 truncate">{att.file_name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <MessageSquare size={12} /> Claim Timeline
                  </h4>
                  <div className="relative">
                    {/* Build timeline events */}
                    {(() => {
                      const events: Array<{ type: string; date: string; label: string; sub?: string; color: string }> = []
                      events.push({ type: 'filed', date: claim.created_at, label: 'Claim Filed', sub: claim.title, color: 'bg-blue-500' })
                      const msgs = threads[claim.id] || []
                      msgs.forEach(msg => {
                        events.push({
                          type: 'message',
                          date: msg.sent_at,
                          label: msg.direction === 'outbound' ? 'You sent a message' : 'Builder replied',
                          sub: (msg.body || '').slice(0, 100) + ((msg.body || '').length > 100 ? '...' : ''),
                          color: msg.direction === 'outbound' ? 'bg-blue-400' : 'bg-green-500',
                        })
                      })
                      if ((claim as any).first_response_at) {
                        events.push({ type: 'responded', date: (claim as any).first_response_at, label: 'Builder First Response', color: 'bg-green-500' })
                      }
                      if ((claim as any).resolved_at) {
                        events.push({ type: 'resolved', date: (claim as any).resolved_at, label: 'Claim Resolved', color: 'bg-emerald-500' })
                      }
                      if (['resolved','closed'].includes(claim.status) && !(claim as any).resolved_at) {
                        events.push({ type: 'resolved', date: claim.created_at, label: claim.status === 'closed' ? 'Claim Closed' : 'Claim Resolved', color: 'bg-emerald-500' })
                      }
                      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      return (
                        <div className="space-y-0">
                          {events.map((ev, i) => (
                            <div key={i} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${ev.color}`} />
                                {i < events.length - 1 && <div className="w-px flex-1 bg-gray-200 my-0.5" style={{ minHeight: '20px' }} />}
                              </div>
                              <div className={`pb-3 flex-1 ${i === events.length - 1 ? '' : ''}`}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-xs font-semibold ${ev.type === 'filed' ? 'text-blue-700' : ev.type === 'resolved' ? 'text-emerald-700' : ev.color.includes('green') ? 'text-green-700' : 'text-blue-600'}`}>
                                    {ev.label}
                                  </span>
                                  <span className="text-[10px] text-gray-400 shrink-0">
                                    {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {ev.sub && (
                                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{ev.sub}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {events.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No activity yet.</p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100">
                  {!(claim as any).builder_email ? (
                    <p className="text-sm text-gray-400 italic flex items-center gap-2"><Mail size={14} /> No builder email on this claim</p>
                  ) : (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">
                        Send to: <span className="font-medium text-gray-700">{(claim as any).builder_email}</span>
                        {(claim as any).email_thread_address && <span className="ml-2 text-blue-400">via {(claim as any).email_thread_address}</span>}
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
