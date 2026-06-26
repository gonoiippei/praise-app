import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 一時エンドポイント：津谷秀斗さんの登場メッセージをSlackに投稿
// 投稿後は削除予定
export async function POST() {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!slackWebhookUrl) {
    return NextResponse.json({ error: 'webhook not configured' }, { status: 500 })
  }

  const message = [
    '🎉 *ニューカマー <@U0B1ZUGPLPM> が登場！*',
    '本人からメッセージが届いています：',
    '',
    '> ベイジの諸君、津谷秀斗だ。',
    '> 2000年生まれ、エンジニア。',
    '> 仕事の依頼は歓迎する。',
    '> ただし、ジム時間（19時以降）は基本応答しない。あしからず。',
    '> 諸君と仕事できること、わりと楽しみにしている。',
  ].join('\n')

  const res = await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [
        {
          color: '#0EA5E9',
          fallback: 'ニューカマー登場：津谷秀斗さん',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: message,
              },
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'slack post failed' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
