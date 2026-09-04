"use client";

import { useEffect, useState } from "react";
import { MAX_PER_ITEM, cartCount, cartLines, cartTotalKobo, type Cart } from "@/lib/cart";
import type { MenuItemView, MenuView } from "@/lib/menu";
import { vatKobo } from "@/lib/money";
import type { SerializedOrder } from "@/lib/orders";
import { readTable, writeTable } from "./table";

const CART_KEY = "chowly-cart";

function readCart(): Cart {
  try {
    const raw = window.sessionStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as Cart) : {};
  } catch {
    return {};
  }
}

// The cart, kept for the session so "View order" and back does not lose it. Placing
// posts item ids, quantities and the table only; every figure comes back from the
// server. The totals shown before placing are display only.
export function useCart(menu: MenuView | null) {
  const [cart, setCart] = useState<Cart>({});
  const [tableNo, setTableNoState] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  useEffect(() => {
    setCart(readCart());
    setTableNoState(readTable());
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // the cart just will not survive a reload
    }
  }, [cart, hydrated]);

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
  const setTableNo = (value: string) => {
    setTableNoState(value);
    writeTable(value.trim());
  };
  const clear = () => setCart({});
  const lines = menu ? cartLines(cart, menu) : [];
  const count = cartCount(cart);
  const subtotalKobo = cartTotalKobo(lines);
  const totalKobo = subtotalKobo + vatKobo(subtotalKobo);

  async function place(): Promise<SerializedOrder | null> {
    setError(null);
    if (lines.length === 0) {
      setError("Your order is empty. Add something from the menu first.");
      return null;
    }
    if (!tableNo.trim()) {
      setError("Enter your table number so we know where to bring it.");
      return null;
    }
    setPlacing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tableNo: tableNo.trim(), items: lines.map((l) => ({ menuItemId: l.item.id, quantity: l.quantity })) }),
      });
      const json = (await response.json().catch(() => null)) as (SerializedOrder & { error?: string }) | null;
      if (!response.ok || !json) {
        setError(json?.error ?? "The order could not be placed. Check the connection and try again.");
        return null;
      }
      setCart({});
      return json;
    } catch {
      setError("The order could not be placed. Check the connection and try again.");
      return null;
    } finally {
      setPlacing(false);
    }
  }

  return { cart, hydrated, add, remove, clear, lines, count, subtotalKobo, totalKobo, tableNo, setTableNo, error, setError, placing, place };
}
