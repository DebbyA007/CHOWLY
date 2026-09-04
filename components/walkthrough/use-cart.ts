"use client";

import { useState } from "react";
import { MAX_PER_ITEM, cartCount, cartLines, cartTotalKobo, type Cart } from "@/lib/cart";
import type { MenuItemView, MenuView } from "@/lib/menu";

// The cart, presentation-free, shared by every walkthrough. Firing posts item ids,
// quantities and the table only; every figure comes back from the server.
export function useCart(menu: MenuView) {
  const [cart, setCart] = useState<Cart>({});
  const [tableNo, setTableNo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [firing, setFiring] = useState(false);
  const [fired, setFired] = useState<{ id: string; reference: string; waitMinutes: number } | null>(null);

  const add = (item: MenuItemView) => {
    setError(null);
    setCart((c) => ({ ...c, [item.id]: Math.min(MAX_PER_ITEM, (c[item.id] ?? 0) + 1) }));
  };
  const remove = (item: MenuItemView) => {
    setError(null);
    setCart((c) => {
      const next = { ...c };
      const q = (next[item.id] ?? 0) - 1;
      if (q > 0) next[item.id] = q;
      else delete next[item.id];
      return next;
    });
  };
  const lines = cartLines(cart, menu);
  const count = cartCount(cart);
  const totalKobo = cartTotalKobo(lines);

  async function fire(): Promise<{ id: string; reference: string; waitMinutes: number } | null> {
    setError(null);
    if (lines.length === 0) {
      setError("Nothing chosen yet. Choose a dish first.");
      return null;
    }
    if (!tableNo.trim()) {
      setError("Enter the number on your table.");
      return null;
    }
    setFiring(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tableNo: tableNo.trim(), items: lines.map((l) => ({ menuItemId: l.item.id, quantity: l.quantity })) }),
      });
      const json = (await response.json().catch(() => null)) as { id: string; reference: string; waitMinutes: number; error?: string } | null;
      if (!response.ok || !json) {
        setError(json?.error ?? "The order could not be placed. Check the connection and try again.");
        return null;
      }
      const placed = { id: json.id, reference: json.reference, waitMinutes: json.waitMinutes };
      setFired(placed);
      return placed;
    } catch {
      setError("The order could not be placed. Check the connection and try again.");
      return null;
    } finally {
      setFiring(false);
    }
  }

  return { cart, add, remove, lines, count, totalKobo, tableNo, setTableNo, error, firing, fired, fire };
}
