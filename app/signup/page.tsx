"use client"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Mail, Loader2, User } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div></div>}>
      <SignupContent />
    </Suspense>
  )
}

function SignupContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const claimedUsername = searchParams.get('username') || ''
  const redirectTo = searchParams.get('redirect') || ''

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Check if user has a profile with username via secure API
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const checkRes = await fetch(`/api/check-onboarding?userId=${user.id}`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
          })
          if (checkRes.ok) {
            const checkData = await checkRes.json()
            if (checkData.onboarded) {
              router.push(redirectTo || '/dashboard')
            } else {
              const onboardingDest = `/onboarding${claimedUsername ? `?username=${claimedUsername}` : ''}${redirectTo ? `${claimedUsername ? '&' : '?'}redirect=${encodeURIComponent(redirectTo)}` : ''}`
              router.push(onboardingDest)
            }
          } else {
            const onboardingDest = `/onboarding${claimedUsername ? `?username=${claimedUsername}` : ''}${redirectTo ? `${claimedUsername ? '&' : '?'}redirect=${encodeURIComponent(redirectTo)}` : ''}`
            router.push(onboardingDest)
          }
        } catch {
          const onboardingDest = `/onboarding${claimedUsername ? `?username=${claimedUsername}` : ''}${redirectTo ? `${claimedUsername ? '&' : '?'}redirect=${encodeURIComponent(redirectTo)}` : ''}`
          router.push(onboardingDest)
        }
        return
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [router, claimedUsername, redirectTo])

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    
    const onboardingDest = `/onboarding${claimedUsername ? `?username=${claimedUsername}` : ''}${redirectTo ? `${claimedUsername ? '&' : '?'}redirect=${encodeURIComponent(redirectTo)}` : ''}`
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + onboardingDest,
      }
    })

    if (error) {
      setMessage(error.message)
    } else if (data.user && !data.user.identities?.length) {
      setMessage("An account with this email already exists. Try logging in instead.")
    } else if (data.session) {
      // No email confirmation required — redirect to onboarding
      router.push(onboardingDest)
    } else {
      setMessage("Check your email to confirm your account, then log in.")
    }
    setLoading(false)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6 text-primary">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group">
        <img src="/folio-icon.svg" alt="Folio Logo" className="w-8 h-8 transition-transform group-hover:scale-105" />
        <span className="text-[18px] font-bold text-white tracking-tight">Folio</span>
      </Link>
      
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Create your account</h1>
          <p className="text-secondary">
            {claimedUsername 
              ? <>Claim <span className="text-accent font-semibold">tryfolio.online/{claimedUsername}</span> — sign up first</>
              : "Start building your profile today"
            }
          </p>
        </div>
        
        <Card className="p-8 border-border-subtle bg-surface/50 shadow-none">
          <form className="space-y-4" onSubmit={handleEmailSignup}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-secondary">
                  Email address
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-page h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-secondary">
                  Password
                </label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create a password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-page h-11"
                />
              </div>
            </div>
            <Button 
              variant="secondary" 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-11 bg-white text-black hover:bg-white/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            {message && (
              <p className={`text-xs text-center mt-2 font-medium animate-fade-in ${message.includes('Check your email') || message.includes('confirm') ? 'text-success' : 'text-red-500'}`}>{message}</p>
            )}
          </form>
        </Card>
        
        <p className="text-center mt-8 text-sm text-tertiary">
          Already have an account? <Link href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-white hover:underline">Log in</Link>
        </p>

        <p className="text-center mt-4 text-[11px] text-tertiary leading-relaxed">
          By signing up, you agree to our <br />
          <Link href="#" className="underline underline-offset-4 hover:text-secondary transition-colors">Terms of Service</Link> and <Link href="#" className="underline underline-offset-4 hover:text-secondary transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
