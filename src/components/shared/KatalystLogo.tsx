interface KatalystLogoProps {
  className?: string;
  size?: number;
}

const KatalystLogo = ({ className, size = 56 }: KatalystLogoProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 64 64"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="kg1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="kg2" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      {/* Left triangular bar */}
      <path
        d="M14 8 L14 56 L26 56 L26 38 L14 8 Z"
        fill="url(#kg1)"
      />
      {/* Top-right triangle */}
      <path d="M26 32 L52 8 L42 8 L26 24 Z" fill="url(#kg1)" />
      {/* Bottom-right triangle */}
      <path d="M26 32 L52 56 L42 56 L26 40 Z" fill="url(#kg2)" />
    </svg>
  );
};

export default KatalystLogo;
