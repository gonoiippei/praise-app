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
    .select('*, members(id, name, slack_user_id)')
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
  const { member_ids, message, source = 'web' } = body

  // member_ids は必須（配列）
  if (!member_ids || !Array.isArray(member_ids) || member_ids.length === 0 || !message || !message.trim()) {
    return NextResponse.json({ error: 'メンバーとメッセージを入力してください' }, { status: 400 })
  }

  // 複数人の場合は group_id を生成して紐付ける
  const groupId = member_ids.length > 1 ? crypto.randomUUID() : null

  const rows = member_ids.map((id: string, index: number) => ({
    member_id: id,
    message: message.trim(),
    source,
    group_id: groupId,
    is_primary: index === 0, // 最初の1件だけ true（カウント用）
  }))

  const { data, error } = await supabase
    .from('praises')
    .insert(rows)
    .select('*, members(id, name, slack_user_id)')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Slack に通知（1通にまとめる）
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
  if (slackWebhookUrl && data && data.length > 0) {
    const memberTexts = data.map((d) => {
      const member = d.members as { name: string; slack_user_id?: string | null } | null
      return member?.slack_user_id ? `<@${member.slack_user_id}>` : (member?.name || '')
    }).filter(Boolean)
    const memberTextsStr = memberTexts.join('・')
    const appUrl = 'https://praise-app-omega.vercel.app'
    try {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [
            {
              color: '#FF6B9D',
              fallback: `🎉 ${memberTextsStr}さんがほめられました！`,
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `🎉 *${memberTextsStr}さんがほめられました！*`,
                  },
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `💬 *ほめメッセージ：*\n> ${message.trim()}`,
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
                  type: 'actions',
                  elements: [
                    {
                      type: 'button',
                      text: {
                        type: 'plain_text',
                        text: '🌟 ほめ一覧を見る',
                        emoji: true,
                      },
                      url: `${appUrl}/praises`,
                      style: 'primary',
                    },
                    {
                      type: 'button',
                      text: {
                        type: 'plain_text',
                        text: '✍️ 誰かをほめる',
                        emoji: true,
                      },
                      url: appUrl,
                    },
                  ],
                },
              ],
            },
          ],
        }),
      })
      // マイルストーン通知（is_primary=trueの件数で判定）
      const { count: totalCount } = await supabase
        .from('praises')
        .select('id', { count: 'exact', head: true })
        .eq('is_primary', true)

      const MILESTONES = [100, 150, 200, 300, 500, 1000]
      if (totalCount && MILESTONES.includes(totalCount)) {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🏆 累計${totalCount}件達成！`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `🎊 累計${totalCount}件達成おめでとう！`,
                  emoji: true,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `みんなのほめが *${totalCount}件* になりました！\nほめてくれたみなさん、ありがとうございます ✨\nほめがめぐりめぐって、この世界をちょっとだけよくしています 🌍`,
                },
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
                      text: '🌟 ほめ一覧を見る',
                      emoji: true,
                    },
                    url: `${appUrl}/praises`,
                    style: 'primary',
                  },
                ],
              },
            ],
          }),
        })
      }
    } catch {
      // Slack通知失敗してもアプリは続行
    }
  }

  return NextResponse.json(data, { status: 201 })
}
