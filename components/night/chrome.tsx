"use client";

import Link from "next/link";
import { markTabPress } from "./arrival";
import { Lockup } from "./brand";
import { preloadMenu } from "./use-menu";
import { preloadRail } from "./use-rail";

// The chrome every screen shares: the header block, the pill, the bottom tab bar.
// Text and simple dots only; no icons anywhere, by design.

// The role switch: which view you are in, and one tap to the other. It sits at the top
// right of every screen except the landing, on both sides, opposite the lockup.
//
// It is a view switch and nothing more. There are no logins in this application, so it
// says Guest and Waiter and claims nothing about who is holding the phone.
//
// Instant by the same route the tab bar uses: a client-side Link, the destination's data
// warmed on hover, focus or touch, and markTabPress so the screen it opens renders in
// place instead of playing its entrance. The switch was slow once because it reloaded;
// this does not.
//
// The whole control takes exactly the lockup's height in layout, so the header does not
// grow: its own border is cancelled by a one pixel negative margin, and the tap target on
// the link half is cancelled the same way.
// The half that is a link carries the 44px target through padding cancelled by margin,
// the same trick the lockup uses.
export function RoleSwitch({ role }: { role: Role }) {
  const other = role === "guest" ? WAITER_VIEW : GUEST_VIEW;
  const here = role === "guest" ? GUEST_VIEW : WAITER_VIEW;
  return (
    <nav aria-label="View" className="role-switch -my-px flex shrink-0 items-center rounded-full" style={{ border: "1px solid var(--chip-border)" }} data-role-switch={role}>
      <span aria-current="page" className="rounded-full px-[11px] py-[3px] text-[11.5px] font-semibold leading-[1.1]" style={{ background: "var(--accent)", color: "var(--bg)" }} data-role-here>
        {here.label}
      </span>
      <Link
        href={other.href}
        onClick={markTabPress}
        onMouseEnter={other.warm}
        onFocus={other.warm}
        onTouchStart={other.warm}
        className="press -my-[11px] flex min-h-[44px] items-center px-[11px] py-[11px] text-[11.5px] leading-[1.15] text-fg-muted"
        data-role-to={other.role}
      >
        {other.label}
      </Link>
    </nav>
  );
}

export function Header({ title, subtitle, subtitleTone = "muted", pill, pillTone = "accent", back, onPill, role }: { title: string; subtitle?: string; subtitleTone?: "muted" | "late"; pill?: string; pillTone?: "accent" | "late" | "ring"; back?: { href: string; label: string }; onPill?: () => void; role?: Role }) {
  const titleClass = back ? "serif text-[27px] leading-[1.05]" : "serif text-[25px] leading-[1.05]";
  const pillStyle = pillTone === "ring" ? { color: "var(--ring-tone)", borderColor: "color-mix(in srgb, var(--ring-tone) 40%, transparent)", transition: "none" } : undefined;
  const pillNode = pill ? (onPill ? <button type="button" className="pill press" data-pill onClick={onPill} style={pillStyle}>{pill}</button> : <span className="pill" data-tone={pillTone === "late" ? "late" : undefined} style={pillStyle}>{pill}</span>) : null;
  if (back) {
    return (
      <header className="px-[22px] pb-4 pt-[14px]">
        {/* Three direct children rather than a wrapper: a wrapper does not pass its
            children's negative margins up, so the row grew by two pixels and the title
            with it. */}
        <div className="flex items-center justify-between gap-[10px]">
          <Link href={back.href} className="press block shrink-0 text-[11.5px] text-fg-muted">{back.label}</Link>
          {role ? <RoleSwitch role={role} /> : null}
          <Lockup />
        </div>
        <div className="mt-[1px] flex items-end justify-between gap-3">
          <h1 className={titleClass}>{title}</h1>
          {pillNode}
        </div>
      </header>
    );
  }
  return (
    <header className="px-[22px] pb-4 pt-[14px]">
      <div className="flex items-center justify-between gap-3">
        <Lockup />
        {role ? <RoleSwitch role={role} /> : null}
      </div>
      <div className="mt-[4px] flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className={titleClass}>{title}</h1>
          {subtitle ? <p className={`tone mt-[5px] text-[11.5px] ${subtitleTone === "late" ? "font-semibold text-late" : "text-fg-muted"}`}>{subtitle}</p> : null}
        </div>
        {pillNode}
      </div>
    </header>
  );
}

export type Tab = { href: string; label: string };
export type Role = "guest" | "waiter";
const GUEST_VIEW = { role: "guest" as const, label: "Guest", href: "/menu", warm: () => void preloadMenu() };
const WAITER_VIEW = { role: "waiter" as const, label: "Waiter", href: "/waiter", warm: () => void preloadRail() };

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
          <Link key={tab.href} href={tab.href} aria-current={on ? "page" : undefined} onClick={markTabPress} onMouseEnter={() => onHover?.(tab.label)} onFocus={() => onHover?.(tab.label)} onTouchStart={() => onHover?.(tab.label)} className={`press tone flex-1 text-center text-[12px] leading-[1.2] ${on ? "font-semibold" : "text-fg-muted"}`} style={on ? { color: colour } : undefined}>
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

// A chip is a pressed button by default. Inside a tablist it has to be a tab instead,
// or the group announces a list of toggles rather than one choice among several.
export function Chip({ on, children, onClick, className = "", tab = false, ...rest }: { on: boolean; children: React.ReactNode; onClick?: () => void; className?: string; tab?: boolean } & React.HTMLAttributes<HTMLButtonElement>) {
  const semantics = tab ? { role: "tab" as const, "aria-selected": on } : { "aria-pressed": on };
  return <button type="button" className={`chip press ${className}`} {...semantics} {...rest} onClick={onClick}>{children}</button>;
}
