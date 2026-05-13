"use client"

import { useEffect, useState } from "react"
import { ProfilePage } from "@/components/profile/ProfilePage"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PreviewPage() {
  const [config, setConfig] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("folio_dashboard_config")
      if (saved) {
        setConfig(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load config from local storage", e)
    }
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090909] relative">
      {/* Back to editor banner */}
      <div className="sticky top-0 z-50 bg-page/80 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 py-3">
        <div className="text-sm text-secondary font-medium">
          👁️ Preview Mode
        </div>
        <Link href="/dashboard">
          <Button variant="secondary" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Editor
          </Button>
        </Link>
      </div>
      <ProfilePage config={config} />
    </div>
  )
}
