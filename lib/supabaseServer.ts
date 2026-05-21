import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase Server environment variables are missing. Using placeholder keys for build-time evaluation.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Verify the calling user's identity from their JWT in the Authorization header.
 * Returns the authenticated user's UUID, or null if the token is missing/invalid.
 */
export async function verifyUser(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    return user.id;
  } catch {
    return null;
  }
}

/** Standard 401 response for unauthenticated requests */
export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Authentication required' },
    { status: 401 }
  );
}

/** Standard 403 response when authenticated user tries to act on another user's data */
export function forbiddenResponse() {
  return NextResponse.json(
    { success: false, error: 'Forbidden: you can only modify your own data' },
    { status: 403 }
  );
}
