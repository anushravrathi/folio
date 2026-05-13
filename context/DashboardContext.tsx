"use client"

import React, { createContext, useContext, useState } from "react"

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

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("folio_dashboard_config")
      if (saved) {
        setConfig(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load config from local storage", e)
    }
    setIsLoaded(true)
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
