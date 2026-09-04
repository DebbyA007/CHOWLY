import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, HttpError } from "@/lib/http";
import { DISH_ORDER, byDesignOrder, photoFor } from "@/lib/menu-order";
import { formatNaira } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { parseWith } from "@/lib/schemas";
import { assertStaffPin } from "@/lib/staff-pin";

// The waiter's menu: every dish with whether it is on, and the switch that takes a
// dish off when the kitchen runs out. The guests' menu leaves a sold-out dish out, and
// an order that still carries one is refused by name.
export function GET(request: Request) {
  return handle(async () => {
    assertStaffPin(request);
    const restaurant = await prisma.restaurant.findFirst({
      include: { menus: { orderBy: [{ type: "asc" }, { name: "asc" }], include: { items: { orderBy: { name: "asc" } } } } },
    });
    if (!restaurant) throw new HttpError(503, "The menu has not been set up yet. Run the seed, then reload.");
    return NextResponse.json({
      restaurant: { name: restaurant.name, location: restaurant.location },
      menus: restaurant.menus.map((menu) => ({
        id: menu.id,
        name: menu.name,
        type: menu.type,
        // Retired dishes stay in the database for the orders that name them, but they
        // are not on the card, so they are not on the board either.
        items: byDesignOrder(menu.items.filter((item) => DISH_ORDER.includes(item.id))).map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          priceKobo: item.priceKobo,
          price: formatNaira(item.priceKobo),
          prepTimeMinutes: item.prepTimeMinutes,
          photo: photoFor(item.id),
          available: item.available,
        })),
      })),
    });
  });
}

const availabilitySchema = z.strictObject({ id: z.string().trim().min(1).max(64), available: z.boolean() });

export function PATCH(request: Request) {
  return handle(async () => {
    assertStaffPin(request);
    const body = await request.json().catch(() => {
      throw new HttpError(400, "The request body is not valid JSON.");
    });
    const parsed = parseWith(availabilitySchema, body);
    if (!parsed.ok) throw new HttpError(400, parsed.message);
    const { id, available } = parsed.data;
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new HttpError(404, "That dish is not on the menu.");
    const updated = await prisma.menuItem.update({ where: { id }, data: { available } });
    return NextResponse.json({ id: updated.id, name: updated.name, available: updated.available });
  });
}
