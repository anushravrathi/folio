"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Layout, Palette, BarChart2, Settings } from "lucide-react"

import { PageTab } from "./tabs/PageTab"
import { StyleTab } from "./tabs/StyleTab"
import { StatsTab } from "./tabs/StatsTab"
import { SettingsTab } from "./tabs/SettingsTab"

export function Editor() {
  const [activeTab, setActiveTab] = useState<"page" | "style" | "stats" | "settings">("page")

  const tabs = [
    { id: "page", label: "Content", icon: Layout },
    { id: "style", label: "Themes", icon: Palette },
    { id: "stats", label: "Analytics", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const

  return (
    <div className="flex h-full flex-col w-full max-w-3xl mx-auto bg-page">
      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-20 bg-page/80 backdrop-blur-md border-b border-border-subtle shrink-0 px-6 pt-3 flex justify-between items-center">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3 text-[13px] font-semibold transition-all relative flex items-center gap-2 group rounded-t-lg",
                  isActive 
                    ? "text-white" 
                    : "text-secondary hover:text-primary"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-accent" : "text-tertiary group-hover:text-secondary"
                )} />
                {tab.label}
                
                {isActive && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-accent shadow-[0_-4px_12px_rgba(124,111,255,0.3)] rounded-t-full animate-fade-in" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Scrollable Editor Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 sm:p-8 pb-32 max-w-2xl mx-auto w-full animate-fade-in">
          {activeTab === "page" && <PageTab />}
          {activeTab === "style" && <StyleTab />}
          {activeTab === "stats" && <StatsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}
