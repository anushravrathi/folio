"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-page flex items-center justify-center text-primary">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto"></div>
          <p className="text-secondary text-sm font-medium animate-pulse">Initializing auth callback...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'
  const claimedUsername = searchParams.get('username') || ''

  useEffect(() => {
    const exchangeCode = async () => {
      try {
        if (code) {
          // PKCE Auth Code flow: exchange temporary code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error

          if (data?.user) {
            await handleRedirect(data.user.id)
          } else {
            router.push('/login?error=Failed to retrieve user during code exchange')
          }
        } else {
          // Implicit flow or direct load: check if session is already stored
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            await handleRedirect(session.user.id)
          } else {
            // Give standard OAuth listener a brief moment to process hash fragments
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
              if (currentSession?.user) {
                subscription.unsubscribe()
                await handleRedirect(currentSession.user.id)
              } else {
                // If still no user, redirect to login
                setTimeout(() => {
                  subscription.unsubscribe()
                  router.push('/login')
                }, 2500)
              }
            })
          }
        }
      } catch (err: any) {
        console.error('OAuth Callback Error:', err)
        router.push(`/login?error=${encodeURIComponent(err.message || 'Authentication exchange failed')}`)
      }
    }

    exchangeCode()
  }, [code, next, claimedUsername, router])

  const handleRedirect = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Query onboarding check API with Bearer token
      const checkRes = await fetch(`/api/check-onboarding?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })

      if (checkRes.ok) {
        const checkData = await checkRes.json()
        if (checkData.onboarded) {
          // User already completed onboarding - redirect to target dashboard
          router.push(next)
        } else {
          // First-time user: route to onboarding, carrying claimed username/redirect through
          const onboardingDest = `/onboarding${claimedUsername ? `?username=${claimedUsername}` : ''}${
            claimedUsername ? '&' : '?'
          }redirect=${encodeURIComponent(next)}`
          router.push(onboardingDest)
        }
      } else {
        // Safe fallback - send to onboarding
        router.push(`/onboarding?redirect=${encodeURIComponent(next)}`)
      }
    } catch (err) {
      console.error('Failed checking onboarding during OAuth callback:', err)
      router.push(next)
    }
  }

  return (
    <div className="min-h-screen bg-page text-primary font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Visual cyber premium grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center shadow-xl animate-pulse">
          <img src="/folio-icon.svg" alt="Folio Logo" className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white tracking-tight">Completing Sign In</h1>
          <p className="text-secondary text-xs leading-relaxed max-w-[260px] mx-auto">
            Establishing secure workspace and establishing credentials...
          </p>
        </div>

        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}
