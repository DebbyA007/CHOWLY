-- DELTA 12: where an item is prepared, so the staff an order needs is derived from what
-- was ordered rather than assumed.
CREATE TYPE "Station" AS ENUM ('KITCHEN', 'BAR', 'NONE');

-- DELTA 13: an order the guest withdrew, and when.
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- DELTA 15: the printed menu has a heading and a sub-heading. Added with a default and
-- backfilled from the existing name, because the table is not empty and the column is
-- required; the default is then dropped so new rows must say which section they are in.
ALTER TABLE "Menu" ADD COLUMN "section" TEXT NOT NULL DEFAULT '',
                  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
UPDATE "Menu" SET "section" = "name" WHERE "section" = '';
ALTER TABLE "Menu" ALTER COLUMN "section" DROP DEFAULT;

-- DELTA 12 and DELTA 14 on the item.
ALTER TABLE "MenuItem" ADD COLUMN "priceFrom" BOOLEAN NOT NULL DEFAULT false,
                       ADD COLUMN "station" "Station" NOT NULL DEFAULT 'KITCHEN';

-- DELTA 13 on the order.
ALTER TABLE "Order" ADD COLUMN "cancelledAt" TIMESTAMP(3);
