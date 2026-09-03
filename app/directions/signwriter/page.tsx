import { Alfa_Slab_One, Karla } from "next/font/google";
import { SignwriterMenu } from "@/components/directions/signwriter/menu";
import { getMenu } from "@/lib/menu";

const sign = Alfa_Slab_One({ weight: "400", subsets: ["latin"], variable: "--font-sign", display: "swap" });
const karla = Karla({ subsets: ["latin"], variable: "--font-karla", display: "swap" });

export const dynamic = "force-dynamic";
export const metadata = { title: "CHOWLY" };

// Direction 1 of 3 for the redesign: Signwriter. A prototype of the menu screen only.
export default async function SignwriterDirection() {
  const menu = await getMenu();
  return (
    <div className={`${sign.variable} ${karla.variable}`}>
      <SignwriterMenu menu={menu} />
    </div>
  );
}
