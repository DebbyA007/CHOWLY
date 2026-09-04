// The menu is shown in the order the design lists it, which is neither by name nor by
// price. Anything not listed here comes after, by name.
export const DISH_ORDER = [
  "item_grilled_steak",
  "item_grilled_catfish",
  "item_pounded_yam_egusi",
  "item_jollof_rice",
  "item_eggs_benedict",
  "item_goat_pepper_soup",
  "item_chapman",
  "item_mojito",
  "item_merlot_2018",
  "item_zobo",
];
export const STAFF_ORDER = ["chef_adaeze", "chef_tunde", "chef_ngozi", "bartender_emeka", "bartender_funke", "waiter_kemi", "waiter_chidi", "waiter_amaka"];

export function byDesignOrder<T extends { id: string; name: string }>(rows: T[], order: string[] = DISH_ORDER): T[] {
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...rows].sort((a, b) => {
    const ra = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return ra === rb ? a.name.localeCompare(b.name) : ra - rb;
  });
}

export function photoFor(itemId: string): string {
  return `/photos/${itemId}.jpg`;
}
