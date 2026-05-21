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
    <div className="bg-surface border border-border-subtle rounded-[20px] p-6 flex flex-col relative overflow-hidden w-full">
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
           <div className="w-5 h-5 rounded-md bg-elevated flex items-center justify-center border border-border-subtle shadow-inner">
              <span className="text-[10px]">🏆</span>
           </div>
           <h3 className="font-bold text-sm text-primary tracking-wide">LeetCode Mastery</h3>
        </div>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-tertiary" />}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="space-y-4">
             <div className="h-2 w-full bg-primary/5 rounded-full animate-pulse"></div>
             <div className="h-10 w-full bg-primary/5 rounded-lg animate-pulse"></div>
          </div>
        ) : error ? (
          <div className="text-center text-xs font-medium text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
            Couldn&apos;t load profile stats
          </div>
        ) : (
          <div className="space-y-5">
             <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Solved</span>
                <span className="text-xl font-black text-primary">{data.totalSolved}</span>
             </div>
             
             <div className="grid grid-cols-3 gap-2">
                <div className="bg-elevated border border-border-subtle rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                   <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Easy</span>
                   <span className="text-[13px] font-bold text-primary">{data.easySolved}</span>
                </div>
                <div className="bg-elevated border border-border-subtle rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                   <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Med</span>
                   <span className="text-[13px] font-bold text-primary">{data.mediumSolved}</span>
                </div>
                <div className="bg-elevated border border-border-subtle rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                   <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Hard</span>
                   <span className="text-[13px] font-bold text-primary">{data.hardSolved}</span>
                </div>
             </div>
             
             <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500" style={{ width: `${(data.easySolved / data.totalSolved) * 100}%` }}></div>
                <div className="h-full bg-yellow-500" style={{ width: `${(data.mediumSolved / data.totalSolved) * 100}%` }}></div>
                <div className="h-full bg-red-500" style={{ width: `${(data.hardSolved / data.totalSolved) * 100}%` }}></div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

