import { redirect } from 'next/navigation'
import GlowOrbs from '@/components/GlowOrbs'
import { auth, signIn } from '@/auth'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session) redirect('/')

  const { error } = await searchParams

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
      <GlowOrbs />
      <div
        className="glass-card p-8 max-w-sm w-full text-center relative z-10"
        style={{ maxWidth: 380 }}
      >
        <div style={{ fontSize: 56, marginBottom: 8 }}>👏</div>
        <h1 className="gradient-text font-black" style={{ fontSize: 32 }}>
          ほめ通信
        </h1>
        <p
          style={{
            color: '#475569',
            fontSize: 14,
            marginTop: 20,
            marginBottom: 28,
            lineHeight: 1.7,
          }}
        >
          Slackでログインしてください。
          <br />
          ベイジのワークスペースの
          <br />
          メンバーのみ利用できます。
        </p>

        {error === 'AccessDenied' && (
          <p
            style={{
              color: '#EC4899',
              fontSize: 13,
              marginBottom: 20,
              padding: '10px 12px',
              background: 'rgba(236, 72, 153, 0.08)',
              borderRadius: 10,
              lineHeight: 1.5,
            }}
          >
            このSlackワークスペースは利用対象外です
          </p>
        )}

        <form
          action={async () => {
            'use server'
            await signIn('slack', { redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="btn-main w-full py-3"
            style={{ fontSize: 16 }}
          >
            🔐 Slackでログイン
          </button>
        </form>

        <p
          style={{
            color: '#94A3B8',
            fontSize: 11,
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          ログイン状態は30日間保持されます
        </p>
      </div>
    </div>
  )
}
