"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./glaze.css";
import { SoundTag } from "@/components/pass/sound-tag";

const base = "/directions-2/three";

export function GlazeFrame({ children, progress = 1, state = "waiting" }: { children: React.ReactNode; progress?: number; state?: string }) {
  const pathname = usePathname();
  const tags = [
    { href: `${base}/menu`, label: "Seated", active: pathname.startsWith(`${base}/menu`) || pathname.startsWith(`${base}/order`) },
    { href: `${base}/waiter`, label: "The floor", active: pathname.startsWith(`${base}/waiter`) },
  ];
  return (
    <div className="glaze relative min-h-dvh overflow-x-hidden" style={{ ["--p" as string]: progress.toFixed(3) }} data-state={state}>
      <header className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 pt-4">
        <Link href={base} className="news text-lg">The Golden Gate</Link>
        <nav aria-label="Seated or the floor" className="flex items-center gap-2">
          {tags.map((t) => (
            <Link key={t.href} href={t.href} aria-current={t.active ? "page" : undefined} className="rounded-full border-[1.5px] border-[var(--ink)] px-3 py-1 text-[13px] font-bold" style={{ background: t.active ? "var(--ink)" : "var(--white)", color: t.active ? "var(--white)" : "var(--ink)" }}>
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

export const GLAZE_PALETTE = {
  plate: "#faf8f2",
  rim: "#efeae0",
  rice: "#f3ebd6",
  tomato: "#c25a3c",
  green: "#6e8f6c",
  meat: "#8a5a3a",
  ochre: "#c98b2c",
  cream: "#efe3c6",
  glass: "#9eb9ba",
  dark: "#3c3d40",
  crimson: "#8b2a3a",
  white: "#faf8f2",
  line: "#2a2b2e",
  craze: "#d6d1c6",
  second: "#3d7a78",
} as const;
