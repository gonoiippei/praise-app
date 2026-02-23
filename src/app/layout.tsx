import type { Metadata } from 'next'
import { Zen_Maru_Gothic } from 'next/font/google'
import './globals.css'

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-zen-maru',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '匿名で褒めよう！',
  description: '匿名でチームメンバーを褒め合えるアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${zenMaruGothic.variable} font-zen`}>
        {children}
      </body>
    </html>
  )
}
