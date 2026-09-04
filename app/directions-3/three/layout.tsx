import { Nunito_Sans, Young_Serif } from "next/font/google";

const young = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-young", display: "swap" });
const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

// Direction three of three: The Placemat.
export default function MatLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${young.variable} ${nunito.variable}`}>{children}</div>;
}
