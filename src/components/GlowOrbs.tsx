'use client'

export default function GlowOrbs() {
  return (
    <>
      <div
        className="glow-orb"
        style={{
          width: 400,
          height: 400,
          background: 'rgba(255, 107, 157, 0.15)',
          top: '-100px',
          left: '-100px',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          background: 'rgba(192, 132, 252, 0.12)',
          top: '30%',
          right: '-150px',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 350,
          height: 350,
          background: 'rgba(96, 195, 255, 0.1)',
          bottom: '-50px',
          left: '30%',
        }}
      />
    </>
  )
}
