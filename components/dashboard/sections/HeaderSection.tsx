import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Camera } from "lucide-react"

import { useDashboardContext } from "@/context/DashboardContext"

export function HeaderSection() {
  const { config, updateConfig } = useDashboardContext()

  return (
    <Card className="border-border-subtle bg-surface/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] text-white">Header</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-elevated border border-border-subtle flex items-center justify-center text-tertiary overflow-hidden">
              {config.avatarUrl ? (
                <img src={config.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
            </div>
            <div className="text-sm text-secondary flex-1">
              <p className="text-primary font-medium mb-1">Profile Photo</p>
              <div className="flex gap-2 items-center">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        updateConfig({ avatarUrl: reader.result as string })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                  id="avatar-upload"
                />
                <label 
                  htmlFor="avatar-upload" 
                  className="bg-surface hover:bg-surface/80 border border-border-subtle px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors"
                >
                  Upload Image
                </label>
                <span className="text-[10px] text-tertiary">or</span>
                <Input 
                  placeholder="Paste URL..." 
                  value={config.avatarUrl}
                  onChange={(e) => updateConfig({ avatarUrl: e.target.value })}
                  className="h-8 text-xs bg-surface flex-1"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-medium text-secondary uppercase tracking-wider">Full Name</label>
          <Input 
             placeholder="John Doe" 
             value={config.name}
             onChange={(e) => updateConfig({ name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-medium text-secondary uppercase tracking-wider">Title</label>
          <Input 
             placeholder="Full Stack Developer" 
             value={config.title}
             onChange={(e) => updateConfig({ title: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Location</label>
            <Input 
               placeholder="Delhi, India" 
               value={config.location}
               onChange={(e) => updateConfig({ location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Email</label>
            <Input type="email" placeholder="john@example.com" />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border-subtle mt-4">
          <div>
            <p className="text-sm font-medium text-white">Open to work</p>
            <p className="text-xs text-secondary">Shows a green badge on your profile</p>
          </div>
          <button 
             type="button"
             onClick={() => updateConfig({ openToWork: !config.openToWork })}
             className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${config.openToWork ? 'bg-accent' : 'bg-[#222]'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${config.openToWork ? 'right-1' : 'left-1'}`}></div>
          </button>
        </div>

        <div className="pt-4 border-t border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">GitHub Activity Graph</p>
              <p className="text-xs text-secondary">Displays green activity tiles next to profile photo</p>
            </div>
            <button 
               type="button"
               onClick={() => updateConfig({ showGithubActivity: !config.showGithubActivity })}
               className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${config.showGithubActivity ? 'bg-accent' : 'bg-[#222]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${config.showGithubActivity ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
          <div className="space-y-2 bg-elevated/50 p-3 rounded-xl border border-border-subtle">
             <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">GitHub Username</label>
             <Input 
                placeholder="anushrav" 
                className="h-8 text-xs bg-surface" 
                value={config.githubUsername}
                onChange={(e) => updateConfig({ githubUsername: e.target.value })}
             />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
