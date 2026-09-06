/* eslint-disable @next/next/no-img-element */
"use client";

// A dish photograph in a circle, and the dining room across the top of the landing.
// Every photograph is served from this origin, and one treatment sits over all of
// them so ten sources read as one shoot: a touch warmer, a touch darker.
// The photographs are pulled well down and desaturated so that a photograph and a
// monogrammed plate read as the same family of object on this ground. Left brighter,
// a photograph shouts and the tile beside it reads as an empty slot.
const TREATMENT = "sepia(0.24) saturate(0.58) contrast(0.98) brightness(0.5)";

// A dish with no photograph of its own is not a hole in the list. It gets the plate it
// would have been served on: a raised surface, a rim, and its own initial struck into it
// in the display face. Same circle, same size, so the rhythm of the list does not break,
// and no icon, which the design does not use anywhere. It is deliberately heavier than
// the card behind it, because a tile that recedes reads as a missing image rather than
// as the alternative to one. The fibre was dropped: at 76px a texture tile of that
// density catches one or two flecks and often none, so it was decoration with no effect.
export function MonogramTile({ name, size = 76, className = "" }: { name: string; size?: number; className?: string }) {
  const initial = (name.trim().match(/\p{L}/u)?.[0] ?? "?").toUpperCase();
  return (
    <span
      aria-hidden="true"
      data-monogram={initial}
      className={`serif shrink-0 select-none rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        background: "var(--tile)",
        boxShadow: "inset 0 0 0 1px var(--tile-rim)",
        color: "var(--tile-ink)",
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
