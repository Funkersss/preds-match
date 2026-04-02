interface FlagProps {
  className?: string;
}

export function NorwayFlag({ className = "w-10 h-7" }: FlagProps) {
  return (
    <svg viewBox="0 0 33 24" className={className} aria-label="Norway">
      <rect width="33" height="24" fill="#EF2B2D" />
      <rect x="9" y="0" width="6" height="24" fill="#002868" />
      <rect x="0" y="9" width="33" height="6" fill="#002868" />
      <rect x="10.5" y="0" width="3" height="24" fill="#fff" />
      <rect x="0" y="10.5" width="33" height="3" fill="#fff" />
    </svg>
  );
}

export function FranceFlag({ className = "w-10 h-7" }: FlagProps) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-label="France">
      <rect width="10" height="20" fill="#002395" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ED2939" />
    </svg>
  );
}

export function SenegalFlag({ className = "w-10 h-7" }: FlagProps) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-label="Senegal">
      <rect width="10" height="20" fill="#00853F" />
      <rect x="10" width="10" height="20" fill="#FDEF42" />
      <rect x="20" width="10" height="20" fill="#E31B23" />
      <path
        d="M15 6.5 L16.18 10.13 L20 10.13 L16.91 12.37 L18.09 16 L15 13.76 L11.91 16 L13.09 12.37 L10 10.13 L13.82 10.13 Z"
        fill="#00853F"
      />
    </svg>
  );
}

export function TBDFlag({ className = "w-10 h-7" }: FlagProps) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-label="TBD">
      <rect width="30" height="20" fill="#DDE3ED" rx="2" />
      <rect
        x="1"
        y="1"
        width="28"
        height="18"
        fill="none"
        stroke="#B0B8C8"
        strokeWidth="0.6"
        strokeDasharray="2 2"
        rx="1"
      />
      <text
        x="15"
        y="14"
        textAnchor="middle"
        fill="#6B7280"
        fontSize="9"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        ?
      </text>
    </svg>
  );
}

const flagMap: Record<string, React.FC<FlagProps>> = {
  NOR: NorwayFlag,
  FRA: FranceFlag,
  SEN: SenegalFlag,
  TBD: TBDFlag,
};

export function TeamFlag({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const Flag = flagMap[code] || TBDFlag;
  return <Flag className={className} />;
}
