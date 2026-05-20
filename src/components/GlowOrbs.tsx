'use client'

export default function GlowOrbs() {
  return (
    <>
      <div
        className="glow-orb"
        style={{
          width: 200,
          height: 200,
          background: 'rgba(125, 211, 252, 0.5)',
          top: '8%',
          left: '-50px',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 160,
          height: 160,
          background: 'rgba(244, 114, 182, 0.4)',
          top: '22%',
          right: '-40px',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 240,
          height: 240,
          background: 'rgba(167, 243, 208, 0.45)',
          bottom: '18%',
          left: '8%',
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 140,
          height: 140,
          background: 'rgba(253, 224, 71, 0.45)',
          bottom: '30%',
          right: '12%',
        }}
      />
    </>
  )
}
