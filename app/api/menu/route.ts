import { NextResponse } from "next/server";
import { handle, HttpError } from "@/lib/http";
import { formatNaira } from "@/lib/money";
import { prisma } from "@/lib/prisma";

// The menu, grouped by menu type, with unavailable items left out. Reading what the
// kitchen serves needs no session, and nothing here is written. Cached for thirty
// seconds on the server, so a role switch never queues behind the database: an item
// marked unavailable leaves the menu within half a minute rather than on the next load.
export const revalidate = 30;

export function GET() {
  return handle(async () => {
    const restaurant = await prisma.restaurant.findFirst({
      include: {
        menus: {
          orderBy: { type: "asc" },
          include: {
            items: {
              where: { available: true },
              orderBy: { name: "asc" },
            },
          },
        },
      },
    });
    if (!restaurant) {
      throw new HttpError(503, "The menu has not been set up yet. Run the seed, then reload.");
    }
    return NextResponse.json({
      restaurant: { name: restaurant.name, location: restaurant.location },
      menus: restaurant.menus.map((menu) => ({
        id: menu.id,
        name: menu.name,
        type: menu.type,
        items: menu.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          priceKobo: item.priceKobo,
          price: formatNaira(item.priceKobo),
          prepTimeMinutes: item.prepTimeMinutes,
        })),
      })),
    });
  });
}
