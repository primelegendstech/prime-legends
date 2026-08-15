"use client";

export default function CircuitGlow({ lado = "esquerda" }: { lado?: "esquerda" | "direita" }) {
  const espelhar = lado === "direita";

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${
        lado === "esquerda" ? "left-0" : "right-0"
      } w-24 md:w-40 hidden sm:block overflow-hidden`}
      style={espelhar ? { transform: "scaleX(-1)" } : undefined}
    >
      <svg
        viewBox="0 0 160 600"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={`glow-${lado}`} x="-75%" y="-75%" width="250%" height="250%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`fade-${lado}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFC93C" stopOpacity="0" />
            <stop offset="20%" stopColor="#FFC93C" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#FFC93C" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFC93C" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g filter={`url(#glow-${lado})`} fill="none" strokeLinecap="round">
          <path
            className="trilha"
            d="M10 0 L10 90 L60 140 L60 230 L20 270 L20 360 L70 410 L70 520 L30 560 L30 600"
            stroke={`url(#fade-${lado})`}
            strokeWidth="1.6"
          />
          <path
            className="trilha trilha-2"
            d="M55 0 L55 60 L20 95 L20 180 L65 220 L65 310 L100 340 L100 440 L60 480 L60 600"
            stroke={`url(#fade-${lado})`}
            strokeWidth="1.2"
            opacity="0.6"
          />
        </g>

        <g fill="#FFDD66" filter={`url(#glow-${lado})`}>
          <circle cx="10" cy="90" r="2.4" />
          <circle cx="60" cy="140" r="2" />
          <circle cx="20" cy="270" r="2.4" />
          <circle cx="70" cy="410" r="2" />
          <circle cx="30" cy="560" r="2.2" />
        </g>
      </svg>

      <style jsx>{`
        .trilha {
          stroke-dasharray: 12 18;
          animation: percorrer 6s linear infinite;
        }
        .trilha-2 {
          stroke-dasharray: 8 14;
          animation: percorrer 8s linear infinite reverse;
        }
        @keyframes percorrer {
          from {
            stroke-dashoffset: 240;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @media (max-width: 768px) {
          .trilha,
          .trilha-2 {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
