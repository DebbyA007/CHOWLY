import { EnamelMenu } from "@/components/directions/enamel/menu";
import { getMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";
export const metadata = { title: "CHOWLY" };

// Direction 3 of 3 for the redesign: Cast Enamel. A prototype of the menu screen only.
// Uses the Bricolage and Instrument variables the root layout already loads.
export default async function EnamelDirection() {
  const menu = await getMenu();
  return <EnamelMenu menu={menu} />;
}
