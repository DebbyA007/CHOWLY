"use client";

import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";

// The pot above the ring: what makes the wait feel alive while the ring keeps the
// time. Three wisps of steam rise on their own periods, each fading out at the top
// and in at the bottom, so nothing ever visibly restarts. The pot's line takes the
// ring's tone, so it reddens with everything else when the order runs late; late,
// the lid sits ajar and the steam comes fuller and faster. Served, the steam thins
// away and the lid settles. Under reduced motion the pot is still and there is no
// steam at all.
export type PotState = "cooking" | "late" | "settled";

const WISPS = [
  { x: 44, d: "M0 0 c -5 -7 5 -12 0 -20 c -4 -6 4 -10 0 -16", period: 3400, delay: 0 },
  { x: 60, d: "M0 0 c 6 -8 -6 -14 0 -24 c 5 -7 -5 -11 0 -18", period: 4300, delay: 1100 },
  { x: 76, d: "M0 0 c -4 -6 4 -11 0 -18 c -5 -7 5 -12 0 -16", period: 5100, delay: 2000 },
];

export function Pot({ state }: { state: PotState }) {
  const root = useRef<SVGSVGElement>(null);
  const reduce = usePrefersReducedMotion();
  const steam = useRef<ReturnType<typeof animate>[]>([]);

  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const wisps = [...svg.querySelectorAll<SVGPathElement>(".wisp")];
    const lid = svg.querySelector<SVGGElement>(".lid");
    steam.current.forEach((a) => a.pause());
    steam.current = [];
    if (reduce) {
      utils.set(wisps, { opacity: 0 });
      if (lid) utils.set(lid, { rotate: 0, translateY: 0 });
      return;
    }
    if (state === "settled") {
      // the steam thins away, then stops; the lid settles back on
      animate(wisps, { opacity: 0, duration: 1400, ease: "outQuad" });
      if (lid) animate(lid, { rotate: 0, translateY: 0, duration: 700, ease: "outQuad" });
      return;
    }
    const late = state === "late";
    if (lid) animate(lid, { rotate: late ? -7 : 0, translateY: late ? -3 : 0, duration: 900, ease: "inOutQuad" });
    steam.current = wisps.map((wisp, i) => {
      const w = WISPS[i]!;
      const period = late ? w.period * 0.62 : w.period;
      const peak = late ? 0.85 : 0.55;
      utils.set(wisp, { opacity: 0 });
      return animate(wisp, {
        translateY: [0, -30],
        scaleY: [0.7, 1.15],
        opacity: [0, peak, peak, 0],
        duration: period,
        delay: w.delay,
        loop: true,
        ease: "linear",
      });
    });
    return () => {
      steam.current.forEach((a) => a.pause());
    };
  }, [state, reduce]);

  return (
    <svg ref={root} width="120" height="96" viewBox="0 0 120 96" className="pot block" data-pot={state} aria-hidden="true">
      {/* steam, three wisps, each on its own period */}
      <g fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" opacity="0.9">
        {WISPS.map((w) => (
          <path key={w.x} className="wisp" d={w.d} transform={`translate(${w.x} 40)`} style={{ transformOrigin: `${w.x}px 40px`, opacity: 0 }} />
        ))}
      </g>
      {/* the pot: a body, two handles, a lid with a knob, in the ring's tone */}
      <g fill="none" stroke="var(--ring-tone)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M22 50 L98 50 L94 84 Q92 90 86 90 L34 90 Q28 90 26 84 Z" fill="var(--surface)" />
        <path d="M22 56 L12 56 Q8 56 8 60 L8 62 Q8 66 12 66 L23 66" />
        <path d="M98 56 L108 56 Q112 56 112 60 L112 62 Q112 66 108 66 L97 66" />
        <g className="lid" style={{ transformOrigin: "22px 50px" }}>
          <path d="M18 50 Q60 32 102 50" fill="var(--surface)" />
          <circle cx="60" cy="38" r="3.5" fill="var(--ring-tone)" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
