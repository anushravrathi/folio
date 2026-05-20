"use client"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Loader2, Check, X, ArrowRight, Sparkles } from "lucide-react"
import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, useSearchParams } from "next/navigation"

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div></div>}>
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [reason, setReason] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Check auth state and existing profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Check if user already has a profile with username via secure server API
      const checkRes = await fetch(`/api/check-onboarding?userId=${user.id}`)
      if (checkRes.ok) {
        const checkData = await checkRes.json()
        if (checkData.onboarded) {
          // Already onboarded, go to dashboard
          router.push('/dashboard')
          return
        }
      }

      // Pre-fill username from query param (from landing page claim)
      const claimedUsername = searchParams.get('username')
      if (claimedUsername) {
        setUsername(claimedUsername.toLowerCase().trim())
      }

      setAuthLoading(false)
    }

    checkAuth()
  }, [router, searchParams])

  // Debounced username availability check
  const checkAvailability = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    if (!value || value.length < 3) {
      setAvailable(null)
      setReason(value.length > 0 ? 'Username must be at least 3 characters' : '')
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
  }, [])

  const handleUsernameChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
    setUsername(clean)
    checkAvailability(clean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!available || !userId || !username) return

    setLoading(true)
    try {
      const res = await fetch('/api/claim-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username: username.toLowerCase().trim(),
          fullName: fullName.trim() || 'New User',
          title: title.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.push('/dashboard')
      } else {
        setReason(data.error || 'Failed to claim username')
        setAvailable(false)
      }
    } catch {
      setReason('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6 text-primary relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-fade opacity-40"></div>
        <div
          className="glow-orb w-[600px] h-[600px] top-[-200px] left-1/2 -translate-x-1/2"
          style={{ background: "radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 65%)" }}
        />
      </div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group z-10">
        <img src="/folio-icon.svg" alt="Folio Logo" className="w-8 h-8 transition-transform group-hover:scale-105" />
        <span className="text-[18px] font-bold text-white tracking-tight">Folio</span>
      </Link>
      
      <div className="w-full max-w-[460px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Welcome to Folio
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Claim your link</h1>
          <p className="text-secondary font-medium">Choose a unique username for your public profile</p>
        </div>
        
        <Card className="p-8 border-border-subtle bg-surface/50 shadow-none backdrop-blur-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input with live domain preview */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-bold text-secondary uppercase tracking-wider">
                Your Folio URL
              </label>
              <div className="relative">
                <div className="flex items-center rounded-xl border border-border-subtle bg-elevated overflow-hidden focus-within:border-accent/50 focus-within:shadow-[0_0_0_3px_rgba(124,111,255,0.1)] transition-all">
                  <span className="pl-4 text-secondary text-sm font-medium select-none shrink-0">folio.in/</span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="yourname"
                    autoFocus
                    className="flex-1 h-12 bg-transparent border-0 text-white text-sm font-semibold placeholder:text-tertiary focus:outline-none focus:ring-0 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checking && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
                    {!checking && available === true && <Check className="w-4 h-4 text-success" />}
                    {!checking && available === false && <X className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
              </div>
              {reason && (
                <p className={`text-xs font-medium mt-1.5 animate-fade-in ${available ? 'text-success' : 'text-red-400'}`}>
                  {available ? '✓ Username is available!' : reason}
                </p>
              )}
              {available && username && (
                <p className="text-xs text-success font-medium mt-1.5 animate-fade-in">
                  ✓ Username is available!
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-xs font-bold text-secondary uppercase tracking-wider">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Alex Johnson"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-elevated h-12"
              />
            </div>

            {/* Professional Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-bold text-secondary uppercase tracking-wider">
                Title <span className="text-tertiary font-normal normal-case">(optional)</span>
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-elevated h-12"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading || !available || !username || !fullName.trim()}
              className="w-full flex items-center justify-center gap-2 h-12 bg-white text-black hover:bg-white/90 font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Setting up..." : "Claim your Folio"}
              {!loading && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-[12px] text-tertiary font-medium">
          You can always change your username later in Settings.
        </p>
      </div>
    </div>
  )
}
