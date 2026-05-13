import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

import { useDashboardContext } from "@/context/DashboardContext"

export function AboutSection() {
  const { config, updateConfig } = useDashboardContext()
  
  return (
    <Card className="border-border-subtle bg-surface/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] text-white">About</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <textarea 
            className="w-full min-h-[100px] rounded-[var(--radius-btn)] border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-accent resize-none"
            placeholder="Write 2-3 lines. What you build, what you're studying, what excites you."
            maxLength={300}
            value={config.bio}
            onChange={(e) => updateConfig({ bio: e.target.value })}
          />
          <div className="absolute bottom-3 right-3 text-[11px] text-tertiary font-medium">
            {config.bio.length} / 300
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
