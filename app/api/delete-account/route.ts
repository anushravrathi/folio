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

    // Delete dependent records explicitly to resolve foreign key constraints cleanly
    const tableFieldMap: Record<string, string> = {
      'skills': 'profile_id',
      'projects': 'profile_id',
      'experience': 'profile_id',
      'social_links': 'id',
      'page_views': 'profile_id',
      'link_clicks': 'profile_id',
      'profile_shares': 'profile_id'
    };

    for (const table of Object.keys(tableFieldMap)) {
      try {
        const queryField = tableFieldMap[table];
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq(queryField, userId);

        if (error) {
          console.error(`Error deleting from ${table}:`, error.message);
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
