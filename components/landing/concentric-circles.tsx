"use client"

export function ConcentricCircles() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="relative">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-mars-rust/10"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
              top: `${-(150 + i * 75)}px`,
              left: `${-(150 + i * 75)}px`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
