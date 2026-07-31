const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const MAX_LEN = 2000

// Resolve the caller and the builder they are allowed to manage.
// A user may manage a builder only if their users.builder_id matches.
async function resolveBuilderUser(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  const { data: profile } = await supabase
    .from('users')
    .select('id, auth_id, role, builder_id')
    .eq('auth_id', user.id)
    .maybeSingle()
  if (!profile || !profile.builder_id) return null
  return profile
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  const authHeader = event.headers['authorization'] || event.headers['Authorization']
  const profile = await resolveBuilderUser(authHeader)
  if (!profile) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  let payload = {}
  try {
    payload = event.body ? JSON.parse(event.body) : {}
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const action = payload.action || 'get'

  // Look up the builder row this user is linked to (for slug + existence).
  const { data: builder } = await supabase
    .from('builders')
    .select('id, slug, company')
    .eq('id', profile.builder_id)
    .maybeSingle()
  if (!builder) {
    return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Linked builder not found' }) }
  }

  // GET: return this builder's current statement (any status), for the editor.
  if (action === 'get') {
    const { data: statement } = await supabase
      .from('builder_statements')
      .select('*')
      .eq('builder_id', builder.id)
      .maybeSingle()
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ builder: { slug: builder.slug, company: builder.company }, statement: statement || null }),
    }
  }

  // SAVE: upsert the statement. Any edit returns it to 'pending' for moderation.
  if (action === 'save') {
    const body = (payload.body || '').toString().trim()
    if (!body) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Statement text is required.' }) }
    }
    if (body.length > MAX_LEN) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Statement is too long.' }) }
    }
    const row = {
      builder_id: builder.id,
      builder_slug: builder.slug,
      body,
      status: 'pending',
      submitted_by: profile.id,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('builder_statements')
      .upsert(row, { onConflict: 'builder_id' })
      .select('*')
      .single()
    if (error) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Could not save statement.' }) }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ statement: data }) }
  }

  return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action' }) }
}
