// An error that already knows its HTTP status. Route handlers throw these and the
// handle() wrapper in lib/http.ts turns them into JSON, so the message a person reads
// is the one the code chose, never a stack trace. Kept free of framework imports so the
// modules that throw it can be unit tested under plain Node.
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
