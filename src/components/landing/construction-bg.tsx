"use client";

// Cartoon construction site skyline — renders behind hero content
// Uses brand colors: primary (#1e293b), accent (#f59e0b)
export function ConstructionSkyline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMax slice"
    >
      {/* === CRANE (left side) === */}
      {/* Vertical mast */}
      <rect x="120" y="60" width="12" height="380" rx="2" fill="rgba(245,158,11,0.15)" />
      {/* Horizontal boom */}
      <rect x="60" y="60" width="260" height="10" rx="2" fill="rgba(245,158,11,0.15)" />
      {/* Counter-jib (left) */}
      <rect x="60" y="56" width="8" height="18" rx="1" fill="rgba(245,158,11,0.12)" />
      {/* Jib tip */}
      <rect x="312" y="56" width="8" height="18" rx="1" fill="rgba(245,158,11,0.12)" />
      {/* Cable from boom tip */}
      <line x1="316" y1="70" x2="316" y2="180" stroke="rgba(245,158,11,0.1)" strokeWidth="2" strokeDasharray="6 4" />
      {/* Hook */}
      <circle cx="316" cy="186" r="6" stroke="rgba(245,158,11,0.12)" strokeWidth="2" fill="none" />
      {/* Crane cabin */}
      <rect x="112" y="70" width="28" height="22" rx="3" fill="rgba(245,158,11,0.1)" />
      {/* Mast lattice pattern */}
      <line x1="120" y1="100" x2="132" y2="140" stroke="rgba(245,158,11,0.06)" strokeWidth="1.5" />
      <line x1="132" y1="100" x2="120" y2="140" stroke="rgba(245,158,11,0.06)" strokeWidth="1.5" />
      <line x1="120" y1="160" x2="132" y2="200" stroke="rgba(245,158,11,0.06)" strokeWidth="1.5" />
      <line x1="132" y1="160" x2="120" y2="200" stroke="rgba(245,158,11,0.06)" strokeWidth="1.5" />
      <line x1="120" y1="220" x2="132" y2="260" stroke="rgba(245,158,11,0.06)" strokeWidth="1.5" />
      <line x1="132" y1="220" x2="120" y2="260" stroke="rgba(245,158,11,0.06)" strokeWidth="1.5" />

      {/* === BUILDINGS (city skyline) === */}
      {/* Tall building left */}
      <rect x="200" y="200" width="70" height="240" rx="4" fill="rgba(255,255,255,0.04)" />
      {/* Windows */}
      <rect x="210" y="220" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="228" y="220" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="246" y="220" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="210" y="250" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="228" y="250" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="246" y="250" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="210" y="280" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="228" y="280" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="246" y="280" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="210" y="310" width="12" height="16" rx="2" fill="rgba(245,158,11,0.06)" />
      <rect x="228" y="310" width="12" height="16" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="246" y="310" width="12" height="16" rx="2" fill="rgba(245,158,11,0.06)" />

      {/* Medium building */}
      <rect x="290" y="280" width="60" height="160" rx="4" fill="rgba(255,255,255,0.03)" />
      <rect x="300" y="295" width="10" height="14" rx="2" fill="rgba(255,255,255,0.025)" />
      <rect x="316" y="295" width="10" height="14" rx="2" fill="rgba(255,255,255,0.025)" />
      <rect x="332" y="295" width="10" height="14" rx="2" fill="rgba(255,255,255,0.025)" />
      <rect x="300" y="320" width="10" height="14" rx="2" fill="rgba(255,255,255,0.025)" />
      <rect x="316" y="320" width="10" height="14" rx="2" fill="rgba(255,255,255,0.025)" />
      <rect x="332" y="320" width="10" height="14" rx="2" fill="rgba(245,158,11,0.05)" />

      {/* Short building */}
      <rect x="370" y="340" width="80" height="100" rx="4" fill="rgba(255,255,255,0.035)" />
      <rect x="380" y="355" width="14" height="18" rx="2" fill="rgba(255,255,255,0.025)" />
      <rect x="402" y="355" width="14" height="18" rx="2" fill="rgba(245,158,11,0.05)" />
      <rect x="424" y="355" width="14" height="18" rx="2" fill="rgba(255,255,255,0.025)" />

      {/* === SCAFFOLDING (right side) === */}
      {/* Vertical poles */}
      <rect x="1100" y="240" width="6" height="200" rx="1" fill="rgba(255,255,255,0.05)" />
      <rect x="1150" y="240" width="6" height="200" rx="1" fill="rgba(255,255,255,0.05)" />
      <rect x="1200" y="240" width="6" height="200" rx="1" fill="rgba(255,255,255,0.05)" />
      {/* Horizontal planks */}
      <rect x="1096" y="280" width="114" height="5" rx="1" fill="rgba(245,158,11,0.08)" />
      <rect x="1096" y="330" width="114" height="5" rx="1" fill="rgba(245,158,11,0.08)" />
      <rect x="1096" y="380" width="114" height="5" rx="1" fill="rgba(245,158,11,0.08)" />
      {/* Cross braces */}
      <line x1="1103" y1="280" x2="1153" y2="330" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
      <line x1="1153" y1="280" x2="1103" y2="330" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
      <line x1="1153" y1="330" x2="1203" y2="380" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
      <line x1="1203" y1="330" x2="1153" y2="380" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />

      {/* === BUILDING UNDER CONSTRUCTION (right) === */}
      <rect x="1240" y="180" width="100" height="260" rx="4" fill="rgba(255,255,255,0.04)" />
      {/* Exposed beams */}
      <rect x="1240" y="180" width="100" height="8" rx="1" fill="rgba(255,255,255,0.05)" />
      <rect x="1240" y="230" width="100" height="4" rx="1" fill="rgba(255,255,255,0.03)" />
      <rect x="1240" y="280" width="100" height="4" rx="1" fill="rgba(255,255,255,0.03)" />
      <rect x="1240" y="330" width="100" height="4" rx="1" fill="rgba(255,255,255,0.03)" />
      {/* Partial windows (building not finished) */}
      <rect x="1255" y="195" width="14" height="20" rx="2" fill="rgba(245,158,11,0.06)" />
      <rect x="1280" y="195" width="14" height="20" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="1305" y="195" width="14" height="20" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="1255" y="245" width="14" height="20" rx="2" fill="rgba(255,255,255,0.03)" />
      <rect x="1280" y="245" width="14" height="20" rx="2" fill="rgba(245,158,11,0.05)" />

      {/* === TRAFFIC CONES === */}
      {/* Cone 1 */}
      <polygon points="520,440 530,400 540,440" fill="rgba(245,158,11,0.1)" />
      <rect x="514" y="436" width="32" height="6" rx="2" fill="rgba(245,158,11,0.08)" />
      <rect x="524" y="412" width="12" height="4" rx="1" fill="rgba(255,255,255,0.06)" />

      {/* Cone 2 */}
      <polygon points="580,440 588,410 596,440" fill="rgba(245,158,11,0.08)" />
      <rect x="575" y="436" width="26" height="5" rx="2" fill="rgba(245,158,11,0.06)" />
      <rect x="583" y="420" width="10" height="3" rx="1" fill="rgba(255,255,255,0.04)" />

      {/* === HARD HAT (floating, decorative) === */}
      <ellipse cx="900" cy="360" rx="22" ry="8" fill="rgba(245,158,11,0.06)" />
      <path d="M878 360 Q878 340 900 336 Q922 340 922 360" fill="rgba(245,158,11,0.08)" />
      <rect x="873" y="356" width="54" height="5" rx="2" fill="rgba(245,158,11,0.1)" />

      {/* === GROUND LINE === */}
      <rect x="0" y="435" width="1440" height="65" fill="rgba(255,255,255,0.015)" />
      {/* Ground texture dots */}
      <circle cx="100" cy="455" r="2" fill="rgba(255,255,255,0.02)" />
      <circle cx="300" cy="460" r="3" fill="rgba(255,255,255,0.02)" />
      <circle cx="500" cy="450" r="2" fill="rgba(255,255,255,0.02)" />
      <circle cx="700" cy="458" r="2.5" fill="rgba(255,255,255,0.02)" />
      <circle cx="900" cy="452" r="2" fill="rgba(255,255,255,0.02)" />
      <circle cx="1100" cy="460" r="3" fill="rgba(255,255,255,0.02)" />
      <circle cx="1300" cy="455" r="2" fill="rgba(255,255,255,0.02)" />

      {/* === SMALL CRANE (far right, distant) === */}
      <rect x="1380" y="120" width="6" height="320" rx="1" fill="rgba(255,255,255,0.025)" />
      <rect x="1340" y="120" width="80" height="5" rx="1" fill="rgba(255,255,255,0.025)" />
      <line x1="1415" y1="125" x2="1415" y2="220" stroke="rgba(255,255,255,0.02)" strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  );
}

