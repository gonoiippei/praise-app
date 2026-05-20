import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// マイルストーン通知の文言パターン（5種類）
// index 0 が「案7：気が向いたら」（350件目で確定使用）
const MILESTONE_PATTERNS = [
  // 案7：気が向いたら
  (n: number) => ({
    title: `🗓 累計 ${n}件、達成。`,
    body:
      `たぶん通知に気づかない人もいるかもしれませんが、\n` +
      `ほめ通信、${n}件目を通過しました。\n` +
      `気が向いたら、一覧をめくってみてください。\n\n` +
      `自分宛てのものを探すのもいいし、\n` +
      `他の人がどんなふうに褒められているかを眺めるのもいい。\n` +
      `何かしらの発見が、たぶんあります。`,
  }),
  // 案11：立ち止まる
  (n: number) => ({
    title: `🏁 ${n}件目、通過。`,
    body:
      `何かが劇的に変わるわけじゃないけど、\n` +
      `${n}件という数字は、\n` +
      `ちょっと立ち止まって眺めるに値する数です。\n\n` +
      `立ち止まる、というのは案外贅沢な行為で、\n` +
      `忙しい毎日の中ではなかなか難しい。\n` +
      `こういう節目のときくらいは、許されている気がします。`,
  }),
  // 案2:劇的じゃない節目
  (n: number) => ({
    title: `🏁 ${n}件、通過。`,
    body:
      `劇的なことは起きません。\n` +
      `でも、${n}件という数字には、\n` +
      `${n}回ぶんの「気にかける」が含まれています。\n\n` +
      `気にかける、というのは案外むずかしい行為です。\n` +
      `忙しさの中で誰かのいいところに目を留めて、\n` +
      `ちゃんと言葉にして、送る。それを ${n}回。`,
  }),
  // 案1:段ボール
  (n: number) => ({
    title: `📦 累計 ${n}件`,
    body:
      `ほめが ${n}件 になりました。\n` +
      `1件をハガキ1枚に書いたら、ちょうど小さな段ボール1箱分。\n` +
      `そう考えると、なかなかの「想い」の量です。\n\n` +
      `このうちの何枚かが、誰かの引き出しに大切にしまわれている。\n` +
      `そんな想像をすると、ちょっと不思議な気持ちになります。\n` +
      `書いた人も、もらった人も、もう忘れているかもしれないけれど。`,
  }),
  // 案5:事実をお伝え
  (n: number) => ({
    title: `🗒 累計 ${n}件、記録。`,
    body:
      `派手にお祝いするより、ただ事実をお伝えします。\n` +
      `ほめが ${n}件 になりました。\n` +
      `誰かが誰かを認める瞬間が、${n}回あったということです。\n\n` +
      `数字としては地味ですが、内訳を想像すると面白い。\n` +
      `${n}人ぶんの「ありがとう」の角度が、ぜんぶ違うはずです。\n` +
      `誰のために、何を、どう言葉にしたか。それぞれの正解で。`,
  }),
]

function getMilestoneMessage(n: number): { title: string; body: string } {
  // 350件目は確定で案7（最初のお披露目）
  if (n === 350) return MILESTONE_PATTERNS[0](n)
  // それ以外は5パターンからランダム
  const idx = Math.floor(Math.random() * MILESTONE_PATTERNS.length)
  return MILESTONE_PATTERNS[idx](n)
}

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
      // マイルストーン通知（is_primary=trueの件数で判定、50件ごと）
      const { count: totalCount } = await supabase
        .from('praises')
        .select('id', { count: 'exact', head: true })
        .eq('is_primary', true)

      if (totalCount && totalCount > 0 && totalCount % 50 === 0) {
        const milestone = getMilestoneMessage(totalCount)
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attachments: [
              {
                color: '#F59E0B',
                fallback: `🏆 累計${totalCount}件達成！`,
                blocks: [
                  {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: `*${milestone.title}*\n<!channel>\n${milestone.body}`,
                    },
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
