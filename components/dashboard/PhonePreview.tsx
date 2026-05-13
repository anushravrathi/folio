"use client"

import { ProfilePage } from "@/components/profile/ProfilePage"
import { useDashboardContext } from "@/context/DashboardContext"

export function PhonePreview() {
  const { config } = useDashboardContext()
  // The internal available width of our phone frame is approx 306px.
  // We render the profile at 375px (standard mobile) and scale it down to fit perfectly.
  const logicalWidth = 375
  
  return (
    <div className="relative w-[330px] h-[660px] rounded-[48px] border-[12px] border-[#111111] bg-page shadow-[0_24px_80px_-15px_rgba(0,0,0,0.7)] flex flex-col ring-2 ring-white/[0.03] select-none group/phone hover:scale-[1.01] transition-transform duration-500">
      
      {/* Outer glare shine effect on frame */}
      <div className="absolute inset-0 rounded-[36px] bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none z-30"></div>

      {/* Inner edge glow */}
      <div className="absolute inset-0 pointer-events-none z-30 rounded-[36px] ring-1 ring-inset ring-white/10"></div>
      
      {/* Phone Notch / Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-28 bg-[#111111] rounded-b-2xl z-40 shadow-[0_1px_3px_rgba(0,0,0,0.5)] flex items-center justify-center gap-1">
        <div className="w-2 h-2 rounded-full bg-[#222] opacity-60"></div>
        <div className="w-6 h-1 rounded-full bg-[#222] opacity-40"></div>
      </div>
      
      {/* Actual Screen Container with precise hidden overflow */}
      <div className="flex-1 overflow-hidden relative z-10 w-full h-full bg-[#090909] rounded-[36px]">
        
        {/* The container that sets standard mobile logic boundaries */}
        <div className="absolute top-0 left-0 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar origin-top-left" 
             style={{ width: '100%' }}>
          
          {/* 
            Here is where the magic happens:
            We force the content to render at logicalWidth (375px) and use CSS scale() to fit width.
            Container queries inside ProfilePage will read 375px width, triggering mobile UI perfectly.
          */}
          <div className="origin-top-left w-[375px] min-h-full" 
               style={{ 
                 transform: 'scale(calc(306 / 375))', // Fits precisely into the 306px wide internal shell
               }}>
             <ProfilePage config={config} />
          </div>
        </div>
      </div>
    </div>
  )
}
