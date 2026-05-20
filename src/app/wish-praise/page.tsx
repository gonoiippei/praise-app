'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GlowOrbs from '@/components/GlowOrbs'
import { Member } from '@/types'

const TEAM_GROUPS = [
  {
    label: '経営チーム',
    names: ['枌谷力', '今西毅寿'],
  },
  {
    label: 'レベニューチーム',
    names: ['小林聖子', '丸山恋', '仲野翔也', '荒川翔太'],
  },
  {
    label: 'バックオフィスチーム',
    names: ['古口真凜', '竹村恵', '菅野那津子', '仁尾雅子'],
  },
  {
    label: 'AI/DXチーム',
    names: ['酒井琢郎', '野村輝', '金伯冠'],
  },
  {
    label: 'Aチーム',
    names: ['奥原美穂子', '大舘仁志', '宇都宮友之祐', '岡本早樹', '岡田大悟', '西岡紀子', '吉池千尋', '瀬尾友里恵', '金誠俊'],
  },
  {
    label: 'Bチーム',
    names: ['野上恵里', '中島碧', '野井裕美', '本山太志', '江田哲也', '三原星芳', '板垣琴音', '川名子紗依', '小菅広大', '五ノ井一平', '真鍋知優', '星山かなた', '永松奈央美', '竹内快斗'],
  },
  {
    label: 'Dチーム',
    names: ['高橋慶', '川道優輝', '林崎優吾', '平城舞子', '早見真由', '廣瀨弥礼', '池田彩華', '山川優理子', '長田太彪'],
  },
]

export default function WishPraisePage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then(setMembers)
      .catch(() => {})
  }, [])

  const filteredMembers = searchQuery
    ? members.filter((m) => m.name.includes(searchQuery))
    : []

  const handleSubmit = async () => {
    if (!selectedMember) return
    setLoading(true)
    try {
      const res = await fetch('/api/wish-praise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: selectedMember.id }),
      })
      if (!res.ok) throw new Error('failed')
      setShowPopup(true)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch {
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !!selectedMember && !loading

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlowOrbs />

      {/* ポップアップ */}
      {showPopup && selectedMember && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center"
          style={{ background: 'rgba(255, 255, 255, 0.78)', backdropFilter: 'blur(10px)' }}
        >
          <div className="glass-card popup-animate text-center px-10 py-12" style={{ maxWidth: 400 }}>
            <div style={{ fontSize: 64 }}>🙏</div>
            <h2 className="gradient-text font-black mt-4" style={{ fontSize: 26 }}>
              送信しました！
            </h2>
            <p style={{ color: '#475569', marginTop: 12, fontSize: 14, lineHeight: 1.8 }}>
              Slackに「{selectedMember.name}さんが<br />ほめてほしいらしいよ！」と<br />投稿されました
            </p>
            <p style={{ color: '#94A3B8', marginTop: 8, fontSize: 13 }}>
              3秒後にホームへ戻ります…
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex items-center px-6 py-4">
          <Link href="/" style={{ color: '#475569', fontSize: 14 }} className="hover:text-slate-800 transition-colors">
            ← ホームに戻る
          </Link>
        </header>

        <main className="flex-1 px-4 pb-8 w-full" style={{ maxWidth: 560, margin: '0 auto' }}>
          <h1 className="font-black mb-1" style={{ fontSize: 26, color: '#1E293B' }}>
            ほめてほしい 🙏
          </h1>
          <p className="mb-6" style={{ color: '#475569', fontSize: 14, lineHeight: 1.7 }}>
            がんばっているあの人にスポットライトを。<br />
            自分でも、応援したい誰かでもOKです。
          </p>

          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: '#0EA5E9', fontSize: 14, fontWeight: 700 }}>
              👤 ほめてほしい人を選んでください
            </span>
          </div>

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

          <div className="mb-6 overflow-y-auto" style={{ maxHeight: 300 }}>
            {members.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: 14 }}>読み込み中...</p>
            ) : searchQuery ? (
              filteredMembers.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: 14 }}>見つかりません</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredMembers.map((member) => (
                    <MemberPill
                      key={member.id}
                      member={member}
                      isSelected={selectedMember?.id === member.id}
                      onToggle={(m) => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                    />
                  ))}
                </div>
              )
            ) : (
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
                            isSelected={selectedMember?.id === member.id}
                            onToggle={(m) => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4"
            style={{
              fontSize: 17,
              fontWeight: 900,
              borderRadius: 18,
              background: canSubmit
                ? 'linear-gradient(135deg, #0EA5E9, #06B6D4)'
                : '#E2E8F0',
              color: canSubmit ? 'white' : '#94A3B8',
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: canSubmit ? '0 10px 30px rgba(14, 165, 233, 0.35)' : 'none',
            }}
          >
            {loading ? '送信中…' : '🙏 ほめてもらう！'}
          </button>
        </main>
      </div>
    </div>
  )
}

function MemberPill({
  member,
  isSelected,
  onToggle,
}: {
  member: Member
  isSelected: boolean
  onToggle: (m: Member) => void
}) {
  return (
    <button
      onClick={() => onToggle(member)}
      style={{
        padding: '6px 16px',
        borderRadius: 50,
        fontSize: 13,
        fontWeight: isSelected ? 700 : 400,
        background: isSelected
          ? 'linear-gradient(135deg, #0EA5E9, #06B6D4)'
          : 'white',
        color: isSelected ? 'white' : '#1E293B',
        border: isSelected ? '1px solid transparent' : '1px solid #E2E8F0',
        transition: 'all 0.15s',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 4px 12px rgba(14, 165, 233, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {member.name}
    </button>
  )
}
