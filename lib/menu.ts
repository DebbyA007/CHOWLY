import type { MenuType, Station } from "@prisma/client";
import { HttpError } from "./http";
import { OFF_THE_CARD, photoFor } from "./menu-order";
import { formatNaira } from "./money";
import { prisma } from "./prisma";

// The menu as a page or an API reads it. The printed card has two levels: a heading
// such as Lunch, and under it sub-headings such as Starters and Main courses (delta
// 15). Both are read back in the order the card prints them. A dish that has sold out
// stays on the card, marked, so a guest sees the restaurant has it and that it has run
// out. A retired dish carries sortOrder -1 and is off the card entirely, while staying
// in the database for the orders that name it.
export type MenuItemView = {
  id: string;
  name: string;
  description: string;
  priceKobo: number;
  price: string;
  prepTimeMinutes: number;
  photo: string;
  available: boolean;
  // DELTA 14: the price is a floor, not a price. The dish shows it and cannot be added.
  priceFrom: boolean;
  // DELTA 12: who prepares it, which decides the staff the order needs.
  station: Station;
};

export type MenuGroupView = { id: string; name: string; section: string; type: MenuType; items: MenuItemView[] };
export type MenuSectionView = { name: string; groups: MenuGroupView[] };

export type MenuView = {
  restaurant: { name: string; location: string };
  sections: MenuSectionView[];
  // The same groups again, flat, for the code that only needs to find a dish by id.
  menus: MenuGroupView[];
};

export async function getMenu(): Promise<MenuView> {
  const restaurant = await prisma.restaurant.findFirst({
    include: {
      menus: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          items: { where: { sortOrder: { gt: OFF_THE_CARD } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
        },
      },
    },
  });
  if (!restaurant) {
    throw new HttpError(503, "The menu has not been set up yet. Run the seed, then reload.");
  }
  const menus: MenuGroupView[] = restaurant.menus
    .filter((menu) => menu.items.length > 0)
    .map((menu) => ({
      id: menu.id,
      name: menu.name,
      section: menu.section,
      type: menu.type,
      items: menu.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        priceKobo: item.priceKobo,
        price: formatNaira(item.priceKobo),
        prepTimeMinutes: item.prepTimeMinutes,
        photo: photoFor(item.id),
        available: item.available,
        priceFrom: item.priceFrom,
        station: item.station,
      })),
    }));

  // Group the sub-headings under their printed heading, keeping the card's order.
  const sections: MenuSectionView[] = [];
  for (const menu of menus) {
    const last = sections[sections.length - 1];
    if (last && last.name === menu.section) last.groups.push(menu);
    else sections.push({ name: menu.section, groups: [menu] });
  }
  return { restaurant: { name: restaurant.name, location: restaurant.location }, sections, menus };
}
