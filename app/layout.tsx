import type { Metadata, Viewport } from "next";
import { Newsreader, Space_Grotesk } from "next/font/google";
import { SPLASH_COOKIE } from "@/lib/splash";
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

// Runs while the document is still being parsed, before anything below it can paint:
// a session that has already had the splash marks the document warm, and the
// stylesheet keeps the splash from showing. The page itself stays static.
const WARM_START = `try{if(document.cookie.split('; ').indexOf('${SPLASH_COOKIE}=1')>-1)document.documentElement.setAttribute('data-warm','1')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${grotesk.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: WARM_START }} />
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
