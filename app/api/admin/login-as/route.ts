import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route generates a magic link for any user so an admin can log in as them.
// It is protected by checking the caller's session and admin role before proceeding.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    // Verify the calling session is an admin
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const authHeader = req.headers.get('Authorization') || req.cookies.get('sb-access-token')?.value
    const { data: { user } } = await supabaseAnon.auth.getUser(authHeader || undefined)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check the caller is an admin in public.users
    const { data: profile } = await supabaseAnon
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
    }

    // Generate a magic link using the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })
    if (error || !data?.properties?.action_link) {
      return NextResponse.json({ error: error?.message || 'Failed to generate link' }, { status: 500 })
    }

    return NextResponse.json({ url: data.properties.action_link })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
