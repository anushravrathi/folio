"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Check, Copy, Loader2, X, Zap } from "lucide-react"
import { useDashboardContext } from "@/context/DashboardContext"
import { useToast } from "@/context/ToastContext"
import { useState, useCallback, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { cleanDomain, isValidDomain } from "@/lib/utils"


export function SettingsTab() {
  const { config, updateConfig } = useDashboardContext()
  const { showToast } = useToast()
  const isPro = config.isPro || false
  const router = useRouter()

  // Custom Domain input and DNS verification states
  const [customDomainInput, setCustomDomainInput] = useState(config.customDomain || "")
  const [dnsVerified, setDnsVerified] = useState(false)
  const [verifyingDns, setVerifyingDns] = useState(false)
  const [dnsError, setDnsError] = useState<string | null>(null)
  const [foundRecords, setFoundRecords] = useState<{ A: string[]; CNAME: string[] } | null>(null)

  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setCustomDomainInput(config.customDomain || "")
    setDnsVerified(false)
    setDnsError(null)
    setFoundRecords(null)
  }, [config.customDomain])

  const handleSaveCustomDomain = () => {
    const cleaned = cleanDomain(customDomainInput)
    if (customDomainInput && !cleaned) {
      showToast("Invalid custom domain format. Please enter a valid domain name (e.g. yourname.com).", "error")
      return
    }

    const systemDomains = ['localhost', 'folio.in', 'www.folio.in', 'tryfolio.online', 'www.tryfolio.online']
    if (cleaned && systemDomains.some(sys => cleaned === sys || cleaned.endsWith('.' + sys))) {
      showToast("System domains cannot be registered as custom domains.", "error")
      return
    }

    setCustomDomainInput(cleaned)
    updateConfig({ customDomain: cleaned })
    showToast("Custom domain setting updated! Please deploy to save changes permanently.", "success")
  }

  const handleVerifyDns = async () => {
    if (!config.customDomain) return
    setVerifyingDns(true)
    setDnsError(null)
    setFoundRecords(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/verify-dns?domain=${encodeURIComponent(config.customDomain)}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        if (data.verified) {
          setDnsVerified(true)
          showToast("🎉 DNS records successfully verified and connected!", "success")
        } else {
          setDnsVerified(false)
          setFoundRecords(data.records)
          setDnsError("We couldn't verify your DNS records yet. Please double-check your DNS provider settings.")
          showToast("DNS verification pending. See instructions below.", "info")
        }
      } else {
        setDnsVerified(false)
        setDnsError(data.error || "Failed to query DNS records.")
        showToast(data.error || "DNS verification failed.", "error")
      }
    } catch (err) {
      setDnsVerified(false)
      setDnsError("Network error occurred during DNS verification.")
      showToast("Network error. Please try again.", "error")
    } finally {
      setVerifyingDns(false)
    }
  }



  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      showToast("Please type 'delete my account' to confirm.", "error")
      return
    }

    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ userId: config.id }),
      })
      const data = await res.json()
      if (data.success) {
        showToast("Account deleted successfully.", "success")
        // Sign out from Supabase Auth
        await supabase.auth.signOut()
        // Wipe local storage
        localStorage.removeItem("folio_dashboard_config")
        // Redirect to homepage
        router.push("/")
      } else {
        showToast(data.error || "Failed to delete account.", "error")
        setDeleting(false)
      }
    } catch (err: any) {
      showToast("Error deleting account. Please try again.", "error")
      setDeleting(false)
    }
  }

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
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/update-username', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
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
    const url = `https://tryfolio.online/${config.username}`
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
      // 1. Create order on backend
      const { data: { session } } = await supabase.auth.getSession()
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ amount: 49900 }), // ₹499 in paise
      })
      const order = await orderRes.json()

      const orderId = order.order_id || order.id

      if (order.error) {
        showToast('Upgrade failed: ' + order.error, 'error')
        setUpgrading(false)
        return
      }

      // 2. Setup checkout options
      const options = {
        key: order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Folio Pro",
        description: "Unlock lifetime custom domains & premium templates",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify on backend
            const { data: { session: verifySess } } = await supabase.auth.getSession()
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${verifySess?.access_token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              updateConfig({ isPro: true })
              showToast('🎉 Welcome to Pro! All features unlocked successfully.', 'success', 5000)
            } else {
              showToast('Payment verification failed. Please contact support.', 'error')
            }
          } catch {
            showToast('Failed to verify payment.', 'error')
          }
        },
        prefill: {
          name: config.name || "",
          email: config.email || "",
        },
        theme: {
          color: "#6C63FF",
        },
      }

       // 3. Dynamically load the checkout script and open the overlay
       const script = document.createElement("script")
       script.src = "https://checkout.razorpay.com/v1/checkout.js"
       script.async = true
       script.onload = () => {
         const rzp = new (window as any).Razorpay(options)
         rzp.open()
       }
       document.body.appendChild(script)

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
              <span className="text-sm text-primary">tryfolio.online/{config.username || '...'}</span>
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
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
              />
              <Button 
                variant="secondary" 
                disabled={!isPro || customDomainInput === config.customDomain}
                onClick={handleSaveCustomDomain}
              >
                Save
              </Button>
            </div>
            {!isPro && (
              <p className="text-xs text-tertiary mt-1.5">Upgrade to Pro to use a custom domain.</p>
            )}

            {isPro && config.customDomain && (
              <div className="mt-4 p-4 rounded-xl border border-border-subtle bg-elevated/40 space-y-4 animate-fade-in font-sans">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">DNS Setup Instructions</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${dnsVerified ? 'bg-success/10 text-success border-success/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'}`}>
                    {dnsVerified ? 'Connected' : 'Setup Pending'}
                  </span>
                </div>
                
                <p className="text-xs text-secondary leading-relaxed">
                  To point your custom domain <strong className="text-white font-mono">{config.customDomain}</strong> to Folio, log in to your DNS provider (e.g., GoDaddy, Namecheap, Cloudflare) and add the following records:
                </p>

                <div className="overflow-x-auto rounded-lg border border-border-subtle/50 bg-surface/50">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-subtle/30 bg-surface/80 text-secondary font-semibold">
                        <th className="p-2">Type</th>
                        <th className="p-2">Name / Host</th>
                        <th className="p-2">Value / Points To</th>
                        <th className="p-2 text-right">TTL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/20 font-mono text-[11px] text-primary">
                      <tr>
                        <td className="p-2 font-sans font-bold text-accent">A</td>
                        <td className="p-2">@</td>
                        <td className="p-2">76.76.21.21</td>
                        <td className="p-2 text-right font-sans text-secondary">Automatic</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-sans font-bold text-accent">CNAME</td>
                        <td className="p-2">www</td>
                        <td className="p-2">cname.vercel-dns.com</td>
                        <td className="p-2 text-right font-sans text-secondary">Automatic</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Button
                    size="sm"
                    variant={dnsVerified ? "ghost" : "secondary"}
                    disabled={verifyingDns || dnsVerified}
                    onClick={handleVerifyDns}
                    className="h-8 gap-1.5 text-xs font-semibold"
                  >
                    {verifyingDns ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Verifying records...
                      </>
                    ) : dnsVerified ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success" />
                        DNS Verified
                      </>
                    ) : (
                      'Verify DNS Connection'
                    )}
                  </Button>
                  
                  {!dnsVerified && (
                    <p className="text-[10px] text-tertiary self-center font-sans">
                      Note: DNS changes can take up to 24 hours to propagate.
                    </p>
                  )}
                </div>

                {dnsError && (
                  <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/5 space-y-2 animate-fade-in font-sans text-xs">
                    <p className="font-semibold text-red-400">{dnsError}</p>
                    {foundRecords && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-secondary">Current Records Resolved:</p>
                        <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-tertiary">
                          <li>
                            A Records found: {foundRecords.A.length > 0 ? (
                              <span className="text-red-300 font-bold">{foundRecords.A.join(', ')}</span>
                            ) : (
                              <span className="italic text-tertiary">None</span>
                            )} (Expected: <span className="text-success font-bold">76.76.21.21</span>)
                          </li>
                          <li>
                            CNAME Records found: {foundRecords.CNAME.length > 0 ? (
                              <span className="text-red-300 font-bold">{foundRecords.CNAME.join(', ')}</span>
                            ) : (
                              <span className="italic text-tertiary">None</span>
                            )} (Expected: <span className="text-success font-bold">cname.vercel-dns.com</span>)
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
          <Button variant="danger" className="w-full sm:w-auto" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl border border-red-500/20 bg-elevated shadow-2xl space-y-4 m-4">
            <h3 className="text-lg font-bold text-white font-sans">Delete Account</h3>
            <p className="text-sm text-secondary leading-relaxed font-sans">
              Are you absolutely sure you want to delete your account? This will permanently delete your username <span className="text-white font-semibold">tryfolio.online/{config.username}</span>, your projects, experience, skills, custom domains, and all analytics data. This action is irreversible.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider block font-sans">
                Type <span className="text-red-400 font-mono">delete my account</span> to confirm
              </label>
              <Input 
                placeholder="delete my account" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="border-red-500/20 focus:border-red-500 bg-surface text-white"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText("")
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.toLowerCase() !== "delete my account" || deleting}
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
