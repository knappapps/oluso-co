'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@/lib/auth'
import { Shield, Lock } from 'lucide-react'
import Link from 'next/link'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const loggedIn = isLoggedIn()
    setAuthed(loggedIn)
    setChecked(true)
    if (!loggedIn) {
      // Don't hard redirect — show the gate UI instead
    }
  }, [])

  if (!checked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-600 mb-2">Sign in required</h1>
          <p className="text-gray-500 mb-8">
            This page is only available to signed-in users. Create a free account or log in to continue.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Go to homepage to sign in
            </Link>
            <Link
              href="/"
              className="w-full border border-gray-200 text-gray-600 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create a free account
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            Your data is private and secure
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
