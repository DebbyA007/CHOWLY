"use client";

import { useEffect, useId, useRef } from "react";
import { animate, createTimeline, utils } from "animejs";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";

// The vessel above the ring: what makes the wait feel alive while the ring keeps the
// time. It matches what was ordered. Food is a pot simmering, and on serving the lid
// lifts away and a plated dish arrives under it with the steam settling low over the
// food. Drinks are a glass being poured, and on serving the pour stops and the level
// rises to full. A mixed order takes the food vessel, because the food is what the
// guest is actually waiting on: the drink is usually down before the kitchen is done.
//
// The line is always the ring's tone, so it reddens with everything else when the order
// runs late. Under reduced motion there is no steam, no pour, and no transition: the
// vessel is simply drawn in the state the order is in.
export type VesselKind = "food" | "drinks";
export type VesselState = "cooking" | "late" | "served";

const BASE_Y = 48;
const RISE = 34;
// Settled steam hangs over the plate instead of climbing: a shorter, slower drift.
const SETTLED_RISE = 13;
const WISPS = [
  { x: 34, d: "M0 0 c -5 -5 5 -9 0 -14 c -3 -3 3 -4 0 -6", period: 3200, delay: 0, drift: -3 },
  { x: 47, d: "M0 0 c 6 -6 -6 -9 0 -14 c 4 -4 -4 -4 0 -6", period: 4100, delay: 900, drift: 2 },
  { x: 60, d: "M0 0 c -4 -5 4 -8 0 -13 c -3 -4 3 -4 0 -7", period: 3600, delay: 1800, drift: -2 },
  { x: 73, d: "M0 0 c 5 -6 -5 -8 0 -13 c 3 -4 -3 -4 0 -7", period: 4600, delay: 2500, drift: 3 },
  { x: 86, d: "M0 0 c -6 -5 6 -10 0 -15 c -3 -3 3 -3 0 -5", period: 3900, delay: 3300, drift: -2 },
];

// The glass, drawn once here so the outline and the clip that holds the liquid cannot
// drift apart.
const GLASS = "M45 44 L49 88 Q49 91 52.5 91 L67.5 91 Q71 91 71 88 L75 44";
const GLASS_INSIDE = "M46.5 45.5 L50.5 87.5 Q50.5 89.5 53 89.5 L67 89.5 Q69.5 89.5 69.5 87.5 L73.5 45.5 Z";
const LEVEL_FULL = 49;
const LEVEL_POURING = 68;

