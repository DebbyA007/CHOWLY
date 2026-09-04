import { z } from "zod";
// The extension is spelled out so plain Node can run the unit tests for this file.
import { orderIdSchema } from "./schemas.ts";

// Demo controls for the art-direction walkthroughs: a fast-forward that backdates one of
// the caller's own orders so the late state is reachable in seconds, and a reset that
// deletes the caller's own orders so a walkthrough cleans up after itself.
//
// Three layers keep this out of the real product. The route answers 404 unless
// DEMO_CONTROLS is exactly "true", which production never sets. Every action is scoped
// to the session's own orders through the same ownership query the real routes use.
// And nothing in the customer or waiter flows renders the control; only the walkthrough
// routes under /directions-2 do.
type Env = Record<string, string | undefined>;

export function demoControlsEnabled(env: Env = process.env): boolean {
  return env.DEMO_CONTROLS?.trim() === "true";
}

export const MAX_FAST_FORWARD_MINUTES = 600;

export const demoSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("fast-forward"),
    orderId: orderIdSchema,
    minutes: z.number().int().min(1).max(MAX_FAST_FORWARD_MINUTES),
  }),
  z.strictObject({ action: z.literal("reset") }),
]);
export type DemoInput = z.infer<typeof demoSchema>;
