import { Badge } from "@/components/ui/Badge"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface ProjectCardProps {
  name: string
  description: string
  icon: string
  githubUrl?: string
  liveUrl?: string
  isDeployed?: boolean
}

export function ProjectCard({
  name,
  description,
  icon,
  githubUrl,
  liveUrl,
  isDeployed
}: ProjectCardProps) {

  return (
    <div className="w-full bg-[#111] border border-white/[0.04] shadow-card rounded-2xl p-5 hover:border-white/10 transition-all duration-300 group hover:-translate-y-0.5 relative overflow-hidden flex flex-col min-h-[150px]">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none"></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-elevated/50 border border-white/5 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
             <span role="img" aria-label="project icon">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-[16px] text-white tracking-tight group-hover:text-accent transition-colors">{name}</h3>
            {isDeployed && (
              <Badge variant="live" className="text-[9px] px-1.5 py-0 mt-0.5 h-4 uppercase tracking-wider font-extrabold bg-green-500/10 text-green-400 border-green-500/20">
                Deployed
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-[13.5px] text-secondary mb-5 leading-relaxed font-medium flex-1 relative z-10">
        {description}
      </p>

      {(githubUrl || liveUrl) && (
        <div className="flex items-center gap-4 mt-auto pt-3 border-t border-white/[0.03] relative z-10">
          {githubUrl && (
            <Link 
              href={githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[12px] font-bold text-tertiary hover:text-white flex items-center gap-1.5 transition-colors tracking-wide"
            >
              CODE <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          )}
          {liveUrl && (
            <Link 
              href={liveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[12px] font-bold text-tertiary hover:text-white flex items-center gap-1.5 transition-colors tracking-wide"
            >
              VISIT <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
