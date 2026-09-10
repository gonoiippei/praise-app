interface AvatarProps {
  name: string
  size?: number
}

function getAvatarColor(name: string): string {
  const colors = [
    ['#1B3B6F', '#2C5F9E'], // 藍
    ['#E4572E', '#C13B1B'], // 朱
    ['#C9A227', '#A9700F'], // 山吹
    ['#4E8B57', '#2F6B45'], // 若竹
    ['#5D4E8C', '#3F3566'], // 江戸紫
    ['#2C6E76', '#1E5158'], // 鴨の羽色
    ['#B33A3A', '#8C2A2A'], // 深緋
    ['#7A6A4F', '#5A4C37'], // 利休茶
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
