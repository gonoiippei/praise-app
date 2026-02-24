import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('member_id')
  const limit = parseInt(searchParams.get('limit') || '50')

  let queryBuilder = supabase
    .from('praises')
    .select('*, members(id, name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (memberId) {
    queryBuilder = queryBuilder.eq('member_id', memberId)
  }

  const { data, error } = await queryBuilder

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { member_id, message, source = 'web' } = body

  if (!member_id || !message || !message.trim()) {
    return NextResponse.json({ error: 'メンバーとメッセージを入力してください' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('praises')
    .insert({ member_id, message: message.trim(), source })
    .select('*, members(id, name)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Slack に通知
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
  if (slackWebhookUrl && data.members) {
    const memberName = (data.members as { name: string }).name
    const appUrl = 'https://praise-app-omega.vercel.app'
    try {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎉 ${memberName} さんが褒められました！`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '✨ *ほめ通信が届きました* ✨',
              },
            },
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `🎉 ${memberName} さんが褒められました！`,
                emoji: true,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `💬 *褒めメッセージ：*\n> ${data.message}`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: '📝 _匿名の誰かより、こっそりと。_',
                },
              ],
            },
            {
              type: 'divider',
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '🌟 褒め一覧を見る',
                    emoji: true,
                  },
                  url: `${appUrl}/praises`,
                  style: 'primary',
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '✍️ 誰かを褒める',
                    emoji: true,
                  },
                  url: appUrl,
                },
              ],
            },
          ],
        }),
      })
    } catch {
      // Slack通知失敗してもアプリは続行
    }
  }

  return NextResponse.json(data, { status: 201 })
}
