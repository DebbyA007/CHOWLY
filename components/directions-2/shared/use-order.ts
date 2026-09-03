"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import type { SerializedOrder } from "@/lib/orders";
import { clock, computeHeat, type TicketState } from "@/components/pass/heat";
import { useNow } from "@/components/use-now";
import { usePrefersReducedMotion } from "@/components/pass/use-reduced-motion";

// One order, polled every three seconds, with ambient time computed every second from
// placedAt and waitMinutes. `progress` runs from 1 (just placed) to 0 (long past the
// promise) and never rises while the order is placed; each direction turns it into its
// own light. Under reduced motion it steps once per state. Also every action the ticket
// can take, presentation-free, and the demo controls, which only the walkthrough routes
// render and which the server refuses unless DEMO_CONTROLS is on.
async function fetcher(url: string): Promise<SerializedOrder> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "The order could not be loaded.");
  }
  return response.json();
}

export type OrderView = ReturnType<typeof useOrder>;

export function useOrder(id: string) {
  const { data: order, error, mutate } = useSWR<SerializedOrder>(`/api/orders/${id}`, fetcher, { refreshInterval: 3000 });
  const now = useNow();
  const reduce = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [justPaid, setJustPaid] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const heat = order ? computeHeat(order.status, order.placedAt, order.waitMinutes, now, reduce) : null;
  const state: TicketState = heat?.state ?? "waiting";
  const progress = heat?.heat ?? 1;
  const elapsed = heat?.elapsedSeconds ?? 0;
  const promised = heat?.promisedSeconds ?? 0;
  const digits = !order || now === null ? "--:--" : state === "waiting" ? clock(Math.max(0, promised - elapsed)) : state === "late" ? `+${clock(elapsed - promised)}` : state === "served" ? "Served" : "Paid";
  const dueMs = order ? new Date(order.dueAt).getTime() : 0;
  const servedLate = !!order?.servedAt && new Date(order.servedAt).getTime() > dueMs;
  const late = state === "late" || servedLate;
  const lateSeconds = order && now !== null ? Math.max(0, Math.floor(((order.servedAt ? new Date(order.servedAt).getTime() : now) - dueMs) / 1000)) : 0;

  const replace = (updated: SerializedOrder) => void mutate(updated, { revalidate: true });
  const refresh = () => void mutate();
  const post = async (path: string, body: unknown) => {
    const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const json = (await response.json().catch(() => null)) as (SerializedOrder & { error?: string }) | null;
    if (!response.ok || !json) throw new Error(json?.error ?? "That did not go through. Try again.");
    return json;
  };

  async function sendComplaint(description: string, score: number | null) {
    setBusy("complaint");
    setNotice(null);
    try {
      await post(`/api/orders/${id}/complaints`, { description });
      if (score !== null) await post(`/api/orders/${id}/rating`, { score });
      setNotice("Sent. The manager sees it.");
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
    setBusy("rating");
    setNotice(null);
    try {
      await post(`/api/orders/${id}/rating`, comment.trim() ? { score, comment: comment.trim() } : { score });
      setNotice(`Rated ${score} of 5.`);
      refresh();
      return true;
    } catch (e) {
      setNotice((e as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  }
  async function settle(method: "CARD" | "MOBILE_MONEY" | "CASH") {
    setBusy("settle");
    setNotice(null);
    try {
      const updated = await post(`/api/orders/${id}/pay`, { method });
      setJustPaid(true);
      replace(updated);
      return true;
    } catch (e) {
      setNotice((e as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  }
  // Demo controls: only the walkthrough routes render these, and the server answers 404
  // unless DEMO_CONTROLS is exactly true.
  async function fastForward(minutes: number) {
    setBusy("demo");
    try {
      const updated = await post("/api/demo", { action: "fast-forward", orderId: id, minutes });
      replace(updated);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const when = (iso: string | null) => (mounted && iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");

  return { order, error, state, progress, reach: heat?.reach ?? 1, digits, elapsed, promised, late, lateSeconds, justPaid, busy, notice, setNotice, when, refresh, replace, sendComplaint, rate, settle, fastForward };
}
