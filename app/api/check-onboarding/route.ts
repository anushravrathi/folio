import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ 
      onboarded: !!(profile?.username && profile.username.length > 0),
      username: profile?.username || null
    });
  } catch (err: any) {
    console.error('Check onboarding error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
