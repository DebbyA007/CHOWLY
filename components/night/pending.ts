"use client";

import { useSyncExternalStore } from "react";
import { mutate } from "swr";
import type { SerializedOrder } from "@/lib/orders";
import { MINE_KEY } from "./keys";
import { selectOrder } from "./selection";

// Placing is answered at once. A provisional order, with the promise computed from the
// same formula the server uses, goes to the Order tab while the request is in flight,
// and the kitchen's real order replaces it when it lands. A failure is shown on that
// same screen, with the order kept on the menu so nothing is typed twice.
// The body of the request, and nothing else. The order API's schema is strict, so an
// extra key here is a 400: what the client knows and what the client may send are two
// different things and this type is the second one.
export type Payload = { tableNo: string; items: { menuItemId: string; quantity: number }[] };
// foodIds is kept beside the payload, never inside it, so that when a dish sells out
// from under a mixed order and comes off it, what is left can be judged again: an order
// that was food and is now drinks only should show the glass rather than go on holding
// a pot until the kitchen's order lands.
export type Pending = { order: SerializedOrder; status: "sending" | "failed"; message: string | null; payload: Payload; foodIds: string[] };

export const PENDING_PREFIX = "pending:";
export const isPending = (id: string) => id.startsWith(PENDING_PREFIX);
const CART_KEY = "chowly-cart";
export const CART_EVENT = "chowly:cart";

let pending: Pending | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
export function usePending(): Pending | null {
  return useSyncExternalStore(subscribe, () => pending, () => null);
}

const stamp = () => new Date().toISOString() as unknown as SerializedOrder["placedAt"];
const stampAfter = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString() as unknown as SerializedOrder["dueAt"];

function editCart(edit: (cart: Record<string, number>) => Record<string, number> | null) {
  try {
    const raw = window.sessionStorage.getItem(CART_KEY);
    const next = edit(raw ? (JSON.parse(raw) as Record<string, number>) : {});
    if (next) window.sessionStorage.setItem(CART_KEY, JSON.stringify(next));
    else window.sessionStorage.removeItem(CART_KEY);
  } catch {
    // the menu will read what it can
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

export function startPlacement(order: SerializedOrder, payload: Payload, foodIds: string[]) {
  pending = { order, status: "sending", message: null, payload, foodIds };
  emit();
  selectOrder(order.id);
  void send();
}

export function retryPlacement() {
  if (!pending || pending.status !== "failed") return;
  pending = { ...pending, status: "sending", message: null, order: { ...pending.order, placedAt: stamp(), dueAt: stampAfter(pending.order.waitMinutes) } };
  emit();
  void send();
}

export function abandonPlacement() {
  pending = null;
  emit();
  selectOrder(null);
}

async function send() {
  if (!pending) return;
  try {
    const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(pending.payload) });
    const json = (await response.json().catch(() => null)) as (SerializedOrder & { error?: string; unavailable?: string[] }) | null;
    if (!response.ok || !json) {
      fail(json?.error ?? "Check the connection and try again.", json?.unavailable ?? []);
      return;
    }
    editCart(() => null);
    void mutate(MINE_KEY, (current: { orders: SerializedOrder[] } | undefined) => ({ orders: [json, ...(current?.orders ?? []).filter((o) => o.id !== json.id)] }), { revalidate: true });
    selectOrder(json.id);
    pending = null;
    emit();
  } catch {
    fail("Check the connection and try again.", []);
  }
}

// A dish that sold out comes off the kept order and off the request, so trying again
// sends what is left. The sentence from the server names the dish.
function fail(message: string, unavailable: string[]) {
  if (!pending) return;
  const gone = new Set(unavailable);
  if (gone.size > 0) editCart((cart) => Object.fromEntries(Object.entries(cart).filter(([id]) => !gone.has(id))));
  const items = pending.payload.items.filter((l) => !gone.has(l.menuItemId));
  const food = new Set(pending.foodIds);
  const lines = pending.order.items.filter((l) => !gone.has(l.menuItemId));
  const order = { ...pending.order, items: lines, kind: lines.some((l) => food.has(l.menuItemId)) ? ("food" as const) : ("drinks" as const) };
  pending = { ...pending, status: "failed", message, payload: { ...pending.payload, items }, order };
  emit();
}
