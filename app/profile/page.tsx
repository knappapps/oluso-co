'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { User, MapPin, Building, Calendar, Save, CheckCircle, Loader2 } from 'lucide-react'
import ReferralShareCard from '@/components/ReferralShareCard'

const BUILDERS = [
  'David Weekley Homes','Ivory Homes','Woodside Homes','Toll Brothers',
  'Lennar Homes','KB Home','DR Horton','Pulte Homes','Shea Homes',
  'Taylor Morrison','Meritage Homes','Century Communities','Other'
]

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [referralCount, setReferralCount] = useState(0)
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
    builder_name: '', community_name: '', builder_phone: '',
    warranty_start: '', warranty_end: ''
  })

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('users').select('*').eq('auth_id', session.user.id).single()
      if (data) {
        setProfile({
          name: data.name || '',
          email: data.email || session.user.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || '',
          builder_name: data.builder_name || '',
          community_name: data.community_name || '',
          builder_phone: data.builder_phone || '',
          warranty_start: data.warranty_start || '',
          warranty_end: data.warranty_end || ''
        })
        if (data.referral_code) {
          setReferralCode(data.referral_code)
          const { count } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('referred_by', data.referral_code)
          setReferralCount(count || 0)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await supabase.from('users').update({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
        builder_name: profile.builder_name,
        community_name: profile.community_name,
        builder_phone: profile.builder_phone,
        warranty_start: profile.warranty_start || null,
        warranty_end: profile.warranty_end || null
      }).eq('auth_id', session.user.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  function set(field: string, value: string) {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (loading) return (
    <AuthGuard><Header />
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    </AuthGuard>
  )

  const inp = (field: string, placeholder: string, type = 'text') => (
    <input type={type} value={(profile as any)[field]} onChange={e => set(field, e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  )

  return (
    <AuthGuard>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Personal */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><User size={16} className="text-blue-600" /> Personal Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>{inp('name', 'Your name')}</div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={profile.email} disabled
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>{inp('phone', '(801) 555-0100', 'tel')}</div>
              </div>
            </div>

            {/* Home */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={16} className="text-orange-500" /> Home Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Street address</label>{inp('address', '123 Main St')}</div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">City</label>{inp('city', 'Salt Lake City')}</div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">State</label>{inp('state', 'UT')}</div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">ZIP</label>{inp('zip', '84101')}</div>
              </div>
            </div>

            {/* Builder */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Building size={16} className="text-purple-600" /> Builder Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Builder company</label>
                  <select value={profile.builder_name} onChange={e => set('builder_name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select builder...</option>
                    {BUILDERS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Community / subdivision</label>{inp('community_name', 'Sage Creek Estates')}</div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Builder warranty rep phone (optional)</label>{inp('builder_phone', '(801) 555-0100', 'tel')}</div>
              </div>
            </div>

            {/* Warranty */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={16} className="text-green-600" /> Warranty Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Warranty start</label>{inp('warranty_start', '', 'date')}</div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Warranty end</label>{inp('warranty_end', '', 'date')}</div>
              </div>
              {profile.warranty_end && (
                <div className={`mt-4 rounded-lg p-3 text-sm ${new Date(profile.warranty_end) < new Date() ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {new Date(profile.warranty_end) < new Date()
                    ? '⚠️ Your warranty period has ended. Document any remaining issues promptly.'
                    : `✓ Warranty active — expires ${new Date(profile.warranty_end).toLocaleDateString()}`}
                </div>
              )}
            </div>

            {/* Referral */}
            {referralCode && (
              <ReferralShareCard
                referralCode={referralCode}
                builderName={profile.builder_name}
                referralCount={referralCount}
              />
            )}
          </div>
        </div>
      </main>
    </AuthGuard>
  )
}
