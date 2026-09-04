// Money is integer kobo everywhere. This is the only place kobo becomes a string.

// VAT at 7.5%, rounded to the nearest whole naira so no figure on a receipt carries
// decimals: prices are whole naira, so the subtotal, the VAT and the total all are.
export const VAT_RATE = 0.075;
export function vatKobo(subtotalKobo: number): number {
  if (!Number.isInteger(subtotalKobo)) throw new TypeError(`vatKobo expects integer kobo, received ${subtotalKobo}`);
  return Math.round((subtotalKobo * VAT_RATE) / 100) * 100;
}

export function formatNaira(kobo: number): string {
  if (!Number.isInteger(kobo)) {
    throw new TypeError(`formatNaira expects integer kobo, received ${kobo}`);
  }
  const sign = kobo < 0 ? "-" : "";
  const abs = Math.abs(kobo);
  const naira = Math.floor(abs / 100);
  const rest = abs % 100;
  const grouped = naira.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const minor = rest === 0 ? "" : `.${rest.toString().padStart(2, "0")}`;
  return `${sign}₦${grouped}${minor}`;
}
