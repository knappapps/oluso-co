const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const payload = JSON.parse(event.body || '{}')
    const { from, to, subject, text, html, headers, messageId } = payload

    if (!to || !from) {
      return { statusCode: 400, body: 'Missing required fields' }
    }

    const toAddresses = Array.isArray(to) ? to : [to]
    const claimEmail = toAddresses.find(function(addr) { return addr.includes('@mail.oluso.co') })
    
    if (!claimEmail) {
      return { statusCode: 200, body: 'Not a claim email, ignoring' }
    }

    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id, status, first_response_at')
      .eq('email_thread_address', claimEmail)
      .single()

    if (claimError || !claim) {
      return { statusCode: 200, body: 'Claim not found, ignoring' }
    }

    const inReplyTo = (headers && (headers['in-reply-to'] || headers['In-Reply-To'])) || null

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

    const updates = { status: 'in_progress' }
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
