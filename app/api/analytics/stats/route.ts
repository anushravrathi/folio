import { NextResponse } from 'next/server';
import { supabaseAdmin, verifyUser, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    // Verify authentication
    const verifiedUserId = await verifyUser(req);
    if (!verifiedUserId) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profile_id');
    const period = searchParams.get('period') || '7d';

    if (!profileId) {
      return NextResponse.json({ error: 'profile_id is required' }, { status: 400 });
    }

    // Ensure user can only view their own analytics
    if (verifiedUserId !== profileId) return forbiddenResponse();

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

    // Calculate traffic sources with dynamic host/domain parsing and cleaning
    const views = viewsRes.data || [];
    const sourceMap: Record<string, number> = {};
    
    const getCleanSource = (sourceStr: string): string => {
      if (!sourceStr) return 'Direct';
      const clean = sourceStr.trim().toLowerCase();
      if (clean === 'direct' || clean === 'none' || clean === '') return 'Direct';

      // Check common keywords and normalize
      if (clean.includes('linkedin') || clean.includes('lnkd.in')) return 'LinkedIn';
      if (clean.includes('twitter') || clean.includes('x.com') || clean.includes('t.co')) return 'Twitter';
      if (clean.includes('github')) return 'GitHub';
      if (clean.includes('google')) return 'Google';
      if (clean.includes('instagram')) return 'Instagram';
      if (clean.includes('facebook') || clean.includes('fb.com')) return 'Facebook';
      if (clean.includes('reddit')) return 'Reddit';
      if (clean.includes('peerlist')) return 'Peerlist';
      if (clean.includes('producthunt')) return 'Product Hunt';
      if (clean.includes('ycombinator') || clean.includes('hn.')) return 'Hacker News';
      if (clean.includes('dev.to')) return 'Dev.to';
      if (clean.includes('medium')) return 'Medium';
      if (clean.includes('youtube')) return 'YouTube';
      if (clean.includes('discord')) return 'Discord';

      // Try parsing as URL to show domain name instead of "Other" or the full URL path
      try {
        if (clean.startsWith('http://') || clean.startsWith('https://')) {
          const url = new URL(clean);
          let host = url.hostname;
          if (host.startsWith('www.')) {
            host = host.substring(4);
          }
          return host.charAt(0).toUpperCase() + host.slice(1);
        }
      } catch (e) {
        // Ignore and fall through to direct string formatting
      }

      // Format custom strings (e.g. "newsletter" -> "Newsletter")
      return sourceStr.charAt(0).toUpperCase() + sourceStr.slice(1);
    };

    views.forEach(v => {
      const normalizedSource = getCleanSource(v.source);
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
