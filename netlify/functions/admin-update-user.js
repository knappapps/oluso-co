// admin-update-user.js
// Netlify function to update a user's profile fields (name, role, city, state, builder_name, community_name).
// Auth: Authorization: Bearer <supabase-access-token> — verified against users.role = 'admin' via service key.
// POST only. Returns { success, data, error }.
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type'
  }
}

async function verifyAdmin(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  // Get user from token
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false
  // Check role = admin in users table
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()
  return profile && profile.role === 'admin'
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ success: false, error: 'Method Not Allowed' }) }
  }

  const isAdmin = await verifyAdmin(event.headers['authorization'] || event.headers['Authorization'])
  if (!isAdmin) {
    return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ success: false, error: 'Unauthorized' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch (e) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ success: false, error: 'Invalid JSON body' }) }
  }

  const { userId, name, role, city, state, builder_name, community_name } = body
  if (!userId) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ success: false, error: 'userId is required' }) }
  }

  // Only allow known fields
  const ALLOWED_ROLES = ['user', 'builder', 'admin']
  const updates = {}
  if (name !== undefined) updates.name = name
  if (role !== undefined) {
    if (!ALLOWED_ROLES.includes(role)) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ success: false, error: 'Invalid role value' }) }
    }
    updates.role = role
  }
  if (city !== undefined) updates.city = city
  if (state !== undefined) updates.state = state
  if (builder_name !== undefined) updates.builder_name = builder_name
  if (community_name !== undefined) updates.community_name = community_name

  if (Object.keys(updates).length === 0) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ success: false, error: 'No updatable fields provided' }) }
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('admin-update-user error:', error)
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ success: false, error: error.message }) }
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ success: true, data: { user: data } })
  }
}
