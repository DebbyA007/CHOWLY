"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { RailOrder } from "./spike-ticket";

export type Staff = {
  waiters: { id: string; name: string; shift: string }[];
  chefs: { id: string; name: string; specialty: string }[];
  bartenders: { id: string; name: string; specialty: string }[];
};

type Props = {
  order: RailOrder | null;
  staff: Staff;
  onClose: () => void;
  onServed: (updated: RailOrder) => void;
};

// The waiter records who served, who cooked and who mixed, then the ticket comes off
// the pass. A native dialog on a steel panel: focus is trapped and Escape closes it.
export function ServeDialog({ order, staff, onClose, onServed }: Props) {
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
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ waiterId: String(form.get("waiterId")), chefId: String(form.get("chefId")), bartenderId: String(form.get("bartenderId")) }),
      });
      const body = (await response.json().catch(() => null)) as (RailOrder & { error?: string }) | null;
      if (!response.ok || !body) {
        setError(body?.error ?? "The ticket could not be marked served. Try again.");
        return;
      }
      onServed(body);
    } catch {
      setError("The ticket could not be marked served. Check the connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-full max-w-md border-4 border-steel-dark bg-steel-light p-1 text-paper backdrop:bg-soot/80" aria-labelledby="serve-title">
      {order ? (
        <form onSubmit={submit} className="flex flex-col">
          <div className="brass-plate px-5 py-3">
            <h2 id="serve-title" className="display-print text-2xl">
              Serve {order.reference}
            </h2>
            <p className="mt-0.5 text-xs">Table {order.tableNo}. Record who served, cooked and mixed.</p>
          </div>
          <div className="flex flex-col gap-4 p-5">
            {(
              [
                ["waiterId", "WAITER", staff.waiters],
                ["chefId", "CHEF", staff.chefs],
                ["bartenderId", "BARTENDER", staff.bartenders],
              ] as const
            ).map(([name, label, people]) => (
              <label key={name} className="flex flex-col gap-1.5 text-xs font-bold text-brass-light">
                {label}
                <select name={name} required defaultValue="" className="border-2 border-soot bg-paper px-3 py-2 text-base font-normal text-ink">
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
              <p role="alert" className="text-sm font-bold" style={{ color: "var(--lamp-warm)" }}>
                {error}
              </p>
            ) : null}
            <div className="mt-1 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="stamp-button bg-paper px-4 py-2.5 text-ink">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="stamp-button bg-served-ink px-4 py-2.5 text-paper">
                {saving ? "Marking" : "Mark served"}
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}
