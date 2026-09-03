import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
