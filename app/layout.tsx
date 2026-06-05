import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Oluso - Home Warranty Claim Tracker',
    description: 'Track home warranty claims with clarity and leverage. Built for new homeowners.',
    metadataBase: new URL('https://oluso.co'),
    themeColor: '#0D9488',
    openGraph: {
          siteName: 'Oluso',
          type: 'website',
    },
    twitter: {
          card: 'summary_large_image',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
          <html lang="en">
                <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>body>
          </html>html>
        )
}</html>
