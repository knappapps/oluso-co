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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0d9488 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 96,
            height: 96,
            borderRadius: 24,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 36,
          }}
        >
          <div style={{ fontSize: 52, fontWeight: 800, color: '#2563eb' }}>O</div>
        </div>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, color: 'white', letterSpacing: -2 }}>
          Oluso
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: 'rgba(255,255,255,0.88)',
            marginTop: 20,
            maxWidth: 820,
            textAlign: 'center',
          }}
        >
          Track Your New Home Warranty Claims
        </div>
      </div>
    ),
    { ...size }
  )
}
