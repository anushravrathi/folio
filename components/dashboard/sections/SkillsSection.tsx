"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { GripVertical, X, Plus } from "lucide-react"
import { useDashboardContext } from "@/context/DashboardContext"

export function SkillsSection() {
  const { config, updateConfig } = useDashboardContext()
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addSkill()
    }
  }

  const addSkill = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (!config.skills.includes(trimmed)) {
      updateConfig({ skills: [...config.skills, trimmed] })
    }
    setInputValue("")
  }

  const removeSkill = (skillToRemove: string) => {
    updateConfig({ skills: config.skills.filter(s => s !== skillToRemove) })
  }

  return (
    <Card className="border-border-subtle bg-surface/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] text-white">Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input 
            placeholder="Type a skill and press Enter..." 
            className="bg-surface pr-10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={addSkill}
            className="absolute right-2 top-1.5 w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Selected Skills List */}
        <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
          {config.skills.length > 0 ? config.skills.map((skill, idx) => (
            <div key={`${skill}-${idx}`} className="flex items-center gap-1.5 bg-elevated border border-border-subtle rounded-full pl-2 pr-1 py-1 group animate-fade-in">
              <span className="text-xs font-bold text-primary pl-1">{skill}</span>
              <button 
                onClick={() => removeSkill(skill)}
                className="text-tertiary hover:text-red-400 rounded-full p-0.5 hover:bg-border-subtle transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )) : (
            <p className="text-xs text-tertiary italic">No skills added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
