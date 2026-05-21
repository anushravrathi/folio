"use client"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Mail, Loader2 } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div></div>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ''

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // If there's a redirect, check if they are onboarded first!
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const checkRes = await fetch(`/api/check-onboarding?userId=${user.id}`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
          })
          if (checkRes.ok) {
            const checkData = await checkRes.json()
            if (!checkData.onboarded) {
              // Not onboarded yet! Send to onboarding with the redirect param!
              router.push(`/onboarding?redirect=${encodeURIComponent(redirectTo || '/dashboard')}`)
              return
            }
          }
        } catch (err) {
          console.error("Failed to check onboarding in auth useEffect:", err)
        }

        if (redirectTo) {
          router.push(redirectTo)
          return
        }
        router.push('/dashboard')
        return
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [router, redirectTo])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else if (data.user) {
      // If there's a redirect, check if they are onboarded first!
      try {
        const { data: { session: sess } } = await supabase.auth.getSession()
        const checkRes = await fetch(`/api/check-onboarding?userId=${data.user.id}`, {
          headers: { 'Authorization': `Bearer ${sess?.access_token}` }
        })
        if (checkRes.ok) {
          const checkData = await checkRes.json()
          if (!checkData.onboarded) {
            // Not onboarded yet! Send to onboarding with the redirect param!
            router.push(`/onboarding?redirect=${encodeURIComponent(redirectTo || '/dashboard')}`)
            return
          }
        }
      } catch (err) {
        console.error("Failed to check onboarding in handleEmailLogin:", err)
      }

      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.push('/dashboard')
      }
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
          <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-secondary">Log in to your Folio account</p>
        </div>
        
        <Card className="p-8 border-border-subtle bg-surface/50 shadow-none">
          
          <form className="space-y-4" onSubmit={handleEmailLogin}>
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
                <label htmlFor="password" className="text-sm font-medium text-secondary flex justify-between">
                  <span>Password</span>
                  <Link href="#" className="text-accent hover:underline text-xs">Forgot?</Link>
                </label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
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
              {loading ? "Logging in..." : "Login"}
            </Button>
            {message && (
              <p className="text-xs text-center text-red-500 mt-2 font-medium animate-fade-in">{message}</p>
            )}
          </form>
        </Card>
        
        <p className="text-center mt-8 text-sm text-tertiary">
          Don&apos;t have an account? <Link href={`/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-white hover:underline">Sign up</Link>
        </p>

        <p className="text-center mt-4 text-[11px] text-tertiary leading-relaxed">
          By clicking continue, you agree to our <br />
          <Link href="#" className="underline underline-offset-4 hover:text-secondary transition-colors">Terms of Service</Link> and <Link href="#" className="underline underline-offset-4 hover:text-secondary transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
