"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Lock, Eye, Users, MousePointerClick, Share2, Mail, FileDown, Loader2 } from "lucide-react"
import { useDashboardContext } from "@/context/DashboardContext"
import { useToast } from "@/context/ToastContext"
import { useState, useEffect, useCallback } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface StatsData {
  totalViews: number
  totalClicks: number
  totalShares: number
  cvDownloads: number
  emailClicks: number
  sources: Array<{ source: string; count: number }>
  viewsOverTime: Array<{ date: string; views: number }>
}

export function StatsTab() {
  const { config, updateConfig } = useDashboardContext()
  const { showToast } = useToast()
  const isPro = config.isPro || false
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const fetchStats = useCallback(async () => {
    if (!isPro || !config.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/stats?profile_id=${config.id}&period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        const err = await res.json()
        if (res.status !== 403) {
          showToast('Failed to load analytics', 'error')
        }
      }
    } catch {
      showToast('Failed to load analytics', 'error')
    }
    setLoading(false)
  }, [isPro, config.id, period, showToast])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (!isPro) {
    return (
      <Card className="border-border-subtle bg-surface/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-page/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-elevated border border-border-subtle flex items-center justify-center mb-4 text-accent">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Upgrade to Pro to see who&apos;s viewing your profile.</h3>
          <p className="text-secondary mb-6 max-w-md">Get deep insights into your profile traffic, link clicks, and visitor sources with Folio Pro.</p>
          <Button
            disabled={upgrading}
            onClick={async () => {
              setUpgrading(true)
              try {
                const res = await fetch('/api/mock-upgrade', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: config.id }),
                })
                const data = await res.json()
                if (data.success) {
                  updateConfig({ isPro: true })
                  showToast('🎉 Welcome to Pro! Analytics unlocked.', 'success')
                } else {
                  showToast('Upgrade failed: ' + data.error, 'error')
                }
              } catch {
                showToast('Upgrade failed. Please try again.', 'error')
              }
              setUpgrading(false)
            }}
          >
            {upgrading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Upgrade to Pro — ₹499 one time
          </Button>
        </div>

        {/* Blurred background mock content */}
        <div className="p-6 opacity-30 select-none pointer-events-none filter blur-sm">
          <div className="flex justify-end mb-6">
            <div className="h-9 w-32 bg-elevated rounded-lg"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-elevated rounded-xl"></div>
            ))}
          </div>
          
          <div className="h-64 bg-elevated rounded-xl mb-6"></div>
          <div className="h-48 bg-elevated rounded-xl"></div>
        </div>
      </Card>
    )
  }

  // Loading skeleton
  if (loading && !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-end">
          <div className="h-9 w-32 bg-elevated rounded-lg"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 bg-elevated rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-elevated rounded-xl"></div>
        <div className="h-48 bg-elevated rounded-xl"></div>
      </div>
    )
  }

  const totalViews = stats?.totalViews || 0
  const totalClicks = stats?.totalClicks || 0
  const totalShares = stats?.totalShares || 0
  const cvDownloads = stats?.cvDownloads || 0
  const emailClicks = stats?.emailClicks || 0
  const sources = stats?.sources || []
  const viewsOverTime = stats?.viewsOverTime || []
  const maxSourceCount = sources.length > 0 ? Math.max(...sources.map(s => s.count)) : 1

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <select 
          className="bg-surface border border-border-subtle text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
          value={period}
          onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | 'all')}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border-subtle bg-surface/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-success">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Total Views</p>
              <p className="text-2xl font-semibold text-white">{totalViews.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border-subtle bg-surface/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-warning">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Link Clicks</p>
              <p className="text-2xl font-semibold text-white">{totalClicks.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-surface/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-badge-intern-fg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Profile Shares</p>
              <p className="text-2xl font-semibold text-white">{totalShares.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-surface/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-accent">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">CV Downloads</p>
              <p className="text-2xl font-semibold text-white">{cvDownloads.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-surface/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-[#EC4899]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Email Clicks</p>
              <p className="text-2xl font-semibold text-white">{emailClicks.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-surface/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-accent">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Unique Sources</p>
              <p className="text-2xl font-semibold text-white">{sources.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Views Over Time Chart */}
      {viewsOverTime.length > 0 && (
        <Card className="border-border-subtle bg-surface/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-[15px] text-white">Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewsOverTime}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C6FFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C6FFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#444"
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickFormatter={(val) => {
                      const d = new Date(val)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#444"
                    tick={{ fill: '#666', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '13px',
                      color: '#fff',
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#7C6FFF" 
                    strokeWidth={2}
                    fill="url(#viewsGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traffic Sources */}
      <Card className="border-border-subtle bg-surface/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] text-white">Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length > 0 ? (
            <div className="space-y-4">
              {sources.map((item) => (
                <div key={item.source}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-primary font-medium">{item.source}</span>
                    <span className="text-secondary">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max((item.count / maxSourceCount) * 100, 2)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-tertiary text-sm">
              No traffic data yet. Share your profile link to start tracking!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
