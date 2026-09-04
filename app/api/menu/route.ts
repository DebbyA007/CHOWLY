import { NextResponse } from "next/server";
import { handle } from "@/lib/http";
import { getMenu } from "@/lib/menu";

// The menu, grouped by menu type, with a sold-out dish kept on the card and marked.
// Reading what the kitchen serves needs no session, and nothing here is written.
export function GET() {
  return handle(async () => NextResponse.json(await getMenu()));
}
