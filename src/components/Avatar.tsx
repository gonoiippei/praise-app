interface AvatarProps {
  name: string
  size?: number
}

function getAvatarColor(name: string): string {
  const colors = [
    ['#FF6B9D', '#C084FC'],
    ['#60C3FF', '#34D399'],
    ['#FFD43B', '#FF9F43'],
    ['#C084FC', '#60C3FF'],
    ['#34D399', '#60C3FF'],
    ['#FF9F43', '#FF6B9D'],
    ['#60C3FF', '#C084FC'],
    ['#FF6B9D', '#FFD43B'],
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return `linear-gradient(135deg, ${colors[index][0]}, ${colors[index][1]})`
}

export default function Avatar({ name, size = 48 }: AvatarProps) {
  const char = name.charAt(0)
  const gradient = getAvatarColor(name)
  const fontSize = Math.floor(size * 0.38)

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: gradient,
        fontSize,
      }}
    >
      {char}
    </div>
  )
}
