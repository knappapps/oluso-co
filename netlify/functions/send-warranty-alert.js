// Item 9: send-warranty-alert.js
// Sends warranty milestone emails via Resend at 90/30/7-day marks.
// Called by WarrantyClock component and can also run as a scheduled job.
const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
    )

    const resend = new Resend(process.env.RESEND_API_KEY)

    const MILESTONE_THRESHOLDS = [90, 30, 7]

    exports.handler = async function(event) {
      if (event.httpMethod !== 'POST') {
          return { statusCode: 405, body: 'Method Not Allowed' }
            }

              try {
                  const { user_id, days_remaining, period_label } = JSON.parse(event.body || '{}')

                      if (!user_id || days_remaining == null) {
                            return { statusCode: 400, body: JSON.stringify({ error: 'user_id and days_remaining required' }) }
                                }

                                    // Check if this is actually a milestone threshold
                                        const isMilestone = MILESTONE_THRESHOLDS.some(function(t) {
                                              return days_remaining <= t && days_remaining > t - 3
                                                  })

                                                      if (!isMilestone) {
                                                            return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'Not a milestone threshold' }) }
                                                                }

                                                                    // Fetch user details
                                                                        const { data: user } = await supabase
                                                                              .from('users')
                                                                                    .select('email, name, warranty_start, warranty_end, builder_name')
                                                                                          .eq('id', user_id)
                                                                                                .single()

                                                                                                    if (!user || !user.email) {
                                                                                                          return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) }
                                                                                                              }
                                                                                                              
                                                                                                                  // Fetch open claims count
                                                                                                                      const { count: openClaims } = await supabase
                                                                                                                            .from('claims')
                                                                                                                                  .select('id', { count: 'exact', head: true })
                                                                                                                                        .eq('user_id', user_id)
                                                                                                                                              .in('status', ['open', 'in_progress', 'awaiting_builder'])
                                                                                                                                              
                                                                                                                                                  const urgency = days_remaining <= 7 ? 'URGENT' : days_remaining <= 30 ? 'Important' : 'Reminder'
                                                                                                                                                  
                                                                                                                                                      const subject = `[${urgency}] ${days_remaining} days left on your ${period_label}`
                                                                                                                                                      
                                                                                                                                                          const body = [
                                                                                                                                                                `Hi ${user.name || 'there'},`,
                                                                                                                                                                      '',
                                                                                                                                                                            `Your ${period_label} expires in ${days_remaining} days.`,
                                                                                                                                                                                  '',
                                                                                                                                                                                        user.builder_name ? `Builder: ${user.builder_name}` : '',
                                                                                                                                                                                              `Warranty end date: ${user.warranty_end}`,
                                                                                                                                                                                                    '',
                                                                                                                                                                                                          openClaims > 0
                                                                                                                                                                                                                  ? `You currently have ${openClaims} open claim${openClaims > 1 ? 's' : ''}. Make sure to follow up before your warranty expires.`
                                                                                                                                                                                                                          : 'You have no open claims. This is a good time to do a walkthrough of your home and document any issues you have not yet filed.',
                                                                                                                                                                                                                                '',
                                                                                                                                                                                                                                      days_remaining <= 30
                                                                                                                                                                                                                                              ? 'With less than a month remaining, now is the time to file any outstanding claims and push for resolution on any pending ones.'
                                                                                                                                                                                                                                                      : 'We recommend doing a thorough inspection of your home and filing any outstanding defects before this deadline.',
                                                                                                                                                                                                                                                            '',
                                                                                                                                                                                                                                                                  'Log in to your Oluso dashboard to review your claims:',
                                                                                                                                                                                                                                                                        'https://oluso.co/dashboard',
                                                                                                                                                                                                                                                                              '',
                                                                                                                                                                                                                                                                                    '— The Oluso Team',
                                                                                                                                                                                                                                                                                          '',
                                                                                                                                                                                                                                                                                                'To stop receiving these alerts, update your notification preferences in your profile.'
                                                                                                                                                                                                                                                                                                    ].filter(function(line) { return line !== undefined && line !== null }).join('\n')
                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                        await resend.emails.send({
                                                                                                                                                                                                                                                                                                              from: 'Oluso Warranty Alerts <alerts@mail.oluso.co>',
                                                                                                                                                                                                                                                                                                                    to: user.email,
                                                                                                                                                                                                                                                                                                                          subject: subject,
                                                                                                                                                                                                                                                                                                                                text: body
                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                        // Log milestone alert event (best-effort, no claim_id available here)
                                                                                                                                                                                                                                                                                                                                            // We log to a general events table if one exists, otherwise skip
                                                                                                                                                                                                                                                                                                                                                console.log('Warranty alert sent:', { user_id, days_remaining, period_label, email: user.email })
                                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                    return {
                                                                                                                                                                                                                                                                                                                                                          statusCode: 200,
                                                                                                                                                                                                                                                                                                                                                                body: JSON.stringify({
                                                                                                                                                                                                                                                                                                                                                                        success: true,
                                                                                                                                                                                                                                                                                                                                                                                email_sent_to: user.email,
                                                                                                                                                                                                                                                                                                                                                                                        days_remaining: days_remaining,
                                                                                                                                                                                                                                                                                                                                                                                                period_label: period_label
                                                                                                                                                                                                                                                                                                                                                                                                      })
                                                                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                                                                                                                            } catch (err) {
                                                                                                                                                                                                                                                                                                                                                                                                                console.error('send-warranty-alert error:', err)
                                                                                                                                                                                                                                                                                                                                                                                                                    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
                                                                                                                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                                                                                                                      }
