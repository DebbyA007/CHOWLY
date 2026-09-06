// The human readable order number, "#1042", and the numbers an insert falls back to.
//
// The regression this exists to prevent happened on the deployed app. The reference was
// computed as 1001 plus the number of orders. That is right only while no order has ever
// been deleted, and orders were: five test orders were removed and one, #1009, was kept
// on purpose. With eight orders present and 1009 among them, 1001 plus the count is 1009,
// which is taken. The insert failed on the unique constraint, and because a failed insert
// does not change the count, the retry recomputed the same number. Every order placed
// after that failed with a 503, permanently, until this was changed.
//
// So the reference is derived from the highest number in use, never from a count, and
// each retry takes the next number rather than the same one again.
export const FIRST_REFERENCE = 1001;

export function nextReferences(highestInUse: number | null, attempts = 5): string[] {
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError(`attempts must be a positive integer, received ${attempts}`);
  }
  if (highestInUse !== null && (!Number.isInteger(highestInUse) || highestInUse < 0)) {
    throw new RangeError(`highestInUse must be a non-negative integer or null, received ${highestInUse}`);
  }
  const start = highestInUse === null ? FIRST_REFERENCE : Math.max(highestInUse + 1, FIRST_REFERENCE);
  return Array.from({ length: attempts }, (_, i) => String(start + i));
}
