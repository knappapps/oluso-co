// refresh-builder-scores.js
// Netlify scheduled function — runs nightly to refresh the builder_scores materialized view.
// Schedule is defined in netlify.toml: [functions."refresh-builder-scores"] schedule = "0 3 * * *"
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

exports.handler = async function(event) {
  // Allow both scheduled invocations and manual POST triggers
  const isScheduled = event.type === 'scheduled'
  const isManualPost = event.httpMethod === 'POST'
  const isGet = event.httpMethod === 'GET'

  if (!isScheduled && !isManualPost && !isGet) {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // Simple auth check for manual invocations
  if (!isScheduled) {
    const authHeader = event.headers && event.headers.authorization
    const expectedToken = process.env.CRON_SECRET
    if (expectedToken && authHeader !== 'Bearer ' + expectedToken) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }
    }
  }

  try {
    const start = Date.now()

    // Refresh the materialized view using rpc (requires a helper function in Supabase)
    // We call a stored procedure that runs REFRESH MATERIALIZED VIEW CONCURRENTLY builder_scores
    const { error } = await supabase.rpc('refresh_builder_scores')

    if (error) {
      // Fallback: try direct SQL via the REST API (requires service key)
      console.error('rpc error, trying direct:', error.message)
      const response = await fetch(
        process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/rpc/refresh_builder_scores',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
          },
        }
      )
      if (!response.ok) {
        throw new Error('refresh_builder_scores rpc failed: ' + await response.text())
      }
    }

    const elapsed = Date.now() - start
    console.log('builder_scores refreshed in ' + elapsed + 'ms')

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'builder_scores materialized view refreshed',
        elapsed_ms: elapsed,
        triggered_at: new Date().toISOString(),
      })
    }
  } catch (err) {
    console.error('refresh-builder-scores error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) })
    }
  }
}
