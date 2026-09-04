"use client";

import useSWR, { preload } from "swr";
import type { MenuView } from "@/lib/menu";

// The menu, read once through the API into the client cache and kept, so switching
// between the two sides never waits on the database again. Preloaded from the landing
// before either button is pressed.
import { MENU_KEY } from "./keys";
export { MENU_KEY };

export async function menuFetcher(url: string): Promise<MenuView> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("The menu could not be loaded. Check the connection and reload.");
  return response.json();
}

export function preloadMenu(): Promise<MenuView> {
  return preload(MENU_KEY, menuFetcher);
}

export function useMenu() {
  const { data, error } = useSWR<MenuView>(MENU_KEY, menuFetcher, { revalidateOnFocus: true, refreshInterval: 30_000, dedupingInterval: 10_000 });
  return { menu: data ?? null, error };
}
