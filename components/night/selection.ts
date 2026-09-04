"use client";

import { useSyncExternalStore } from "react";

// Which of the session's orders the Order and Pay tabs mean. Kept for the session so a
// guest can look at an earlier receipt and come back. Not identity.
const KEY = "chowly-order";
const EVENT = "chowly:order-selected";

function read(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
export function useSelectedOrder(): string | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
export function selectOrder(id: string | null): void {
  try {
    if (id) window.sessionStorage.setItem(KEY, id);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    // nothing kept
  }
  window.dispatchEvent(new Event(EVENT));
}
