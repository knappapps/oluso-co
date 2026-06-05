// Item 2: receive-email (inbound-email.js)
// Handles inbound email webhooks from Resend → auto-logs builder replies,
// computes response timestamps, updates claim status, fires claim_events.
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
              return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
      }

      const toAddresses = Array.isArray(to) ? to : [to]
          const claimEmail = toAddresses.find(function(addr) { return addr.includes('@mail.oluso.co') })

      if (!claimEmail) {
              return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'Not a claim email' }) }
      }

      // Look up claim by email_thread_address
      const { data: claim, error: claimError } = await supabase
            .from('claims')
            .select('id, status, user_id, builder_id, first_response_at, builder_response_count, created_at')
            .eq('email_thread_address', claimEmail)
            .single()

      if (claimError || !claim) {
              console.error('Claim lookup failed:', claimError)
              return { statusCode: 404, body: JSON.stringify({ error: 'Claim not found for: ' + claimEmail }) }
      }

      const now = new Date().toISOString()
          const isFirstResponse = !claim.first_response_at

      // Insert message record
      const { data: message } = await supabase
            .from('messages')
            .insert({
                      claim_id: claim.id,
                      direction: 'inbound',
                      from_email: from,
                      to_email: claimEmail,
                      subject: subject || '(no subject)',
                      body: text || html || '',
                      sent_at: now
            })
            .select()
            .single()

      // Update claim: increment response count, set first_response_at if needed,
      // update status to in_progress if currently open or awaiting_builder
      const claimUpdates = {
              builder_response_count: (claim.builder_response_count || 0) + 1,
              updated_at: now
      }

      if (isFirstResponse) {
              claimUpdates.first_response_at = now
      }

      if (claim.status === 'open' || claim.status === 'awaiting_builder') {
              claimUpdates.status = 'in_progress'
      }

      await supabase
            .from('claims')
            .update(claimUpdates)
            .eq('id', claim.id)

      // Log claim_event
      const eventData = {
              from_email: from,
              subject: subject || '',
              message_id: message ? message.id : null,
              is_first_response: isFirstResponse
      }

      await supabase
            .from('claim_events')
            .insert({
                      claim_id: claim.id,
                      event_type: isFirstResponse ? 'builder_first_reply' : 'builder_replied',
                      event_data: eventData,
                      actor: from,
                      created_at: now
            })

      // Refresh builder scores materialized view (fire-and-forget)
      supabase.rpc('refresh_builder_scores').then(function() {}).catch(function() {})

      return {
              statusCode: 200,
              body: JSON.stringify({
                        success: true,
                        claim_id: claim.id,
                        is_first_response: isFirstResponse,
                        new_response_count: (claim.builder_response_count || 0) + 1
              })
      }

    } catch (err) {
          console.error('inbound-email error:', err)
          return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
    }
}
