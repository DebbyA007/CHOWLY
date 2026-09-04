// The entrance choreography plays once per session; after that a screen shows at once
// with a short fade. Not identity, so sessionStorage is fine.
export function firstVisit(key: string): boolean {
  try {
    const name = `chowly-seen-${key}`;
    if (window.sessionStorage.getItem(name)) return false;
    window.sessionStorage.setItem(name, "1");
    return true;
  } catch {
    return true;
  }
}
