export default function Logo({ size = 32, className = '' }) {
    return (<svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Bowl base */}
      <ellipse cx="20" cy="26" rx="14" ry="5" fill="#1A6B3C" opacity="0.15"/>
      <path d="M6 20 Q6 30 20 30 Q34 30 34 20" stroke="#1A6B3C" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Steam / community arcs */}
      <path d="M13 16 Q13 11 16 11 Q19 11 19 7" stroke="#1A6B3C" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M20 17 Q20 12 23 12 Q26 12 26 8" stroke="#1A6B3C" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
      {/* Plate rim */}
      <line x1="6" y1="20" x2="34" y2="20" stroke="#1A6B3C" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>);
}
