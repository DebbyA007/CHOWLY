"use client";

import type { SerializedOrder } from "@/lib/orders";

export type RailOrder = SerializedOrder;

type Props = {
  order: RailOrder;
  now: number;
  onServe?: (order: RailOrder) => void;
};

function minutesBetween(from: string, to: number): number {
  return Math.max(0, Math.round((to - new Date(from).getTime()) / 60_000));
}

// A printed ticket on the rail: paper radius, a perforated top edge, the reference and
// table, the lines, and how the promised wait is going. The pepper tag is the derived
// delay, never a stored one.
export function Ticket({ order, now, onServe }: Props) {
  const elapsed = minutesBetween(order.placedAt, now);
  const placed = order.status === "PLACED";
  return (
    <article
      className="ticket-paper speckle-chalk relative p-4 text-ink"
      style={{
        borderRadius: "var(--radius-ticket)",
        border: "var(--rim-width) solid var(--rim)",
        borderTopStyle: "dashed",
      }}
      aria-label={`Order ${order.reference}, table ${order.tableNo}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="display-tight text-xl">{order.reference}</h3>
        <span className="text-sm text-ink-soft">Table {order.tableNo}</span>
      </div>
      <ul className="mt-2 text-sm">
        {order.items.map((line) => (
          <li key={line.id} className="flex justify-between gap-3">
            <span>{line.name}</span>
            <span className="tabular text-ink-soft">x{line.quantity}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        {placed ? (
          <span className="tabular text-ink-soft">
            {elapsed} of {order.waitMinutes} min
          </span>
        ) : (
          <span className="text-ink-soft">
            Served by {order.staff.waiter?.name ?? "the floor"}
            {order.staff.chef ? `, cooked by ${order.staff.chef.name}` : ""}
          </span>
        )}
        {order.isDelayed ? (
          <span className="stamp bg-pepper px-2 py-0.5 text-xs font-medium text-chalk">Late</span>
        ) : null}
        {order.complaints.length > 0 ? (
          <span className="stamp rim bg-chalk px-2 py-0.5 text-xs font-medium text-pepper">
            {order.complaints.length === 1 ? "1 complaint" : `${order.complaints.length} complaints`}
          </span>
        ) : null}
      </div>
      {placed && onServe ? (
        <button
          type="button"
          onClick={() => onServe(order)}
          className="stamp mt-3 w-full bg-enamel-mid px-3 py-2 text-sm font-medium text-chalk"
        >
          Mark served
        </button>
      ) : null}
    </article>
  );
}
