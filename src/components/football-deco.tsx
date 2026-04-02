/** Decorative football-themed SVG elements */

export function FootballIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
      <path
        d="M32 2a30 30 0 0 1 0 60M32 2a30 30 0 0 0 0 60M2 32h60M32 2c8 10 8 50 0 60M32 2c-8 10-8 50 0 60"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />
      <polygon
        points="32,12 40,20 38,30 26,30 24,20"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}

export function PitchPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* Center circle */}
      <circle cx="200" cy="100" r="40" stroke="#BA0C2F" strokeWidth="0.5" opacity="0.08" />
      <line x1="200" y1="0" x2="200" y2="200" stroke="#BA0C2F" strokeWidth="0.5" opacity="0.06" />
      {/* Penalty area left */}
      <rect x="0" y="40" width="60" height="120" fill="none" stroke="#BA0C2F" strokeWidth="0.5" opacity="0.06" />
      <rect x="0" y="65" width="25" height="70" fill="none" stroke="#BA0C2F" strokeWidth="0.5" opacity="0.05" />
      {/* Penalty area right */}
      <rect x="340" y="40" width="60" height="120" fill="none" stroke="#BA0C2F" strokeWidth="0.5" opacity="0.06" />
      <rect x="375" y="65" width="25" height="70" fill="none" stroke="#BA0C2F" strokeWidth="0.5" opacity="0.05" />
      {/* Border */}
      <rect x="0" y="0" width="400" height="200" fill="none" stroke="#BA0C2F" strokeWidth="0.5" opacity="0.06" />
    </svg>
  );
}

export function GoalNetPattern({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className} aria-hidden>
      <defs>
        <pattern id="net" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0L8 8M8 0L0 8" stroke="#BA0C2F" strokeWidth="0.3" opacity="0.06" />
        </pattern>
      </defs>
      <rect width="100" height="60" fill="url(#net)" />
    </svg>
  );
}
