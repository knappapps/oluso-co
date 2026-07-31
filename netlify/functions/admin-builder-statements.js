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

async function verifyAdmin(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  return !!profile && profile.role === 'admin'
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  const authHeader = event.headers['authorization'] || event.headers['Authorization']
  if (!(await verifyAdmin(authHeader))) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  let payload = {}
  try {
    payload = event.body ? JSON.parse(event.body) : {}
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const action = payload.action || 'list-statements'

  // LIST all statements (optionally by status), joined with builder company/slug.
  if (action === 'list-statements') {
    let q = supabase
      .from('builder_statements')
      .select('*, builders(company, slug)')
      .order('updated_at', { ascending: false })
    if (payload.status) q = q.eq('status', payload.status)
    const { data, error } = await q
    if (error) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Could not load statements' }) }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ statements: data }) }
  }

  // REVIEW a statement: publish or reject.
  if (action === 'review-statement') {
    const id = payload.id
    const status = payload.status
    if (!id || (status !== 'published' && status !== 'rejected' && status !== 'pending')) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'id and valid status required' }) }
    }
    const patch = {
      status,
      reviewed_by: payload.reviewed_by || 'admin',
      updated_at: new Date().toISOString(),
    }
    if (status === 'published') patch.published_at = new Date().toISOString()
    const { data, error } = await supabase
      .from('builder_statements')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Could not update statement' }) }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ statement: data }) }
  }

  // LINK an existing user to a builder (grants builder role). Never creates an
  // account: the user must already exist (found by email).
  if (action === 'link-user') {
    const email = (payload.email || '').trim().toLowerCase()
    const builderId = payload.builder_id
    if (!email || !builderId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'email and builder_id required' }) }
    }
    const { data: existing } = await supabase
      .from('users')
      .select('id, email, role, builder_id')
      .ilike('email', email)
      .maybeSingle()
    if (!existing) {
      return {
        statusCode: 404,
        headers: CORS,
        body: JSON.stringify({ error: 'No account with that email. Ask the builder to sign up first.' }),
      }
    }
    const { data, error } = await supabase
      .from('users')
      .update({ builder_id: builderId, role: 'builder' })
      .eq('id', existing.id)
      .select('id, email, role, builder_id')
      .single()
    if (error) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Could not link user' }) }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ user: data }) }
  }

  // UNLINK a user from a builder (revoke builder access).
  if (action === 'unlink-user') {
    const userId = payload.user_id
    if (!userId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'user_id required' }) }
    }
    const { data, error } = await supabase
      .from('users')
      .update({ builder_id: null, role: 'user' })
      .eq('id', userId)
      .select('id, email, role, builder_id')
      .single()
    if (error) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Could not unlink user' }) }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ user: data }) }
  }

  return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action' }) }
}
