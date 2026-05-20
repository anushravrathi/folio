"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Check, Copy, Loader2, X, Zap } from "lucide-react"
import { useDashboardContext } from "@/context/DashboardContext"
import { useToast } from "@/context/ToastContext"
import { useState, useCallback, useRef, useEffect } from "react"

export function SettingsTab() {
  const { config, updateConfig } = useDashboardContext()
  const { showToast } = useToast()
  const isPro = config.isPro || false

  // Username editing
  const [editUsername, setEditUsername] = useState(config.username || '')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [reason, setReason] = useState('')
  const [updatingUsername, setUpdatingUsername] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setEditUsername(config.username || '')
  }, [config.username])

  const checkAvailability = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    // If same as current username, it's "available" (it's theirs)
    if (value === config.username) {
      setAvailable(null)
      setReason('')
      setChecking(false)
      return
    }

    if (!value || value.length < 3) {
      setAvailable(null)
      setReason(value.length > 0 ? 'Must be at least 3 characters' : '')
      setChecking(false)
      return
    }

    setChecking(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`)
        const data = await res.json()
        setAvailable(data.available)
        setReason(data.reason || '')
      } catch {
        setAvailable(null)
        setReason('Could not check availability')
      }
      setChecking(false)
    }, 400)
  }, [config.username])

  const handleUsernameChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
    setEditUsername(clean)
    checkAvailability(clean)
  }

  const handleUpdateUsername = async () => {
    if (!editUsername || editUsername === config.username) return
    if (available === false) return

    setUpdatingUsername(true)
    try {
      const res = await fetch('/api/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: config.id, newUsername: editUsername }),
      })
      const data = await res.json()
      if (data.success) {
        updateConfig({ username: data.username })
        showToast(`Username updated to ${data.username}`, 'success')
        setAvailable(null)
        setReason('')
      } else {
        showToast(data.error || 'Failed to update username', 'error')
      }
    } catch {
      showToast('Failed to update username', 'error')
    }
    setUpdatingUsername(false)
  }

  const handleCopyUrl = async () => {
    const url = `https://folio.in/${config.username}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('URL copied to clipboard!', 'success')
    } catch {
      showToast('Failed to copy URL', 'error')
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      // TODO: Replace with real Razorpay checkout when credentials are ready
      const res = await fetch('/api/mock-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: config.id }),
      })
      const data = await res.json()
      if (data.success) {
        updateConfig({ isPro: true })
        showToast('🎉 Welcome to Pro! All features unlocked.', 'success', 5000)
      } else {
        showToast('Upgrade failed: ' + data.error, 'error')
      }
    } catch {
      showToast('Upgrade failed. Please try again.', 'error')
    }
    setUpgrading(false)
  }

  const usernameChanged = editUsername !== config.username && editUsername.length >= 3

  return (
    <div className="space-y-6">
      <Card className="border-border-subtle bg-surface/30">
        <CardHeader className="pb-4 border-b border-border-subtle/50 mb-4">
          <CardTitle className="text-[15px] text-white">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Username</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input 
                  value={editUsername} 
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="pr-8"
                  placeholder="yourname"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checking && <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary" />}
                  {!checking && available === true && <Check className="w-3.5 h-3.5 text-success" />}
                  {!checking && available === false && <X className="w-3.5 h-3.5 text-red-500" />}
                </div>
              </div>
              <Button 
                variant="secondary" 
                onClick={handleUpdateUsername}
                disabled={!usernameChanged || available === false || updatingUsername}
              >
                {updatingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
              </Button>
            </div>
            {reason && available === false && (
              <p className="text-xs text-red-400 mt-1 font-medium">{reason}</p>
            )}
            {available === true && usernameChanged && (
              <div className="flex items-center gap-1.5 text-xs text-success mt-1.5">
                <Check className="w-3.5 h-3.5" />
                Username is available
              </div>
            )}
          </div>

          {/* Public URL */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Your Public URL</label>
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-btn)] border border-border-subtle bg-elevated">
              <span className="text-sm text-primary">folio.in/{config.username || '...'}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-secondary hover:text-primary gap-1.5 px-2"
                onClick={handleCopyUrl}
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </Button>
            </div>
          </div>

          {/* Custom Domain */}
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
                onClick={handleUpgrade}
                disabled={upgrading}
                className="gap-1.5"
              >
                {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {upgrading ? 'Processing...' : 'Upgrade — ₹499'}
              </Button>
            )}
            {isPro && (
              <div className="flex items-center gap-1.5 text-xs text-accent font-bold bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                <Zap className="w-3 h-3 fill-accent" />
                Pro Active
              </div>
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
