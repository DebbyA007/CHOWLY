"use client";

import { useState, type FormEvent } from "react";
import { ScoreRow } from "./score-row";

type Props = {
  orderId: string;
  waitMinutes: number;
  lateBy: string;
  complaints: { id: string; description: string; createdAt: string }[];
  onSent: () => void;
};

// The complaint entry point. It only renders once the ring has crossed into delay, so
// the complaint is earned, and the server enforces the same rule. A score can go with
// it; the rating endpoint takes it as its own request so the two stay independent.
export function ComplaintForm({ orderId, waitMinutes, lateBy, complaints, onSent }: Props) {
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
        setError(body?.error ?? "The complaint could not be sent. Try again.");
        return;
      }
      if (score !== null) {
        await fetch(`/api/orders/${orderId}/rating`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ score }),
        });
      }
      setSent(true);
      setDescription("");
      onSent();
    } catch {
      setError("The complaint could not be sent. Check the connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-8 border-t border-pepper/40 pt-6" aria-labelledby="complaint-title">
      <h2 id="complaint-title" className="display-tight text-xl text-pepper">
        Running late
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        The kitchen promised {waitMinutes} minutes and this order is {lateBy} past it. Tell the manager what went wrong; it shows on the rail.
      </p>
      {complaints.length > 0 ? (
        <ul className="mt-3 text-sm text-ink-soft" aria-label="Complaints sent">
          {complaints.map((complaint) => (
            <li key={complaint.id} className="flex gap-2">
              <span className="text-pepper">Sent</span>
              <span>{complaint.description}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {sent ? (
        <p className="mt-3 text-sm text-leaf" aria-live="polite">
          Complaint sent. The manager sees it on the rail.
        </p>
      ) : null}
      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          What went wrong
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={500}
            className="stamp rim bg-chalk px-3 py-2 text-base font-normal"
          />
        </label>
        <div>
          <p className="mb-2 text-sm font-medium">Score it too, if you want</p>
          <ScoreRow value={score} onChange={setScore} name="Score with the complaint" />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-pepper">
            {error}
          </p>
        ) : null}
        <div>
          <button type="submit" disabled={sending} className="stamp bg-pepper px-4 py-2.5 font-medium text-chalk disabled:opacity-60">
            {sending ? "Sending" : "Send complaint"}
          </button>
        </div>
      </form>
    </section>
  );
}
