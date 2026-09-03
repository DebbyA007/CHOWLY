import { PinGate } from "@/components/pin-gate";

export const metadata = { title: "CHOWLY" };

export default function WaiterPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
      <PinGate>
        <p className="text-chalk/80">PIN accepted. The ticket rail loads here.</p>
      </PinGate>
    </main>
  );
}
