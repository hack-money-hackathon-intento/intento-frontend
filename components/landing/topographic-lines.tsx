"use client"

export function TopographicLines() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <svg 
        className="absolute top-0 left-0 w-full h-full" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Main topographic contours */}
        {[...Array(20)].map((_, i) => (
          <ellipse
            key={`main-${i}`}
            cx="500"
            cy="500"
            rx={80 + i * 50}
            ry={40 + i * 25}
            fill="none"
            stroke="#C45D3E"
            strokeWidth={i < 5 ? "1.5" : "0.8"}
            opacity={0.8 - i * 0.03}
            transform={`rotate(${i * 8} 500 500)`}
          />
        ))}
        
        {/* Secondary offset contours */}
        {[...Array(12)].map((_, i) => (
          <ellipse
            key={`secondary-${i}`}
            cx="520"
            cy="480"
            rx={60 + i * 45}
            ry={30 + i * 22}
            fill="none"
            stroke="#D4714A"
            strokeWidth="0.6"
            opacity={0.5 - i * 0.03}
            transform={`rotate(${-15 + i * 6} 500 500)`}
          />
        ))}
        
        {/* Radial lines emanating from center */}
        {[...Array(24)].map((_, i) => (
          <line
            key={`radial-${i}`}
            x1="500"
            y1="500"
            x2={500 + Math.cos((i * 15 * Math.PI) / 180) * 600}
            y2={500 + Math.sin((i * 15 * Math.PI) / 180) * 600}
            stroke="#C45D3E"
            strokeWidth="0.3"
            opacity="0.3"
          />
        ))}
      </svg>
    </div>
  )
}
