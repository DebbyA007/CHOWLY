/* eslint-disable @next/next/no-img-element */
"use client";

// A dish photograph in a circle, and the dining room across the top of the landing.
// Every photograph is served from this origin, and one treatment sits over all of
// them so ten sources read as one shoot: a touch warmer, a touch darker.
const TREATMENT = "sepia(0.18) saturate(1.05) contrast(1.05) brightness(0.9)";

// A dish with no photograph of its own is not a hole in the list. It gets the plate it
// would have been served on: the raised surface, the same fibre the cards carry, a
// hairline rim at the weight of a card divider, and its own initial struck into the
// paper in the display face. Same circle, same size, so the rhythm of the list does not
// break, and no icon, which the design does not use anywhere.
export function MonogramTile({ name, size = 76, className = "" }: { name: string; size?: number; className?: string }) {
  const initial = (name.trim().match(/\p{L}/u)?.[0] ?? "?").toUpperCase();
  return (
    <span
      aria-hidden="true"
      data-monogram={initial}
      className={`fibre serif shrink-0 select-none rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        background: "var(--surface)",
        boxShadow: "inset 0 0 0 1px var(--divider)",
        color: "var(--fg-muted)",
        fontSize: Math.round(size * 0.395),
        lineHeight: 1,
        // the cap sits a touch high in the circle at its natural baseline
        paddingTop: Math.round(size * 0.045),
      }}
    >
      {initial}
    </span>
  );
}

export function DishPhoto({ src, alt, name, size = 76, className = "" }: { src: string; alt: string; name?: string; size?: number; className?: string }) {
  if (!src) return <MonogramTile name={name ?? alt ?? ""} size={size} className={className} />;
  return (
    <img src={src} alt={alt} width={size} height={size} loading="lazy" decoding="async" className={`shrink-0 rounded-full object-cover ${className}`} style={{ width: size, height: size, filter: TREATMENT, background: "#241f19" }} />
  );
}

export function RoomPhoto({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} width={780} height={904} decoding="async" fetchPriority="high" className="block h-[452px] w-full object-cover object-top" style={{ filter: TREATMENT, background: "#241f19" }} />;
}
