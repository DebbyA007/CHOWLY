"use client";

import { useState, type FormEvent } from "react";
import { play } from "@/lib/sound";

// A rating punched into the ticket like a rail ticket: five holes, one to five. Punching
// a number punches every hole up to it. Posts to the rating endpoint, which upserts on
// the unique orderId, so punching again changes the score.
export function PunchHoles({ value, onChange, name }: { value: number | null; onChange: (score: number) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex gap-3">
      {[1, 2, 3, 4, 5].map((score) => {
        const punched = value !== null && score <= value;
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            aria-label={`${score} of 5`}
            onClick={() => {
              void play("spike");
              onChange(score);
            }}
            className={`tabular flex h-11 w-11 items-center justify-center rounded-full border-[3px] text-base font-bold ${punched ? "border-soot bg-steel text-paper" : "border-ink bg-paper text-ink"}`}
          >
            {score}
          </button>
        );
      })}
    </div>
  );
}

type Props = {
  orderId: string;
  current: { score: number; comment: string | null } | null;
  onSaved: () => void;
};

export function PunchRating({ orderId, current, onSaved }: Props) {
  const [score, setScore] = useState<number | null>(current?.score ?? null);
  const [comment, setComment] = useState(current?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (score === null) {
      setError("Punch a number from 1 to 5 first.");
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
        setError(body?.error ?? "The punch did not take. Try again.");
        return;
      }
      setSaved(score);
      onSaved();
    } catch {
      setError("The punch did not take. Check the connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 border-t-2 border-dashed border-ink pt-4" aria-labelledby="rating-title">
      <h2 id="rating-title" className="text-base font-bold">
        HOW WAS IT
      </h2>
      <p className="mt-1 text-xs text-ink-soft">
        {current ? `Punched ${current.score} of 5. Punch again to change it.` : "Punch a number. On its own, or with a complaint slip."}
      </p>
      <div className="mt-3">
        <PunchHoles value={score} onChange={setScore} name="Score" />
      </div>
      <label className="mt-3 flex flex-col gap-1 text-xs font-bold">
        NOTE FOR THE KITCHEN
        <input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={300} className="border-2 border-ink bg-paper px-2 py-1.5 text-sm font-normal" />
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-bold text-char-ink">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex items-center gap-4">
        <button type="submit" disabled={saving} className="stamp-button bg-paper px-3.5 py-2 text-sm text-ink">
          {saving ? "Punching" : current ? "Punch it again" : "Punch it in"}
        </button>
        {saved !== null ? (
          <span className={`text-sm font-bold ${saved <= 2 ? "text-char-ink" : "text-served-ink"}`} aria-live="polite">
            Punched {saved} of 5
          </span>
        ) : null}
      </div>
    </form>
  );
}
