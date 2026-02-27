'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GlowOrbs from '@/components/GlowOrbs'
import BgmController from '@/components/BgmController'
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
  const notes = [349.23, 440, 523.25, 698.46]
  notes.forEach((freq, i) => {
    const t = time + i * 0.25
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

  const shimmerTime = time + notes.length * 0.25 + 0.1
  ;[349.23, 440, 523.25, 698.46].forEach((freq) => {
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
const MAX_MEMBERS = 10

export default function SendPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [petals, setPetals] = useState<Petal[]>([])
  const [bgmEnabled, setBgmEnabled] = useState(false)
  const petalIdRef = useRef(0)

  useEffect(() => {
    fetch(`/api/members?q=${encodeURIComponent(searchQuery)}`)
      .then((r) => r.json())
      .then(setMembers)
      .catch(() => {})
  }, [searchQuery])

  const toggleMember = (member: Member) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m.id === member.id)
      if (isSelected) return prev.filter((m) => m.id !== member.id)
      if (prev.length >= MAX_MEMBERS) return prev
      return [...prev, member]
    })
  }

  const handleSubmit = async () => {
    if (selectedMembers.length === 0 || !message.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/praises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_ids: selectedMembers.map((m) => m.id), message }),
      })
      if (!res.ok) throw new Error('failed')

      const ctx = new AudioContext()
      playChurchBell(ctx)

      const newPetals: Petal[] = Array.from({ length: 40 }, () => ({
        id: petalIdRef.current++,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 3,
        size: 8 + Math.random() * 12,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      }))
      setPetals(newPetals)
      setShowPopup(true)

      setTimeout(() => {
        router.push('/praises')
      }, 3000)
    } catch {
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = selectedMembers.length > 0 && !!message.trim() && !loading

  // ポップアップ用の名前表示
  const selectedNamesText = selectedMembers.length === 1
    ? `${selectedMembers[0].name} さん`
    : `${selectedMembers.map((m) => m.name).join('・')} さん`

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
          <div className="glass-card popup-animate text-center px-10 py-12" style={{ maxWidth: 400 }}>
            <div style={{ fontSize: 64 }}>🎉</div>
            <h2 className="gradient-text font-black mt-4" style={{ fontSize: 28 }}>
              ほめを届けました！
            </h2>
            <p style={{ color: '#B8B0D0', marginTop: 12, fontSize: 14, lineHeight: 1.8 }}>
              {selectedNamesText}へ送りました
            </p>
            <p style={{ color: '#6E6490', marginTop: 8, fontSize: 13 }}>
              3秒後に一覧ページへ移動します…
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ヘッダー */}
        <header className="flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            style={{ color: '#B8B0D0', fontSize: 14 }}
            className="hover:text-white transition-colors"
          >
            ← ホームに戻る
          </Link>
          <BgmController enabled={bgmEnabled} onToggle={() => setBgmEnabled((v) => !v)} />
        </header>

        <main className="flex-1 px-4 pb-8 w-full" style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* タイトル */}
          <h1 className="font-black mb-1" style={{ fontSize: 26, color: '#F5F3FF' }}>
            ほめを届ける 🎁
          </h1>
          <p className="mb-6" style={{ color: '#B8B0D0', fontSize: 14 }}>
            あなたの名前は相手に伝わりません。気軽にどうぞ！
          </p>

          {/* 誰をほめる？ */}
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: '#FF6B9D', fontSize: 14, fontWeight: 700 }}>
              🎯 誰をほめる？
            </span>
            <span style={{ color: '#6E6490', fontSize: 12 }}>
              （最大{MAX_MEMBERS}人まで選べます）
            </span>
            {selectedMembers.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                color: '#C084FC',
                fontSize: 12,
                fontWeight: 700,
              }}>
                {selectedMembers.length}人選択中
              </span>
            )}
          </div>

          {/* 検索 */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 名前で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#F5F3FF',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          {/* メンバー ピル型タグ */}
          <div className="mb-6 overflow-y-auto" style={{ maxHeight: 220 }}>
            {members.length === 0 ? (
              <p style={{ color: '#6E6490', fontSize: 14 }}>メンバーが見つかりません</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const isSelected = selectedMembers.some((m) => m.id === member.id)
                  const isMaxReached = selectedMembers.length >= MAX_MEMBERS && !isSelected
                  return (
                    <button
                      key={member.id}
                      onClick={() => toggleMember(member)}
                      disabled={isMaxReached}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 50,
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 400,
                        background: isSelected
                          ? 'linear-gradient(135deg, #FF6B9D, #C084FC)'
                          : 'rgba(255,255,255,0.08)',
                        color: isMaxReached ? '#4A4060' : '#F5F3FF',
                        border: isSelected
                          ? '1px solid transparent'
                          : '1px solid rgba(255,255,255,0.15)',
                        transition: 'all 0.15s',
                        cursor: isMaxReached ? 'not-allowed' : 'pointer',
                        opacity: isMaxReached ? 0.4 : 1,
                      }}
                    >
                      {member.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* メッセージ */}
          <div className="mb-2" style={{ color: '#B8B0D0', fontSize: 14, fontWeight: 700 }}>
            💬 メッセージ
          </div>
          <div className="mb-6">
            <textarea
              placeholder={
                selectedMembers.length > 0
                  ? `いつもありがとう！〇〇のおかげで助かってます...`
                  : 'まず相手を選んでください'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              disabled={selectedMembers.length === 0}
              className="w-full px-4 py-3 rounded-2xl resize-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#F5F3FF',
                fontSize: 14,
                outline: 'none',
                opacity: selectedMembers.length > 0 ? 1 : 0.6,
              }}
            />
            <div className="text-right mt-1" style={{ color: '#6E6490', fontSize: 12 }}>
              {message.length} 文字
            </div>
          </div>

          {/* 送信ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4"
            style={{
              fontSize: 17,
              fontWeight: 700,
              borderRadius: 50,
              background: canSubmit
                ? 'linear-gradient(135deg, #FFD43B, #FF9F43)'
                : 'rgba(255,255,255,0.1)',
              color: canSubmit ? '#1A1030' : '#6E6490',
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: canSubmit ? '0 4px 20px rgba(255, 212, 59, 0.3)' : 'none',
            }}
          >
            {loading ? '送信中…' : `🍊 匿名でほめる！${selectedMembers.length > 1 ? `（${selectedMembers.length}人）` : ''}`}
          </button>
        </main>
      </div>
    </div>
  )
}
