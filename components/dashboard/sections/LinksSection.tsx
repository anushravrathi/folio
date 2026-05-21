import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Globe, FileText, Loader2 } from "lucide-react"

import { useDashboardContext } from "@/context/DashboardContext"
import { supabase } from "@/lib/supabaseClient"

export function LinksSection() {
  const { config, updateConfig } = useDashboardContext()
  const [uploading, setUploading] = useState(false)

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !config?.id) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'resumes')
      formData.append('userId', config.id)

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        updateConfig({ cvUrl: data.url })
      } else {
        console.error('CV upload failed:', data.error)
      }
    } catch (err) {
      console.error('CV upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const updateLink = (key: keyof typeof config.socialLinks, value: string) => {
    updateConfig({
      socialLinks: {
        ...config.socialLinks,
        [key]: value
      }
    })
  }

  return (
    <Card className="border-border-subtle bg-surface/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] text-white">Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-elevated border border-border-subtle shrink-0 flex items-center justify-center text-secondary">
             <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>
          <Input 
            placeholder="github.com/username" 
            className="h-10" 
            value={config.socialLinks.github}
            onChange={e => updateLink('github', e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-elevated border border-border-subtle shrink-0 flex items-center justify-center text-secondary font-bold text-xs">
            in
          </div>
          <Input 
            placeholder="linkedin.com/in/username" 
            className="h-10" 
            value={config.socialLinks.linkedin}
            onChange={e => updateLink('linkedin', e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-elevated border border-border-subtle shrink-0 flex items-center justify-center text-secondary font-bold text-xs">
            X
          </div>
          <Input 
            placeholder="twitter.com/username" 
            className="h-10" 
            value={config.socialLinks.twitter}
            onChange={e => updateLink('twitter', e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-border-subtle mt-4 space-y-3">
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider block">Resume / CV</label>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-elevated border border-border-subtle shrink-0 flex items-center justify-center text-secondary">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 flex gap-2">
              <Input 
                placeholder="Paste CV link (or upload PDF)..." 
                className="h-10 flex-1" 
                value={config.cvUrl}
                onChange={e => updateConfig({ cvUrl: e.target.value })}
              />
              <input 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                id="cv-upload" 
                onChange={handleCvUpload}
                disabled={uploading}
              />
              <label 
                htmlFor="cv-upload" 
                className={`h-10 bg-surface hover:bg-surface/85 border border-border-subtle px-3 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition-colors whitespace-nowrap gap-1.5 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                    Uploading...
                  </>
                ) : (
                  'Upload PDF'
                )}
              </label>
            </div>
          </div>
          {config.cvUrl && (config.cvUrl.startsWith('data:') || config.cvUrl.includes('/storage/v1/object/public/resumes/')) && (
            <p className="text-[10px] text-accent font-semibold flex items-center gap-1.5 pl-12">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              PDF file attached successfully
            </p>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
