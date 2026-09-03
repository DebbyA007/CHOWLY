# CHOWLY: submission document

CHOWLY is a restaurant dining platform. A customer at a table browses the menu, places an
order, watches a live countdown, complains and rates if it runs late, and pays before
leaving. A waiter works a ticket rail, records who cooked and who mixed, and marks orders
served. The interface is a kitchen pass: the customer stands on the kitchen side, their
order is a thermal ticket under a heat lamp, and the lamp is the clock.

- Live: LIVE_URL
- Repository: https://github.com/DebbyA007/CHOWLY
- The AI log, written as the work happened: [`AI-LOG.md`](AI-LOG.md)
- The three art directions and their critique: [`directions/README.md`](directions/README.md), and live at `LIVE_URL/directions`
- Three more directions as clickable walkthroughs and their critique: [`directions-2/README.md`](directions-2/README.md), and live at `LIVE_URL/directions-2`
- Every screen and state: [`screens/README.md`](screens/README.md)

This document has the four required sections: how it was built, how AI was used, the
behaviour of every feature step by step, and a walkthrough a stranger can follow on the
live link.

---

## 1. How it was built

### The process

The build was held to two written documents from the first commit: a rulebook,
[`CLAUDE.md`](../CLAUDE.md), with hard rules for git, dependencies, security, editing,
writing and motion safety, and a plan, [`BUILD-PLAN.md`](BUILD-PLAN.md), with one commit
per step in the order the work would actually happen. The assignment grades the commit
history, so nothing was squashed and nothing was batched into a single drop at the end:
46 commits across five phases, each gated by `npm run typecheck && npm run lint &&
npm run build` before it was made, and each with an entry in the AI log written at the
time.

| Phase | Commits | What landed |
|---|---|---|
| 1. Foundation | 8 | Scaffold, security headers, dependency overrides, Prisma on Neon with two migrations, the seed |
| 2. Data layer | 5 | Zod schemas, money and wait-time helpers, the session cookie, the menu, order placement and order detail APIs |
| 3. Waiter, complaint, payment | 3 | The rail and assignment API, complaint and rating APIs, the idempotent pretend payment |
| 4. Interface | 9 | The first interface, an enamelware direction: tokens, role switch, menu, cart, countdown ring, rail, complaints and ratings, payment |
| 4b. Redesign | 17 | Three art directions built and critiqued, then the whole interface rebuilt as The Pass, the lamp clock, the sound, the open waiter side, the landing page |
| 5. Documents | 2 | This document and the README |

Deployment was moved from the last step to right after the scaffold, so the pipeline
was proven while the app was two files.

### The stack

Next.js 15.5 with the App Router and strict TypeScript; Tailwind v4 with the design
tokens in `app/globals.css`; Prisma 6.19 on PostgreSQL at Neon, the pooled connection for
the app and the direct one for migrations; Zod for every request shape; SWR for the two
views that poll; anime.js 4.5 for motion, every scope carrying a reduced-motion branch;
Fraunces and IBM Plex Mono self-hosted through `next/font`; Web Audio for four
synthesised sound cues; Vercel for hosting with the install command
`npm ci --ignore-scripts`, which is why the build script is `prisma generate && next
build`. Two transitive packages carry npm overrides above their security advisories,
because the only upstream fixes were semver-major; the audit and the proof that neither
reaches the production runtime are in the log.

### The structure

```
app/
  page.tsx                landing: the pass before service
  menu/page.tsx           the customer side: strips, ticket, fire
  order/[id]/page.tsx     the ticket under its lamp
  waiter/page.tsx         the kitchen side: the rail
  directions/             the three art directions, kept as evidence
  api/                    nine route handlers, listed in section 3
  globals.css             tokens, textures, the heat system
components/pass/          every screen of The Pass
  heat.ts                 the lamp clock, computed in one place
  lamp.tsx                a heat lamp and its halftone pool
  menu.tsx, order-ticket.tsx, rail.tsx, settle.tsx, ...
components/directions/    the three prototypes, frozen
lib/                      schemas, money, wait time, session, orders, rate limit, the auth seam
prisma/                   schema, two migrations, the idempotent seed
middleware.ts             mints the session cookie on first visit
docs/                     this document, the AI log, the build plan, the directions, the screens
```

### The data model as finally implemented

`prisma/schema.prisma` is the source of truth. It departs from the coursework ERD in
eleven deliberate ways, each annotated `DELTA` in the schema:

1. `MenuItem.prepTimeMinutes` exists; the assignment requires it, and the wait is
   computed from it.
