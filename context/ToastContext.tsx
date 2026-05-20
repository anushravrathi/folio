"use client"
import React, { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"

type ToastVariant = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = "info", duration: number = 4000) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts(prev => [...prev, { id, message, variant, duration }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-success shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-accent shrink-0" />,
  }

  const borderMap = {
    success: "border-success/20",
    error: "border-red-500/20",
    info: "border-accent/20",
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[400px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border ${borderMap[toast.variant]} bg-[#111] backdrop-blur-xl shadow-2xl shadow-black/50 animate-fade-up text-sm font-medium text-primary`}
          >
            {iconMap[toast.variant]}
            <span className="flex-1 min-w-0">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 text-tertiary hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return ctx
}