// Scattered construction icons for section backgrounds
export function HardHatPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Hard hat icons scattered at low opacity */}
      <svg className="absolute top-[10%] left-[5%] w-12 h-12 text-accent/[0.04] rotate-[-15deg]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18h12v-1.5c0-1-1-2-3-2.5V12c0-2.2-1.8-4-4-4h-2c-2.2 0-4 1.8-4 4v2c-2 .5-3 1.5-3 2.5V18h4z" />
      </svg>
      <svg className="absolute top-[30%] right-[8%] w-10 h-10 text-accent/[0.03] rotate-[20deg]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18h12v-1.5c0-1-1-2-3-2.5V12c0-2.2-1.8-4-4-4h-2c-2.2 0-4 1.8-4 4v2c-2 .5-3 1.5-3 2.5V18h4z" />
      </svg>
      <svg className="absolute bottom-[20%] left-[15%] w-8 h-8 text-accent/[0.03] rotate-[10deg]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18h12v-1.5c0-1-1-2-3-2.5V12c0-2.2-1.8-4-4-4h-2c-2.2 0-4 1.8-4 4v2c-2 .5-3 1.5-3 2.5V18h4z" />
      </svg>
      <svg className="absolute bottom-[35%] right-[12%] w-14 h-14 text-accent/[0.025] rotate-[-8deg]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18h12v-1.5c0-1-1-2-3-2.5V12c0-2.2-1.8-4-4-4h-2c-2.2 0-4 1.8-4 4v2c-2 .5-3 1.5-3 2.5V18h4z" />
      </svg>
    </div>
  );
}
