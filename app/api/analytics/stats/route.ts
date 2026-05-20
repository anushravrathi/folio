import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profile_id');
    const period = searchParams.get('period') || '7d';

    if (!profileId) {
      return NextResponse.json({ error: 'profile_id is required' }, { status: 400 });
    }

    // Check if user is pro
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_pro')
      .eq('id', profileId)
      .single();

    if (!profile?.is_pro) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    // Calculate date range
    let startDate: Date;
    const now = new Date();
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString();

    // Fetch all data in parallel
    const [viewsRes, clicksRes, sharesRes, allViewsRes] = await Promise.all([
      // Total views in period
      supabaseAdmin
        .from('page_views')
        .select('id, viewed_at, source', { count: 'exact' })
        .eq('profile_id', profileId)
        .gte('viewed_at', startDateStr),

      // Link clicks in period
      supabaseAdmin
        .from('link_clicks')
        .select('id, link_type, clicked_at', { count: 'exact' })
        .eq('profile_id', profileId)
        .gte('clicked_at', startDateStr),

      // Shares in period
      supabaseAdmin
        .from('profile_shares')
        .select('id, method, shared_at', { count: 'exact' })
        .eq('profile_id', profileId)
        .gte('shared_at', startDateStr),

      // All views for time series (last 30 days max for charting)
      supabaseAdmin
        .from('page_views')
        .select('viewed_at')
        .eq('profile_id', profileId)
        .gte('viewed_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('viewed_at', { ascending: true }),
    ]);

    // Count views
    const totalViews = viewsRes.count || 0;

    // Count clicks by type
    const clicks = clicksRes.data || [];
    const totalClicks = clicksRes.count || 0;
    const cvDownloads = clicks.filter(c => c.link_type === 'cv_download').length;
    const emailClicks = clicks.filter(c => c.link_type === 'email').length;

    // Count shares
    const totalShares = sharesRes.count || 0;

    // Calculate traffic sources
    const views = viewsRes.data || [];
    const sourceMap: Record<string, number> = {};
    views.forEach(v => {
      const source = v.source || 'Direct';
      // Normalize source names
      let normalizedSource = 'Direct';
      if (source.includes('linkedin')) normalizedSource = 'LinkedIn';
      else if (source.includes('twitter') || source.includes('x.com')) normalizedSource = 'Twitter';
      else if (source.includes('google')) normalizedSource = 'Google';
      else if (source.includes('github')) normalizedSource = 'GitHub';
      else if (source !== 'direct' && source !== 'Direct' && source !== '') normalizedSource = 'Other';
      
      sourceMap[normalizedSource] = (sourceMap[normalizedSource] || 0) + 1;
    });

    const sources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Build views over time (daily aggregation)
    const allViews = allViewsRes.data || [];
    const dailyMap: Record<string, number> = {};
    
    // Initialize all days in the period
    const daysCount = period === '7d' ? 7 : 30;
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }
    
    allViews.forEach(v => {
      const dateStr = new Date(v.viewed_at).toISOString().split('T')[0];
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr]++;
      }
    });

    const viewsOverTime = Object.entries(dailyMap)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      totalViews,
      totalClicks,
      totalShares,
      cvDownloads,
      emailClicks,
      sources,
      viewsOverTime,
    });
  } catch (err: any) {
    console.error('Analytics stats error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
