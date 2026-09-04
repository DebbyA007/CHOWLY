"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "./run.css";
import type { DishPalette } from "@/components/walkthrough/dishes";
import { preloadMenu } from "@/components/walkthrough/use-menu";
import { preloadRail } from "@/components/walkthrough/use-rail";

export const base = "/directions-3/two";

// The chrome: the name on a lacquer plate and two chalk tags for the two sides. The
// tags preload the other side's data so the switch is immediate.
export function RunFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    preloadMenu();
    preloadRail();
  }, []);
  const customer = pathname.startsWith(`${base}/menu`) || pathname.startsWith(`${base}/order`);
  const waiter = pathname.startsWith(`${base}/waiter`);
  const tag = (active: boolean) => `border-2 border-[color:var(--ink)] px-3 py-1.5 text-[13px] font-bold ${active ? "bg-[color:var(--ink)] text-[color:var(--chalk)]" : "bg-[color:var(--chalk)] text-[color:var(--ink)]"}`;
  return (
    <div className="run relative min-h-dvh overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-4 sm:px-8">
        <Link href={base} className="syne lacquer px-3 py-1.5 text-lg leading-none" aria-label="CHOWLY, front door">CHOWLY</Link>
        <nav aria-label="Role" className="flex gap-2">
          <Link href={`${base}/menu`} data-role="customer" className={tag(customer)} aria-current={customer ? "page" : undefined} onMouseEnter={preloadMenu} onFocus={preloadMenu} onTouchStart={preloadMenu}>Seated</Link>
          <Link href={`${base}/waiter`} data-role="waiter" className={tag(waiter)} aria-current={waiter ? "page" : undefined} onMouseEnter={preloadRail} onFocus={preloadRail} onTouchStart={preloadRail}>Running</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

// Glaze on terracotta: the food pooled into clay bowls.
export const RUN_PALETTE: DishPalette = {
  plate: "#b3603a",
  rim: "#9c5030",
  rice: "#f2dca6",
  tomato: "#d4512c",
  green: "#5f8a4a",
  meat: "#7c4a2e",
  ochre: "#e0a12f",
  cream: "#f4e6c4",
  glass: "#b7d3d6",
  dark: "#2c2622",
  crimson: "#8d2438",
  white: "#fbf6ea",
  line: "#3a2418",
  craze: "#c98a66",
  second: "#2f4a3b",
};

// The room as a chalk plan: the pass at the top left, eight tables, and a route from
// the pass to each table, drawn as a polyline so the runner can be placed along it
// without touching the DOM. `tableFor` maps any table number onto one of the eight.
export const ROOM = { w: 360, h: 300 };
export const PASS_AT = { x: 46, y: 40 };
export const TABLES: { x: number; y: number }[] = [
  { x: 120, y: 120 }, { x: 220, y: 110 }, { x: 310, y: 150 },
  { x: 90, y: 220 }, { x: 190, y: 210 }, { x: 290, y: 250 },
  { x: 60, y: 150 }, { x: 250, y: 190 },
];
export function tableFor(tableNo: string): number {
  const n = Number(tableNo.replace(/\D/g, "")) || tableNo.length;
  return (n - 1 + TABLES.length * 4) % TABLES.length;
}
export function routeTo(i: number): [number, number][] {
  const t = TABLES[i] ?? TABLES[0]!;
  const corridorY = 70;
  return [[PASS_AT.x, PASS_AT.y], [PASS_AT.x, corridorY], [t.x, corridorY], [t.x, t.y - 22]];
}
// The lap: past the table, the runner goes round the room and comes back.
export function lapFrom(i: number): [number, number][] {
  const t = TABLES[i] ?? TABLES[0]!;
  return [[t.x, t.y - 22], [t.x + 40, t.y - 22], [ROOM.w - 20, t.y - 22], [ROOM.w - 20, ROOM.h - 20], [20, ROOM.h - 20], [20, t.y - 22], [t.x - 30, t.y - 22], [t.x, t.y - 22]];
}
export function along(points: [number, number][], f: number): { x: number; y: number } {
  const segs = points.slice(1).map((p, i) => { const q = points[i]!; return { a: q, b: p, len: Math.hypot(p[0] - q[0], p[1] - q[1]) }; });
  const total = segs.reduce((s, g) => s + g.len, 0);
  let d = Math.max(0, Math.min(1, f)) * total;
  for (const g of segs) {
    if (d <= g.len || g === segs[segs.length - 1]) {
      const k = g.len === 0 ? 0 : Math.min(1, d / g.len);
      return { x: g.a[0] + (g.b[0] - g.a[0]) * k, y: g.a[1] + (g.b[1] - g.a[1]) * k };
    }
    d -= g.len;
  }
  const last = points[points.length - 1]!;
  return { x: last[0], y: last[1] };
}
export const pathOf = (points: [number, number][]) => points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
