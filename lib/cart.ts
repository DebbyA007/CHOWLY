import type { MenuItemView, MenuView } from "./menu";

// The cart is a map of menu item id to quantity. Nothing about money or time is decided
// here: the total shown on the tray is display only and the server recomputes every
// figure from the database when the order is placed.
export type Cart = Record<string, number>;

export type CartLine = { item: MenuItemView; quantity: number };

export const MAX_PER_ITEM = 20;

export function cartLines(cart: Cart, menu: MenuView): CartLine[] {
  const byId = new Map(menu.menus.flatMap((section) => section.items).map((item) => [item.id, item]));
  return Object.entries(cart).flatMap(([id, quantity]) => {
    const item = byId.get(id);
    return item && quantity > 0 ? [{ item, quantity }] : [];
  });
}

export function cartCount(cart: Cart): number {
  return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}

export function cartTotalKobo(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.item.priceKobo * line.quantity, 0);
}
