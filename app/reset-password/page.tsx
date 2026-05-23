"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { KeyRound, Loader2, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage("Invalid or expired password reset session. Please request a new link.")
        setIsError(true)
      }
      setCheckingToken(false)
    }
    verifySession()
  }, [])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsError(false)

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      setIsError(true)
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      setIsError(true)
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setMessage(error.message)
        setIsError(true)
      } else {
        setMessage("🎉 Password updated successfully! Redirecting you to login...")
        // Log out user to clear the temporary reset session
        await supabase.auth.signOut()
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (err: any) {
      setMessage(err?.message || "An unexpected error occurred.")
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-page text-primary flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
        <p className="text-secondary text-sm font-medium animate-pulse">Verifying reset session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page text-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 group mx-auto">
          <img src="/folio-icon.svg" alt="Folio Logo" className="w-8 h-8" />
          <span className="text-xl font-extrabold text-white tracking-tight">Folio</span>
        </Link>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Update your password</h2>
          <p className="text-sm font-medium text-secondary mt-1.5">Enter a strong, secure new password below</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <Card className="border-border-subtle bg-surface/30 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          {!isError || !message.includes("reset session") ? (
            <form className="space-y-4" onSubmit={handlePasswordUpdate}>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-secondary">
                  New Password
                </label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-page h-11"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-secondary">
                  Confirm New Password
                </label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-page h-11"
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-white text-black hover:bg-white/90 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          ) : null}

          {message && (
            <p className={`text-xs text-center font-medium animate-fade-in leading-relaxed p-3.5 rounded-xl border ${isError ? 'text-red-400 bg-red-500/5 border-red-500/10' : 'text-success bg-success/5 border-success/10'}`}>
              {message}
            </p>
          )}

          {isError && message.includes("reset session") ? (
            <div className="text-center pt-2">
              <Link 
                href="/forgot-password" 
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold"
              >
                Request New Reset Link <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
