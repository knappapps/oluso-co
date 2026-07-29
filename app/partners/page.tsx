import Header from '@/components/Header'
import Link from 'next/link'
import { ShieldCheck, ClipboardCheck, Home, MapPin, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partners | Oluso',
  description: 'Home inspectors and real estate agents who help new homeowners document and resolve builder warranty claims from day one.',
  alternates: { canonical: '/partners' },
}

// NOTE: Inspection partners are real Utah businesses identified as prospects.
// They are listed as "pending" until each confirms the partnership.
// Agent partners are placeholder examples to be replaced as agents sign on.
const inspectionPartners = [
  { name: 'Owl Home Inspection', area: 'South Jordan, Herriman, Lehi', status: 'Pending' },
  { name: 'Forward Inspections', area: 'Salt Lake, Utah & Wasatch Counties', status: 'Pending' },
  { name: 'Boley Home Inspections', area: 'Salt Lake, American Fork', status: 'Pending' },
  { name: 'Checkpoint Inspection Services', area: 'All of Utah County', status: 'Pending' },
  { name: 'Universal Home & Property Inspections', area: 'Salt Lake City', status: 'Pending' },
  { name: 'Elkhorn Inspection Services', area: 'Park City, Heber, Salt Lake Valley', status: 'Pending' },
]

const agentPartners = [
  { name: 'Your Agency Name', area: 'Example: Utah County new construction', status: 'Example' },
  { name: 'Example Realty Group', area: 'Example: Salt Lake Valley', status: 'Example' },
  { name: 'Add Your Brokerage Here', area: 'Example: Wasatch Front', status: 'Example' },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header publicNav />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-3">
              <ShieldCheck size={16} /> Partners
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Oluso Partners</h1>
            <p className="text-gray-500">
              Trusted home inspectors and real estate agents who help new homeowners document and resolve builder warranty claims from the day they move in.
            </p>
          </div>

          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck size={18} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Inspection Partners</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Inspectors who recommend Oluso to clients at booking, so homeowners document all year and arrive at their 11-month warranty inspection with an organized record.
            </p>
            <div className="space-y-4">
              {inspectionPartners.map(p => (
                <div key={p.name} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {p.area}
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full whitespace-nowrap">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Home size={18} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Agent Partners</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              New-construction buyer's agents who share Oluso with clients at closing as a free resource for protecting their new home. The profiles below are placeholders to be replaced as agents join.
            </p>
            <div className="space-y-4">
              {agentPartners.map(p => (
                <div key={p.name} className="bg-white rounded-2xl border border-dashed border-gray-300 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-400">{p.name}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {p.area}
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-gray-50 text-gray-400 px-2 py-1 rounded-full whitespace-nowrap">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-blue-50 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Become a partner</h2>
            <p className="text-gray-600 text-sm mb-4 max-w-xl mx-auto">
              Are you a home inspector or real estate agent who works with new-construction buyers? Partner with Oluso to give your clients a free tool for documenting warranty issues, and get featured here. No fees, no rev-share.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700">
              Get in touch <ArrowRight size={14} />
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}
