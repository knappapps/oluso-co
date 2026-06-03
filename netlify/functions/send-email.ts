import type { Handler } from '@netlify/functions'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { claim_id, to_email, subject, body, builder_name, homeowner_name, claim_title } = JSON.parse(event.body || '{}')

    if (!claim_id || !to_email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'claim_id and to_email required' }) }
    }

    // Get the claim to find the thread address
    const { data: claim } = await supabase
      .from('claims')
      .select('email_thread_address, title')
      .eq('id', claim_id)
      .single()

    if (!claim) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Claim not found' }) }
    }

    const fromAddress = claim.email_thread_address || `claim-${claim_id.slice(0, 8)}@mail.oluso.co`
    const emailSubject = subject || `Warranty Claim: ${claim_title || claim.title}`
    const emailBody = body || `Dear ${builder_name || 'Builder'},\n\nA warranty claim has been filed.\n\nPlease respond to this email to communicate directly on this claim.\n\nBest,\n${homeowner_name || 'Homeowner'}`

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Oluso Claims <${fromAddress}>`,
      to: [to_email],
      subject: emailSubject,
      text: emailBody,
      replyTo: fromAddress
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return { statusCode: 500, body: JSON.stringify({ error: emailError.message }) }
    }

    // Store the outbound message in Supabase
    const { error: dbError } = await supabase.from('messages').insert({
      claim_id,
      direction: 'outbound',
      from_email: fromAddress,
      to_email,
      subject: emailSubject,
      body: emailBody,
      message_id: emailData?.id
    })

    if (dbError) {
      console.error('DB error:', dbError)
    }

    // Update claim status to awaiting_builder
    await supabase
      .from('claims')
      .update({ 
        status: 'awaiting_builder',
        email_thread_address: fromAddress,
        builder_email: to_email
      })
      .eq('id', claim_id)

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, email_id: emailData?.id, from: fromAddress })
    }
  } catch (err) {
    console.error('send-email error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
