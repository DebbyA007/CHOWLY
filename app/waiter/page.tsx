import { PinPlate } from "@/components/pass/pin-plate";
import { Rail } from "@/components/pass/rail";

export const metadata = { title: "CHOWLY" };

export default function WaiterPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6 sm:px-8">
      <PinPlate>
        <Rail />
      </PinPlate>
    </main>
  );
}
