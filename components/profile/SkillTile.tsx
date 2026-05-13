import Image from "next/image"

interface SkillTileProps {
  name: string
  iconKey?: string
}

export function SkillTile({ name, iconKey }: SkillTileProps) {
  // Use simple emojis for default icons
  return (
    <div className="w-12 h-12 flex flex-col items-center justify-center rounded-xl bg-surface border border-border-subtle hover:border-accent/50 transition-colors group">
      {iconKey ? (
        <Image 
          src={`https://skillicons.dev/icons?i=${iconKey}`} 
          alt={name} 
          width={28} 
          height={28} 
          unoptimized // skillicons.dev provides SVGs
          className="mb-0.5 group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform duration-300">
          💻
        </span>
      )}
      {/* Name tooltip would be nice here instead of text if it doesn't fit, but design asks for 10px muted text */}
      <span className="text-[9px] text-tertiary truncate w-10 text-center">{name}</span>
    </div>
  )
}
