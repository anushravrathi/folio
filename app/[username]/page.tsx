import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { themeMap } from '@/lib/themes';
import React from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Dynamic SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, title, about, avatar_url')
    .eq('username', username)
    .maybeSingle();

  if (!profile) {
    return {
      title: 'Profile Not Found — Folio',
      description: 'This Folio profile does not exist.',
    };
  }

  const displayName = profile.full_name || username;
  const description = profile.about || `${displayName}'s professional profile on Folio`;

  return {
    title: `${displayName} — Folio`,
    description,
    openGraph: {
      title: `${displayName} — Folio`,
      description,
      type: 'profile',
      ...(profile.avatar_url ? { images: [{ url: profile.avatar_url }] } : {}),
    },
    twitter: {
      card: 'summary',
      title: `${displayName} — Folio`,
      description,
      ...(profile.avatar_url ? { images: [profile.avatar_url] } : {}),
    },
  };
}

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  console.log('[DEBUG PublicProfile] Fetching username:', username);
  console.log('[DEBUG PublicProfile] SUPABASE_SERVICE_ROLE_KEY is defined:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*, projects(*), experience(*), skills(*), social_links(*)')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('[DEBUG PublicProfile] Error fetching profile:', error);
  } else {
    console.log('[DEBUG PublicProfile] Profile found:', !!profile);
  }

  if (error || !profile) {
    notFound();
  }

  // Determine theme variables
  const activeTheme = (themeMap as any)[profile.theme || 'default'] || themeMap.default;
  const styleVars: React.CSSProperties = {
    '--color-accent': activeTheme.primaryColor,
    '--color-accent-dim': activeTheme.accentDim,
    '--color-page': activeTheme.pageBg,
    '--color-surface': activeTheme.surfaceBg,
    '--color-elevated': activeTheme.elevatedBg,
    '--color-primary': activeTheme.primaryText,
    '--color-secondary': activeTheme.secondaryText,
    '--color-tertiary': activeTheme.tertiaryText,
    '--color-border-subtle': activeTheme.borderSubtle,
    '--color-border-focus': activeTheme.borderFocus,
    ...(activeTheme.badgeOpenBg && { '--color-badge-open-bg': activeTheme.badgeOpenBg }),
    ...(activeTheme.badgeOpenFg && { '--color-badge-open-fg': activeTheme.badgeOpenFg }),
    ...(activeTheme.badgeInternBg && { '--color-badge-intern-bg': activeTheme.badgeInternBg }),
    ...(activeTheme.badgeInternFg && { '--color-badge-intern-fg': activeTheme.badgeInternFg }),
    ...(activeTheme.badgeFullBg && { '--color-badge-full-bg': activeTheme.badgeFullBg }),
    ...(activeTheme.badgeFullFg && { '--color-badge-full-fg': activeTheme.badgeFullFg }),
    ...(activeTheme.badgeBuildBg && { '--color-badge-build-bg': activeTheme.badgeBuildBg }),
    ...(activeTheme.badgeBuildFg && { '--color-badge-build-fg': activeTheme.badgeBuildFg }),
    ...(activeTheme.badgeDiscBg && { '--color-badge-disc-bg': activeTheme.badgeDiscBg }),
    ...(activeTheme.badgeDiscFg && { '--color-badge-disc-fg': activeTheme.badgeDiscFg }),
  } as any; // cast to any to allow custom CSS vars

  // Generate dynamic JSON-LD structured data for Google Search Profile Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": profile.full_name || username,
      "jobTitle": profile.title || "Developer",
      "description": profile.about || `${profile.full_name || username}'s professional profile on Folio`,
      "image": profile.avatar_url || undefined,
      "sameAs": [
        profile.social_links?.github ? `https://github.com/${profile.social_links.github}` : null,
        profile.social_links?.linkedin ? `https://linkedin.com/in/${profile.social_links.linkedin}` : null,
        profile.social_links?.twitter ? `https://twitter.com/${profile.social_links.twitter}` : null,
        profile.social_links?.website || null,
      ].filter(Boolean)
    }
  };

  return (
    <div style={styleVars} className="min-h-screen bg-page text-primary font-sans transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfilePage profile={profile} />
    </div>
  );
}

