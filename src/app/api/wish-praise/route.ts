import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { member_id } = body

  if (!member_id) {
    return NextResponse.json({ error: 'メンバーを選択してください' }, { status: 400 })
  }

  const { data: member, error } = await supabase
    .from('members')
    .select('id, name, slack_user_id')
    .eq('id', member_id)
    .single()

  if (error || !member) {
    return NextResponse.json({ error: 'メンバーが見つかりません' }, { status: 404 })
  }

  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
  if (slackWebhookUrl) {
    const mention = member.slack_user_id ? `<@${member.slack_user_id}>` : member.name
    const appUrl = 'https://praise-app-omega.vercel.app'
    try {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🙏 ${mention}さんがほめてほしいらしいよ！`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🙏 *${mention}さんがほめてほしいらしいよ！*`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✨ いつも頑張ってる${member.name}さんに、ぜひ一言ほめを届けよう！`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: '📝 _ほめは匿名で届きます。気軽にどうぞ_',
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
                    text: '✍️ ほめる！',
                    emoji: true,
                  },
                  url: `${appUrl}/send`,
                  style: 'primary',
                },
              ],
            },
          ],
        }),
      })
    } catch {
      // 失敗してもアプリは続行
    }
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
