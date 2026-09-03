import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { RailHeader } from "@/components/pass/rail-header";

// Two families and no third. Fraunces carries the restaurant name and the big numbers
// with its soft and wonk axes loaded; IBM Plex Mono carries everything a printer would
// print, which in this world is everything else. Both self-hosted by next/font.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CHOWLY",
  description: "Order at your table, watch the wait, and pay before you leave.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plex.variable}`}>
      <body className="steel antialiased">
        <RailHeader />
        {children}
      </body>
    </html>
  );
}
