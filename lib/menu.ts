import type { MenuType } from "@prisma/client";
import { HttpError } from "./http";
import { byDesignOrder, photoFor } from "./menu-order";
import { formatNaira } from "./money";
import { prisma } from "./prisma";

// The menu as a page or an API reads it: grouped by menu type, kitchen before bar,
// unavailable items left out, prices formatted once here.
export type MenuItemView = {
  id: string;
  name: string;
  description: string;
  priceKobo: number;
  price: string;
  prepTimeMinutes: number;
  photo: string;
};

export type MenuView = {
  restaurant: { name: string; location: string };
  menus: { id: string; name: string; type: MenuType; items: MenuItemView[] }[];
};

export async function getMenu(): Promise<MenuView> {
  const restaurant = await prisma.restaurant.findFirst({
    include: {
      menus: {
        orderBy: [{ type: "asc" }, { name: "asc" }],
        include: { items: { where: { available: true }, orderBy: { name: "asc" } } },
      },
    },
  });
  if (!restaurant) {
    throw new HttpError(503, "The menu has not been set up yet. Run the seed, then reload.");
  }
  return {
    restaurant: { name: restaurant.name, location: restaurant.location },
    menus: restaurant.menus.map((menu) => ({
      id: menu.id,
      name: menu.name,
      type: menu.type,
      items: byDesignOrder(menu.items).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        priceKobo: item.priceKobo,
        price: formatNaira(item.priceKobo),
        prepTimeMinutes: item.prepTimeMinutes,
        photo: photoFor(item.id),
      })),
    })),
  };
}
