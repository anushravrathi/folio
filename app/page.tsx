"use client"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { ArrowRight, CheckCircle2, Zap, Link as LinkIcon, BarChart3, Star, Code, Trophy, UserCheck, Globe, Check, X, Loader2, Mail } from "lucide-react"
import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useSearchParams } from "next/navigation"

const SOCIAL_PROOF = [
  { initials: "AR", color: "#7C6FFF" },
  { initials: "MK", color: "#34C77B" },
  { initials: "PJ", color: "#F0B429" },
  { initials: "SS", color: "#EC4899" },
  { initials: "VR", color: "#3B82F6" },
]

const FEATURES = [
  {
    icon: Code,
    title: "GitHub projects, auto-filled",
    desc: "Paste your repo link and we pull the name, description, and language automatically. No manual typing.",
    gradient: "from-[#7C6FFF]/10 to-transparent",
    iconColor: "text-[#7C6FFF]",
  },
  {
    icon: Zap,
    title: "Interactive widgets",
    desc: "Embed dynamic GitHub activity and live Spotify playback tiles to make your static profile feel alive.",
    gradient: "from-[#F0B429]/10 to-transparent",
    iconColor: "text-[#F0B429]",
  },
  {
    icon: LinkIcon,
    title: "One link. Every platform.",
    desc: "Share a single URL on LinkedIn, Twitter, or email. Stop sending outdated PDF attachments.",
    gradient: "from-[#34C77B]/10 to-transparent",
    iconColor: "text-[#34C77B]",
  },
  {
    icon: BarChart3,
    title: "Profile analytics",
    desc: "See who's viewing your profile, where they came from, and which links they clicked.",
    gradient: "from-[#EC4899]/10 to-transparent",
    iconColor: "text-[#EC4899]",
  },
]

const PRO_FEATURES = [
  "Remove Folio watermark",
  "Custom domain support",
  "Deep profile analytics",
  "Resume PDF export (coming soon)",
  "Extra premium themes",
  "Priority support",
]

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page" />}>
      <LandingContent />
    </Suspense>
  )
}

