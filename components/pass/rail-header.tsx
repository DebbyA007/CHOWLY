"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleTags } from "./role-tags";
import { SoundTag } from "./sound-tag";

// The brass rail runs across the top of every screen of The Pass. The art-direction
// walkthroughs under /directions-2 bring their own chrome, so it steps aside there.
export function RailHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/directions-2")) return null;
  return (
    <header className="relative">
      <div className="brass-bar h-[22px]" />
      {/* On a phone the tags wrap onto their own row under the plate. */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-start justify-between gap-x-6 gap-y-3 px-5 sm:px-8">
        <Link href="/" className="brass-plate display-print -mt-[3px] px-4 pb-2 pt-3 text-xl leading-none" aria-label="CHOWLY, back to the menu">
          CHOWLY
        </Link>
        <div className="ml-auto flex flex-wrap items-start justify-end gap-3">
          <SoundTag />
          <RoleTags />
        </div>
      </div>
    </header>
  );
}
