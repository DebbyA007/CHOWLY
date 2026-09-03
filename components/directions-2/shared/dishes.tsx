"use client";

// The fourteen dishes, drawn once as vector geometry and printed in each direction's
// material. Every shape carries a role, and the material decides how a role is rendered:
// gouache fills it flat with edges that do not quite meet; ink draws its outline in one
// colour and lays a second colour over it a hair out of register; glaze fills it and
// pools a darker edge around it, on a plate with crazing. No photography anywhere.
export type Material = "gouache" | "ink" | "glaze";
export type Role = "plate" | "rim" | "rice" | "tomato" | "green" | "meat" | "ochre" | "cream" | "glass" | "dark" | "crimson" | "white";

type Shape =
  | { k: "c"; cx: number; cy: number; r: number; role: Role }
  | { k: "e"; cx: number; cy: number; rx: number; ry: number; role: Role; rot?: number }
  | { k: "r"; x: number; y: number; w: number; h: number; role: Role; rx?: number; rot?: number }
  | { k: "p"; d: string; role: Role };

const plate: Shape[] = [
  { k: "c", cx: 60, cy: 60, r: 54, role: "plate" },
  { k: "c", cx: 60, cy: 60, r: 44, role: "rim" },
];
const bowl: Shape[] = [
  { k: "c", cx: 60, cy: 60, r: 50, role: "plate" },
  { k: "c", cx: 60, cy: 60, r: 40, role: "rim" },
];
const dots = (cx: number, cy: number, r: number, n: number, seed: number, role: Role): Shape[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + seed;
    const d = r * (0.35 + 0.55 * (((i * 7 + seed * 13) % 10) / 10));
    return { k: "c", cx: +(cx + Math.cos(a) * d).toFixed(1), cy: +(cy + Math.sin(a) * d).toFixed(1), r: 1.8, role };
  });

const puffs: [number, number][] = [[44, 46], [64, 42], [82, 52], [40, 68], [60, 66], [78, 74]];

