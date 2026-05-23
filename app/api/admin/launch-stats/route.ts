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

    // 4. Fetch Pro Users
    const { data: proProfiles, error: proError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, email, created_at')
      .eq('is_pro', true)
      .order('created_at', { ascending: false })

    if (proError) throw proError

    const emailMap: Record<string, string> = {}
    try {
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
      if (!usersError && users) {
        users.forEach((u) => {
          if (u.id && u.email) {
            emailMap[u.id] = u.email
          }
        })
      }
    } catch (e) {
      console.error('Failed to list auth users in admin stats:', e)
    }

    const proUsers = (proProfiles || []).map((p) => ({
      username: p.username,
      full_name: p.full_name,
      email: p.email || emailMap[p.id] || 'no-email@tryfolio.online',
      created_at: p.created_at,
    }))

    return NextResponse.json({
      total_profiles: profilesCount || 0,
      total_views: viewsCount || 0,
      recent_profiles: recentProfiles || [],
      pro_users: proUsers,
    })
  } catch (err: any) {
    console.error('Launch stats API error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
