'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { Mail, User, MessageSquare, Tag, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !email || !message) {
      setError('Please fill in your name, email, and message.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general', name, email, subject, message }),
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
            <span className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-3"><Mail size={16} /> Contact us</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Get in touch</h1>
            <p className="text-gray-500">Have a question, some feedback, or need a hand? Send us a note and we will get back to you.</p>
          </div>

          {success ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Thanks — message sent</h2>
              <p className="text-gray-500 text-sm mb-6">We will be in touch at the email you provided.</p>
              <Link href="/" className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700">Back to home <ArrowRight size={14} /></Link>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Topic</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">Select one</option>
                      <option value="General question">General question</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Report a problem">Report a problem</option>
                      <option value="Media / press">Media / press</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400" />
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="How can we help?" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2 flex items-center justify-center gap-2">
                  {loading ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            Are you an inspector or agent? <Link href="/partnerscontact" className="text-blue-600 hover:text-blue-700">Partner with us</Link>. A homebuilder? <Link href="/builderscontact" className="text-blue-600 hover:text-blue-700">Register your interest</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
