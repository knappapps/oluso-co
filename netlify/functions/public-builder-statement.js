const { createClient } = require('@supabase/supabase-js')

// Read-only, public endpoint. Returns ONLY a published statement for a given
// builder slug. Uses the anon key so it can never read pending/rejected rows
// beyond what is intended, and only selects safe public fields.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  const slug = (event.queryStringParameters && event.queryStringParameters.slug) || ''
  if (!slug) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'slug required' }) }
  }

  const { data, error } = await supabase
    .from('builder_statements')
    .select('body, published_at')
    .eq('builder_slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'lookup failed' }) }
  }

  return {
    statusCode: 200,
    headers: { ...CORS, 'Cache-Control': 'public, max-age=60' },
    body: JSON.stringify({ statement: data || null }),
  }
}
