import { NextResponse } from "next/server";
import { HttpError } from "./errors";

export { HttpError };

export function jsonError(status: number, message: string, details: Record<string, unknown> = {}): NextResponse {
  return NextResponse.json({ ...details, error: message }, { status });
}

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) return jsonError(error.status, error.message, error.details);
    console.error(error);
    return jsonError(500, "Something went wrong on the server. Try again, and tell the waiter if it keeps happening.");
  }
}
