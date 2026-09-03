import { GlazeMenu } from "@/components/directions-2/three/menu";
import { getMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function GlazeMenuPage() {
  const menu = await getMenu();
  return <GlazeMenu menu={menu} />;
}
