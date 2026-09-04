import type { Metadata } from "next";

export const metadata: Metadata = { title: "CHOWLY", robots: { index: false, follow: false } };

// Three walkthroughs, structurally different, each running the whole story on the real
// API. Not linked from the app's own navigation.
export default function DirectionsThreeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
