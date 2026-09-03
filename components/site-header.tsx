import Link from "next/link";
import { RoleSwitch } from "./role-switch";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-start justify-between gap-6 px-5 py-5 sm:px-8">
      <Link href="/" className="display-tight text-2xl text-chalk">
        CHOWLY
      </Link>
      <RoleSwitch />
    </header>
  );
}
