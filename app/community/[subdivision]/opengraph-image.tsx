import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const alt = 'Oluso community warranty data'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function slugToName(slug: string): string {
return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default async function Image({ params }: { params: { subdivision: string } }) {
const subdivisionName = slugToName(params.subdivision)

let totalClaims = 0
let resolvedCount = 0
let builderName: string | null = null

try {
const supabaseAdmin = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_KEY!
)
const { data } = await supabaseAdmin
.from('claims')
.select('id, status, users!inner(community_name, builder_name)')
.eq('public_story', true)
.ilike('users.community_name', subdivisionName)
totalClaims = (data || []).length
resolvedCount = (data || []).filter((s: any) => ['resolved', 'closed'].includes(s.status)).length
builderName = totalClaims > 0 ? (data as any)[0].users?.builder_name : null
} catch (e) {
// If data fetch fails, fall back to a branded card without stats
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
Community warranty data
</div>
<div style={{ display: 'flex', color: 'white', fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
{subdivisionName}
</div>
{builderName ? (
<div style={{ display: 'flex', color: '#93c5fd', fontSize: 32, marginTop: 12 }}>
Built by {builderName}
</div>
) : null}
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
Hold your builder accountable
</div>
</div>
</div>
),
{ ...size }
)
}
