import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASS

  // 環境変数が未設定なら認証をスキップ（開発時など）
  if (!user || !pass) return NextResponse.next()

  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6))
      const idx = decoded.indexOf(':')
      const u = decoded.slice(0, idx)
      const p = decoded.slice(idx + 1)
      if (u === user && p === pass) {
        return NextResponse.next()
      }
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Praise App", charset="UTF-8"',
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|mp3|wav|woff|woff2)$).*)',
  ],
}
