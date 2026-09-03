// A small soundscape for the pass, off by default, synthesised in the browser with Web
// Audio so nothing is fetched and the CSP stays as it is. Four cues answer four actions:
// a printer feeding a line, a ticket tearing off, a spike or a punch taking a ticket,
// and a stamp coming down. Nothing plays until a person switches sound on.

export type Cue = "print" | "tear" | "spike" | "stamp";

const STORAGE_KEY = "chowly-sound";
let enabled = false;
let context: AudioContext | null = null;
const listeners = new Set<(on: boolean) => void>();

// The preference is a convenience, not an identity, so it may live in localStorage.
export function soundEnabled(): boolean {
  return enabled;
}

export function loadSoundPreference(): boolean {
  try {
    enabled = window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    enabled = false;
  }
  return enabled;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // storage may be unavailable; the switch still works for this page
  }
  if (on) void ensureContext();
  listeners.forEach((listener) => listener(on));
}

export function onSoundChange(listener: (on: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function ensureContext(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;
  if (!context) context = new AudioContext();
  if (context.state === "suspended") await context.resume().catch(() => undefined);
  return context;
}

function noise(ctx: AudioContext, seconds: number): AudioBufferSourceNode {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

export async function play(cue: Cue): Promise<void> {
  if (!enabled) return;
  const ctx = await ensureContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const out = ctx.createGain();
  out.connect(ctx.destination);

  if (cue === "print") {
    // a thermal head buzzing across one line: filtered noise, short
    const source = noise(ctx, 0.14);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2400;
    filter.Q.value = 2.5;
    source.connect(filter).connect(out);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    source.start(t);
    source.stop(t + 0.15);
  } else if (cue === "tear") {
    // paper tearing along the serration: noise sweeping up and dying
    const source = noise(ctx, 0.32);
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.3);
    source.connect(filter).connect(out);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    source.start(t);
    source.stop(t + 0.33);
  } else if (cue === "spike") {
    // a short metallic tick
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.05);
    osc.connect(out);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.16, t + 0.005);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.start(t);
    osc.stop(t + 0.08);
  } else {
    // the stamp: a low thud
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.18);
    osc.connect(out);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.35, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.24);
  }
}