export function Vessel({ kind, state }: { kind: VesselKind; state: VesselState }) {
  const root = useRef<SVGSVGElement>(null);
  const reduce = usePrefersReducedMotion();
  const live = useRef<ReturnType<typeof animate>[]>([]);
  const was = useRef<VesselState | null>(null);
  const clipId = useId().replace(/:/g, "");

  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const q = <T extends SVGElement>(sel: string) => svg.querySelector<T>(sel);
    const wisps = [...svg.querySelectorAll<SVGPathElement>(".wisp")];
    const lid = q<SVGGElement>(".lid");
    const body = q<SVGGElement>(".body");
    const plate = q<SVGGElement>(".plate");
    const stream = q<SVGPathElement>(".stream");
    const level = q<SVGRectElement>(".level");
    const glass = q<SVGGElement>(".glass");
    live.current.forEach((a) => a.pause());
    live.current = [];
    const served = state === "served";
    const late = state === "late";
    // The change from cooking to served is the payoff of the wait, so it is played
    // once, when it happens, and not on a screen that simply arrives already served.
    const arriving = was.current !== null && was.current !== "served" && served;
    was.current = state;

    if (kind === "food") {
      if (!lid || !body || !plate) return;
      if (reduce) {
        utils.set(wisps, { opacity: 0 });
        utils.set(lid, { opacity: served ? 0 : 1, rotate: 0, translateY: 0, translateX: 0 });
        utils.set(body, { opacity: served ? 0 : 1, scaleY: 1 });
        utils.set(plate, { opacity: served ? 1 : 0, scale: 1, translateY: 0 });
        return;
      }
      if (served) {
        if (arriving) {
          // the lid lifts away, the pot goes with it, and the plate arrives underneath
          const tl = createTimeline()
            .add(lid, { rotate: -26, translateX: -7, translateY: -12, opacity: [1, 0], duration: 460, ease: "outQuad" }, 0)
            .add(body, { opacity: [1, 0], scaleY: 0.7, duration: 400, ease: "inQuad" }, 160)
            .add(plate, { opacity: [0, 1], scale: [0.88, 1], translateY: [10, 0], duration: 520, ease: "outBack(1.6)" }, 300);
          live.current.push(tl as unknown as ReturnType<typeof animate>);
        } else {
          utils.set([lid, body], { opacity: 0 });
          utils.set(plate, { opacity: 1, scale: 1, translateY: 0 });
        }
      } else {
        utils.set([lid, body], { opacity: 1, scaleY: 1 });
        utils.set(plate, { opacity: 0 });
        live.current.push(animate(lid, { rotate: late ? -7 : 0, translateY: late ? -3 : 0, translateX: 0, duration: 900, ease: "inOutQuad" }));
      }
    } else {
      if (!stream || !level || !glass) return;
      if (reduce) {
        utils.set(wisps, { opacity: 0 });
        utils.set(stream, { opacity: 0 });
        utils.set(level, { y: served ? LEVEL_FULL : LEVEL_POURING });
        return;
      }
      if (served) {
        live.current.push(animate(stream, { opacity: 0, translateY: -8, duration: 320, ease: "inQuad" }));
        live.current.push(animate(level, { y: LEVEL_FULL, duration: arriving ? 560 : 0, ease: "outQuad" }));
        if (arriving) live.current.push(animate(glass, { scale: [1, 1.05, 1], duration: 520, ease: "outQuad", delay: 260 }));
      } else {
        // a seamless pour: the dash pattern slides by exactly one period, so the flow
        // never shows a seam, and it runs faster when the drink is running late
        utils.set(stream, { opacity: 1, translateY: 0 });
        utils.set(level, { y: LEVEL_POURING });
        live.current.push(animate(stream, { strokeDashoffset: [0, -16], duration: late ? 380 : 620, loop: true, ease: "linear" }));
      }
    }

    // Steam belongs to food: rising from the pot while it cooks, hanging low over the
    // plate once it is served. A drink does not steam.
    if (kind === "food") {
      const rise = served ? SETTLED_RISE : RISE;
      const peak = served ? 0.5 : late ? 1 : 0.85;
      const slow = served ? 1.9 : late ? 0.62 : 1;
      wisps.forEach((wisp, i) => {
        const w = WISPS[i]!;
        live.current.push(
          animate(wisp, {
            translateY: [0, -rise],
            translateX: [0, served ? w.drift * 2.2 : w.drift],
            scaleY: [0.75, served ? 0.9 : 1.3],
            opacity: [0, peak, peak, peak, 0],
            duration: w.period * slow,
            delay: w.delay,
            loop: true,
            ease: "linear",
          }),
        );
      });
    }
    return () => {
      live.current.forEach((a) => a.pause());
    };
  }, [kind, state, reduce]);

  return (
    <svg ref={root} width="120" height="96" viewBox="0 0 120 96" className="pot block" style={{ overflow: "visible" }} data-vessel={`${kind}-${state}`} aria-hidden="true">
      {kind === "food" ? (
        <>
          {/* steam, five wisps, each on its own period, drawn under the vessel so it
              reads as coming from behind the lid and from over the food */}
          <g fill="none" stroke="var(--fg)" strokeWidth="3" strokeLinecap="round">
            {WISPS.map((w) => (
              <g key={w.x} transform={`translate(${w.x} ${BASE_Y})`}>
                <path className="wisp" d={w.d} style={{ transformBox: "fill-box", transformOrigin: "50% 100%", opacity: 0 }} />
              </g>
            ))}
          </g>
          <g fill="none" stroke="var(--ring-tone)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            <g className="body" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
              <path d="M22 50 L98 50 L94 84 Q92 90 86 90 L34 90 Q28 90 26 84 Z" fill="var(--surface)" />
              <path d="M22 56 L12 56 Q8 56 8 60 L8 62 Q8 66 12 66 L23 66" />
              <path d="M98 56 L108 56 Q112 56 112 60 L112 62 Q112 66 108 66 L97 66" />
            </g>
            <g className="lid" style={{ transformBox: "fill-box", transformOrigin: "10% 100%" }}>
              <path d="M18 50 Q60 32 102 50" fill="var(--surface)" />
              <circle cx="60" cy="38" r="3.5" fill="var(--ring-tone)" stroke="none" />
            </g>
            {/* the plate: a rim, a well, and the food on it */}
            <g className="plate" style={{ transformBox: "fill-box", transformOrigin: "50% 80%", opacity: 0 }}>
              <ellipse cx="60" cy="78" rx="40" ry="9.5" fill="var(--surface)" />
              <ellipse cx="60" cy="77" rx="27" ry="5.6" />
              <path d="M38 75 Q60 51 82 75" fill="var(--surface)" />
              <path d="M48 69 q 6 -5 12 -2" />
              <path d="M62 64 q 7 -4 11 2" />
            </g>
          </g>
        </>
      ) : (
        <g fill="none" stroke="var(--ring-tone)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
          <defs>
            <clipPath id={clipId}>
              <path d={GLASS_INSIDE} />
            </clipPath>
          </defs>
          {/* the pour, a dashed line that slides by exactly one period so it never seams */}
          <path className="stream" d="M60 0 L60 43" strokeDasharray="7 9" strokeWidth="2.5" />
          <g className="glass" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
            <rect className="level" x="44" y={LEVEL_POURING} width="32" height="48" fill="var(--ring-tone)" fillOpacity="0.28" stroke="none" clipPath={`url(#${clipId})`} />
            <path d={GLASS} fill="none" />
            <path d="M42 44 L78 44" />
          </g>
        </g>
      )}
    </svg>
  );
}
