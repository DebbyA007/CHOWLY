import { HttpError } from "./http";

// Per-session rate limits, counted in the database rather than in process memory, so
// they hold across serverless instances and restarts. Each caller passes the count
// query for its own model; the window is a timestamp the caller compares against.
export function windowStart(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

export async function assertUnderLimit(
  what: string,
  limit: number,
  windowMinutes: number,
  count: () => Promise<number>,
): Promise<void> {
  if ((await count()) >= limit) {
    throw new HttpError(
      429,
      `Too many ${what} from this table in the last ${windowMinutes} minutes. Wait a little and try again.`,
    );
  }
}
