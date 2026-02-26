'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import GlowOrbs from '@/components/GlowOrbs'
import FloatingEmojis from '@/components/FloatingEmojis'
import BgmController from '@/components/BgmController'

interface Petal {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  color: string
}

const PETAL_COLORS = ['#FFD43B', '#FF6B9D', '#C084FC', '#60C3FF', '#34D399', '#FF9F43']
const MILESTONES = [100, 150, 200, 300, 500, 1000]

export default function HomePage() {
  const [stats, setStats] = useState<{ total: number; today: number } | null>(null)
  const [bgmEnabled, setBgmEnabled] = useState(false)
  const [milestoneCelebration, setMilestoneCelebration] = useState<number | null>(null)
  const [celebrationPetals, setCelebrationPetals] = useState<Petal[]>([])
  const petalIdRef = useRef(0)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data)

        // マイルストーン判定
        const hit = MILESTONES.find((m) => data.total === m)
        if (hit && !sessionStorage.getItem(`milestone_${hit}`)) {
          sessionStorage.setItem(`milestone_${hit}`, '1')
          // 花びら生成
          const petals: Petal[] = Array.from({ length: 80 }, () => ({
            id: petalIdRef.current++,
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 3 + Math.random() * 3,
            size: 8 + Math.random() * 14,
            color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
          }))
          setCelebrationPetals(petals)
          setMilestoneCelebration(hit)
          setTimeout(() => setMilestoneCelebration(null), 5000)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      <GlowOrbs />
      <FloatingEmojis />

      {/* マイルストーンお祝いモーダル */}
      {milestoneCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(26, 16, 48, 0.88)', backdropFilter: 'blur(8px)' }}
          onClick={() => setMilestoneCelebration(null)}
        >
          {/* 花びら */}
          <div className="fixed inset-0 pointer-events-none">
            {celebrationPetals.map((petal) => (
              <div
                key={petal.id}
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: `${petal.left}%`,
                  width: petal.size,
                  height: petal.size,
                  background: petal.color,
                  borderRadius: '50% 0 50% 0',
                  opacity: 0.9,
                  animation: `petal-fall ${petal.duration}s ${petal.delay}s ease-in forwards`,
                }}
              />
            ))}
          </div>

          {/* メッセージカード */}
          <div
            className="glass-card popup-animate text-center px-10 py-12 relative z-10"
            style={{ maxWidth: 400 }}
          >
            <div style={{ fontSize: 80 }}>🏆</div>
            <h2
              className="gradient-text font-black mt-4"
              style={{ fontSize: 32 }}
            >
              累計{milestoneCelebration}件達成！
            </h2>
            <p style={{ color: '#F5F3FF', marginTop: 12, fontSize: 16, lineHeight: 1.8 }}>
              みんなのほめが<br />
              <span style={{ fontWeight: 900, color: '#FFD43B' }}>{milestoneCelebration}件</span>
              になりました🎉
            </p>
            <p style={{ color: '#B8B0D0', marginTop: 12, fontSize: 13 }}>
              ほめがめぐりめぐって、<br />この世界をちょっとだけよくしています ✨
            </p>
            <p style={{ color: '#6E6490', marginTop: 16, fontSize: 12 }}>
              タップして閉じる
            </p>
          </div>
        </div>
      )}

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
            ほめよう！
          </div>
        </h1>

        {/* キャッチコピー */}
        <p
          className="gradient-text font-bold mb-3"
          style={{ fontSize: 13, letterSpacing: '0.02em' }}
        >
          感謝に始まり、感謝で終わる1日を過ごすためのアプリ
        </p>

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
              🏆 累計 <span style={{ fontWeight: 900, color: '#FFD43B' }}>{stats ? `${stats.total}件` : '…'}</span> のほめが届いています
            </span>
          </div>
          <div
            className="glass-card px-6 py-3 text-center"
            style={{ borderRadius: 50 }}
          >
            <span style={{ color: '#F5F3FF', fontSize: 15 }}>
              ✨ 今日は <span style={{ fontWeight: 900, color: '#FF6B9D' }}>{stats ? `${stats.today}件` : '…'}</span> のほめが生まれました！
            </span>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 340 }}>
          <Link href="/send" className="block">
            <button className="btn-main w-full py-4" style={{ fontSize: 18, borderRadius: 50 }}>
              🔥 ほめる！
            </button>
          </Link>
          <Link href="/praises" className="block">
            <button className="btn-secondary w-full py-3" style={{ fontSize: 15, borderRadius: 50 }}>
              🖼 これまでのほめを見る
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
