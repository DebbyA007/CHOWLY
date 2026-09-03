"use client";

import { useState, type FormEvent } from "react";
import { ScoreRow } from "./score-row";

type Props = {
  orderId: string;
  current: { score: number; comment: string | null } | null;
  onSaved: () => void;
};

// One rating per order, one to five, changeable. Posts to the rating endpoint, which
// upserts on the unique orderId, so rating again changes the score.
export function RatingControl({ orderId, current, onSaved }: Props) {
  const [score, setScore] = useState<number | null>(current?.score ?? null);
  const [comment, setComment] = useState(current?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (score === null) {
      setError("Pick a score from 1 to 5 first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/rating`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(comment.trim() ? { score, comment: comment.trim() } : { score }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "The rating could not be saved. Try again.");
        return;
      }
      setSaved(score);
      onSaved();
    } catch {
      setError("The rating could not be saved. Check the connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 border-t border-rim/20 pt-6" aria-labelledby="rating-title">
      <h2 id="rating-title" className="display-tight text-xl">
        How was it?
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        {current ? `You rated this ${current.score} of 5. Change it below if you like.` : "Rate the order, on its own or with a complaint."}
      </p>
      <div className="mt-4">
        <ScoreRow value={score} onChange={setScore} name="Score" />
      </div>
      <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium">
        A word about it, if you want
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={300}
          className="stamp rim bg-chalk px-3 py-2 text-base font-normal"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-pepper">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex items-center gap-4">
        <button type="submit" disabled={saving} className="stamp bg-enamel-mid px-4 py-2.5 font-medium text-chalk disabled:opacity-60">
          {saving ? "Saving" : current ? "Change rating" : "Rate this order"}
        </button>
        {saved !== null ? (
          <span className="text-sm text-leaf" aria-live="polite">
            Rated {saved} of 5
          </span>
        ) : null}
      </div>
    </form>
  );
}
