"use client";

import { useEffect, useState } from "react";
import useSWR, { preload } from "swr";
import type { SerializedOrder } from "@/lib/orders";
import { RAIL_KEY } from "./keys";

export type Staff = {
  waiters: { id: string; name: string; shift: string }[];
  chefs: { id: string; name: string; specialty: string }[];
  bartenders: { id: string; name: string; specialty: string }[];
};
export type Rail = { now: string; orders: SerializedOrder[]; staff: Staff };
export { RAIL_KEY };

export async function railFetcher(url: string): Promise<Rail> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Live orders could not be loaded.");
  return response.json();
}

export function preloadRail() {
  void preload(RAIL_KEY, railFetcher);
}

// Live orders, polled every three seconds and kept while they revalidate, the staff
// lists, a ticking clock, when the list last arrived, and serve(), which marks the
// order served on screen at once, records who served, cooked and mixed, and puts the
// order back the way it was if the server refuses.
export function useRail() {
  const [seenAt, setSeenAt] = useState<number | null>(null);
  const { data, error, mutate } = useSWR<Rail>(RAIL_KEY, railFetcher, { refreshInterval: 3000, keepPreviousData: true, onSuccess: () => setSeenAt(Date.now()) });
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const orders = data?.orders ?? [];
  async function serve(orderId: string, staff: { waiterId: string; chefId: string; bartenderId: string }): Promise<SerializedOrder> {
    const before = data;
    const by = (list: { id: string; name: string }[] | undefined, id: string) => list?.find((p) => p.id === id) ?? null;
    const provisional = (o: SerializedOrder): SerializedOrder => ({
      ...o,
      status: "SERVED",
      servedAt: new Date().toISOString() as unknown as SerializedOrder["servedAt"],
      staff: { waiter: by(data?.staff.waiters, staff.waiterId), chef: by(data?.staff.chefs, staff.chefId), bartender: by(data?.staff.bartenders, staff.bartenderId) },
    });
    void mutate((current) => (current ? { ...current, orders: current.orders.map((o) => (o.id === orderId ? provisional(o) : o)) } : current), { revalidate: false });
    try {
      const response = await fetch(`/api/orders/${orderId}/assign`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(staff) });
      const body = (await response.json().catch(() => null)) as (SerializedOrder & { error?: string }) | null;
      if (!response.ok || !body) throw new Error(body?.error ?? "The order could not be marked as served. Try again.");
      void mutate((current) => (current ? { ...current, orders: current.orders.map((o) => (o.id === body.id ? body : o)) } : current), { revalidate: true });
      return body;
    } catch (e) {
      void mutate(before, { revalidate: true });
      throw e;
    }
  }
  return { data, error, now, orders, staff: data?.staff ?? null, seenAt, serve, refresh: () => void mutate() };
}
