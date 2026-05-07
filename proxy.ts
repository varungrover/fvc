import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isPublicPath, getAllowedPrefixForRole, getLandingForRole } from '@/lib/auth/routing'
import type { Role } from '@/lib/types'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js)$/)
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: use getUser() not getSession() — getUser() validates the JWT server-side
  const { data: { user } } = await supabase.auth.getUser()

  // Public paths — always allow through (after session refresh)
  if (isPublicPath(pathname)) {
    // If logged-in user hits /login, redirect to their landing
    if (pathname === '/login' && user) {
      const role = user.app_metadata?.role as Role | undefined
      const landing = role ? getLandingForRole(role) : undefined
      if (landing) {
        return NextResponse.redirect(new URL(landing, request.url))
      }
    }
    return supabaseResponse
  }

  // Protected path — no session: redirect to /login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = user.app_metadata?.role as Role | undefined
  const mustChangePassword = user.app_metadata?.must_change_password as boolean | undefined

  // Force password change before any other protected route
  if (mustChangePassword && pathname !== '/change-password') {
    return NextResponse.redirect(new URL('/change-password', request.url))
  }

  // Wrong role prefix — redirect to correct landing (ignore /api routes)
  if (role && !pathname.startsWith('/api')) {
    const allowed = getAllowedPrefixForRole(role)
    const landing = getLandingForRole(role)
    if (allowed && landing && !pathname.startsWith(allowed) && pathname !== '/change-password') {
      return NextResponse.redirect(new URL(landing, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
