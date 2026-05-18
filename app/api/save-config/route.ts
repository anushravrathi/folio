import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { config } = await req.json();
    const { id: userId, name, title, location, bio, avatarUrl, isPro, theme, openToWork, socialLinks, leetcodeUsername, skills, experiences, projects, education } = config;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // 1. Update Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        username: name?.toLowerCase().replace(/\s+/g, '') || `user-${userId.substring(0, 5)}`,
        full_name: name,
        title,
        about: bio,
        location,
        avatar_url: avatarUrl,
        is_pro: isPro,
        theme,
        open_to_work: openToWork,
      });

    if (profileError) throw profileError;

    // 2. Update Social Links
    const { error: socialError } = await supabaseAdmin
      .from('social_links')
      .upsert({
        id: userId,
        github: socialLinks.github,
        linkedin: socialLinks.linkedin,
        twitter: socialLinks.twitter,
        leetcode: leetcodeUsername,
      });

    if (socialError) throw socialError;

    // 3. Update Skills (Delete and re-insert for simplicity in this mock)
    await supabaseAdmin.from('skills').delete().eq('profile_id', userId);
    if (skills && skills.length > 0) {
      const skillsData = skills.map((s: string, i: number) => ({
        profile_id: userId,
        name: s,
        sort_order: i,
      }));
      const { error: skillsError } = await supabaseAdmin.from('skills').insert(skillsData);
      if (skillsError) throw skillsError;
    }

    // 4. Update Experience
    await supabaseAdmin.from('experience').delete().eq('profile_id', userId);
    if (experiences && experiences.length > 0) {
      const expData = experiences.map((ex: any, i: number) => ({
        profile_id: userId,
        company_name: ex.company,
        role: ex.role,
        start_month: ex.startMonth,
        end_month: ex.endMonth,
        is_current: ex.isCurrent,
        description: ex.description,
        sort_order: i,
      }));
      const { error: expError } = await supabaseAdmin.from('experience').insert(expData);
      if (expError) throw expError;
    }

    // 5. Update Projects
    await supabaseAdmin.from('projects').delete().eq('profile_id', userId);
    if (projects && projects.length > 0) {
      const projData = projects.map((p: any, i: number) => ({
        profile_id: userId,
        name: p.name,
        description: p.description,
        live_url: p.link,
        sort_order: i,
      }));
      const { error: projError } = await supabaseAdmin.from('projects').insert(projData);
      if (projError) throw projError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Save error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
