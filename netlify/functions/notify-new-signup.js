const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { name, email } = JSON.parse(event.body || '{}')

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'email required' }) }
  }

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: 'Oluso <notifications@mail.oluso.co>',
    to: ['support@oluso.co'],
    subject: 'New user signed up: ' + (name || email),
    text: 'A new user just signed up for Oluso.' + String.fromCharCode(10) + String.fromCharCode(10) + 'Name: ' + (name || 'N/A') + String.fromCharCode(10) + 'Email: ' + email
  })

  if (emailError) {
    console.error('Resend error (notify-new-signup):', emailError)
    return { statusCode: 500, body: JSON.stringify({ error: emailError.message }) }
  }

  return { statusCode: 200, body: JSON.stringify({ success: true, email_id: emailData && emailData.id }) }
  } catch (err) {
    console.error('notify-new-signup error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
