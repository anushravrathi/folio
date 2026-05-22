import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret')

    const expectedSecret = process.env.ADMIN_SECRET || 'launch2026'

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch total profiles count
    const { count: profilesCount, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (profilesError) throw profilesError

    // 2. Fetch total views count
    const { count: viewsCount, error: viewsError } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })

    if (viewsError) throw viewsError

    // 3. Fetch 5 most recently created profiles
    const { data: recentProfiles, error: recentError } = await supabaseAdmin
      .from('profiles')
      .select('username, full_name, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) throw recentError

    return NextResponse.json({
      total_profiles: profilesCount || 0,
      total_views: viewsCount || 0,
      recent_profiles: recentProfiles || [],
    })
  } catch (err: any) {
    console.error('Launch stats API error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
