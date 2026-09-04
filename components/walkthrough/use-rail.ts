"use client";

import { useEffect, useState } from "react";
import useSWR, { preload } from "swr";
import type { SerializedOrder } from "@/lib/orders";

export type Staff = {
  waiters: { id: string; name: string; shift: string }[];
  chefs: { id: string; name: string; specialty: string }[];
  bartenders: { id: string; name: string; specialty: string }[];
};
type Rail = { now: string; orders: SerializedOrder[]; staff: Staff };

// The waiter side, presentation-free: the orders polled every three seconds, the staff
// lists, a ticking clock, and serve(), which records who served, cooked and mixed and
// moves the ticket from the response before the next poll confirms it.
export const RAIL_KEY = "/api/waiter/orders";

export async function railFetcher(url: string): Promise<Rail> {
  const response = await fetch(url);
  if (response.status === 401) throw new Error("This deployment has locked the waiter side (STAFF_PIN_REQUIRED is on).");
  if (!response.ok) throw new Error("The orders could not be loaded.");
  return response.json();
}

// Warms the client cache before the floor is opened, so the switch shows tickets at once.
export function preloadRail() {
  void preload(RAIL_KEY, railFetcher);
}

export function useRail() {
  const { data, error, mutate } = useSWR<Rail>(RAIL_KEY, railFetcher, { refreshInterval: 3000, keepPreviousData: true });
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const orders = data?.orders ?? [];
  const placed = orders.filter((o) => o.status === "PLACED");
  const served = orders.filter((o) => o.status === "SERVED");

  async function serve(orderId: string, staff: { waiterId: string; chefId: string; bartenderId: string }): Promise<SerializedOrder> {
    const response = await fetch(`/api/orders/${orderId}/assign`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(staff) });
    const body = (await response.json().catch(() => null)) as (SerializedOrder & { error?: string }) | null;
    if (!response.ok || !body) throw new Error(body?.error ?? "The order could not be marked served. Try again.");
    void mutate((current) => (current ? { ...current, orders: current.orders.map((o) => (o.id === body.id ? body : o)) } : current), { revalidate: true });
    return body;
  }

  return { data, error, now, orders, placed, served, staff: data?.staff ?? null, serve, refresh: () => void mutate() };
}
