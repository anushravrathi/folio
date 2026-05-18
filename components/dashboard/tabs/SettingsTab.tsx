import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Check, Copy } from "lucide-react"
import { useDashboardContext } from "@/context/DashboardContext"

export function SettingsTab() {
  const { config, updateConfig } = useDashboardContext()
  const isPro = config.isPro || false

  return (
    <div className="space-y-6">
      <Card className="border-border-subtle bg-surface/30">
        <CardHeader className="pb-4 border-b border-border-subtle/50 mb-4">
          <CardTitle className="text-[15px] text-white">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Username</label>
            <div className="flex gap-3">
              <Input defaultValue="anushrav" className="flex-1" />
              <Button variant="secondary">Update</Button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-success mt-1.5">
              <Check className="w-3.5 h-3.5" />
              Username is available
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Your Public URL</label>
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-btn)] border border-border-subtle bg-elevated">
              <span className="text-sm text-primary">folio.in/anushrav</span>
              <Button variant="ghost" size="sm" className="h-8 text-secondary hover:text-primary gap-1.5 px-2">
                <Copy className="w-3.5 h-3.5" />
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-secondary uppercase tracking-wider">
              Custom Domain
              {!isPro && <Badge variant="internship" className="text-[9px] px-1.5 py-0">Pro</Badge>}
            </label>
            <div className="flex gap-3">
              <Input 
                placeholder="e.g. yourname.com" 
                className="flex-1"
                disabled={!isPro}
              />
              <Button variant="secondary" disabled={!isPro}>Save</Button>
            </div>
            {!isPro && (
              <p className="text-xs text-tertiary mt-1.5">Upgrade to Pro to use a custom domain.</p>
            )}
          </div>

        </CardContent>
      </Card>

      <Card className="border-border-subtle bg-surface/30">
        <CardHeader className="pb-4 border-b border-border-subtle/50 mb-4">
          <CardTitle className="text-[15px] text-white">Billing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-elevated">
            <div>
              <p className="text-sm font-semibold text-white mb-1">
                Current Plan: <span className={isPro ? "text-accent" : "text-primary"}>{isPro ? "Pro" : "Free"}</span>
              </p>
              <p className="text-xs text-secondary">
                {isPro 
                  ? "You're on Pro. Lifetime access. No renewals." 
                  : "Upgrade to unlock custom domains and analytics."}
              </p>
            </div>
            {!isPro && (
              <Button 
                size="sm" 
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
                Upgrade — ₹499
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-subtle bg-surface/30 border-badge-disc-bg/30">
        <CardHeader className="pb-4 border-b border-border-subtle/50 mb-4">
          <CardTitle className="text-[15px] text-badge-disc-fg">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="danger" className="w-full sm:w-auto">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
