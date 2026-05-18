"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Experience {
  company: string
  role: string
  startMonth: string
  endMonth?: string
  isCurrent: boolean
  description: string
}

export interface Project {
  name: string
  description: string
  link?: string
  isDeployed?: boolean
}

interface DashboardConfig {
  id?: string
  isPro?: boolean
  theme: 'default' | 'emerald' | 'sunset' | 'rose'
  name: string
  title: string
  location: string
  bio: string
  avatarUrl: string
  openToWork: boolean
  
  showGithubActivity: boolean
  githubUsername: string
  leetcodeUsername: string
  spotifyTrackUrl: string
  spotifyData: {
    trackName: string
    artistName: string
    albumArtUrl: string
    trackId?: string | null
  } | null

  // Social Links
  socialLinks: {
    github: string
    linkedin: string
    twitter: string
  }

  // Education / Data lists
  education: {
    degree: string
    school: string
    cgpa: string
    year: string
  }
  
  skills: string[]
  experiences: Experience[]
  projects: Project[]
}

interface DashboardContextType {
  config: DashboardConfig
  updateConfig: (newConfig: Partial<DashboardConfig>) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
const defaultInitialState: DashboardConfig = {
    id: "00000000-0000-0000-0000-000000000000", // Default empty UUID
    isPro: false,
    theme: 'default',
    name: "Alex Developer",
    title: "Full Stack Engineer",
    location: "San Francisco, CA",
    bio: "I build pixel-perfect, engaging, and accessible digital experiences. Passionate about web performance and modern architectures.",
    avatarUrl: "",
    openToWork: true,
    
    showGithubActivity: true,
    githubUsername: "alex",
    leetcodeUsername: "alex",
    spotifyTrackUrl: "",
    spotifyData: null,

    socialLinks: {
      github: "github.com/alex",
      linkedin: "linkedin.com/in/alex",
      twitter: "twitter.com/alex"
    },

    education: {
      degree: "B.S. Computer Science",
      school: "University of Technology",
      cgpa: "3.8",
      year: "2024"
    },

    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Figma"],
    experiences: [
      {
        company: "Tech Innovators",
        role: "Frontend Engineer Intern",
        startMonth: "May 2023",
        endMonth: "Aug 2023",
        isCurrent: false,
        description: "Built the main dashboard using React and Tailwind. Reduced bundle size by 15%."
      }
    ],
    projects: [
      {
        name: "Folio Builder",
        description: "A gorgeous profile builder for developers.",
        link: "https://folio.in",
        isDeployed: true
      }
    ]
  }

  const [config, setConfig] = useState<DashboardConfig>(defaultInitialState)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Try to load from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, projects(*), experience(*), skills(*), social_links(*)')
          .eq('id', user.id)
          .single()

        if (profile) {
          setConfig({
            id: profile.id,
            isPro: profile.is_pro,
            theme: profile.theme || 'default',
            name: profile.full_name || "New User",
            title: profile.title || "",
            location: profile.location || "",
            bio: profile.about || "",
            avatarUrl: profile.avatar_url || "",
            openToWork: profile.open_to_work,
            showGithubActivity: true,
            githubUsername: profile.social_links?.github || "",
            leetcodeUsername: profile.social_links?.leetcode || "",
            spotifyTrackUrl: "",
            spotifyData: null,
            socialLinks: {
              github: profile.social_links?.github || "",
              linkedin: profile.social_links?.linkedin || "",
              twitter: profile.social_links?.twitter || "",
            },
            education: {
              degree: "",
              school: "",
              cgpa: "",
              year: "",
            },
            skills: profile.skills?.map((s: any) => s.name) || [],
            experiences: profile.experience?.map((ex: any) => ({
              company: ex.company_name,
              role: ex.role,
              startMonth: ex.start_month,
              endMonth: ex.end_month,
              isCurrent: ex.is_current,
              description: ex.description,
            })) || [],
            projects: profile.projects?.map((p: any) => ({
              name: p.name,
              description: p.description,
              link: p.live_url,
              isDeployed: p.is_deployed,
            })) || [],
          })
        } else {
          // New user, just set the ID
          updateConfig({ id: user.id })
        }
      } else {
        // Fallback to localStorage for guests
        try {
          const saved = localStorage.getItem("folio_dashboard_config")
          if (saved) {
            setConfig(JSON.parse(saved))
          }
        } catch (e) {
          console.error("Failed to load config from local storage", e)
        }
      }
      setIsLoaded(true)
    }

    fetchUserAndProfile()
  }, [])

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("folio_dashboard_config", JSON.stringify(config))
    }
  }, [config, isLoaded])

  const updateConfig = (newConfig: Partial<DashboardConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
    </div>
  }

  return (
    <DashboardContext.Provider value={{ config, updateConfig }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext)
  if (!ctx) {
    throw new Error("useDashboardContext must be used within DashboardProvider")
  }
  return ctx
}
