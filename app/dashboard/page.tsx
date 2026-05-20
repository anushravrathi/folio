"use client"

import { Editor } from "@/components/dashboard/Editor"
import { PhonePreview } from "@/components/dashboard/PhonePreview"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { Eye, ExternalLink, LayoutDashboard, Rocket, CheckCircle2, Copy } from "lucide-react"
import { DashboardProvider, useDashboardContext } from "@/context/DashboardContext"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/context/ToastContext"

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}

function DashboardContent() {
  const { config, updateConfig, isNewUser } = useDashboardContext()
  const [isSaving, setIsSaving] = useState(false)
  const [showDeploySuccess, setShowDeploySuccess] = useState(false)
  const { showToast } = useToast()

  const profileUrl = config.username ? `/${config.username}` : '#'
  const fullUrl = config.username ? `folio.in/${config.username}` : 'folio.in/...'

  const handleDeploy = async () => {
    if (!config.username) {
      showToast('Please set a username in Settings before deploying.', 'error')
      return
    }

    if (!config.name || config.name.trim().length === 0) {
      showToast('Please add your name before deploying.', 'error')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      const data = await res.json()
      if (data.success) {
        updateConfig({ isDeployed: true })
        setShowDeploySuccess(true)
        showToast(`Deployed! Your profile is live at ${fullUrl}`, 'success', 5000)
        setTimeout(() => setShowDeploySuccess(false), 6000)
      } else {
        showToast('Deploy failed: ' + data.error, 'error')
      }
    } catch (err) {
      showToast('An error occurred during deploy.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!config.username) return
    try {
      await navigator.clipboard.writeText(`https://${fullUrl}`)
      showToast('Profile URL copied to clipboard!', 'success')
    } catch {
      showToast('Failed to copy URL', 'error')
    }
  }

  return (
    <div className="flex h-screen flex-col bg-page text-primary overflow-hidden relative font-sans selection:bg-accent/30">
      {/* Subtle background radial highlight */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Deploy Success Banner */}
      {showDeploySuccess && (
        <div className="absolute top-14 left-0 right-0 z-50 flex justify-center animate-fade-up">
          <div className="flex items-center gap-3 px-5 py-3 bg-success/10 border border-success/20 rounded-2xl backdrop-blur-xl shadow-2xl">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-semibold text-success">Profile deployed successfully!</span>
            <a 
              href={`https://${fullUrl}`} 
              target="_blank" 
              className="text-xs font-bold text-success underline underline-offset-2 hover:text-white transition-colors"
            >
              Visit →
            </a>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-surface/50 backdrop-blur-md px-5 z-10">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/folio-icon.svg" alt="Folio Logo" className="w-6 h-6 transition-transform group-hover:scale-105" />
            <span className="text-sm font-semibold text-white tracking-tight hidden md:block">
              Folio
            </span>
          </Link>
          
          <div className="h-4 w-px bg-border-subtle hidden sm:block"></div>
          
          {config.username && (
            <button 
              onClick={handleCopyUrl}
              className="hidden sm:flex items-center gap-2 text-xs font-medium text-secondary bg-elevated/50 px-2.5 py-1 rounded-full border border-border-subtle hover:border-accent/30 hover:text-white transition-all cursor-pointer group"
            >
              <span>folio.in/</span>
              <span className="text-primary font-semibold">{config.username}</span>
              <Copy className="w-3 h-3 text-tertiary group-hover:text-accent transition-colors" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {config.isDeployed && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-secondary border border-border-subtle bg-surface/50 px-2 py-1 rounded-md mr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
              Live
            </div>
          )}
          
          {config.username && (
            <Link href={profileUrl} target="_blank" className="hidden md:block">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs border border-transparent hover:border-border-subtle font-medium">
                <Eye className="w-3.5 h-3.5" />
                Preview
              </Button>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs text-secondary hover:text-white"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
          >
            Log out
          </Button>

          <Button 
            size="sm" 
            onClick={handleDeploy}
            disabled={isSaving}
            className="h-8 px-4 text-xs font-semibold shadow-lg shadow-accent/20 tracking-wide bg-accent hover:brightness-110 transition-all hover:scale-[1.02] gap-1.5"
          >
            <Rocket className="w-3.5 h-3.5" />
            {isSaving ? 'SAVING...' : 'DEPLOY'}
          </Button>
        </div>
      </header>

      {/* New User Welcome Banner */}
      {isNewUser && (
        <div className="border-b border-accent/20 bg-accent/5 px-6 py-4 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Welcome to Folio! 🎉</p>
              <p className="text-xs text-secondary">Fill in your profile details below, then hit Deploy to go live.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Two Columns */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Column: Editor */}
        <div className="w-full lg:w-[60%] flex flex-col border-r border-border-subtle bg-page relative">
          <Editor />
        </div>
        
        {/* Right Column: Live Phone Preview */}
        <div className="hidden lg:flex w-[40%] flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
          {/* Background grid dots */}
          <div className="absolute inset-0 opacity-[0.15]" 
               style={{ 
                 backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                 backgroundSize: '24px 24px'
               }}>
          </div>
          
          <div className="relative z-10 animate-fade-in">
            <PhonePreview />
          </div>
          
          {/* Floating helper text for preview */}
          <div className="absolute bottom-8 flex items-center gap-2 text-[11px] font-medium text-tertiary bg-elevated/30 backdrop-blur px-3 py-1.5 rounded-full border border-border-subtle">
            <LayoutDashboard className="w-3 h-3" />
            Live Preview
          </div>
        </div>
      </div>
      
      {/* Mobile Preview Floating Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button className="rounded-full shadow-xl shadow-accent/30 h-12 px-6 gap-2 text-sm font-bold hover:scale-105 active:scale-95 transition-transform">
          <Eye className="w-4 h-4" />
          Preview
        </Button>
      </div>
    </div>
  )
}
