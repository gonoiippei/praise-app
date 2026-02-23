'use client'

import { useEffect, useState } from 'react'

const EMOJIS = ['🎉', '✨', '💖', '🌟', '🙌', '💐', '🎊', '⭐', '🔥', '💪', '👏', '🌈', '💫', '🥳', '😍']

interface FloatingEmoji {
  id: number
  emoji: string
  left: number
  duration: number
  delay: number
  size: number
}

export default function FloatingEmojis() {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([])

  useEffect(() => {
    const initial: FloatingEmoji[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      left: Math.random() * 100,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 15,
      size: 16 + Math.floor(Math.random() * 16),
    }))
    setEmojis(initial)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {emojis.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: `${item.left}%`,
            fontSize: item.size,
            animation: `float-up ${item.duration}s ${item.delay}s linear infinite`,
            opacity: 0.6,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  )
}
