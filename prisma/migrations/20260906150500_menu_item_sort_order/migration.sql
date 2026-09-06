-- DELTA 15: a printed menu has an order, and it is not alphabetical.
ALTER TABLE "MenuItem" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
