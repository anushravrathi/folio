import { createClient } from '@supabase/supabase-js';

// The Supabase URL and anon key are expected to be provided via environment variables.
// Next.js 16 uses a server runtime for most API routes, so we expose the variables as
// NEXT_PUBLIC_ prefixes for any client‑side usage (e.g., auth flow) and keep the secret
// version for server‑only contexts.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. The client will not function correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for server‑side functions that need to act on behalf of a logged‑in user.
// It extracts the user ID from the Supabase auth cookie.
export async function getSupabaseClient(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  return client;
}
