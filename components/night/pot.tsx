"use client";

import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";

// The pot above the ring: what makes the wait feel alive while the ring keeps the
// time. Five wisps of steam rise on their own periods, each fading in low and out at
// the top, so nothing ever visibly restarts. The pot's line takes the ring's tone, so
// it reddens with everything else when the order runs late; late, the lid sits ajar and
// the steam comes fuller and faster. Served, the steam thins away and the lid settles.
// Under reduced motion the pot is still and there is no steam at all.
export type PotState = "cooking" | "late" | "settled";

// Each wisp is about twenty units tall and rises thirty four, from a base just above
// the lid. The svg does not clip, so the last of the rise trails off into the padding
// above rather than being cut in half, which is what made the old steam so faint: most
// of its travel happened outside the box.
const BASE_Y = 48;
const RISE = 34;
const WISPS = [
  { x: 34, d: "M0 0 c -5 -5 5 -9 0 -14 c -3 -3 3 -4 0 -6", period: 3200, delay: 0, drift: -3 },
  { x: 47, d: "M0 0 c 6 -6 -6 -9 0 -14 c 4 -4 -4 -4 0 -6", period: 4100, delay: 900, drift: 2 },
  { x: 60, d: "M0 0 c -4 -5 4 -8 0 -13 c -3 -4 3 -4 0 -7", period: 3600, delay: 1800, drift: -2 },
  { x: 73, d: "M0 0 c 5 -6 -5 -8 0 -13 c 3 -4 -3 -4 0 -7", period: 4600, delay: 2500, drift: 3 },
  { x: 86, d: "M0 0 c -6 -5 6 -10 0 -15 c -3 -3 3 -3 0 -5", period: 3900, delay: 3300, drift: -2 },
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
      const peak = late ? 1 : 0.85;
      utils.set(wisp, { opacity: 0 });
      return animate(wisp, {
        translateY: [0, -RISE],
        translateX: [0, w.drift],
        scaleY: [0.75, 1.3],
        opacity: [0, peak, peak, peak, 0],
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
    <svg ref={root} width="120" height="96" viewBox="0 0 120 96" className="pot block" style={{ overflow: "visible" }} data-pot={state} aria-hidden="true">
      {/* steam, five wisps, each on its own period, drawn under the pot so it reads as
          coming from behind the lid */}
      <g fill="none" stroke="var(--fg)" strokeWidth="3" strokeLinecap="round">
        {WISPS.map((w) => (
          // the group carries the placement, because an animated style transform on the
          // path itself would override a transform attribute and collapse them all
          <g key={w.x} transform={`translate(${w.x} ${BASE_Y})`}>
            <path className="wisp" d={w.d} style={{ transformBox: "fill-box", transformOrigin: "50% 100%", opacity: 0 }} />
          </g>
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
