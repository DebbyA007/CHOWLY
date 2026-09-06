import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, HttpError } from "@/lib/http";
import { getMenu } from "@/lib/menu";
import { prisma } from "@/lib/prisma";
import { parseWith } from "@/lib/schemas";
import { assertStaffPin } from "@/lib/staff-pin";

// The waiter's menu: every dish with whether it is on, and the switch that takes a
// dish off when the kitchen runs out. It is the guests' card exactly, sold-out dishes
// included, because the board and the card have to agree about what the restaurant has.
// A retired dish is off both: it stays in the database only for the orders that name it.
export function GET(request: Request) {
  return handle(async () => {
    assertStaffPin(request);
    return NextResponse.json(await getMenu());
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
