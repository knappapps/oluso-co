const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const NL = String.fromCharCode(10)

// Config per inquiry type. Each lists which fields to include in the email body.
const TYPES = {
  general: {
    label: 'general inquiry',
    subjectPrefix: 'New general inquiry',
    fields: [
      ['name', 'Name'],
      ['email', 'Email'],
      ['subject', 'Topic'],
      ['message', 'Message'],
    ],
  },
  partner: {
    label: 'partner inquiry',
    subjectPrefix: 'New partner inquiry',
    fields: [
      ['name', 'Name'],
      ['email', 'Email'],
      ['org', 'Organization'],
      ['role', 'Role'],
      ['area', 'Service area'],
      ['message', 'Message'],
    ],
  },
  builder: {
    label: 'builder inquiry',
    subjectPrefix: 'New builder inquiry',
    fields: [
      ['name', 'Name'],
      ['email', 'Work email'],
      ['company', 'Company / builder'],
      ['role', 'Role / title'],
      ['profile', 'Builder profile this is about'],
      ['scale', 'Annual closings / communities'],
      ['message', 'Message'],
    ],
  },
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const data = JSON.parse(event.body || '{}')
    const type = TYPES[data.type] ? data.type : 'general'
    const config = TYPES[type]

    const name = (data.name || '').toString().trim()
    const email = (data.email || '').toString().trim()

    if (!name || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name and email are required.' }) }
    }

    const lines = ['A new ' + config.label + ' came in from the Oluso website.', '']
    for (const [key, label] of config.fields) {
      if (key === 'message') continue
      lines.push(label + ': ' + ((data[key] || '').toString().trim() || 'N/A'))
    }
    lines.push('', 'Message:', (data.message || '').toString().trim() || 'N/A')

    const company = (data.company || data.org || '').toString().trim()
    const subject = config.subjectPrefix + ': ' + name + (company ? ' (' + company + ')' : '')

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Oluso <notifications@mail.oluso.co>',
      to: ['support@oluso.co'],
      reply_to: email,
      subject: subject,
      text: lines.join(NL),
    })

    if (emailError) {
      console.error('Resend error (inquiry):', emailError)
      return { statusCode: 500, body: JSON.stringify({ error: emailError.message }) }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, email_id: emailData && emailData.id }) }
  } catch (err) {
    console.error('inquiry error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
