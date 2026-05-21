import { NextResponse } from 'next/server';
import { supabaseAdmin, verifyUser, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    // Verify authentication
    const verifiedUserId = await verifyUser(req);
    if (!verifiedUserId) return unauthorizedResponse();

    const { userId, newUsername } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Ensure user can only update their own username
    if (verifiedUserId !== userId) return forbiddenResponse();

    if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
      return NextResponse.json({ success: false, error: 'Invalid username' }, { status: 400 });
    }

    const cleanUsername = newUsername.toLowerCase().trim();

    // Validate format
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(cleanUsername) && cleanUsername.length > 2) {
      return NextResponse.json({ success: false, error: 'Only lowercase letters, numbers, and hyphens allowed' }, { status: 400 });
    }

    // Check if username is taken by someone else
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existing && existing.id !== userId) {
      return NextResponse.json({ success: false, error: 'Username is already taken' }, { status: 409 });
    }

    // Update username
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ username: cleanUsername })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, username: cleanUsername });
  } catch (err: any) {
    console.error('Update username error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
