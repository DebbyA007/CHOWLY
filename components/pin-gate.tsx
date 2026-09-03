"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useStaffPin } from "./staff-pin";

// Asks for the staff PIN once per tab and checks it against the rail endpoint, which is
// gated server-side with a constant-time compare. Children render only after the server
// has accepted the PIN, and the PIN is kept in memory for the requests that follow.
export function PinGate({ children }: { children: ReactNode }) {
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
    <section className="enamel speckle-chalk tray mx-auto w-full max-w-md p-6 sm:p-8">
      <h1 className="display-tight text-3xl">Waiter station</h1>
      <p className="mt-2 text-ink-soft">Enter the staff PIN to open the ticket rail.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Staff PIN
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
            className="stamp rim bg-chalk px-3 py-2 text-lg tabular tracking-[0.3em]"
          />
        </label>
        {error ? (
          <p id="pin-error" role="alert" className="text-sm text-pepper">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={checking}
          className="stamp bg-enamel-mid px-4 py-2.5 font-medium text-chalk disabled:opacity-60"
        >
          {checking ? "Checking" : "Open the rail"}
        </button>
      </form>
      <p className="mt-5 text-xs text-ink-soft">
        The PIN stays in this tab until you reload. It is the boundary for waiter actions; the role switch above only changes the view.
      </p>
    </section>
  );
}
