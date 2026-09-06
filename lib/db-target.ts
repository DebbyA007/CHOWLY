// Which database a command is about to write to, and whether it is allowed to.
//
// The failure this exists to prevent happened on 6 September 2026. Development and
// production shared one Neon database. Reseeding it from a feature branch replaced the
// menu everywhere, and the deployed app, still running the old code, dropped to six rows
// with four of them marked sold out. Nothing was corrupt and no order lost its lines, but
// the live link was degraded until the branch merged. A data change on a branch was a
// production change.
//
// The fix is two things, and this file is the second one. First, development points at
// its own Neon branch, which has its own endpoint host. Second, anything destructive
// checks the host it is pointed at against the production host and refuses to touch it.
// The second holds even when the first has not been done yet, or has been undone by a
// copied .env, which is exactly when it is needed.

export type Target = { host: string; database: string; pooled: boolean };

// The host and database, and nothing else. A connection string carries a password, so it
// is never returned, logged or put in an error message.
export function describeTarget(url: string): Target {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL is not a URL. Check .env.");
  }
  if (!parsed.hostname) throw new Error("DATABASE_URL has no host. Check .env.");
  return {
    host: parsed.hostname,
    database: parsed.pathname.replace(/^\//, "") || "(default)",
    pooled: parsed.hostname.includes("-pooler"),
  };
}

// Neon gives each branch its own endpoint, and the pooled and direct strings for one
// branch differ only by the "-pooler" suffix. Comparing on the endpoint rather than the
// whole host means PRODUCTION_DB_HOST can be either of them and still match.
export function sameEndpoint(a: string, b: string): boolean {
  const endpoint = (host: string) => host.trim().toLowerCase().replace("-pooler", "");
  return endpoint(a) !== "" && endpoint(a) === endpoint(b);
}

export type Verdict = { allowed: true; target: Target } | { allowed: false; target: Target; reason: string };

// PRODUCTION_DB_HOST is the guard. Set it and a destructive command refuses to run
// against that host. Leave it unset and nothing is guarded, which is stated out loud
// rather than passing quietly, because a guard that is silently off is worse than none.
type Env = Record<string, string | undefined>;

export function checkDestructive(env: Env): Verdict {
  const url = env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Load .env before running this.");
  const target = describeTarget(url);
  const production = env.PRODUCTION_DB_HOST?.trim();
  if (!production) {
    return { allowed: true, target };
  }
  if (!sameEndpoint(target.host, production)) {
    return { allowed: true, target };
  }
  // The override is deliberately long and deliberately not a boolean, so it cannot be
  // set by habit, by a stale shell, or by copying a line from a script.
  if (env.ALLOW_PRODUCTION_WRITE === "yes-i-mean-the-live-database") {
    return { allowed: true, target };
  }
  return {
    allowed: false,
    target,
    reason:
      `This would write to the production database (${target.host}), which is the one the live link reads.\n` +
      `Point DATABASE_URL and DIRECT_URL at the development branch instead. docs/DATABASE.md has the steps.\n` +
      `If you really do mean production, set ALLOW_PRODUCTION_WRITE=yes-i-mean-the-live-database for that one command.`,
  };
}

// Whether the guard is armed at all, for the line a command prints before it starts.
export function guardState(env: Env): "armed" | "off" {
  return env.PRODUCTION_DB_HOST?.trim() ? "armed" : "off";
}
