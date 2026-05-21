import { NextResponse } from 'next/server';
import { supabaseAdmin, verifyUser, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    // Verify authentication
    const verifiedUserId = await verifyUser(req);
    if (!verifiedUserId) return unauthorizedResponse();

    const { username, fullName, title, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Ensure user can only claim a username for themselves
    if (verifiedUserId !== userId) return forbiddenResponse();

    if (!username || username.length < 3 || username.length > 20) {
      return NextResponse.json({ success: false, error: 'Invalid username' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();

    // Check if username is taken
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Username is already taken' }, { status: 409 });
    }

    // Check if user already has a profile
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      // Update existing profile with username
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          username: cleanUsername,
          full_name: fullName || 'New User',
          title: title || '',
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    } else {
      // Create new profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          username: cleanUsername,
          full_name: fullName || 'New User',
          title: title || '',
          about: '',
          location: '',
          avatar_url: '',
          open_to_work: true,
          is_pro: false,
          theme: 'default',
        });

      if (profileError) throw profileError;

      // Create empty social_links row
      const { error: socialError } = await supabaseAdmin
        .from('social_links')
        .insert({
          id: userId,
          github: '',
          linkedin: '',
          twitter: '',
          leetcode: '',
        });

      if (socialError) {
        console.error('Social links creation error (non-fatal):', socialError);
      }
    }

    return NextResponse.json({ success: true, username: cleanUsername });
  } catch (err: any) {
    console.error('Claim username error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
