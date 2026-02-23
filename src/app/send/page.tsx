'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import GlowOrbs from '@/components/GlowOrbs'
import Avatar from '@/components/Avatar'
import { Member } from '@/types'

interface Petal {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  color: string
}

function playChurchBell(audioCtx: AudioContext) {
  const time = audioCtx.currentTime
  // F→A→C→F のアルペジオ
  const notes = [349.23, 440, 523.25, 698.46]
  notes.forEach((freq, i) => {
    const t = time + i * 0.25
    // 基音
    const osc1 = audioCtx.createOscillator()
    const gain1 = audioCtx.createGain()
    osc1.frequency.value = freq
    osc1.type = 'sine'
    osc1.connect(gain1)
    gain1.connect(audioCtx.destination)
    gain1.gain.setValueAtTime(0, t)
    gain1.gain.linearRampToValueAtTime(0.12, t + 0.02)
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 2.5)
    osc1.start(t)
    osc1.stop(t + 2.6)

    // 非整数倍音 (2.756倍)
    const osc2 = audioCtx.createOscillator()
    const gain2 = audioCtx.createGain()
    osc2.frequency.value = freq * 2.756
    osc2.type = 'sine'
    osc2.connect(gain2)
    gain2.connect(audioCtx.destination)
    gain2.gain.setValueAtTime(0, t)
    gain2.gain.linearRampToValueAtTime(0.06, t + 0.02)
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 1.5)
    osc2.start(t)
    osc2.stop(t + 1.6)

    // 非整数倍音 (5.404倍)
    const osc3 = audioCtx.createOscillator()
    const gain3 = audioCtx.createGain()
    osc3.frequency.value = freq * 5.404
    osc3.type = 'sine'
    osc3.connect(gain3)
    gain3.connect(audioCtx.destination)
    gain3.gain.setValueAtTime(0, t)
    gain3.gain.linearRampToValueAtTime(0.03, t + 0.02)
    gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.8)
    osc3.start(t)
    osc3.stop(t + 0.9)
  })

  // シマーコード（和音の余韻）
  const shimmerTime = time + notes.length * 0.25 + 0.1
  const shimmerFreqs = [349.23, 440, 523.25, 698.46]
  shimmerFreqs.forEach((freq) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.frequency.value = freq
    osc.type = 'sine'
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    gain.gain.setValueAtTime(0, shimmerTime)
    gain.gain.linearRampToValueAtTime(0.05, shimmerTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, shimmerTime + 3.0)
    osc.start(shimmerTime)
    osc.stop(shimmerTime + 3.1)
  })
}

const PETAL_COLORS = ['#FF6B9D', '#FF9F43', '#C084FC', '#FFD43B', '#FF8FAB']

export default function SendPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [petals, setPetals] = useState<Petal[]>([])
  const petalIdRef = useRef(0)

  useEffect(() => {
    fetch(`/api/members?q=${encodeURIComponent(searchQuery)}`)
      .then((r) => r.json())
      .then(setMembers)
      .catch(() => {})
  }, [searchQuery])

  const handleSubmit = async () => {
    if (!selectedMember || !message.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/praises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: selectedMember.id, message }),
      })
      if (!res.ok) throw new Error('failed')

      // 鐘の音を鳴らす
      const ctx = new AudioContext()
      playChurchBell(ctx)

      // 花びらを生成
      const newPetals: Petal[] = Array.from({ length: 40 }, (_, i) => ({
        id: petalIdRef.current++,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 3,
        size: 8 + Math.random() * 12,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      }))
      setPetals(newPetals)

      // ポップアップ表示
      setShowPopup(true)

      // 3秒後に一覧へ遷移
      setTimeout(() => {
        router.push('/praises')
      }, 3000)
    } catch {
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlowOrbs />

      {/* 花びら */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {petals.map((petal) => (
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
              opacity: 0.85,
              animation: `petal-fall ${petal.duration}s ${petal.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>

      {/* ポップアップ */}
      {showPopup && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center"
          style={{ background: 'rgba(26, 16, 48, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="glass-card popup-animate text-center px-10 py-12"
            style={{ maxWidth: 400 }}
          >
            <div style={{ fontSize: 64 }}>🎉</div>
            <h2 className="gradient-text font-black mt-4" style={{ fontSize: 28 }}>
              褒めを届けました！
            </h2>
            <p style={{ color: '#B8B0D0', marginTop: 12, fontSize: 14 }}>
              {selectedMember?.name} さんへ送りました
            </p>
            <p style={{ color: '#6E6490', marginTop: 8, fontSize: 13 }}>
              3秒後に一覧ページへ移動します…
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ヘッダー */}
        <header className="flex items-center px-6 py-4 gap-3">
          <button
            onClick={() => router.back()}
            style={{ color: '#B8B0D0', fontSize: 14 }}
            className="hover:text-white transition-colors"
          >
            ← 戻る
          </button>
        </header>

        <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
          <h1 className="gradient-text font-black mb-6 text-center" style={{ fontSize: 32 }}>
            誰を褒める？
          </h1>

          {/* 検索 */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="名前で検索…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#F5F3FF',
                fontSize: 15,
                outline: 'none',
              }}
            />
          </div>

          {/* メンバーリスト */}
          <div
            className="glass-card mb-6 overflow-y-auto"
            style={{ maxHeight: 280 }}
          >
            {members.length === 0 ? (
              <p className="text-center py-8" style={{ color: '#6E6490' }}>
                メンバーが見つかりません
              </p>
            ) : (
              members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background:
                      selectedMember?.id === member.id
                        ? 'rgba(192, 132, 252, 0.2)'
                        : 'transparent',
                  }}
                >
                  <Avatar name={member.name} size={36} />
                  <span style={{ color: '#F5F3FF', fontWeight: selectedMember?.id === member.id ? 700 : 400 }}>
                    {member.name}
                  </span>
                  {selectedMember?.id === member.id && (
                    <span className="ml-auto" style={{ color: '#C084FC' }}>✓</span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* 選択中メンバー表示 */}
          {selectedMember && (
            <div
              className="glass-card flex items-center gap-3 px-4 py-3 mb-4"
              style={{ borderTop: '3px solid #C084FC' }}
            >
              <Avatar name={selectedMember.name} size={40} />
              <div>
                <div style={{ fontSize: 12, color: '#B8B0D0' }}>褒める相手</div>
                <div style={{ fontWeight: 700, color: '#F5F3FF' }}>{selectedMember.name}</div>
              </div>
            </div>
          )}

          {/* メッセージ入力 */}
          <div className="mb-6">
            <textarea
              placeholder={selectedMember ? `${selectedMember.name} さんへの褒め言葉を書いてください…` : 'まず相手を選んでください'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              disabled={!selectedMember}
              className="w-full px-4 py-3 rounded-2xl resize-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#F5F3FF',
                fontSize: 15,
                outline: 'none',
                opacity: selectedMember ? 1 : 0.5,
              }}
            />
          </div>

          {/* 送信ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!selectedMember || !message.trim() || loading}
            className="btn-main w-full py-4"
            style={{
              fontSize: 18,
              opacity: !selectedMember || !message.trim() || loading ? 0.5 : 1,
              cursor: !selectedMember || !message.trim() || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '送信中…' : '🎉 褒めを届ける！'}
          </button>

          <p className="text-center mt-4" style={{ color: '#6E6490', fontSize: 13 }}>
            あなたの名前は記録されません 🔒
          </p>
        </main>
      </div>
    </div>
  )
}
