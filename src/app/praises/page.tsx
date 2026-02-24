'use client'

import { useEffect, useRef, useState } from 'react'
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

// =============================================
// 祝祭的BGM（一覧ページ専用）
// =============================================
function useFestiveBgm(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])
  const startedRef = useRef(false)

  const stopAll = () => {
    timersRef.current.forEach(clearTimeout)
    intervalsRef.current.forEach(clearInterval)
    timersRef.current = []
    intervalsRef.current = []
    if (ctxRef.current) {
      ctxRef.current.close()
      ctxRef.current = null
    }
    startedRef.current = false
  }

  const start = () => {
    if (startedRef.current) return
    const ctx = new AudioContext()
    ctxRef.current = ctx
    startedRef.current = true

    // ── 明るいファンファーレコード進行: C→E→G→C（上昇）繰り返し ──
    const fanfareChords = [
      [523, 659, 784],   // C major
      [587, 740, 880],   // D major
      [659, 830, 988],   // E major
      [698, 880, 1047],  // F major
    ]
    let chordIdx = 0
    const playFanfareChord = () => {
      if (!ctxRef.current) return
      const c = ctxRef.current
      const t = c.currentTime
      fanfareChords[chordIdx].forEach((freq) => {
        const osc = c.createOscillator()
        const gain = c.createGain()
        osc.type = 'triangle'
        osc.frequency.value = freq
        osc.connect(gain)
        gain.connect(c.destination)
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.05, t + 0.08)
        gain.gain.setValueAtTime(0.05, t + 2.5)
        gain.gain.linearRampToValueAtTime(0, t + 3.0)
        osc.start(t)
        osc.stop(t + 3.1)
      })
      chordIdx = (chordIdx + 1) % fanfareChords.length
    }
    playFanfareChord()
    const chordInterval = setInterval(playFanfareChord, 3000)
    intervalsRef.current.push(chordInterval)

    // ── きらきらグロッケンシュピール風 高音アルペジオ ──
    const glockNotes = [1047, 1175, 1319, 1568, 1760, 2093]
    const scheduleGlock = () => {
      if (!ctxRef.current) return
      const c = ctxRef.current
      const t = c.currentTime
      const freq = glockNotes[Math.floor(Math.random() * glockNotes.length)]
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(c.destination)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.08, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      osc.start(t)
      osc.stop(t + 0.7)
      const next = 300 + Math.random() * 800
      const tid = setTimeout(scheduleGlock, next)
      timersRef.current.push(tid)
    }
    const t1 = setTimeout(scheduleGlock, 200)
    timersRef.current.push(t1)

    // ── 軽快なリズム打楽器風パルス ──
    const scheduleRhythm = () => {
      if (!ctxRef.current) return
      const c = ctxRef.current
      const t = c.currentTime
      ;[0, 0.5, 1.0, 1.5].forEach((offset) => {
        const osc = c.createOscillator()
        const gain = c.createGain()
        osc.type = 'sine'
        osc.frequency.value = offset === 0 || offset === 1.0 ? 220 : 165
        osc.connect(gain)
        gain.connect(c.destination)
        gain.gain.setValueAtTime(0, t + offset)
        gain.gain.linearRampToValueAtTime(offset === 0 ? 0.06 : 0.03, t + offset + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.15)
        osc.start(t + offset)
        osc.stop(t + offset + 0.2)
      })
      const tid = setTimeout(scheduleRhythm, 2000)
      timersRef.current.push(tid)
    }
    const t2 = setTimeout(scheduleRhythm, 500)
    timersRef.current.push(t2)

    // ── 上昇するファンファーレ フレーズ（8秒ごと） ──
    const playFanfarePhrase = () => {
      if (!ctxRef.current) return
      const c = ctxRef.current
      const phrase = [523, 659, 784, 1047]
      phrase.forEach((freq, i) => {
        const t = c.currentTime + i * 0.18
        const osc = c.createOscillator()
        const gain = c.createGain()
        osc.type = 'square'
        osc.frequency.value = freq
        osc.connect(gain)
        gain.connect(c.destination)
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.04, t + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
        osc.start(t)
        osc.stop(t + 0.6)
      })
    }
    const phraseInterval = setInterval(playFanfarePhrase, 8000)
    intervalsRef.current.push(phraseInterval)
  }

  useEffect(() => {
    if (enabled) {
      const handle = () => {
        start()
        document.removeEventListener('click', handle)
        document.removeEventListener('touchstart', handle)
      }
      document.addEventListener('click', handle)
      document.addEventListener('touchstart', handle)
      return () => {
        document.removeEventListener('click', handle)
        document.removeEventListener('touchstart', handle)
      }
    } else {
      stopAll()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  useEffect(() => () => stopAll(), [])// eslint-disable-line

  return { enabled, toggle: () => {} }
}

export default function PraisesPage() {
  const [praises, setPraises] = useState<Praise[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [bgmEnabled, setBgmEnabled] = useState(false)

  useFestiveBgm(bgmEnabled)

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
          <div className="flex items-center gap-3">
            <span style={{ color: '#B8B0D0', fontSize: 13 }}>
              {praises.length} 件の褒め
            </span>
            {/* BGMトグル */}
            <button
              onClick={() => setBgmEnabled((v) => !v)}
              className="flex items-center gap-2 text-sm"
              title={bgmEnabled ? 'BGMをOFF' : 'BGMをON'}
            >
              <span style={{ color: '#B8B0D0', fontSize: 12 }}>BGM</span>
              <div className={`toggle-switch ${bgmEnabled ? 'on' : 'off'}`}>
                <div className="toggle-knob" />
              </div>
            </button>
          </div>
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
                      <p style={{ color: '#B8B0D0', fontSize: 12, marginTop: 8 }}>
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
