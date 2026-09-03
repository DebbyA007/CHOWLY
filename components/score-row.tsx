"use client";

// Five stamps, one to five. Low scores take pepper, the middle takes enamel, high scores
// take leaf, so the colour says what the number means.
type Props = {
  value: number | null;
  onChange: (score: number) => void;
  name: string;
};

export function ScoreRow({ value, onChange, name }: Props) {
  return (
    <div role="radiogroup" aria-label={name} className="flex gap-2">
      {[1, 2, 3, 4, 5].map((score) => {
        const selected = value !== null && score <= value;
        const tone = value === null ? "" : value <= 2 ? "bg-pepper text-chalk" : value === 3 ? "bg-enamel-mid text-chalk" : "bg-leaf text-chalk";
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            aria-label={`${score} of 5`}
            onClick={() => onChange(score)}
            className={`stamp rim tabular h-11 w-11 text-lg font-semibold ${selected ? tone : "bg-chalk text-ink"}`}
          >
            {score}
          </button>
        );
      })}
    </div>
  );
}
