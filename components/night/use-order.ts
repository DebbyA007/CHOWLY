"use client";

import { useEffect, useState } from "react";
import useSWR, { preload } from "swr";
import type { SerializedOrder } from "@/lib/orders";
import { useNow } from "@/components/use-now";
import { MINE_KEY } from "./keys";
import { usePending } from "./pending";
import { useSelectedOrder } from "./selection";

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "That could not be loaded.");
  }
  return response.json();
}

export { MINE_KEY };
export function preloadMine() {
  void preload(MINE_KEY, fetcher<{ orders: SerializedOrder[] }>);
}

// The session's own orders, and which one the Order and Pay tabs mean: the one the
// guest chose, else the newest still open, else the newest paid one for its receipt.
// Every order stays reachable through the list on the Order tab.
export function useMyOrders() {
  const [seenAt, setSeenAt] = useState<number | null>(null);
  const { data, error } = useSWR<{ orders: SerializedOrder[] }>(MINE_KEY, fetcher, { refreshInterval: 5000, keepPreviousData: true, onSuccess: () => setSeenAt(Date.now()) });
  const selected = useSelectedOrder();
  const pending = usePending();
  // An order still on its way to the kitchen is the session's newest until it lands.
  const orders = pending ? [pending.order, ...(data?.orders ?? [])] : (data?.orders ?? []);
  const chosen = selected ? orders.find((o) => o.id === selected) ?? null : null;
  const current = chosen ?? orders.find((o) => o.status !== "PAID") ?? orders[0] ?? null;
  const open = orders.filter((o) => o.status !== "PAID");
  const others = orders.filter((o) => o.id !== current?.id);
  return { orders, current, open, others, loaded: !!data || !!pending, error, seenAt, pending };
}

export type Clock = {
  state: "waiting" | "late" | "served" | "paid";
  elapsedSeconds: number;
  promisedSeconds: number;
  remainingSeconds: number;
  lateSeconds: number;
  fraction: number;
};

// The clock derives from placedAt and the promise, from the browser's own time, so it
// survives a refresh and needs no server ticker. Clamped at zero on the way down.
export function orderClock(order: SerializedOrder, now: number | null): Clock {
  const placed = new Date(order.placedAt).getTime();
  const promisedSeconds = order.waitMinutes * 60;
  const end = order.servedAt ? new Date(order.servedAt).getTime() : now ?? placed;
  const elapsedSeconds = Math.max(0, Math.floor((end - placed) / 1000));
  const remainingSeconds = Math.max(0, promisedSeconds - elapsedSeconds);
  const lateSeconds = Math.max(0, elapsedSeconds - promisedSeconds);
  const state: Clock["state"] = order.status === "PAID" ? "paid" : order.status === "SERVED" ? "served" : elapsedSeconds > promisedSeconds ? "late" : "waiting";
  const fraction = promisedSeconds === 0 ? 0 : Math.max(0, Math.min(1, remainingSeconds / promisedSeconds));
  return { state, elapsedSeconds, promisedSeconds, remainingSeconds, lateSeconds, fraction };
}

// One order, polled every three seconds, with every action it can take.
export function useOrder(id: string | null) {
  const [seenAt, setSeenAt] = useState<number | null>(null);
  const { data: order, error, mutate } = useSWR<SerializedOrder>(id ? `/api/orders/${id}` : null, fetcher, { refreshInterval: 3000, keepPreviousData: true, onSuccess: () => setSeenAt(Date.now()) });
  const now = useNow();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState(false);
  useEffect(() => setNotice(null), [id]);
  const clock = order ? orderClock(order, now) : null;
  const dueMs = order ? new Date(order.dueAt).getTime() : 0;
  const servedLate = !!order?.servedAt && new Date(order.servedAt).getTime() > dueMs;
  const late = clock?.state === "late" || servedLate;

  const replace = (updated: SerializedOrder) => void mutate(updated, { revalidate: true });
  const refresh = () => void mutate();
  const post = async (path: string, body: unknown) => {
    const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const json = (await response.json().catch(() => null)) as (SerializedOrder & { error?: string }) | null;
    if (!response.ok || !json) throw new Error(json?.error ?? "That did not go through. Try again.");
    return json;
  };
  async function report(description: string) {
    if (!id) return false;
    setBusy("report");
    setNotice(null);
    try {
      await post(`/api/orders/${id}/complaints`, { description });
      setNotice("Sent. A manager will come over.");
      refresh();
      return true;
    } catch (e) {
      setNotice((e as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  }
  async function rate(score: number, comment: string) {
    if (!id) return false;
    setBusy("rate");
    setNotice(null);
    try {
      await post(`/api/orders/${id}/rating`, comment.trim() ? { score, comment: comment.trim() } : { score });
      setNotice("Thanks for rating.");
      refresh();
      return true;
    } catch (e) {
      setNotice((e as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  }
  async function pay(method: "CARD" | "MOBILE_MONEY" | "CASH") {
    if (!id) return null;
    setBusy("pay");
    setNotice(null);
    try {
      const updated = await post(`/api/orders/${id}/pay`, { method });
      setJustPaid(true);
      replace(updated);
      return updated;
    } catch (e) {
      setNotice((e as Error).message);
      return null;
    } finally {
      setBusy(null);
    }
  }
  return { order: order ?? null, error, now, clock, late, busy, notice, setNotice, justPaid, seenAt, refresh, replace, report, rate, pay };
}
