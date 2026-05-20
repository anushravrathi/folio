import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ProfilePage } from '@/components/profile/ProfilePage';
import React from 'react';
import type { Metadata } from 'next';

// Theme mapping (same as used in ProfilePage component)
const themeMap = {
  default: { glow: 'rgba(124,111,255,0.15)', accent: 'from-[#6C63FF] to-blue-500', primaryColor: '#6C63FF', accentDim: 'rgba(108,99,255,0.13)' },
  emerald: { glow: 'rgba(16,185,129,0.15)', accent: 'from-emerald-500 to-cyan-500', primaryColor: '#10B981', accentDim: 'rgba(16,185,129,0.13)' },
  sunset: { glow: 'rgba(245,158,11,0.15)', accent: 'from-amber-500 to-rose-600', primaryColor: '#F59E0B', accentDim: 'rgba(245,158,11,0.13)' },
  rose: { glow: 'rgba(225,29,72,0.15)', accent: 'from-rose-500 to-violet-600', primaryColor: '#E11D48', accentDim: 'rgba(225,29,72,0.13)' },
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Dynamic SEO metadata
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const { username } = params;
  const supabase = getSupabase();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, title, about, avatar_url')
    .eq('username', username)
    .single();

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

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const { username } = params;
  const supabase = getSupabase();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, projects(*), experience(*), skills(*), social_links(*)')
    .eq('username', username)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Determine theme variables
  const activeTheme = (themeMap as any)[profile.theme || 'default'] || themeMap.default;
  const styleVars: React.CSSProperties = {
    '--color-accent': activeTheme.primaryColor,
    '--color-accent-dim': activeTheme.accentDim,
  } as any; // cast to any to allow custom CSS vars

  return (
    <div style={styleVars} className="min-h-screen bg-page text-primary font-sans">
      <ProfilePage profile={profile} />
    </div>
  );
}
