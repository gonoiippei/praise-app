'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlowOrbs from '@/components/GlowOrbs'
import Avatar from '@/components/Avatar'
import { Member } from '@/types'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingSlackId, setEditingSlackId] = useState<string | null>(null)
  const [slackIdInput, setSlackIdInput] = useState('')

  const fetchMembers = (q = '') => {
    fetch(`/api/members?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then(setMembers)
      .catch(() => {})
  }

  useEffect(() => {
    fetchMembers(searchQuery)
  }, [searchQuery])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '追加に失敗しました')
      } else {
        setNewName('')
        fetchMembers(searchQuery)
      }
    } catch {
      setError('追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSlackIdEdit = (member: Member) => {
    setEditingSlackId(member.id)
    setSlackIdInput(member.slack_user_id || '')
  }

  const handleSlackIdSave = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slack_user_id: slackIdInput.trim() }),
      })
      if (res.ok) {
        setEditingSlackId(null)
        fetchMembers(searchQuery)
      }
    } catch {
      // silent
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE' })
      fetchMembers(searchQuery)
    } catch {
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlowOrbs />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex items-center px-6 py-4">
          <Link href="/" style={{ color: '#B8B0D0', fontSize: 14 }} className="hover:text-white transition-colors">
            ← ホームへ
          </Link>
        </header>

        <main className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
          <h1 className="gradient-text font-black mb-6 text-center" style={{ fontSize: 28 }}>
            メンバー管理 👥
          </h1>

          {/* メンバー追加 */}
          <div className="glass-card p-4 mb-6">
            <h2 style={{ color: '#B8B0D0', fontSize: 13, marginBottom: 12 }}>新しいメンバーを追加</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="名前を入力…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 px-4 py-2 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#F5F3FF',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAdd}
                disabled={loading || !newName.trim()}
                className="btn-main px-4 py-2"
                style={{
                  fontSize: 14,
                  opacity: loading || !newName.trim() ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                追加
              </button>
            </div>
            {error && (
              <p style={{ color: '#FF6B9D', fontSize: 13, marginTop: 8 }}>{error}</p>
            )}
          </div>

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

          {/* メンバー数 */}
          <p style={{ color: '#6E6490', fontSize: 13, marginBottom: 12 }}>
            {members.length} 名
          </p>

          {/* メンバーリスト */}
          <div className="glass-card overflow-hidden">
            {members.length === 0 ? (
              <p className="text-center py-8" style={{ color: '#6E6490' }}>
                メンバーが見つかりません
              </p>
            ) : (
              members.map((member, i) => (
                <div
                  key={member.id}
                  className="px-4 py-3"
                  style={{
                    borderBottom: i < members.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size={36} />
                    <span style={{ flex: 1, color: '#F5F3FF', fontSize: 14 }}>
                      {member.name}
                    </span>
                    <button
                      onClick={() => handleSlackIdEdit(member)}
                      style={{ color: '#6E6490', fontSize: 12, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6 }}
                      className="hover:text-white transition-colors"
                      title="Slack IDを設定"
                    >
                      {member.slack_user_id ? `@${member.slack_user_id}` : 'Slack ID'}
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      style={{ color: '#6E6490', fontSize: 18, padding: '4px 8px' }}
                      className="hover:text-red-400 transition-colors"
                      title="削除"
                    >
                      ×
                    </button>
                  </div>
                  {editingSlackId === member.id && (
                    <div className="flex gap-2 mt-2 ml-12">
                      <input
                        type="text"
                        placeholder="U0123456789"
                        value={slackIdInput}
                        onChange={(e) => setSlackIdInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSlackIdSave(member.id)}
                        autoFocus
                        className="flex-1 px-3 py-1 rounded-lg"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#F5F3FF',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleSlackIdSave(member.id)}
                        style={{ color: '#A78BFA', fontSize: 13, padding: '2px 8px' }}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingSlackId(null)}
                        style={{ color: '#6E6490', fontSize: 13, padding: '2px 8px' }}
                      >
                        キャンセル
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
