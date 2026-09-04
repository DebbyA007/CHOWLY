import Link from "next/link";

// Nothing generic ships, the 404 included.
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col px-[22px] pt-[14px]">
      <h1 className="serif text-[25px] leading-[1.05]">Nothing here</h1>
      <p className="mt-[5px] text-[11.5px] text-fg-muted">That page does not exist, or it belongs to another table.</p>
      <Link href="/menu" className="btn-primary press mt-8">Menu</Link>
    </main>
  );
}
