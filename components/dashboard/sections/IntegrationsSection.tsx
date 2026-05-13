"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Trophy, Music, Check, Loader2, ExternalLink } from "lucide-react"
import { useDashboardContext } from "@/context/DashboardContext"

export function IntegrationsSection() {
  const { config, updateConfig } = useDashboardContext()
  const [spotifyLoading, setSpotifyLoading] = useState(false)
  const [spotifyError, setSpotifyError] = useState<string | null>(null)

  const handleSpotifyChange = async (url: string) => {
    updateConfig({ spotifyTrackUrl: url })
    if (!url || !url.includes("spotify.com")) {
      updateConfig({ spotifyData: null })
      return
    }

    try {
      setSpotifyLoading(true)
      setSpotifyError(null)
      // Use public free open API for resolving Spotify link data
      const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
      if (!response.ok) throw new Error("Invalid track")
      
      const data = await response.json()
      
      // Map "title" into track and artist. Typically "Song Title by Artist"
      const titleParts = data.title.split(" by ")
      
      // Extract track ID from url: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
      let trackId = null
      const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/)
      if (trackMatch && trackMatch[1]) {
        trackId = trackMatch[1]
      }
      
      updateConfig({
        spotifyData: {
          trackName: titleParts[0] || data.title,
          artistName: titleParts[1] || "Unknown Artist",
          albumArtUrl: data.thumbnail_url,
          trackId: trackId
        }
      })
    } catch (e) {
      setSpotifyError("Could not fetch details. Try another link.")
      updateConfig({ spotifyData: null })
    } finally {
      setSpotifyLoading(false)
    }
  }

  return (
    <Card className="border-border-subtle overflow-visible">
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] text-white flex items-center gap-2">
           ✨ Interactive Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* LEETCODE */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center text-orange-400">
                <Trophy className="w-3 h-3" />
             </div>
             <label className="text-sm font-bold text-white">LeetCode Statistics</label>
          </div>
          <Input 
             placeholder="Enter username, e.g. 'anushrav'" 
             value={config.leetcodeUsername}
             onChange={(e) => updateConfig({ leetcodeUsername: e.target.value })}
          />
          <p className="text-[11px] text-tertiary italic">Stats will update automatically in live view.</p>
        </div>

        <div className="h-px bg-border-subtle"></div>

        {/* SPOTIFY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                   <Music className="w-3 h-3" />
                </div>
                <label className="text-sm font-bold text-white">Spotify Widget</label>
             </div>
             {spotifyLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
          </div>
          
          <Input 
             placeholder="Paste track link: https://open.spotify.com/track/..." 
             value={config.spotifyTrackUrl}
             onChange={(e) => handleSpotifyChange(e.target.value)}
          />

          {spotifyError && <p className="text-[11px] font-medium text-red-400">{spotifyError}</p>}

          {config.spotifyData && (
            <div className="flex gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl animate-fade-in">
               <img src={config.spotifyData.albumArtUrl} alt="Preview" className="w-10 h-10 rounded-lg shrink-0 object-cover" />
               <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{config.spotifyData.trackName}</p>
                  <p className="text-[10px] text-tertiary truncate">{config.spotifyData.artistName}</p>
               </div>
               <div className="shrink-0 flex items-center justify-center text-emerald-400">
                  <Check className="w-4 h-4" />
               </div>
            </div>
          )}

          <p className="text-[11px] text-tertiary">
            Copy any song link from Spotify to populate your dynamic play card.
          </p>
        </div>

      </CardContent>
    </Card>
  )
}
