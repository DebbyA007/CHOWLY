import type { Metadata, Viewport } from "next";
import { Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Two families and no third. Newsreader for display only: the restaurant name, screen
// titles, dish names, money totals. Space Grotesk for everything else, and it carries
// a real naira glyph. Both self-hosted by next/font.
const newsreader = Newsreader({ subsets: ["latin"], axes: ["opsz"], variable: "--font-newsreader", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "CHOWLY",
  description: "Order at your table, track your order, and pay before you leave.",
};

export const viewport: Viewport = {
  themeColor: "#14120F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${grotesk.variable}`}>
      <body>
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
