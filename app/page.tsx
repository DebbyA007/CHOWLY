import { OrderComposer } from "@/components/order-composer";
import { getMenu } from "@/lib/menu";

// The menu is read straight from the database on the server and handed to the board,
// so the first paint carries real plates and the entrance sequence has something to
// draw. Dynamic on purpose: an item marked unavailable disappears on the next load.
export const dynamic = "force-dynamic";

export default async function Home() {
  const menu = await getMenu();
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-4 sm:px-8">
      <OrderComposer menu={menu} />
    </main>
  );
}
