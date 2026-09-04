import Link from "next/link";
import { RoleTags } from "./role-tags";

// The brass rail runs across the top of every screen. The name hangs from it on a
// brass plate; the role tags hang beside it.
export function RailHeader() {
  return (
    <header className="relative">
      <div className="brass-bar h-[22px]" />
      {/* On a phone the tags wrap onto their own row under the plate. */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-start justify-between gap-x-6 gap-y-3 px-5 sm:px-8">
        <Link href="/" className="brass-plate display-print -mt-[3px] px-4 pb-2 pt-3 text-xl leading-none" aria-label="CHOWLY, back to the menu">
          CHOWLY
        </Link>
        <div className="ml-auto flex flex-wrap items-start justify-end gap-3">
          <RoleTags />
        </div>
      </div>
    </header>
  );
}
