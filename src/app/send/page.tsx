'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GlowOrbs from '@/components/GlowOrbs'
import BgmController from '@/components/BgmController'
import { Member } from '@/types'

function MemberPill({
  member,
  isSelected,
  isMaxReached,
  onToggle,
}: {
  member: Member
  isSelected: boolean
  isMaxReached: boolean
  onToggle: (m: Member) => void
}) {
  return (
    <button
      onClick={() => onToggle(member)}
      disabled={isMaxReached}
      style={{
        padding: '6px 16px',
        borderRadius: 50,
        fontSize: 13,
        fontWeight: isSelected ? 700 : 400,
        background: isSelected
          ? 'linear-gradient(135deg, #EC4899, #8B5CF6)'
          : 'white',
        color: isSelected ? 'white' : isMaxReached ? '#CBD5E1' : '#1E293B',
        border: isSelected ? '1px solid transparent' : '1px solid #E2E8F0',
        transition: 'all 0.15s',
        cursor: isMaxReached ? 'not-allowed' : 'pointer',
        opacity: isMaxReached ? 0.5 : 1,
        boxShadow: isSelected ? '0 4px 12px rgba(236, 72, 153, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {member.name}
    </button>
  )
}

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

const TEAM_GROUPS = [
  {
    label: '経営チーム',
    names: ['枌谷力', '今西毅寿', '経営チーム'],
  },
  {
    label: 'レベニューチーム',
    names: ['小林聖子', '丸山恋', '仲野翔也', '荒川翔太', 'レベニューチーム'],
  },
  {
    label: 'バックオフィスチーム',
    names: ['古口真凜', '竹村恵', '菅野那津子', '仁尾雅子', 'バックオフィスチーム'],
  },
  {
    label: 'AI/DXチーム',
    names: ['酒井琢郎', '野村輝', '金伯冠', 'AI/DXチーム'],
  },
  {
    label: 'Aチーム',
    names: ['奥原美穂子', '大舘仁志', '宇都宮友之祐', '岡本早樹', '岡田大悟', '西岡紀子', '吉池千尋', '瀬尾友里恵', '金誠俊', 'Aチーム'],
  },
  {
    label: 'Bチーム',
    names: ['野上恵里', '中島碧', '野井裕美', '本山太志', '江田哲也', '三原星芳', '板垣琴音', '川名子紗依', '小菅広大', '五ノ井一平', '真鍋知優', '星山かなた', '永松奈央美', '竹内快斗', 'Bチーム'],
  },
  {
    label: 'Dチーム',
    names: ['高橋慶', '川道優輝', '林崎優吾', '平城舞子', '早見真由', '廣瀨弥礼', '池田彩華', '山川優理子', '長田太彪', '津谷秀斗', 'Dチーム'],
  },
  {
    label: 'その他',
    names: ['生きとし生けるもの'],
  },
]

// 送信完了ポップアップのバリエーション
const POPUP_PATTERNS: { emoji: string; message: string }[] = [
  { emoji: '🙏', message: 'ほめてくれて、ありがとう' },
  { emoji: '🔍', message: '誰かのいいところに気づける、その目がいい' },
  { emoji: '✍', message: '言葉にして送れる人、けっこう貴重です' },
  { emoji: '✨', message: 'あなたのほめが、誰かの今日を少し変えます' },
  { emoji: '🪞', message: '誰かをほめると、自分も少し整います' },
]

export default function SendPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupPattern, setPopupPattern] = useState(POPUP_PATTERNS[0])
  const [petals, setPetals] = useState<Petal[]>([])
  const [bgmEnabled, setBgmEnabled] = useState(false)
  const petalIdRef = useRef(0)

  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // URLの ?for=<member_id> でメンバーを事前選択
  useEffect(() => {
    if (members.length === 0) return
    const params = new URLSearchParams(window.location.search)
    const forId = params.get('for')
    if (!forId) return
    const target = members.find((m) => m.id === forId)
    if (target) {
      setSelectedMembers((prev) =>
        prev.some((m) => m.id === target.id) ? prev : [target]
      )
    }
  }, [members])

  const filteredMembers = searchQuery
    ? members.filter((m) => m.name.includes(searchQuery))
    : []

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
      // ランダムにポップアップパターンを選択
      setPopupPattern(POPUP_PATTERNS[Math.floor(Math.random() * POPUP_PATTERNS.length)])
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
    ? `${selectedMembers[0].name}さん`
    : `${selectedMembers.map((m) => m.name).join('・')}さん`

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
          style={{ background: 'rgba(255, 255, 255, 0.78)', backdropFilter: 'blur(10px)' }}
        >
          <div className="glass-card popup-animate text-center px-10 py-12" style={{ maxWidth: 420 }}>
            <div style={{ fontSize: 64 }}>{popupPattern.emoji}</div>
            <h2 className="gradient-text font-black mt-4" style={{ fontSize: 24, lineHeight: 1.4 }}>
              {selectedNamesText}にほめを届けました。
            </h2>
            <p style={{ color: '#1E293B', marginTop: 16, fontSize: 15, lineHeight: 1.8, fontWeight: 500 }}>
              {popupPattern.message}
            </p>
            <p style={{ color: '#94A3B8', marginTop: 16, fontSize: 12 }}>
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
            style={{ color: '#475569', fontSize: 14 }}
            className="hover:text-slate-800 transition-colors"
          >
            ← ホームに戻る
          </Link>
          <BgmController enabled={bgmEnabled} onToggle={() => setBgmEnabled((v) => !v)} />
        </header>

        <main className="flex-1 px-4 pb-8 w-full" style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* タイトル */}
          <h1 className="font-black mb-1" style={{ fontSize: 26, color: '#1E293B' }}>
            ほめを届ける 🎁
          </h1>
          <p className="mb-6" style={{ color: '#475569', fontSize: 14 }}>
            あなたの名前は相手に伝わりません。気軽にどうぞ！
          </p>

          {/* 誰をほめる？ */}
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: '#EC4899', fontSize: 14, fontWeight: 700 }}>
              🎯 誰をほめる？
            </span>
            <span style={{ color: '#94A3B8', fontSize: 12 }}>
              （最大{MAX_MEMBERS}人まで選べます）
            </span>
            {selectedMembers.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                color: '#8B5CF6',
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
                background: 'white',
                border: '1px solid #E2E8F0',
                color: '#1E293B',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          {/* メンバー選択エリア */}
          <div className="mb-6 overflow-y-auto" style={{ maxHeight: 300 }}>
            {members.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: 14 }}>読み込み中...</p>
            ) : searchQuery ? (
              /* 検索中：フラットに表示 */
              filteredMembers.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: 14 }}>見つかりません</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredMembers.map((member) => (
                    <MemberPill
                      key={member.id}
                      member={member}
                      isSelected={selectedMembers.some((m) => m.id === member.id)}
                      isMaxReached={selectedMembers.length >= MAX_MEMBERS && !selectedMembers.some((m) => m.id === member.id)}
                      onToggle={toggleMember}
                    />
                  ))}
                </div>
              )
            ) : (
              /* 通常：チーム別に表示 */
              <div className="flex flex-col gap-4">
                {TEAM_GROUPS.map((group) => {
                  const groupMembers = group.names
                    .map((name) => members.find((m) => m.name === name))
                    .filter(Boolean) as Member[]
                  if (groupMembers.length === 0) return null
                  return (
                    <div key={group.label}>
                      <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em' }}>
                        {group.label}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {groupMembers.map((member) => (
                          <MemberPill
                            key={member.id}
                            member={member}
                            isSelected={selectedMembers.some((m) => m.id === member.id)}
                            isMaxReached={selectedMembers.length >= MAX_MEMBERS && !selectedMembers.some((m) => m.id === member.id)}
                            onToggle={toggleMember}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* メッセージ */}
          <div className="mb-2" style={{ color: '#475569', fontSize: 14, fontWeight: 700 }}>
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
                background: 'white',
                border: '1px solid #E2E8F0',
                color: '#1E293B',
                fontSize: 14,
                outline: 'none',
                opacity: selectedMembers.length > 0 ? 1 : 0.6,
              }}
            />
            <div className="text-right mt-1" style={{ color: '#94A3B8', fontSize: 12 }}>
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
              fontWeight: 900,
              borderRadius: 18,
              background: canSubmit
                ? 'linear-gradient(135deg, #EC4899, #8B5CF6)'
                : '#E2E8F0',
              color: canSubmit ? 'white' : '#94A3B8',
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: canSubmit ? '0 10px 30px rgba(236, 72, 153, 0.35)' : 'none',
            }}
          >
            {loading ? '送信中…' : `🍊 匿名でほめる！${selectedMembers.length > 1 ? `（${selectedMembers.length}人）` : ''}`}
          </button>
        </main>
      </div>
    </div>
  )
}
