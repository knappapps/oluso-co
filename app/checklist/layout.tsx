import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Warranty Inspection Checklist | Oluso',
  description: 'A comprehensive warranty inspection checklist for Utah new homeowners. Know exactly what to inspect at 30 days, 11 months, and before your warranty expires.',
  openGraph: {
    title: 'Warranty Inspection Checklist | Oluso',
    description: 'Complete new home warranty inspection checklist — 30-day, 11-month, and annual items.',
    url: 'https://oluso.co/checklist',
    siteName: 'Oluso',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Warranty Inspection Checklist | Oluso' },
}

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
