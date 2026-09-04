"use client";

import Link from "next/link";

// The chrome every screen shares: the header block, the pill, the bottom tab bar.
// Text and simple dots only; no icons anywhere, by design.

export function Header({ title, subtitle, subtitleTone = "muted", pill, pillTone = "accent", back }: { title: string; subtitle?: string; subtitleTone?: "muted" | "late"; pill?: string; pillTone?: "accent" | "late" | "ring"; back?: { href: string; label: string } }) {
  const titleClass = back ? "serif text-[27px] leading-[1.05]" : "serif text-[25px] leading-[1.05]";
  const pillNode = pill ? <span className="pill" data-tone={pillTone === "late" ? "late" : undefined} style={pillTone === "ring" ? { color: "var(--ring-tone)", borderColor: "color-mix(in srgb, var(--ring-tone) 40%, transparent)", transition: "none" } : undefined}>{pill}</span> : null;
  if (back) {
    return (
      <header className="px-[22px] pb-4 pt-[14px]">
        <Link href={back.href} className="press block text-[11.5px] text-fg-muted">{back.label}</Link>
        <div className="mt-[7px] flex items-end justify-between gap-3">
          <h1 className={titleClass}>{title}</h1>
          {pillNode}
        </div>
      </header>
    );
  }
  return (
    <header className="flex items-end justify-between gap-3 px-[22px] pb-4 pt-[14px]">
      <div className="min-w-0">
        <h1 className={titleClass}>{title}</h1>
        {subtitle ? <p className={`tone mt-[5px] text-[11.5px] ${subtitleTone === "late" ? "font-semibold text-late" : "text-fg-muted"}`}>{subtitle}</p> : null}
      </div>
      {pillNode}
    </header>
  );
}

export type Tab = { href: string; label: string };
export const GUEST_TABS: Tab[] = [
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/pay", label: "Pay" },
];
export const WAITER_TABS: Tab[] = [
  { href: "/waiter", label: "Orders" },
  { href: "/waiter/tables", label: "Tables" },
  { href: "/waiter/menu", label: "Menu" },
];

export function TabBar({ tabs, active, tone = "accent", onHover }: { tabs: Tab[]; active: string; tone?: "accent" | "late" | "ring"; onHover?: (label: string) => void }) {
  const colour = tone === "ring" ? "var(--ring-tone)" : tone === "late" ? "var(--late)" : "var(--accent)";
  return (
    <nav aria-label="Sections" className="flex border-t border-[color:var(--hairline)] bg-bg pb-[26px] pt-[13px]">
      {tabs.map((tab) => {
        const on = tab.label === active;
        return (
          <Link key={tab.href} href={tab.href} aria-current={on ? "page" : undefined} onMouseEnter={() => onHover?.(tab.label)} onFocus={() => onHover?.(tab.label)} onTouchStart={() => onHover?.(tab.label)} className={`press tone flex-1 text-center text-[12px] leading-[1.2] ${on ? "font-semibold" : "text-fg-muted"}`} style={on ? { color: colour } : undefined}>
            {tab.label}
            {on ? <span className="tone mx-auto mt-[6px] block h-[5px] w-[5px] rounded-full" style={{ background: colour }} aria-hidden="true" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

// The fixed foot of a screen: an optional bar (the cart) above the tab bar.
export function Foot({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px]">{children}</div>;
}

export function Screen({ children, foot = 65 }: { children: React.ReactNode; foot?: number }) {
  return <main className="flex min-h-dvh flex-col" style={{ paddingBottom: foot }}>{children}</main>;
}

export function Chip({ on, children, onClick, className = "" }: { on: boolean; children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" className={`chip press ${className}`} aria-pressed={on} onClick={onClick}>{children}</button>;
}
