'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Check } from 'lucide-react'
import Header from '@/components/Header'

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

const plans = [
  {
        name: 'Free',
        price: '$0',
        period: '/month',
        description: 'Get started with basic warranty tracking.',
        features: [
                'Up to 3 active claims',
                'Email claim submission',
                'Basic claim tracking',
                'Community access',
              ],
        cta: 'Current Plan',
        planKey: 'free',
        highlight: false,
  },
  {
        name: 'Basic',
        price: '$4.99',
        period: '/month',
        description: 'More claims, priority support, and fewer ads.',
        features: [
                'Up to 10 active claims',
                'Email claim submission',
                'Full claim tracking',
                'Community access',
                'Warranty checklist',
              ],
        cta: 'Upgrade to Basic',
        planKey: 'basic',
        highlight: false,
  },
  {
        name: 'Pro',
        price: '$9.99',
        period: '/month',
        description: 'Everything you need — ad-free and unlimited.',
        features: [
                'Unlimited active claims',
                'Email claim submission',
                'Full claim tracking',
                'Community access',
                'Warranty checklist',
                'No ads',
                'Priority support',
              ],
        cta: 'Upgrade to Pro',
        planKey: 'pro',
        highlight: true,
  },
  ]

export default function PricingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [currentPlan, setCurrentPlan] = useState<string>('free')
    const [userId, setUserId] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('upgrade') === 'cancelled') {
                setCancelled(true)
                router.replace('/pricing')
        }

                async function loadUser() {
                        const { data: { session } } = await supabase.auth.getSession()
                        if (!session) return
                        setEmail(session.user.email ?? null)

          const { data: profile } = await supabase
                          .from('users')
                          .select('id, plan')
                          .eq('auth_id', session.user.id)
                          .single()
                        if (profile) {
                                  setUserId(profile.id)
                                  setCurrentPlan(profile.plan ?? 'free')
                        }
                }
        loadUser()
  }, [router])

  async function handleUpgrade(planKey: string) {
        if (planKey !== 'pro') return
        if (!userId || !email) {
                router.push('/login?redirectTo=/pricing')
                return
        }
        setLoading(planKey)
        try {
                const res = await fetch('/.netlify/functions/create-checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ user_id: userId, email }),
                })
                const data = await res.json()
                if (data.url) {
                          window.location.href = data.url
                } else {
                          alert('Something went wrong. Please try again.')
                }
        } catch {
                alert('Something went wrong. Please try again.')
        } finally {
                setLoading(null)
        }
  }

  return (
        <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="pt-24 pb-16 px-4">
                      <div className="max-w-5xl mx-auto">
                                <div className="text-center mb-12">
                                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
                                            <p className="text-lg text-gray-600">Choose the plan that fits your warranty tracking needs.</p>
                                </div>
                      
                        {cancelled && (
                      <div className="mb-8 max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-yellow-800 text-sm">
                                    Upgrade cancelled. You can upgrade anytime.
                      </div>
                                )}
                      
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                  {plans.map((plan) => {
                        const isCurrentPlan = plan.planKey === currentPlan
                                        const isLoading = loading === plan.planKey
                                          
                                                        return (
                                                                          <div
                                                                                              key={plan.name}
                                                                                              className={`relative rounded-2xl border bg-white shadow-sm flex flex-col ${
                                                                                                                    plan.highlight
                                                                                                                      ? 'border-blue-500 ring-2 ring-blue-500'
                                                                                                                      : 'border-gray-200'
                                                                                                }`}
                                                                                            >
                                                                            {plan.highlight && (
                                                                                                                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                                                                                                        <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                                                                                                                                Most Popular
                                                                                                                                          </span>
                                                                                                                    </div>
                                                                                            )}
                                                                          
                                                                                            <div className="p-8 flex flex-col flex-1">
                                                                                                                <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                                                                                                                <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                                                                                            
                                                                                                                <div className="flex items-end gap-1 mb-6">
                                                                                                                                      <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                                                                                                                      <span className="text-gray-500 mb-1">{plan.period}</span>
                                                                                                                  </div>
                                                                                            
                                                                                                                <ul className="space-y-3 mb-8 flex-1">
                                                                                                                  {plan.features.map((feature) => (
                                                                                                                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                                                                                                                                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                                                                                        {feature}
                                                                                                                        </li>
                                                                                                                    ))}
                                                                                                                  </ul>
                                                                                            
                                                                                              {plan.planKey === 'free' || plan.planKey === 'basic' ? (
                                                                                                                    <button
                                                                                                                                              disabled
                                                                                                                                              className="w-full py-3 rounded-lg font-semibold text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                                                                                            >
                                                                                                                      {isCurrentPlan ? 'Current Plan' : plan.cta}
                                                                                                                      </button>
                                                                                                                  ) : (
                                                                                                                    <button
                                                                                                                                              onClick={() => handleUpgrade(plan.planKey)}
                                                                                                                                              disabled={isCurrentPlan || isLoading}
                                                                                                                                              className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                                                                                                                                                                          isCurrentPlan
                                                                                                                                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                                                                                                                            : plan.highlight
                                                                                                                                                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                                                                                                                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                                                                                                                                                }`}
                                                                                                                                            >
                                                                                                                      {isCurrentPlan ? 'Current Plan' : isLoading ? 'Redirecting\u2026' : plan.cta}
                                                                                                                      </button>
                                                                                                                )}
                                                                                              </div>
                                                                          </div>
                                                                        )
                                  })}
                                </div>
                      
                                <p className="text-center text-gray-400 text-xs mt-10">
                                            Payments are processed securely by Stripe. Cancel anytime.
                                </p>
                      </div>
              </main>
        </div>
      )
}
