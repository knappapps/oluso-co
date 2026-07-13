import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0d9488 100%)',
          fontFamily: 'sans-serif',
          padding: '80px 90px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color: '#2563eb' }}>O</div>
          </div>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: 'white' }}>Oluso Blog</div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            maxWidth: 950,
          }}
        >
          Homeowner Resources
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 20,
            maxWidth: 900,
          }}
        >
          Guides, insights, and strategies for navigating builder warranty claims.
        </div>
      </div>
    ),
    { ...size }
  )
}
