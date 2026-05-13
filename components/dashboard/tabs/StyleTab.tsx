"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useDashboardContext } from "@/context/DashboardContext"
import { Check } from "lucide-react"

export function StyleTab() {
  const { config, updateConfig } = useDashboardContext()
  
  const themes = [
    { id: "default" as const, name: "Vapor Purple", color: "#6C63FF", secondary: "#3B82F6" },
    { id: "emerald" as const, name: "Emerald Coast", color: "#10B981", secondary: "#064E3B" },
    { id: "sunset" as const, name: "Solar Sunset", color: "#F59E0B", secondary: "#9D174D" },
    { id: "rose" as const, name: "Rose Velvet", color: "#E11D48", secondary: "#4C0519" },
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
               const isSelected = config.theme === t.id
               return (
                 <button
                   key={t.id}
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
                     Dark Mode Mesh
                   </span>
                 </button>
               )
             })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-subtle bg-surface/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-[15px] text-white">Typography</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-3xl font-sans mb-2 text-white">Aa</span>
              <span className="text-sm font-medium text-white">Outfit</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/5 bg-[#111] cursor-pointer hover:border-white/10 transition-colors">
              <span className="text-3xl font-sans mb-2 text-white opacity-80">Aa</span>
              <span className="text-sm font-medium text-tertiary">Inter</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
