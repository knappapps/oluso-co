'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Home, MapPin, Building, Calendar, ChevronRight, CheckCircle } from 'lucide-react'

const STEPS = ['Your Home', 'Your Builder', 'Warranty Dates', 'All Set!']

const BUILDERS = [
    'David Weekley Homes', 'Ivory Homes', 'Woodside Homes', 'Toll Brothers',
    'Lennar Homes', 'KB Home', 'DR Horton', 'Pulte Homes', 'Shea Homes',
    'Taylor Morrison', 'Meritage Homes', 'Century Communities', 'Other'
  ]

const SLUG_TO_BUILDER: Record<string, string> = {
    'david-weekley-homes': 'David Weekley Homes',
    'ivory-homes': 'Ivory Homes',
    'woodside-homes': 'Woodside Homes',
    'toll-brothers': 'Toll Brothers',
    'lennar-homes': 'Lennar Homes',
    'kb-home': 'KB Home',
    'dr-horton': 'DR Horton',
    'pulte-homes': 'Pulte Homes',
    'shea-homes': 'Shea Homes',
    'taylor-morrison': 'Taylor Morrison',
    'meritage-homes': 'Meritage Homes',
    'century-communities': 'Century Communities',
}

function OnboardingInner() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [step, setStep] = useState(0)
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [referralCode, setReferralCode] = useState<string>('')
    const [form, setForm] = useState({
          address: '', city: '', state: '', zip: '',
          builder_name: '', community_name: '', builder_email: '',
          warranty_start: '', warranty_end: '', warranty_year: ''
    })

  useEffect(() => {
        const refCode = searchParams.get('ref') || ''
        const builderSlug = searchParams.get('builder') || ''
        if (refCode) setReferralCode(refCode)
        if (builderSlug && SLUG_TO_BUILDER[builderSlug]) {
                setForm(prev => ({ ...prev, builder_name: SLUG_TO_BUILDER[builderSlug] }))
        }
        supabase.auth.getSession().then(({ data: { session } }) => {
                if (!session) { router.push('/login'); return }
                setUserId(session.user.id)
        })
  }, [router, searchParams])

  function set(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleWarrantyStartChange(value: string) {
        set('warranty_start', value)
        if (value) {
                const year = new Date(value).getFullYear()
                if (!isNaN(year)) set('warranty_year', String(year))
        }
  }

  async function finish() {
        setSaving(true)
        try {
                await supabase.from('users').update({
                          address: form.address,
                          city: form.city,
                          state: form.state,
                          zip: form.zip,
                          builder_name: form.builder_name,
                          community_name: form.community_name,
                          builder_email: form.builder_email || null,
                          warranty_start: form.warranty_start || null,
                          warranty_end: form.warranty_end || null,
                          warranty_year: form.warranty_year ? parseInt(form.warranty_year) : null,
                          referred_by: referralCode || null,
                          onboarding_complete: true
                }).eq('auth_id', userId)

          if (referralCode) {
                    const { data: referrer } = await supabase
                      .from('users').select('id').eq('referral_code', referralCode).single()
                    const { data: self } = await supabase
                      .from('users').select('id').eq('auth_id', userId).single()
                    if (referrer && self) {
                                await supabase.from('referrals').insert({
                                              referrer_user_id: referrer.id,
                                              referee_user_id: self.id,
                                              builder_slug: searchParams.get('builder') || null
                                })
                    }
          }

          router.push('/dashboard')
        } catch (err) {
                console.error(err)
        } finally {
                setSaving(false)
        }
  }

  const input = (field: string, placeholder: string, type = 'text') => (
        <input
                type={type}
                value={(form as any)[field]}
                onChange={e => set(field, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
      )

  return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4 py-12">
              <div className="w-full max-w-lg">
                      <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-2xl">
                                            <Home size={28} /> Oluso
                                </div>
                                <p className="text-gray-500 text-sm mt-1">Let's set up your account</p>
                        {referralCode &&
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-full">
                                    <CheckCircle size={12} /> Referred by a neighbor &mdash; welcome!
                      </div>
                                )}
                      </div>
              
                      <div className="flex items-center gap-2 mb-8">
                        {STEPS.map((s, i) => (
                      <div key={s} className="flex-1 flex flex-col items-center gap-1">
                                    <div className={`w-full h-1.5 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                    <span className={`text-xs ${i === step ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{s}</span>
                      </div>
                    ))}
                      </div>
              
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        {step === 0 && (
                      <div>
                                    <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                      <MapPin size={20} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                                      <h2 className="font-bold text-gray-900">Your home address</h2>
                                                                      <p className="text-xs text-gray-500">We use this to match your community and builder</p>
                                                    </div>
                                    </div>
                                    <div className="space-y-3">
                                      {input('address', 'Street address')}
                                                    <div className="grid grid-cols-2 gap-3">
                                                      {input('city', 'City')}
                                                      {input('state', 'State (e.g. UT)')}
                                                    </div>
                                      {input('zip', 'ZIP code')}
                                    </div>
                      </div>
                                )}
                      
                        {step === 1 && (
                      <div>
                                    <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                                      <Building size={20} className="text-orange-600" />
                                                    </div>
                                                    <div>
                                                                      <h2 className="font-bold text-gray-900">Your homebuilder</h2>
                                                                      <p className="text-xs text-gray-500">Who built your home?</p>
                                                    </div>
                                    </div>
                                    <div className="space-y-3">
                                                    <div>
                                                                      <label className="block text-xs font-medium text-gray-700 mb-1">Builder company</label>
                                                                      <select
                                                                                            value={form.builder_name}
                                                                                            onChange={e => set('builder_name', e.target.value)}
                                                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                          >
                                                                                          <option value="">Select your builder...</option>
                                                                        {BUILDERS.map(b => <option key={b} value={b}>{b}</option>)}
                                                                      </select>
                                                    </div>
                                      {form.builder_name === 'Other' && (
                                          <div>
                                                              <label className="block text-xs font-medium text-gray-700 mb-1">Builder name</label>
                                            {input('builder_name', 'Enter builder name')}
                                          </div>
                                                    )}
                                                    <div>
                                                                      <label className="block text-xs font-medium text-gray-700 mb-1">Community / subdivision name</label>
                                                      {input('community_name', 'e.g. Sage Creek Estates')}
                                                    </div>
                                                    <div>
                                                                      <label className="block text-xs font-medium text-gray-700 mb-1">Builder warranty email (optional)</label>
                                                      {input('builder_email', 'warranty@yourbuilder.com', 'email')}
                                                                      <p className="text-xs text-gray-400 mt-1">Used to pre-fill when you send claims</p>
                                                    </div>
                                    </div>
                      </div>
                                )}
                      
                        {step === 2 && (
                      <div>
                                    <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                                      <Calendar size={20} className="text-green-600" />
                                                    </div>
                                                    <div>
                                                                      <h2 className="font-bold text-gray-900">Warranty period</h2>
                                                                      <p className="text-xs text-gray-500">When does your builder warranty run?</p>
                                                    </div>
                                    </div>
                                    <div className="space-y-4">
                                                    <div>
                                                                      <label className="block text-xs font-medium text-gray-700 mb-1">Warranty start date</label>
                                                                      <input
                                                                                            type="date"
                                                                                            value={form.warranty_start}
                                                                                            onChange={e => handleWarrantyStartChange(e.target.value)}
                                                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                          />
                                                                      <p className="text-xs text-gray-400 mt-1">Usually your closing date or move-in date</p>
                                                    </div>
                                                    <div>
                                                                      <label className="block text-xs font-medium text-gray-700 mb-1">Warranty end date</label>
                                                      {input('warranty_end', '', 'date')}
                                                                      <p className="text-xs text-gray-400 mt-1">Most builders offer 1-year structural warranty</p>
                                                    </div>
                                      {form.warranty_year && (
                                          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                                                              <strong>Warranty year detected:</strong> {form.warranty_year}
                                          </div>
                                                    )}
                                                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                                                                      <strong>Tip:</strong> Check your closing documents or builder warranty booklet for exact dates.
                                                    </div>
                                    </div>
                      </div>
                                )}
                      
                        {step === 3 && (
                      <div className="text-center py-4">
                                    <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h2>
                                    <p className="text-gray-500 text-sm mb-2">Your account is ready. You can now file claims, track builder responses, and build your documentation trail.</p>
                                    <div className="bg-gray-50 rounded-xl p-4 mt-4 text-left text-sm space-y-2">
                                                    <div className="flex justify-between"><span className="text-gray-500">Home</span><span className="font-medium text-gray-800">{form.address}, {form.city}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Builder</span><span className="font-medium text-gray-800">{form.builder_name || 'Not set'}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Community</span><span className="font-medium text-gray-800">{form.community_name || 'Not set'}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Warranty</span><span className="font-medium text-gray-800">{form.warranty_start ? form.warranty_start + ' \u2192 ' + (form.warranty_end || 'TBD') : 'Not set'}</span></div>
                                      {form.warranty_year && (
                                          <div className="flex justify-between"><span className="text-gray-500">Warranty year</span><span className="font-medium text-gray-800">{form.warranty_year}</span></div>
                                                    )}
                                    </div>
                      </div>
                                )}
                      
                                <div className="flex items-center justify-between mt-8">
                                  {step > 0 && step < 3 ? (
                        <button onClick={() => setStep(s => s - 1)} className="text-sm text-gray-500 hover:text-gray-700">
                                        \u2190 Back
                        </button>
                      ) : <div />}
                                  {step < 2 && (
                        <button onClick={() => setStep(s => s + 1)}
                                          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                        Continue <ChevronRight size={16} />
                        </button>
                                            )}
                                  {step === 2 && (
                        <button onClick={() => setStep(3)}
                                          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                        Review & Finish <ChevronRight size={16} />
                        </button>
                                            )}
                                  {step === 3 && (
                        <button onClick={finish} disabled={saving}
                                          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                          {saving ? 'Saving...' : 'Go to my dashboard \u2192'}
                        </button>
                                            )}
                                </div>
                        {step < 3 && (
                      <button onClick={() => setStep(3)} className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-4 mx-auto">
                                    Skip for now
                      </button>
                                )}
                      </div>
              </div>
        </div>
      )
}

export default function OnboardingPage() {
    return (
          <Suspense>
                <OnboardingInner />
          </Suspense>
        )
}</div>
