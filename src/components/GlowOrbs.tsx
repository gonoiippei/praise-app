'use client'

export default function GlowOrbs() {
  return (
    <>
      <div
        className="glow-orb"
        style={{
          width: 200,
          height: 200,
          background: 'rgba(44, 95, 158, 0.16)',
          top: '8%',
          left: '-50px',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 160,
          height: 160,
          background: 'rgba(226, 87, 46, 0.20)',
          top: '22%',
          right: '-40px',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 240,
          height: 240,
          background: 'rgba(107, 163, 104, 0.16)',
          bottom: '18%',
          left: '8%',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 140,
          height: 140,
          background: 'rgba(226, 160, 61, 0.26)',
          bottom: '30%',
          right: '12%',
        }}
      />
    </>
  )
}
