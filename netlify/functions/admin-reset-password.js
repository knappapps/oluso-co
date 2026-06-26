// admin-reset-password.js
// Netlify function to send a password reset email for a given user.
// Uses supabase.auth.admin.generateLink (recovery) + Resend to email the link.
// Auth: Authorization: Bearer <supabase-access-token> — verified against users.role = 'admin' via service key.
// POST only. Returns { success, message, error }.
const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

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

  const { email, name } = body
  if (!email) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ success: false, error: 'email is required' }) }
  }

  // Generate password recovery link using admin API
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  })

  if (linkError || !linkData || !linkData.properties || !linkData.properties.action_link) {
    console.error('generateLink error:', linkError)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, error: linkError ? linkError.message : 'Failed to generate reset link' })
    }
  }

  const resetUrl = linkData.properties.action_link
  const displayName = name || email

  // Send via Resend
  const { error: emailError } = await resend.emails.send({
    from: 'Oluso <no-reply@mail.oluso.co>',
    to: [email],
    subject: 'Reset your Oluso password',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #1e293b; margin-top: 0;">Password Reset</h2>
        <p style="color: #475569;">Hi ${displayName},</p>
        <p style="color: #475569;">An admin has requested a password reset for your Oluso account. Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">Reset My Password</a>
        <p style="color: #94a3b8; font-size: 13px;">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #94a3b8; font-size: 13px;">— The Oluso Team</p>
      </div>
    `
  })

  if (emailError) {
    console.error('Resend error:', emailError)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, error: 'Failed to send email: ' + emailError.message })
    }
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ success: true, data: { message: 'Password reset email sent to ' + email } })
  }
}
