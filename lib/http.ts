import { NextResponse } from "next/server";

// An error that already knows its HTTP status. Route handlers throw these and the
// handle() wrapper turns them into JSON, so the message a person reads is the one the
// code chose, never a stack trace.
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonError(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) return jsonError(error.status, error.message);
    console.error(error);
    return jsonError(500, "Something went wrong on the server. Try again, and tell the waiter if it keeps happening.");
  }
}
