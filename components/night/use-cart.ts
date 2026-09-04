"use client";

import { useEffect, useState } from "react";
import { MAX_PER_ITEM, cartCount, cartLines, cartTotalKobo, type Cart } from "@/lib/cart";
import type { MenuItemView, MenuView } from "@/lib/menu";
import { formatNaira, vatKobo } from "@/lib/money";
import type { SerializedOrder } from "@/lib/orders";
import { calculateWaitMinutes } from "@/lib/wait-time";
import { CART_EVENT, PENDING_PREFIX, startPlacement, usePending } from "./pending";
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
  const pending = usePending();
  const placing = pending?.status === "sending";
  useEffect(() => {
    setCart(readCart());
    setTableNoState(readTable());
    setHydrated(true);
    // the placement store edits the kept order when the kitchen has it or refuses a dish
    const reread = () => setCart(readCart());
    window.addEventListener(CART_EVENT, reread);
    return () => window.removeEventListener(CART_EVENT, reread);
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
    if (!item.available) return;
    setError(null);
    setCart((c) => ({ ...c, [item.id]: Math.min(MAX_PER_ITEM, (c[item.id] ?? 0) + 1) }));
  };
  // a line for a dish that sold out after it was added comes off whole
  const drop = (item: MenuItemView) => {
    setError(null);
    setCart((c) => {
      const next = { ...c };
      delete next[item.id];
      return next;
    });
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

  // Placing answers at once: a provisional order, with the promise from the same
  // formula the server uses, goes to the Order tab and the request runs from there.
  // The kitchen's figures replace these the moment they land; a refusal shows there
  // too, with the order kept here so nothing is typed twice.
  function place(): SerializedOrder | null {
    setError(null);
    if (lines.length === 0) {
      setError("Your order is empty. Add something from the menu first.");
      return null;
    }
    if (!tableNo.trim()) {
      setError("Enter your table number so we know where to bring it.");
      return null;
    }
    const now = new Date();
    const waitMinutes = calculateWaitMinutes(lines.map((l) => ({ prepTimeMinutes: l.item.prepTimeMinutes, quantity: l.quantity })));
    // the same rule the server uses, so the vessel does not change when the order lands
    const foodIds = new Set(menu?.menus.filter((m) => m.type === "FOOD").flatMap((m) => m.items.map((i) => i.id)) ?? []);
    const provisional: SerializedOrder = {
      id: `${PENDING_PREFIX}${now.getTime()}`,
      reference: "",
      status: "PLACED",
      tableNo: tableNo.trim(),
      kind: lines.some((l) => foodIds.has(l.item.id)) ? "food" : "drinks",
      placedAt: now.toISOString(),
      waitMinutes,
      dueAt: new Date(now.getTime() + waitMinutes * 60_000).toISOString(),
      isDelayed: false,
      servedAt: null,
      paidAt: null,
      subtotalKobo,
      subtotal: formatNaira(subtotalKobo),
      vatKobo: totalKobo - subtotalKobo,
      vat: formatNaira(totalKobo - subtotalKobo),
      totalKobo,
      total: formatNaira(totalKobo),
      items: lines.map((l, i) => ({
        id: `line-${i}`,
        menuItemId: l.item.id,
        name: l.item.name,
        quantity: l.quantity,
        unitPriceKobo: l.item.priceKobo,
        unitPrice: l.item.price,
        subtotalKobo: l.item.priceKobo * l.quantity,
        subtotal: formatNaira(l.item.priceKobo * l.quantity),
        prepTimeMinutes: l.item.prepTimeMinutes,
      })),
      staff: { waiter: null, chef: null, bartender: null },
      payment: null,
      rating: null,
      complaints: [],
    };
    startPlacement(provisional, { tableNo: tableNo.trim(), items: lines.map((l) => ({ menuItemId: l.item.id, quantity: l.quantity })) });
    return provisional;
  }

  const shownError = error ?? (pending?.status === "failed" ? pending.message : null);
  return { cart, hydrated, add, remove, drop, clear, lines, count, subtotalKobo, totalKobo, tableNo, setTableNo, error: shownError, setError, placing, place };
}
