"use client";

// The demo control. Rendered only by the walkthrough routes under /directions-2 and
// /directions-3, and
// refused by the server unless DEMO_CONTROLS is exactly true, so it cannot be reached
// from the real customer flow or from production. Labelled as what it is.
export function DemoControls({ waitMinutes, busy, onFastForward }: { waitMinutes: number; busy: boolean; onFastForward: (minutes: number) => void }) {
  return (
    <aside
      aria-label="Demo control"
      className="fixed bottom-3 right-3 z-40 border-2 border-dashed border-[#2b2a28] bg-[#fff7d6] px-3 py-2 text-[12px] leading-snug text-[#2b2a28]"
      style={{ fontFamily: "ui-monospace, Menlo, monospace", maxWidth: 220 }}
    >
      <p className="font-bold">Demo control, walkthrough only.</p>
      <p>Moves this order&apos;s clock so the late state shows in seconds. Not part of the product.</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <button type="button" disabled={busy} onClick={() => onFastForward(Math.max(1, Math.round(waitMinutes * 0.6)))} className="border-2 border-[#2b2a28] bg-white px-2 py-1 font-bold disabled:opacity-50">
          Skip ahead
        </button>
        <button type="button" disabled={busy} onClick={() => onFastForward(waitMinutes + 5)} className="border-2 border-[#2b2a28] bg-white px-2 py-1 font-bold disabled:opacity-50">
          Make it late
        </button>
      </div>
    </aside>
  );
}
