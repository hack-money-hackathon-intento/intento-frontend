"use client"

export function FlowDiagram() {
  return (
    <div className="flex flex-col items-center mt-8">
      {/* Flow diagram showing the value prop */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
        <FlowStep 
          number="01" 
          label="Any Token" 
          sublabel="ETH, USDC, ARB..."
        />
        
        <FlowArrow />
        
        <FlowStep 
          number="02" 
          label="Intento" 
          sublabel="Single Intent"
          isHighlighted
        />
        
        <FlowArrow />
        
        <FlowStep 
          number="03" 
          label="Position" 
          sublabel="Market Shares"
        />
      </div>
      
      {/* Subtitle */}
      <p className="font-mono text-xs text-cosmic mt-8 text-center max-w-sm">
        Your capital, unified. Your intent, executed.
      </p>
    </div>
  )
}

interface FlowStepProps {
  number: string
  label: string
  sublabel: string
  isHighlighted?: boolean
}

function FlowStep({ number, label, sublabel, isHighlighted = false }: FlowStepProps) {
  return (
    <div className={`
      flex flex-col items-center p-6 rounded-sm
      border transition-all duration-300
      ${isHighlighted 
        ? 'border-mars-rust bg-mars-rust/10 glow-mars' 
        : 'border-lunar/30 bg-crater/50 hover:border-lunar'
      }
    `}>
      {/* Circle indicator */}
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center mb-3
        ${isHighlighted ? 'bg-mars-rust' : 'bg-lunar/30'}
      `}>
        <span className={`
          font-mono text-sm font-bold
          ${isHighlighted ? 'text-pale' : 'text-cosmic'}
        `}>
          {number}
        </span>
      </div>
      
      {/* Label */}
      <span className={`
        font-sans font-semibold text-base
        ${isHighlighted ? 'text-mars-rust' : 'text-dust'}
      `}>
        {label}
      </span>
      
      {/* Sublabel */}
      <span className="font-mono text-xs text-cosmic mt-1">
        {sublabel}
      </span>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center w-8 h-8 md:rotate-0 rotate-90">
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
        className="text-mars-rust"
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </div>
  )
}
