"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { LinenFrame } from "./frame";

const base = "/directions-2/one";

// The set table, seen from your seat. The afternoon light arrives across the cloth,
// which is the one thing that moves without being asked.
export function LinenLanding() {
  const root = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setP(1), 300);
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".t-name", ".t-line", ".t-card", ".t-links"];
      if (self?.matches.reduceMotion) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      createTimeline({ defaults: { ease: "outQuart" } })
        .add(".t-name", { opacity: [0, 1], y: [10, 0], duration: 700 }, 200)
        .add(".t-line", { opacity: [0, 1], duration: 500, delay: stagger(120) }, "-=350")
        .add(".t-card", { opacity: [0, 1], y: [14, 0], duration: 600, delay: stagger(140) }, "-=250")
        .add(".t-links", { opacity: [0, 1], duration: 500 }, "-=300");
    });
    return () => {
      window.clearTimeout(t);
      scope.revert();
    };
  }, []);
  return (
    <LinenFrame progress={p}>
      <div ref={root} className="relative">
        <div className="sun" aria-hidden="true" />
        <span className="ring" style={{ right: "12%", top: 150 }} aria-hidden="true" />
        <main className="relative mx-auto flex min-h-[calc(100dvh-88px)] max-w-3xl flex-col px-5 pb-8 pt-8">
          <h1 className="t-name serif text-[clamp(3rem,13vw,6.5rem)] leading-[0.95]" style={{ opacity: 0 }}>
            CHOWLY
          </h1>
          <p className="t-line mt-4 max-w-md text-[17px] leading-snug" style={{ opacity: 0 }}>
            Your table at The Golden Gate. Order from your seat, watch the afternoon move across the cloth while the kitchen cooks, and settle up before you go.
          </p>
          <p className="t-line mt-2 max-w-md text-[13px] text-[var(--ink-soft)]" style={{ opacity: 0 }}>
            No login, no PIN. Either side of the table is open to anyone with this link.
          </p>

          {/* the place setting */}
          <svg viewBox="0 0 320 150" className="t-line mx-auto mt-6 w-full max-w-[420px]" aria-hidden="true" style={{ opacity: 0 }}>
            <ellipse cx="150" cy="78" rx="70" ry="66" fill="#fffdf8" />
            <ellipse cx="150" cy="78" rx="70" ry="66" fill="none" stroke="#efe9dc" strokeWidth="2" />
            <ellipse cx="150" cy="78" rx="52" ry="49" fill="none" stroke="#efe9dc" strokeWidth="1.5" />
            <rect x="52" y="30" width="5" height="96" rx="2" fill="#9a958c" />
            <rect x="46" y="30" width="17" height="30" rx="3" fill="#9a958c" />
            <rect x="246" y="30" width="5" height="96" rx="2" fill="#9a958c" />
            <path d="M 244 30 L 254 30 L 252 62 L 246 62 Z" fill="#9a958c" />
            <rect x="268" y="52" width="40" height="70" rx="3" fill="#fffdf8" stroke="#e3dbc9" />
            <path d="M 268 88 L 308 88" stroke="#e3dbc9" />
            <circle cx="286" cy="24" r="16" fill="none" stroke="#9fb7b5" strokeWidth="4" opacity="0.5" />
          </svg>

          <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
            <Link href={`${base}/menu`} className="t-card stitched block rounded-2xl px-4 py-4" style={{ opacity: 0 }}>
              <span className="serif block text-2xl italic">Sit down</span>
              <span className="mt-1 block text-[14px] leading-snug text-[var(--ink-soft)]">The card, your order, the wait, the bill. The customer side.</span>
              <span className="btn mt-3 inline-block text-[14px]">Take the table</span>
            </Link>
            <Link href={`${base}/waiter`} className="t-card stitched block rounded-2xl px-4 py-4" style={{ opacity: 0 }}>
              <span className="serif block text-2xl italic">Work the floor</span>
              <span className="mt-1 block text-[14px] leading-snug text-[var(--ink-soft)]">The waiter&apos;s pad: every order, who cooked and mixed, served.</span>
              <span className="btn quiet mt-3 inline-block text-[14px]">Open the pad</span>
            </Link>
          </div>

          <div className="t-links mt-6 flex flex-col gap-1.5 text-[13px]" style={{ opacity: 0 }}>
            <p className="font-bold" style={{ color: "var(--tomato)" }}>Payment here is pretend. No money moves, and every record says so.</p>
            <p>
              <Link href="/directions" className="underline">Three art directions</Link> and <Link href="/directions-2" className="underline">three more</Link> were built and critiqued before one was chosen.
            </p>
            <p>
              <a href="https://github.com/DebbyA007/CHOWLY" rel="noopener" className="underline">Repository</a> and <a href="https://github.com/DebbyA007/CHOWLY/blob/main/docs/SUBMISSION.md" rel="noopener" className="underline">submission document</a>.
            </p>
          </div>
        </main>
      </div>
    </LinenFrame>
  );
}
