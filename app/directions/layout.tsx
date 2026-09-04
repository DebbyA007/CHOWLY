import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./legacy.css";

// The three art-direction prototypes from phase 4b, kept as artefacts. They were built
// in The Pass's tokens and type, so those load here and nowhere else.
const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-fraunces", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = { title: "CHOWLY", robots: { index: false, follow: false } };

export default function DirectionsLayout({ children }: { children: React.ReactNode }) {
  return <div className={`legacy legacy-theme steel ${fraunces.variable} ${plex.variable}`}>{children}</div>;
}
