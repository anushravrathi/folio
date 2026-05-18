"use client"
import React from "react"

import { Badge } from "@/components/ui/Badge"
import { MapPin, Mail, FileText, GraduationCap } from "lucide-react"
import Link from "next/link"
import { ExperienceCard } from "./ExperienceCard"
import { ProjectCard } from "./ProjectCard"
import { SocialIcons } from "@/lib/icons"
import { SpotifyWidget } from "./SpotifyWidget"
import { LeetcodeWidget } from "./LeetcodeWidget"
import { Button } from "@/components/ui/Button"

interface ProfilePageProps {
  config?: any;
  profile?: any;
}

export function ProfilePage({ config, profile }: ProfilePageProps) {
  // Use profile if provided (public view), otherwise use config (dashboard preview)
  const data = profile || config;
  
  const theme = data?.theme || 'default'
  const name = data?.full_name || data?.name || "[Your Name]"
  const title = data?.title || "[Your Professional Title]"
  const location = data?.location || "[City, Country]"
  const bio = data?.about || data?.bio || "Share a little bit about who you are and what you enjoy building."
  const avatarUrl = data?.avatar_url || data?.avatarUrl || ""
  const openToWork = data?.open_to_work ?? data?.openToWork ?? false
  
  const githubUsername = data?.githubUsername || data?.social_links?.github || ""
  const leetcodeUsername = data?.leetcodeUsername || ""
  const spotify = data?.spotifyData || null
  const socialLinks = data?.socialLinks || { 
    github: data?.social_links?.github || "", 
    linkedin: data?.social_links?.linkedin || "", 
    twitter: data?.social_links?.twitter || "" 
  }
  const showGithubActivity = data?.showGithubActivity ?? false

  const ed = data?.education
  const hasEducation = ed?.degree || ed?.school

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

  // Track page view
  React.useEffect(() => {
    if (data?.id && data.id !== "00000000-0000-0000-0000-000000000000") {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: data.id,
          type: 'view',
          source: typeof document !== 'undefined' ? document.referrer : 'direct'
        })
      }).catch(console.error)
    }
  }, [data?.id])

  const themeMap = {
    default: { 
      glow: 'rgba(124,111,255,0.15)', 
      accent: 'from-[#6C63FF] to-blue-500',
      primaryColor: '#6C63FF',
      accentDim: 'rgba(108,99,255,0.13)'
    },
    emerald: { 
      glow: 'rgba(16,185,129,0.15)', 
      accent: 'from-emerald-500 to-cyan-500',
      primaryColor: '#10B981',
      accentDim: 'rgba(16,185,129,0.13)'
    },
    sunset: { 
      glow: 'rgba(245,158,11,0.15)', 
      accent: 'from-amber-500 to-rose-600',
      primaryColor: '#F59E0B',
      accentDim: 'rgba(245,158,11,0.13)'
    },
    rose: { 
      glow: 'rgba(225,29,72,0.15)', 
      accent: 'from-rose-500 to-violet-600',
      primaryColor: '#E11D48',
      accentDim: 'rgba(225,29,72,0.13)'
    },
  }
  const activeTheme = (themeMap as any)[theme] || themeMap.default

  return (
    <div 
      className="min-h-full bg-[#090909] text-primary font-sans selection:bg-accent/30 flex justify-center w-full relative overflow-x-hidden @container pb-32"
      style={{
        // Dynamically update the theme variables in scope
        ["--color-accent" as any]: activeTheme.primaryColor,
        ["--color-accent-dim" as any]: activeTheme.accentDim,
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] opacity-40 pointer-events-none transition-all duration-700"
           style={{ background: `radial-gradient(circle, ${activeTheme.glow} 0%, transparent 70%)`}}></div>

      <div className="w-full max-w-[1000px] px-6 py-16 @md:py-24 flex flex-col gap-16 relative z-10 mx-auto">
        
        <header className="flex flex-col items-center text-center gap-6">
          <div className="relative group flex flex-col items-center">
             <div className={`absolute -inset-1 bg-gradient-to-r ${activeTheme.accent} rounded-full opacity-20 blur transition duration-700 group-hover:opacity-50`}></div>
             <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#111] border border-white/10 overflow-hidden relative shadow-2xl z-10">
               {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#222] flex items-center justify-center">
                    <span className="text-3xl font-black text-white/20">{name.substring(0, 2).toUpperCase()}</span>
                  </div>
               )}
             </div>
             {openToWork && (
               <div className="absolute -bottom-3 z-20">
                 <Badge variant="openToWork" className="text-[10px] font-extrabold bg-[#0A0A0A] border border-accent/30 text-accent tracking-widest uppercase h-6 px-3 shadow-lg shadow-black/50">OPEN TO WORK</Badge>
               </div>
             )}
          </div>
          
          <div className="space-y-3 mt-4">
             <h1 className="text-4xl @md:text-5xl font-black text-white tracking-tight">{name}</h1>
             <p className="text-sm sm:text-base text-secondary font-medium max-w-[600px] mx-auto leading-relaxed">
               {bio}
             </p>
             <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                   {title}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-tertiary bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
                   <MapPin className="w-3 h-3" /> {location}
                </div>
             </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
             <Button className="bg-white text-black hover:bg-white/90 rounded-xl font-bold gap-2 px-6 shadow-xl h-11 text-sm transition-all hover:scale-[1.02] active:scale-95">
                <FileText className="w-4 h-4" /> Download CV
             </Button>
             <button className="h-11 px-6 bg-[#111] border border-white/10 text-white rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-white/5 transition-colors">
                <Mail className="w-4 h-4" /> Let&apos;s talk
             </button>
          </div>

          {(socialLinks.github || socialLinks.linkedin || socialLinks.twitter) && (
            <div className="flex gap-3 pt-2 opacity-60 hover:opacity-100 transition-opacity">
               {socialLinks.github && (
                  <a href={socialLinks.github.includes('http') ? socialLinks.github : `https://${socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center text-white hover:text-accent hover:scale-110 transition-all cursor-pointer">
                     <SocialIcons.Github className="w-4.5 h-4.5 fill-none" />
                  </a>
               )}
               {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin.includes('http') ? socialLinks.linkedin : `https://${socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center text-white hover:text-accent hover:scale-110 transition-all cursor-pointer">
                     <SocialIcons.Linkedin className="w-4.5 h-4.5 fill-none" />
                  </a>
               )}
               {socialLinks.twitter && (
                  <a href={socialLinks.twitter.includes('http') ? socialLinks.twitter : `https://${socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center text-white hover:text-accent hover:scale-110 transition-all cursor-pointer">
                     <SocialIcons.Twitter className="w-4.5 h-4.5 fill-current" />
                  </a>
               )}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 w-full">
          {/* Main Left Column */}
          <div className="flex flex-col gap-10">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <span className="text-accent font-mono font-bold text-lg">{"< >"}</span>
                    <h2 className="text-[15px] font-bold tracking-wide text-white">Featured Projects</h2>
                 </div>
                 {githubUsername && (
                   <a href={`https://github.com/${githubUsername}`} target="_blank" className="text-[10px] font-bold text-tertiary uppercase tracking-widest hover:text-white transition-colors">View All Github</a>
                 )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                   <div className="col-span-full text-center p-8 rounded-2xl border border-dashed border-white/10 text-tertiary text-sm font-medium">
                      No featured projects yet.
                   </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <h2 className="text-[15px] font-bold tracking-wide text-white">Experience</h2>
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
                   <div className="text-center p-8 rounded-2xl border border-dashed border-white/10 text-tertiary text-sm font-medium">
                      No experiences listed yet.
                   </div>
                )}
              </div>
            </section>

            {hasEducation && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <h2 className="text-[15px] font-bold tracking-wide text-white">Education</h2>
                </div>
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[20px] p-6 flex flex-col gap-5 relative overflow-hidden">
                    <div>
                        <h4 className="font-extrabold text-[15px] text-white">{ed?.degree || "[Degree Name]"}</h4>
                        <p className="text-xs font-medium text-secondary mt-1">{ed?.school || "[Institution Name]"}</p>
                        <div className="flex items-center gap-2 mt-3">
                          {ed?.cgpa && <Badge className="bg-accent/10 border-accent/20 text-accent font-black text-[10px] tracking-wider">CGPA {ed.cgpa}</Badge>}
                          {ed?.year && <span className="text-[10px] text-tertiary font-bold">Class of {ed.year}</span>}
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

             <section className="bg-[#0A0A0A] border border-white/5 rounded-[20px] p-6">
                <div className="flex items-center gap-3 mb-5">
                   <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center border border-accent/20">
                     <svg className="w-3 h-3 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                   </div>
                   <h2 className="text-sm font-bold text-white tracking-wide">Technical Stack</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string, i: number) => (
                     <div key={i} className="px-3 py-1.5 rounded-lg bg-[#111] border border-white/[0.04] text-[11px] font-bold text-secondary hover:border-white/10 hover:text-white cursor-default transition-all">
                        {skill}
                     </div>
                  ))}
                </div>
             </section>
          </div>
        </div>

        <footer className="pt-8 text-center border-t border-white/5 mt-12">
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
