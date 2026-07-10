// Item 3: Enhanced create-claim.js with structured data fields & event logging
// Tier 3: Added builder notification email when a claim names a builder
const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const {
      user_id,
      builder_id,
      title,
      description,
      category,
      severity,
      builder_email,
      builder_name,
      // Structured fields (Item 3)
      defect_location,
      defect_sub_category,
      estimated_repair_cost,
      warranty_year,
      public_story
    } = JSON.parse(event.body || '{}')

    if (!title) {
      return { statusCode: 400, body: JSON.stringify({ error: 'title required' }) }
    }

    // Look up builder_id from builders table if not provided
    let resolvedBuilderId = builder_id || null
    if (!resolvedBuilderId && builder_name) {
      const { data: builderRow } = await supabase
        .from('builders')
        .select('id')
        .ilike('name', builder_name)
        .single()
      if (builderRow) resolvedBuilderId = builderRow.id
    }

    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        user_id: user_id || null,
        builder_id: resolvedBuilderId,
        title,
        description,
        category: category || 'other',
        severity: severity || 'medium',
        builder_email: builder_email || null,
        status: 'open',
        public_story: public_story || false,
        // Structured data fields
        defect_location: defect_location || null,
        defect_sub_category: defect_sub_category || null,
        estimated_repair_cost: estimated_repair_cost || null,
        warranty_year: warranty_year || null,
        builder_response_count: 0,
        reopen_count: 0
      })
      .select()
      .single()

    if (claimError || !claim) {
      return { statusCode: 500, body: JSON.stringify({ error: (claimError && claimError.message) || 'Failed to create claim' }) }
    }

    // Generate unique inbound email address
    const shortId = claim.id.replace(/-/g, '').slice(0, 12)
    const emailAddress = 'claim-' + shortId + '@mail.oluso.co'

    await supabase
      .from('claims')
      .update({ email_thread_address: emailAddress })
      .eq('id', claim.id)

    // Log claim_created event
    await supabase
      .from('claim_events')
      .insert({
        claim_id: claim.id,
        event_type: 'claim_created',
        event_data: {
          category: category || 'other',
          severity: severity || 'medium',
          defect_location: defect_location || null,
          warranty_year: warranty_year || null
        },
        actor: user_id || 'user',
        created_at: new Date().toISOString()
      })

    // Send confirmation email to builder (warranty department) if builder_email is on the claim
    if (builder_email) {
      resend.emails.send({
        from: 'Oluso Warranty <noreply@mail.oluso.co>',
        to: builder_email,
        replyTo: emailAddress,
        subject: '[Warranty Claim] ' + title,
        text: [
          'A new warranty claim has been filed.',
          '',
          'Claim: ' + title,
          'Category: ' + (category || 'other'),
          'Severity: ' + (severity || 'medium'),
          'Description: ' + (description || ''),
          '',
          'Reply directly to this email to respond to the homeowner.',
          'Your reply will be automatically recorded and timestamped.',
          '',
          '— Oluso Warranty Platform'
        ].join('\n')
      }).catch(function(e) { console.error('email send error:', e) })
    }

    // -------------------------------------------------------
    // Tier 3: Notify the builder user account (role=builder)
    // Look up a user with role='builder' whose builder_name
    // matches the claim's builder_name and send them an email.
    // -------------------------------------------------------
    if (builder_name) {
      supabase
        .from('users')
        .select('email, name')
        .eq('role', 'builder')
        .ilike('builder_name', builder_name)
        .single()
        .then(function(result) {
          const builderUser = result.data
          if (!builderUser || !builderUser.email) return
          const greeting = builderUser.name ? ('Hello ' + builderUser.name + ',') : 'Hello,'
          resend.emails.send({
            from: 'Oluso <noreply@mail.oluso.co>',
            to: builderUser.email,
            subject: 'New warranty claim filed against ' + builder_name,
            text: [
              greeting,
              '',
              'A homeowner has filed a new warranty claim against ' + builder_name + '.',
              '',
              'Claim title: ' + title,
              'Category: ' + (category || 'other'),
              'Severity: ' + (severity || 'medium'),
              defect_location ? ('Location: ' + defect_location) : '',
              '',
              'Log in to your Builder Dashboard to review and respond:',
              'https://oluso.co/builders/dashboard',
              '',
              '— Oluso Warranty Platform'
            ].filter(function(l) { return l !== null }).join('\n')
          }).catch(function(e) { console.error('builder notify error:', e) })
        })
        .catch(function(e) { console.error('builder lookup error:', e) })
    }

    // Refresh builder scores (fire-and-forget)
    Promise.resolve(supabase.rpc('refresh_builder_scores')).catch(function() {})

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        claim: Object.assign({}, claim, { email_thread_address: emailAddress })
      })
    }

  } catch (err) {
    console.error('create-claim error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
