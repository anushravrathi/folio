"use client"

import { useState, useEffect } from "react"
import { Trophy, Loader2 } from "lucide-react"

interface LeetcodeWidgetProps {
  username?: string
}

export function LeetcodeWidget({ username = "anushrav" }: LeetcodeWidgetProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(false);
    
    // Using alfa-leetcode-api as reliable alternative
    fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`)
      .then(res => res.json())
      .then(resData => {
        if (resData.solvedProblem !== undefined) {
          setData({
            totalSolved: resData.solvedProblem,
            easySolved: resData.easySolved,
            mediumSolved: resData.mediumSolved,
            hardSolved: resData.hardSolved
          });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden w-full h-full min-h-[160px]">
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full pointer-events-none"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
           <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 shadow-inner">
              <Trophy className="w-4 h-4" />
           </div>
           <div>
              <h3 className="font-bold text-sm text-white tracking-wide uppercase leading-none mb-1">LeetCode</h3>
              <p className="text-[9px] text-tertiary font-bold tracking-wider uppercase">@{username}</p>
           </div>
        </div>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-tertiary" />}
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        {loading ? (
          <div className="space-y-2">
             <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse"></div>
             <div className="h-3 w-32 bg-white/5 rounded animate-pulse"></div>
          </div>
        ) : error ? (
          <div className="text-center text-xs font-medium text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">
            Couldn&apos;t load profile stats
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
             <div>
                <p className="text-[9px] font-extrabold text-tertiary uppercase tracking-wider mb-1">Solved</p>
                <div className="flex items-end gap-1.5">
                   <span className="text-3xl font-black text-white leading-none tracking-tight">{data.totalSolved}</span>
                   <span className="text-[11px] text-orange-400 font-bold pb-0.5">questions</span>
                </div>
             </div>
             
             <div className="flex flex-col justify-end space-y-1 border-l border-white/10 pl-4">
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-tertiary font-bold">Easy</span>
                   <span className="text-green-400 font-bold">{data.easySolved}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-tertiary font-bold">Med</span>
                   <span className="text-yellow-400 font-bold">{data.mediumSolved}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                   <span className="text-tertiary font-bold">Hard</span>
                   <span className="text-red-400 font-bold">{data.hardSolved}</span>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
