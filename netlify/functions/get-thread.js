const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

exports.handler = async function(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const claim_id = event.queryStringParameters && event.queryStringParameters.claim_id

  if (!claim_id || claim_id === 'list') {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [] }) }
  }

  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('claim_id', claim_id)
      .order('sent_at', { ascending: true })

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages || [] })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
