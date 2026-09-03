"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./linen.css";
import { SoundTag } from "@/components/pass/sound-tag";

const base = "/directions-2/one";

// The chrome of the linen world: a small woven label at the top, the two sides of the
// table as stitched tags, and the sound tag. Everything sits on the cloth.
export function LinenFrame({ children, progress = 1, state = "waiting" }: { children: React.ReactNode; progress?: number; state?: string }) {
  const pathname = usePathname();
  const tags = [
    { href: `${base}/menu`, label: "At the table", active: pathname.startsWith(`${base}/menu`) || pathname.startsWith(`${base}/order`) },
    { href: `${base}/waiter`, label: "On the floor", active: pathname.startsWith(`${base}/waiter`) },
  ];
  return (
    <div className="linen relative min-h-dvh overflow-x-hidden" style={{ ["--p" as string]: progress.toFixed(3) }} data-state={state}>
      <header className="relative z-10 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 pt-4">
        <Link href={base} className="serif text-lg italic">
          The Golden Gate
        </Link>
        <nav aria-label="Side of the table" className="flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <Link key={t.href} href={t.href} aria-current={t.active ? "page" : undefined} className={`stitched rounded-full px-3 py-1 text-[13px] font-bold ${t.active ? "bg-[#2b2a28] text-[#fffdf8]" : ""}`} style={t.active ? { background: "var(--ink)", color: "#fffdf8" } : undefined}>
              {t.label}
            </Link>
          ))}
          <span className="scale-90"><SoundTag /></span>
        </nav>
        <p className="basis-full text-[11px] text-[var(--ink-soft)]">Both sides are open to anyone. The tags change the view, not who you are.</p>
      </header>
      {children}
    </div>
  );
}

export const LINEN_PALETTE = {
  plate: "#fffdf8",
  rim: "#efe9dc",
  rice: "#f2e8d0",
  tomato: "#c8553d",
  green: "#6b7a4c",
  meat: "#8b5a2b",
  ochre: "#d9a441",
  cream: "#f3ead3",
  glass: "#9fb7b5",
  dark: "#3f3a33",
  crimson: "#8e1b2e",
  white: "#fffdf8",
  line: "#2b2a28",
  craze: "#dcd6c7",
  second: "#6b7a4c",
} as const;
