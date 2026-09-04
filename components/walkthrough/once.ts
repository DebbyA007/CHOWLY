// The entrance choreography plays once per session. After that, arriving on a screen
// again (switching roles and back, say) shows it at once with a short fade, because a
// person who has seen the lamps come on does not need to wait for them again.
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
