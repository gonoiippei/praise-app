'use client'

import { useState } from 'react'
import GlowOrbs from '@/components/GlowOrbs'

// 外部サイトへ飛ばされないよう、アプリ内のパスだけを戻り先として許可する
const safeNext = (next: string | null) => (next && /^\/(?![/\\])/.test(next) ? next : '/')

const inputStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border-light)',
  color: 'var(--text-main)',
  fontSize: 15,
  outline: 'none',
}

export default function LoginPage() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.trim(), pass }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'ログインに失敗しました')
        setLoading(false)
        return
      }
      window.location.replace(safeNext(new URLSearchParams(window.location.search).get('next')))
    } catch {
      setError('通信に失敗しました。接続を確認して、もう一度お試しください')
      setLoading(false)
    }
  }

  const canSubmit = !!user.trim() && !!pass && !loading

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlowOrbs />

      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="glass-card w-full p-8" style={{ maxWidth: 380 }}>
          <div className="text-center mb-6">
            <div style={{ fontSize: 40, lineHeight: 1 }}>👏</div>
            <h1 className="font-black mt-3" style={{ fontSize: 24, color: 'var(--text-main)' }}>
              ほめアプリ
            </h1>
            <p className="mt-2" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              ユーザー名とパスワードを入力してください
            </p>
          </div>

          <label className="block mb-4">
            <span className="block mb-1" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
              ユーザー名
            </span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-4 py-3 rounded-xl"
              style={inputStyle}
              autoFocus
            />
          </label>

          <label className="block mb-5">
            <span className="block mb-1" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
              パスワード
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl"
              style={inputStyle}
            />
          </label>

          {error && (
            <p role="alert" className="mb-4" style={{ fontSize: 13, color: 'var(--accent-main-2)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-main w-full py-3"
            style={{ fontSize: 16, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'ログイン中…' : 'ログイン'}
          </button>

          <p className="mt-5 text-center" style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-faint)' }}>
            一度ログインすると、このブラウザでは1年間ログインしたままになります。
            <br />
            （シークレットウィンドウや、閲覧データを削除した場合を除く）
          </p>
        </form>
      </main>
    </div>
  )
}
