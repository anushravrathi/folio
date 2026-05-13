import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "openToWork" | "internship" | "fulltime" | "building" | "live" | "discontinued" | "present"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
          {
            "border-transparent bg-elevated text-primary": variant === "default",
            "border-transparent bg-badge-open-bg text-badge-open-fg": variant === "openToWork" || variant === "live",
            "border-transparent bg-badge-intern-bg text-badge-intern-fg": variant === "internship",
            "border-transparent bg-badge-full-bg text-badge-full-fg": variant === "fulltime",
            "border-transparent bg-badge-build-bg text-badge-build-fg": variant === "building",
            "border-transparent bg-badge-disc-bg text-badge-disc-fg": variant === "discontinued",
            "border-transparent bg-transparent text-success": variant === "present", // We'll add the dot inside usage
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
