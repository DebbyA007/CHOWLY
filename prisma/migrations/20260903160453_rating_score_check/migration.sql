-- DELTA 10: Prisma cannot express a check constraint, so this migration is written by
-- hand. The database is the last line of defence for the score range; Zod validates
-- first, but a bad row can never land regardless of which code path wrote it.
ALTER TABLE "Rating" ADD CONSTRAINT rating_score_range CHECK (score BETWEEN 1 AND 5);
