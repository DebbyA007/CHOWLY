"use client";

import { PASS_AT, ROOM, TABLES, along, lapFrom, pathOf, routeTo } from "./frame";

export type Run = { id: string; reference: string; table: number; f: number; lap: number; state: "waiting" | "late" | "served" | "paid"; mine?: boolean };

// The room drawn in chalk on the mat: the pass, eight tables, and every run in
// progress. A run is a runner on the route from the pass to its table; past the
// promise the runner is on a lap round the room, and the lap count says how far past.
export function Room({ runs, tableNo, className = "" }: { runs: Run[]; tableNo?: string; className?: string }) {
  return (
    <svg viewBox={`0 0 ${ROOM.w} ${ROOM.h}`} className={className} role="img" aria-label="The room, with every run on the floor">
      <rect x="8" y="8" width={ROOM.w - 16} height={ROOM.h - 16} fill="none" stroke="var(--chalk)" strokeWidth="2" strokeDasharray="6 5" />
      <g>
        <rect x={PASS_AT.x - 32} y={PASS_AT.y - 22} width="64" height="24" fill="var(--lacquer)" stroke="var(--lacquer-dark)" strokeWidth="2" />
        <text x={PASS_AT.x} y={PASS_AT.y - 6} textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--chalk)" fontFamily="var(--font-syne), Syne, sans-serif">PASS</text>
      </g>
      {runs.map((run) => (
        <g key={`route-${run.id}`}>
          <path d={pathOf(routeTo(run.table))} fill="none" stroke="var(--chalk)" strokeWidth={run.mine ? 3 : 1.5} strokeDasharray="4 4" opacity={run.mine ? 1 : 0.55} />
          {run.state === "late" ? <path d={pathOf(lapFrom(run.table))} fill="none" stroke="var(--red)" strokeWidth={run.mine ? 2.5 : 1.5} strokeDasharray="3 5" opacity={0.8} /> : null}
        </g>
      ))}
      {TABLES.map((t, i) => {
        const here = runs.filter((r) => r.table === i);
        const mine = here.some((r) => r.mine);
        const label = mine && tableNo ? tableNo : String(i + 1);
        return (
          <g key={i}>
            <circle cx={t.x} cy={t.y} r={mine ? 20 : 16} fill={mine ? "var(--mustard)" : "var(--chalk)"} stroke="var(--ink)" strokeWidth="2" />
            <text x={t.x} y={t.y + 4} textAnchor="middle" fontSize={mine ? 12 : 10} fontWeight="800" fill="var(--ink)" fontFamily="var(--font-syne), Syne, sans-serif">{label}</text>
            {here.filter((r) => r.state === "served").map((r, k) => <circle key={r.id} cx={t.x + 14 + k * 4} cy={t.y - 14} r="6" fill="var(--clay)" stroke="var(--clay-dark)" strokeWidth="1.5" />)}
          </g>
        );
      })}
      {runs.filter((r) => r.state === "waiting" || r.state === "late").map((run) => {
        const p = run.state === "late" ? along(lapFrom(run.table), run.f) : along(routeTo(run.table), run.f);
        return (
          <g key={`runner-${run.id}`} className="runner" style={{ transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)` }}>
            <circle r={run.mine ? 11 : 8} fill="var(--mustard)" stroke="var(--ink)" strokeWidth="2" />
            <circle r={run.mine ? 5 : 3.5} fill="var(--clay)" stroke="var(--clay-dark)" strokeWidth="1" />
            {!run.mine ? <text y="-12" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--ink)">{run.reference.replace("CHW-", "")}</text> : null}
          </g>
        );
      })}
    </svg>
  );
}

// Where a run is, from elapsed and promised seconds. Position is the clock.
export function runPosition(elapsed: number, promised: number, state: Run["state"], reduce: boolean): { f: number; lap: number } {
  if (promised <= 0) return { f: 0, lap: 1 };
  if (state === "served" || state === "paid") return { f: 1, lap: 1 };
  if (state === "late") {
    const over = elapsed - promised;
    const raw = (over % promised) / promised;
    return { f: reduce ? Math.floor(raw * 4) / 4 : raw, lap: Math.floor(over / promised) + 2 };
  }
  const raw = Math.min(1, elapsed / promised);
  return { f: reduce ? Math.floor(raw * 4) / 4 : raw, lap: 1 };
}
