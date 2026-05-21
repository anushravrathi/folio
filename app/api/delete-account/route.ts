import { NextResponse } from 'next/server';
import { supabaseAdmin, verifyUser, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    // Verify authentication
    const verifiedUserId = await verifyUser(req);
    if (!verifiedUserId) return unauthorizedResponse();

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Ensure user can only delete their own account
    if (verifiedUserId !== userId) return forbiddenResponse();

    console.log(`Starting account deletion for userId: ${userId}`);

    // Delete dependent records
    const tables = [
      'skills',
      'projects',
      'experience',
      'social_links',
      'page_views',
      'link_clicks',
      'profile_shares'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin.from(table).delete().eq(table === 'skills' || table === 'projects' || table === 'experience' ? 'profile_id' : 'id', userId);
        if (error) {
          // Some tables might have 'id' instead of 'profile_id' or 'profile_id' instead of 'id'. Let's try both or just be specific.
          // Wait! In save-config:
          // skills: profile_id
          // experience: profile_id
          // projects: profile_id
          // social_links: id (as in upsert({ id: userId, ... }))
          // page_views: profile_id
          // link_clicks: profile_id
          // profile_shares: profile_id
          let queryField = 'profile_id';
          if (table === 'social_links') {
            queryField = 'id';
          }
          const { error: retryError } = await supabaseAdmin.from(table).delete().eq(queryField, userId);
          if (retryError) {
            console.error(`Error deleting from ${table}:`, retryError.message);
          }
        }
      } catch (err: any) {
        console.error(`Exception deleting from ${table}:`, err.message);
      }
    }

    // Now delete from profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError.message);
    }

    // Finally, delete the Auth User using admin auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting auth user:', authError.message);
      return NextResponse.json({ success: false, error: `Auth deletion failed: ${authError.message}` }, { status: 500 });
    }

    console.log(`Successfully deleted account for userId: ${userId}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete account error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
