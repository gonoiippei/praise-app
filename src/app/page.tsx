'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlowOrbs from '@/components/GlowOrbs'
import FloatingEmojis from '@/components/FloatingEmojis'
import BgmController from '@/components/BgmController'

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, today: 0 })
  const [bgmEnabled, setBgmEnabled] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      <GlowOrbs />
      <FloatingEmojis />

      {/* ヘッダー */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link
          href="/members"
          style={{ color: '#B8B0D0', fontSize: 14 }}
          className="hover:text-white transition-colors"
        >
          メンバー管理
        </Link>
        <BgmController enabled={bgmEnabled} onToggle={() => setBgmEnabled((v) => !v)} />
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-2">
          <span style={{ fontSize: 14, color: '#B8B0D0', letterSpacing: '0.1em' }}>
            みんなで作る、温かいチームへ
          </span>
        </div>
        <h1
          className="gradient-text font-black mb-8"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', lineHeight: 1.1 }}
        >
          褒めよう！
        </h1>

        {/* 統計 */}
        <div className="flex gap-4 mb-10 flex-wrap justify-center">
          <div className="glass-card px-6 py-4 text-center" style={{ minWidth: 160 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#FFD43B' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: 13, color: '#B8B0D0', marginTop: 4 }}>
              🏆 累計の褒め
            </div>
          </div>
          <div className="glass-card px-6 py-4 text-center" style={{ minWidth: 160 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#FF6B9D' }}>
              {stats.today}
            </div>
            <div style={{ fontSize: 13, color: '#B8B0D0', marginTop: 4 }}>
              ✨ 今日の褒め
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col gap-4 w-full" style={{ maxWidth: 320 }}>
          <Link href="/send" className="block">
            <button className="btn-main w-full py-4" style={{ fontSize: 20 }}>
              🎉 褒める！
            </button>
          </Link>
          <Link href="/praises" className="block">
            <button className="btn-secondary w-full py-3" style={{ fontSize: 15 }}>
              これまでの褒めを見る
            </button>
          </Link>
        </div>

        <p className="mt-10" style={{ color: '#6E6490', fontSize: 13 }}>
          送った人の名前は一切記録されません 🔒
        </p>
      </main>
    </div>
  )
}
