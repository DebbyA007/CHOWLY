// Every request shape the API accepts. All objects are strict: an unknown key is a
// rejection, which is what stops a client from posting a price, a total or a wait time.
import { z } from "zod";

const id = z.string().trim().min(1).max(64);

export const orderCreateSchema = z.strictObject({
  tableNo: z.string().trim().min(1).max(8),
  items: z
    .array(
      z.strictObject({
        menuItemId: id,
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
});
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

export const assignSchema = z.strictObject({
  waiterId: id,
  chefId: id,
  bartenderId: id,
});
export type AssignInput = z.infer<typeof assignSchema>;

export const complaintSchema = z.strictObject({
  description: z.string().trim().min(3).max(500),
});
export type ComplaintInput = z.infer<typeof complaintSchema>;

export const ratingSchema = z.strictObject({
  score: z.number().int().min(1).max(5),
  comment: z.string().trim().max(300).optional(),
});
export type RatingInput = z.infer<typeof ratingSchema>;

export const paymentSchema = z.strictObject({
  method: z.enum(["CARD", "MOBILE_MONEY", "CASH"]),
});
export type PaymentInput = z.infer<typeof paymentSchema>;

export const orderIdSchema = z.string().regex(/^c[a-z0-9]{20,32}$/, "not an order id");

// A message a person can act on, built from the first issue. Unknown keys get their own
// wording because that is the case that matters most here.
export function describeIssues(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "The request could not be read.";
  if (issue.code === "unrecognized_keys") {
    const keys = issue.keys.join(", ");
    return `Unknown field: ${keys}. Prices and wait times are set by the kitchen, not the client. Send only the fields the API documents.`;
  }
  const path = issue.path.length ? issue.path.join(".") : "body";
  return `${path}: ${issue.message}`;
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; message: string };

export function parseWith<T>(schema: z.ZodType<T>, input: unknown): ParseResult<T> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, message: describeIssues(result.error) };
}
