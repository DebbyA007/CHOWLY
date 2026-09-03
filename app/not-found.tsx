import Link from "next/link";

// Nothing generic ships, the 404 included. A blank ticket on an empty spike. Orders
// belong to the browser that placed them, so a link to someone else's lands here.
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-12 sm:px-8">
      <section className="paper torn-both mx-auto max-w-md px-6 pb-4">
        <h1 className="display-print mt-4 text-3xl">Nothing on this spike</h1>
        <p className="mt-2 text-sm text-ink-soft">
          If you were looking for an order, it belongs to the browser that placed it, so it only shows there.
        </p>
        <Link href="/" className="stamp-button mt-6 inline-block bg-char-ink px-4 py-2.5 text-paper">
          Back to the pass
        </Link>
      </section>
    </main>
  );
}
