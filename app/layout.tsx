import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

// Two families and no third. Bricolage Grotesque carries the restaurant name, the
// countdown and section heads, with its width and optical size axes loaded so the type
// can be used as an element. Instrument Sans carries body and UI copy. Both are
// self-hosted at build time by next/font, so font-src 'self' covers them.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="speckle-deep antialiased">{children}</body>
    </html>
  );
}
