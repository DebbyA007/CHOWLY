// The guest's table. It arrives on the link the table's card carries (?table=12) and is
// kept for the session; the order form pre-fills it and the guest can change it.
const KEY = "chowly-table";

export function readTable(): string {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("table");
    if (fromUrl && /^[A-Za-z0-9-]{1,8}$/.test(fromUrl)) {
      window.sessionStorage.setItem(KEY, fromUrl);
      return fromUrl;
    }
    return window.sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeTable(table: string): void {
  try {
    if (table) window.sessionStorage.setItem(KEY, table);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    // nothing to keep
  }
}
