import type { Metadata } from "next";
import { EB_Garamond, Work_Sans } from "next/font/google";

const garamond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-garamond", display: "swap" });
const work = Work_Sans({ subsets: ["latin"], variable: "--font-work", display: "swap" });

export const metadata: Metadata = { title: "CHOWLY", robots: { index: false, follow: false } };

// Direction two of three: Bill of fare. A clickable walkthrough on the real API.
export default function BillLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${garamond.variable} ${work.variable}`}>{children}</div>;
}
