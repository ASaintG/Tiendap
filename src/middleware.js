import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const publicRoutes = ['/', '/login', '/producto', '/categoria']

export async function middleware(req) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))

  if (isPublic) return res

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, options) { res.cookies.set(name, value, { ...options, httpOnly: true, secure: true, sameSite: 'lax' }) },
        remove(name, options) { res.cookies.set(name, '', { ...options, httpOnly: true, secure: true, sameSite: 'lax', maxAge: 0 }) },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
