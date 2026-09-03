// Money is integer kobo everywhere. This is the only place kobo becomes a string.

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
