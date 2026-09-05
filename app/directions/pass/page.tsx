import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { PassMenu } from "@/components/directions/pass/menu";
import { SAMPLE_MENU } from "@/components/directions/sample-menu";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-fraunces", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-plex", display: "swap" });

export const metadata = { title: "CHOWLY", robots: { index: false, follow: false } };

// Direction 2 of 3 for the redesign: The Pass. A prototype of the menu screen only.
export default function PassDirection() {
  const menu = SAMPLE_MENU;
  return (
    <div className={`${fraunces.variable} ${plex.variable}`}>
      <PassMenu menu={menu} />
    </div>
  );
}