function LandingContent() {
  const [claimUsername, setClaimUsername] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [user, setUser] = useState<any>(null)
  const [hasProfile, setHasProfile] = useState<boolean>(false)
  const [isPro, setIsPro] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const paymentButtonRef = useRef<HTMLFormElement>(null)
  const searchParams = useSearchParams()
  const upgradeTriggered = useRef(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const res = await fetch(`/api/check-onboarding?userId=${user.id}`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
          })
          if (res.ok) {
            const data = await res.json()
            if (data.onboarded) {
              setHasProfile(true)
            }
            if (data.isPro) {
              setIsPro(true)
            }
          }
        } catch (err) {
          console.error("Failed to check user profile status:", err)
        }
      }
    }
    checkUser()
  }, [])

  // Auto-trigger checkout when redirected back from login with ?upgrade=pro
  useEffect(() => {
    if (searchParams.get('upgrade') === 'pro' && user && hasProfile && !isPro && !upgradeTriggered.current) {
      upgradeTriggered.current = true
      // Small delay to let the page render first
      setTimeout(() => handleProUpgrade(), 500)
    }
  }, [user, hasProfile, isPro, searchParams])

  useEffect(() => {
    if (paymentButtonRef.current) {
      paymentButtonRef.current.innerHTML = ''
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/payment-button.js"
      script.setAttribute("data-payment_button_id", "pl_SrxspvWLwltGFk")
      script.async = true
      paymentButtonRef.current.appendChild(script)
    }
  }, [])

  const handleProUpgrade = async () => {
    // Fresh auth check — don't rely on potentially stale state
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      // Not logged in → redirect to login, then back here with ?upgrade=pro
      window.location.href = '/login?redirect=' + encodeURIComponent('/?upgrade=pro')
      return
    }

    // Fresh profile check via secure API
    let hasProfileDb = false
    let isProDb = false
    try {
      const { data: { session: freshSession } } = await supabase.auth.getSession()
      const res = await fetch(`/api/check-onboarding?userId=${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${freshSession?.access_token}` }
      })
      if (res.ok) {
        const data = await res.json()
        hasProfileDb = data.onboarded
        isProDb = data.isPro
      }
    } catch (err) {
      console.error("Failed to fetch fresh profile state:", err)
    }

    if (!hasProfileDb) {
      // No profile yet → send to onboarding first
      window.location.href = '/onboarding?redirect=' + encodeURIComponent('/?upgrade=pro')
      return
    }

    if (isProDb) {
      setIsPro(true)
      return
    }

    setUpgrading(true)
    try {
      // 1. Create order
      const { data: { session: orderSession } } = await supabase.auth.getSession()
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${orderSession?.access_token}`
        },
        body: JSON.stringify({ amount: 49900 }),
      })
      const order = await orderRes.json()
      if (order.error) {
        alert('Failed to create order: ' + order.error)
        setUpgrading(false)
        return
      }

      const orderId = order.order_id || order.id

      // 2. Open Razorpay checkout
      const options = {
        key: order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Folio Pro",
        description: "Unlock lifetime custom domains & premium templates",
        order_id: orderId,
        handler: async function (response: any) {
          try {
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
              setIsPro(true)
              alert('🎉 Welcome to Pro! All features unlocked successfully.')
            } else {
              alert('Payment verification failed. Please contact support.')
            }
          } catch {
            alert('Failed to verify payment. Please contact support.')
          }
          setUpgrading(false)
        },
        modal: {
          ondismiss: function () {
            setUpgrading(false)
          }
        },
        prefill: {
          email: currentUser.email || "",
        },
        theme: {
          color: "#6C63FF",
        },
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => {
        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', function (response: any) {
          alert('Payment failed: ' + (response.error?.description || 'Unknown error'))
          setUpgrading(false)
        })
        rzp.open()
      }
      script.onerror = () => {
        alert('Failed to load Razorpay. Please check your internet connection.')
        setUpgrading(false)
      }
      document.body.appendChild(script)
    } catch {
      alert('Something went wrong. Please try again.')
      setUpgrading(false)
    }
  }


  const checkAvailability = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value || value.length < 3) { setAvailable(null); setChecking(false); return }
    setChecking(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`)
        const data = await res.json()
        setAvailable(data.available)
      } catch { setAvailable(null) }
      setChecking(false)
    }, 400)
  }, [])

  const handleClaimInput = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20)
    setClaimUsername(clean)
    checkAvailability(clean)
  }

  return (
    <div className="min-h-screen bg-page text-primary font-sans flex flex-col overflow-x-hidden relative selection:bg-accent/40">
      {/* Rich Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-fade opacity-60"></div>
        
        {/* Massive Ambient Blurs */}
        <div
          className="glow-orb w-[800px] h-[800px] top-[-300px] left-1/2 -translate-x-1/2"
          style={{ background: "radial-gradient(circle, rgba(124,111,255,0.15) 0%, transparent 65%)" }}
        />
        <div
          className="glow-orb w-[500px] h-[500px] bottom-[-100px] right-[-100px]"
          style={{ background: "radial-gradient(circle, rgba(52,199,123,0.08) 0%, transparent 65%)", animationDelay: "4s" }}
        />
        <div
          className="glow-orb w-[500px] h-[500px] top-[40%] left-[-150px]"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 60%)", animationDelay: "2s" }}
        />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border-subtle/40 glass transition-all duration-300">
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-2 cursor-pointer group">
            <img src="/folio-icon.svg" alt="Folio Logo" className="w-8 h-8 transition-transform group-hover:scale-105" />
            <span className="text-[18px] font-bold text-white tracking-tight">Folio</span>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="#features"
              className="hidden sm:block text-sm font-medium text-secondary hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hidden sm:block text-sm font-medium text-secondary hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Link href={hasProfile ? "/dashboard" : "/onboarding"}>
                  <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold px-5 h-9 shadow-glow">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="rounded-lg text-sm font-semibold text-secondary hover:text-white px-4">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold px-5 h-9 shadow-glow">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        {/* ── MEGA HERO SECTION ───────────────────────────────── */}
        <section className="relative mx-auto max-w-[1200px] px-6 pt-28 pb-24 md:pt-36 md:pb-32 flex flex-col items-center text-center overflow-visible">
          
          {/* ── Floating Decoratives ── */}
          {/* Top Left: Tiny Stats UI */}
          <div className="hidden lg:flex absolute left-0 xl:left-8 top-28 p-3 px-4 bg-elevated/60 backdrop-blur border border-white/10 rounded-2xl shadow-2xl shadow-black/50 items-center gap-3 animate-float-slow z-20 pointer-events-none origin-top-left hover:scale-105 transition-transform">
             <div className="p-2 bg-badge-open-bg rounded-xl text-badge-open-fg">
                <BarChart3 className="w-4 h-4" />
             </div>
             <div className="text-left">
                <p className="text-[10px] text-secondary font-medium tracking-wide uppercase">Weekly Views</p>
                <p className="text-sm font-bold text-white">1,429 <span className="text-[10px] text-success font-semibold">+12%</span></p>
             </div>
          </div>

          {/* Top Right: Small Badge */}
          <div className="hidden lg:flex absolute right-4 xl:right-12 top-40 p-3 bg-elevated/60 backdrop-blur border border-white/10 rounded-2xl shadow-2xl items-center gap-3 animate-float-medium z-20 pointer-events-none">
             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F0B429] to-[#F97316] flex items-center justify-center text-white">
                <Trophy className="w-4 h-4" />
             </div>
             <div className="text-left">
                <p className="text-xs font-bold text-white">Top 5% Talent</p>
                <div className="flex gap-0.5 mt-0.5">
                   {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[#F0B429]" />)}
                </div>
             </div>
          </div>

          {/* Bottom Left Decor: Connected Pill */}
          <div className="hidden lg:flex absolute left-10 bottom-32 p-2.5 px-4 bg-surface/80 backdrop-blur border border-white/5 rounded-full shadow-2xl items-center gap-2 animate-float-fast z-20">
             <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
             <span className="text-xs font-semibold text-primary">Actively Looking</span>
          </div>

          {/* Bottom Right Decor: Platform Icons */}
          <div className="hidden lg:flex absolute right-16 bottom-48 flex-col gap-2 animate-float-slow z-20" style={{ animationDelay: '1s' }}>
             <div className="flex items-center gap-2 bg-[#111] border border-white/10 p-2 px-3 rounded-xl shadow-xl">
                <Globe className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px] text-secondary font-medium">yourdomain.dev</span>
             </div>
          </div>

          {/* ── Center Content ── */}
          <div className="animate-fade-up mb-8 flex flex-col items-center gap-4">
            {/* Product Hunt Badge */}
            <a 
              href="https://www.producthunt.com/products/folio-00182bb5-5d5e-4f15-bb29-c41d044ce434?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-folio-13" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block transition-transform duration-200 hover:scale-[1.02] active:scale-95"
            >
              <img 
                alt="Folio - The modern, clickable alternative to boring PDF resumes. | Product Hunt" 
                width={250} 
                height={54} 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1153264&theme=light&t=1779444147734" 
                className="w-[200px] sm:w-[250px] h-auto rounded-lg border border-white/5 shadow-md"
              />
            </a>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-[13px] font-medium text-secondary hover:bg-white/[0.06] transition-colors cursor-default shadow-inner">
              <div className="flex -space-x-1.5">
                 <div className="w-5 h-5 rounded-full border border-page bg-accent text-[8px] flex items-center justify-center text-white font-bold">A</div>
                 <div className="w-5 h-5 rounded-full border border-page bg-success text-[8px] flex items-center justify-center text-white font-bold">B</div>
              </div>
              <span>Join <span className="text-white font-semibold">2.8k+</span> ambitious developers</span>
              <div className="h-3 w-px bg-white/20 mx-1"></div>
              <span className="text-accent flex items-center gap-0.5 font-bold">Get Started <ArrowRight className="w-3 h-3" /></span>
            </div>
          </div>


          <h1 className="animate-fade-up-delay-1 mb-8 max-w-[900px] text-[44px] sm:text-[60px] md:text-[76px] font-extrabold tracking-tight text-white leading-[1.05] relative">
            Stop sending boring <br className="hidden sm:block" /> 
            <span className="relative inline-block text-white">
               PDF Resumes.
               <div className="absolute -bottom-2 left-0 w-full h-2 bg-red-500/40 blur-sm rounded-full -rotate-2 z-[-1] animate-fade-in"></div>
               <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-500 -rotate-1 z-10"></div>
            </span>
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-white via-accent to-accent bg-clip-text text-transparent">
               Build a Folio instead.
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 mb-12 max-w-[550px] text-lg sm:text-xl text-secondary leading-relaxed font-medium">
            The ultimate public profile builder for students. Display projects, fetch work experience, and analytics automatically.
          </p>

          {/* Claim CTA Block */}
          {user ? (
            <div className="animate-fade-up-delay-3 w-full max-w-[480px] relative z-20 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent via-[#A855F7] to-accent rounded-[24px] opacity-25 blur-xl"></div>
              <div className="relative p-6 rounded-[22px] border border-white/15 bg-[#0F0F0F] shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left w-full sm:w-auto">
                  <p className="text-xs font-bold text-tertiary uppercase tracking-wider">Welcome back</p>
                  <p className="text-sm font-bold text-white truncate max-w-[260px] mt-0.5">{user.email}</p>
                </div>
                <Link
                  href={hasProfile ? "/dashboard" : "/onboarding"}
                  className="w-full sm:w-auto h-12 px-8 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shrink-0 shadow-lg bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all border-0"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-fade-up-delay-3 w-full max-w-[480px] relative z-20 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent via-[#A855F7] to-accent rounded-[24px] opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500"></div>
              <div className="relative flex items-center p-1.5 sm:p-2 rounded-[22px] border border-white/15 bg-[#0F0F0F] shadow-2xl backdrop-blur-xl">
                <div className="pl-4 sm:pl-5 text-secondary text-[15px] font-medium tracking-wide pointer-events-none select-none hidden sm:block">
                  tryfolio.online/
                </div>
                <div className="pl-4 text-secondary text-sm font-medium sm:hidden">tryfolio/</div>
                <div className="flex-1 relative min-w-0">
                  <input
                    type="text"
                    placeholder="username"
                    value={claimUsername}
                    onChange={(e) => handleClaimInput(e.target.value)}
                    className="pl-1 pr-8 h-12 sm:h-14 text-[16px] font-semibold bg-transparent border-0 shadow-none text-white focus:ring-0 focus:outline-none placeholder:opacity-40 w-full"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {checking && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
                    {!checking && available === true && <Check className="w-4 h-4 text-success" />}
                    {!checking && available === false && claimUsername.length >= 3 && <X className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <Link
                  href={claimUsername.length >= 3 ? `/signup?username=${encodeURIComponent(claimUsername)}` : '/signup'}
                  className="h-11 sm:h-12 px-6 sm:px-8 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shrink-0 shadow-lg bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all border-0"
                >
                  Claim URL <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
              <p className="mt-4 text-[13px] text-tertiary font-medium">
                 {available === true && claimUsername ? <span className="text-success">✓ tryfolio.online/{claimUsername} is available!</span> : '✨ 100% free. Takes less than 2 minutes.'}
              </p>
            </div>
          )}
        </section>

        {/* ── Premium Interactive / Immersive Showcase ─────────────────── */}
        <section className="relative mx-auto max-w-[1100px] px-6 pb-32 perspective-[1000px]">
          <div className="relative animate-fade-in group">
             {/* Glow behind window */}
             <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-accent/20 to-transparent blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
             
             <div className="relative rounded-2xl border border-white/10 bg-[#0D0D0D] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] transform transition-all duration-700 ease-out will-change-transform origin-top hover:rotate-x-1">
                {/* Top Browser Mock Bar */}
                <div className="flex items-center gap-2 px-5 py-4 bg-[#131313] border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FE5F57] shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-[#FEB92C] shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-inner" />
                  </div>
                  <div className="flex-1 max-w-sm mx-auto">
                     <div className="h-7 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center px-3 gap-2">
                        <Zap className="w-3 h-3 text-success fill-success" />
                        <span className="text-[11px] font-medium text-secondary tracking-wide">tryfolio.online/yourname</span>
                     </div>
                  </div>
                  <div className="w-16 flex justify-end">
                     <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center"><PlusIcon className="w-3 h-3 text-secondary" /></div>
                  </div>
                </div>
                
                {/* Dashboard Mock Content Inside Landing */}
                <div className="p-8 sm:p-12 flex flex-col md:flex-row gap-8 md:gap-12 bg-gradient-to-br from-[#0E0E0E] to-[#080808]">
                   
                   {/* Profile Snapshot Left */}
                   <div className="flex-1 space-y-8">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] shadow-xl border border-white/10 relative group-hover:scale-105 transition-transform duration-500 overflow-hidden shrink-0">
                             <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white/20">AR</div>
                          </div>
                          <div className="min-w-0">
                             <div className="h-5 w-36 bg-white/10 rounded-md mb-2"></div>
                             <div className="flex items-center gap-2 mb-2">
                                <div className="h-3 w-24 bg-white/5 rounded"></div>
                             </div>
                             <div className="inline-flex h-5 px-2 rounded-full bg-[#0D2B1A] border border-success/20 items-center justify-center text-[8px] text-success font-bold tracking-wider uppercase whitespace-nowrap">Open for roles</div>
                          </div>
                       </div>

                      <div className="space-y-3 py-4 border-y border-white/5">
                         <div className="flex items-center justify-between">
                            <div className="h-3 w-24 bg-white/10 rounded"></div>
                            <div className="h-3 w-8 bg-accent/20 rounded"></div>
                         </div>
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[75%] bg-accent rounded-full shadow-[0_0_8px_rgba(124,111,255,0.5)]"></div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         {[1,2].map(i => (
                           <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-12 h-12 bg-accent/5 blur-xl rounded-full"></div>
                              <div className="w-8 h-8 rounded-xl bg-white/5 mb-3"></div>
                              <div className="h-3 w-2/3 bg-white/10 rounded mb-2"></div>
                              <div className="h-2 w-full bg-white/5 rounded"></div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Mock Right Side: List of Skills */}
                   <div className="w-full md:w-[320px] flex flex-col gap-4 shrink-0">
                      <div className="p-5 rounded-2xl bg-[#111] border border-white/5 shadow-xl">
                         <div className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">Experience</div>
                         <div className="space-y-5">
                            <div className="flex gap-3 items-start">
                               <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 font-black text-sm shrink-0">G</div>
                               <div className="flex-1 min-w-0">
                                  <div className="h-3 w-20 bg-white/10 rounded mb-1.5"></div>
                                  <div className="h-2 w-32 bg-white/5 rounded"></div>
                               </div>
                            </div>
                            <div className="flex gap-3 items-start opacity-60">
                               <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 font-black text-sm shrink-0">S</div>
                               <div className="flex-1 min-w-0">
                                  <div className="h-3 w-24 bg-white/10 rounded mb-1.5"></div>
                                  <div className="h-2 w-28 bg-white/5 rounded"></div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                         {["React", "Next.js", "Figma", "Supabase", "Tailwind"].map(s => (
                            <div key={s} className="px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.03] text-xs font-medium text-secondary">{s}</div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* ── High Impact Features Grid ─────────────────────────────────── */}
        <section id="features" className="mx-auto max-w-[1200px] px-6 py-24 border-t border-border-subtle/30 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-accent/50 to-transparent"></div>
          
          <div className="text-center mb-20 relative z-10">
            <Badge variant="internship" className="mb-4 rounded-full border-accent/30 px-4">THE BUILDER</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
              Build. Showcase. Repeat.
            </h2>
            <p className="text-lg text-secondary max-w-xl mx-auto">
               We built specific workflows to help junior developers skip manual data entry and focus on creation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`group relative p-7 rounded-3xl bg-surface/30 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-surface/50 animate-fade-up-delay-${Math.min(i + 1, 4)} overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`w-12 h-12 bg-elevated border border-white/5 rounded-2xl flex items-center justify-center mb-6 ${f.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20 relative z-10`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-[17px] font-bold text-white mb-3 relative z-10">{f.title}</h3>
                <p className="text-[14px] text-secondary leading-relaxed relative z-10 font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Transparent & Bold Pricing ──────────────────────────────────── */}
        <section id="pricing" className="mx-auto max-w-[1200px] px-6 py-24 border-t border-white/5 relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 blur-[120px] rounded-full"></div>
          
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Pay once. Keep forever.
            </h2>
            <p className="text-secondary font-medium">No monthly fees. No recurring fatigue. Simple access.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-[840px] mx-auto relative z-10">
            {/* Free tier card */}
            <div className="group p-8 rounded-3xl bg-[#0F0F0F] border border-white/5 flex flex-col transition-all duration-300 hover:border-white/10">
              <div className="mb-8">
                <div className="inline-block p-1.5 px-3 rounded-lg bg-white/5 border border-white/5 text-[11px] font-extrabold text-secondary tracking-wider uppercase mb-4">Basic</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">₹0</span>
                  <span className="text-tertiary font-bold text-sm uppercase tracking-widest">Forever</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-10 flex-1">
                {["Full profile customization", "Projects & Experience blocks", "Basic link analytics", "Tryfolio.online subdomain"].map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                     <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-tertiary" />
                     </div>
                     <span className="text-[14px] text-secondary font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <Link href={user ? (hasProfile ? "/dashboard" : "/onboarding") : "/login"}>
                <Button variant="secondary" size="lg" className="w-full font-bold rounded-2xl h-12 text-sm tracking-wide border-white/10 bg-transparent hover:bg-white/5">
                  {user ? "Go to Dashboard" : "Build your profile"}
                </Button>
              </Link>
            </div>

            {/* Pro tier card - Featured */}
            <div className={`relative p-[2px] rounded-3xl shadow-2xl group transition-all duration-500 ${isPro ? 'bg-gradient-to-b from-[#34C77B] to-transparent shadow-[#34C77B]/10' : 'bg-gradient-to-b from-accent to-transparent shadow-accent/10 hover:shadow-accent/20'}`}>
               <div className="h-full w-full rounded-[22px] bg-[#0F0F0F] relative p-8 flex flex-col overflow-hidden">
                  
                  {/* Subtle pro visual flare */}
                  <div className={`absolute top-0 right-0 w-40 h-40 blur-3xl rounded-full pointer-events-none ${isPro ? 'bg-[#34C77B]/10' : 'bg-accent/10'}`}></div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                     <div>
                        <div className={`inline-flex items-center gap-1.5 p-1.5 px-3 rounded-lg text-[11px] font-extrabold tracking-wider uppercase mb-4 ${isPro ? 'bg-[#34C77B]/10 border border-[#34C77B]/20 text-[#34C77B]' : 'bg-accent/10 border border-accent/20 text-accent'}`}>
                           {isPro ? <><CheckCircle2 className="w-3 h-3" /> Your Plan</> : <><Zap className="w-3 h-3 fill-accent" /> Pro</>}
                        </div>
                        <div className="flex items-baseline gap-2">
                           {isPro ? (
                             <>
                               <span className="text-5xl font-black text-[#34C77B] tracking-tighter">Active</span>
                             </>
                           ) : (
                             <>
                               <span className="text-5xl font-black text-white tracking-tighter">₹499</span>
                               <span className="text-secondary/70 font-bold text-sm uppercase tracking-widest">One Time</span>
                             </>
                           )}
                        </div>
                     </div>
                     <div className="hidden sm:block text-right opacity-30 group-hover:opacity-100 transition-opacity">
                        <Star className={`w-8 h-8 ${isPro ? 'text-[#34C77B] fill-[#34C77B]/20' : 'text-accent fill-accent/20'}`} />
                     </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1 relative z-10">
                     {PRO_FEATURES.map((f, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPro ? 'bg-[#34C77B]/10 shadow-[0_0_8px_rgba(52,199,123,0.2)]' : 'bg-accent/10 shadow-[0_0_8px_rgba(124,111,255,0.2)]'}`}>
                             <CheckCircle2 className={`w-3 h-3 ${isPro ? 'text-[#34C77B]' : 'text-accent'}`} />
                          </div>
                          <span className="text-[14px] text-primary font-bold">{f}</span>
                       </div>
                     ))}
                  </div>

                  {isPro ? (
                    <div className="w-full font-bold rounded-2xl h-12 text-sm bg-[#34C77B]/10 border border-[#34C77B]/20 text-[#34C77B] relative z-10 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> All Pro Features Unlocked
                    </div>
                  ) : (
                    <button
                      onClick={handleProUpgrade}
                      disabled={upgrading}
                      className="w-full font-bold rounded-2xl h-12 text-sm bg-accent text-white relative z-10 border-0 shadow-glow group-hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {upgrading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : user ? (
                        <><Zap className="w-4 h-4 fill-white" /> Buy Pro — ₹499</>
                      ) : (
                        "Unlock Pro Access"
                      )}
                    </button>
                  )}
               </div>
            </div>
          </div>
        </section>

        {/* ── Support Us Section ──────────────────────────────────── */}
        <section className="mx-auto max-w-[1200px] px-6 py-16 border-t border-white/5 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#34C77B]/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative rounded-[32px] border border-[#34C77B]/20 bg-gradient-to-br from-[#0F0F0F] via-[#0D0D0D] to-[#0A0B0A] p-10 md:p-14 text-center overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 p-1.5 px-3 rounded-lg bg-[#34C77B]/10 border border-[#34C77B]/20 text-[11px] font-extrabold text-[#34C77B] tracking-wider uppercase mb-6">
                ❤️ Support Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
                Help Us Keep Folio Free For Students
              </h2>
              <p className="text-secondary font-medium text-sm md:text-base mb-8 max-w-lg leading-relaxed">
                Folio is built with love to help students stand out. If our app helped you build your dream developer portfolio, consider supporting our hosting costs!
              </p>
              
              {/* Razorpay Button Container */}
              <div className="flex items-center justify-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl min-h-[60px] min-w-[200px]">
                <form ref={paymentButtonRef} className="flex justify-center items-center w-full">
                  {/* Dynamic Razorpay Script goes here */}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final Conversion CTA Banner ────────────────────────────────── */}
        <section className="mx-auto max-w-[1200px] px-6 py-16 mb-12">
          <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-[#151515] via-[#0D0D0D] to-[#080808] p-12 md:p-20 text-center overflow-hidden shadow-2xl shadow-black/40 group">
            {/* Animated background gradient sweep */}
            <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
               <div className="w-16 h-16 bg-elevated border border-white/10 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-8">
                  <UserCheck className="w-7 h-7 text-accent" />
               </div>
               <h2 className="text-3xl sm:text-[44px] font-black text-white tracking-tight leading-tight mb-6">
                 Tired of tracking files?<br/>
                 Let&apos;s build your future.
               </h2>
               <p className="text-secondary font-medium text-lg mb-10 opacity-80">
                 Stand out from hundreds of candidate emails. Send recruiters a direct, dynamic profile page that sells you 24/7.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href={user ? (hasProfile ? "/dashboard" : "/onboarding") : "/signup"} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full font-bold px-10 rounded-2xl h-14 bg-white text-black shadow-2xl shadow-white/5 hover:bg-white/90 transition-all border-0 text-base">
                      {user ? "Go to Dashboard" : "Get Started for Free"}
                    </Button>
                  </Link>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Detailed Dark Footer */}
      <footer className="border-t border-white/5 py-16 bg-[#070707] text-secondary text-sm relative z-10">
        <div className="mx-auto max-w-[1200px] px-6 flex flex-col md:flex-row justify-between items-start gap-12">
           <div className="space-y-4 max-w-xs">
              <div className="flex items-center gap-2.5">
                 <img src="/folio-icon.svg" alt="Folio Logo" className="w-7 h-7" />
                 <span className="text-white font-bold text-lg tracking-tight">Folio</span>
              </div>
              <p className="text-tertiary font-medium leading-relaxed">
                 Building dynamic, public profile solutions to help standard tech talent be found effortlessly.
              </p>
           </div>
           
           <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-8 sm:gap-16 w-full sm:w-auto">
             {/* Contact/Support Premium Card */}
             <div className="p-5 rounded-2xl border border-white/5 bg-[#0C0C0C]/50 backdrop-blur-md max-w-sm space-y-4 shadow-xl flex-1 sm:flex-initial sm:min-w-[280px]">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                      <Mail className="w-4.5 h-4.5" />
                   </div>
                   <div>
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider">Contact Us</h4>
                      <p className="text-tertiary text-[11px]">Get fast help or share feedback</p>
                   </div>
                </div>
                <div className="space-y-3">
                   <p className="text-secondary text-[13px] leading-relaxed">
                      Have custom requests or need help setting up your domain? Reach out directly.
                   </p>
                   <a 
                      href="mailto:support@tryfolio.online" 
                      className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all border-0 shadow-md shadow-white/5 cursor-pointer"
                   >
                      Email Support
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                   </a>
                   <div className="text-center pt-0.5">
                      <span className="text-[11px] font-mono text-tertiary select-all cursor-pointer hover:text-secondary transition-colors">
                         support@tryfolio.online
                      </span>
                   </div>
                </div>
             </div>

             {/* Legal Section */}
             <div className="flex flex-col gap-4 min-w-[120px] pt-2">
                <span className="text-white font-bold text-xs uppercase tracking-widest">Legal</span>
                <Link href="/privacy" className="text-tertiary hover:text-white font-medium transition-colors text-[14px]">Privacy Policy</Link>
                <Link href="/terms" className="text-tertiary hover:text-white font-medium transition-colors text-[14px]">Terms of Service</Link>
             </div>
           </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-6 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-tertiary text-[13px] font-medium">© 2026 Folio App. All rights reserved.</p>
           <p className="text-tertiary text-[13px] font-medium flex items-center gap-1">Made with <span className="text-red-500">❤️</span> in India.</p>
        </div>
       </footer>
    </div>
  )
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
