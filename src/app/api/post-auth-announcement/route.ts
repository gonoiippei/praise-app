import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 一時エンドポイント：Basic認証切替のお知らせをSlack投稿
// 投稿後は削除予定
export async function POST() {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!slackWebhookUrl) {
    return NextResponse.json({ error: 'webhook not configured' }, { status: 500 })
  }

  const text = [
    '📣 *ほめ通信、ログイン方式を変えました*',
    '',
    '<!channel>',
    '',
    '先日ご案内した Slackログイン、うまく機能しなかったので、*Basic認証* 方式に切り替えました。',
    '',
    '▼ アクセス方法',
    '1. URL：https://praise-app-omega.vercel.app/',
    '2. 開いた瞬間にブラウザからログインダイアログが出るので、以下を入力',
    '',
    '```',
    'ユーザー名：baigie',
    'パスワード：mottohometekure',
    '```',
    '',
    '3. *一度ログインすれば、以降は自動で認証されます*（ブラウザが覚えてくれるので）',
    '4. 社外の人には見せないでください🙏',
    '',
    '▼ ちなみに',
    'Slackログインを実装した五ノ井のせいで、この2週間ほど誰も使えず、ほめの流量が激減しました。すみません。',
    '再開しましたので、また身の回りの誰かへのほめ、送ってあげてください。',
    '',
    '不具合や「ログインできない」あれば <@U033FU5PNES> まで 🙏',
  ].join('\n')

  const res = await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [
        {
          color: '#F5C043',
          fallback: 'ほめ通信、ログイン方式をBasic認証に切り替えました',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text,
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
