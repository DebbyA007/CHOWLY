import { Hanken_Grotesk, Syne } from "next/font/google";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-syne", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

// Direction two of three: The Run.
export default function RunLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${syne.variable} ${hanken.variable}`}>{children}</div>;
}
