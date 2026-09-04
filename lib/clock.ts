// Times the way the design writes them: "9:04 pm", "3 Sep 2026, 9:38 pm", "12:34".

export function clockTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelve}:${minutes} ${hours < 12 ? "am" : "pm"}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function clockDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${clockTime(date)}`;
}

export function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

// "Ada O." from "Ada Okafor".
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? name;
  const last = parts[1];
  return last ? `${first} ${last[0]}.` : first;
}

// The promise, as the design words it.
export function promiseLabel(waitMinutes: number): string {
  return `Promised in ${waitMinutes} ${waitMinutes === 1 ? "minute" : "minutes"}`;
}
