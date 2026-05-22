"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipForward, SkipBack, MoreHorizontal } from "lucide-react"
import { SocialIcons } from "@/lib/icons"

interface SpotifyWidgetProps {
  trackName?: string
  artistName?: string
  albumArtUrl?: string
  trackId?: string | null
}

export function SpotifyWidget({ 
  trackName = "Midnight City", 
  artistName = "M83", 
  albumArtUrl,
  trackId,
}: SpotifyWidgetProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(32) // Start at 32%
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 1))
      }, 1000) // increment visual bar every second
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying])

  // Format a mock timer string based on progress percentage assuming 4:00 mins total (240 seconds)
  const totalSeconds = 240
  const currentSeconds = Math.floor((progress / 100) * totalSeconds)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  if (trackId) {
    return (
      <div className="w-full h-[80px] rounded-[12px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(29,185,84,0.2)] bg-transparent border border-border-subtle transition-all duration-500 hover:scale-[1.02]">
        <iframe 
          style={{ borderRadius: '12px' }}
          src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`} 
          width="100%" 
          height="80" 
          frameBorder="0" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        ></iframe>
      </div>
    )
  }

  return (
    <div className="w-full h-[180px] flex flex-col justify-center rounded-[20px] overflow-hidden bg-surface border border-border-subtle group transition-all duration-500 hover:border-accent/30">
      <div className="p-5 sm:p-6 h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
               <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                 <SocialIcons.Spotify className="w-3.5 h-3.5 text-[#1DB954]" />
               </div>
               <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Now Playing</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-secondary" />
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative shrink-0">
              <div className={`w-16 h-16 rounded-xl overflow-hidden bg-elevated shadow-xl relative group/art`}>
                 {albumArtUrl ? (
                    <img src={albumArtUrl} alt={trackName} className="absolute inset-0 w-full h-full object-cover" />
                 ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary/20 animate-pulse duration-[4s]"></div>
                 )}
                 {isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                      <div className="flex items-end gap-[3px] h-5">
                         <div className="w-1 bg-white animate-[bounce_0.8s_ease-in-out_infinite_alternate] h-2"></div>
                         <div className="w-1 bg-white animate-[bounce_1s_ease-in-out_infinite_alternate_200ms] h-5"></div>
                         <div className="w-1 bg-white animate-[bounce_0.7s_ease-in-out_infinite_alternate_100ms] h-3"></div>
                      </div>
                    </div>
                 )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-primary tracking-wide truncate leading-tight">{trackName}</h3>
              <p className="text-[13px] text-secondary font-medium truncate mb-1">{artistName}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="space-y-1.5 mb-2">
             <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
             </div>
             <div className="flex justify-between text-[10px] font-bold text-secondary tabular-nums">
                <span>{formatTime(currentSeconds)}</span>
                <span>{formatTime(totalSeconds)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
