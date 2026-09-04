"use client";

import { useMemo } from "react";

function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// The heat lamp, repaired: a ceramic shade on a cord instead of a brass bell, and under
// it the same halftone pool. The pool takes the heat, its colour and opacity from
// --heat, and its spread from `reach`, so it shrinks as the promised minutes are used.
export function Lamp({ seed, width = 200, reach = 1, cord = 0, className = "" }: { seed: number; width?: number; reach?: number; cord?: number; className?: string }) {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = [];
    const step = 11;
    for (let y = step; y < 210; y += step) {
      for (let x = step / 2; x < 200; x += step) {
        const dx = (x - 100) / 100;
        const dy = y / 210;
        const d = Math.sqrt(dx * dx * 1.6 + dy * dy);
        const r = Math.max(0, 4.1 * (1 - d) - seeded(seed + x * 7 + y) * 0.7);
        if (r > 0.25) out.push({ x, y, r: Number(r.toFixed(2)) });
      }
    }
    return out;
  }, [seed]);
  const height = Math.round(width * 1.2);
  return (
    <svg className={className} viewBox={`0 ${-cord} 200 ${240 + cord}`} width={width} height={height + Math.round((cord * width) / 200)} aria-hidden="true" style={{ overflow: "visible" }}>
      {cord > 0 ? <rect x="98.5" y={-cord} width="3" height={cord + 2} fill="var(--soot)" /> : null}
      <path d="M 84 2 L 116 2 L 152 34 L 48 34 Z" fill="var(--ceramic)" stroke="var(--soot)" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="48" y="33" width="104" height="4" fill="var(--soot)" />
      <circle cx="100" cy="38" r="5" fill="var(--lamp)" className="lamp-pool" />
      <g className="lamp-pool" fill="var(--lamp)" fillOpacity="var(--lamp-opacity)" style={{ transformOrigin: "100px 38px", transform: `scale(${reach.toFixed(3)})` }}>
        {dots.map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y + 38} r={dot.r} />
        ))}
      </g>
    </svg>
  );
}
