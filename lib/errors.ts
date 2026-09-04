// An error that already knows its HTTP status. Route handlers throw these and the
// handle() wrapper in lib/http.ts turns them into JSON, so the message a person reads
// is the one the code chose, never a stack trace. Kept free of framework imports so the
// modules that throw it can be unit tested under plain Node.
export class HttpError extends Error {
  readonly status: number;
  // Extra fields for the JSON body, when the client needs more than the sentence:
  // the ids of dishes that sold out, say, so it can take them off the order.
  readonly details: Record<string, unknown>;

  constructor(status: number, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
