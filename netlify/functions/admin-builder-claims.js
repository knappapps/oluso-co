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

// Verify the caller is an authenticated admin (same pattern as other admin functions).
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
  const isAdmin = await verifyAdmin(authHeader)
  if (!isAdmin) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  let payload = {}
  try {
    payload = event.body ? JSON.parse(event.body) : {}
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const action = payload.action || 'list'

  // LIST: return claims, newest first, optionally filtered by status.
  if (action === 'list') {
    let query = supabase
      .from('builder_claims')
      .select('*')
      .order('created_at', { ascending: false })
    if (payload.status) query = query.eq('status', payload.status)
    const { data, error } = await query
    if (error) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Could not load claims' }) }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ claims: data }) }
  }

  // REVIEW: approve or reject a single claim.
  if (action === 'review') {
    const id = payload.id
    const status = payload.status
    if (!id || (status !== 'approved' && status !== 'rejected' && status !== 'pending')) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'id and valid status required' }) }
    }
    const { data, error } = await supabase
      .from('builder_claims')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: payload.reviewed_by || 'admin',
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Could not update claim' }) }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ claim: data }) }
  }

  return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action' }) }
}
