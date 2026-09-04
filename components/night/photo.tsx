/* eslint-disable @next/next/no-img-element */
"use client";

// A dish photograph in a circle, and the dining room across the top of the landing.
// Every photograph is served from this origin, and one treatment sits over all of
// them so ten sources read as one shoot: a touch warmer, a touch darker.
const TREATMENT = "sepia(0.18) saturate(1.05) contrast(1.05) brightness(0.9)";

export function DishPhoto({ src, alt, size = 76, className = "" }: { src: string; alt: string; size?: number; className?: string }) {
  return (
    <img src={src} alt={alt} width={size} height={size} loading="lazy" decoding="async" className={`shrink-0 rounded-full object-cover ${className}`} style={{ width: size, height: size, filter: TREATMENT, background: "#241f19" }} />
  );
}

export function RoomPhoto({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} width={780} height={904} decoding="async" fetchPriority="high" className="block h-[452px] w-full object-cover object-top" style={{ filter: TREATMENT, background: "#241f19" }} />;
}
