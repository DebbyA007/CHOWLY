"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { Dish } from "@/components/walkthrough/dishes";
import { firstVisit } from "@/components/walkthrough/once";
import { Cutlery, Glass, MAT_PALETTE, MatFrame, base } from "./frame";

const REPOSITORY = "https://github.com/DebbyA007/CHOWLY";
const SUBMISSION = "https://github.com/DebbyA007/CHOWLY/blob/main/docs/SUBMISSION.md";

// The front door is your place at the table, seen from above: the placemat printed
// with the name, a bowl set down, cutlery, a full glass, and two slips tucked under
// the mat's edge, one for each side. On a wide table the scene gets its own mat.
export function MatLanding() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".mat", ".name", ".line", ".bowl-in", ".glass-in", ".slip-in", ".colophon"];
      if (self?.matches.reduceMotion || !firstVisit("three-landing")) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      createTimeline({ defaults: { ease: "outExpo" } })
        .add(".mat", { opacity: [0, 1], y: [24, 0], duration: 700 }, 100)
        .add(".name", { opacity: [0, 1], duration: 600 }, "-=400")
        .add(".line", { opacity: [0, 1], duration: 400 }, "-=300")
        .add(".bowl-in", { opacity: [0, 1], scale: [1.15, 1], duration: 700, ease: "outBack(1.2)" }, "-=250")
        .add(".glass-in", { opacity: [0, 1], y: [-14, 0], duration: 500 }, "-=400")
        .add(".slip-in", { opacity: [0, 1], y: [18, 0], duration: 500, delay: stagger(120) }, "-=250")
        .add(".colophon", { opacity: [0, 1], duration: 400 }, "-=300");
    });
    return () => scope.revert();
  }, []);
  const scene = (big: boolean) => (
    <div className={`relative ${big ? "h-[420px]" : "h-[190px]"}`} aria-hidden="true">
      <div className={`bowl-in enamel absolute ${big ? "left-10 top-14 h-[300px] w-[300px]" : "left-2 top-4 h-[150px] w-[150px]"}`} style={{ opacity: 0 }}>
        <Dish id="item_jollof_rice" material="gouache" palette={MAT_PALETTE} size={big ? 240 : 118} />
      </div>
      <Cutlery className={`absolute ${big ? "left-[370px] top-24 scale-[1.6]" : "left-[170px] top-6"}`} />
      <div className={`glass-in absolute ${big ? "right-12 top-6" : "right-2 top-0"}`} style={{ opacity: 0 }}>
        <Glass cubes={5} ring={0} size={big ? 130 : 78} />
      </div>
    </div>
  );
  return (
    <MatFrame>
      <main ref={root} className="mx-auto max-w-6xl px-3 pb-8 pt-4 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-8">
        <section className="mat kraft px-5 pb-6 pt-6" style={{ opacity: 0 }}>
          <h1 className="name young text-[clamp(3rem,15vw,5.6rem)] leading-[0.9]" style={{ opacity: 0 }}>CHOWLY</h1>
          <p className="line mt-3 max-w-md text-[15px] leading-snug sm:text-lg" style={{ opacity: 0 }}>
            Sit down at The Golden Gate. Order from the placemat, watch the ice in your glass while the kitchen cooks, and pay the chit before you go.
          </p>
          <div className="lg:hidden">{scene(false)}</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href={`${base}/menu`} data-enter="customer" className="slip-in slip clipped flex flex-col px-4 pb-4 pt-5" style={{ opacity: 0 }}>
              <span className="young text-2xl leading-none">Sit down</span>
              <span className="mt-1 text-[12px] text-[color:var(--ink-soft)]">The placemat, your chit, the glass, the bill.</span>
              <span className="btn mt-3 self-start text-[13px]">Take the table</span>
            </Link>
            <Link href={`${base}/waiter`} data-enter="waiter" className="slip-in slip clipped flex flex-col px-4 pb-4 pt-5" style={{ opacity: 0 }}>
              <span className="young text-2xl leading-none">Wait the tables</span>
              <span className="mt-1 text-[12px] text-[color:var(--ink-soft)]">Every table&apos;s glass, who cooked and who mixed.</span>
              <span className="btn quiet mt-3 self-start text-[13px]">Open the floor</span>
            </Link>
          </div>
          <p className="colophon mt-6 text-xs text-[color:var(--ink-soft)]" style={{ opacity: 0 }}>
            <a href={REPOSITORY} rel="noopener" className="underline">Repository</a>, <a href={SUBMISSION} rel="noopener" className="underline">submission document</a>, and the art directions: <Link href="/directions" className="underline">one</Link>, <Link href="/directions-2" className="underline">two</Link>, <Link href="/directions-3" className="underline">three</Link>.
          </p>
        </section>
        <section className="mat kraft hidden px-5 pb-6 pt-6 lg:block" style={{ opacity: 0 }} aria-hidden="true">{scene(true)}</section>
      </main>
    </MatFrame>
  );
}
