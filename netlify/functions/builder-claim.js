const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const NL = String.fromCharCode(10)

// Fields captured on the builder profile-claim form.
const FIELDS = [
  ['contact_name', 'Name'],
  ['work_email', 'Work email'],
  ['company', 'Company / builder'],
  ['role', 'Role / title'],
  ['builder_slug', 'Builder profile'],
  ['annual_closings', 'Annual closings / communities'],
  ['message', 'Message'],
]

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let data
  try {
    data = JSON.parse(event.body || '{}')
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const contact_name = (data.contact_name || data.name || '').trim()
  const work_email = (data.work_email || data.email || '').trim()
  const company = (data.company || '').trim()
  const builder_slug = (data.builder_slug || '').trim()

  if (!contact_name || !work_email || !company) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Name, work email and company are required.' }),
    }
  }

  const record = {
    builder_slug: builder_slug || null,
    contact_name,
    work_email,
    company,
    role: (data.role || '').trim() || null,
    annual_closings: (data.annual_closings || '').trim() || null,
    message: (data.message || '').trim() || null,
    status: 'pending',
  }

  // Best-effort: link to an existing builder row by slug.
  if (builder_slug) {
    try {
      const { data: b } = await supabase
        .from('builders')
        .select('id')
        .eq('slug', builder_slug)
        .maybeSingle()
      if (b && b.id) record.builder_id = b.id
    } catch (e) {
      // non-fatal
    }
  }

  const { data: inserted, error: dbError } = await supabase
    .from('builder_claims')
    .insert(record)
    .select('id')
    .single()

  if (dbError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not save your request. Please try again.' }),
    }
  }

  // Notify support. Email is best-effort; the record is already saved.
  try {
    const rows = FIELDS.map(([k, label]) => {
      const v = record[k] || data[k] || ''
      return label + ': ' + v
    }).join(NL)
    const body =
      'A builder has requested to claim their profile.' + NL + NL +
      rows + NL + NL +
      'Claim ID: ' + inserted.id + NL +
      'Review it in the admin area under Builder claims.'
    await resend.emails.send({
      from: 'Oluso <notifications@mail.oluso.co>',
      to: ['support@oluso.co'],
      reply_to: work_email,
      subject: 'New builder profile claim' + (company ? ' — ' + company : ''),
      text: body,
    })
  } catch (e) {
    // Email failure should not fail the request; the claim is stored.
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, id: inserted.id }),
  }
}
