// Soft-deletes a claim owned by the requesting user.
// This never hard-deletes the row -- it sets deleted_at so a full
// record is retained permanently on the backend for audit purposes.
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
    const { claim_id, user_id } = JSON.parse(event.body || '{}')

  if (!claim_id || !user_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'claim_id and user_id required' }) }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('claims')
    .select('id, user_id, deleted_at')
    .eq('id', claim_id)
    .single()

  if (fetchError || !existing) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Claim not found' }) }
  }

  if (existing.user_id !== user_id) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Not authorized to delete this claim' }) }
  }

  if (existing.deleted_at) {
    return { statusCode: 200, body: JSON.stringify({ success: true, alreadyDeleted: true }) }
  }

  const { error: updateError } = await supabase
    .from('claims')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', claim_id)

  if (updateError) {
    return { statusCode: 500, body: JSON.stringify({ error: updateError.message }) }
  }

  await supabase
    .from('claim_events')
    .insert({
      claim_id: claim_id,
      event_type: 'claim_deleted',
      event_data: {},
      actor: user_id,
      created_at: new Date().toISOString()
    })

  return { statusCode: 200, body: JSON.stringify({ success: true }) }

  } catch (err) {
    console.error('delete-claim error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
