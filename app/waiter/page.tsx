import { PinGate } from "@/components/pin-gate";
import { WaiterRail } from "@/components/waiter-rail";

export const metadata = { title: "CHOWLY" };

export default function WaiterPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
      <PinGate>
        <WaiterRail />
      </PinGate>
    </main>
  );
}
