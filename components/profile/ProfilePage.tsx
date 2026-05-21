"use client"
import React, { useState, useCallback } from "react"

import { Badge } from "@/components/ui/Badge"
import { MapPin, Mail, FileText, GraduationCap, Share2, Copy, X, Check } from "lucide-react"
import Link from "next/link"
import { ExperienceCard } from "./ExperienceCard"
import { ProjectCard } from "./ProjectCard"
import { SocialIcons } from "@/lib/icons"
import { SpotifyWidget } from "./SpotifyWidget"
import { LeetcodeWidget } from "./LeetcodeWidget"
import { Button } from "@/components/ui/Button"
import { themeMap } from "@/lib/themes";

interface ProfilePageProps {
  config?: any;
  profile?: any;
}

function trackAnalytics(profileId: string, type: string, extra: Record<string, string> = {}) {
  if (!profileId || profileId === "00000000-0000-0000-0000-000000000000") return
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: profileId, type, ...extra })
  }).catch(console.error)
}

export function ProfilePage({ config, profile }: ProfilePageProps) {
  const [activeShareMenu, setActiveShareMenu] = useState<'float' | 'header' | null>(null)
  const [copied, setCopied] = useState(false)

  // Use profile if provided (public view), otherwise use config (dashboard preview)
  const data = profile || config;
  
  const theme = data?.theme || 'default'
  const name = data?.full_name || data?.name || "[Your Name]"
  const title = data?.title || "[Your Professional Title]"
  const location = data?.location || "[City, Country]"
  const bio = data?.about || data?.bio || "Share a little bit about who you are and what you enjoy building."
  const avatarUrl = data?.avatar_url || data?.avatarUrl || ""
  const openToWork = data?.open_to_work ?? data?.openToWork ?? false
  const profileId = data?.id || ""
  const username = data?.username || ""
  const profileEmail = data?.email || ""
  const cvUrl = data?.cv_url || data?.cvUrl || ""
  
  const githubUsername = data?.githubUsername || data?.social_links?.github || ""
  const leetcodeUsername = data?.leetcodeUsername || data?.social_links?.leetcode || ""
  const spotify = data?.spotifyData || data?.spotify_data || null
  const socialLinks = data?.socialLinks || { 
    github: data?.social_links?.github || "", 
    linkedin: data?.social_links?.linkedin || "", 
    twitter: data?.social_links?.twitter || "" 
  }
  const showGithubActivity = data?.showGithubActivity ?? data?.show_github_activity ?? true

  const ed = data?.education || {
    degree: data?.education_degree || "",
    school: data?.education_school || "",
    cgpa: data?.education_cgpa || "",
    year: data?.education_year || ""
  }
  const hasEducation = !!(ed?.degree || ed?.school)

  const rawSkills = data?.skills || []
  const skills = rawSkills.length > 0 
    ? (typeof rawSkills[0] === 'string' ? rawSkills : rawSkills.map((s: any) => s.name))
    : ["Your", "Core", "Skills", "Appear", "Here"]
  
  const rawExperiences = data?.experiences || data?.experience || []
  const experiences = [...rawExperiences].sort((a, b) => {
    if (a.is_current && !b.is_current) return -1
    if (!a.is_current && b.is_current) return 1
    const dateA = new Date(a.start_month || a.startMonth).getTime()
    const dateB = new Date(b.start_month || b.startMonth).getTime()
    if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA
    return 0
  })

  const projects = data?.projects || []

  const isPreview = !!config // Dashboard preview mode (don't track analytics)

  // Track page view (only on public profile, not preview)
  React.useEffect(() => {
    if (!isPreview && profileId) {
      let source = 'direct'
      if (typeof document !== 'undefined' && document.referrer) {
        const ref = document.referrer.toLowerCase()
        if (ref.includes('linkedin')) source = 'linkedin'
        else if (ref.includes('twitter') || ref.includes('x.com')) source = 'twitter'
        else if (ref.includes('google')) source = 'google'
        else if (ref.includes('github')) source = 'github'
        else if (ref) source = ref
      }
      trackAnalytics(profileId, 'view', { source })
    }
  }, [profileId, isPreview])

  // Social link click handler
  const handleSocialClick = useCallback((linkType: string) => {
    if (!isPreview) trackAnalytics(profileId, 'click', { link_type: linkType })
  }, [profileId, isPreview])

  // CV Download handler
  const handleCvDownload = useCallback(() => {
    if (!isPreview) trackAnalytics(profileId, 'click', { link_type: 'cv_download' })
    if (cvUrl) {
      window.open(cvUrl, '_blank')
    }
  }, [profileId, cvUrl, isPreview])

  // Email handler
  const handleEmailClick = useCallback(() => {
    if (!isPreview) trackAnalytics(profileId, 'click', { link_type: 'email' })
    if (profileEmail) {
      window.location.href = `mailto:${profileEmail}`
    }
  }, [profileId, profileEmail, isPreview])

  // Share handlers
  const handleShare = useCallback(async (method: string) => {
    if (!isPreview) trackAnalytics(profileId, 'share', { method })
    
    const shareUrl = username ? `https://folio.in/${username}` : window.location.href
    const shareText = `Check out ${name}'s portfolio on Folio!`

    switch (method) {
      case 'native':
        if (typeof navigator.share === 'function') {
          try {
            await navigator.share({ title: `${name} — Folio`, text: shareText, url: shareUrl })
          } catch {}
        }
        break
      case 'copy_link':
        try {
          await navigator.clipboard.writeText(shareUrl)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {}
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
        break
    }
    setActiveShareMenu(null)
  }, [profileId, username, name, isPreview])

  const activeTheme = (themeMap as any)[theme] || themeMap.default;
  return (
    <div 
      className="min-h-screen bg-page text-primary font-sans selection:bg-accent/30 flex justify-center w-full relative overflow-x-hidden @container pb-32"
      style={{
        // Dynamically update the theme variables in scope
        ["--color-accent" as any]: activeTheme.primaryColor,
        ["--color-accent-dim" as any]: activeTheme.accentDim,
        ["--color-page" as any]: activeTheme.pageBg,
        ["--color-surface" as any]: activeTheme.surfaceBg,
        ["--color-elevated" as any]: activeTheme.elevatedBg,
        ["--color-primary" as any]: activeTheme.primaryText,
        ["--color-secondary" as any]: activeTheme.secondaryText,
        ["--color-tertiary" as any]: activeTheme.tertiaryText,
        ["--color-border-subtle" as any]: activeTheme.borderSubtle,
        ["--color-border-focus" as any]: activeTheme.borderFocus,
        ...(activeTheme.badgeOpenBg && { ["--color-badge-open-bg" as any]: activeTheme.badgeOpenBg }),
        ...(activeTheme.badgeOpenFg && { ["--color-badge-open-fg" as any]: activeTheme.badgeOpenFg }),
        ...(activeTheme.badgeInternBg && { ["--color-badge-intern-bg" as any]: activeTheme.badgeInternBg }),
        ...(activeTheme.badgeInternFg && { ["--color-badge-intern-fg" as any]: activeTheme.badgeInternFg }),
        ...(activeTheme.badgeFullBg && { ["--color-badge-full-bg" as any]: activeTheme.badgeFullBg }),
        ...(activeTheme.badgeFullFg && { ["--color-badge-full-fg" as any]: activeTheme.badgeFullFg }),
        ...(activeTheme.badgeBuildBg && { ["--color-badge-build-bg" as any]: activeTheme.badgeBuildBg }),
        ...(activeTheme.badgeBuildFg && { ["--color-badge-build-fg" as any]: activeTheme.badgeBuildFg }),
        ...(activeTheme.badgeDiscBg && { ["--color-badge-disc-bg" as any]: activeTheme.badgeDiscBg }),
        ...(activeTheme.badgeDiscFg && { ["--color-badge-disc-fg" as any]: activeTheme.badgeDiscFg }),
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] opacity-40 pointer-events-none transition-all duration-700"
           style={{ background: `radial-gradient(circle, ${activeTheme.glow} 0%, transparent 70%)`}}></div>

      {/* Floating Share Button (fixed position for public view) */}
      {!isPreview && (
        <div className="fixed top-6 right-6 z-50">
          <div className="relative">
            <button
              onClick={() => {
                // Try native share first on mobile
                if (typeof navigator.share === 'function') {
                  handleShare('native')
                } else {
                  setActiveShareMenu(activeShareMenu === 'float' ? null : 'float')
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface/85 backdrop-blur-xl border border-border-subtle text-sm font-semibold text-primary hover:bg-primary/10 hover:border-accent/20 transition-all shadow-2xl shadow-black/30 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            {/* Share Dropdown */}
            {activeShareMenu === 'float' && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-surface border border-border-subtle rounded-2xl shadow-2xl shadow-black/10 overflow-hidden animate-fade-up z-50">
                <div className="p-2">
                  <button 
                    onClick={() => handleShare('copy_link')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-secondary" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left cursor-pointer"
                  >
                    <SocialIcons.Twitter className="w-4 h-4 text-secondary fill-current" />
                    Share on X
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left cursor-pointer"
                  >
                    <SocialIcons.Linkedin className="w-4 h-4 text-secondary fill-none" />
                    Share on LinkedIn
                  </button>
                  <button 
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-secondary fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close share menu */}
      {activeShareMenu !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveShareMenu(null)} />
      )}

      <div className="w-full max-w-[1000px] px-6 py-16 @md:py-24 flex flex-col gap-16 relative z-10 mx-auto">
        
        <header className="flex flex-col items-center text-center gap-6">
          <div className="relative group flex flex-col items-center">
             <div className={`absolute -inset-1 bg-gradient-to-r ${activeTheme.accent} rounded-full opacity-20 blur transition duration-700 group-hover:opacity-50`}></div>
             <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-surface border border-border-subtle overflow-hidden relative shadow-2xl z-10">
               {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface to-elevated flex items-center justify-center">
                    <span className="text-3xl font-black text-secondary">{name.substring(0, 2).toUpperCase()}</span>
                  </div>
               )}
             </div>
             {openToWork && (
               <div className="absolute -bottom-3 z-20">
                 <Badge variant="openToWork" className="text-[10px] font-extrabold bg-surface border border-accent/30 text-accent tracking-widest uppercase h-6 px-3 shadow-lg shadow-black/10 whitespace-nowrap">OPEN TO WORK</Badge>
               </div>
             )}
          </div>
          
          <div className="space-y-3 mt-4">
             <h1 className="text-4xl @md:text-5xl font-black text-primary tracking-tight">{name}</h1>
             <p className="text-sm sm:text-base text-secondary font-medium max-w-[600px] mx-auto leading-relaxed">
               {bio}
             </p>
             <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                   {title}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                   <MapPin className="w-3 h-3" /> {location}
                </div>
             </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
             {cvUrl && (
               <Button 
                 onClick={handleCvDownload}
                 className="bg-primary text-page hover:opacity-90 rounded-xl font-bold gap-2 px-6 shadow-xl h-11 text-sm transition-all hover:scale-[1.02] active:scale-95"
               >
                  <FileText className="w-4 h-4" /> Download CV
               </Button>
             )}
             {profileEmail && (
               <button 
                 onClick={handleEmailClick}
                 className="h-11 px-6 bg-surface border border-border-subtle text-primary rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-elevated transition-colors cursor-pointer"
               >
                  <Mail className="w-4 h-4" /> Let&apos;s talk
               </button>
             )}

             {/* Header Share Profile Button with local Dropdown relative to its trigger */}
             <div className="relative">
               <button 
                 onClick={() => {
                   if (typeof navigator.share === 'function') {
                     handleShare('native')
                   } else {
                     setActiveShareMenu(activeShareMenu === 'header' ? null : 'header')
                   }
                 }}
                 className="h-11 px-6 bg-surface border border-border-subtle text-primary rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-elevated transition-colors cursor-pointer"
               >
                  <Share2 className="w-4 h-4 text-accent" /> Share Profile
               </button>

               {activeShareMenu === 'header' && (
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-fade-up z-50">
                   <div className="p-2">
                     <button 
                       onClick={() => handleShare('copy_link')}
                       className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left cursor-pointer"
                     >
                       {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-secondary" />}
                       {copied ? 'Copied!' : 'Copy Link'}
                     </button>
                     <button 
                       onClick={() => handleShare('twitter')}
                       className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left cursor-pointer"
                     >
                       <SocialIcons.Twitter className="w-4 h-4 text-secondary fill-current" />
                       Share on X
                     </button>
                     <button 
                       onClick={() => handleShare('linkedin')}
                       className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left cursor-pointer"
                     >
                       <SocialIcons.Linkedin className="w-4 h-4 text-secondary fill-none" />
                       Share on LinkedIn
                     </button>
                     <button 
                       onClick={() => handleShare('whatsapp')}
                       className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left cursor-pointer"
                     >
                       <svg className="w-4 h-4 text-secondary fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                       WhatsApp
                     </button>
                   </div>
                 </div>
               )}
             </div>
          </div>

          {(socialLinks.github || socialLinks.linkedin || socialLinks.twitter) && (
            <div className="flex gap-3 pt-2 opacity-60 hover:opacity-100 transition-opacity">
               {socialLinks.github && (
                  <a 
                    href={socialLinks.github.includes('http') ? socialLinks.github : `https://${socialLinks.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 flex items-center justify-center text-primary hover:text-accent hover:scale-110 transition-all cursor-pointer"
                    onClick={() => handleSocialClick('github')}
                  >
                     <SocialIcons.Github className="w-4.5 h-4.5 fill-none" />
                  </a>
               )}
               {socialLinks.linkedin && (
                  <a 
                    href={socialLinks.linkedin.includes('http') ? socialLinks.linkedin : `https://${socialLinks.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 flex items-center justify-center text-primary hover:text-accent hover:scale-110 transition-all cursor-pointer"
                    onClick={() => handleSocialClick('linkedin')}
                  >
                     <SocialIcons.Linkedin className="w-4.5 h-4.5 fill-none" />
                  </a>
               )}
               {socialLinks.twitter && (
                  <a 
                    href={socialLinks.twitter.includes('http') ? socialLinks.twitter : `https://${socialLinks.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 flex items-center justify-center text-primary hover:text-accent hover:scale-110 transition-all cursor-pointer"
                    onClick={() => handleSocialClick('twitter')}
                  >
                     <SocialIcons.Twitter className="w-4.5 h-4.5 fill-current" />
                  </a>
               )}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 @3xl:grid-cols-[1fr_340px] gap-8 w-full">
          {/* Main Left Column */}
          <div className="flex flex-col gap-10">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <span className="text-accent font-mono font-bold text-lg">{"< >"}</span>
                    <h2 className="text-[15px] font-bold tracking-wide text-primary">Featured Projects</h2>
                 </div>
                  {githubUsername && (
                    <a href={`https://github.com/${githubUsername}`} target="_blank" className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">View All Github</a>
                  )}
              </div>
              <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                {projects.length > 0 ? projects.map((p: any, i: number) => (
                  <ProjectCard 
                    key={i}
                    name={p.name}
                    description={p.description}
                    icon={p.icon || "⚡"}
                    isDeployed={p.is_deployed ?? p.isDeployed}
                    liveUrl={p.live_url || p.link}
                  />
                )) : (
                    <div className="col-span-full text-center p-8 rounded-2xl border border-dashed border-border-subtle text-secondary text-sm font-medium">
                       No featured projects yet.
                    </div>
                )}
              </div>
            </section>

            {/* GitHub Contributions Moved to Main Column for consistent width with projects */}
            {showGithubActivity && githubUsername && (
               <section className="space-y-6">
                 <div className="flex items-center gap-3">
                   <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center border border-accent/20">
                     <SocialIcons.Github className="w-3 text-accent fill-none" />
                   </div>
                   <h2 className="text-[15px] font-bold tracking-wide text-primary">GitHub Contributions</h2>
                 </div>
                 <div className="rounded-[20px] overflow-hidden border border-border-subtle p-5 bg-surface backdrop-blur-sm flex items-center justify-center hover:border-accent/30 transition-all">
                   <img 
                     src={`https://ghchart.rshah.org/${activeTheme.primaryColor.replace('#', '')}/${githubUsername}`} 
                     alt={`${githubUsername}'s GitHub Contributions`}
                     className={`w-full h-auto object-contain ${activeTheme.isLight ? "" : "filter invert-[0.03] brightness-110"}`}
                   />
                 </div>
               </section>
            )}

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <h2 className="text-[15px] font-bold tracking-wide text-primary">Experience</h2>
              </div>
              <div className="space-y-4">
                {experiences.length > 0 ? experiences.map((ex, i) => (
                  <ExperienceCard 
                    key={i}
                    companyName={ex.company_name || ex.company}
                    role={ex.role}
                    type={ex.type || "Full-time"}
                    startMonth={ex.start_month || ex.startMonth}
                    endMonth={ex.end_month || ex.endMonth}
                    isCurrent={ex.is_current || ex.isCurrent}
                    description={ex.description}
                  />
                )) : (
                    <div className="text-center p-8 rounded-2xl border border-dashed border-border-subtle text-secondary text-sm font-medium">
                       No experiences listed yet.
                    </div>
                )}
              </div>
            </section>

            {hasEducation && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <h2 className="text-[15px] font-bold tracking-wide text-primary">Education</h2>
                </div>
                <div className="bg-surface border border-border-subtle rounded-[20px] p-6 flex flex-col gap-5 relative overflow-hidden">
                    <div>
                        <h4 className="font-extrabold text-[15px] text-primary">{ed?.degree || "[Degree Name]"}</h4>
                        <p className="text-xs font-medium text-secondary mt-1">{ed?.school || "[Institution Name]"}</p>
                        <div className="flex items-center gap-2 mt-3">
                          {ed?.cgpa && <Badge className="bg-accent/10 border-accent/20 text-accent font-black text-[10px] tracking-wider">CGPA {ed.cgpa}</Badge>}
                           {ed?.year && <span className="text-[10px] text-secondary font-bold">Class of {ed.year}</span>}
                        </div>
                    </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
             {leetcodeUsername && (
                <LeetcodeWidget username={leetcodeUsername} />
             )}

             {spotify && (
                <SpotifyWidget 
                   trackName={spotify.trackName}
                   artistName={spotify.artistName}
                   albumArtUrl={spotify.albumArtUrl}
                   trackId={spotify.trackId}
                />
             )}

             <section className="bg-surface border border-border-subtle rounded-[20px] p-6">
                <div className="flex items-center gap-3 mb-5">
                   <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center border border-accent/20">
                     <svg className="w-3 h-3 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                   </div>
                   <h2 className="text-sm font-bold text-primary tracking-wide">Technical Stack</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string, i: number) => (
                     <div key={i} className="px-3 py-1.5 rounded-lg bg-elevated border border-border-subtle text-[11px] font-bold text-secondary hover:border-accent/20 hover:text-primary cursor-default transition-all">
                        {skill}
                     </div>
                  ))}
                </div>
             </section>
          </div>
        </div>

        <footer className="pt-8 text-center border-t border-border-subtle mt-12">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-tertiary">
            Built with Folio 
            <img src="/folio-icon.svg" alt="Folio" className="w-5 h-5" />
          </div>
        </footer>
      </div>
    </div>
  )
}

// Removing GithubTiles component completely as we now use real image fetch
