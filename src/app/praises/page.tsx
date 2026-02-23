'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlowOrbs from '@/components/GlowOrbs'
import Avatar from '@/components/Avatar'
import { Praise, Member } from '@/types'

const CELEBRATION_EMOJIS = ['🎉', '✨', '💖', '🌟', '🙌', '💐', '🎊', '⭐', '🔥', '💪', '👏', '🌈', '💫', '🥳', '😍']

function getRandomEmoji(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CELEBRATION_EMOJIS[Math.abs(hash) % CELEBRATION_EMOJIS.length]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default function PraisesPage() {
  const [praises, setPraises] = useState<Praise[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = selectedMemberId
      ? `/api/praises?member_id=${selectedMemberId}&limit=100`
      : '/api/praises?limit=100'
    fetch(url)
      .then((r) => r.json())
      .then(setPraises)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedMemberId])

  useEffect(() => {
    // 褒められたことがあるメンバーを取得（フィルター用）
    fetch('/api/praises?limit=500')
      .then((r) => r.json())
      .then((data: Praise[]) => {
        const seen = new Map<string, Member>()
        data.forEach((p) => {
          if (p.members && !seen.has(p.member_id)) {
            seen.set(p.member_id, p.members)
          }
        })
        setMembers(Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, 'ja')))
      })
      .catch(() => {})
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlowOrbs />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ヘッダー */}
        <header className="flex items-center justify-between px-6 py-4">
          <Link href="/" style={{ color: '#B8B0D0', fontSize: 14 }} className="hover:text-white transition-colors">
            ← ホームへ
          </Link>
          <span style={{ color: '#B8B0D0', fontSize: 13 }}>
            {praises.length} 件の褒め
          </span>
        </header>

        <main className="flex-1 px-4 pb-24 max-w-2xl mx-auto w-full">
          <h1 className="gradient-text font-black mb-6 text-center" style={{ fontSize: 28 }}>
            これまでの褒め 🎊
          </h1>

          {/* フィルター */}
          {members.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMemberId('')}
                className="px-3 py-1 rounded-full text-sm transition-all"
                style={{
                  background: selectedMemberId === '' ? 'linear-gradient(135deg, #FF6B9D, #C084FC)' : 'rgba(255,255,255,0.08)',
                  color: '#F5F3FF',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontWeight: selectedMemberId === '' ? 700 : 400,
                }}
              >
                すべて
              </button>
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className="px-3 py-1 rounded-full text-sm transition-all"
                  style={{
                    background: selectedMemberId === m.id ? 'linear-gradient(135deg, #FF6B9D, #C084FC)' : 'rgba(255,255,255,0.08)',
                    color: '#F5F3FF',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontWeight: selectedMemberId === m.id ? 700 : 400,
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {/* 褒め一覧 */}
          {loading ? (
            <div className="text-center py-16" style={{ color: '#B8B0D0' }}>読み込み中…</div>
          ) : praises.length === 0 ? (
            <div className="text-center py-16">
              <div style={{ fontSize: 48 }}>💐</div>
              <p style={{ color: '#B8B0D0', marginTop: 12 }}>まだ褒めがありません</p>
              <p style={{ color: '#6E6490', fontSize: 13, marginTop: 8 }}>最初の褒めを送ってみよう！</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {praises.map((praise) => (
                <div
                  key={praise.id}
                  className="glass-card px-5 py-4"
                  style={{ borderTop: '3px solid transparent', borderImage: 'linear-gradient(135deg, #FF6B9D, #C084FC) 1' }}
                >
                  <div className="flex items-start gap-3">
                    {praise.members && <Avatar name={praise.members.name} size={44} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontWeight: 700, color: '#F5F3FF', fontSize: 15 }}>
                          {praise.members?.name ?? '不明'}
                        </span>
                        <span style={{ fontSize: 20 }}>{getRandomEmoji(praise.id)}</span>
                        {praise.source === 'slack' && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: 'rgba(96, 195, 255, 0.2)', color: '#60C3FF' }}
                          >
                            Slack
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#F5F3FF', fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word' }}>
                        {praise.message}
                      </p>
                      <p style={{ color: '#6E6490', fontSize: 12, marginTop: 8 }}>
                        📝 匿名の誰かより · {formatDate(praise.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* FAB */}
      <Link href="/send">
        <button
          className="btn-main fixed bottom-6 right-6 z-20"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            fontSize: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(255, 212, 59, 0.4)',
          }}
          title="褒める"
        >
          🎉
        </button>
      </Link>
    </div>
  )
}
