import type { Metadata, Viewport } from "next";
import { Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Two families and no third. Newsreader for display only: the restaurant name, screen
// titles, dish names, money totals. Space Grotesk for everything else, and it carries
// a real naira glyph. Both self-hosted by next/font.
const newsreader = Newsreader({ subsets: ["latin"], axes: ["opsz"], variable: "--font-newsreader", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-grotesk", display: "swap" });

const LIVE = "https://chowly-theta.vercel.app";
const DESCRIPTION = "Order at your table, watch the wait, and pay before you leave. A dining app for The Golden Gate, Berger, Lagos.";

// Titles read "Menu · CHOWLY"; each route names itself. The social card, the icons and
// the manifest come from the brand files, so a pasted link previews as the mark.
export const metadata: Metadata = {
  metadataBase: new URL(LIVE),
  title: { default: "CHOWLY", template: "%s · CHOWLY" },
  description: DESCRIPTION,
  applicationName: "CHOWLY",
  manifest: "/manifest.json",
  openGraph: { type: "website", siteName: "CHOWLY", title: "CHOWLY", description: DESCRIPTION, url: LIVE, locale: "en_NG" },
  twitter: { card: "summary_large_image", title: "CHOWLY", description: DESCRIPTION },
  appleWebApp: { title: "CHOWLY", statusBarStyle: "black" },
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
