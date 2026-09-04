"use client";

import useSWR, { preload } from "swr";
import type { MenuView } from "@/lib/menu";

// The menu, read once through the API and kept in the client cache, so switching from
// the floor back to the menu never waits on the database again. Preloaded from the
// role tags before they are pressed, and from the landing page, so the first menu paint
// finds it already there.
export const MENU_KEY = "/api/menu";

export async function menuFetcher(url: string): Promise<MenuView> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("The menu could not be loaded. Check the connection and reload.");
  return response.json();
}

export function preloadMenu() {
  void preload(MENU_KEY, menuFetcher);
}

export function useMenu() {
  const { data, error } = useSWR<MenuView>(MENU_KEY, menuFetcher, { revalidateOnFocus: false, dedupingInterval: 60_000 });
  return { menu: data ?? null, error };
}
