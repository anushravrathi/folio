import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Lock, Eye, Users, MousePointerClick, Share2 } from "lucide-react"

import { useDashboardContext } from "@/context/DashboardContext"

export function StatsTab() {
  const { config, updateConfig } = useDashboardContext()
  const isPro = config.isPro || false

  if (!isPro) {
    return (
      <Card className="border-border-subtle bg-surface/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-page/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-elevated border border-border-subtle flex items-center justify-center mb-4 text-accent">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Upgrade to Pro to see who's viewing your profile.</h3>
          <p className="text-secondary mb-6 max-w-md">Get deep insights into your profile traffic, link clicks, and visitor sources with Folio Pro.</p>
          <Button
            onClick={async () => {
              const res = await fetch('/api/mock-upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: config.id }),
              });
              const data = await res.json();
              if (data.success) {
                updateConfig({ isPro: true });
              } else {
                alert('Upgrade failed: ' + data.error);
              }
            }}
          >
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

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <select className="bg-surface border border-border-subtle text-primary text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-accent">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>All time</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border-subtle bg-surface/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-accent">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">CV Downloads</p>
              <p className="text-2xl font-semibold text-white">128</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border-subtle bg-surface/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-success">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Total Views</p>
              <p className="text-2xl font-semibold text-white">3,842</p>
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
              <p className="text-2xl font-semibold text-white">427</p>
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
              <p className="text-2xl font-semibold text-white">84</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-subtle bg-surface/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] text-white">Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { source: "Direct", count: 842, percent: 65 },
              { source: "LinkedIn", count: 245, percent: 20 },
              { source: "Twitter", count: 120, percent: 10 },
              { source: "Other", count: 41, percent: 5 },
            ].map((item) => (
              <div key={item.source}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-primary font-medium">{item.source}</span>
                  <span className="text-secondary">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
