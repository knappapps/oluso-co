import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware - just pass through; AuthGuard handles client-side auth
// Edge middleware without @supabase/ssr to avoid TypeScript complexity
const PROTECTED = ['/dashboard', '/community', '/resources', '/profile', '/admin']

export function middleware(request: NextRequest) {
  // Let Next.js handle routing normally
  // AuthGuard components handle auth checks on the client
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|\.netlify).*)']
}