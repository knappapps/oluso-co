const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const { user_id, email } = JSON.parse(event.body || '{}')
    if (!user_id || !email) return { statusCode: 400, body: JSON.stringify({ error: 'user_id and email required' }) }

    // Reuse existing Stripe customer if present
    const { data: profile } = await supabase.from('users').select('stripe_customer_id').eq('id', user_id).single()
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: user_id } })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user_id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID_PRO, quantity: 1 }],
      success_url: 'https://oluso.co/dashboard?upgrade=success',
      cancel_url: 'https://oluso.co/pricing?upgrade=cancelled',
      metadata: { supabase_user_id: user_id }
    })

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) }
  } catch (err) {
    console.error('create-checkout error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}