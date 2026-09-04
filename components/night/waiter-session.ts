// Who is on the floor. Whoever picks up the phone picks themselves from the roster once,
// and the choice is kept for the session; every order they mark served records them.
// Not identity: there is no login by design, so sessionStorage is the right place.
const KEY = "chowly-waiter";

export function readWaiter(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function writeWaiter(id: string | null): void {
  try {
    if (id) window.sessionStorage.setItem(KEY, id);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    // the choice just will not survive a reload
  }
}
