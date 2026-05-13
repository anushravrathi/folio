"use client"

import { Editor } from "@/components/dashboard/Editor"
import { PhonePreview } from "@/components/dashboard/PhonePreview"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { Eye, ExternalLink, LayoutDashboard } from "lucide-react"
import { DashboardProvider } from "@/context/DashboardContext"

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <div className="flex h-screen flex-col bg-page text-primary overflow-hidden relative font-sans selection:bg-accent/30">
      {/* Subtle background radial highlight */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 blur-[100px] rounded-full"></div>
      </div>

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
          
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-secondary bg-elevated/50 px-2.5 py-1 rounded-full border border-border-subtle">
            <span>folio.in/</span>
            <span className="text-primary font-semibold">username</span>
            <a href="#" className="text-tertiary hover:text-white transition-colors ml-0.5">
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-secondary border border-border-subtle bg-surface/50 px-2 py-1 rounded-md mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
            Changes saved
          </div>
          
          <Link href="/preview" className="hidden md:block">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs border border-transparent hover:border-border-subtle font-medium">
              <Eye className="w-3.5 h-3.5" />
              View live
            </Button>
          </Link>
          
          <Button size="sm" className="h-8 px-4 text-xs font-semibold shadow-lg shadow-accent/20 tracking-wide bg-accent hover:brightness-110 transition-all hover:scale-[1.02]">
            DEPLOY
          </Button>
        </div>
      </header>

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
    </DashboardProvider>
  )
}
