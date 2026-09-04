"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { RoomPhoto } from "./photo";
import { readTable, writeTable } from "./table";
import { preloadMenu } from "./use-menu";
import { preloadMine } from "./use-order";
import { preloadRail } from "./use-rail";

// Screen 1. The dining room across the top, the name, the address, and the two ways
// in pushed to the bottom. The menu, the guest's orders and the live list are all
// preloaded here so either button opens onto a screen that is already there.
export function Landing() {
  const root = useRef<HTMLElement>(null);
  const [table, setTable] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [needTable, setNeedTable] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const known = table.trim().length > 0 && !editing;
  function keep() {
    const value = draft.trim();
    if (!/^[A-Za-z0-9-]{1,8}$/.test(value)) {
      setNeedTable(true);
      field.current?.focus();
      return false;
    }
    writeTable(value);
    setTable(value);
    setEditing(false);
    setNeedTable(false);
    return true;
  }
  useEffect(() => {
    setTable(readTable());
    preloadMenu();
    preloadMine();
    preloadRail();
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".room", ".name", ".address", ".door", ".table"];
      if (self?.matches.reduceMotion) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      createTimeline({ defaults: { ease: "outQuart" } })
        .add(".room", { opacity: [0, 1], duration: 700 }, 0)
        .add(".name", { opacity: [0, 1], y: [10, 0], duration: 600 }, 250)
        .add(".address", { opacity: [0, 1], duration: 400 }, "-=300")
        .add(".door", { opacity: [0, 1], y: [12, 0], duration: 450, delay: stagger(90) }, "-=200")
        .add(".door", { opacity: 1, duration: 1 }, "-=1");
      if (root.current?.querySelector(".table")) animate(".table", { opacity: [0, 1], duration: 300, delay: 900 });
    });
    return () => scope.revert();
  }, []);
  return (
    <main ref={root} className="flex min-h-dvh flex-col">
      <div className="room shrink-0" style={{ opacity: 0 }}>
        <RoomPhoto src="/photos/room.jpg" alt="The dining room at The Golden Gate in the evening" />
      </div>
      <div className="flex flex-1 flex-col px-[26px] pb-8 pt-9">
        <h1 className="name serif text-[44px] leading-none tracking-[-0.015em]" style={{ opacity: 0 }}>
          The Golden
          <br />
          Gate
        </h1>
        <p className="address mt-3 text-[12.5px] leading-[1.6] tracking-[0.01em] text-fg-muted" style={{ opacity: 0 }}>
          13 Ubah Street, Berger, Lagos
        </p>
        <div className="flex-1" />
        <div className="flex flex-col gap-[11px]">
          <Link href="/menu" className="door btn-primary press" style={{ opacity: 0 }} onMouseEnter={preloadMenu} onFocus={preloadMenu} onTouchStart={preloadMenu} onClick={(e) => { if (!known && !keep()) e.preventDefault(); }} data-enter="guest">
            I&apos;m a guest
          </Link>
          <Link href="/waiter" className="door btn-outline press" style={{ opacity: 0 }} onMouseEnter={preloadRail} onFocus={preloadRail} onTouchStart={preloadRail}>
            I&apos;m a waiter
          </Link>
        </div>
        <div className="table mt-[18px]" style={{ opacity: 0 }}>
          {known ? (
            <p className="text-center text-[12px] text-fg-muted">
              You&apos;re at table {table}
              <button type="button" data-change-table onClick={() => { setDraft(table); setEditing(true); window.setTimeout(() => field.current?.focus(), 0); }} className="press ml-2 underline">Change</button>
            </p>
          ) : (
            <form className="flex items-center justify-center gap-3" onSubmit={(e) => { e.preventDefault(); keep(); }} noValidate>
              <label htmlFor="table-number" className="text-[12px] text-fg-muted">Your table</label>
              <input id="table-number" ref={field} value={draft} onChange={(e) => { setDraft(e.target.value); setNeedTable(false); }} inputMode="numeric" maxLength={8} placeholder="12" aria-label="Table number" aria-invalid={needTable || undefined} className="tabular w-[72px] rounded-full border bg-transparent px-3 py-2 text-center text-[14px] text-fg placeholder:text-fg-muted" style={{ borderColor: needTable ? "var(--late)" : "var(--chip-border)" }} />
              <button type="submit" className="chip press !py-2 !text-[12.5px]" data-keep-table>Keep</button>
            </form>
          )}
          {needTable ? <p role="alert" className="mt-2 text-center text-[12px] font-semibold text-late">Enter the number on the card on your table.</p> : <p className="mt-2 text-center text-[11.5px] text-fg-muted">{known ? "" : "It is on the card on your table."}</p>}
        </div>
      </div>
    </main>
  );
}
