"use client";

import { useState } from "react";

// Switching tabs is navigation, not an entrance. The tab bar marks a press, and a
// screen that mounts within a moment of it renders in place with nothing to animate.
// Everything else, a fresh load, the door, an order just placed, is an arrival and
// gets the screen's one entrance.
const TAB_PRESS_WINDOW_MS = 1500;
let pressedAt = 0;

export function markTabPress() {
  pressedAt = Date.now();
}

// Anything that is an arrival rather than a tab press closes the window again, so a
// screen opened just after one does not borrow its "no entrance" from it.
export function clearTabPress() {
  pressedAt = 0;
}

export function arrivedByTab(): boolean {
  return Date.now() - pressedAt < TAB_PRESS_WINDOW_MS;
}

// Read once per mount, before the first paint, so the first frame is already in place.
export function useArrival(): boolean {
  const [entrance] = useState(() => !arrivedByTab());
  return entrance;
}
