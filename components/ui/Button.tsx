import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-btn)] font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent text-white hover:brightness-90 border-none":
              variant === "primary",
            "bg-transparent text-primary border border-border-subtle hover:bg-elevated":
              variant === "secondary",
            "bg-badge-disc-bg text-badge-disc-fg hover:brightness-110 border-none":
              variant === "danger",
            "bg-transparent text-primary hover:bg-elevated":
              variant === "ghost",
            "px-5 py-2.5 text-sm": size === "default",
            "px-3 py-1.5 text-xs": size === "sm",
            "px-8 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
