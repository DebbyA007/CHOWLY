"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The role switch changes which view is shown. It is not a login and it grants nothing:
// the customer side is keyed to the session cookie, and the waiter side asks for the
// staff PIN before it shows any order. The assignment forbids logins, so this is the
// honest shape of a demo that has two roles.
const roles = [
  { href: "/", label: "Customer" },
  { href: "/waiter", label: "Waiter" },
] as const;

export function RoleSwitch() {
  const pathname = usePathname();
  return (
    <nav aria-label="Role" className="flex flex-col items-end gap-1.5">
      <div className="enamel stamp flex p-0.5">
        {roles.map((role) => {
          const active = role.href === "/" ? pathname === "/" || pathname.startsWith("/order") : pathname.startsWith(role.href);
          return (
            <Link
              key={role.href}
              href={role.href}
              aria-current={active ? "page" : undefined}
              className={`px-3.5 py-1.5 text-sm font-medium ${
                active ? "bg-enamel-mid text-chalk" : "text-ink hover:bg-ink/6"
              }`}
              style={{ borderRadius: "calc(var(--radius-button) - 2px)" }}
            >
              {role.label}
            </Link>
          );
        })}
      </div>
      <p className="max-w-64 text-right text-xs leading-snug text-chalk/70">
        Demo switch: it changes the view, not who you are. The waiter side asks for the staff PIN.
      </p>
    </nav>
  );
}
