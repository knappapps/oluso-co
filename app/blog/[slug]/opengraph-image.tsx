import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/blog'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  const title = post?.title ?? 'Oluso Blog'
  const category = post?.category ?? 'Homeowner Resources'

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
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 600,
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.18)',
              padding: '6px 16px',
              borderRadius: 999,
            }}
          >
            {category}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 54,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.8)', marginTop: 28 }}>
          Oluso — Homeowner Resources
        </div>
      </div>
    ),
    { ...size }
  )
}
