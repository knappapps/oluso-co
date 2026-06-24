const { Resend } = require('resend')
const { createClient } = require('@supabase/supabase-js')

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }
  try {
    const { claim_id, event_type, builder_from } = JSON.parse(event.body || '{}')
    if (!claim_id) return { statusCode: 400, body: JSON.stringify({ error: 'claim_id required' }) }

    // Load claim + user email
    const { data: claim } = await supabase
      .from('claims')
      .select('id, title, status, category, user_id')
      .eq('id', claim_id)
      .single()
    if (!claim) return { statusCode: 404, body: JSON.stringify({ error: 'Claim not found' }) }

    const { data: user } = await supabase
      .from('users')
      .select('email, name, subscribed_alerts')
      .eq('id', claim.user_id)
      .single()
    if (!user || user.subscribed_alerts === false) {
      return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'User opted out or not found' }) }
    }

    const isFirstReply = event_type === 'builder_first_reply'
    const subject = isFirstReply
      ? `Your builder responded to: ${claim.title}`
      : `New builder message on: ${claim.title}`

    const bodyText = `Hi ${user.name || 'there'},

${isFirstReply ? 'Great news — your builder has responded to your warranty claim.' : 'Your builder sent a new message on your warranty claim.'}

Claim: ${claim.title}
Category: ${claim.category}
Status: ${claim.status.replace(/_/g, ' ')}
${builder_from ? `From: ${builder_from}` : ''}

Log in to view the full message and reply:
https://oluso.co/dashboard

— The Oluso Team
`

    await resend.emails.send({
      from: 'Oluso <notifications@mail.oluso.co>',
      to: [user.email],
      subject,
      text: bodyText,
    })

    // Write to notifications table for the in-app bell
    await supabase.from('notifications').insert({
      user_id: claim.user_id,
      claim_id: claim.id,
      type: event_type,
      message: isFirstReply
        ? `Your builder responded to "${claim.title}"`
        : `New message from builder on "${claim.title}"`,
      read: false,
    })

    return { statusCode: 200, body: JSON.stringify({ success: true }) }
  } catch (err) {
    console.error('notify-user error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
