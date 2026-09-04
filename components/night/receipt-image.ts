"use client";

import { clockDate, shortName } from "@/lib/clock";
import type { SerializedOrder } from "@/lib/orders";

// The receipt, drawn again on a canvas so it can be saved to the phone as the piece of
// paper it is on screen: the perforation, the ruled lines, the fibre in the surface,
// the numerals struck into it, the stamp and the torn foot.
//
// Nothing was added to the dependencies for this. The two obvious packages both render
// the DOM by way of an SVG foreignObject, which on iOS Safari, the device this is for,
// drops self-hosted webfonts often enough to be untrustworthy, and neither reproduces a
// clip-path, which is what tears the foot. Drawing it here is about two hundred lines,
// it is exact, and it behaves the same in every engine. It also means the saved file is
// vector-drawn at whatever scale is asked for rather than a screenshot blown up.

const CARD_W = 346;
const PAD = 22;
const BG = "#14120f";
const SURFACE = "#1d1a16";
const FG = "#f0ebe1";
const MUTED = "#9a9287";
const ACCENT = "#d2a24c";
const TORN = 9;

// The dashes of the printed rule, taken from the same widths and weights the stylesheet
// uses, so the line in the file is the line on the screen.
const RULE = [
  [0, 34, 1, 0.22], [36, 22, 2, 0.16], [60, 46, 1, 0.28], [110, 17, 1, 0.14],
  [129, 31, 2, 0.18], [164, 38, 1, 0.26], [206, 12, 1, 0.12], [222, 18, 2, 0.2],
] as const;

// A fixed sequence, so the fibre is the same every time a receipt is saved.
function flecks(count: number) {
  let seed = 7;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: count }, () => ({ x: next(), y: next(), r: 0.5 + next() * 0.7, o: 0.06 + next() * 0.09 }));
}

type Fonts = { serif: string; sans: string };

function readFonts(): Fonts {
  const serifEl = document.querySelector(".serif");
  const serif = serifEl ? getComputedStyle(serifEl).fontFamily : "Georgia, serif";
  const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  return { serif, sans };
}

export function receiptFileName(order: SerializedOrder): string {
  return `chowly-receipt-${order.payment?.receiptNo ?? "0000"}-order-${order.reference}.png`;
}

