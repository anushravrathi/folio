"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { GraduationCap } from "lucide-react"
import { useDashboardContext } from "@/context/DashboardContext"

export function EducationSection() {
  const { config, updateConfig } = useDashboardContext()

  const updateEd = (field: string, val: string) => {
    updateConfig({
      education: {
        ...config.education,
        [field]: val
      }
    })
  }

  return (
    <Card className="border-border-subtle bg-surface/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] text-white flex items-center gap-2">
           <GraduationCap className="w-4 h-4 text-blue-400" /> Education
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input 
           placeholder="Degree (e.g. B.Tech Computer Science)" 
           value={config.education.degree} 
           onChange={e => updateEd('degree', e.target.value)}
        />
        <Input 
           placeholder="School/Institution Name" 
           value={config.education.school} 
           onChange={e => updateEd('school', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
           <Input 
              placeholder="CGPA / Percentage" 
              value={config.education.cgpa} 
              onChange={e => updateEd('cgpa', e.target.value)}
           />
           <Input 
              placeholder="Graduation Year" 
              value={config.education.year} 
              onChange={e => updateEd('year', e.target.value)}
           />
        </div>
      </CardContent>
    </Card>
  )
}
