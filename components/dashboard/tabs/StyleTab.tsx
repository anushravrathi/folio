"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useDashboardContext } from "@/context/DashboardContext"
import { Check } from "lucide-react"

export function StyleTab() {
  const { config, updateConfig } = useDashboardContext()
  
  const themes = [
    { id: "emerald" as const, name: "Dark", color: "#10B981", secondary: "#064E3B", desc: "Emerald Coast Dark Theme" },
    { id: "light" as const, name: "Light", color: "#4F46E5", secondary: "#3B82F6", desc: "Crisp & Modern Light Theme" },
    { id: "playful" as const, name: "Playful", color: "#6366F1", secondary: "#EC4899", desc: "Playful Parchment Theme" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border-subtle bg-surface/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] text-white">Global Aesthetic Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {themes.map((t) => {
               const isSelected = config.theme === t.id || (t.id === 'emerald' && (config.theme === 'default' || config.theme === 'dark'))
               return (
                 <button
                   key={t.id}
                   type="button"
                   onClick={() => updateConfig({ theme: t.id })}
                   className={`flex flex-col p-4 rounded-2xl border-2 transition-all overflow-hidden relative group text-left ${
                     isSelected ? 'border-white/20 bg-white/5' : 'border-white/5 bg-[#111] hover:border-white/10'
                   }`}
                 >
                   {/* Mini preview tile in corner */}
                   <div className="absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                        style={{ background: t.color }}></div>

                   <div className="flex justify-between items-start mb-3 relative z-10">
                     <div className="flex gap-1.5">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: t.color }}></div>
                        <div className="w-4 h-4 rounded-full shadow-sm opacity-50" style={{ backgroundColor: t.secondary }}></div>
                     </div>
                     {isSelected && (
                       <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center scale-90 shadow-lg">
                          <Check className="w-3 h-3 stroke-[3]" />
                       </div>
                     )}
                   </div>
                   
                   <span className={`text-sm font-bold relative z-10 ${isSelected ? 'text-white' : 'text-secondary'}`}>
                     {t.name}
                   </span>
                   <span className="text-[10px] font-medium text-tertiary relative z-10 mt-0.5 uppercase tracking-wider">
                     {t.desc}
                   </span>
                 </button>
               )
             })}
          </div>
          
          {/* Note indicating more themes coming soon */}
          <div className="mt-6 text-center border-t border-white/5 pt-4">
             <p className="text-xs text-tertiary font-medium">
               ✨ More themes coming soon in upcoming updates.
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
