'use client'

import { useEffect, useRef } from 'react'

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

    const chords = [
      [261, 329, 392],
      [220, 261, 329],
      [174, 220, 261],
      [196, 247, 294],
    ]
    let chordIndex = 0

    const playNextChord = () => {
      if (!audioCtxRef.current) return
      playChord(audioCtxRef.current, chords[chordIndex], audioCtxRef.current.currentTime, 4)
      chordIndex = (chordIndex + 1) % chords.length
    }
    playNextChord()
    intervalRefs.current.push(setInterval(playNextChord, 4000))

    const scheduleArpeggio = () => {
      if (!audioCtxRef.current) return
      playArpeggio(audioCtxRef.current)
      timeoutRefs.current.push(setTimeout(scheduleArpeggio, 800 + Math.random() * 2000))
    }
    timeoutRefs.current.push(setTimeout(scheduleArpeggio, 1000))

    const scheduleBell = () => {
      if (!audioCtxRef.current) return
      playBell(audioCtxRef.current)
      timeoutRefs.current.push(setTimeout(scheduleBell, 5000 + Math.random() * 8000))
    }
    timeoutRefs.current.push(setTimeout(scheduleBell, 3000))
  }

  useEffect(() => {
    if (enabled) {
      // ONにした瞬間のクリック自体がユーザー操作なので即時起動
      startBgm()
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
    <div className="flex items-center gap-3">
      {!enabled && (
        <span style={{ color: '#B8B0D0', fontSize: 13, maxWidth: 160, lineHeight: 1.4, textAlign: 'right' }}>
          オンにすると素敵な音楽が流れます♪
        </span>
      )}
      {enabled && (
        <span style={{ color: '#C084FC', fontSize: 13, lineHeight: 1.4 }}>
          ♪ 音楽が流れています
        </span>
      )}
      <button
        onClick={onToggle}
        className="flex items-center gap-2"
        title={enabled ? 'BGMをOFF' : 'BGMをON'}
      >
        <span style={{ color: '#B8B0D0', fontSize: 14, fontWeight: 700 }}>BGM</span>
        <div className={`toggle-switch ${enabled ? 'on' : 'off'}`}>
          <div className="toggle-knob" />
        </div>
      </button>
    </div>
  )
}