export const dishes: Record<string, Shape[]> = {
  item_grilled_steak: [
    ...plate,
    { k: "p", d: "M 34 46 C 40 36, 82 34, 88 46 C 94 58, 86 80, 72 84 C 56 88, 36 80, 32 66 Z", role: "meat" },
    { k: "r", x: 40, y: 50, w: 40, h: 2, role: "dark", rot: -18 },
    { k: "r", x: 44, y: 62, w: 40, h: 2, role: "dark", rot: -18 },
    { k: "e", cx: 84, cy: 78, rx: 9, ry: 5, role: "green" },
  ],
  item_grilled_catfish: [
    ...plate,
    { k: "p", d: "M 22 60 C 34 44, 70 40, 92 52 L 104 44 L 100 60 L 104 76 L 92 68 C 70 80, 34 76, 22 60 Z", role: "meat" },
    { k: "c", cx: 32, cy: 58, r: 2, role: "dark" },
    { k: "e", cx: 50, cy: 88, rx: 12, ry: 5, role: "ochre" },
    { k: "e", cx: 76, cy: 90, rx: 12, ry: 5, role: "ochre" },
  ],
  item_pounded_yam_egusi: [
    ...bowl,
    { k: "p", d: "M 24 66 C 24 50, 52 44, 74 52 C 94 60, 96 78, 80 88 C 60 96, 26 86, 24 66 Z", role: "green" },
    { k: "c", cx: 70, cy: 46, r: 20, role: "white" },
    ...dots(50, 70, 16, 7, 2, "meat"),
  ],
  item_suya_platter: [
    ...plate,
    { k: "r", x: 26, y: 44, w: 70, h: 2, role: "dark", rot: -12 },
    { k: "r", x: 26, y: 62, w: 70, h: 2, role: "dark", rot: -12 },
    { k: "r", x: 26, y: 80, w: 70, h: 2, role: "dark", rot: -12 },
    ...[40, 56, 72].flatMap((x, i) => [46, 64, 82].map((y) => ({ k: "r", x: x - 5, y: y - 7 - i * 2 - Math.round((y - 46) * 0.2), w: 11, h: 9, rx: 2, role: "meat" }) as Shape)),
    { k: "c", cx: 96, cy: 84, r: 6, role: "cream" },
    { k: "c", cx: 96, cy: 84, r: 3, role: "rim" },
  ],
  item_goat_pepper_soup: [
    ...bowl,
    { k: "c", cx: 60, cy: 60, r: 36, role: "ochre" },
    ...dots(60, 60, 26, 6, 1, "meat"),
    { k: "e", cx: 74, cy: 44, rx: 8, ry: 3.5, role: "green", rot: -30 },
  ],
  item_jollof_rice: [
    ...plate,
    { k: "p", d: "M 26 70 C 28 46, 56 40, 74 48 C 92 56, 94 76, 76 86 C 56 94, 26 88, 26 70 Z", role: "tomato" },
    ...dots(56, 68, 20, 9, 3, "dark"),
    { k: "p", d: "M 78 44 C 90 40, 100 50, 96 62 C 92 70, 80 66, 78 56 Z", role: "meat" },
    { k: "e", cx: 40, cy: 94, rx: 12, ry: 4.5, role: "ochre", rot: -8 },
  ],
  item_eggs_benedict: [
    ...plate,
    { k: "c", cx: 44, cy: 62, r: 17, role: "meat" },
    { k: "c", cx: 78, cy: 62, r: 17, role: "meat" },
    { k: "c", cx: 44, cy: 60, r: 14, role: "white" },
    { k: "c", cx: 78, cy: 60, r: 14, role: "white" },
    { k: "c", cx: 44, cy: 60, r: 6, role: "ochre" },
    { k: "c", cx: 78, cy: 60, r: 6, role: "ochre" },
    { k: "e", cx: 60, cy: 86, rx: 9, ry: 3.5, role: "green" },
  ],
  item_puff_puff: [
    ...plate,
    ...puffs.map(([x, y]) => ({ k: "c", cx: x, cy: y, r: 10, role: "meat" }) as Shape),
    ...puffs.map(([x, y]) => ({ k: "c", cx: x - 3, cy: y - 3, r: 3, role: "cream" }) as Shape),
  ],
  item_mojito: [
    { k: "r", x: 40, y: 18, w: 40, h: 88, rx: 4, role: "glass" },
    { k: "r", x: 44, y: 40, w: 32, h: 62, rx: 3, role: "cream" },
    { k: "e", cx: 54, cy: 62, rx: 6, ry: 3.5, role: "green", rot: -30 },
    { k: "e", cx: 66, cy: 78, rx: 6, ry: 3.5, role: "green", rot: 20 },
    { k: "c", cx: 60, cy: 92, r: 5, role: "green" },
    { k: "r", x: 70, y: 8, w: 3, h: 60, role: "dark", rot: 8 },
  ],
  item_chapman: [
    { k: "r", x: 38, y: 16, w: 44, h: 90, rx: 6, role: "glass" },
    { k: "r", x: 42, y: 34, w: 36, h: 68, rx: 4, role: "tomato" },
    { k: "e", cx: 60, cy: 40, rx: 16, ry: 4, role: "ochre" },
    { k: "c", cx: 78, cy: 22, r: 8, role: "green" },
    { k: "c", cx: 78, cy: 22, r: 3, role: "cream" },
  ],
  item_palm_wine: [
    { k: "p", d: "M 22 48 C 22 30, 98 30, 98 48 C 98 84, 80 104, 60 104 C 40 104, 22 84, 22 48 Z", role: "ochre" },
    { k: "e", cx: 60, cy: 48, rx: 34, ry: 9, role: "cream" },
    { k: "e", cx: 60, cy: 48, rx: 26, ry: 6, role: "white" },
  ],
  item_merlot_2018: [
    { k: "p", d: "M 30 30 C 30 62, 44 72, 60 72 C 76 72, 90 62, 90 30 Z", role: "glass" },
    { k: "p", d: "M 33 44 C 36 62, 46 68, 60 68 C 74 68, 84 62, 87 44 Z", role: "crimson" },
    { k: "r", x: 58, y: 72, w: 4, h: 24, role: "glass" },
    { k: "e", cx: 60, cy: 100, rx: 20, ry: 4, role: "glass" },
  ],
  item_zobo: [
    { k: "r", x: 36, y: 20, w: 48, h: 86, rx: 5, role: "glass" },
    { k: "r", x: 40, y: 32, w: 40, h: 70, rx: 4, role: "crimson" },
    { k: "c", cx: 52, cy: 46, r: 4, role: "glass" },
    { k: "c", cx: 66, cy: 58, r: 3, role: "glass" },
    { k: "e", cx: 80, cy: 26, rx: 7, ry: 3.5, role: "green", rot: -20 },
  ],
  item_chilled_malt: [
    { k: "r", x: 50, y: 6, w: 20, h: 20, rx: 3, role: "dark" },
    { k: "p", d: "M 44 26 L 76 26 L 82 40 L 82 100 C 82 106, 38 106, 38 100 L 38 40 Z", role: "dark" },
    { k: "r", x: 44, y: 52, w: 32, h: 26, rx: 2, role: "cream" },
    { k: "r", x: 48, y: 58, w: 24, h: 4, role: "tomato" },
  ],
};

