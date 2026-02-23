import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalResult, todayResult] = await Promise.all([
    supabase.from('praises').select('id', { count: 'exact', head: true }),
    supabase
      .from('praises')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
  ])

  return NextResponse.json({
    total: totalResult.count ?? 0,
    today: todayResult.count ?? 0,
  })
}
