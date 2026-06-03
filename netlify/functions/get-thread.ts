import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const claim_id = event.queryStringParameters?.claim_id

  if (!claim_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'claim_id required' }) }
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
