"use client";

import useSWR, { mutate as mutateKey, preload } from "swr";
import type { MenuView } from "@/lib/menu";
import { MENU_KEY, WAITER_MENU_KEY } from "./keys";

// The waiter's menu: every dish, including the ones sold out, with a switch each. The
// change shows at once and is rolled back if the server refuses it; the guests' menu
// is refreshed after, so a sold-out dish leaves their list on the next poll.
export type WaiterMenuView = Omit<MenuView, "menus"> & { menus: (Omit<MenuView["menus"][number], "items"> & { items: (MenuView["menus"][number]["items"][number] & { available: boolean })[] })[] };

async function fetcher(url: string): Promise<WaiterMenuView> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("The menu could not be loaded.");
  return response.json();
}
export function preloadWaiterMenu() {
  void preload(WAITER_MENU_KEY, fetcher);
}

export function useWaiterMenu() {
  const { data, error, mutate } = useSWR<WaiterMenuView>(WAITER_MENU_KEY, fetcher, { refreshInterval: 10_000, keepPreviousData: true });
  async function setAvailable(id: string, available: boolean): Promise<string | null> {
    const before = data;
    const apply = (view: WaiterMenuView | undefined, value: boolean) => (view ? { ...view, menus: view.menus.map((m) => ({ ...m, items: m.items.map((i) => (i.id === id ? { ...i, available: value } : i)) })) } : view);
    void mutate((current) => apply(current, available), { revalidate: false });
    try {
      const response = await fetch(WAITER_MENU_KEY, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, available }) });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error ?? "The change did not save. Try again.");
      void mutate();
      void mutateKey(MENU_KEY);
      return null;
    } catch (e) {
      void mutate(before, { revalidate: true });
      return (e as Error).message;
    }
  }
  return { menu: data ?? null, error, setAvailable };
}
