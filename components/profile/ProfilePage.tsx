"use client"

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
  config?: {
    theme?: 'default' | 'emerald' | 'sunset' | 'rose'
    name?: string
    title?: string
    location?: string
    bio?: string
    avatarUrl?: string
    openToWork?: boolean
    
    showGithubActivity?: boolean
    githubUsername?: string
    leetcodeUsername?: string
    socialLinks?: {
      github: string
      linkedin: string
      twitter: string
    }
    spotifyData?: {
      trackName: string
      artistName: string
      albumArtUrl: string
      trackId?: string | null
    } | null

    education?: {
      degree: string
      school: string
      cgpa: string
      year: string
    }
    
    skills?: string[]
    experiences?: any[]
    projects?: any[]
  }
}

export function ProfilePage({ config }: ProfilePageProps) {
  const theme = config?.theme || 'default'
  const name = config?.name || "[Your Name]"
  const title = config?.title || "[Your Professional Title]"
  const location = config?.location || "[City, Country]"
  const bio = config?.bio || "Share a little bit about who you are and what you enjoy building."
  const avatarUrl = config?.avatarUrl || ""
  const openToWork = config?.openToWork ?? false
  
  const githubUsername = config?.githubUsername || ""
  const leetcodeUsername = config?.leetcodeUsername || ""
  const spotify = config?.spotifyData || null
  const socialLinks = config?.socialLinks || { github: "", linkedin: "", twitter: "" }
  const showGithubActivity = config?.showGithubActivity ?? false

  const ed = config?.education
  const hasEducation = ed?.degree || ed?.school

  const skills = config?.skills && config.skills.length > 0 ? config.skills : ["Your", "Core", "Skills", "Appear", "Here"]
  
  const experiences = config?.experiences ? [...config.experiences].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1
    if (!a.isCurrent && b.isCurrent) return 1
    const dateA = new Date(a.startMonth).getTime()
    const dateB = new Date(b.startMonth).getTime()
    if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA
    return 0
  }) : []

  const projects = config?.projects || []

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
  const activeTheme = themeMap[theme]

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

      <div className="w-full max-w-[680px] px-6 py-16 @md:py-28 flex flex-col gap-16 relative z-10">
        
        <header className="flex flex-col items-center text-center gap-6">
          <div className="relative group">
             <div className={`absolute -inset-1 bg-gradient-to-r ${activeTheme.accent} rounded-full opacity-20 blur transition duration-700 group-hover:opacity-50`}></div>
             <div className="w-28 h-28 rounded-full bg-elevated border border-white/10 overflow-hidden relative shadow-2xl">
               {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#222] flex items-center justify-center">
                    <span className="text-3xl font-black text-white/20">{name.substring(0, 2).toUpperCase()}</span>
                  </div>
               )}
             </div>
          </div>
          
          <div className="space-y-3">
             <h1 className="text-3xl @md:text-4xl font-black text-white tracking-tight">{name}</h1>
             <p className="text-lg text-secondary font-medium tracking-tight">{title}</p>
             <div className="flex items-center justify-center gap-2 flex-wrap">
                {openToWork && (
                  <Badge variant="openToWork" className="text-[9px] font-extrabold bg-[#0D2B1A] border border-success/30 text-success tracking-widest uppercase h-5 px-2">Open for Roles</Badge>
                )}
                <div className="flex items-center gap-1 text-xs font-bold text-tertiary bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                   <MapPin className="w-3 h-3" /> {location}
                </div>
             </div>
          </div>

          <p className="text-[15px] leading-relaxed text-secondary max-w-[500px] font-medium">
            {bio}
          </p>

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

        {(showGithubActivity || spotify) && (
          <section className="grid grid-cols-1 @md:grid-cols-2 gap-6">
             {showGithubActivity ? (
               <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[28px] p-5 shadow-xl overflow-hidden group relative hover:border-white/20 transition-colors h-full flex flex-col justify-center min-h-[160px]">
                  <div className="w-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    {githubUsername ? (
                      <img src={`https://ghchart.rshah.org/${githubUsername}`} alt="Github Chart" className="w-full max-w-full object-contain filter invert opacity-90 hue-rotate-180" />
                    ) : (
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Add GitHub Username</p>
                    )}
                  </div>
               </div>
             ) : null}

             {spotify ? (
               <SpotifyWidget 
                  trackName={spotify.trackName}
                  artistName={spotify.artistName}
                  albumArtUrl={spotify.albumArtUrl}
                  trackId={spotify.trackId}
               />
             ) : (
               <div className="border border-dashed border-white/10 rounded-[28px] p-8 flex flex-col items-center justify-center text-center h-full min-h-[180px] bg-white/[0.02]">
                  <span className="text-xl mb-2">🎵</span>
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Spotify Empty</p>
               </div>
             )}
          </section>
        )}

        {(hasEducation || leetcodeUsername) && (
          <section className="grid grid-cols-1 @md:grid-cols-2 gap-6">
             {hasEducation ? (
               <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden">
                  <div className="flex items-center gap-2.5">
                     <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                        <GraduationCap className="w-4 h-4" />
                     </div>
                     <h3 className="font-bold text-sm text-white tracking-wide uppercase">Education</h3>
                  </div>
                  <div>
                     <h4 className="font-extrabold text-[15px] text-white">{ed?.degree || "[Degree Name]"}</h4>
                     <p className="text-xs font-medium text-secondary mt-1">{ed?.school || "[Institution Name]"}</p>
                     <div className="flex items-center gap-2 mt-3">
                        {ed?.cgpa && <Badge className="bg-accent/10 border-accent/20 text-accent font-black text-[10px] tracking-wider">CGPA {ed.cgpa}</Badge>}
                        {ed?.year && <span className="text-[10px] text-tertiary font-bold">Class of {ed.year}</span>}
                     </div>
                  </div>
               </div>
             ) : (
               <div className="bg-elevated/40 border border-dashed border-white/10 rounded-3xl p-6 flex items-center justify-center text-center min-h-[160px]">
                  <p className="text-[10px] font-black text-tertiary tracking-widest uppercase">Add Education</p>
               </div>
             )}

             {leetcodeUsername ? (
               <LeetcodeWidget username={leetcodeUsername} />
             ) : (
               <div className="bg-elevated/40 border border-dashed border-white/10 rounded-3xl p-6 flex items-center justify-center text-center min-h-[160px]">
                  <p className="text-[10px] font-black text-tertiary tracking-widest uppercase">Add LeetCode</p>
               </div>
             )}
          </section>
        )}

        <section className="space-y-8">
          <div className="flex items-center gap-4">
             <h2 className="text-xs font-black tracking-[0.2em] uppercase text-white/40 shrink-0">Work Experience</h2>
             <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          <div className="space-y-6">
            {experiences.length > 0 ? experiences.map((ex, i) => (
              <ExperienceCard 
                key={i}
                companyName={ex.company}
                role={ex.role}
                type="Full-time"
                startMonth={ex.startMonth}
                endMonth={ex.endMonth}
                isCurrent={ex.isCurrent}
                description={ex.description}
              />
            )) : (
               <div className="text-center p-8 rounded-2xl border border-dashed border-white/10 text-tertiary text-sm font-medium">
                  No experiences listed yet.
               </div>
            )}
          </div>
        </section>

        <section className="space-y-8">
           <div className="flex items-center gap-4">
             <h2 className="text-xs font-black tracking-[0.2em] uppercase text-white/40 shrink-0">Core Stack</h2>
             <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill, i) => (
               <div key={i} className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13px] font-bold text-secondary hover:border-accent hover:text-white cursor-default transition-all hover:-translate-y-0.5">
                  {skill}
               </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
             <h2 className="text-xs font-black tracking-[0.2em] uppercase text-white/40 shrink-0">Projects</h2>
             <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-5">
            {projects.length > 0 ? projects.map((p, i) => (
              <ProjectCard 
                key={i}
                name={p.name}
                description={p.description}
                icon="⚡"
                isDeployed={p.isDeployed}
                liveUrl={p.link}
              />
            )) : (
               <div className="col-span-full text-center p-8 rounded-2xl border border-dashed border-white/10 text-tertiary text-sm font-medium">
                  No featured projects yet.
               </div>
            )}
          </div>
        </section>

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