2. `Order.waitMinutes` is a computed integer. The original stored a string like
   "25 mins", which cannot be compared to a clock.
3. `Order.waiterId`, `chefId` and `bartenderId` are nullable. The customer submits with
   no staff attached; the waiter records all three afterwards. `NOT NULL` would make
   requirement 3 impossible.
4. `OrderStatus` is exactly `PLACED`, `SERVED`, `PAID`. Delayed is not a status. It is
   derived at read time from `placedAt` and `waitMinutes` and never stored, so there is
   no row to hand-set to make the complaint flow work.
5. `placedAt`, `servedAt` and `paidAt` are timestamps. The original split date and time
   into two columns, which cannot be sorted or compared.
6. `OrderItem.unitPriceKobo` and `prepTimeMinutes` are snapshots taken at order time, so
   editing the menu never rewrites a historical order or the payment taken against it.
7. All money is integer kobo. No floats anywhere near a total.
8. `Payment.orderId` is unique, and the insert and the status flip run in one
   transaction. A double-clicked button records once.
9. `Payment.isPretend` defaults to true and is shown wherever the payment is shown.
10. `Rating.orderId` is unique, and `CHECK (score BETWEEN 1 AND 5)` is added by a
    hand-written migration, since Prisma cannot express it. Zod validates first; the
    database is the last line.
11. `Customer.sessionToken` is unique, since there are no logins and the token is the
    identity.

The ERD is drawn in the README.

### Deployment

Vercel imports the repository with the install command set to `npm ci --ignore-scripts`.
Neon is attached through the marketplace integration, which injects `DATABASE_URL`
(pooled) and the direct string used as `DIRECT_URL`. `SESSION_SECRET`, `STAFF_PIN` and
`STAFF_PIN_REQUIRED=false` are set in the dashboard. Migrations were applied with Prisma
against the direct connection and the seed was run against production once and
confirmed by querying the rows back. The security headers are set in `next.config.ts`
and confirmed with `curl -I` against the live URL.

### Threat model, honestly

There is no authentication in CHOWLY, by design. The assignment forbids logins and
requires the live link to be usable by anyone. That has three plain consequences, stated
here rather than dressed up:

- The role switch is a view switch. The Customer and Waiter tags change which screen is
  shown and nothing else.
- The waiter routes are open. Anyone with the URL can open the rail, see every table's
  order, and mark orders served. In a real restaurant that is not acceptable; in a
  graded demo with no logins it is the honest state, and the interface says so on every
  screen.
- What a customer can do is still bounded. Their identity is an opaque token in a
  signed, httpOnly cookie, and every read, complaint, rating and payment checks
  ownership inside the database query, so one table cannot read or pay another's
  ticket. Prices, totals and the wait are computed on the server; a posted price is
  rejected. Payment is idempotent. Order creation, complaints and ratings are rate
  limited per session, counted in the database so the limit holds across serverless
  instances.

The one flag that turns the server-side check on for a real deployment is
`STAFF_PIN_REQUIRED`. When it is on, every waiter route requires the staff PIN in the
`x-staff-pin` header, compared with `crypto.timingSafeEqual` against `STAFF_PIN`. The
seam is explicit and fail-closed: it is off only when the flag is exactly `false`, and
absent, empty or malformed keeps it on, because an absent variable meaning
allow-everything would silently open a future environment that forgot to set it. Its
unit tests cover every shape of the flag and the required path, so the compare stays
proven while the demo runs open.

---

## 2. How AI was used

The AI was Claude, working in the terminal as Claude Code, held to the rulebook and the
plan above. The method that made it useful rather than dangerous was written down before
the first line of code and followed throughout:

- **The rulebook came first.** Hard rules on prices never coming from the client, money
  as integer kobo, ownership checks on every route, no em dashes, no attribution
  trailers, surgical edits, motion safety and a list of banned visuals. The AI read it in
  full at the start of every session and quoted the eleven model deltas back before
  building.
- **The log was written as the work happened**, never reconstructed. Every commit has an
  entry recording what was asked for, what was accepted, what was rejected and why, and
  what had to be corrected by hand. [`AI-LOG.md`](AI-LOG.md) has 44 entries. The
  rejections and corrections are the part that earns marks, and they are recorded when
  they happened.
- **Nothing was claimed from reasoning that could be measured.** Every API was exercised
  with real requests against the dev server and Neon; every screen was rendered in
  headless Chromium and its computed styles read back; contrast was computed at both
  ends of the heat range; the banned-visuals audit was a grep of the built stylesheet.
  Where something could not be verified headlessly, the log says so and names the manual
  check.

