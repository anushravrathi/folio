import { NextResponse } from 'next/server';
import { supabaseAdmin, verifyUser, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    // Verify authentication
    const verifiedUserId = await verifyUser(req);
    if (!verifiedUserId) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Ensure user can only load their own profile
    if (verifiedUserId !== userId) return forbiddenResponse();

    // Load profile and related tables using admin key (bypassing RLS client-side limitations)
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*, projects(*), experience(*), skills(*), social_links(*)')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    // Standardize structure for frontend
    const formattedProfile = {
      ...profile,
      projects: profile.projects || [],
      experience: profile.experience || [],
      skills: profile.skills || [],
      social_links: profile.social_links || null
    };

    return NextResponse.json({ profile: formattedProfile });
  } catch (err: any) {
    console.error('Load profile error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
