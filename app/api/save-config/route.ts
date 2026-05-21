import { NextResponse } from 'next/server';
import { supabaseAdmin, verifyUser, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer';
import { cleanDomain, isValidDomain } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    // Verify authentication
    const verifiedUserId = await verifyUser(req);
    if (!verifiedUserId) return unauthorizedResponse();

    const { config } = await req.json();
    const { 
      id: userId, username, name, title, location, bio, avatarUrl, cvUrl, email,
      theme, openToWork, socialLinks, githubUsername, leetcodeUsername, 
      skills, experiences, projects, education 
    } = config;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Ensure user can only save their own config
    if (verifiedUserId !== userId) return forbiddenResponse();

    // Fetch the user's true DB pro status first (do not trust isPro from the request)
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .maybeSingle();

    const actualIsPro = currentProfile?.is_pro || false;

    // Validate and clean custom domain
    let finalCustomDomain = '';
    if (config.customDomain) {
      const cleaned = cleanDomain(config.customDomain);
      if (cleaned) {
        if (!isValidDomain(cleaned)) {
          return NextResponse.json({ 
            success: false, 
            error: 'Invalid custom domain format. Please enter a valid domain name (e.g. yourname.com).' 
          }, { status: 400 });
        }

        // Prevent system domains
        const systemDomains = ['localhost', 'folio.in', 'www.folio.in', 'tryfolio.online', 'www.tryfolio.online'];
        if (systemDomains.some(sys => cleaned === sys || cleaned.endsWith('.' + sys))) {
          return NextResponse.json({ 
            success: false, 
            error: 'System domains cannot be registered as custom domains.' 
          }, { status: 400 });
        }

        // Enforce Pro status on backend
        if (!actualIsPro) {
          return NextResponse.json({ 
            success: false, 
            error: 'Custom domains require a Pro subscription. Please upgrade to use this feature.' 
          }, { status: 403 });
        }

        // Uniqueness check: ensure no other user has connected this domain
        const { data: duplicateProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, username')
          .eq('custom_domain', cleaned)
          .neq('id', userId)
          .maybeSingle();

        if (duplicateProfile) {
          return NextResponse.json({ 
            success: false, 
            error: 'This custom domain is already connected to another Folio profile.' 
          }, { status: 400 });
        }

        finalCustomDomain = cleaned;
      }
    }

    // 1. Update Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        username: username || name?.toLowerCase().replace(/\s+/g, '') || `user-${userId.substring(0, 5)}`,
        full_name: name,
        title,
        about: bio,
        location,
        avatar_url: avatarUrl,
        is_pro: actualIsPro,
        theme,
        open_to_work: openToWork,
        cv_url: cvUrl || '',
        email: email || '',
        custom_domain: finalCustomDomain,
        education_degree: education?.degree || '',
        education_school: education?.school || '',
        education_cgpa: education?.cgpa || '',
        education_year: education?.year || '',
        spotify_track_url: config.spotifyTrackUrl || '',
        spotify_data: config.spotifyData || null,
        show_github_activity: config.showGithubActivity ?? true,
        is_deployed: true,
        deployed_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    // 2. Update Social Links
    const { error: socialError } = await supabaseAdmin
      .from('social_links')
      .upsert({
        id: userId,
        github: githubUsername || socialLinks?.github || '',
        linkedin: socialLinks?.linkedin || '',
        twitter: socialLinks?.twitter || '',
        leetcode: leetcodeUsername || '',
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
