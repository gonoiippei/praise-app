'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import GlowOrbs from '@/components/GlowOrbs'
import Avatar from '@/components/Avatar'
import BgmController from '@/components/BgmController'
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

// 表示用グループ型
interface PraiseGroup {
  id: string
  group_id: string | null
  message: string
  source: 'web' | 'slack'
  created_at: string
  members: Member[]
}

// 同じ group_id を持つほめを1枚のカードにまとめる
function groupPraises(praises: Praise[]): PraiseGroup[] {
  const groups = new Map<string, PraiseGroup>()
  for (const p of praises) {
    const key = p.group_id ?? p.id
    if (groups.has(key)) {
      if (p.members) groups.get(key)!.members.push(p.members)
    } else {
      groups.set(key, {
        id: key,
        group_id: p.group_id,
        message: p.message,
        source: p.source,
        created_at: p.created_at,
        members: p.members ? [p.members] : [],
      })
    }
  }
  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
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

    const fanfareChords = [
      [523, 659, 784],
      [587, 740, 880],
      [659, 830, 988],
      [698, 880, 1047],
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
      start()
    } else {
      stopAll()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  useEffect(() => () => stopAll(), [])// eslint-disable-line

  return { enabled, toggle: () => {} }
}

export default function PraisesPage() {
  const [allPraises, setAllPraises] = useState<Praise[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [bgmEnabled, setBgmEnabled] = useState(false)

  useFestiveBgm(bgmEnabled)

  // 全件取得（グループ化・フィルターをフロントで行う）
  useEffect(() => {
    fetch('/api/praises?limit=500')
      .then((r) => r.json())
      .then((data: Praise[] | { error: string }) => {
        if (!Array.isArray(data)) {
          setAllPraises([])
          setMembers([])
          return
        }
        setAllPraises(data)
        const seen = new Map<string, Member>()
        data.forEach((p) => {
          if (p.members && !seen.has(p.member_id)) {
            seen.set(p.member_id, p.members)
          }
        })
        setMembers(Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, 'ja')))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // グループ化してからフィルター適用
  const groupedPraises = groupPraises(allPraises)
  const filteredGroups = selectedMemberId
    ? groupedPraises.filter((g) => g.members.some((m) => m.id === selectedMemberId))
    : groupedPraises

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlowOrbs />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ヘッダー */}
        <header className="flex items-center justify-between px-6 py-4">
          <Link href="/" style={{ color: '#475569', fontSize: 14 }} className="hover:text-slate-800 transition-colors">
            ← ホームへ
          </Link>
          <BgmController enabled={bgmEnabled} onToggle={() => setBgmEnabled((v) => !v)} />
        </header>

        <main className="flex-1 px-4 pb-24 max-w-2xl mx-auto w-full">
          <h1 className="gradient-text font-black mb-6 text-center" style={{ fontSize: 28 }}>
            これまでのほめ 🎊
            {filteredGroups.length > 0 && (
              <span style={{ fontSize: 15, fontWeight: 400, color: '#64748B', marginLeft: 8, background: 'none', WebkitTextFillColor: '#64748B' }}>
                {filteredGroups.length}件
              </span>
            )}
          </h1>

          {/* フィルター */}
          {members.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMemberId('')}
                className="px-3 py-1 rounded-full text-sm transition-all"
                style={{
                  background: selectedMemberId === '' ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' : 'white',
                  color: selectedMemberId === '' ? 'white' : '#1E293B',
                  border: selectedMemberId === '' ? '1px solid transparent' : '1px solid #E2E8F0',
                  fontWeight: selectedMemberId === '' ? 700 : 400,
                  boxShadow: selectedMemberId === '' ? '0 4px 12px rgba(236, 72, 153, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
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
                    background: selectedMemberId === m.id ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' : 'white',
                    color: selectedMemberId === m.id ? 'white' : '#1E293B',
                    border: selectedMemberId === m.id ? '1px solid transparent' : '1px solid #E2E8F0',
                    fontWeight: selectedMemberId === m.id ? 700 : 400,
                    boxShadow: selectedMemberId === m.id ? '0 4px 12px rgba(236, 72, 153, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {/* ほめ一覧 */}
          {loading ? (
            <div className="text-center py-16" style={{ color: '#475569' }}>読み込み中…</div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-16">
              <div style={{ fontSize: 48 }}>💐</div>
              <p style={{ color: '#475569', marginTop: 12 }}>まだほめがありません</p>
              <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 8 }}>最初のほめを送ってみよう！</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="glass-card px-5 py-4"
                  style={{ borderTop: '3px solid transparent', borderImage: 'linear-gradient(135deg, #EC4899, #8B5CF6) 1' }}
                >
                  <div className="flex items-start gap-3">
                    {/* 複数人のときはアバターを重ねて表示 */}
                    <div className="flex-shrink-0" style={{ position: 'relative', width: 44, height: 44 }}>
                      {group.members.slice(0, 3).map((m, i) => (
                        <div
                          key={m.id}
                          style={{
                            position: i === 0 ? 'relative' : 'absolute',
                            top: i === 0 ? 0 : i * 6,
                            left: i === 0 ? 0 : i * 6,
                            zIndex: 3 - i,
                            outline: i > 0 ? '2px solid white' : 'none',
                            borderRadius: '50%',
                          }}
                        >
                          <Avatar name={m.name} size={i === 0 ? 44 : 32} />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 15 }}>
                          {group.members.map((m) => m.name).join('・')}
                        </span>
                        <span style={{ fontSize: 20 }}>{getRandomEmoji(group.id)}</span>
                        {group.source === 'slack' && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#0EA5E9', fontWeight: 700 }}
                          >
                            Slack
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#1E293B', fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word' }}>
                        {group.message}
                      </p>
                      <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>
                        📝 匿名の誰かより · {formatDate(group.created_at)}
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
            boxShadow: '0 8px 30px rgba(236, 72, 153, 0.4)',
          }}
          title="ほめる"
        >
          🎉
        </button>
      </Link>
    </div>
  )
}
