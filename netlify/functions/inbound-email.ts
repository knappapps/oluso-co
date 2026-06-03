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
    // Resend sends inbound email data as JSON
    const payload = JSON.parse(event.body || '{}')
    
    // Extract email data from Resend webhook payload
    const {
      from,
      to,
      subject,
      text,
      html,
      headers,
      messageId
    } = payload

    if (!to || !from) {
      return { statusCode: 400, body: 'Missing required fields' }
    }

    // The "to" address is like claim-XXXXXXXX@mail.oluso.co
    // Extract the claim thread address
    const toAddresses = Array.isArray(to) ? to : [to]
    const claimEmail = toAddresses.find((addr: string) => addr.includes('@mail.oluso.co'))
    
    if (!claimEmail) {
      console.log('No claim email found in to addresses:', toAddresses)
      return { statusCode: 200, body: 'Not a claim email, ignoring' }
    }

    // Find the claim by email_thread_address
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id, status, first_response_at')
      .eq('email_thread_address', claimEmail)
      .single()

    if (claimError || !claim) {
      console.log('Claim not found for:', claimEmail)
      return { statusCode: 200, body: 'Claim not found, ignoring' }
    }

    // Get In-Reply-To header
    const inReplyTo = headers?.['in-reply-to'] || headers?.['In-Reply-To'] || null

    // Store inbound message
    await supabase.from('messages').insert({
      claim_id: claim.id,
      direction: 'inbound',
      from_email: from,
      to_email: claimEmail,
      subject: subject || '(no subject)',
      body: text || html || '(no body)',
      message_id: messageId,
      in_reply_to: inReplyTo
    })

    // Update claim: set first_response_at if this is first builder reply
    const updates: Record<string, string> = {
      status: 'in_progress'
    }
    if (!claim.first_response_at) {
      updates.first_response_at = new Date().toISOString()
    }

    await supabase.from('claims').update(updates).eq('id', claim.id)

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, claim_id: claim.id })
    }
  } catch (err) {
    console.error('inbound-email error:', err)
    return { statusCode: 500, body: String(err) }
  }
}
