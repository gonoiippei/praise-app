import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE, authToken } from '@/lib/auth'

// /api/keep-alive はVercel Cronが叩くためログイン不要にしている
const PUBLIC_PATHS = ['/login', '/api/login', '/api/keep-alive']

export async function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASS

  // 環境変数が未設定なら認証をスキップ（開発時など）
  if (!user || !pass) return NextResponse.next()

  const { pathname, search } = req.nextUrl
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  if (req.cookies.get(AUTH_COOKIE)?.value === (await authToken(user, pass))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = `?next=${encodeURIComponent(pathname + search)}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|mp3|wav|woff|woff2)$).*)',
  ],
}
