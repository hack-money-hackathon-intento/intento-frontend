"use client"

export function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full bg-mars-rust animate-pulse-glow" />
          <div className="absolute inset-1 rounded-full bg-void flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-hal glow-hal" />
          </div>
        </div>
        <span className="font-sans text-xl font-bold tracking-tight text-dust">
          INTENTO
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-lunar px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-mars-rust animate-pulse" />
          <span className="font-mono text-xs text-dust">Network Active</span>
        </div>
      </div>
    </header>
  )
}
