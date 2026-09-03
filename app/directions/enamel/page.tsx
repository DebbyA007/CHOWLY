import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { EnamelMenu } from "@/components/directions/enamel/menu";
import { getMenu } from "@/lib/menu";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-bricolage", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });

export const dynamic = "force-dynamic";
export const metadata = { title: "CHOWLY", robots: { index: false, follow: false } };

// Direction 3 of 3 for the redesign: Cast Enamel. A prototype of the menu screen only.
// Uses the Bricolage and Instrument variables the root layout already loads.
export default async function EnamelDirection() {
  const menu = await getMenu();
  return (
    <div className={`${bricolage.variable} ${instrument.variable}`}>
      <EnamelMenu menu={menu} />
    </div>
  );
}