### What was rejected, and why

A selection from the 33 rejections in the log:

- Before the first commit: a token-saving proxy that renders context as images, because
  a transcription error on a price in kobo passes typecheck, lint and build undetected;
  and a skill whose job is rewriting memory files, because the rulebook is a graded
  deliverable.
- Prisma 8, the registry's latest, because the 7 and 8 lines removed the datasource
  fields the provided schema uses; Prisma 6.19 was pinned instead.
- npm's own fixes for five vulnerabilities, because both were semver-major; overrides
  were chosen after proving neither chain reaches the production runtime.
- An in-memory rate limiter, because each serverless instance would keep its own
  counter and the limit would be theatre.
- Reading a customer id from the request; a 403 for someone else's order, because it
  would confirm the id is real; `localStorage` for anything identity-shaped.
- A nonce-based CSP through middleware, for this build, because the spec placed headers
  in `next.config.ts`; the relaxation it forced was named rather than hidden.
- Two of three art directions. Signwriter, a painted bukka signboard, won the first
  three seconds but its world stopped at the menu. Cast Enamel had one honest idea, the
  bowl sized by prep time, and was otherwise the previous interface rounded off. The
  Pass was chosen because the lamp is the clock, so the wait is the condition of the
  whole screen.
- A red late state, because the brief asked for a lamp that has been on too long, not a
  fire. Star icons, in favour of punched holes. Ambient sound loops, because they answer
  nothing.
- The first interface as a whole. It shipped, passed every check, and was judged
  competent and forgettable, which the redesign brief called a failure. It is kept in the
  history and superseded in the rulebook.

### What had to be corrected by hand

Twelve entries record a correction, and every one was found by a check rather than by
reasoning:

1. A unit test with wrong arithmetic: the AI expected the wait cap from twenty steaks,
   but 22 plus 3 times 19 is 79. The function was right, the test was not.
2. A double `Set-Cookie`: both the middleware and the route handler minted a session on
   an API-first request. The middleware became the only minting site.
3. A browser check that matched Next's own alert region instead of the form's.
4. Plate rims hidden behind the plate body, and rims invisible under reduced motion
   because `createDrawable` starts at nothing drawn.
5. A hydration mismatch from locale-formatted times; they render after mount now.
6. A nested-draggable class clash caught on review.
7. A `Date` versus string type error the gate caught after the browser run had passed.
8. Contrast figures typed into the log before the script had run; the entry carries a
   correction and the measured values.
9. The heat colours declared on `:root`, where a custom property resolves with the
   root's own heat and never moves; they live on the heat element now.
10. The lamp on the order ticket hidden behind the paper by a collapsed margin, with
    every state re-shot once fixed.
11. Drag bounds that never sprang back and a threshold that could not be reached through
    friction.
12. A unit file that would not load under Node because a relative import lacked its
    extension.

### Where the AI was strongest and weakest

Strongest at holding a large rule set steady across a long build, at writing the
verification scripts that caught its own mistakes, and at proposing three genuinely
different directions and critiquing them harshly. Weakest exactly where the log shows:
arithmetic in tests, CSS mechanics that only a browser reveals, and the temptation to
type a number before measuring it. The process, not the model, is what kept those from
shipping.

---

## 3. The behaviour of every feature, step by step

### The landing

`/` is the pass before service. Three lamps hang cold over an empty rail and warm as you
arrive. CHOWLY is set large, with two lines on what it is and the plain statement that
there is no login. Two tickets hang from the rail: "Take a table" opens the customer
side at `/menu`, "Open the pass" opens the kitchen side at `/waiter`. Brass plates link
the three art directions, the repository and this document. A paper strip says payment
is pretend.

### The menu and the ticket

1. `/menu` reads the menu on the server from the database and renders it as two thermal
   strips, kitchen and bar, each line with its price in naira and the kitchen's minutes.
   Unavailable items are left out. The lamps come on, the name warms in, the strips drop
   and print; under reduced motion everything simply fades.
2. Tapping a line punches its hole, prints the count, and feeds the line up onto the
   customer's ticket at the bottom edge. Tapping again adds one; the small minus on the
   description removes one. The ticket shows a running total, formatted by the one
   money function.
3. A table number is required. Firing with none says "Enter the number printed on your
   table."
4. Firing posts `{ tableNo, items: [{ menuItemId, quantity }] }` and nothing else to
   `POST /api/orders`. The strict schema rejects any other key and names it, so a
   client posting a price gets "Unknown field: priceKobo".
