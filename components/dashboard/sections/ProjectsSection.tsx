"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Plus, Trash2, Check, Box } from "lucide-react"
import { useDashboardContext, Project } from "@/context/DashboardContext"

export function ProjectsSection() {
  const { config, updateConfig } = useDashboardContext()
  const [isAdding, setIsAdding] = useState(false)
  const [newProj, setNewProj] = useState<Project>({
    name: "", description: "", link: "", isDeployed: false
  })

  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAdd = () => {
    if (!newProj.name || !newProj.description) return
    if (editingIndex !== null) {
      const updated = [...config.projects]
      updated[editingIndex] = newProj
      updateConfig({ projects: updated })
      setEditingIndex(null)
    } else {
      updateConfig({ projects: [...config.projects, newProj] })
    }
    setNewProj({ name: "", description: "", link: "", isDeployed: false })
    setIsAdding(false)
  }

  const editProj = (index: number) => {
    setNewProj(config.projects[index])
    setEditingIndex(index)
    setIsAdding(true)
  }

  const removeProj = (index: number) => {
    updateConfig({ projects: config.projects.filter((_, i) => i !== index) })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setNewProj({ name: "", description: "", link: "", isDeployed: false })
  }

  return (
    <Card className="border-border-subtle bg-surface/30">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-[15px] text-white">Projects</CardTitle>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="secondary" size="sm" className="h-8 gap-1.5 text-xs bg-white/10 hover:bg-white/20">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 rounded-2xl border border-white/10 bg-elevated space-y-3 animate-fade-in">
            <Input placeholder="Project Name" value={newProj.name} onChange={e => setNewProj({...newProj, name: e.target.value})} />
            <Input placeholder="Brief Description" value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} />
            <Input placeholder="Project URL (Optional)" value={newProj.link} onChange={e => setNewProj({...newProj, link: e.target.value})} />
            <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
              <input type="checkbox" checked={newProj.isDeployed} onChange={e => setNewProj({...newProj, isDeployed: e.target.checked})} className="rounded border-white/20 bg-surface/50 text-accent focus:ring-accent" />
              Deployed Project
            </label>
            <div className="flex justify-end gap-2 pt-2">
               <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
               <Button size="sm" className="bg-accent text-white" onClick={handleAdd}><Check className="w-3.5 h-3.5 mr-1" /> Save</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {config.projects.length > 0 ? config.projects.map((proj, i) => (
            <div key={i} className="group flex items-center gap-3 p-4 rounded-xl border border-border-subtle bg-surface hover:border-accent/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0 flex items-center justify-center text-emerald-400">
                <Box className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-white truncate">{proj.name}</p>
                  {proj.isDeployed && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 shrink-0">
                      Live
                    </span>
                  )}
                </div>
                <p className="text-tertiary text-xs truncate mt-0.5">{proj.description}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                   onClick={() => editProj(i)}
                   className="text-tertiary hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-all"
                >
                  <span className="text-xs font-bold">Edit</span>
                </button>
                <button 
                   onClick={() => removeProj(i)}
                   className="text-tertiary hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : !isAdding && (
             <div className="text-center py-8 border border-dashed border-border-subtle rounded-xl bg-surface/50">
                <p className="text-xs text-tertiary">No showcase projects yet.</p>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
