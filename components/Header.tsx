'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Shield } from 'lucide-react'

interface HeaderProps { currentPage?: string }

export default function Header({ currentPage }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  const nav = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Community', href: '/community' },
    { label: 'Resources', href: '/resources' },
    { label: 'Blog', href: '/blog' },
    { label: 'Profile', href: '/profile' },
  ]

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-navy-600 text-lg tracking-tight">OLUSO<span className="text-amber-500">.CO</span></span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {nav.map(n => (
                <Link key={n.href} href={n.href} className={`text-sm font-medium transition-colors ${currentPage===n.label ? 'text-teal-600' : 'text-gray-600 hover:text-teal-600'}`}>{n.label}</Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => setLoginOpen(true)} className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">Log in</button>
              <button onClick={() => setSignupOpen(true)} className="btn-amber text-sm py-2 px-4">Get started free</button>
            </div>
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
            {nav.map(n => <Link key={n.href} href={n.href} className="text-sm font-medium text-gray-700 hover:text-teal-600" onClick={() => setMobileOpen(false)}>{n.label}</Link>)}
            <button onClick={() => { setLoginOpen(true); setMobileOpen(false) }} className="text-sm font-medium text-gray-600 text-left">Log in</button>
            <button onClick={() => { setSignupOpen(true); setMobileOpen(false) }} className="btn-amber text-sm py-2 px-4 text-center">Get started free</button>
          </div>
        )}
      </header>

      {loginOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setLoginOpen(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy-600">Welcome back</h2>
              <button onClick={() => setLoginOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-gray-500 mb-6">Pick up where you left off. Your records are right here.</p>
            <div className="flex flex-col gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="you@example.com" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <Link href="/dashboard" className="w-full bg-navy-600 text-white font-semibold py-3 rounded-lg text-center block hover:bg-navy-700 transition-colors">Sign in</Link>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">New to Oluso? <button onClick={() => { setLoginOpen(false); setSignupOpen(true) }} className="text-teal-600 font-medium hover:underline">Create an account</button></p>
          </div>
        </div>
      )}

      {signupOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSignupOpen(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy-600">Start your record</h2>
              <button onClick={() => setSignupOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-gray-500 mb-6">Two minutes to set up. Built for the long haul of warranty paperwork.</p>
            <div className="flex flex-col gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Your name</label><input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Marisol Chen" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="you@example.com" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" /><p className="text-xs text-gray-400 mt-1">At least 8 characters.</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Home address <span className="text-gray-400">(optional)</span></label><input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="2418 Magnolia Ridge Dr." /></div>
              <Link href="/dashboard" className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg text-center block hover:bg-amber-600 transition-colors">Create account</Link>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <button onClick={() => { setSignupOpen(false); setLoginOpen(true) }} className="text-teal-600 font-medium hover:underline">Sign in</button></p>
          </div>
        </div>
      )}
    </>
  )
}