5. On the server the items are read by id with `available: true`. A missing or
   unavailable id is refused with a message to reload. Unit price and prep time are
   snapshotted onto each line, the total is the sum of the line subtotals, and the wait
   is `min(90, max(prep) + 3 * (units - 1))`. A sequential reference like `CHW-0007` is
   generated and retried on the unique constraint if two orders collide. The order and
   the customer's latest table are written in one transaction. Five orders per session
   per ten minutes; the sixth is a 429.
6. On 201 the ticket tears off the printer, swings toward the rail, and the order page
   opens.

### The session

A visitor's first request is met by the middleware, which mints a 32-byte random token,
signs it with HMAC-SHA256 over `SESSION_SECRET`, and sets it as an httpOnly, sameSite=lax
cookie, secure in production. It also forwards the signed value to the route handler in
a header it strips from every incoming request first, so a browser whose very first
request is an API call still has an identity. The customer row is created on the first
API call that needs one. A tampered cookie fails the constant-time compare and is
replaced. The customer id is never read from a request.

### The wait: the lamp is the clock

1. `/order/[id]` renders on the server for the browser that placed the order, with the
   ownership check inside the query. Anyone else, a malformed id, or an unknown id gets
   the styled 404, "Nothing on this spike", so the address of an order tells another
   table nothing.
2. The ticket hangs on a brass spike under its own lamp. The digits, set in Fraunces,
   count down the promised minutes from `placedAt`, recomputed every second, so a
   refresh changes nothing.
3. One number, heat, is computed on every tick from `placedAt` and `waitMinutes`. It
   falls from 1 to 0.55 across the promise, then toward 0 over a second promise's worth
   of time, and never rises while the order is placed. The stylesheet mixes the lamp's
   colour, the pool's opacity and the paper's tone from it, so the whole screen cools:
   the pool shrinks and goes from amber to straw, the paper ages. Past the promise the
   digits show a plus sign and count up. Nothing flashes and nothing turns red beyond
   that sign. Under reduced motion the value steps once per state with a two second
   transition.
4. The view polls `GET /api/orders/[id]` every three seconds, so when the waiter marks
   the order served the digits read "Served" in green, the lamp steadies, and the staff
   who served, cooked and mixed are named. Paid puts the lamp out.
5. Contrast was measured at both ends: ink on paper never below 10.7:1, secondary ink
   4.84:1 at the very worst.

### Complaint and rating

1. The complaint slip prints on the ticket only once the order is late: still placed
   past the promise, or served after it. The server enforces the same rule and answers
   409 otherwise, so a hand-made request cannot complain about an order that is on time.
2. Sending the slip posts the description to `POST /api/orders/[id]/complaints`,
   ownership checked inside the query. A punched score can go with it as its own
   request. Sent slips print above the form, and the ticket on the rail shows a SLIPS
   count. Five complaints per session per ten minutes.
3. The rating is punched into the ticket like a rail ticket: five holes, one to five.
   `POST /api/orders/[id]/rating` upserts on the unique `orderId`, so punching again
   changes the score rather than adding a row. Zod bounds the score first; the check
   constraint in the database is the last line, and it was proven to reject 0 and 6.

### The rail

1. `/waiter` opens with one click and no prompt. It polls `GET /api/waiter/orders`
   every three seconds, which returns every placed and served order with the derived
   delay, plus the waiter, chef and bartender lists.
2. Every placed order hangs on the top rail under its own small lamp carrying its own
   heat, so a late ticket sits under a cooled lamp on aged paper beside a fresh one.
   Each ticket prints the reference, the table, the lines, the time against the
   promise, and a SLIPS count.
3. Three paths mark an order served, all through one dialog: the button on the ticket,
   Enter or Space on a focused ticket, or a pull down the rail that meets friction,
   springs back on release, and opens the dialog past a deliberate distance. Under
   reduced motion the drag is not created and the other two paths remain.
4. The dialog records who served, cooked and mixed from the seeded lists and sends
   `PATCH /api/orders/[id]/assign`. Only a placed order can be served; serving twice is
   a 409. The served ticket moves to the lower rail from the response and the next poll
   confirms it.

### Settling and the receipt

1. Once served, the ticket prints a SETTLE section with the stored total, three method
   stamps and "Settle the ticket (pretend)", with the pretend sentence above it.
2. `POST /api/orders/[id]/pay` carries the method only. Ownership is checked inside the
   query and the order must be served. One transaction inserts the payment with
   `isPretend: true` and the stored total, then flips the status to PAID and sets
   `paidAt`. A second call, sequential or in the same instant, returns the payment that
   already exists; two calls fired together were proven to produce one row.
