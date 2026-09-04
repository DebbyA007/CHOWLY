import { Menu } from "@/components/night/menu";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Menu", description: "The menu at The Golden Gate: mains, soups and drinks, with the kitchen's minutes on every dish." };

// Screen 2. The menu carries no server data: the client cache holds it, warmed on the landing.
export default function MenuPage() {
  return <Menu />;
}
