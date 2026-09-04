"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "./pass.css";
import type { DishPalette } from "@/components/walkthrough/dishes";
import { preloadMenu } from "@/components/walkthrough/use-menu";
import { preloadRail } from "@/components/walkthrough/use-rail";

export const base = "/directions-3/one";

// The wooden rail across the top of every screen, the name on a ceramic sign, and two
// paper tags hanging from the rail: the role switch. The tags preload the other side's
// data before they are pressed, so the switch shows the other side at once.
export function PassFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    preloadMenu();
    preloadRail();
  }, []);
  const customer = pathname.startsWith(`${base}/menu`) || pathname.startsWith(`${base}/order`);
  const waiter = pathname.startsWith(`${base}/waiter`);
  return (
    <div className="pass3 relative min-h-dvh overflow-x-hidden">
      <header className="relative z-10">
        <div className="rail3 h-[18px]" />
        <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4 px-4 sm:px-8">
          <Link href={base} className="sign3 display-print -mt-[2px] px-3 pb-1.5 pt-2 text-lg leading-none" aria-label="CHOWLY, front door">
            CHOWLY
          </Link>
          <nav aria-label="Role" className="flex gap-2">
            <Link href={`${base}/menu`} data-role="customer" className="tag3" aria-current={customer ? "page" : undefined} onMouseEnter={preloadMenu} onFocus={preloadMenu} onTouchStart={preloadMenu}>
              Customer
            </Link>
            <Link href={`${base}/waiter`} data-role="waiter" className="tag3" aria-current={waiter ? "page" : undefined} onMouseEnter={preloadRail} onFocus={preloadRail} onTouchStart={preloadRail}>
              Waiter
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

// A wooden peg holding a ticket to the rail. Replaces the spike.
export function Peg({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="26" height="40" viewBox="0 0 26 40" aria-hidden="true">
      <rect x="9" y="0" width="8" height="34" rx="2" fill="var(--wood-light)" stroke="var(--wood-dark)" strokeWidth="1.5" />
      <rect x="4" y="6" width="18" height="6" rx="1.5" fill="var(--soot)" />
      <line x1="13" y1="12" x2="13" y2="30" stroke="var(--wood-dark)" strokeWidth="1" />
    </svg>
  );
}

// Gouache on a ceramic plate: the food, painted, the way the card at the pass would be.
export const PASS_PALETTE: DishPalette = {
  plate: "#f5f0e4",
  rim: "#e6dcc7",
  rice: "#efd9a6",
  tomato: "#c8542f",
  green: "#5e7a3c",
  meat: "#8a5636",
  ochre: "#d3922c",
  cream: "#f1e3c0",
  glass: "#a9c3c6",
  dark: "#3b322b",
  crimson: "#8e2a3b",
  white: "#faf6ec",
  line: "#2a2622",
  craze: "#d6cdb8",
  second: "#2a2622",
};
