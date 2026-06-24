const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

exports.handler = async function(event) {
  const sig = event.headers['stripe-signature']
  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return { statusCode: 400, body: 'Webhook signature verification failed' }
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object
      const userId = session.metadata?.supabase_user_id
      if (userId) {
        await supabase.from('users').update({
          plan: 'pro',
          stripe_subscription_id: session.subscription
        }).eq('id', userId)
      }
    }

    if (stripeEvent.type === 'customer.subscription.updated') {
      const sub = stripeEvent.data.object
      const customer = await stripe.customers.retrieve(sub.customer)
      const userId = customer.metadata?.supabase_user_id
      if (userId) {
        const isActive = sub.status === 'active' || sub.status === 'trialing'
        await supabase.from('users').update({ plan: isActive ? 'pro' : 'basic' }).eq('id', userId)
      }
    }

    if (stripeEvent.type === 'customer.subscription.deleted') {
      const sub = stripeEvent.data.object
      const customer = await stripe.customers.retrieve(sub.customer)
      const userId = customer.metadata?.supabase_user_id
      if (userId) {
        await supabase.from('users').update({ plan: 'free', stripe_subscription_id: null }).eq('id', userId)
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) }
  } catch (err) {
    console.error('stripe-webhook handler error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}