# CHOWLY build plan

The assignment grades the commit history: "the commit history must show the work as it was
done." So this is the order of work, one commit per step, never squashed and never batched
into a single drop at the end.

Each step lists the commit message to use. Run the app and check the step actually works
before committing it.

---

## Phase 1: foundation

**1. `chore: scaffold next.js app with typescript and tailwind`**
`create-next-app`, App Router, TypeScript strict, Tailwind v4, src dir off. Delete the
starter boilerplate page and the default SVGs in the same commit so nothing generic ships.

**2. `chore: configure security headers and strict typescript`**
`next.config.ts` with CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `X-Frame-Options: DENY`. `tsconfig` strict, no implicit
any, no unchecked indexed access.

**3. `feat: add prisma schema and connect neon`**
Drop in `prisma/schema.prisma`. Add `DATABASE_URL` (Neon pooled) and `DIRECT_URL` (Neon
direct) to `.env`, and a matching `.env.example` with the values blanked. Set
`"build": "prisma generate && next build"`. Run the first migration.

**4. `feat: add rating score check constraint`**
Prisma cannot express a check, so create an empty migration and add
`ALTER TABLE "Rating" ADD CONSTRAINT rating_score_range CHECK (score BETWEEN 1 AND 5);`
by hand. Separate commit because it is a deliberate model decision worth pointing at in
the document.

**5. `feat: seed restaurant, menu, staff and prep times`**
`prisma/seed.ts`. One restaurant. A food menu and a drinks menu. Around fourteen items
carrying name, description, price in kobo and prep time. Three chefs, three bartenders,
three waiters. Prep times should vary enough that the wait time calculation is visibly
doing something: a cocktail at 4 minutes next to a grilled steak at 22.

---

## Phase 2: the data layer, before any UI

**6. `feat: add zod schemas and money helpers`**
Every request shape, plus `formatNaira(kobo)` and the wait time calculation in one place:
`max(prepTime) + 3 * (itemCount - 1)`, capped sensibly. It lives server-side and is unit
tested, because it is the number the whole story hangs on.

**7. `feat: add customer session cookie`**
Signed httpOnly sameSite=lax cookie holding an opaque token. A helper that reads it,
creates the customer row on first visit, and returns the customer. This is what makes the
refresh requirement true for the customer's own view.

**8. `feat: add menu api`**
`GET /api/menu`. Grouped by menu type, unavailable items excluded.

**9. `feat: add order placement api`**
`POST /api/orders`. Accepts item IDs, quantities and a table number. Nothing else. Prices,
subtotals, total and wait minutes are all read or computed from the database. Snapshots
price and prep time onto each line. Returns the order with its reference.

**10. `feat: add order detail api with derived delay`**
`GET /api/orders/[id]`. Ownership check against the session. Returns `isDelayed` computed
at read time, never stored.

**11. `feat: add waiter assignment api`**
`GET /api/waiter/orders` for the rail. `PATCH /api/orders/[id]/assign` records waiter, chef
and bartender and sets status to SERVED with `servedAt`. Gated by the `STAFF_PIN` compare.

**12. `feat: add complaint and rating apis`**
Both check ownership. Rating is upsert-safe against the unique constraint. Rate limited.

**13. `feat: add pretend payment api`**
`POST /api/orders/[id]/pay`. One `prisma.$transaction`: insert the payment with
`isPretend: true`, flip status to PAID, set `paidAt`. A second call against the same order
returns the existing payment rather than erroring or duplicating.

---

## Phase 3: the interface

**14. `feat: add enamel design tokens and typography`**
The token block from `CLAUDE.md` into `app/globals.css`. Bricolage Grotesque and
Instrument Sans via `next/font/google`. The enamel rim and speckle as reusable utilities.

**15. `feat: add role switch`**
Customer and waiter. A persistent control, honest about what it is. The waiter side prompts
for the staff PIN once per session.

**16. `feat: add menu browsing with entrance sequence`**
The menu grid. This is where the single orchestrated load sequence lives: rims draw in,
the restaurant name resolves, plates settle from centre. Everything inside a `createScope`
with the reduced motion branch.

**17. `feat: add cart and order submission`**
Motion path arc to the cart, spring on the badge, timeline that folds the cart into a
printed ticket on submit.

**18. `feat: add live countdown ring`**
The hero. SVG `stroke-dashoffset` driven by real elapsed time against `waitMinutes`.
Flame while on time, pepper once it crosses, leaf when served. Survives a refresh because
it is computed from `placedAt`, not from a timer started on mount.

**19. `feat: add waiter ticket rail`**
SWR polling at 3s. Draggable tickets from Placed to Served, with button and keyboard
equivalents for the same action. The assignment dialog records chef and bartender.

**20. `feat: add complaint and rating flow`**
The complaint entry point only appears once the ring has crossed into delay. The rating is
a one to five control that submits with the complaint or on its own.

**21. `feat: add payment and receipt`**
The pay button, the stamp animation, the receipt. "Pretend payment" is legible on the
button, on the receipt and in the order record. Nothing about it should look like it is
trying to pass for real.

---

## Phase 4: deployment and the document

**22. `chore: deploy to vercel`**
Import the repo. Set the install command to `npm ci --ignore-scripts`. Attach Neon through
the marketplace integration so the env vars inject themselves. Add `STAFF_PIN` and the
cookie secret. Run the seed against production once.

**23. `docs: add readme`**
Per project, not a template. Animated SVG header, a Mermaid ERD of the final schema, the
wait time formula in LaTeX, collapsible sections for setup and environment variables, and
a walkthrough video.

**24. `docs: add submission document`**
The four required sections: how it was built, how AI was used, the behaviour of every
feature step by step, and the stranger's walkthrough including the role switch.

---

## Running throughout

`docs/AI-LOG.md` is appended to at each step as it happens, not reconstructed at the end.
Record what was asked for, what was accepted, what was rejected and why, and what had to be
fixed by hand. The rejections and the corrections carry the marks in that section, and they
are impossible to recall accurately two days later.
