"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Eye, TrendingUp, AlertTriangle, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SocialIcons } from '@/lib/icons'

interface RecentProfile {
  username: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

interface ProUser {
  username: string
  full_name: string | null
  email: string
  created_at: string
}

interface StatsData {
  total_profiles: number
  total_views: number
  recent_profiles: RecentProfile[]
  pro_users: ProUser[]
}

export default function LaunchAdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-page flex items-center justify-center text-primary">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
      </div>
    }>
      <LaunchAdminContent />
    </Suspense>
  )
}

function LaunchAdminContent() {
  const searchParams = useSearchParams()
  const secret = searchParams.get('secret') || ''
  
  const [data, setData] = useState<StatsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pollingActive, setPollingActive] = useState(true)
  const [copiedText, setCopiedText] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchStats = async (isManual = false) => {
    if (isManual) setLoading(true)
    try {
      const res = await fetch(`/api/admin/launch-stats?secret=${encodeURIComponent(secret)}`)
      if (!res.ok) {
        if (res.status === 401) {
          setError('Unauthorized: Invalid secret key.')
        } else {
          setError('Failed to fetch real-time stats.')
        }
        setLoading(false)
        return
      }
      const json = await res.json()
      setData(json)
      setError(null)
      setLastUpdated(new Date())
    } catch {
      setError('Connection failure.')
    } finally {
      setLoading(false)
    }
  }

  // Setup Polling every 5 seconds
  useEffect(() => {
    if (!secret) {
      setLoading(false)
      return
    }

    fetchStats()

    if (!pollingActive) return

    const interval = setInterval(() => {
      fetchStats()
    }, 5000)

    return () => clearInterval(interval)
  }, [secret, pollingActive])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }

  const copyIndividualEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const copyAllProEmails = (emails: string[]) => {
    if (emails.length === 0) return
    const uniqueEmails = Array.from(new Set(emails.filter(Boolean)))
    navigator.clipboard.writeText(uniqueEmails.join(', '))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'just now'
      if (diffMins === 1) return '1 minute ago'
      if (diffMins < 60) return `${diffMins} minutes ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours === 1) return '1 hour ago'
      return `${diffHours} hours ago`
    } catch {
      return 'recently'
    }
  }

  // Unauthorised / No Secret state
  if (!secret || error?.includes('Unauthorized')) {
    return (
      <div className="min-h-screen bg-page text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div className="absolute w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        
        <Card className="w-full max-w-md border-red-500/20 bg-[#0F0F0F] relative z-10 p-8 text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl mx-auto flex items-center justify-center text-red-500 mb-6">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-secondary text-sm leading-relaxed mb-6">
            This dashboard is private and reserved for Folio launch day operations. Please provide the correct secret key to gain access.
          </p>
          <Link href="/">
            <Button variant="secondary" className="w-full h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home Page
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Loading Screen
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-page text-primary flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4"></div>
        <p className="text-secondary text-sm font-medium animate-pulse">Initializing launch metrics...</p>
      </div>
    )
  }

  const totalProfiles = data?.total_profiles || 0
  const totalViews = data?.total_views || 0
  const avgViews = totalProfiles > 0 ? (totalViews / totalProfiles).toFixed(1) : '0'

  // Pre-made tweet template
  const tweetText = `🚀 Quick update from our launch day at Folio!\n\n✨ We just hit ${totalProfiles} live profiles built and ${totalViews} page views in real-time!\n\nThank you to everyone supporting us! Claim your portfolio link now: tryfolio.online @tryfolioonline`

  return (
    <div className="min-h-screen bg-page text-primary font-sans flex flex-col relative overflow-x-hidden selection:bg-accent/40">
      {/* Background overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-fade opacity-40"></div>
        <div className="absolute w-[800px] h-[800px] top-[-300px] left-1/2 -translate-x-1/2 bg-[radial-gradient(circle,_rgba(16,185,129,0.07)_0%,_transparent_65%)]"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[-100px] right-[-100px] bg-[radial-gradient(circle,_rgba(99,102,241,0.05)_0%,_transparent_65%)]"></div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border-subtle/40 bg-page/80 backdrop-blur-md shrink-0 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/folio-icon.svg" alt="Folio Logo" className="w-7 h-7" />
              <span className="text-md font-bold text-white tracking-tight">Folio</span>
            </Link>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-bold tracking-wider uppercase animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Command Center
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPollingActive(!pollingActive)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pollingActive 
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                  : 'border-white/10 bg-white/5 text-secondary hover:text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pollingActive ? 'animate-spin' : ''}`} />
              {pollingActive ? 'Auto-Polling Active' : 'Polling Paused'}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchStats(true)}
              className="rounded-xl border border-white/5 bg-[#111] hover:bg-white/5 h-8 px-3 text-xs"
            >
              Manual Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-5xl w-full mx-auto px-6 py-10 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm flex items-center gap-2 animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Dynamic Metric Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Profiles Created */}
          <Card className="border-emerald-500/10 bg-[#0C0C0C]/50 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/25 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-tertiary uppercase tracking-wider">Profiles Created</span>
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">
                {totalProfiles}
              </h2>
              <p className="text-[11px] text-[#34C77B] font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live active developers online
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total Views */}
          <Card className="border-accent/10 bg-[#0C0C0C]/50 backdrop-blur-md relative overflow-hidden group hover:border-accent/25 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full pointer-events-none"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-tertiary uppercase tracking-wider">Total Profile Views</span>
                <div className="p-2 bg-accent/10 rounded-xl text-accent">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">
                {totalViews}
              </h2>
              <p className="text-[11px] text-accent font-semibold flex items-center gap-1">
                ⚡ Real-time page view counts
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Avg Views per Profile */}
          <Card className="border-white/5 bg-[#0C0C0C]/50 backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-tertiary uppercase tracking-wider">Avg Views / Profile</span>
                <div className="p-2 bg-white/5 rounded-xl text-secondary">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">
                {avgViews}
              </h2>
              <p className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
                📈 General engagement coefficient
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Lower Dashboard Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center columns: Live Feed */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-md font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Recent Profile Registrations
            </h3>
            
            <div className="border border-white/5 rounded-3xl overflow-hidden bg-[#0A0A0A] shadow-xl">
              {data?.recent_profiles && data.recent_profiles.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {data.recent_profiles.map((p, index) => {
                    const profileName = p.full_name || p.username
                    return (
                      <div key={p.username || index} className="p-5 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-secondary font-black text-xs shrink-0 overflow-hidden">
                            {p.avatar_url ? (
                              <img src={p.avatar_url} alt={profileName} className="w-full h-full object-cover" />
                            ) : (
                              (p.full_name || p.username).substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{profileName}</h4>
                            <p className="text-xs text-tertiary font-medium mt-0.5 truncate">
                              tryfolio.online/{p.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-xs font-semibold text-tertiary">
                            {formatRelativeTime(p.created_at)}
                          </span>
                          <a
                            href={`/${p.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-colors"
                            title="Open Profile Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-secondary font-medium">
                  Waiting for signups... They will appear here instantly!
                </div>
              )}
            </div>

            {/* Card 2: Pro Members Command Center */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
                  Pro Members Command Center
                  {data?.pro_users && data.pro_users.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black tracking-wider uppercase ml-1">
                      {data.pro_users.length} UPGRADED
                    </span>
                  )}
                </h3>
                
                {data?.pro_users && data.pro_users.length > 0 && (
                  <Button
                    onClick={() => copyAllProEmails(data.pro_users.map(u => u.email))}
                    variant="ghost"
                    size="sm"
                    className="rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 text-accent h-8 px-3 text-xs font-bold transition-all"
                  >
                    {copiedAll ? (
                      <><Check className="w-3.5 h-3.5 mr-1 text-success" /> All Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5 mr-1" /> Copy All Pro Emails</>
                    )}
                  </Button>
                )}
              </div>

              <div className="border border-white/5 rounded-3xl overflow-hidden bg-[#0A0A0A] shadow-xl relative">
                {/* Glow accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>

                {data?.pro_users && data.pro_users.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {data.pro_users.map((p, index) => {
                      const profileName = p.full_name || p.username
                      return (
                        <div key={p.username || index} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-all">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/15 flex items-center justify-center text-accent font-black text-xs shrink-0 overflow-hidden">
                              👑
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white truncate">{profileName}</h4>
                                <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-bold text-[9px] uppercase tracking-wider">Pro</span>
                              </div>
                              <p className="text-xs text-tertiary font-medium mt-0.5 truncate flex items-center gap-1.5 flex-wrap">
                                <span className="text-secondary">tryfolio.online/{p.username}</span>
                                <span className="text-white/10">•</span>
                                <span className="text-[#888] font-mono text-[11px] select-all bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{p.email}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                            <Button
                              onClick={() => copyIndividualEmail(p.email)}
                              variant="ghost"
                              className="h-8 px-3 rounded-lg bg-white/5 border border-white/5 text-[11px] font-bold text-secondary hover:text-white hover:bg-white/10 flex items-center gap-1.5"
                              title="Copy Email"
                            >
                              {copiedEmail === p.email ? (
                                <><Check className="w-3 h-3 text-success" /> Copied</>
                              ) : (
                                <><Copy className="w-3 h-3" /> Copy Email</>
                              )}
                            </Button>
                            <a
                              href={`/${p.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-colors"
                              title="Open Profile Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-secondary font-medium flex flex-col items-center justify-center gap-2">
                    <span className="text-xl">✨</span>
                    <p className="text-sm font-bold text-white">No Pro Members upgraded yet</p>
                    <p className="text-xs text-tertiary max-w-[280px] mx-auto mt-0.5">When users upgrade using the checkout buttons, they will be listed here instantly with their verified contact emails.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Social Media Hype Helper */}
          <div className="space-y-6">
            <h3 className="text-md font-bold text-white tracking-tight flex items-center gap-2">
              <SocialIcons.Twitter className="w-4 h-4 text-[#1DA1F2] fill-current" />
              Social Hype Room
            </h3>

            <Card className="border-white/5 bg-[#0A0A0A] p-6 rounded-3xl space-y-4 shadow-xl">
              <p className="text-xs font-medium text-secondary leading-relaxed">
                Want to build hype on socials? Use this ready-to-post live metrics update to share with your audience:
              </p>
              
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 relative font-sans text-xs text-secondary leading-relaxed select-all whitespace-pre-wrap">
                {tweetText}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => copyToClipboard(tweetText)}
                  className="flex-1 rounded-xl h-10 text-xs font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-1.5"
                >
                  {copiedText ? (
                    <><Check className="w-3.5 h-3.5 text-success" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Text</>
                  )}
                </Button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full rounded-xl h-10 text-xs font-bold bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white flex items-center justify-center gap-1.5 border-0 shadow-lg shadow-[#1DA1F2]/10 cursor-pointer">
                    <SocialIcons.Twitter className="w-3.5 h-3.5 fill-current" /> Share Live
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-6 bg-[#070707] text-tertiary text-xs relative z-10 mt-12">
        <div className="mx-auto max-w-5xl px-6 flex justify-between items-center">
          <p>© 2026 Folio Command Room. Launch strong.</p>
          <p>
            Last polled: <span className="font-mono text-secondary">{lastUpdated.toLocaleTimeString()}</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
