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

    // Ensure user can only check their own onboarding status
    if (verifiedUserId !== userId) return forbiddenResponse();

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('username, is_pro')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ 
      onboarded: !!(profile?.username && profile.username.length > 0),
      username: profile?.username || null,
      isPro: !!profile?.is_pro
    });
  } catch (err: any) {
    console.error('Check onboarding error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
