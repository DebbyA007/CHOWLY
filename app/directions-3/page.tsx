import Link from "next/link";

const directions = [
  { href: "/directions-3/one", name: "The Pass, repaired", line: "Wood, plaster, stone and ceramic in place of steel and brass. The lamp is still the clock. The ordering screen rebuilt around the task." },
  { href: "/directions-3/two", name: "The Run", line: "A lacquer tray you turn, one bowl at a time. Time is distance: a runner carrying your bowl across a chalk plan of the room." },
  { href: "/directions-3/three", name: "The Placemat", line: "Your table at a buka, seen from above. The menu is printed on the placemat, and the ice in your glass is the clock." },
];

// Three walkthroughs that are structurally different, each running the whole story on
// the real API and the seeded data. Not linked from the app's own navigation.
export default function DirectionsThreeIndex() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl bg-[#ecebe6] px-5 pb-16 pt-10 text-[#1f2124] sm:px-8" style={{ fontFamily: "system-ui, sans-serif" }}>
      <p className="text-sm"><Link href="/" className="underline">CHOWLY</Link></p>
      <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">Three directions, third round</h1>
      <p className="mt-4 max-w-prose text-[15px] leading-relaxed">
        The second round produced three palettes on one layout. This round mandates the differences. Direction one is
        The Pass with its three faults repaired, not reimagined. Directions two and three each break a structural
        assumption every version so far shared, and neither shares direction one&apos;s layout, its ground or its way of
        showing time. Each is a full walkthrough: landing, menu, order, the live wait, running late, a complaint and a
        rating, payment and the receipt, then the floor with the ticket opened, the chef and bartender recorded and the
        order served.
      </p>
      <p className="mt-3 max-w-prose text-[15px] leading-relaxed">
        They run on the same database as the app and remove their own test data. A demo control on the order screen,
        clearly labelled, moves that order&apos;s clock so the late state shows in seconds. It exists only on these routes
        and only when the server is started with it switched on.
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
        The earlier rounds are at <Link href="/directions" className="underline">/directions</Link> and <Link href="/directions-2" className="underline">/directions-2</Link>.
        The critique that ranks these three is in the repository at docs/directions-3/README.md.
      </p>
    </main>
  );
}
