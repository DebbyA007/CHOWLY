"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { MARK_ARC_START, MARK_DOT, MARK_PATH, MARK_STROKE, MARK_VIEWBOX } from "@/lib/brand";
import { ARC_LENGTH, ARC_SWEEP_DEG, CEILING_MS, FLOOR_MS, HANDOFF_EVENT, PARK_DEG, SPLASH_COOKIE } from "@/lib/splash";
import { Wordmark } from "./brand";
import { preloadMenu } from "./use-menu";

// The splash, direction 1e of the splash handoff: the mark's arc fills as a progress
// ring against its track, the dot rides the head of the fill, and once the app is ready
// the dot goes on to park in the gap at 0 degrees, the mark's resting state, before the
// splash dissolves into the landing. The fill is driven by real work, never a timer:
// the fonts resolving, the menu request settling, and the first screen's photographs
// decoding. Cold start only, once per session: a cookie set at the handoff keeps it
// from running again: an inline script in the root layout reads it before the body is
// parsed and marks the document warm, the stylesheet hides the splash, and this
// component unmounts. The page stays static. Under reduced motion the lockup is still
// and simply cross-fades.
type Phase = "fill" | "park" | "handoff" | "done";
const WEIGHTS = { fonts: 0.25, menu: 0.45, photos: 0.3 };

// A cold start is the browser loading the door itself. Arriving at the door from
// inside the app, by the lockup or any other link, is a navigation, and a splash in
// front of a navigation is the tax this is meant to avoid. So the path the bundle
// first ran at decides, a document runs the splash at most once, and the cookie the
// inline script reads covers the session's later loads.
const ENTERED_AT = typeof window === "undefined" ? null : window.location.pathname;
let claimedDocument = false;
let active = false;

function willRun(): boolean {
  if (typeof window === "undefined") return false;
  if (claimedDocument || ENTERED_AT !== "/") return false;
  return !document.documentElement.dataset.warm;
}

// Whether the landing should wait for a handoff instead of entering on its own.
export function splashIsRunning(): boolean {
  return active;
}

