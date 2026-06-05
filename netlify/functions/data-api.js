// Item 10: data-api.js
// Read-only API for data buyers (law firms, real estate cos, insurance, regulators).
// Authentication: API key in X-API-Key header, validated against data_subscriptions table.
// Endpoints (via ?endpoint= query param):
//   builders       - All builder scores + aggregate stats
//   market-report  - Geographic aggregates by state/city
//   defect-trends  - Category/severity breakdown over time
//   builder/:id    - Individual builder deep-dive
const { createClient } = require('@supabase/supabase-js')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  async function validateApiKey(apiKey) {
    if (!apiKey) return null
        const { data } = await supabase
          .from('data_subscriptions')
          .select('id, buyer_name, buyer_email, plan, state_filter, active')
          .eq('api_key', apiKey)
          .eq('active', true)
          .single()

        if (data) {
          // Update last_used_at (fire-and-forget)
          supabase
                  .from('data_subscriptions')
                  .update({ last_used_at: new Date().toISOString() })
                  .eq('api_key', apiKey)
                  .then(function() {})
                  .catch(function() {})
            }

    return data
}

function corsHeaders() {
    return {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'X-API-Key, Content-Type'
    }
}

exports.handler = async function(event) {
    if (event.httpMethod === 'OPTIONS') {
          return { statusCode: 200, headers: corsHeaders(), body: '' }
    }

    if (event.httpMethod !== 'GET') {
          return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method Not Allowed' }) }
    }

    // Authenticate
    const apiKey = event.headers['x-api-key'] || event.queryStringParameters['api_key']
        const subscription = await validateApiKey(apiKey)

        if (!subscription) {
          return {
                  statusCode: 401,
                  headers: corsHeaders(),
                  body: JSON.stringify({
                            error: 'Unauthorized',
                            message: 'Valid API key required. Contact data@oluso.co to get access.'
                  })
          }
    }

    const endpoint = event.queryStringParameters['endpoint'] || 'builders'
        const stateFilter = event.queryStringParameters['state'] || subscription.state_filter
        const limit = Math.min(parseInt(event.queryStringParameters['limit'] || '100'), 500)

        try {
          // ── ENDPOINT: builders ────────────────────────────────────────────────
          if (endpoint === 'builders') {
                  const { data: scores, error } = await supabase
                            .from('builder_scores')
                            .select('id, name, state, total_claims, critical_claims, resolved_claims, resolve_rate_pct, avg_days_to_first_response, avg_days_to_resolution, accountability_score, refreshed_at')
                            .order('total_claims', { ascending: false })
                            .limit(limit)

                          if (error) throw error

                          const filtered = stateFilter
                            ? scores.filter(function(s) { return s.state && s.state.toUpperCase() === stateFilter.toUpperCase() })
                            : scores

                          return {
                            statusCode: 200,
                            headers: corsHeaders(),
                            body: JSON.stringify({
                                        meta: {
                                                      endpoint: 'builders',
                                                      total: filtered.length,
                                                      state_filter: stateFilter || null,
                                                      generated_at: new Date().toISOString(),
                                                      buyer: subscription.buyer_name
                                        },
                                                    data: filtered
                            })
                  }
          }

          // ── ENDPOINT: market-report ───────────────────────────────────────────
          if (endpoint === 'market-report') {
                  let claimsQuery = supabase
                            .from('claims')
                            .select('id, category, severity, status, created_at, days_to_first_response, days_to_resolution, reopen_count, users!inner(city, state, zip), builders(name, state)')

                          const { data: rawClaims } = await claimsQuery

                          const claims = rawClaims || []
                          const filtered = stateFilter
                            ? claims.filter(function(c) { return c.users && c.users.state && c.users.state.toUpperCase() === stateFilter.toUpperCase() })
                            : claims

                                    // Aggregate by state
                                    const byState = {}
                  filtered.forEach(function(c) {
                            const s = (c.users && c.users.state) || 'Unknown'
                                      if (!byState[s]) byState[s] = { state: s, total_claims: 0, critical: 0, resolved: 0, response_times: [], resolution_times: [] }
                            byState[s].total_claims++
                                      if (c.severity === 'critical') byState[s].critical++
                                      if (c.status === 'resolved' || c.status === 'closed') byState[s].resolved++
                                      if (c.days_to_first_response != null) byState[s].response_times.push(c.days_to_first_response)
                                      if (c.days_to_resolution != null) byState[s].resolution_times.push(c.days_to_resolution)
                              })

                          const stateReport = Object.values(byState).map(function(s) {
                            const avgResp = s.response_times.length > 0
                                        ? Math.round(s.response_times.reduce(function(a, b) { return a + b }, 0) / s.response_times.length * 10) / 10
                                        : null
                                                  const avgRes = s.resolution_times.length > 0
                                                    ? Math.round(s.resolution_times.reduce(function(a, b) { return a + b }, 0) / s.resolution_times.length * 10) / 10
                                                    : null
                                                              return {
                                                                state: s.state,
                                                                total_claims: s.total_claims,
                                                                critical_claims: s.critical,
                                                                resolved_claims: s.resolved,
                                                                resolve_rate_pct: s.total_claims > 0 ? Math.round((s.resolved / s.total_claims) * 100) : null,
                                                                avg_days_to_first_response: avgResp,
                                                                avg_days_to_resolution: avgRes
                                                    }
                  }).sort(function(a, b) { return b.total_claims - a.total_claims })

                          return {
                            statusCode: 200,
                            headers: corsHeaders(),
                            body: JSON.stringify({
                                        meta: {
                                                      endpoint: 'market-report',
                                                      total_claims_in_dataset: filtered.length,
                                                      states_represented: stateReport.length,
                                                      state_filter: stateFilter || null,
                                                      generated_at: new Date().toISOString(),
                                                      buyer: subscription.buyer_name
                                        },
                                                    data: stateReport
                            })
                  }
          }

          // ── ENDPOINT: defect-trends ───────────────────────────────────────────
          if (endpoint === 'defect-trends') {
                  const { data: rawClaims } = await supabase
                            .from('claims')
                            .select('id, category, severity, status, created_at, defect_location, warranty_year')
                            .order('created_at', { ascending: false })
                            .limit(limit)

                          const claims = rawClaims || []

                          // Category breakdown
                          const catMap = {}
                  claims.forEach(function(c) {
                            const cat = c.category || 'other'
                                      if (!catMap[cat]) catMap[cat] = { category: cat, total: 0, critical: 0, high: 0, resolved: 0 }
                            catMap[cat].total++
                                      if (c.severity === 'critical') catMap[cat].critical++
                                      if (c.severity === 'high') catMap[cat].high++
                                      if (c.status === 'resolved' || c.status === 'closed') catMap[cat].resolved++
                              })

                          // Monthly trend (last 12 months)
                          const monthMap = {}
                  const now = new Date()
                          claims.forEach(function(c) {
                                    const d = new Date(c.created_at)
                                              const monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
                                              if (monthsDiff <= 12) {
                                                const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
                                                            if (!monthMap[key]) monthMap[key] = { month: key, claims: 0, critical: 0 }
                                                monthMap[key].claims++
                                                            if (c.severity === 'critical') monthMap[key].critical++
                                                  }
                          })

                          return {
                            statusCode: 200,
                            headers: corsHeaders(),
                            body: JSON.stringify({
                                        meta: {
                                                      endpoint: 'defect-trends',
                                                      total_claims: claims.length,
                                                      generated_at: new Date().toISOString(),
                                                      buyer: subscription.buyer_name
                                        },
                                                    category_breakdown: Object.values(catMap).sort(function(a, b) { return b.total - a.total }),
                                        monthly_trend: Object.values(monthMap).sort(function(a, b) { return a.month.localeCompare(b.month) })
                            })
                  }
          }

          return {
                  statusCode: 400,
                  headers: corsHeaders(),
                  body: JSON.stringify({
                            error: 'Unknown endpoint',
                            available_endpoints: ['builders', 'market-report', 'defect-trends'],
                                      usage: 'GET /.netlify/functions/data-api?endpoint=builders&api_key=YOUR_KEY'
                  })
          }

    } catch (err) {
          console.error('data-api error:', err)
                return {
                  statusCode: 500,
                  headers: corsHeaders(),
                  body: JSON.stringify({ error: 'Internal server error', details: String(err) })
          }
    }
}
