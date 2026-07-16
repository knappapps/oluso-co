import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import HomeNav from '@/components/HomeNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
title: 'Our Story — Oluso',
description: 'Why Oluso exists: a personal new-home warranty battle, and the tool built to help homeowners hold builders accountable.',
alternates: {
canonical: '/about',
},
openGraph: {
title: 'Our Story — Oluso',
description: 'Why Oluso exists: a personal new-home warranty battle, and the tool built to help homeowners hold builders accountable.',
url: 'https://oluso.co/about',
siteName: 'Oluso',
type: 'website',
},
}

export default function AboutPage() {
return (
<div className="min-h-screen bg-white">
<HomeNav />

<section className="max-w-3xl mx-auto px-6 pt-20 pb-24">
<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-10 leading-tight text-center">
Why I Built Oluso
</h1>

<div className="text-gray-600 space-y-6 leading-relaxed text-lg">
<p>
I'm Ryan Knapp, the founder of Oluso — and this app exists because of my own new-build warranty experience with David Weekley Homes.
</p>

<p>
From the day we closed, our home had a running list of issues: a basement foundation wall problem serious enough to eventually require a signed release agreement, stucco that had to be repainted, drainage and grading defects that affected our lot and our neighbors', and interior moisture concerns that needed an independent infrared inspection to confirm. Almost every time, my first conversations with the builder's team followed the same pattern — minimization, and a reluctance to take ownership without a fight.
</p>

<p>
Over the following two to three years, the list kept growing: our hardwood floors were replaced, our kitchen countertops were replaced three separate times, our driveway was torn out and repoured, and our entire backyard was redone — on top of discovering that many areas of the house weren't even built square to 90 degrees. It was a constant, grinding process that took a real toll well beyond the cost of the repairs — the kind of prolonged stress that follows you into work and home life, during years that should have been far easier than they were.
</p>

<p>
What actually moved things forward wasn't politeness or patience. It was bringing in independent experts to verify what was wrong so it couldn't be waved away, and eventually going around the standard warranty contacts entirely — using LinkedIn and ZoomInfo to identify and reach David Weekley executives directly, since the normal channels weren't resolving anything. When even that stalled, I looked seriously at registering davidweekleyreviews.com to make our experience visible to other buyers. That got attention fast, and our remaining open items finally got fixed.
</p>

<p>
Most homeowners don't have the time, the persistence, or the know-how to escalate that way — to track every claim, find the right decision-maker, and apply the right pressure at the right time. I built Oluso so you don't have to reinvent that playbook yourself. It's the system I wish I'd had from day one: a place to log every claim, keep the paper trail builders can't dispute, and know when and how to push.
</p>
</div>

<div className="flex justify-center pt-12">
<Link href="/signup" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
Start tracking for free <ChevronRight size={16} />
</Link>
</div>
</section>
</div>
)
}
