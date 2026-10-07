import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE, AUTH_MAX_AGE, authToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASS
  const body = await request.json().catch(() => ({}))

  if (!user || !pass || body.user !== user || body.pass !== pass) {
    return NextResponse.json({ error: 'ユーザー名かパスワードが違います' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(AUTH_COOKIE, await authToken(user, pass), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_MAX_AGE,
  })
  return res
}
