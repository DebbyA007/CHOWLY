"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { Dish, dishes } from "@/components/walkthrough/dishes";
import { firstVisit } from "@/components/walkthrough/once";
import { RUN_PALETTE, RunFrame, base } from "./frame";

const REPOSITORY = "https://github.com/DebbyA007/CHOWLY";
const SUBMISSION = "https://github.com/DebbyA007/CHOWLY/blob/main/docs/SUBMISSION.md";
const ids = Object.keys(dishes);

// The front door: the tray, turned to rest as you arrive, every bowl on it. Two discs
// below it are the two ways in.
export function RunLanding() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".name", ".line", ".tray", ".disc", ".colophon"];
      if (self?.matches.reduceMotion || !firstVisit("two-landing")) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      createTimeline({ defaults: { ease: "outExpo" } })
        .add(".tray", { opacity: [0, 1], rotate: [-70, 0], duration: 1400, ease: "outQuint" }, 100)
        .add(".name", { opacity: [0, 1], y: [10, 0], duration: 700 }, "-=900")
        .add(".line", { opacity: [0, 1], duration: 500 }, "-=400")
        .add(".disc", { opacity: [0, 1], scale: [0.8, 1], duration: 600, ease: "outBack(1.6)", delay: stagger(140) }, "-=300")
        .add(".colophon", { opacity: [0, 1], duration: 400 }, "-=300");
    });
    return () => scope.revert();
  }, []);
  return (
    <RunFrame>
      <main ref={root} className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-6xl flex-col px-4 pb-8 pt-4 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
        <div className="relative mx-auto mt-2 h-[280px] w-[280px] sm:h-[420px] sm:w-[420px] lg:order-2" aria-hidden="true">
          <div className="tray lacquer absolute inset-0 rounded-full" style={{ opacity: 0 }}>
            <div className="absolute inset-[9%] rounded-full border-2 border-[color:var(--lacquer-light)]" />
            {ids.map((id, i) => {
              const a = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <div key={id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(50 + Math.cos(a) * 41).toFixed(2)}%`, top: `${(50 + Math.sin(a) * 41).toFixed(2)}%` }}>
                  <div className="bowl h-9 w-9 sm:h-14 sm:w-14"><Dish id={id} material="glaze" palette={RUN_PALETTE} size={28} className="sm:hidden" /><Dish id={id} material="glaze" palette={RUN_PALETTE} size={44} className="hidden sm:block" /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="min-w-0 lg:order-1">
          <h1 className="name syne text-[clamp(3rem,6.5vw,6rem)] leading-[0.9]" style={{ opacity: 0 }}>CHOWLY</h1>
          <p className="line mt-3 max-w-md text-[15px] leading-snug sm:text-lg" style={{ opacity: 0 }}>
            Turn the tray, pick a bowl, and watch the runner carry it across the room to your table. Settle up when it lands.
          </p>
          <div className="mt-auto flex justify-center gap-5 pt-8 lg:justify-start">
            <Link href={`${base}/menu`} data-enter="customer" className="disc lacquer flex h-[150px] w-[150px] flex-col items-center justify-center rounded-full text-center" style={{ opacity: 0 }}>
              <span className="syne text-2xl leading-none">Sit down</span>
              <span className="mt-1 text-[12px] opacity-90">the tray, the run, the chit</span>
            </Link>
            <Link href={`${base}/waiter`} data-enter="waiter" className="disc chalk flex h-[150px] w-[150px] flex-col items-center justify-center rounded-full text-center" style={{ opacity: 0 }}>
              <span className="syne text-2xl leading-none">Run it</span>
              <span className="mt-1 text-[12px] text-[color:var(--ink-soft)]">every run on the floor</span>
            </Link>
          </div>
          <p className="colophon mt-8 text-xs text-[color:var(--ink-soft)]" style={{ opacity: 0 }}>
            <a href={REPOSITORY} rel="noopener" className="underline">Repository</a>, <a href={SUBMISSION} rel="noopener" className="underline">submission document</a>, and the art directions: <Link href="/directions" className="underline">one</Link>, <Link href="/directions-2" className="underline">two</Link>, <Link href="/directions-3" className="underline">three</Link>.
          </p>
        </div>
      </main>
    </RunFrame>
  );
}
