import type { Metadata } from "next";
import { Figtree, Newsreader } from "next/font/google";

const news = Newsreader({ subsets: ["latin"], axes: ["opsz"], variable: "--font-newsreader", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

export const metadata: Metadata = { title: "CHOWLY", robots: { index: false, follow: false } };

// Direction three of three: Glaze. A clickable walkthrough on the real API.
export default function GlazeLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${news.variable} ${figtree.variable}`}>{children}</div>;
}
