"use client";

import { useState, type FormEvent } from "react";
import { PunchHoles } from "./punch-rating";

type Props = {
  orderId: string;
  waitMinutes: number;
  lateBy: string;
  complaints: { id: string; description: string; createdAt: string }[];
  onSent: () => void;
};

// The complaint slip: a tear-off stub that prints on the ticket only once the lamp has
// been on past the promise, so the complaint is earned, and the server enforces the
// same rule. A punched score can go with it as its own request.
export function ComplaintSlip({ orderId, waitMinutes, lateBy, complaints, onSent }: Props) {
  const [description, setDescription] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (description.trim().length < 3) {
      setError("Say what went wrong in a few words, so the manager can act on it.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/complaints`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "The slip could not be sent. Try again.");
        return;
      }
      if (score !== null) {
        await fetch(`/api/orders/${orderId}/rating`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ score }) });
      }
      setSent(true);
      setDescription("");
      onSent();
    } catch {
      setError("The slip could not be sent. Check the connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="slip mt-6 border-t-2 border-dashed border-char-ink pt-4" aria-labelledby="slip-title">
      <div className="flex items-baseline justify-between">
        <h2 id="slip-title" className="text-base font-bold text-char-ink">
          COMPLAINT SLIP
        </h2>
        <span className="text-xs text-ink-soft">tear here</span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        The kitchen promised {waitMinutes} minutes and this ticket is {lateBy} past it. Tell the manager what went wrong; it prints on the rail.
      </p>
      {complaints.length > 0 ? (
        <ul className="mt-2 text-xs" aria-label="Slips sent">
          {complaints.map((complaint) => (
            <li key={complaint.id} className="flex gap-2">
              <span className="font-bold text-char-ink">SENT</span>
              <span className="text-ink-soft">{complaint.description}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {sent ? (
        <p className="mt-2 text-sm font-bold text-served-ink" aria-live="polite">
          Slip sent. It is on the rail.
        </p>
      ) : null}
      <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs font-bold">
          WHAT WENT WRONG
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={500} className="border-2 border-ink bg-paper px-2 py-1.5 text-sm font-normal" />
        </label>
        <div>
          <p className="mb-2 text-xs font-bold">PUNCH A SCORE TOO, IF YOU WANT</p>
          <PunchHoles value={score} onChange={setScore} name="Score with the slip" />
        </div>
        {error ? (
          <p role="alert" className="text-sm font-bold text-char-ink">
            {error}
          </p>
        ) : null}
        <div>
          <button type="submit" disabled={sending} className="stamp-button bg-char-ink px-3.5 py-2 text-sm text-paper">
            {sending ? "Sending" : "Send the slip"}
          </button>
        </div>
      </form>
    </section>
  );
}
