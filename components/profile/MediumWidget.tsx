"use client"

import { BookOpen, ExternalLink, ArrowRight } from "lucide-react"

interface MediumWidgetProps {
  articleUrl?: string
  title?: string
  description?: string
  readTime?: string
  category?: string
  onClick?: () => void
}

export function MediumWidget({
  articleUrl = "https://medium.com/@anushravrathi/the-600k-download-paradox-a-strategic-growth-case-study-on-matiks-505179db5014",
  title = "The 600K Download Paradox",
  description = "A Strategic Growth Case Study & ROI Simulator analyzing choice paralysis, competitive retention, and compounding cohort stacked MRR models on Matiks.",
  readTime = "6 min read",
  category = "Growth Strategy",
  onClick
}: MediumWidgetProps) {
  
  const handleCardClick = () => {
    if (onClick) onClick();
    window.open(articleUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-surface border border-border-subtle rounded-[20px] p-6 flex flex-col relative overflow-hidden w-full group cursor-pointer transition-all duration-500 hover:border-accent/40 hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(124,111,255,0.08)]"
    >
      {/* Background radial highlight on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--color-accent-dim),transparent_70%)] opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {/* Custom Medium Icon Frame */}
          <div className="w-6 h-6 rounded-md bg-elevated flex items-center justify-center border border-border-subtle shadow-inner group-hover:border-accent/30 transition-all duration-300">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-primary fill-current transition-colors group-hover:text-accent duration-300">
              <path d="M12.5 12c0 3.037-2.35 5.5-5.25 5.5S2 15.037 2 12s2.35-5.5 5.25-5.5 5.25 2.463 5.25 5.5zm7.75 0c0 2.761-.84 5-1.875 5S16.5 14.761 16.5 12s.84-5 1.875-5 1.875 2.239 1.875 5zm2.188 0c0 2.24-.268 4.056-.6 4.056s-.6-1.816-.6-4.056.268-4.056.6-4.056.6 1.816.6 4.056z"/>
            </svg>
          </div>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest group-hover:text-primary transition-colors duration-300">Featured Article</span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-tertiary group-hover:text-accent transition-colors duration-300" />
      </div>

      <div className="space-y-3 relative z-10">
        <h3 className="text-[15px] font-black text-primary tracking-wide leading-snug group-hover:text-accent transition-colors duration-300">
          {title}
        </h3>
        <p className="text-[12.5px] text-secondary font-medium leading-relaxed line-clamp-3">
          {description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
              {category}
            </span>
            <span className="text-[10px] text-tertiary font-bold">
              {readTime}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-[11px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            Read <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}
