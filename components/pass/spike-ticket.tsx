"use client";

import type { SerializedOrder } from "@/lib/orders";
import { clock, computeHeat } from "./heat";
import { Lamp } from "./lamp";

export type RailOrder = SerializedOrder;

type Props = {
  order: RailOrder;
  now: number;
  reduce: boolean;
  onServe?: (order: RailOrder) => void;
};

// A ticket on the rail, under its own small lamp, taking its own heat: a ticket that
// has hung past its promise sits under a cooler, dimmer light on aged paper. The pepper
// of the old design is gone; lateness is told by the light, a plus sign and a count.
export function SpikeTicket({ order, now, reduce, onServe }: Props) {
  const { state, heat, reach, elapsedSeconds, promisedSeconds } = computeHeat(order.status, order.placedAt, order.waitMinutes, now, reduce);
  const placed = order.status === "PLACED";
  return (
    <div className="heat relative w-[300px] shrink-0 pt-[118px]" style={{ ["--heat" as string]: heat.toFixed(3) }} data-state={state}>
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2" aria-hidden="true">
        <Lamp seed={Number(order.id.replace(/\D/g, "").slice(-3) || 1) + 3} width={150} reach={reach} />
      </div>
      <article className="ticket-paper paper torn-bottom relative px-4 pt-7" aria-label={`Order ${order.reference}, table ${order.tableNo}`}>
        <svg className="absolute left-1/2 top-1 -translate-x-1/2" width="22" height="30" viewBox="0 0 22 30" aria-hidden="true">
          <circle cx="11" cy="11" r="5" fill="var(--steel)" stroke="var(--ink)" strokeWidth="2" />
          <rect x="9.5" y="0" width="3" height="22" fill="var(--brass)" stroke="var(--brass-dark)" strokeWidth="1" />
        </svg>
        <div className="flex items-baseline justify-between gap-2 border-b-2 border-dashed border-ink pb-1.5">
          <h3 className="display-print text-xl">{order.reference}</h3>
          <span className="text-xs font-bold">TABLE {order.tableNo}</span>
        </div>
        <ul className="mt-2 text-sm">
          {order.items.map((line) => (
            <li key={line.id} className="flex justify-between gap-2">
              <span>{line.name}</span>
              <span className="tabular font-bold text-char-ink">x{line.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t-2 border-dashed border-ink pt-2 text-xs">
          {placed ? (
            <span className="tabular">
              {state === "late" ? (
                <>
                  <span className="font-bold text-char-ink">+{clock(elapsedSeconds - promisedSeconds)}</span> past {order.waitMinutes}&apos;
                </>
              ) : (
                <>
                  {clock(Math.max(0, promisedSeconds - elapsedSeconds))} of {order.waitMinutes}&apos;
                </>
              )}
            </span>
          ) : (
            <span className="text-ink-soft">
              Served by {order.staff.waiter?.name ?? "the floor"}
              {order.staff.chef ? `, cooked by ${order.staff.chef.name}` : ""}
            </span>
          )}
          {order.complaints.length > 0 ? <span className="font-bold text-char-ink">{order.complaints.length === 1 ? "1 SLIP" : `${order.complaints.length} SLIPS`}</span> : null}
        </div>
        {placed && onServe ? (
          <button type="button" onClick={() => onServe(order)} className="stamp-button mt-3 w-full bg-served-ink px-3 py-2 text-sm text-paper">
            Mark served
          </button>
        ) : null}
      </article>
    </div>
  );
}
