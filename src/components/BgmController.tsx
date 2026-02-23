'use client'

import { useEffect, useRef, useState } from 'react'

interface BgmControllerProps {
  enabled: boolean
  onToggle: () => void
}

export default function BgmController({ enabled, onToggle }: BgmControllerProps) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([])
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const startedRef = useRef(false)

  const stopAll = () => {
    intervalRefs.current.forEach(clearInterval)
    timeoutRefs.current.forEach(clearTimeout)
    intervalRefs.current = []
    timeoutRefs.current = []
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    startedRef.current = false
  }

  const playChord = (ctx: AudioContext, frequencies: number[], time: number, duration: number) => {
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0, time)
      gain.gain.linearRampToValueAtTime(0.04, time + 0.3)
      gain.gain.setValueAtTime(0.04, time + duration - 0.5)
      gain.gain.linearRampToValueAtTime(0, time + duration)
      osc.start(time)
      osc.stop(time + duration)
    })
  }

  const playArpeggio = (ctx: AudioContext) => {
    const notes = [523, 659, 784, 1047, 1319]
    const note = notes[Math.floor(Math.random() * notes.length)]
    const time = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = note
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(0.06, time + 0.05)
    gain.gain.linearRampToValueAtTime(0, time + 0.4)
    osc.start(time)
    osc.stop(time + 0.5)
  }

  const playBell = (ctx: AudioContext) => {
    const time = ctx.currentTime
    const freqs = [523, 659, 784]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t = time + i * 0.15
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.05, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5)
      osc.start(t)
      osc.stop(t + 1.6)
    })
  }

  const startBgm = () => {
    if (startedRef.current) return
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    startedRef.current = true

    // コード進行: C→Am→F→G 4秒ごと
    const chords = [
      [261, 329, 392], // C
      [220, 261, 329], // Am
      [174, 220, 261], // F
      [196, 247, 294], // G
    ]
    let chordIndex = 0

    const playNextChord = () => {
      if (!audioCtxRef.current) return
      playChord(audioCtxRef.current, chords[chordIndex], audioCtxRef.current.currentTime, 4)
      chordIndex = (chordIndex + 1) % chords.length
    }
    playNextChord()
    const chordInterval = setInterval(playNextChord, 4000)
    intervalRefs.current.push(chordInterval)

    // きらきらアルペジオ（ランダムタイミング）
    const scheduleArpeggio = () => {
      if (!audioCtxRef.current) return
      playArpeggio(audioCtxRef.current)
      const next = 800 + Math.random() * 2000
      const t = setTimeout(scheduleArpeggio, next)
      timeoutRefs.current.push(t)
    }
    const t1 = setTimeout(scheduleArpeggio, 1000)
    timeoutRefs.current.push(t1)

    // 柔らかいベル（数秒おき）
    const scheduleBell = () => {
      if (!audioCtxRef.current) return
      playBell(audioCtxRef.current)
      const next = 5000 + Math.random() * 8000
      const t = setTimeout(scheduleBell, next)
      timeoutRefs.current.push(t)
    }
    const t2 = setTimeout(scheduleBell, 3000)
    timeoutRefs.current.push(t2)
  }

  useEffect(() => {
    if (enabled) {
      // ユーザー操作後に開始するためクリックイベントを待つ
      const handleFirstInteraction = () => {
        startBgm()
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('touchstart', handleFirstInteraction)
      }
      document.addEventListener('click', handleFirstInteraction)
      document.addEventListener('touchstart', handleFirstInteraction)
      return () => {
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('touchstart', handleFirstInteraction)
      }
    } else {
      stopAll()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  useEffect(() => {
    return () => stopAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 text-sm"
      title={enabled ? 'BGMをOFF' : 'BGMをON'}
    >
      <span style={{ color: '#B8B0D0', fontSize: 12 }}>BGM</span>
      <div className={`toggle-switch ${enabled ? 'on' : 'off'}`}>
        <div className="toggle-knob" />
      </div>
    </button>
  )
}
