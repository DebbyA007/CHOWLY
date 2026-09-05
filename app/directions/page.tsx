import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CHOWLY",
  robots: { index: false, follow: false },
};

const directions = [
  { href: "/directions/signwriter", name: "Signwriter", line: "A painted bukka signboard and a chalked slate." },
  { href: "/directions/pass", name: "The Pass", line: "A kitchen pass in steel, brass and thermal paper under heat lamps. Chosen here, then replaced." },
  { href: "/directions/enamel", name: "Cast Enamel", line: "Chipped enamel bowls on one tray, sized by how long each dish takes." },
];

// The three art directions, kept as working menu screens so the choice can be seen
// rather than read about. Not linked from the app's own navigation.
export default function DirectionsIndex() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:px-8">
      <h1 className="display text-4xl text-brass-light sm:text-5xl">Three directions</h1>
      <p className="mt-4 max-w-prose text-sm text-paper/85">
        Before the interface was rebuilt, three art directions were proposed and each was built for real as the menu
        screen on the seeded data. They are kept here as evidence of the choice. The critique that chose between them
        is in the repository at docs/directions/README.md.
      </p>
      <ul className="mt-8 flex flex-col gap-4">
        {directions.map((direction) => (
          <li key={direction.href}>
            <Link href={direction.href} className="paper torn-bottom block px-5 pt-4">
              <span className="display-print text-2xl">{direction.name}</span>
              <span className="mt-1 block text-sm text-ink-soft">{direction.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
