'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Mail, MessageSquare } from 'lucide-react'

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

export default function ReferralShareCard({ referralCode, builderName, referralCount }: { referralCode: string; builderName?: string; referralCount?: number }) {
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
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-sm">
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
