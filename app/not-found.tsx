import Link from "next/link";

// Nothing generic ships, the 404 included. Orders belong to the browser that placed
// them, so a link to someone else's order lands here.
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
      <section className="enamel speckle-chalk tray mx-auto max-w-md p-6 sm:p-8">
        <h1 className="display-tight text-3xl">Nothing at this address</h1>
        <p className="mt-2 text-ink-soft">
          If you were looking for an order, it belongs to the browser that placed it, so it only shows there.
        </p>
        <Link href="/" className="stamp mt-6 inline-block bg-enamel-mid px-4 py-2.5 font-medium text-chalk">
          Back to the menu
        </Link>
      </section>
    </main>
  );
}
