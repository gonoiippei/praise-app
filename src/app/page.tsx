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

      {/* BGMトグル（右上） */}
      <div className="relative z-10 flex justify-end px-6 py-4">
        <BgmController enabled={bgmEnabled} onToggle={() => setBgmEnabled((v) => !v)} />
      </div>

      {/* メインコンテンツ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">

        {/* 👏 絵文字 */}
        <div style={{ fontSize: 56, marginBottom: 16 }}>👏</div>

        {/* タイトル */}
        <h1 className="font-black mb-4" style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', color: '#F5F3FF' }}>
            匿名で、
          </div>
          <div
            className="gradient-text"
            style={{ fontSize: 'clamp(2.5rem, 9vw, 4.5rem)' }}
          >
            褒めよう！
          </div>
        </h1>

        {/* サブテキスト */}
        <p className="mb-8" style={{ color: '#B8B0D0', fontSize: 15, lineHeight: 1.8 }}>
          チームの仲間に、匿名で感謝や賞賛を届けよう。<br />
          あなたの一言が、誰かの一日を変えるかも ✨
        </p>

        {/* 統計（ピル型） */}
        <div className="flex flex-col gap-3 mb-8 w-full" style={{ maxWidth: 340 }}>
          <div
            className="glass-card px-6 py-3 text-center"
            style={{ borderRadius: 50 }}
          >
            <span style={{ color: '#F5F3FF', fontSize: 15 }}>
              🏆 累計 <span style={{ fontWeight: 900, color: '#FFD43B' }}>{stats.total}件</span> の褒めが届いています
            </span>
          </div>
          <div
            className="glass-card px-6 py-3 text-center"
            style={{ borderRadius: 50 }}
          >
            <span style={{ color: '#F5F3FF', fontSize: 15 }}>
              ✨ 今日は <span style={{ fontWeight: 900, color: '#FF6B9D' }}>{stats.today}件</span> の褒めが生まれました！
            </span>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 340 }}>
          <Link href="/send" className="block">
            <button className="btn-main w-full py-4" style={{ fontSize: 18, borderRadius: 50 }}>
              🔥 褒める！
            </button>
          </Link>
          <Link href="/praises" className="block">
            <button className="btn-secondary w-full py-3" style={{ fontSize: 15, borderRadius: 50 }}>
              🖼 これまでの褒めを見る
            </button>
          </Link>
        </div>

        {/* メンバー管理（下部） */}
        <Link
          href="/members"
          className="mt-8 hover:text-white transition-colors"
          style={{ color: '#6E6490', fontSize: 13 }}
        >
          ⚙ メンバー管理
        </Link>
      </main>
    </div>
  )
}
