"use client";

import { createDraggable, createScope } from "animejs";

// The drag path for serving a ticket, shared by every walkthrough: each ticket's bounds
// are its own resting spot, a pull meets friction and springs back on release, and a
// deliberate pull of 120px along the given axis opens the serving dialog. Not created
// at all under reduced motion, where the button and the keyboard carry the action.
export function attachServeDrag(root: HTMLElement, selector: string, axis: "x" | "y", onPull: (element: HTMLElement) => void) {
  const scope = createScope({ root, mediaQueries: { reduceMotion: "(prefers-reduced-motion)" } }).add((self) => {
    if (self?.matches.reduceMotion) return;
    root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      createDraggable(element, {
        container: [0, 0, 0, 0],
        x: axis === "x",
        y: axis === "y",
        containerFriction: 0.35,
        releaseStiffness: 170,
        releaseDamping: 15,
        dragThreshold: 6,
        onRelease: (d) => {
          if ((axis === "y" ? d.y : d.x) > 120) onPull(element);
        },
      });
    });
  });
  return () => scope.revert();
}
