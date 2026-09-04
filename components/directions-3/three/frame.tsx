"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./mat.css";
import type { DishPalette } from "@/components/walkthrough/dishes";
import { preloadMenu } from "@/components/walkthrough/use-menu";
import { preloadRail } from "@/components/walkthrough/use-rail";

export const base = "/directions-3/three";

// The cloth is the room. The name is a kraft tag and the two sides are two slips
// clipped to the cloth's edge. The slips preload the other side before they are pressed.
export function MatFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    preloadMenu();
    preloadRail();
  }, []);
  const customer = pathname.startsWith(`${base}/menu`) || pathname.startsWith(`${base}/order`);
  const waiter = pathname.startsWith(`${base}/waiter`);
  const tag = (active: boolean) => `slip px-3 py-1.5 text-[13px] font-extrabold ${active ? "!bg-[color:var(--enamel-rim)] !text-[color:var(--slip)]" : ""}`;
  return (
    <div className="placemat relative min-h-dvh overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-3 pt-3 sm:px-6">
        <Link href={base} className="kraft young px-3 py-1.5 text-lg leading-none" aria-label="CHOWLY, front door">CHOWLY</Link>
        <nav aria-label="Role" className="flex gap-2">
          <Link href={`${base}/menu`} data-role="customer" className={tag(customer)} aria-current={customer ? "page" : undefined} onMouseEnter={preloadMenu} onFocus={preloadMenu} onTouchStart={preloadMenu}>At the table</Link>
          <Link href={`${base}/waiter`} data-role="waiter" className={tag(waiter)} aria-current={waiter ? "page" : undefined} onMouseEnter={preloadRail} onFocus={preloadRail} onTouchStart={preloadRail}>Waiting</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

// True above the lg breakpoint, false until mounted, so the phone layout is the default.
export function useWide(): boolean {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

// The glass of water is the clock. Five cubes when the order goes in; they melt as the
// promised minutes are used; none left when the promise is past, and from then the
// glass sweats a ring into the placemat that spreads the longer it waits. Paid: the
// glass is empty. Quantity and wear, not light.
export function Glass({ cubes, ring, out = false, size = 90, className = "" }: { cubes: number; ring: number; out?: boolean; size?: number; className?: string }) {
  const spots: [number, number][] = [[24, 40], [44, 34], [34, 54], [52, 52], [28, 70]];
  const r = Math.max(0, Math.min(1, ring));
  return (
    <svg viewBox="0 0 90 120" width={size} height={Math.round(size * 1.33)} className={className} aria-hidden="true" style={{ overflow: "visible" }}>
      <ellipse className="ring-wet" cx="45" cy="112" rx={30 + r * 34} ry={7 + r * 7} fill="var(--water)" fillOpacity={0.15 + r * 0.35} />
      <ellipse className="ring-wet" cx="45" cy="112" rx={30 + r * 34} ry={7 + r * 7} fill="none" stroke="var(--water)" strokeWidth="2" strokeOpacity={0.3 + r * 0.6} />
      <defs><clipPath id={`glass-${size}`}><path d="M 16 6 L 74 6 L 66 110 L 24 110 Z" /></clipPath></defs>
      {!out ? <rect x="10" y="30" width="70" height="90" fill="var(--water)" fillOpacity="0.85" clipPath={`url(#glass-${size})`} /> : null}
      {!out ? spots.slice(0, Math.max(0, Math.min(5, cubes))).map(([x, y], i) => <rect key={i} className="cube" x={x} y={y} width="16" height="15" rx="3" fill="var(--ice)" stroke="var(--glass-line)" strokeWidth="1.2" clipPath={`url(#glass-${size})`} />) : null}
      <path d="M 16 6 L 74 6 L 66 110 L 24 110 Z" fill="none" stroke="var(--glass-line)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M 22 14 L 20 100" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="3" />
    </svg>
  );
}

// From the order's clock to what the glass shows.
export function glassState(progress: number, state: string, lateSeconds: number, promised: number, reduce: boolean): { cubes: number; ring: number } {
  if (state === "paid") return { cubes: 0, ring: 0.2 };
  if (state === "served") return { cubes: Math.max(1, Math.ceil(progress * 5)), ring: 0 };
  if (state === "late") {
    const raw = promised > 0 ? Math.min(1, lateSeconds / promised) : 1;
    return { cubes: 0, ring: reduce ? Math.max(0.5, Math.ceil(raw * 2) / 2) : Math.max(0.15, raw) };
  }
  return { cubes: Math.max(1, Math.ceil(progress * 5)), ring: 0 };
}

// Gouache in an enamel bowl.
export const MAT_PALETTE: DishPalette = {
  plate: "#f1ece0",
  rim: "#e3dccc",
  rice: "#efd9a3",
  tomato: "#cf5330",
  green: "#5f7f3f",
  meat: "#8b5637",
  ochre: "#d9962b",
  cream: "#f2e4c2",
  glass: "#a7c7d6",
  dark: "#2b2723",
  crimson: "#8f2537",
  white: "#fbf8f0",
  line: "#26211c",
  craze: "#d8d0bf",
  second: "#22406b",
};

// Cutlery beside the bowl, drawn once.
export function Cutlery({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 120" className={className} width="60" height="120" aria-hidden="true">
      <g stroke="var(--glass-line)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M 14 8 v 28 M 8 8 v 22 q 6 8 12 0 v -22 M 14 40 v 72" />
        <path d="M 44 8 q 10 20 0 44 v 60" />
      </g>
    </svg>
  );
}
