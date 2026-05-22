"use client"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { ArrowRight, CheckCircle2, Zap, Link as LinkIcon, BarChart3, Star, Code, Trophy, UserCheck, Globe, Check, X, Loader2, Mail, Music, TrendingUp, Copy, Plus, Compass, ShieldCheck, Eye, Download } from "lucide-react"
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
  "Exclusive PRO Badge on Profile",
  "Remove Folio watermark",
  "Custom domain support",
  "Deep profile analytics",
  "Extra premium themes",
  "Priority support & setup",
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
    <div className="min-h-screen bg-page text-primary font-sans flex flex-col overflow-x-hidden relative selection:bg-accent/40 noise">
      {/* Rich Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-fade opacity-50"></div>
        
        {/* Massive Ambient Blurs */}
        <div
          className="glow-orb w-[800px] h-[800px] top-[-300px] left-1/2 -translate-x-1/2"
          style={{ background: "radial-gradient(circle, rgba(124,111,255,0.18) 0%, transparent 65%)" }}
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
      <nav className="sticky top-0 z-50 w-full border-b border-border-subtle/30 glass transition-all duration-300">
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-2.5 cursor-pointer group">
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
            <a
              href="https://www.x.com/tryfolioonline"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow Us
            </a>
            <div className="flex items-center gap-3">
              {user ? (
                <Link href={hasProfile ? "/dashboard" : "/onboarding"}>
                  <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold px-5 h-9 bg-white hover:bg-white/95 text-black border-0 shadow-glow">
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
                    <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold px-5 h-9 bg-white hover:bg-white/95 text-black border-0 shadow-glow">
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
        <section className="relative mx-auto max-w-[1200px] px-6 pt-24 pb-20 md:pt-32 md:pb-24 flex flex-col items-center text-center overflow-visible">
          
          {/* ── Floating Decoratives ── */}
          {/* Top Left: Tiny Stats UI */}
          <div className="hidden lg:flex absolute left-0 xl:left-8 top-28 p-3.5 px-4 bg-[#111]/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] items-center gap-3 animate-float-slow z-20 pointer-events-none select-none">
             <div className="p-2 bg-badge-open-bg rounded-xl text-badge-open-fg">
                <BarChart3 className="w-4.5 h-4.5" />
             </div>
             <div className="text-left">
                <p className="text-[10px] text-tertiary font-bold tracking-widest uppercase">Weekly Views</p>
                <p className="text-sm font-black text-white">1,429 <span className="text-[10px] text-success font-semibold">+12%</span></p>
             </div>
          </div>

          {/* Top Right: Small Badge */}
          <div className="hidden lg:flex absolute right-4 xl:right-12 top-40 p-3 bg-[#111]/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] items-center gap-3 animate-float-medium z-20 pointer-events-none select-none">
             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-[#7C6FFF] flex items-center justify-center text-white">
                <Trophy className="w-4.5 h-4.5" />
             </div>
             <div className="text-left">
                <p className="text-xs font-bold text-white">Top 5% Developer</p>
                <div className="flex gap-0.5 mt-0.5">
                   {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent" />)}
                </div>
             </div>
          </div>

          {/* Bottom Left Decor: Connected Pill */}
          <div className="hidden lg:flex absolute left-8 bottom-32 p-2.5 px-4 bg-[#111]/75 backdrop-blur-md border border-white/10 rounded-full shadow-2xl items-center gap-2 animate-float-fast z-20 select-none">
             <div className="w-2 h-2 rounded-full bg-success animate-ping"></div>
             <div className="w-2 h-2 rounded-full bg-success absolute left-2.5"></div>
             <span className="text-[11px] font-bold text-white uppercase tracking-wider">Actively Looking</span>
          </div>

          {/* Bottom Right Decor: Custom domain */}
          <div className="hidden lg:flex absolute right-16 bottom-40 flex-col gap-2 animate-float-slow z-20 select-none" style={{ animationDelay: '1s' }}>
             <div className="flex items-center gap-2 bg-[#111]/80 border border-white/10 p-2 px-4 rounded-xl shadow-2xl">
                <Globe className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px] text-white font-semibold">yourdomain.dev</span>
             </div>
          </div>

          {/* ── Center Content ── */}
          <div className="animate-fade-up mb-6 flex flex-col items-center gap-4">
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
                className="w-[200px] sm:w-[250px] h-auto rounded-xl border border-white/10 shadow-lg"
              />
            </a>

            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md text-[12px] font-semibold text-secondary hover:bg-white/[0.05] transition-colors cursor-default shadow-lg select-none">
              <div className="flex -space-x-1.5">
                 <div className="w-5 h-5 rounded-full border border-page bg-accent text-[8px] flex items-center justify-center text-white font-black">F</div>
                 <div className="w-5 h-5 rounded-full border border-page bg-success text-[8px] flex items-center justify-center text-white font-black">O</div>
              </div>
              <span>Empowering <span className="text-white font-bold">2.8k+</span> ambitious creators</span>
              <div className="h-3 w-px bg-white/20 mx-1"></div>
              <span className="text-accent flex items-center gap-0.5 font-extrabold hover:underline">Get Started <ArrowRight className="w-3 h-3 stroke-[2.5]" /></span>
            </div>
          </div>

          <h1 className="animate-fade-up-delay-1 mb-8 max-w-[950px] text-[40px] sm:text-[56px] md:text-[76px] font-black tracking-tight text-white leading-[1.05] relative select-none">
            Stop sending boring <br className="hidden sm:block" /> 
            <span className="relative inline-block text-white px-2">
               PDF Resumes.
               <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-[#7C6FFF]/20 blur-md rounded-xl z-[-1]"></div>
               <div className="absolute bottom-1.5 left-0 w-full h-[6px] bg-accent/40 rounded-full z-[-1]"></div>
            </span>
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
               Build a Folio instead.
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 mb-10 max-w-[580px] text-base sm:text-lg text-secondary leading-relaxed font-semibold">
            The ultimate dynamic portfolio builder for builders. Display active projects, link live Spotify widgets, and track advanced telemetry automatically.
          </p>

          {/* Claim CTA Block */}
          {user ? (
            <div className="animate-fade-up-delay-3 w-full max-w-[480px] relative z-20 group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-accent via-[#7C6FFF] to-success rounded-[24px] opacity-25 blur-xl group-hover:opacity-35 transition-opacity duration-300"></div>
              <div className="relative p-6 rounded-[22px] border border-white/10 bg-[#0A0A0A] shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left w-full sm:w-auto">
                  <p className="text-[10px] font-extrabold text-tertiary uppercase tracking-widest">Signed In As</p>
                  <p className="text-sm font-black text-white truncate max-w-[240px] mt-0.5">{user.email}</p>
                </div>
                <Link
                  href={hasProfile ? "/dashboard" : "/onboarding"}
                  className="w-full sm:w-auto h-12 px-7 rounded-xl font-extrabold text-[14px] flex items-center justify-center gap-2 shrink-0 shadow-lg bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all border-0 cursor-pointer"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-fade-up-delay-3 w-full max-w-[480px] relative z-20 group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-accent via-[#7C6FFF] to-[#34C77B] rounded-[24px] opacity-20 group-hover:opacity-35 blur-2xl transition-opacity duration-500"></div>
              <div className="relative flex items-center p-1.5 sm:p-2 rounded-2xl border border-white/15 bg-[#0F0F0F] shadow-2xl backdrop-blur-xl">
                <div className="pl-4 sm:pl-5 text-secondary/60 text-[14px] font-bold tracking-wide pointer-events-none select-none hidden sm:block">
                  tryfolio.online/
                </div>
                <div className="pl-4 text-secondary/60 text-xs font-bold sm:hidden">tryfolio/</div>
                <div className="flex-1 relative min-w-0">
                  <input
                    type="text"
                    placeholder="username"
                    value={claimUsername}
                    onChange={(e) => handleClaimInput(e.target.value)}
                    className="pl-1 pr-8 h-12 sm:h-14 text-[15px] font-bold bg-transparent border-0 shadow-none text-white focus:ring-0 focus:outline-none placeholder:opacity-30 w-full"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {checking && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
                    {!checking && available === true && <Check className="w-4 h-4 text-success" />}
                    {!checking && available === false && claimUsername.length >= 3 && <X className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <Link
                  href={claimUsername.length >= 3 ? `/signup?username=${encodeURIComponent(claimUsername)}` : '/signup'}
                  className="h-11 sm:h-12 px-5 sm:px-7 rounded-xl font-extrabold text-[14px] flex items-center justify-center gap-1.5 shrink-0 shadow-lg bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all border-0 cursor-pointer"
                >
                  Claim URL <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
              <p className="mt-3 text-[12px] text-tertiary font-semibold select-none">
                 {available === true && claimUsername ? <span className="text-success">✓ tryfolio.online/{claimUsername} is available!</span> : '⚡ Instant claim. Fully free.'}
              </p>
            </div>
          )}
        </section>

        {/* ── INTERACTIVE AWWWARDS BENTO GRID (AWESOME SHADCN STYLE) ─────────────────── */}
        <section id="features" className="mx-auto max-w-[1200px] px-6 py-20 border-t border-border-subtle/20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-accent to-transparent opacity-40"></div>
          
          <div className="text-center mb-16 relative z-10">
            <Badge variant="default" className="mb-4 rounded-full border-white/10 bg-white/[0.02] px-4 font-bold text-xs tracking-widest text-accent uppercase">PRODUCT BRIEF</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Engineered for Developers.
            </h2>
            <p className="text-base text-secondary max-w-lg mx-auto font-medium leading-relaxed">
               Forget about writing copy or aligning elements. We build dynamic tiles directly from the platforms you live on.
            </p>
          </div>

          {/* Bento layout structure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            
            {/* Card 1: GitHub Autocomplete (Col Span 2) */}
            <div className="md:col-span-2 group relative rounded-[28px] border border-white/5 bg-[#111]/30 hover:bg-[#111]/50 p-8 overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/15 flex flex-col justify-between min-h-[340px]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="flex justify-between items-start gap-4 mb-8">
                <div className="max-w-md">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4 group-hover:scale-105 transition-transform">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">GitHub Autocomplete</h3>
                  <p className="text-xs text-secondary leading-relaxed font-semibold">
                    Paste any repository link. We pull the description, active languages, star telemetry, and branches instantly. No manual text editor required.
                  </p>
                </div>
                <div className="text-white/25 group-hover:text-accent/40 transition-colors hidden sm:block">
                  <Github className="w-12 h-12" />
                </div>
              </div>

              {/* Graphic Mock */}
              <div className="w-full bg-[#070707] border border-white/10 rounded-2xl p-4 font-mono text-[11px] leading-normal relative overflow-hidden select-none">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 text-secondary font-bold text-[10px]">
                    <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-accent" /> IMPORT ENGINE</span>
                    <span className="text-accent/80 animate-pulse">● ACTIVE INTEGRATION</span>
                 </div>
                 <div className="space-y-3.5">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg p-2.5">
                       <span className="text-[#34C77B]">GET</span>
                       <span className="text-white font-bold truncate">github.com/nextlevelbuilder/ui-ux-pro-max-skill</span>
                    </div>
                    {/* Simulated loading result */}
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-white font-bold font-sans text-xs">ui-ux-pro-max-skill</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-bold">TypeScript</span>
                       </div>
                       <p className="text-tertiary font-sans text-[11px] font-medium leading-relaxed">Design intelligence skill database with priority optimization engines.</p>
                       <div className="flex gap-4 pt-1 text-secondary font-bold text-[10px]">
                          <span>★ 1,420 Stars</span>
                          <span>⑂ 239 Forks</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Card 2: Spotify Listening Live (Col Span 1) */}
            <div className="group relative rounded-[28px] border border-white/5 bg-[#111]/30 hover:bg-[#111]/50 p-8 overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/15 flex flex-col justify-between min-h-[340px]">
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-success/5 blur-[80px] rounded-full pointer-events-none"></div>

              <div>
                <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success mb-4 group-hover:scale-105 transition-transform">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Live Spotify Widget</h3>
                <p className="text-xs text-secondary leading-relaxed font-semibold">
                  Signal recruiters that you are currently at your desk active. Streams your live playback data in real-time.
                </p>
              </div>

              {/* Graphic Mock */}
              <div className="p-4 bg-[#070707] border border-white/10 rounded-2xl flex items-center justify-between gap-4 mt-6 select-none relative overflow-hidden">
                 <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#282828] to-[#121212] rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden border border-white/10 shadow-lg group-hover:rotate-6 transition-transform duration-300">
                       <Music className="w-5 h-5 text-success/60 absolute animate-pulse" />
                    </div>
                    <div className="min-w-0 text-left">
                       <p className="text-[12px] font-bold text-white truncate font-sans">Starboy</p>
                       <p className="text-[10px] text-secondary truncate font-medium font-sans">The Weeknd</p>
                       <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></div>
                          <span className="text-[8px] text-success font-extrabold uppercase tracking-widest">Listening Live</span>
                       </div>
                    </div>
                 </div>
                 {/* Wave animations */}
                 <div className="flex items-end gap-[3px] h-6 shrink-0 pb-1">
                    <div className="w-[3px] bg-success rounded-full animate-[bounce_1s_infinite_100ms] h-3"></div>
                    <div className="w-[3px] bg-success rounded-full animate-[bounce_1.2s_infinite_300ms] h-5"></div>
                    <div className="w-[3px] bg-success rounded-full animate-[bounce_0.8s_infinite_0ms] h-4"></div>
                    <div className="w-[3px] bg-success rounded-full animate-[bounce_1.1s_infinite_200ms] h-6"></div>
                 </div>
              </div>
            </div>

            {/* Card 3: Profile Analytics (Col Span 1) */}
            <div className="group relative rounded-[28px] border border-white/5 bg-[#111]/30 hover:bg-[#111]/50 p-8 overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/15 flex flex-col justify-between min-h-[340px]">
              <div className="absolute top-0 left-0 w-60 h-60 bg-[#EC4899]/5 blur-[80px] rounded-full pointer-events-none"></div>

              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/20 flex items-center justify-center text-[#EC4899] mb-4 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Detailed Telemetry</h3>
                <p className="text-xs text-secondary leading-relaxed font-semibold">
                  Get insights of exactly who is reviewing your credentials and where they landed from. 
                </p>
              </div>

              {/* Graphic Mock */}
              <div className="p-4 bg-[#070707] border border-white/10 rounded-2xl space-y-2 mt-6 select-none">
                 <div className="flex justify-between items-center text-[10px] text-secondary font-bold uppercase tracking-wider mb-2 pb-1.5 border-b border-white/5">
                    <span>Traffic Channels</span>
                    <span className="text-[#EC4899]">Live hits</span>
                 </div>
                 <div className="space-y-2">
                    {[
                      { channel: 'Twitter', count: 29, pct: 'w-[90%]', color: 'bg-accent' },
                      { channel: 'Peerlist', count: 15, pct: 'w-[55%]', color: 'bg-success' },
                      { channel: 'GitHub', count: 9, pct: 'w-[32%]', color: 'bg-white' },
                    ].map(ch => (
                      <div key={ch.channel} className="space-y-1">
                         <div className="flex justify-between text-[10px] font-bold text-white">
                            <span>{ch.channel}</span>
                            <span className="text-secondary">{ch.count}</span>
                         </div>
                         <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${ch.color} ${ch.pct} rounded-full`}></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Card 4: Theme presets & PRO badge preview (Col Span 2) */}
            <div className="md:col-span-2 group relative rounded-[28px] border border-white/5 bg-[#111]/30 hover:bg-[#111]/50 p-8 overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/15 flex flex-col justify-between min-h-[340px]">
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="flex justify-between items-start gap-4 mb-8">
                <div className="max-w-md">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-105 transition-transform">
                    <Star className="w-5 h-5 fill-amber-500/20" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">Beautiful Visual Themes</h3>
                  <p className="text-xs text-secondary leading-relaxed font-semibold">
                    Style your page dynamically. Pick between **Dark (Emerald Coast)**, crisp clean **Light**, and colorful **Playful** modes, carrying a luxurious golden PRO Badge to distinguish your profile.
                  </p>
                </div>
              </div>

              {/* Graphic Mock */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 select-none w-full">
                 <div className="flex-1 p-4 bg-[#070707] border border-white/10 rounded-2xl text-left w-full sm:w-auto">
                    <div className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-3">Verified badge preview</div>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-white font-sans">Anushrav Rathi</span>
                       {/* PRO BADGE */}
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-gradient-to-r from-accent to-[#7C6FFF] text-white shadow-[0_0_12px_rgba(124,111,255,0.4)] border border-white/10 transform hover:scale-105 transition-transform">
                         <Star className="w-2.5 h-2.5 fill-white text-white" /> PRO
                       </span>
                    </div>
                    <p className="text-[10px] text-secondary mt-1 font-medium font-sans">Full Stack Designer & Builder</p>
                 </div>
                 
                 {/* Themes toggle visual */}
                 <div className="flex gap-2 p-2 bg-[#070707] border border-white/10 rounded-2xl w-full sm:w-auto shrink-0 justify-center">
                    <div className="p-2.5 px-4 bg-[#111] border border-success/20 rounded-xl text-[10px] font-bold text-success flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-success"></div> Dark
                    </div>
                    <div className="p-2.5 px-4 bg-transparent rounded-xl text-[10px] font-bold text-secondary flex items-center gap-1.5 opacity-60">
                       <div className="w-2 h-2 rounded-full bg-white"></div> Light
                    </div>
                    <div className="p-2.5 px-4 bg-transparent rounded-xl text-[10px] font-bold text-secondary flex items-center gap-1.5 opacity-60">
                       <div className="w-2 h-2 rounded-full bg-accent"></div> Playful
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── PREMIUM INTERACTIVE PREVIEW SECTION ─────────────────── */}
        <section className="relative mx-auto max-w-[1100px] px-6 py-12 pb-24 perspective-[1000px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">Immersive Profile Preview</h2>
            <p className="text-secondary text-sm font-medium">Behold your dynamic developer dashboard. Drag or hover to explore.</p>
          </div>

          <div className="relative animate-fade-in group">
             {/* Glow behind window */}
             <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-accent/20 to-transparent blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
             
             <div className="relative rounded-3xl border border-white/10 bg-[#0E0E0E] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] transform transition-all duration-700 ease-out will-change-transform hover:scale-[1.01] hover:border-white/15">
                {/* Top Browser Mock Bar */}
                <div className="flex items-center gap-2 px-6 py-4.5 bg-[#141414] border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FE5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEB92C]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="flex-1 max-w-md mx-auto">
                     <div className="h-8 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center px-4 gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[11px] font-extrabold text-secondary tracking-widest uppercase">tryfolio.online/yourname</span>
                     </div>
                  </div>
                  <div className="w-16 flex justify-end">
                     <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center"><Plus className="w-3 h-3 text-secondary" /></div>
                  </div>
                </div>
                
                {/* Dashboard Mock Content Inside Landing */}
                <div className="p-8 sm:p-14 flex flex-col md:flex-row gap-8 md:gap-14 bg-gradient-to-br from-[#0F0F0F] to-[#080808]">
                   
                   {/* Profile Snapshot Left */}
                   <div className="flex-1 space-y-8">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          <div className="w-18 h-18 rounded-[24px] bg-gradient-to-br from-[#202020] to-[#121212] shadow-2xl border border-white/10 relative overflow-hidden shrink-0 flex items-center justify-center font-black text-xl text-white/10 group-hover:scale-105 transition-transform duration-500">
                             F
                          </div>
                          <div className="min-w-0 text-left">
                             <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                <h3 className="text-xl font-black text-white font-sans tracking-tight">Your Full Name</h3>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-gradient-to-r from-accent to-[#7C6FFF] text-white border border-white/5 shadow-md">
                                  <Star className="w-2.5 h-2.5 fill-white text-white" /> PRO
                                </span>
                             </div>
                             <p className="text-sm font-semibold text-secondary font-sans mb-3">Software Engineer & Builder</p>
                             <div className="inline-flex h-5.5 px-3 rounded-full bg-[#0D2B1A] border border-success/20 items-center justify-center text-[9px] text-success font-extrabold tracking-wider uppercase">Open for opportunities</div>
                          </div>
                       </div>

                       <div className="space-y-3.5 py-5 border-y border-white/5 text-left">
                          <h4 className="text-xs font-bold text-tertiary uppercase tracking-widest">About Me</h4>
                          <p className="text-secondary text-sm leading-relaxed font-semibold">
                             Welcome to your dynamic Folio! This space automatically renders your Github experience, projects, skills, custom links, and active Spotify playback tiles to impress recruiters in a single click.
                          </p>
                       </div>

                       {/* Mock Projects */}
                       <div className="space-y-4 text-left">
                          <h4 className="text-xs font-bold text-tertiary uppercase tracking-widest">Featured Projects</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {[
                               { title: 'cyber-telemetry', desc: 'Real-time server activity dashboard', lang: 'TypeScript' },
                               { title: 'aesthetic-bento', desc: 'Dynamic grid customization engine', lang: 'React' },
                             ].map((proj, idx) => (
                               <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors relative overflow-hidden group/card">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 blur-2xl rounded-full"></div>
                                  <div className="flex justify-between items-center mb-2.5">
                                     <span className="text-sm font-black text-white font-sans">{proj.title}</span>
                                     <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-secondary">{proj.lang}</span>
                                  </div>
                                  <p className="text-secondary text-xs leading-relaxed font-medium mb-3">{proj.desc}</p>
                                  <div className="text-[10px] text-accent font-extrabold tracking-wide uppercase flex items-center gap-1 group-hover/card:underline">
                                     Explore Repo <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                   </div>

                   {/* Mock Right Side: Quick Stats / Experience */}
                   <div className="w-full md:w-[340px] flex flex-col gap-6 shrink-0 text-left">
                      <div className="p-6 rounded-2xl bg-[#111]/40 border border-white/5 shadow-2xl relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                         <div className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-4">Work Experience</div>
                         <div className="space-y-5">
                            <div className="flex gap-4.5 items-start">
                               <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 font-black text-sm shrink-0">F</div>
                               <div className="flex-1 min-w-0">
                                  <h5 className="text-[13px] font-bold text-white font-sans">Software Engineer</h5>
                                  <p className="text-[11px] text-secondary font-medium">Folio Online • 2026 - Present</p>
                               </div>
                            </div>
                            <div className="flex gap-4.5 items-start opacity-60">
                               <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10 font-black text-sm shrink-0">G</div>
                               <div className="flex-1 min-w-0">
                                  <h5 className="text-[13px] font-bold text-white font-sans">Tech Intern</h5>
                                  <p className="text-[11px] text-secondary font-medium">Google Summer of Code • 2025</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-[#111]/40 border border-white/5 shadow-2xl space-y-4">
                         <div className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Connect</div>
                         <div className="flex flex-col gap-2.5">
                            <div className="h-10 px-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-semibold text-white hover:bg-white/10 transition-colors">
                               <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#EC4899]" /> Send Email</span>
                               <ArrowRight className="w-3 h-3 text-secondary" />
                            </div>
                            <div className="h-10 px-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-semibold text-white hover:bg-white/10 transition-colors">
                               <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5 text-accent" /> Download CV</span>
                               <ArrowRight className="w-3 h-3 text-secondary" />
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                         {["React", "Next.js", "TypeScript", "Tailwind", "Supabase", "Figma"].map(s => (
                            <div key={s} className="px-3.5 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-[11px] font-semibold text-secondary">{s}</div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* ── TRANSPARENT & BOLD PRICING (Lifetime support) ──────────────────────────────────── */}
        <section id="pricing" className="mx-auto max-w-[1200px] px-6 py-20 border-t border-white/5 relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="text-center mb-16 relative z-10">
            <Badge variant="default" className="mb-4 rounded-full border-white/10 bg-white/[0.02] px-4 font-bold text-xs tracking-widest text-accent uppercase">PRICING TIERS</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Simple Pricing. Single Purchase.
            </h2>
            <p className="text-secondary text-sm font-semibold max-w-xs mx-auto">No subscriptions. No platform lock-in. Lifetime utility.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-[840px] mx-auto relative z-10">
            {/* Free tier card */}
            <div className="group p-8 rounded-3xl bg-[#0B0B0B]/60 border border-white/5 flex flex-col transition-all duration-300 hover:border-white/10">
              <div className="mb-8 text-left">
                <div className="inline-block p-1.5 px-3 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-secondary tracking-widest uppercase mb-4">Basic</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">₹0</span>
                  <span className="text-tertiary font-bold text-xs uppercase tracking-widest">Forever</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-10 flex-1 text-left">
                {["Full profile customization", "Projects & Experience blocks", "Resume/CV file upload", "Basic link analytics", "Tryfolio.online subdomain"].map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                     <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-tertiary" />
                     </div>
                     <span className="text-[13px] text-secondary font-semibold">{f}</span>
                  </div>
                ))}
              </div>

              <Link href={user ? (hasProfile ? "/dashboard" : "/onboarding") : "/login"} className="w-full">
                <Button variant="secondary" size="lg" className="w-full font-extrabold rounded-xl h-12 text-xs tracking-widest uppercase border-white/10 bg-transparent hover:bg-white/5 cursor-pointer">
                  {user ? "Go to Dashboard" : "Build your profile"}
                </Button>
              </Link>
            </div>

            {/* Pro tier card - Featured */}
            <div className={`relative p-[1.5px] rounded-3xl shadow-2xl group transition-all duration-500 ${isPro ? 'bg-gradient-to-b from-success to-transparent shadow-success/5' : 'bg-gradient-to-b from-accent to-transparent shadow-accent/5 hover:shadow-accent/15'}`}>
               <div className="h-full w-full rounded-[22px] bg-[#0B0B0B] relative p-8 flex flex-col overflow-hidden">
                  
                  {/* Pro glow effect */}
                  <div className={`absolute top-0 right-0 w-44 h-44 blur-3xl rounded-full pointer-events-none ${isPro ? 'bg-success/5' : 'bg-accent/5'}`}></div>

                  <div className="flex items-center justify-between mb-8 relative z-10 text-left">
                     <div>
                        <div className={`inline-flex items-center gap-1.5 p-1.5 px-3 rounded-lg text-[10px] font-black tracking-widest uppercase mb-4 ${isPro ? 'bg-[#34C77B]/10 border border-[#34C77B]/20 text-[#34C77B]' : 'bg-accent/10 border border-accent/20 text-accent'}`}>
                           {isPro ? <><CheckCircle2 className="w-3 h-3" /> Active Plan</> : <><Zap className="w-3 h-3 fill-accent" /> Premium Pro</>}
                        </div>
                        <div className="flex items-baseline gap-2">
                           {isPro ? (
                             <>
                               <span className="text-5xl font-black text-[#34C77B] tracking-tighter">Active</span>
                             </>
                           ) : (
                             <>
                               <span className="text-5xl font-black text-white tracking-tighter">₹499</span>
                               <span className="text-secondary/70 font-bold text-xs uppercase tracking-widest">One Time</span>
                             </>
                           )}
                        </div>
                     </div>
                     <div className="hidden sm:block text-right opacity-30 group-hover:opacity-100 transition-opacity">
                        <Star className={`w-8 h-8 ${isPro ? 'text-[#34C77B] fill-[#34C77B]/20' : 'text-accent fill-accent/20'}`} />
                     </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1 relative z-10 text-left">
                     {PRO_FEATURES.map((f, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPro ? 'bg-[#34C77B]/15' : 'bg-accent/15'}`}>
                             <CheckCircle2 className={`w-3 h-3 ${isPro ? 'text-[#34C77B]' : 'text-accent'}`} />
                          </div>
                          <span className="text-[13px] text-white font-bold">{f}</span>
                       </div>
                     ))}
                  </div>

                  {isPro ? (
                    <div className="w-full font-extrabold rounded-xl h-12 text-xs tracking-widest uppercase bg-success/10 border border-success/20 text-success relative z-10 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Unlocked Successfully
                    </div>
                  ) : (
                    <button
                      onClick={handleProUpgrade}
                      disabled={upgrading}
                      className="w-full font-extrabold rounded-xl h-12 text-xs tracking-widest uppercase bg-accent text-white relative z-10 border-0 shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {upgrading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : user ? (
                        <><Zap className="w-4 h-4 fill-white" /> Upgrade Pro — ₹499</>
                      ) : (
                        "Get Pro Access"
                      )}
                    </button>
                  )}
               </div>
            </div>
          </div>
        </section>

        {/* ── Support Us Section ──────────────────────────────────── */}
        <section className="mx-auto max-w-[1200px] px-6 py-12 border-t border-white/5 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-success/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative rounded-[32px] border border-success/20 bg-gradient-to-br from-[#0A0A0A] via-[#080808] to-[#040504] p-10 md:p-14 text-center overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 p-1.5 px-3 rounded-lg bg-[#34C77B]/10 border border-[#34C77B]/20 text-[10px] font-black text-[#34C77B] tracking-widest uppercase mb-6">
                ❤️ Mission Support
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                Help Us Keep Folio Free For Students.
              </h2>
              <p className="text-secondary font-semibold text-sm md:text-base mb-8 max-w-md leading-relaxed">
                If our application helped you build your dream portfolio and stand out, help us keep the servers running for everyone!
              </p>
              
              {/* Razorpay Donation Button Container */}
              <div className="flex items-center justify-center p-4 bg-white/[0.01] border border-white/5 rounded-2xl min-h-[60px] min-w-[200px]">
                <form ref={paymentButtonRef} className="flex justify-center items-center w-full">
                  {/* Dynamic Razorpay Script */}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final Conversion CTA Banner ────────────────────────────────── */}
        <section className="mx-auto max-w-[1200px] px-6 py-16 mb-12">
          <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-[#121212] via-[#0A0A0A] to-[#060606] p-12 md:p-20 text-center overflow-hidden shadow-2xl group">
            {/* Animated background gradient sweep */}
            <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 max-w-xl mx-auto">
               <div className="w-16 h-16 bg-elevated border border-white/10 rounded-2xl mx-auto flex items-center justify-center shadow-2xl mb-8">
                  <UserCheck className="w-6.5 h-6.5 text-accent" />
               </div>
               <h2 className="text-3xl sm:text-[44px] font-black text-white tracking-tight leading-none mb-6">
                 Tired of tracking files? Let&apos;s build.
               </h2>
               <p className="text-secondary font-semibold text-base mb-10 leading-relaxed">
                 Stand out from hundreds of candidate email attachments. Send recruiters a direct, dynamic, and glowing profile that sells your potential 24/7.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href={user ? (hasProfile ? "/dashboard" : "/onboarding") : "/signup"} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full font-bold px-10 rounded-xl h-14 bg-white text-black shadow-2xl hover:bg-white/90 transition-all border-0 text-sm tracking-wider uppercase cursor-pointer">
                      {user ? "Go to Dashboard" : "Get Started for Free"}
                    </Button>
                  </Link>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Detailed Dark Footer */}
      <footer className="border-t border-white/5 py-16 bg-[#050505] text-secondary text-sm relative z-10">
        <div className="mx-auto max-w-[1200px] px-6 flex flex-col md:flex-row justify-between items-start gap-12">
           <div className="space-y-4 max-w-xs text-left">
              <div className="flex items-center gap-2.5">
                 <img src="/folio-icon.svg" alt="Folio Logo" className="w-7 h-7" />
                 <span className="text-white font-black text-lg tracking-tight">Folio</span>
              </div>
              <p className="text-tertiary font-bold leading-relaxed text-xs">
                 Building dynamic, high-fidelity profile customized vectors to help developer talent be discovered seamlessly.
              </p>
           </div>
           
           <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-8 sm:gap-16 w-full sm:w-auto">
             {/* Contact/Support Premium Card */}
             <div className="p-5.5 rounded-2xl border border-white/5 bg-[#080808]/80 backdrop-blur-md max-w-sm space-y-4 shadow-2xl flex-1 sm:flex-initial sm:min-w-[290px] text-left">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                      <Mail className="w-4.5 h-4.5" />
                   </div>
                   <div>
                      <h4 className="text-white font-extrabold text-xs uppercase tracking-widest">Support Core</h4>
                      <p className="text-tertiary text-[10px] font-bold">Fast help & feature feedback</p>
                   </div>
                </div>
                <div className="space-y-3">
                   <p className="text-secondary text-xs leading-relaxed font-semibold">
                      Need custom templates or help with a domain setup? Our developer support is online.
                   </p>
                   <a 
                      href="mailto:support@tryfolio.online" 
                      className="inline-flex items-center justify-center gap-2 w-full h-10.5 rounded-xl bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all border-0 shadow-md cursor-pointer"
                   >
                      Email Support
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                   </a>
                   <a 
                      href="https://www.x.com/tryfolioonline"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full h-10.5 rounded-xl bg-white/5 border border-white/10 text-white font-extrabold text-xs uppercase tracking-widest hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer"
                   >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                         <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Follow @tryfolioonline
                   </a>
                   <div className="text-center pt-0.5">
                      <span className="text-[11px] font-mono text-tertiary select-all cursor-pointer hover:text-secondary transition-colors font-semibold">
                         support@tryfolio.online
                      </span>
                   </div>
                </div>
             </div>

             {/* Legal Section */}
             <div className="flex flex-col gap-3 min-w-[120px] pt-2 text-left">
                <span className="text-white font-extrabold text-xs uppercase tracking-widest mb-1.5">Legal</span>
                <Link href="/privacy" className="text-tertiary hover:text-white font-bold transition-colors text-xs tracking-wide">Privacy Policy</Link>
                <Link href="/terms" className="text-tertiary hover:text-white font-bold transition-colors text-xs tracking-wide">Terms of Service</Link>
             </div>
           </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-6 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-tertiary text-xs font-bold">© 2026 Folio App. All rights reserved.</p>
           <p className="text-tertiary text-xs font-bold flex items-center gap-1">Made with <span className="text-red-500">❤️</span> in India.</p>
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

function Github(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}
