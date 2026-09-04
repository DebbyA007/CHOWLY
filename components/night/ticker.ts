"use client";

import { useEffect, useRef, useState } from "react";
import { animate, utils } from "animejs";

// A number that ticks from its last value to its next instead of jumping. Under reduced
// motion it simply changes.
export function useTicker(value: number, reduce: boolean, duration = 320): number {
  const [shown, setShown] = useState(value);
  const last = useRef(value);
  useEffect(() => {
    if (reduce || last.current === value) {
      last.current = value;
      setShown(value);
      return;
    }
    const proxy = { n: last.current };
    const target = value;
    const run = animate(proxy, { n: target, duration, ease: "outQuad", modifier: utils.round(0), onUpdate: () => setShown(proxy.n) });
    last.current = value;
    return () => {
      run.pause();
      setShown(target);
    };
  }, [value, reduce, duration]);
  return shown;
}
