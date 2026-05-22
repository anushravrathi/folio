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

  const handleGoogleSignup = async () => {
    setMessage("")
    setLoading(true)
    try {
      const callbackParams = new URLSearchParams()
      if (redirectTo) callbackParams.append('next', redirectTo)
      if (claimedUsername) callbackParams.append('username', claimedUsername)
      
      const paramString = callbackParams.toString()
      const redirectUrl = `${window.location.origin}/auth/callback${paramString ? `?${paramString}` : ''}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })
      if (error) {
        setMessage(error.message)
        setLoading(false)
      }
    } catch (err: any) {
      setMessage(err?.message || "Failed to trigger Google signup.")
      setLoading(false)
    }
  }

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
        
        <Card className="p-8 border-border-subtle bg-surface/50 shadow-none flex flex-col gap-5">
          <Button
            variant="ghost"
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 h-11 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-3 bg-[#0F0F0F] text-[10px] uppercase font-extrabold text-tertiary tracking-widest z-10 select-none">
              Or continue with email
            </span>
          </div>

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