export type DishPalette = Record<Role, string> & { line: string; craze: string; second: string };

const shapeAttrs = (s: Shape): Record<string, string | number> => {
  if (s.k === "c") return { cx: s.cx, cy: s.cy, r: s.r };
  if (s.k === "e") return { cx: s.cx, cy: s.cy, rx: s.rx, ry: s.ry, ...(s.rot ? { transform: `rotate(${s.rot} ${s.cx} ${s.cy})` } : {}) };
  if (s.k === "r") return { x: s.x, y: s.y, width: s.w, height: s.h, rx: s.rx ?? 0, ...(s.rot ? { transform: `rotate(${s.rot} ${s.x + s.w / 2} ${s.y + s.h / 2})` } : {}) };
  return { d: s.d };
};
const Tag = ({ s, ...rest }: { s: Shape } & Record<string, unknown>) => {
  const a = shapeAttrs(s);
  if (s.k === "c") return <circle {...a} {...rest} />;
  if (s.k === "e") return <ellipse {...a} {...rest} />;
  if (s.k === "r") return <rect {...a} {...rest} />;
  return <path {...a} {...rest} />;
};

export function Dish({ id, material, palette, size = 120, className = "", title }: { id: string; material: Material; palette: DishPalette; size?: number; className?: string; title?: string }) {
  const shapes = dishes[id] ?? plate;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {material === "gouache"
        ? shapes.map((s, i) => (
            <g key={i}>
              {/* gouache: a second coat a hair off, so no edge quite meets */}
              <Tag s={s} fill={palette[s.role]} opacity={0.55} transform={`translate(${(i % 3) - 1} ${((i * 7) % 3) - 1})`} />
              <Tag s={s} fill={palette[s.role]} />
            </g>
          ))
        : material === "ink"
          ? shapes.map((s, i) => (
              <g key={i}>
                {/* ink: the second colour laid down first, out of register, then the line */}
                {s.role !== "plate" && s.role !== "rim" && s.role !== "white" ? <Tag s={s} fill={palette.second} opacity={0.5} transform="translate(1.6 1.4)" /> : null}
                <Tag s={s} fill={s.role === "plate" ? palette.plate : "none"} stroke={palette.line} strokeWidth={s.role === "rim" ? 0.8 : 1.6} strokeLinejoin="round" />
              </g>
            ))
          : shapes.map((s, i) => (
              <g key={i}>
                {/* glaze: the darker pooled edge behind, the colour on top, crazing on the plate */}
                <Tag s={s} fill={palette.line} opacity={0.35} transform="translate(0 1.8) scale(1.02) translate(-1.2 -1.2)" />
                <Tag s={s} fill={palette[s.role]} />
                {s.role === "plate" ? <path d="M 30 40 L 44 52 L 40 70 M 84 30 L 76 48 L 88 62 M 52 96 L 62 84 L 78 92" fill="none" stroke={palette.craze} strokeWidth="0.6" /> : null}
              </g>
            ))}
    </svg>
  );
}
