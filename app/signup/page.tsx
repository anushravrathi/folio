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

  const handleGithubSignup = async () => {
    const onboardingDest = `/onboarding${claimedUsername ? `?username=${claimedUsername}` : ''}${redirectTo ? `${claimedUsername ? '&' : '?'}redirect=${encodeURIComponent(redirectTo)}` : ''}`
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + onboardingDest
      }
    })
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

          <div className="relative flex items-center py-4 my-2">
            <div className="flex-grow border-t border-border-subtle"></div>
            <span className="flex-shrink-0 mx-4 text-tertiary text-xs uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-border-subtle"></div>
          </div>

          <Button 
            className="w-full flex items-center justify-center gap-2 h-11 text-[15px]" 
            size="lg"
            variant="secondary"
            onClick={handleGithubSignup}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Sign up with GitHub
          </Button>
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
