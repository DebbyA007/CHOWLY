import type { Metadata } from "next";
import { Instrument_Serif, Karla } from "next/font/google";

const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-instrument-serif", display: "swap" });
const karla = Karla({ subsets: ["latin"], variable: "--font-karla", display: "swap" });

export const metadata: Metadata = { title: "CHOWLY", robots: { index: false, follow: false } };

// Direction one of three: Linen. A clickable walkthrough on the real API.
export default function LinenLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${karla.variable}`}>{children}</div>;
}