3. On success the lamp goes out, the digits read "Paid", and a receipt tears off below
   the ticket with the lines, the total from the payment row, the method, and "PRETEND
   PAYMENT. No money moved, and the record is marked pretend." The PAID stamp lands
   once and is static on later visits.

### Sound and the role tags

Four cues, synthesised with Web Audio: a printer buzz when a line prints, a tear when the
order is fired, a tick when a ticket is spiked or a number punched, a thud when the stamp
lands. Off by default behind a tag on the rail; nothing plays and no audio context exists
until it is switched on. The Customer and Waiter tags change the view and nothing else.

### The API

| Route | Method | Checks |
|---|---|---|
| `/api/session` | GET | Creates the customer row on first call |
| `/api/menu` | GET | Public; unavailable items excluded |
| `/api/orders` | POST | Strict body; server-side prices, total and wait; rate limited |
| `/api/orders/[id]` | GET | Ownership in the query; delay derived at read time |
| `/api/orders/[id]/complaints` | POST | Ownership; must be late; rate limited |
| `/api/orders/[id]/rating` | POST | Ownership; upsert; score 1 to 5; rate limited |
| `/api/orders/[id]/pay` | POST | Ownership; must be served; one transaction; idempotent |
| `/api/waiter/orders` | GET | Open by design; the seam behind `STAFF_PIN_REQUIRED` |
| `/api/orders/[id]/assign` | PATCH | Placed only; staff ids verified; the same seam |

---

## 4. A walkthrough for a stranger

You need a browser and the live link. Nothing to install, nothing to sign in to. Keep
two tabs: one is the customer at the table, the other is the kitchen.

1. **Open LIVE_URL.** The lamps hang cold over an empty rail and warm as you arrive.
   Read the two lines. Notice the note that payment is pretend.
2. **Take a table.** Click "Take a table". The lamps come on one at a time, the name
   warms in, and the menu drops off the rail as two strips. Tap **Zobo** on the bar
   strip: it punches, and the line prints on your ticket at the bottom. Zobo takes four
   minutes, which is short enough to watch the whole story. Tap **Grilled steak** too if
   you want a longer wait; the kitchen's promise becomes the slowest item plus three
   minutes per extra unit.
3. **Fire it.** Type any table number, say 7, and click "Fire the order". The ticket
   tears off the printer and swings up, and your order page opens: a ticket on a spike
   under a lamp, the digits counting down, the paper fresh.
4. **Watch the lamp.** Leave this tab open. The pool of light shrinks as the minutes are
   used. If you ordered only Zobo, four minutes later the digits show a plus sign, the
   light has cooled toward straw, the paper has aged, and a complaint slip has printed
   below the lines. Nothing flashed. Reload the page: the clock is exactly where it was,
   because it is computed from when you fired the ticket.
5. **Complain and rate.** Write a line on the slip, punch a score, and send it. Read
   "Slip sent. It is on the rail." Punch a rating on its own below it; punch again to
   change it.
6. **Go to the kitchen.** In the second tab open LIVE_URL/waiter, or click the Waiter tag.
   There is no PIN and no prompt: the rail opens. Your ticket hangs under its own lamp,
   cooled if it is late, with a SLIPS count if you sent one.
7. **Serve it.** Click "Mark served" on the ticket, or focus it and press Enter, or pull
   it down the rail. Choose a waiter, a chef and a bartender and click "Mark served". The
   ticket moves to the served rail.
8. **Back at the table.** Within three seconds and with no reload, the customer tab reads
   "Served", the lamp steadies, and the staff are named. A SETTLE section has printed
   with the total.
9. **Settle up.** Pick a method and click "Settle the ticket (pretend)". The lamp goes
   out, the digits read "Paid", and a receipt tears off below with the PAID stamp and the
   line that no money moved. Click it twice if you like; the record is one payment.
10. **The switch.** The Customer and Waiter tags at the top change the view and nothing
    else. Both sides are open to anyone with the link; that is the assignment's rule, and
    the app says so rather than pretending otherwise.
11. **Two more things to try.** Switch "Sound off" to "Sound on" and fire another ticket
    to hear the printer and the tear. Turn on Reduce Motion in your system settings and
    reload: every entrance becomes a fade, and the lamp still cools, in one slow step.
12. **The directions.** LIVE_URL/directions shows the three art directions that were
    built before this one was chosen; each is a working menu screen.
