import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const alt = 'Oluso community warranty stories'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
let totalClaims = 0
let resolvedCount = 0

try {
const supabaseAdmin = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_KEY!
)
const { data } = await supabaseAdmin
.from('claims')
.select('id, status')
.eq('public_story', true)
totalClaims = (data || []).length
resolvedCount = (data || []).filter((s: any) => ['resolved', 'closed'].includes(s.status)).length
} catch (e) {
// Fall back to a branded card without stats if the fetch fails
}

const resolutionRate = totalClaims > 0 ? Math.round((resolvedCount / totalClaims) * 100) : 0

return new ImageResponse(
(
<div
style={{
height: '100%',
width: '100%',
display: 'flex',
flexDirection: 'column',
backgroundColor: '#1e3a8a',
backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
padding: '72px',
fontFamily: 'sans-serif',
}}
>
<div style={{ display: 'flex', alignItems: 'center', color: '#bfdbfe', fontSize: 34, fontWeight: 700 }}>
Oluso
</div>
<div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
<div style={{ display: 'flex', color: '#bfdbfe', fontSize: 30, marginBottom: 8 }}>
Real warranty experiences from your neighbors
</div>
<div style={{ display: 'flex', color: 'white', fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
Community Warranty Stories
</div>
</div>
<div style={{ display: 'flex', gap: '28px', marginTop: 48 }}>
<div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '24px 36px' }}>
<div style={{ display: 'flex', color: 'white', fontSize: 56, fontWeight: 800 }}>{String(totalClaims)}</div>
<div style={{ display: 'flex', color: '#bfdbfe', fontSize: 26 }}>Stories shared</div>
</div>
<div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '24px 36px' }}>
<div style={{ display: 'flex', color: 'white', fontSize: 56, fontWeight: 800 }}>{resolutionRate + '%'}</div>
<div style={{ display: 'flex', color: '#bfdbfe', fontSize: 26 }}>Resolved</div>
</div>
<div style={{ display: 'flex', alignItems: 'center', color: '#dbeafe', fontSize: 28, marginLeft: 'auto' }}>
Compare builder accountability
</div>
</div>
</div>
),
{ ...size }
)
}
