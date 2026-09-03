import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CHOWLY",
  robots: { index: false, follow: false },
};

const directions = [
  { href: "/directions-2/one", name: "Linen", line: "A white cloth on a table by the window, the afternoon sun moving across it. Gouache food." },
  { href: "/directions-2/two", name: "Bill of fare", line: "Letterpress on cotton paper, a candle burning down beside the order. Ink food." },
  { href: "/directions-2/three", name: "Glaze", line: "Glazed stoneware on a terrazzo table, the room settling into evening. Glaze food." },
];

// Three clickable walkthroughs, each running the whole story on the real API and
// the seeded data. Not linked from the app's own navigation.
export default function DirectionsTwoIndex() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl bg-[#ecebe6] px-5 pb-16 pt-10 text-[#1f2124] sm:px-8" style={{ fontFamily: "system-ui, sans-serif" }}>
      <p className="text-sm"><Link href="/" className="underline">CHOWLY</Link></p>
      <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">Three more directions</h1>
      <p className="mt-4 max-w-prose text-[15px] leading-relaxed">
        The Pass was well built and wrong: industrial, dark, heavy, and set on the kitchen side. These three turn it
        over. Light ground, air, restraint, and the dining room. Each is a full walkthrough, not a screen: landing,
        menu, order, the live wait, running late, a complaint and a rating, payment and the receipt, then the floor
        with the ticket opened, the chef and bartender recorded and the order served.
      </p>
      <p className="mt-3 max-w-prose text-[15px] leading-relaxed">
        They run on the same database as the app. Orders you place here are real rows; the walkthroughs remove
        their own test data, and a demo control on the order screen, clearly labelled, moves that order&apos;s clock so
        the late state shows in seconds. The control exists only on these routes and only when the server is started
        with it switched on. It is never part of the product.
      </p>
      <ul className="mt-8 flex flex-col gap-4">
        {directions.map((direction) => (
          <li key={direction.href}>
            <Link href={direction.href} className="block rounded-[14px] border-[1.5px] border-[#1f2124] bg-[#f8f7f3] px-5 py-4">
              <span className="text-2xl font-semibold">{direction.name}</span>
              <span className="mt-1 block text-[14px] text-[#4d5054]">{direction.line}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-prose text-[14px] text-[#4d5054]">
        The first three directions, from which The Pass was chosen, are at <Link href="/directions" className="underline">/directions</Link>.
        The critique that ranks these three is in the repository at docs/directions-2/README.md.
      </p>
    </main>
  );
}
