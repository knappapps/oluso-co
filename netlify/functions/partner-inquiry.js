const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const NL = String.fromCharCode(10)

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { name, email, org, role, area, message } = JSON.parse(event.body || '{}')

    if (!name || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'name and email required' }) }
    }

    const lines = [
      'A new partner inquiry came in from the Oluso website.',
      '',
      'Name: ' + name,
      'Email: ' + email,
      'Organization: ' + (org || 'N/A'),
      'Role: ' + (role || 'N/A'),
      'Service area: ' + (area || 'N/A'),
      '',
      'Message:',
      (message || 'N/A')
    ]

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Oluso <notifications@mail.oluso.co>',
      to: ['support@oluso.co'],
      reply_to: email,
      subject: 'New partner inquiry: ' + name + (org ? ' (' + org + ')' : ''),
      text: lines.join(NL)
    })

    if (emailError) {
      console.error('Resend error (partner-inquiry):', emailError)
      return { statusCode: 500, body: JSON.stringify({ error: emailError.message }) }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, email_id: emailData && emailData.id }) }
  } catch (err) {
    console.error('partner-inquiry error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
