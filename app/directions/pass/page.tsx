import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { PassMenu } from "@/components/directions/pass/menu";
import { getMenu } from "@/lib/menu";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-fraunces", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-plex", display: "swap" });

export const dynamic = "force-dynamic";
export const metadata = { title: "CHOWLY", robots: { index: false, follow: false } };

// Direction 2 of 3 for the redesign: The Pass. A prototype of the menu screen only.
export default async function PassDirection() {
  const menu = await getMenu();
  return (
    <div className={`${fraunces.variable} ${plex.variable}`}>
      <PassMenu menu={menu} />
    </div>
  );
}
