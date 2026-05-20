import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6 text-primary relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-fade opacity-30"></div>
        <div
          className="glow-orb w-[500px] h-[500px] top-[-150px] left-1/2 -translate-x-1/2"
          style={{ background: "radial-gradient(circle, rgba(225,29,72,0.1) 0%, transparent 65%)" }}
        />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="text-8xl font-black text-white/5 mb-4 select-none">404</div>
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight -mt-14">
          This Folio doesn&apos;t exist
        </h1>
        <p className="text-secondary font-medium mb-8 leading-relaxed">
          The profile you&apos;re looking for hasn&apos;t been created yet. 
          Maybe it could be yours?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            href="/signup"
            className="h-12 px-8 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Claim this username
          </Link>
          <Link 
            href="/"
            className="h-12 px-8 rounded-xl bg-[#111] border border-white/10 text-white font-bold text-sm flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