export function Splash() {
  const root = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const [phase, setPhase] = useState<Phase>("fill");

  // Decided before the first paint, so a screen not getting the splash never shows a
  // frame of it, and the landing's mark is only claimed when the splash really is the
  // one drawing it.
  useLayoutEffect(() => {
    if (!willRun()) {
      setPhase("done");
      return;
    }
    claimedDocument = true;
    active = true;
    running.current = true;
    // Nothing under a full-screen cover should be reachable. Set before the first
    // paint, so there is no window in which a Tab reaches the landing beneath, whose
    // doors are merely at opacity 0 and would otherwise take focus and activate.
    document.querySelector("main")?.setAttribute("inert", "");
    try {
      window.sessionStorage.setItem("chowly-mark-drawn", "1");
    } catch {
      // then the landing draws it too, which is no harm
    }
  }, []);

  useEffect(() => {
    if (!running.current) return;
    const el = root.current;
    const arc = el?.querySelector<SVGPathElement>(".splash-arc");
    const head = el?.querySelector<SVGGElement>(".splash-head");
    const caption = el?.querySelector<HTMLElement>(".splash-caption");
    if (!el || !arc || !head) return;
    const release = () => document.querySelector("main")?.removeAttribute("inert");
    // Read the setting here rather than through a hook that returns false on the first
    // render, which would tear this effect down and start the whole load over.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let cancelled = false;
    let leaving = false;
    let fill: ReturnType<typeof animate> | null = null;
    // every animation, so leaving mid-flight cancels all of them
    const anims: ReturnType<typeof animate>[] = [];
    const done = { fonts: 0, menu: 0, photos: 0 };
    let progress = 0;
    const state = { offset: ARC_LENGTH, deg: 0 };
    const paint = () => {
      arc.style.strokeDashoffset = String(state.offset);
      head.style.transform = `rotate(${state.deg}deg)`;
      el.dataset.progress = (1 - state.offset / ARC_LENGTH).toFixed(2);
    };
    // under reduced motion the lockup is still, in its resting state (the stylesheet
    // holds it there from the first paint); the progress is only recorded
    if (reduce) Object.assign(state, { offset: 0, deg: PARK_DEG });
    const show = () => {
      if (leaving) return;
      const target = { offset: ARC_LENGTH * (1 - progress), deg: ARC_SWEEP_DEG * progress };
      fill?.pause();
      if (reduce) {
        el.dataset.progress = progress.toFixed(2);
        return;
      }
      fill = animate(state, { ...target, duration: 420, ease: "outQuad", onUpdate: paint });
    };
    const mark = (key: keyof typeof done, fraction = 1) => {
      if (cancelled) return;
      done[key] = Math.max(done[key], fraction);
      progress = Math.min(1, WEIGHTS.fonts * done.fonts + WEIGHTS.menu * done.menu + WEIGHTS.photos * done.photos);
      el.dataset.signals = `fonts ${done.fonts.toFixed(2)} menu ${done.menu.toFixed(2)} photos ${done.photos.toFixed(2)}`;
      show();
    };
    // the three signals
    (document.fonts?.ready ?? Promise.resolve()).then(() => mark("fonts"), () => mark("fonts"));
    preloadMenu().then(() => mark("menu"), () => mark("menu"));
    const photos = [...document.querySelectorAll<HTMLImageElement>("main img")].slice(0, 4);
    if (photos.length === 0) mark("photos");
    let decoded = 0;
    photos.forEach((img) => {
      (img.decode ? img.decode() : Promise.resolve()).catch(() => undefined).then(() => {
        decoded += 1;
        mark("photos", decoded / photos.length);
      });
    });

    // the handoff, once everything has landed and the floor has passed, or at the
    // ceiling, when the splash leaves so the page can show its own loading shapes
    const leave = () => {
      leaving = true;
      fill?.pause();
      window.clearInterval(timer);
      const settle = () => {
        if (cancelled) return;
        active = false;
        release();
        setPhase("handoff");
        window.dispatchEvent(new Event(HANDOFF_EVENT));
        try {
          document.cookie = `${SPLASH_COOKIE}=1; path=/; SameSite=Lax`;
        } catch {
          // then it shows again next time, which is a brand moment, not a fault
        }
        anims.push(animate(el, { opacity: [1, 0], duration: reduce ? 300 : 520, ease: "inOutQuad", onComplete: () => setPhase("done") }));
      };
      if (reduce) {
        settle();
        return;
      }
      setPhase("park");
      if (caption) anims.push(animate(caption, { opacity: 0, duration: 260, ease: "outQuad" }));
      anims.push(animate(state, { offset: 0, deg: PARK_DEG, duration: 480, ease: "outQuart", onUpdate: paint, onComplete: settle }));
    };
    const timer = window.setInterval(() => {
      const t = performance.now() - started;
      if ((progress >= 1 && t >= FLOOR_MS) || t >= CEILING_MS) {
        if (progress < 1) el.dataset.ceiling = "1";
        leave();
      }
    }, 80);
    return () => {
      cancelled = true;
      active = false;
      window.clearInterval(timer);
      fill?.pause();
      anims.forEach((a) => a.pause());
      release();
    };
  }, []);

  if (phase === "done") return null;
  return (
    <div ref={root} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg" data-splash={phase} role="status" aria-label="CHOWLY is loading">
      <svg width={140} height={140} viewBox={MARK_VIEWBOX} fill="none" aria-hidden="true" className="block">
        <path d={MARK_PATH} stroke="var(--track)" strokeWidth={MARK_STROKE} strokeLinecap="round" />
        <path className="splash-arc" d={MARK_PATH} stroke="var(--accent)" strokeWidth={MARK_STROKE} strokeLinecap="round" strokeDasharray={ARC_LENGTH} style={{ strokeDashoffset: ARC_LENGTH }} />
        <g className="splash-head" style={{ transformOrigin: "50px 50px", transform: "rotate(0deg)" }}>
          <circle cx={MARK_ARC_START.x} cy={MARK_ARC_START.y} r={MARK_DOT.r} fill="var(--accent)" />
        </g>
      </svg>
      <Wordmark size={22} className="mt-[16px]" />
      <p className="splash-caption mt-[28px] text-[11.5px] text-fg-muted" aria-live="polite">Loading the menu</p>
    </div>
  );
}
