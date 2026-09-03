"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useStaffPin } from "../staff-pin";

// The waiter station asks for the staff PIN once per tab and checks it against the
// rail endpoint, which compares in constant time on the server. The PIN lives in memory
// only. Children render after a 200.
export function PinPlate({ children }: { children: ReactNode }) {
  const { pin, setPin } = useStaffPin();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  if (pin) return <>{children}</>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setError(null);
    try {
      const response = await fetch("/api/waiter/orders", { headers: { "x-staff-pin": draft } });
      if (response.status === 401) {
        setError("That PIN was not accepted. Check it with the manager and try again.");
        return;
      }
      if (!response.ok) {
        setError("The rail could not be reached. Check the connection and try again.");
        return;
      }
      setPin(draft);
    } catch {
      setError("The rail could not be reached. Check the connection and try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-md border-4 border-steel-dark bg-steel-light p-1" aria-labelledby="station-title">
      <div className="brass-plate px-5 py-3">
        <h1 id="station-title" className="display-print text-2xl">
          Waiter station
        </h1>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4 p-5" noValidate>
        <p className="text-sm text-paper/85">Enter the staff PIN to open the pass.</p>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-brass-light">
          STAFF PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            required
            minLength={4}
            maxLength={12}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "pin-error" : undefined}
            className="border-2 border-soot bg-paper px-3 py-2 text-xl tracking-[0.35em] text-ink tabular"
          />
        </label>
        {error ? (
          <p id="pin-error" role="alert" className="text-sm font-bold text-lamp-warm" style={{ color: "var(--lamp-warm)" }}>
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={checking} className="stamp-button bg-brass px-4 py-2.5 text-soot">
          {checking ? "Checking" : "Open the pass"}
        </button>
        <p className="text-xs text-paper/70">
          The PIN stays in this tab until you reload. It is the boundary for waiter actions; the tags above only change the view.
        </p>
      </form>
    </section>
  );
}
