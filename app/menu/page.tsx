import { PassMenu } from "@/components/pass/menu";
import { getMenu } from "@/lib/menu";

// The menu is read straight from the database on the server and handed to the pass,
// so the first paint carries real strips. Dynamic on purpose: an item marked
// unavailable disappears on the next load.
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const menu = await getMenu();
  return <PassMenu menu={menu} />;
}
