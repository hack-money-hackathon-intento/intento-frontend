"use client"

export function OrbitalRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Multiple orbital rings with different sizes and animations */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${110 + i * 12}%`,
            height: `${110 + i * 12}%`,
            borderColor: `rgba(196, 93, 62, ${0.4 - i * 0.05})`,
            borderWidth: i < 3 ? '2px' : '1px',
            animation: i % 2 === 0 
              ? `slow-spin ${80 + i * 20}s linear infinite` 
              : `slow-spin ${60 + i * 15}s linear infinite reverse`,
            boxShadow: i < 2 
              ? `0 0 ${15 - i * 5}px rgba(196, 93, 62, 0.2)`
              : 'none',
          }}
        />
      ))}
      
      {/* Inner glowing rings closest to Mars */}
      <div 
        className="absolute rounded-full border-2"
        style={{
          width: '105%',
          height: '105%',
          borderColor: 'rgba(212, 113, 74, 0.5)',
          boxShadow: '0 0 20px rgba(212, 113, 74, 0.4), inset 0 0 15px rgba(212, 113, 74, 0.3)',
          animation: 'slow-spin 50s linear infinite',
        }}
      />
      
      {/* Dashed orbit ring */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '130%',
          height: '130%',
          border: '1px dashed rgba(196, 93, 62, 0.4)',
          animation: 'slow-spin 100s linear infinite reverse',
        }}
      />
      
      {/* Outer atmosphere glow */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '102%',
          height: '102%',
          background: 'radial-gradient(circle, transparent 45%, rgba(196, 93, 62, 0.15) 50%, transparent 55%)',
        }}
      />
    </div>
  )
}
