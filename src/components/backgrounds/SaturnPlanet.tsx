import React from 'react';

interface SaturnPlanetProps {
  className?: string;
}

const RINGS = [
  { rx: 178, w: 20, c: '#a8916b', o: 0.3 },   // inner C ring
  { rx: 208, w: 46, c: '#dcc79d', o: 0.55 },  // bright B ring
  { rx: 243, w: 5, c: '#241c12', o: 0.55 },   // Cassini division
  { rx: 264, w: 30, c: '#c8b083', o: 0.45 },  // A ring
  { rx: 284, w: 6, c: '#e9dbb6', o: 0.4 },    // faint F ring
];

/**
 * Decorative realistic Saturn: shaded banded sphere, tilted multi-band ring
 * system with correct front/back occlusion, and a small moon orbiting slowly.
 */
export const SaturnPlanet: React.FC<SaturnPlanetProps> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 600" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id="sat-sphere" cx="36%" cy="30%" r="82%">
            <stop offset="0%" stopColor="#f7ecd2" />
            <stop offset="28%" stopColor="#ecd9ac" />
            <stop offset="52%" stopColor="#d9bd8d" />
            <stop offset="76%" stopColor="#a8895c" />
            <stop offset="100%" stopColor="#57452c" />
          </radialGradient>
          <radialGradient id="sat-halo" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="rgba(217,189,141,0)" />
            <stop offset="85%" stopColor="rgba(217,189,141,0.14)" />
            <stop offset="100%" stopColor="rgba(217,189,141,0)" />
          </radialGradient>
          <linearGradient id="sat-nightshade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="55%" stopColor="rgba(10,8,20,0)" />
            <stop offset="100%" stopColor="rgba(10,8,20,0.55)" />
          </linearGradient>
          <clipPath id="sat-clip">
            <circle cx="300" cy="300" r="148" />
          </clipPath>
          <path
            id="sat-orbit"
            d="M 16 300 A 284 66 0 1 0 584 300 A 284 66 0 1 0 16 300"
            transform="rotate(-14 300 300)"
          />
        </defs>

        {/* ambient halo */}
        <circle cx="300" cy="300" r="292" fill="url(#sat-halo)" />

        {/* ring system — back pass (drawn first, planet occludes middle) */}
        <g transform="rotate(-14 300 300)" fill="none">
          {RINGS.map((r, i) => (
            <ellipse key={`b${i}`} cx="300" cy="300" rx={r.rx} ry={r.rx * 0.23} stroke={r.c} strokeWidth={r.w} opacity={r.o * 0.75} />
          ))}
        </g>

        {/* planet sphere */}
        <circle cx="300" cy="300" r="148" fill="url(#sat-sphere)" />

        {/* gas-band striping, clipped to the sphere */}
        <g clipPath="url(#sat-clip)" transform="rotate(-7 300 300)" opacity="0.55">
          <rect x="130" y="176" width="340" height="16" fill="#8a6f4a" opacity="0.35" />
          <rect x="130" y="212" width="340" height="26" fill="#f2e2ba" opacity="0.4" />
          <rect x="130" y="256" width="340" height="12" fill="#95754c" opacity="0.4" />
          <rect x="130" y="292" width="340" height="24" fill="#f4e4bd" opacity="0.45" />
          <rect x="130" y="334" width="340" height="14" fill="#8f7148" opacity="0.42" />
          <rect x="130" y="366" width="340" height="22" fill="#e6cf9f" opacity="0.38" />
          <rect x="130" y="404" width="340" height="12" fill="#7d6340" opacity="0.4" />
          <ellipse cx="352" cy="308" rx="26" ry="9" fill="#c99b62" opacity="0.5" />
        </g>

        {/* night-side shading */}
        <circle cx="300" cy="300" r="148" fill="url(#sat-nightshade)" />

        {/* ring system — front pass (lower arcs cross in front of the planet) */}
        <g transform="rotate(-14 300 300)" fill="none">
          {RINGS.map((r, i) => (
            <path
              key={`f${i}`}
              d={`M ${300 - r.rx} 300 A ${r.rx} ${r.rx * 0.23} 0 0 0 ${300 + r.rx} 300`}
              stroke={r.c}
              strokeWidth={r.w}
              opacity={r.o}
            />
          ))}
        </g>

        {/* orbiting moon */}
        <g data-moon>
          <circle r="10" fill="rgba(207,216,227,0.25)" />
          <circle r="4.5" fill="#cfd8e3" />
          <circle r="4.5" fill="rgba(10,8,20,0.35)" cx="1.4" cy="1" />
          <animateMotion dur="16s" repeatCount="indefinite" rotate="0">
            <mpath href="#sat-orbit" />
          </animateMotion>
        </g>
      </svg>
    </div>
  );
};
