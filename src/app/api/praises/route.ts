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
    try {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎉 *${(data.members as { name: string }).name}* さんが褒められました！\n\n💬 褒めメッセージ：\n${data.message}\n\n📝 匿名の誰かより`,
        }),
      })
    } catch {
      // Slack通知失敗してもアプリは続行
    }
  }

  return NextResponse.json(data, { status: 201 })
}
