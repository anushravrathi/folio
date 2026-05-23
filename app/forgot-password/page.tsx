"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Mail, Loader2, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsError(false)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setMessage(error.message)
        setIsError(true)
      } else {
        setMessage("🎉 We've sent a secure password reset link to your email. Please check your inbox.")
        setEmail("")
      }
    } catch (err: any) {
      setMessage(err?.message || "An unexpected error occurred.")
      setIsError(true)
    } finally {
      setLoading(false)
    }
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
          <h2 className="text-2xl font-black text-white tracking-tight">Reset your password</h2>
          <p className="text-sm font-medium text-secondary mt-1.5">Enter your email and we'll send you a secure link</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <Card className="border-border-subtle bg-surface/30 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          <form className="space-y-4" onSubmit={handleResetRequest}>
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
                  Sending Link...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Password Reset Link
                </>
              )}
            </Button>
          </form>

          {message && (
            <p className={`text-xs text-center font-medium animate-fade-in leading-relaxed p-3.5 rounded-xl border ${isError ? 'text-red-400 bg-red-500/5 border-red-500/10' : 'text-success bg-success/5 border-success/10'}`}>
              {message}
            </p>
          )}

          <div className="text-center pt-2 border-t border-border-subtle/50">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-white font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login Page
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
