"use client";

import { useMemo } from "react";

function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// A heat lamp and its pool of light as halftone: a brass bell on the rail, and below it
// a grid of dots that grow toward the lamp and vanish at the edge. Texture, not a
// gradient. The pool takes the heat: its colour and opacity come from --heat, and the
// spread scales with `reach`, so on the order page the pool shrinks as the promised
// minutes are used.
export function Lamp({ seed, width = 200, reach = 1, className = "" }: { seed: number; width?: number; reach?: number; className?: string }) {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = [];
    const step = 11;
    for (let y = step; y < 210; y += step) {
      for (let x = step / 2; x < 200; x += step) {
        const dx = (x - 100) / 100;
        const dy = y / 210;
        const d = Math.sqrt(dx * dx * 1.6 + dy * dy);
        const r = Math.max(0, 3.4 * (1 - d) - seeded(seed + x * 7 + y) * 0.7);
        if (r > 0.25) out.push({ x, y, r: Number(r.toFixed(2)) });
      }
    }
    return out;
  }, [seed]);
  const height = Math.round(width * 1.18);
  return (
    <svg className={className} viewBox="0 0 200 236" width={width} height={height} aria-hidden="true" style={{ overflow: "visible" }}>
      <path d="M 70 0 L 130 0 L 146 22 L 54 22 Z" fill="var(--brass)" stroke="var(--brass-dark)" strokeWidth="2" />
      <rect x="54" y="20" width="92" height="5" fill="var(--soot)" />
      <g
        className="heat-transition"
        fill="var(--lamp)"
        fillOpacity="var(--lamp-opacity)"
        style={{ transformOrigin: "100px 26px", transform: `scale(${reach.toFixed(3)})`, transition: "fill 1000ms linear, fill-opacity 1000ms linear, transform 1000ms linear" }}
      >
        {dots.map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y + 26} r={dot.r} />
        ))}
      </g>
    </svg>
  );
}
