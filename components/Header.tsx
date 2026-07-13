'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Home, Menu, X, LogOut, User, LayoutDashboard, BookOpen, Users, HelpCircle, Building2, Bell, ShieldAlert } from 'lucide-react'

interface Notification {
  id: string
  claim_id: string | null
  type: string
  message: string
  read: boolean
  created_at: string
}

export default function Header({ publicNav = false }: { publicNav?: boolean } = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; name?: string; authId?: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ email: session.user.email || '', name: session.user.user_metadata?.name, authId: session.user.id })
        loadNotifications(session.user.id)
        checkAdminRole(session.user.id)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser({ email: session.user.email || '', name: session.user.user_metadata?.name, authId: session.user.id })
        loadNotifications(session.user.id)
        checkAdminRole(session.user.id)
      } else {
        setUser(null)
        setIsAdmin(false)
        setNotifications([])
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close bell dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function checkAdminRole(authId: string) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', authId)
      .single()
    setIsAdmin(profile?.role === 'admin')
  }

  async function loadNotifications(authId: string) {
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authId)
      .single()
    if (!profile) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data || [])
  }

  async function markAllRead() {
    if (!user?.authId) return
    const { data: profile } = await supabase
      .from('users').select('id').eq('auth_id', user.authId).single()
    if (!profile) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const fullNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/builders', label: 'Builders', icon: Building2 },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/community', label: 'Community', icon: Users },
    { href: '/resources', label: 'Resources', icon: HelpCircle },
  ]
  const nav = (publicNav && !user) ? fullNav.filter((item) => item.href === '/blog') : fullNav

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
          <Home size={22} /> Oluso
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon size={15} /> {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/admin' || pathname.startsWith('/admin/') ? 'bg-red-50 text-red-600' : 'text-red-500 hover:bg-red-50'}`}>
              <ShieldAlert size={15} /> Admin
            </Link>
          )}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {/* Notification Bell */}
              <div ref={bellRef} className="relative">
                <button
                  onClick={() => { setBellOpen(v => !v); if (!bellOpen && unreadCount > 0) markAllRead() }}
                  className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-700">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => { markRead(n.id); if (n.claim_id) router.push('/dashboard'); setBellOpen(false) }}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                              <div className={`flex-1 ${n.read ? 'ml-4' : ''}`}>
                                <p className="text-sm text-gray-800">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <Link href="/dashboard" onClick={() => setBellOpen(false)} className="text-xs text-blue-500 hover:text-blue-700">
                        View all claims →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/profile" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                <User size={15} /> {user.name || user.email.split('@')[0]}
              </Link>
              <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Sign in</Link>
              <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">Get started</Link>
            </>
          )}
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg px-4 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${pathname === href ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
              <Icon size={16} /> {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${pathname === '/admin' || pathname.startsWith('/admin/') ? 'bg-red-50 text-red-600' : 'text-red-500 hover:bg-red-50'}`}>
              <ShieldAlert size={16} /> Admin
            </Link>
          )}
          <div className="border-t border-gray-100 pt-3 mt-3">
            {user ? (
              <>
                {notifications.filter(n => !n.read).length > 0 && (
                  <div className="px-3 py-2 mb-1">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Unread notifications</p>
                    {notifications.filter(n => !n.read).slice(0, 3).map(n => (
                      <p key={n.id} className="text-xs text-gray-600 truncate py-0.5">• {n.message}</p>
                    ))}
                    <button onClick={markAllRead} className="text-xs text-blue-500 mt-1">Mark all read</button>
                  </div>
                )}
                <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                  <User size={16} /> {user.name || user.email}
                </Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Sign in</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm bg-blue-600 text-white font-medium mt-1 text-center">Get started free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
