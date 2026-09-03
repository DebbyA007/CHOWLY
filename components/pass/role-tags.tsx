"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The role switch: two tags hanging from the rail on rings. It changes the view and
// nothing else, because the assignment forbids logins; the waiter side asks for the
// staff PIN before it shows any order. The caption says so.
const roles = [
  { href: "/", label: "Customer" },
  { href: "/waiter", label: "Waiter" },
] as const;

export function RoleTags() {
  const pathname = usePathname();
  return (
    <nav aria-label="Role" className="flex flex-col items-end gap-2">
      <div className="flex gap-3">
        {roles.map((role) => {
          const active = role.href === "/" ? pathname === "/" || pathname.startsWith("/order") : pathname.startsWith(role.href);
          return (
            <Link
              key={role.href}
              href={role.href}
              aria-current={active ? "page" : undefined}
              className={`relative -mt-[3px] pb-2 pt-4 text-sm font-bold ${active ? "brass-plate" : "border-2 border-brass-dark bg-steel-dark text-brass-light"}`}
              style={{ paddingLeft: 14, paddingRight: 14 }}
            >
              <span className="absolute left-1/2 top-1 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-soot bg-steel" aria-hidden="true" />
              {role.label}
            </Link>
          );
        })}
      </div>
      <p className="max-w-[13.5rem] text-right text-[11px] leading-snug text-brass-light/80 sm:max-w-64">
        Demo switch: it changes the view, not who you are. The waiter side asks for the staff PIN.
      </p>
    </nav>
  );
}
