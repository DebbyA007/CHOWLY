import { BillMenu } from "@/components/directions-2/two/menu";
import { getMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function BillMenuPage() {
  const menu = await getMenu();
  return <BillMenu menu={menu} />;
}
