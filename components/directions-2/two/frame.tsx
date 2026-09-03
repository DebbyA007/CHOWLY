"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./bill.css";

const base = "/directions-2/two";

export function BillFrame({ children, progress = 1, state = "waiting" }: { children: React.ReactNode; progress?: number; state?: string }) {
  const pathname = usePathname();
  const tags = [
    { href: `${base}/menu`, label: "Guest", active: pathname.startsWith(`${base}/menu`) || pathname.startsWith(`${base}/order`) },
    { href: `${base}/waiter`, label: "House", active: pathname.startsWith(`${base}/waiter`) },
  ];
  return (
    <div className="bill relative min-h-dvh overflow-x-hidden" style={{ ["--p" as string]: progress.toFixed(3) }} data-state={state}>
      <header className="mx-auto max-w-2xl px-5 pt-4">
        <div className="rule-double flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5">
          <Link href={base} className="garamond text-lg italic">The Golden Gate</Link>
          <nav aria-label="Guest or house" className="flex items-center gap-3">
            {tags.map((t) => (
              <Link key={t.href} href={t.href} aria-current={t.active ? "page" : undefined} className="garamond text-[17px]" style={t.active ? { borderBottom: "2px solid var(--green)" } : undefined}>
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-1 text-[12px] italic text-[var(--ink-soft)]">Both sides are open to anyone; the words change the view, not who you are.</p>
      </header>
      {children}
    </div>
  );
}

// The candle in its glass. Wax burns down with progress, the pool grows, the flame sways.
export function Candle({ progress, out = false, size = 120 }: { progress: number; out?: boolean; size?: number }) {
  const waxTop = 78 - progress * 52;
  return (
    <svg viewBox="0 0 80 120" width={size * 0.66} height={size} aria-hidden="true">
      <rect x="14" y="30" width="52" height="84" rx="4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <ellipse className="pool" cx="40" cy="106" rx={12 + (1 - progress) * 12} ry={3 + (1 - progress) * 3} fill="var(--wax)" stroke="var(--ink)" strokeWidth="1" />
      <rect className="wax" x="30" y={waxTop} width="20" height={106 - waxTop} fill="var(--wax)" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="40" y1={waxTop} x2="40" y2={waxTop - 7} stroke="var(--ink)" strokeWidth="1.5" />
      {!out ? (
        <g className="flame" style={{ transformBox: "fill-box" }}>
          <path d={`M 40 ${waxTop - 22} C 47 ${waxTop - 14}, 46 ${waxTop - 7}, 40 ${waxTop - 6} C 34 ${waxTop - 7}, 33 ${waxTop - 14}, 40 ${waxTop - 22} Z`} fill="var(--flame)" stroke="var(--ink)" strokeWidth="1" />
        </g>
      ) : (
        <path d={`M 40 ${waxTop - 8} c 2 -4, -2 -8, 1 -12`} fill="none" stroke="var(--ink-soft)" strokeWidth="1" />
      )}
    </svg>
  );
}

export const BILL_PALETTE = {
  plate: "#f4efe4",
  rim: "#f4efe4",
  rice: "#f4efe4",
  tomato: "#f4efe4",
  green: "#f4efe4",
  meat: "#f4efe4",
  ochre: "#f4efe4",
  cream: "#f4efe4",
  glass: "#f4efe4",
  dark: "#f4efe4",
  crimson: "#f4efe4",
  white: "#f4efe4",
  line: "#1e1b18",
  craze: "#d9d1bf",
  second: "#2f5d3a",
} as const;
