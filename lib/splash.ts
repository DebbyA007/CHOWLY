// The splash's fixed numbers, shared by the inline script in the root layout (which
// reads the cookie before first paint) and the component that runs the splash.
export const SPLASH_COOKIE = "chowly-splash";
export const HANDOFF_EVENT = "chowly:splash-handoff";
// The mark's arc is 136 user units long in its 100 by 100 viewBox: the dasharray, and
// the dashoffset still to fill. The same mechanic as the countdown ring, which empties
// the way this fills.
export const ARC_LENGTH = 136;
export const ARC_SWEEP_DEG = 250;
export const PARK_DEG = 305;
export const FLOOR_MS = 800;
export const CEILING_MS = 4000;
