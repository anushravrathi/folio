"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

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
  username?: string
  isPro?: boolean
  isDeployed?: boolean
  theme: 'default' | 'emerald' | 'sunset' | 'rose'
  name: string
  title: string
  location: string
  bio: string
  avatarUrl: string
  cvUrl: string
  email: string
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
  isNewUser: boolean
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

const emptyConfig: DashboardConfig = {
  id: undefined,
  username: '',
  isPro: false,
  isDeployed: false,
  theme: 'default',
  name: '',
  title: '',
  location: '',
  bio: '',
  avatarUrl: '',
  cvUrl: '',
  email: '',
  openToWork: true,
  
  showGithubActivity: true,
  githubUsername: '',
  leetcodeUsername: '',
  spotifyTrackUrl: '',
  spotifyData: null,

  socialLinks: {
    github: '',
    linkedin: '',
    twitter: ''
  },

  education: {
    degree: '',
    school: '',
    cgpa: '',
    year: ''
  },

  skills: [],
  experiences: [],
  projects: []
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<DashboardConfig>(emptyConfig)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Not authenticated — redirect to login
        router.push('/login')
        return
      }

      let profile: any = null
      try {
        const res = await fetch(`/api/load-profile?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          profile = data.profile
        }
      } catch (err) {
        console.error('Failed to load profile via API:', err)
      }

      if (!profile || !profile.username) {
        // No profile or no username set — redirect to onboarding
        router.push('/onboarding')
        return
      }

      // User has profile — load it
      setConfig({
        id: profile.id,
        username: profile.username,
        isPro: profile.is_pro,
        isDeployed: profile.is_deployed || false,
        theme: profile.theme || 'default',
        name: profile.full_name || '',
        title: profile.title || '',
        location: profile.location || '',
        bio: profile.about || '',
        avatarUrl: profile.avatar_url || '',
        cvUrl: profile.cv_url || '',
        email: profile.email || user.email || '',
        openToWork: profile.open_to_work ?? true,
        showGithubActivity: true,
        githubUsername: profile.social_links?.github || '',
        leetcodeUsername: profile.social_links?.leetcode || '',
        spotifyTrackUrl: '',
        spotifyData: null,
        socialLinks: {
          github: profile.social_links?.github || '',
          linkedin: profile.social_links?.linkedin || '',
          twitter: profile.social_links?.twitter || '',
        },
        education: {
          degree: '',
          school: '',
          cgpa: '',
          year: '',
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

      // Check if this is essentially a new user (just onboarded, no content yet)
      const hasNoContent = !profile.about && 
        (!profile.skills || profile.skills.length === 0) && 
        (!profile.projects || profile.projects.length === 0) &&
        (!profile.experience || profile.experience.length === 0)
      setIsNewUser(hasNoContent)

      setIsLoaded(true)
    }

    fetchUserAndProfile()
  }, [router])

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
    <DashboardContext.Provider value={{ config, updateConfig, isNewUser }}>
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
