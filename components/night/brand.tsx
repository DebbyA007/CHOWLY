"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { clearTabPress } from "./arrival";
import { animate, utils } from "animejs";
import { MARK_DOT, MARK_INK, MARK_PATH, MARK_STROKE, MARK_VIEWBOX } from "@/lib/brand";
import { usePrefersReducedMotion } from "@/components/use-reduced-motion";

// The identity, per docs/BRAND.md. The mark is the file's geometry (lib/brand.ts, checked
// against public/brand/mark.svg by its test): ochre on the dark ground, or near-black on
// ochre, the opening to the right, never rotated, filled or closed. The wordmark is
// Newsreader 400, all caps, letter-spacing 0.15em, bone, set with next/font.

export function Mark({ size = 16, on = "dark", className = "", svgRef }: { size?: number; on?: "dark" | "ochre"; className?: string; svgRef?: React.Ref<SVGSVGElement> }) {
  const colour = on === "ochre" ? MARK_INK : "var(--accent)";
  return (
    <svg ref={svgRef} width={size} height={size} viewBox={MARK_VIEWBOX} fill="none" className={`shrink-0 ${className}`} aria-hidden="true" data-mark>
      <path className="mark-arc" d={MARK_PATH} stroke={colour} strokeWidth={MARK_STROKE} strokeLinecap="round" />
      <circle className="mark-dot" cx={MARK_DOT.cx} cy={MARK_DOT.cy} r={MARK_DOT.r} fill={colour} style={{ transformOrigin: `${MARK_DOT.cx}px ${MARK_DOT.cy}px` }} />
    </svg>
  );
}

export function Wordmark({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`wordmark ${className}`} style={{ fontSize: size }} data-wordmark>
      CHOWLY
    </span>
  );
}

// Horizontal for the headers and the waiter chrome, where it is the way home: a real
// link to the door, mark and wordmark together, tall enough to tap. Stacked for the
// landing, which is home, where the mark draws in once.
export function Lockup({ variant = "horizontal", className = "" }: { variant?: "horizontal" | "stacked"; className?: string }) {
  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center ${className}`} data-lockup="stacked">
        <DrawnMark size={52} />
        <Wordmark size={19} className="mt-[16px]" />
      </div>
    );
  }
  return (
    <Link href="/" aria-label="CHOWLY, home" onClick={clearTabPress} className={`home press -my-[14px] flex w-fit min-h-[44px] items-center gap-[8px] py-[14px] ${className}`} data-lockup="horizontal" data-home>
      <Mark size={16} />
      <Wordmark size={12} className="translate-y-[1px]" />
    </Link>
  );
}

const DRAWN_KEY = "chowly-mark-drawn";

// The one place the mark moves: on first arrival at the landing the arc draws in the
// way the countdown ring sweeps, and the dot lands last. Once per session, never as
// decoration anywhere else. Under reduced motion it is simply there.
export function DrawnMark({ size }: { size: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduce = usePrefersReducedMotion();
  useLayoutEffect(() => {
    const svg = ref.current;
    const arc = svg?.querySelector<SVGPathElement>(".mark-arc");
    const dot = svg?.querySelector<SVGCircleElement>(".mark-dot");
    if (!svg || !arc || !dot) return;
    let drawn = false;
    try {
      drawn = window.sessionStorage.getItem(DRAWN_KEY) === "1";
    } catch {
      // then it draws again next time, which is no harm
    }
    if (drawn || reduce) return;
    try {
      window.sessionStorage.setItem(DRAWN_KEY, "1");
    } catch {
      // as above
    }
    const length = arc.getTotalLength();
    arc.style.strokeDasharray = String(length);
    arc.style.strokeDashoffset = String(length);
    utils.set(dot, { scale: 0, opacity: 0 });
    svg.dataset.drawing = "arc";
    const draw = animate(arc, { strokeDashoffset: [length, 0], duration: 1100, delay: 300, ease: "outQuart", onComplete: () => { svg.dataset.drawing = "dot"; } });
    const land = animate(dot, { scale: [0, 1], opacity: [0, 1], duration: 380, delay: 1350, ease: "outBack(2)", onComplete: () => { svg.dataset.drawing = "done"; } });
    return () => {
      draw.pause();
      land.pause();
    };
  }, [reduce]);
  return <Mark size={size} svgRef={ref} />;
}
