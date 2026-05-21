"use client"

import { Badge } from "@/components/ui/Badge"
import Image from "next/image"

interface ExperienceCardProps {
  companyName: string
  companyDomain?: string
  role: string
  type: "internship" | "fulltime" | "parttime" | "freelance" | string
  startMonth: string
  endMonth?: string | null
  isCurrent: boolean
  description?: string
}

export function ExperienceCard({
  companyName,
  companyDomain,
  role,
  type,
  startMonth,
  endMonth,
  isCurrent,
  description
}: ExperienceCardProps) {
  
  const getBadgeVariant = (t: string) => {
    switch (t.toLowerCase()) {
      case "internship": return "internship"
      case "fulltime": return "fulltime"
      case "parttime": return "default"
      case "freelance": return "default"
      default: return "default"
    }
  }

  return (
    <div className="flex gap-4 group">
      {/* Logo */}
      <div className="shrink-0 pt-1">
        {companyDomain ? (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-elevated border border-border-subtle relative">
            <Image 
              src={`https://logo.clearbit.com/${companyDomain}`} 
              alt={companyName} 
              fill
              unoptimized
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'text-xs', 'font-bold', 'text-secondary');
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerText = companyName.charAt(0).toUpperCase();
                }
              }}
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-elevated border border-border-subtle flex items-center justify-center text-xs font-bold text-secondary">
            {companyName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 border-b border-border-subtle group-last:border-0 group-last:pb-0">
        <div className="flex flex-col @md:flex-row @md:items-start justify-between gap-1 mb-1">
          <div>
            <h4 className="text-[15px] font-semibold text-primary leading-tight">{companyName}</h4>
            <p className="text-[14px] text-secondary">{role}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isCurrent ? (
              <Badge variant="present" className="flex items-center gap-1.5 px-0 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                Present
              </Badge>
            ) : (
              <Badge variant={getBadgeVariant(type) as any}>
                {type === "fulltime" ? "Full-time" : type === "parttime" ? "Part-time" : type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        <div className="text-[12.5px] text-secondary mb-2 font-medium">
          {startMonth} → {isCurrent ? "Present" : endMonth}
        </div>

        {description && (
          <p className="text-[14px] text-secondary leading-relaxed max-w-[500px]">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
