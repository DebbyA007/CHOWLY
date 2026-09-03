import { NextResponse } from "next/server";
import { handle } from "@/lib/http";
import { requireCustomer } from "@/lib/session";

// Who this browser is. Creates the customer row on the first call and returns the same
// row on every call after, which is what makes a refresh keep the customer's own view.
export function GET() {
  return handle(async () => {
    const customer = await requireCustomer();
    return NextResponse.json({ id: customer.id, tableNo: customer.tableNo, since: customer.createdAt });
  });
}