export async function renderReceipt(order: SerializedOrder): Promise<Blob | null> {
  const payment = order.payment;
  if (!payment) return null;
  if (document.fonts?.ready) await document.fonts.ready;
  const fonts = readFonts();
  // Measure first on a throwaway context, so the canvas is exactly as tall as the paper.
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return null;
  const height = layout(probe, order, fonts, null);

  const scale = Math.min(4, Math.max(2, Math.round(window.devicePixelRatio || 2)));
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil((CARD_W + PAD * 2) * scale);
  canvas.height = Math.ceil(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.textBaseline = "alphabetic";
  layout(ctx, order, fonts, ctx);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

// One pass measures and the same pass draws, so the two can never disagree: with a null
// target it only advances y, with a context it also paints.
function layout(m: CanvasRenderingContext2D, order: SerializedOrder, fonts: Fonts, ctx: CanvasRenderingContext2D | null): number {
  const payment = order.payment!;
  const left = PAD;
  const right = PAD + CARD_W;
  const inner = 20;
  const x0 = left + inner;
  const x1 = right - inner;
  const font = (weight: number | string, size: number, family: string) => `${weight} ${size}px ${family}`;

  const text = (s: string, x: number, y: number, align: CanvasTextAlign, f: string, colour: string, struck = false) => {
    if (!ctx) return;
    ctx.font = f;
    ctx.textAlign = align;
    if (struck) {
      ctx.fillStyle = "rgba(240,235,225,0.22)";
      ctx.fillText(s, x, y - 1);
    }
    ctx.fillStyle = colour;
    ctx.fillText(s, x, y);
  };
  const rule = (y: number, soft = false) => {
    if (!ctx) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y, x1 - x0, 2);
    ctx.clip();
    // tiled at its own width, the way the stylesheet repeats it, not stretched to fit
    for (let tile = 0; tile < x1 - x0; tile += 240) {
      for (const [rx, w, h, o] of RULE) {
        ctx.fillStyle = `rgba(240,235,225,${soft ? o * 0.72 : o})`;
        ctx.fillRect(x0 + tile + rx, y + (h === 1 ? 0.5 : 0), w, h);
      }
    }
    ctx.restore();
  };

  let y = PAD;
  const cardTop = y;

  // header
  y += 22;
  y += 24;
  text("The Golden Gate", left + CARD_W / 2, y, "center", font(400, 24, fonts.serif), FG);
  y += 18;
  text("13 Ubah Street, Berger, Lagos", left + CARD_W / 2, y, "center", font(400, 11.5, fonts.sans), MUTED);
  y += 16;
  text(clockDate(payment.paidAt), left + CARD_W / 2, y, "center", font(400, 11.5, fonts.sans), MUTED);
  y += 16;
  text(`Order #${order.reference} · Table ${order.tableNo} · Receipt ${payment.receiptNo ?? "0000"}`, left + CARD_W / 2, y, "center", font(400, 11.5, fonts.sans), MUTED);
  y += 20;
  // the perforation
  if (ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(240,235,225,0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(left, y + 0.5);
    ctx.lineTo(right, y + 0.5);
    ctx.stroke();
    ctx.restore();
  }

  // the lines
  y += 18;
  for (const line of order.items) {
    y += 16;
    text(`${line.quantity}×`, x0, y, "left", font(400, 14, fonts.sans), MUTED);
    m.font = font(400, 14, fonts.sans);
    const w = m.measureText(`${line.quantity}×`).width;
    text(line.name, x0 + w + 10, y, "left", font(400, 14, fonts.sans), FG);
    text(line.subtotal, x1, y, "right", font(600, 14, fonts.sans), FG, true);
    y += 8;
  }
  y += 10;
  rule(y);
  y += 12;
  y += 12;
  text("Subtotal", x0, y, "left", font(400, 12.5, fonts.sans), MUTED);
  text(order.subtotal, x1, y, "right", font(400, 12.5, fonts.sans), MUTED);
  y += 18;
  text("VAT 7.5%", x0, y, "left", font(400, 12.5, fonts.sans), MUTED);
  text(order.vat, x1, y, "right", font(400, 12.5, fonts.sans), MUTED);
  y += 13;
  rule(y);
  y += 14;
  y += 24;
  text(paidBy(payment.method), x0, y, "left", font(600, 13.5, fonts.sans), FG);
  text(payment.amount, x1, y, "right", font(400, 32, fonts.serif), ACCENT, true);
  y += 20;
  text("Pretend payment. No money moved.", x0, y, "left", font(400, 11.5, fonts.sans), MUTED);
  y += 28;
  const cardBottom = y;

  // Painted last so it sits under everything: the card, its fibre, the stamp and the
  // torn foot. Measuring runs the same path and simply skips the painting.
  if (ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.beginPath();
    paperPath(ctx, left, cardTop, CARD_W, cardBottom - cardTop);
    ctx.clip();
    for (const f of flecks(120)) {
      ctx.fillStyle = `rgba(240,235,225,${f.o.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(left + f.x * CARD_W, cardTop + f.y * (cardBottom - cardTop), f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    paperPath(ctx, left, cardTop, CARD_W, cardBottom - cardTop);
    ctx.fillStyle = SURFACE;
    ctx.fill();
    ctx.restore();
    // the stamp, over the paper, landed once
    ctx.save();
    ctx.translate(right - 46, cardTop + 30);
    ctx.rotate((-8 * Math.PI) / 180);
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = ACCENT;
    ctx.fillStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.font = font(700, 13, fonts.sans);
    ctx.textAlign = "center";
    const tw = ctx.measureText("PAID").width;
    roundRect(ctx, -tw / 2 - 9, -12, tw + 18, 22, 4);
    ctx.stroke();
    ctx.fillText("PAID", 0, 3);
    ctx.restore();
    // the ground behind it all
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, CARD_W + PAD * 2, cardBottom + 400);
    ctx.restore();
  }

  // who looked after the table, under the paper as it is on screen
  y += 22;
  const staff = order.staff;
  const credit = [staff.waiter ? `Served by ${shortName(staff.waiter.name)}` : null, staff.chef ? `Chef ${staff.chef.name}` : null, staff.bartender ? `Bar ${staff.bartender.name}` : null]
    .filter(Boolean)
    .join(" · ");
  if (credit) text(credit, left, y, "left", font(400, 11.5, fonts.sans), MUTED);
  y += 18;
  if (order.rating) text(`Rated ${order.rating.score} of 5`, left, y, "left", font(400, 11.5, fonts.sans), MUTED);
  y += PAD;
  return y;
}

const paidBy = (method: string) => (method === "CARD" ? "Paid by card" : method === "CASH" ? "Paid by cash at the till" : "Paid by bank transfer");

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Rounded at the head where the paper is cut square, torn along the foot.
function paperPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = 16;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - TORN);
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const px = x + w - ((i + 1) * w) / steps;
    ctx.lineTo(px, y + h - (i % 2 === 0 ? 0 : TORN));
  }
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
