"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Plus, Trash2, Check, GripVertical } from "lucide-react"
import { useDashboardContext, Experience } from "@/context/DashboardContext"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableItemProps {
  id: string
  index: number
  ex: Experience
  onEdit: (index: number) => void
  onRemove: (index: number) => void
}

function SortableExItem({ id, index, ex, onEdit, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : "auto",
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 p-3 rounded-xl border border-border-subtle bg-surface hover:border-accent/30 transition-all"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-tertiary hover:text-secondary p-1 shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 shrink-0 flex items-center justify-center text-xs font-bold text-accent">
        {ex.company[0]?.toUpperCase() || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white truncate">{ex.company}</p>
        <p className="text-tertiary text-xs truncate">
          {ex.role} • {ex.startMonth}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={() => onEdit(index)}
          className="text-tertiary hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-all"
        >
          <span className="text-xs font-bold">Edit</span>
        </button>
        <button
          onClick={() => onRemove(index)}
          className="text-tertiary hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function ExperienceSection() {
  const { config, updateConfig } = useDashboardContext()
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newEx, setNewEx] = useState<Experience>({
    company: "",
    role: "",
    startMonth: "",
    endMonth: "",
    isCurrent: false,
    description: "",
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAdd = () => {
    if (!newEx.company || !newEx.role) return
    const formattedEx = { ...newEx, endMonth: newEx.isCurrent ? "Present" : newEx.endMonth }
    if (editingIndex !== null) {
      const updated = [...config.experiences]
      updated[editingIndex] = formattedEx
      updateConfig({ experiences: updated })
      setEditingIndex(null)
    } else {
      updateConfig({ experiences: [...config.experiences, formattedEx] })
    }
    setNewEx({ company: "", role: "", startMonth: "", endMonth: "", isCurrent: false, description: "" })
    setIsAdding(false)
  }

  const editEx = (index: number) => {
    setNewEx(config.experiences[index])
    setEditingIndex(index)
    setIsAdding(true)
  }

  const removeEx = (index: number) => {
    updateConfig({ experiences: config.experiences.filter((_, i) => i !== index) })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setNewEx({ company: "", role: "", startMonth: "", endMonth: "", isCurrent: false, description: "" })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id as string, 10)
      const newIndex = parseInt(over.id as string, 10)
      const newArr = arrayMove(config.experiences, oldIndex, newIndex)
      updateConfig({ experiences: newArr })
    }
  }

  // Create stable IDs for SortableContext based on index
  const experienceIds = config.experiences.map((_, i) => i.toString())

  return (
    <Card className="border-border-subtle bg-surface/30">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-[15px] text-white">Experience</CardTitle>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 text-xs bg-white/10 hover:bg-white/20"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 rounded-2xl border border-white/10 bg-elevated space-y-3 animate-fade-in">
            <Input
              placeholder="Company Name"
              value={newEx.company}
              onChange={(e) => setNewEx({ ...newEx, company: e.target.value })}
            />
            <Input
              placeholder="Role Title"
              value={newEx.role}
              onChange={(e) => setNewEx({ ...newEx, role: e.target.value })}
            />
            <div className="flex gap-3">
              <Input
                placeholder="Start (e.g. Jan 2024)"
                value={newEx.startMonth}
                onChange={(e) => setNewEx({ ...newEx, startMonth: e.target.value })}
              />
              <Input
                placeholder="End / Present"
                value={newEx.endMonth}
                onChange={(e) => setNewEx({ ...newEx, endMonth: e.target.value })}
                disabled={newEx.isCurrent}
                className={newEx.isCurrent ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={newEx.isCurrent}
                onChange={(e) =>
                  setNewEx({
                    ...newEx,
                    isCurrent: e.target.checked,
                    endMonth: e.target.checked ? "Present" : "",
                  })
                }
                className="rounded border-white/20 bg-surface/50 text-accent focus:ring-accent"
              />
              I currently work here
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" className="bg-accent text-white" onClick={handleAdd}>
                <Check className="w-3.5 h-3.5 mr-1" /> Save
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {config.experiences.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={experienceIds} strategy={verticalListSortingStrategy}>
                {config.experiences.map((ex, i) => (
                  <SortableExItem
                    key={i}
                    id={i.toString()}
                    index={i}
                    ex={ex}
                    onEdit={editEx}
                    onRemove={removeEx}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            !isAdding && (
              <div className="text-center py-8 border border-dashed border-border-subtle rounded-xl bg-surface/50">
                <p className="text-xs text-tertiary">No work experience added yet.</p>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
