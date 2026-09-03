"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { GlazeFrame } from "./frame";

const base = "/directions-2/three";

// The place set on the terrazzo, the room bright as you arrive.
export function GlazeLanding() {
  const root = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0.3);
  useEffect(() => {
    const t = window.setTimeout(() => setP(1), 300);
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".t-title", ".t-line", ".t-plate", ".t-links"];
      if (self?.matches.reduceMotion) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      createTimeline({ defaults: { ease: "outQuart" } })
        .add(".t-title", { opacity: [0, 1], y: [10, 0], duration: 700 }, 200)
        .add(".t-line", { opacity: [0, 1], duration: 500, delay: stagger(120) }, "-=350")
        .add(".t-plate", { opacity: [0, 1], scale: [1.06, 1], duration: 650, ease: "outBack(1.1)", delay: stagger(150) }, "-=250")
        .add(".t-links", { opacity: [0, 1], duration: 500 }, "-=300");
    });
    return () => {
      window.clearTimeout(t);
      scope.revert();
    };
  }, []);
  return (
    <GlazeFrame progress={p}>
      <main ref={root} className="mx-auto flex min-h-[calc(100dvh-92px)] max-w-3xl flex-col px-5 pb-8 pt-6">
        <h1 className="t-title news text-[clamp(3.2rem,14vw,7rem)] leading-[0.9]" style={{ opacity: 0, fontVariationSettings: '"opsz" 144' }}>
          CHOWLY
        </h1>
        <p className="t-line mt-4 max-w-md text-[17px] leading-snug" style={{ opacity: 0 }}>
          Your table at The Golden Gate. Order from where you sit, watch the room settle while the kitchen cooks, and settle up before you leave.
        </p>
        <p className="t-line mt-2 max-w-md text-[13px] text-[var(--ink-soft)]" style={{ opacity: 0 }}>
          No login, no PIN. Either side of the room is open to anyone with this link.
        </p>
        <div className="t-line relative mx-auto mt-6 h-[150px] w-full max-w-[380px]" aria-hidden="true" style={{ opacity: 0 }}>
          <div className="glazed absolute left-1/2 top-2 h-[130px] w-[130px] -translate-x-1/2 rounded-full" style={{ borderRadius: "50%" }}>
            <svg viewBox="0 0 130 130" className="absolute inset-0"><path d="M 30 44 L 48 58 L 42 80 M 92 34 L 84 54 L 96 70" fill="none" stroke="#d6d1c6" strokeWidth="0.8" /><circle cx="65" cy="65" r="46" fill="none" stroke="#efeae0" strokeWidth="2" /></svg>
          </div>
          <div className="absolute left-[10%] top-6 h-[100px] w-1.5 rounded bg-[var(--ink)] opacity-60" />
          <div className="absolute right-[10%] top-6 h-[100px] w-1.5 rounded bg-[var(--ink)] opacity-60" />
          <div className="absolute right-[2%] top-0 h-9 w-9 rounded-full border-[3px] border-[var(--glass)] opacity-60" style={{ borderColor: "#9eb9ba" }} />
        </div>
        <div className="mt-auto grid gap-4 pt-6 sm:grid-cols-2">
          <Link href={`${base}/menu`} className="t-plate plate flex aspect-square max-h-[190px] flex-col items-center justify-center px-6 text-center" style={{ opacity: 0 }}>
            <span className="news text-3xl">Take a seat</span>
            <span className="mt-1 text-[13px] leading-snug text-[var(--ink-soft)]">The plates, your order, the room, the bill.</span>
            <span className="btn mt-3 text-[13px]">Sit down</span>
          </Link>
          <Link href={`${base}/waiter`} className="t-plate plate flex aspect-square max-h-[190px] flex-col items-center justify-center px-6 text-center" style={{ opacity: 0 }}>
            <span className="news text-3xl">The floor</span>
            <span className="mt-1 text-[13px] leading-snug text-[var(--ink-soft)]">The plan of tables: who cooked, who mixed, served.</span>
            <span className="btn quiet mt-3 text-[13px]">Open the plan</span>
          </Link>
        </div>
        <div className="t-links mt-6 flex flex-col gap-1.5 text-[13px]" style={{ opacity: 0 }}>
          <p className="font-bold" style={{ color: "var(--rust)" }}>Payment here is pretend. No money moves, and every record says so.</p>
          <p><Link href="/directions" className="underline">Three art directions</Link> and <Link href="/directions-2" className="underline">three more</Link> were built and critiqued before one was chosen.</p>
          <p><a href="https://github.com/DebbyA007/CHOWLY" rel="noopener" className="underline">Repository</a> and <a href="https://github.com/DebbyA007/CHOWLY/blob/main/docs/SUBMISSION.md" rel="noopener" className="underline">submission document</a>.</p>
        </div>
      </main>
    </GlazeFrame>
  );
}
