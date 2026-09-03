"use client";

import { useEffect, useState } from "react";
import { loadSoundPreference, onSoundChange, play, setSoundEnabled } from "@/lib/sound";

// The sound switch hangs beside the role tags. Off by default; the choice is kept as a
// convenience in localStorage. Switching it on plays the printer once so the person
// hears what they turned on.
export function SoundTag() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(loadSoundPreference());
    return onSoundChange(setOn);
  }, []);

  function toggle() {
    const next = !on;
    setSoundEnabled(next);
    if (next) void play("print");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={`relative -mt-[3px] pb-2 pt-4 text-sm font-bold ${on ? "brass-plate" : "border-2 border-brass-dark bg-steel-dark text-brass-light"}`}
      style={{ paddingLeft: 14, paddingRight: 14 }}
    >
      <span className="absolute left-1/2 top-1 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-soot bg-steel" aria-hidden="true" />
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
