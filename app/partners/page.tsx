import type { Metadata } from 'next'
import PartnersClient from './PartnersClient'

export const metadata: Metadata = {
  title: 'Partners | Oluso',
  description: 'Home inspectors and real estate agents who help new homeowners document and resolve builder warranty claims from day one.',
  alternates: { canonical: '/partners' },
}

export default function PartnersPage() {
  return <PartnersClient />
}
