import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseClient()
  // JST（UTC+9）基準で今日の0時を算出
  const now = new Date()
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  jstNow.setUTCHours(0, 0, 0, 0)
  const today = new Date(jstNow.getTime() - 9 * 60 * 60 * 1000)

  const [totalResult, todayResult] = await Promise.all([
    supabase.from('praises').select('id', { count: 'exact', head: true }).eq('is_primary', true),
    supabase
      .from('praises')
      .select('id', { count: 'exact', head: true })
      .eq('is_primary', true)
      .gte('created_at', today.toISOString()),
  ])

  return NextResponse.json({
    total: totalResult.count ?? 0,
    today: todayResult.count ?? 0,
  })
}
