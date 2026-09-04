"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, createScope, createTimeline, stagger, utils } from "animejs";
import { RoomPhoto } from "./photo";
import { firstVisit } from "./once";
import { readTable } from "./table";
import { preloadMenu } from "./use-menu";
import { preloadMine } from "./use-order";
import { preloadRail } from "./use-rail";

// Screen 1. The dining room across the top, the name, the address, and the two ways
// in pushed to the bottom. The menu, the guest's orders and the live list are all
// preloaded here so either button opens onto a screen that is already there.
export function Landing() {
  const root = useRef<HTMLElement>(null);
  const [table, setTable] = useState("");
  useEffect(() => {
    setTable(readTable());
    preloadMenu();
    preloadMine();
    preloadRail();
    const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
      const all = [".room", ".name", ".address", ".door", ".table"];
      if (self?.matches.reduceMotion || !firstVisit("landing")) {
        animate(all, { opacity: [0, 1], duration: 200 });
        return;
      }
      utils.set(all, { opacity: 1 });
      createTimeline({ defaults: { ease: "outQuart" } })
        .add(".room", { opacity: [0, 1], duration: 700 }, 0)
        .add(".name", { opacity: [0, 1], y: [10, 0], duration: 600 }, 250)
        .add(".address", { opacity: [0, 1], duration: 400 }, "-=300")
        .add(".door", { opacity: [0, 1], y: [12, 0], duration: 450, delay: stagger(90) }, "-=200")
        .add(".table", { opacity: [0, 1], duration: 300 }, "-=200");
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
          <Link href="/menu" className="door btn-primary press" style={{ opacity: 0 }} onMouseEnter={preloadMenu} onFocus={preloadMenu} onTouchStart={preloadMenu}>
            I&apos;m a guest
          </Link>
          <Link href="/waiter" className="door btn-outline press" style={{ opacity: 0 }} onMouseEnter={preloadRail} onFocus={preloadRail} onTouchStart={preloadRail}>
            I&apos;m a waiter
          </Link>
        </div>
        {table ? (
          <p className="table mt-[18px] text-center text-[12px] text-fg-muted" style={{ opacity: 0 }}>
            You&apos;re at table {table}
          </p>
        ) : null}
      </div>
    </main>
  );
}
