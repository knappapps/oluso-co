'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { Building2, Mail, User, Briefcase, BarChart3, MessageSquare, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

export default function BuildersContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [profile, setProfile] = useState('')
  const [scale, setScale] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !email || !company) {
      setError('Please fill in your name, work email, and company.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'builder', name, email, company, role, profile, scale, message }),
      })
      if (!res.ok) throw new Error('Request failed')
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again, or email support@oluso.co directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header publicNav />
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-3"><Building2 size={16} /> For homebuilders</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Register your interest</h1>
            <p className="text-gray-500">Tell us about your company and we will reach out as profile claiming opens up.</p>
          </div>

          {success ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Thanks — we got it</h2>
              <p className="text-gray-500 text-sm mb-6">We will be in touch at the email you provided.</p>
              <Link href="/for-builders" className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700">Back to For Builders <ArrowRight size={14} /></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Your name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Work email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company / builder name</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Homes" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role / title <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={role} onChange={e => setRole(e.target.value)} placeholder="Customer Care Director" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Which builder profile is this about? <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input value={profile} onChange={e => setProfile(e.target.value)} placeholder="Same as company, or a subsidiary / brand" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Approx. annual closings or # of communities <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <BarChart3 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={scale} onChange={e => setScale(e.target.value)} placeholder="e.g. 500 closings / 12 communities" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">What are you interested in? <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400" />
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Tell us what you would like to do with your profile." className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2 flex items-center justify-center gap-2">
                  {loading ? 'Sending…' : 'Register interest'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
