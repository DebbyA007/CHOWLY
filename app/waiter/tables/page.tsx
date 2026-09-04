import { Tables } from "@/components/night/waiter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tables", description: "The floor by table, and what each still has to pay." };

export default function TablesPage() {
  return <Tables />;
}
