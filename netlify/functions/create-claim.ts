import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { 
      user_id, 
      builder_id,
      title, 
      description, 
      category, 
      severity,
      builder_email
    } = JSON.parse(event.body || '{}')

    if (!title) {
      return { statusCode: 400, body: JSON.stringify({ error: 'title required' }) }
    }

    // Create the claim first to get an ID
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        user_id: user_id || null,
        builder_id: builder_id || null,
        title,
        description,
        category: category || 'other',
        severity: severity || 'medium',
        builder_email: builder_email || null,
        status: 'open'
      })
      .select()
      .single()

    if (claimError || !claim) {
      return { statusCode: 500, body: JSON.stringify({ error: claimError?.message || 'Failed to create claim' }) }
    }

    // Generate unique email thread address using claim ID
    const shortId = claim.id.replace(/-/g, '').slice(0, 12)
    const emailAddress = `claim-${shortId}@mail.oluso.co`

    // Update with email thread address
    await supabase
      .from('claims')
      .update({ email_thread_address: emailAddress })
      .eq('id', claim.id)

    return {
      statusCode: 201,
      body: JSON.stringify({ 
        success: true, 
        claim: { ...claim, email_thread_address: emailAddress }
      })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
