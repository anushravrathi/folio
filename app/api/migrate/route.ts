import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST() {
  const results: string[] = [];

  // Add missing columns to profiles
  const alterQueries = [
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_url text`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_deployed boolean DEFAULT false`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deployed_at timestamp`,
  ];

  for (const sql of alterQueries) {
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql }).maybeSingle();
    if (error) {
      // Try raw approach if rpc doesn't exist
      results.push(`Note: ${sql} — rpc not available, will try direct`);
    } else {
      results.push(`OK: ${sql}`);
    }
  }

  // Create profile_shares table if not exists
  const { error: tableError } = await supabaseAdmin.from('profile_shares').select('id').limit(1);
  if (tableError?.code === '42P01') {
    results.push('profile_shares table does not exist — needs manual creation in Supabase SQL editor');
  } else {
    results.push('profile_shares table exists');
  }

  return NextResponse.json({ results, message: 'Migration attempted. If ALTER TABLE failed via API, run the SQL manually in Supabase SQL Editor.' });
}
