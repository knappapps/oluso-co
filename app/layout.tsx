import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Oluso Home — Warranty Claim Tracker',
  description: 'Track home warranty claims with clarity and leverage. Built for new homeowners.',
  themeColor: '#0D9488',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}