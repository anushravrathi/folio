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
    <div className="w-full bg-surface border border-border-subtle rounded-[20px] p-6 hover:border-accent/30 transition-all duration-300 group hover:-translate-y-0.5 relative overflow-hidden flex flex-col min-h-[160px]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none"></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-border-subtle flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
             <span role="img" aria-label="project icon">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-primary tracking-wide group-hover:text-accent transition-colors">{name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {githubUrl && (
             <Link href={githubUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/10 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
             </Link>
           )}
           {liveUrl && (
             <Link href={liveUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/10 transition-all">
                <ExternalLink className="w-4 h-4" />
             </Link>
           )}
        </div>
      </div>
      
      <p className="text-[13.5px] text-secondary mt-2 leading-relaxed font-medium relative z-10 flex-1">
        {description}
      </p>

      {isDeployed && (
        <div className="mt-4 flex items-center gap-2">
           <Badge variant="live" className="text-[9px] px-2 py-0.5 h-5 uppercase tracking-widest font-black bg-success/15 text-success border-none">
             Deployed
           </Badge>
        </div>
      )}
    </div>
  )
}
