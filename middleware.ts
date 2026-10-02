import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PREFIXES = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/mcp/', '/_next', '/favicon']
const COOKIE_NAME = 'conduit_token'

function isPublic(pathname: string): boolean {
  if (pathname === '/') return true
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.CONDUIT_JWT_SECRET ?? ''))
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authed = await hasValidSession(req)

  if ((pathname === '/login' || pathname === '/register') && authed) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isPublic(pathname)) return NextResponse.next()

  if (!authed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
