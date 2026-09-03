"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { RailOrder } from "./ticket";

export type Staff = {
  waiters: { id: string; name: string; shift: string }[];
  chefs: { id: string; name: string; specialty: string }[];
  bartenders: { id: string; name: string; specialty: string }[];
};

type Props = {
  order: RailOrder | null;
  staff: Staff;
  pin: string;
  onClose: () => void;
  onServed: (updated: RailOrder) => void;
};

// The waiter records who served, who cooked and who mixed, then the order is marked
// served. A native dialog, so focus is trapped and Escape closes it for free.
export function AssignDialog({ order, staff, pin, onClose, onServed }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (order && !dialog.open) dialog.showModal();
    if (!order && dialog.open) dialog.close();
  }, [order]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order.id}/assign`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-staff-pin": pin },
        body: JSON.stringify({
          waiterId: String(form.get("waiterId")),
          chefId: String(form.get("chefId")),
          bartenderId: String(form.get("bartenderId")),
        }),
      });
      const body = (await response.json().catch(() => null)) as (RailOrder & { error?: string }) | null;
      if (!response.ok || !body) {
        setError(body?.error ?? "The order could not be marked served. Try again.");
        return;
      }
      onServed(body);
    } catch {
      setError("The order could not be marked served. Check the connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="enamel speckle-chalk tray m-auto w-full max-w-md p-6 backdrop:bg-rim/70"
      aria-labelledby="assign-title"
    >
      {order ? (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <h2 id="assign-title" className="display-tight text-2xl">
              Serve {order.reference}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">Table {order.tableNo}. Record who served, cooked and mixed.</p>
          </div>
          {(
            [
              ["waiterId", "Waiter", staff.waiters],
              ["chefId", "Chef", staff.chefs],
              ["bartenderId", "Bartender", staff.bartenders],
            ] as const
          ).map(([name, label, people]) => (
            <label key={name} className="flex flex-col gap-1.5 text-sm font-medium">
              {label}
              <select name={name} required defaultValue="" className="stamp rim bg-chalk px-3 py-2 text-base font-normal">
                <option value="" disabled>
                  Choose
                </option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {error ? (
            <p role="alert" className="text-sm text-pepper">
              {error}
            </p>
          ) : null}
          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="stamp rim bg-chalk px-4 py-2.5 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="stamp bg-leaf px-4 py-2.5 font-medium text-chalk disabled:opacity-60">
              {saving ? "Marking" : "Mark served"}
            </button>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}
