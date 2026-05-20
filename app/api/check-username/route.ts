import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

// Reserved usernames that cannot be claimed
const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'app', 'dashboard', 'login', 'signup', 'onboarding',
  'preview', 'settings', 'profile', 'help', 'support', 'about', 'terms',
  'privacy', 'pricing', 'blog', 'docs', 'status', 'folio', 'pro',
  'billing', 'account', 'user', 'users', 'www', 'mail', 'email',
  'test', 'demo', 'null', 'undefined', 'root', 'moderator',
]);

function validateUsername(username: string): { valid: boolean; reason?: string } {
  if (!username || username.length < 3) {
    return { valid: false, reason: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, reason: 'Username must be 20 characters or less' };
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(username) && username.length > 2) {
    return { valid: false, reason: 'Only lowercase letters, numbers, and hyphens allowed' };
  }
  if (/^[a-z0-9]$/.test(username) === false && username.length <= 2) {
    return { valid: false, reason: 'Only lowercase letters and numbers allowed' };
  }
  if (/--/.test(username)) {
    return { valid: false, reason: 'Cannot contain consecutive hyphens' };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return { valid: false, reason: 'This username is reserved' };
  }
  return { valid: true };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username')?.toLowerCase().trim();

    if (!username) {
      return NextResponse.json({ available: false, reason: 'Username is required' }, { status: 400 });
    }

    // Validate format
    const validation = validateUsername(username);
    if (!validation.valid) {
      return NextResponse.json({ available: false, reason: validation.reason });
    }

    // Check uniqueness in database
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Username check error:', error);
      return NextResponse.json({ available: false, reason: 'Server error' }, { status: 500 });
    }

    if (data) {
      return NextResponse.json({ available: false, reason: 'Username is already taken' });
    }

    return NextResponse.json({ available: true });
  } catch (err: any) {
    console.error('Username check error:', err);
    return NextResponse.json({ available: false, reason: 'Server error' }, { status: 500 });
  }
}
