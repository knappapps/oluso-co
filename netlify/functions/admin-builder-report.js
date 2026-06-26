// admin-builder-report.js
// Netlify function returning a rollup of builder metrics.
// Optional filters: start_date, end_date (ISO strings), warranty_year (int or 'all').
// Auth: Authorization: Bearer <supabase-access-token> — verified against users.role = 'admin' via service key.
// POST only. Returns { success, data: { builders: [...] }, error }.
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
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return false
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

  const { start_date, end_date, warranty_year } = body

  try {
    const { data: buildersRaw, error: buildersErr } = await supabase
      .from('builders')
      .select('id, name')
      .order('name')
    if (buildersErr) throw buildersErr

    let claimsQuery = supabase
      .from('claims')
      .select('id, builder_id, user_id, title, category, severity, status, created_at, resolved_at, days_to_first_response, warranty_year, users!inner(city, state)')

    if (start_date) claimsQuery = claimsQuery.gte('created_at', start_date)
    if (end_date) claimsQuery = claimsQuery.lte('created_at', end_date)
    if (warranty_year && warranty_year !== 'all') {
      claimsQuery = claimsQuery.eq('warranty_year', parseInt(warranty_year, 10))
    }

    const { data: claimsRaw, error: claimsErr } = await claimsQuery
    if (claimsErr) throw claimsErr

    const claims = claimsRaw || []

    const { data: scoresRaw } = await supabase
      .from('builder_scores')
      .select('name, accountability_score')

    const scoresByName = {}
    if (scoresRaw) {
      scoresRaw.forEach(function(s) { scoresByName[s.name] = s })
    }

    const rollup = (buildersRaw || []).map(function(b) {
      const bClaims = claims.filter(function(c) { return c.builder_id === b.id })
      const total = bClaims.length
      const statusCounts = { open: 0, in_progress: 0, awaiting_builder: 0, resolved: 0, closed: 0, escalated: 0 }
      const catCounts = { structural: 0, water: 0, electrical: 0, hvac: 0, plumbing: 0, cosmetic: 0, landscaping: 0, other: 0 }
      let critCount = 0, highCount = 0
      let respSum = 0, respCount = 0
      let resSum = 0, resCount = 0
      const uniqueUsers = {}

      bClaims.forEach(function(c) {
        if (statusCounts[c.status] !== undefined) statusCounts[c.status]++
        if (catCounts[c.category] !== undefined) catCounts[c.category]++
        if (c.severity === 'critical') critCount++
        if (c.severity === 'high') highCount++
        if (c.days_to_first_response != null) { respSum += c.days_to_first_response; respCount++ }
        if (c.resolved_at && c.created_at) {
          var d = (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / 86400000
          if (d >= 0) { resSum += d; resCount++ }
        }
        if (c.user_id) uniqueUsers[c.user_id] = 1
      })

      var resolvedTotal = statusCounts.resolved + statusCounts.closed
      var resolveRate = total > 0 ? Math.round((resolvedTotal / total) * 100) : 0
      var avgResp = respCount > 0 ? Math.round(respSum / respCount * 10) / 10 : null
      var avgRes = resCount > 0 ? Math.round(resSum / resCount * 10) / 10 : null
      var score = scoresByName[b.name]

      return {
        builder_id: b.id,
        builder_name: b.name,
        total_claims: total,
        open: statusCounts.open,
        in_progress: statusCounts.in_progress,
        awaiting_builder: statusCounts.awaiting_builder,
        resolved: statusCounts.resolved,
        closed: statusCounts.closed,
        escalated: statusCounts.escalated,
        resolve_rate: resolveRate,
        avg_days_to_first_response: avgResp,
        avg_days_to_resolution: avgRes,
        critical_claims: critCount,
        high_claims: highCount,
        structural: catCounts.structural,
        water: catCounts.water,
        electrical: catCounts.electrical,
        hvac: catCounts.hvac,
        plumbing: catCounts.plumbing,
        cosmetic: catCounts.cosmetic,
        landscaping: catCounts.landscaping,
        other: catCounts.other,
        accountability_score: score ? score.accountability_score : null,
        unique_users: Object.keys(uniqueUsers).length,
        claims: bClaims.map(function(c) {
          return {
            id: c.id,
            title: c.title || '',
            category: c.category || '',
            severity: c.severity || '',
            status: c.status || '',
            city: (c.users && c.users.city) || '',
            state: (c.users && c.users.state) || '',
            warranty_year: c.warranty_year,
            days_to_first_response: c.days_to_first_response,
            created_at: c.created_at
          }
        })
      }
    })

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: true,
        data: {
          builders: rollup,
          total_claims: claims.length,
          generated_at: new Date().toISOString()
        }
      })
    }
  } catch (err) {
    console.error('admin-builder-report error:', err)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, error: String(err) })
    }
  }
}
