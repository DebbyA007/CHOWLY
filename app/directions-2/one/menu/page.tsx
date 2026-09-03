import { LinenMenu } from "@/components/directions-2/one/menu";
import { getMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function LinenMenuPage() {
  const menu = await getMenu();
  return <LinenMenu menu={menu} />;
}
