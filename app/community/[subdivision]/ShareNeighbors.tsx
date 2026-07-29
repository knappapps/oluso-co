'use client'

import { useState } from 'react'
import { Share2, Facebook, Copy, Check, Mail, Users } from 'lucide-react'

interface Props {
subdivisionName: string
builderName?: string | null
totalClaims: number
resolutionRate: number
shareUrl: string
}

export default function ShareNeighbors({ subdivisionName, builderName, totalClaims, resolutionRate, shareUrl }: Props) {
const [copied, setCopied] = useState(false)

const builderPhrase = builderName ? ' built by ' + builderName : ''
const shareText = 'Neighbors in ' + subdivisionName + ': homeowners in our community' + builderPhrase + ' are logging their builder warranty claims in one place. ' + totalClaims + ' stories shared so far, ' + resolutionRate + '% resolved. If you have a warranty issue, adding it here helps all of us hold the builder accountable. Free, no names, no addresses:'
const fullShare = shareText + ' ' + shareUrl

function openShare(url: string) {
window.open(url, '_blank', 'noopener,noreferrer,width=640,height=640')
}

async function copyShare() {
try {
await navigator.clipboard.writeText(fullShare)
setCopied(true)
setTimeout(() => setCopied(false), 2500)
} catch {
setCopied(false)
}
}

return (
<div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 mb-10 text-white">
<div className="flex items-center gap-2 mb-2">
<Share2 size={20} />
<h2 className="text-lg font-bold">Share this with your {subdivisionName} neighbors</h2>
</div>
<p className="text-blue-100 text-sm max-w-2xl mb-5">
The more neighbors who document their claims, the stronger the record — and the more accountable the builder. Drop this into your neighborhood or "Residents of {subdivisionName}" Facebook or Nextdoor group.
</p>
<div className="bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-blue-50 mb-4 leading-relaxed">
{shareText} <span className="underline">{shareUrl}</span>
</div>
<div className="flex flex-wrap gap-2">
<button
onClick={() => openShare('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl) + '&quote=' + encodeURIComponent(shareText))}
className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
>
<Facebook size={15} /> Facebook
</button>
<button
onClick={() => openShare('https://www.nextdoor.com/sharekit/?source=oluso&body=' + encodeURIComponent(fullShare))}
className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
>
<Users size={15} /> Nextdoor
</button>
<button
onClick={() => openShare('mailto:?subject=' + encodeURIComponent('Warranty stories from ' + subdivisionName) + '&body=' + encodeURIComponent(fullShare))}
className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
>
<Mail size={15} /> Email
</button>
<button
onClick={copyShare}
className="inline-flex items-center gap-1.5 bg-blue-800/40 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800/60 transition-colors"
>
{copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy post</>}
</button>
</div>
</div>
)
}
