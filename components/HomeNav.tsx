'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Menu, X } from 'lucide-react'

export default function HomeNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="relative border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
        <Home size={22} />
        Oluso
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-700">Blog</Link>
        <Link href="/login" className="text-sm text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Sign in</Link>
        <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">Get started free</Link>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg px-4 py-4 space-y-1 z-50">
          <Link href="/blog" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Blog</Link>
          <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
            <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Sign in</Link>
            <Link href="/signup" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm bg-blue-600 text-white font-medium mt-1 text-center">Get started free</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
