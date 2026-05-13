import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[var(--radius-btn)] border border-white/10 bg-[#0D0D0D] px-4 py-2.5 text-sm font-medium text-white placeholder:text-[#555] transition-all focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
