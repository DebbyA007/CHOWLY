# CHOWLY: submission document

CHOWLY is a dining app for a guest already seated in the restaurant. On their own phone
they read the menu, add dishes, place the order against their table, watch a ring count
down the minutes the kitchen promised, report a problem and rate the meal if it runs
late, and pay before they leave. A waiter sees every live order, opens one, records who
cooked and who mixed the drinks, and marks it served. The design is Night Service, from a
design handoff the build follows closely.

- Live: https://chowly-theta.vercel.app
- Repository: https://github.com/DebbyA007/CHOWLY
- The AI log, written as the work happened: [`AI-LOG.md`](AI-LOG.md)
- Every screen and state at 390: [`screens/README.md`](screens/README.md)
- The design handoff: [`design-ref`](design-ref/design_handoff_chowly_night_service/README.md)
- The photographs and their licences: [`PHOTOGRAPHY.md`](PHOTOGRAPHY.md)
- The first three art directions and their critique: [`directions/README.md`](directions/README.md), and live at https://chowly-theta.vercel.app/directions

This document has the four required sections: how it was built, how AI was used, the
behaviour of every feature step by step, and a walkthrough a stranger can follow on the
live link. First, one thing that must not be buried.

## There is no authentication, by design

The assignment forbids logins and requires the live link to be usable by anyone. So:

- The front door offers "I'm a guest" and "I'm a waiter". Both open with one tap. The
  waiter side lists every table's order and can mark any of them served. In a real
  restaurant that is not acceptable; in a graded demo that forbids logins it is the
  honest state, and this document says so rather than pretending a PIN prompt was
  security.
- What a guest can do is still bounded. Their identity is an opaque token in a signed,
  httpOnly cookie, and every read, report, rating and payment checks ownership inside
  the database query, so one table cannot read or pay another's order. Prices, VAT, the
  total and the promised wait are computed on the server; a posted price is rejected.
  Payment is idempotent. Order creation, reports and ratings are rate limited per
  session, counted in the database.
- **The flag that turns the server-side staff check on for a real deployment is
  `STAFF_PIN_REQUIRED=true`.** When it is on, every waiter route requires the staff PIN
  in the `x-staff-pin` header, compared with `crypto.timingSafeEqual` against
  `STAFF_PIN`. It is on only when the variable is exactly `true`; absent, empty, `false`
  or anything else leaves the waiter routes open, which is the product's rule. The first
  version of this seam was the other way round, on unless the variable was exactly
  `false`, and it locked the waiter side of the production deployment, where the
  variable had never been set. Its unit tests cover every shape of the flag.

---

## 1. How it was built

### The process

The build was held to two written documents from the first commit: a rulebook,
[`CLAUDE.md`](../CLAUDE.md), with hard rules for git, dependencies, security, editing,
writing and motion safety, and a plan, [`BUILD-PLAN.md`](BUILD-PLAN.md), with one commit
per step in the order the work would actually happen. The assignment grades the commit
history, so nothing was squashed and nothing was batched into one drop at the end: 58
commits on the main line, each gated by `npm run typecheck && npm run lint && npm run
build` before it was made, and each with an entry in the AI log written at the time. A
further 24 commits on a side branch hold two rounds of art-direction walkthroughs that
were built, critiqued and set aside.

| Phase | What landed |
|---|---|
| 1. Foundation | Scaffold, security headers, dependency overrides, Prisma on Neon with two migrations, the seed |
| 2. Data layer | Zod schemas, money and wait-time helpers, the session cookie, the menu, order placement and order detail APIs |
| 3. Waiter, complaint, payment | The live list and assignment API, complaint and rating APIs, the idempotent pretend payment |
| 4. First interface | An enamelware direction: tokens, role switch, menu, cart, countdown ring, the waiter list, complaints and ratings, payment |
| 4b. Redesign | Three art directions built and critiqued, then the whole interface rebuilt as The Pass |
| 4c and 4d, side branch | Six more directions as full clickable walkthroughs, two rounds, critiqued and set aside |
| 5. Night Service | The design handoff implemented: data to its spec, licensed photography, the eight screens, paper as surface detail, motion, the rulebook corrected, these documents |

Deployment was moved from the last step to right after the scaffold, so the pipeline was
proven while the app was two files. That is where the framework preset problem was
caught: Vercel had detected the wrong preset for the repository, and the fix was one
dashboard setting made before there was anything to lose.

### The stack

Next.js 15.5 with the App Router and strict TypeScript; Tailwind v4 with the handoff's
tokens in `app/globals.css`; Prisma 6.19 on PostgreSQL at Neon, the pooled connection
for the app and the direct one for migrations; Zod for every request shape; SWR for the
client cache and the one view that polls; anime.js 4.5 for motion, every scope carrying
a reduced-motion branch; Newsreader and Space Grotesk self-hosted through `next/font`;
Vercel for hosting with the install command `npm ci --ignore-scripts`, which is why the
build script is `prisma generate && next build`. Two transitive packages carry npm
overrides above their security advisories, because the only upstream fixes were
semver-major; the audit and the proof that neither reaches the production runtime are in
the log.

### The structure

```
app/
  page.tsx                screen 1, the landing
  menu/page.tsx           screen 2, the menu
  order/page.tsx          screens 3 and 4, the order placed and running late
  pay/page.tsx            screens 7 and 8, pay and the receipt
  waiter/page.tsx         screen 5, live orders
  waiter/[id]/page.tsx    screen 6, one order open
  waiter/tables, waiter/menu   the other two waiter tabs
  api/                    eleven route handlers, listed in section 3
  directions/             the first three art directions, kept as artefacts
  globals.css             the tokens, the chrome, the paper utilities
components/night/         every screen, the chrome, the hooks
lib/                      schemas, money and VAT, the wait, the clock, session, orders, rate limit, the staff seam
prisma/                   schema, two migrations, the idempotent seed
public/photos/            the eleven photographs
middleware.ts             mints the session cookie on first visit
docs/                     this document, the AI log, the plan, the handoff, the screens, the credits
```

### The data model as finally implemented

`prisma/schema.prisma` is the source of truth. It departs from the coursework ERD in
eleven deliberate ways, each annotated `DELTA` in the schema:

1. `MenuItem.prepTimeMinutes` exists; the assignment requires it, and the promise is
   computed from it: the longest prep time in the order, as the handoff specifies.
2. `Order.waitMinutes` is a computed integer. The original stored a string like
   "25 mins", which cannot be compared to a clock.
3. `Order.waiterId`, `chefId` and `bartenderId` are nullable. The guest submits with no
   staff attached; the waiter records all three afterwards. `NOT NULL` would make
   requirement 3 impossible.
4. `OrderStatus` is exactly `PLACED`, `SERVED`, `PAID`. Late is not a status. It is
   derived at read time from `placedAt` and `waitMinutes` and never stored, so there is
   no row to hand-set to make the report flow work.
5. `placedAt`, `servedAt` and `paidAt` are timestamps. The original split date and time
   into two columns, which cannot be sorted or compared.
6. `OrderItem.unitPriceKobo` and `prepTimeMinutes` are snapshots taken at order time, so
   editing the menu never rewrites a historical order or the payment taken against it.
7. All money is integer kobo. VAT at 7.5% is added to the stored total and rounded to
   whole naira, and the subtotal is read back from the lines, so nothing is stored twice.
8. `Payment.orderId` is unique, and the insert and the status flip run in one
   transaction. A double tap records once.
9. `Payment.isPretend` defaults to true and is shown on the button and the receipt.
10. `Rating.orderId` is unique, and `CHECK (score BETWEEN 1 AND 5)` is added by a
    hand-written migration, since Prisma cannot express it. Zod validates first; the
    database is the last line.
11. `Customer.sessionToken` is unique, since there are no logins and the token is the
    identity.

The ERD is drawn in the README. Two things the handoff asked for that the schema
already carried: three menus by name (Mains, Soups, Drinks, over the two-value type
enum), and a `PaymentMethod` of `CARD`, `MOBILE_MONEY` and `CASH`, onto which the
handoff's "Bank transfer" maps as `MOBILE_MONEY`. The schema was not simplified for it.

### Deployment

Vercel imports the repository with the install command set to `npm ci --ignore-scripts`.
Neon is attached through the marketplace integration, which injects `DATABASE_URL`
(pooled) and the direct string used as `DIRECT_URL`. `SESSION_SECRET`, `STAFF_PIN` and
`STAFF_PIN_REQUIRED=false` are set in the dashboard, though the last is no longer needed now that the seam is off by default; `DEMO_CONTROLS` is not, so the
endpoint the verification script uses to make an order late is a 404 in production.
Migrations were applied with Prisma against the direct connection, and the seed was run
against production and confirmed by querying the rows back through the live menu API.
The security headers are set in `next.config.ts` and confirmed with `curl -I` against the
live URL.

---

## 2. How AI was used

The AI was Claude, working in the terminal as Claude Code, held to the rulebook and the
plan above. The method that made it useful rather than dangerous was written down before
the first line of code: the rulebook came first; the log was written as the work
happened and never reconstructed; and nothing was claimed from reasoning that could be
measured. What follows leads with what was rejected and what had to be corrected,
because that is where the method earned its keep.

### What was rejected, and why

- **A token-saving proxy** that renders the conversation as images was turned down
  before the first commit, twice. Character-level misreads are exactly the failure it
  invites, and a misread digit in a price in kobo passes typecheck, lint and build
  undetected. The only place it would surface is a receipt.
- **Two semver-major audit fixes.** npm's own fix for five advisories was two major
  upgrades of transitive packages. Both were declined in favour of overrides, after
  tracing the build output to prove neither chain reaches the production runtime.
- **Prisma 7 and 8**, the registry's latest, because both lines dropped the `url` and
  `directUrl` datasource fields the provided schema uses. Prisma 6.19 was pinned.
- **Four art directions, built and discarded before Night Service.** The first
  interface, West African enamelware, shipped, passed every check, and was judged
  competent and forgettable: a card grid on a blue ground with a countdown widget. Three
  directions were then built for real as menu screens and critiqued against a written
  bar. Signwriter, a painted bukka signboard, won the first three seconds and stopped at
  the menu. Cast Enamel had one honest idea, the bowl sized by prep time, and was
  otherwise the previous interface rounded off. The Pass, a kitchen pass in steel and
  brass with a heat lamp as the clock, was chosen, built out in full, and then scrapped
  as well built and wrong: industrial, too dark and heavy, its ordering screen blocked
  by its own furniture. Two further rounds of three walkthroughs each followed on a side
  branch, with their critiques, and none was the answer. Night Service came from a design
  handoff, and the brief for it was to follow the handoff closely rather than reinvent.
  Two ideas survived the scrapping: the ticket's paper, as surface detail, and the
  verification loop.
- **A red late state on The Pass**, star icons, ambient sound loops, and later the sound
  feature entire, because a feature that is off by default and that nobody asked for is
  decoration with a switch.
- **An in-memory rate limiter**, because each serverless instance would keep its own
  counter and the limit would be theatre. Reading a customer id from the request. A 403
  for someone else's order, because it would confirm the id is real. `localStorage` for
  anything identity-shaped.
- **Illustration in place of photography** was offered for Night Service and declined
  by the user; then eight of the eleven photographs chosen were rejected again on
  licence, because share-alike raises a question a grader should not have to ask, and
  swapped for CC0, public domain and CC BY images.
- **"Email receipt" and "Start over"** from the handoff's prototype, because there is no
  email to send to and a dead control is worse than a missing one.

### What had to be corrected by hand

Every one of these was found by a check, not by reasoning, and the log records each when
it happened.

1. **A gradient that grep found after reasoning had cleared it.** The paper's print
   ruling was a `repeating-linear-gradient`, which the banned-visuals rule forbids. The
   reasoning said the rule was about decoration; the grep of the built stylesheet said
   the string was there. It became an SVG pattern, and the grep is part of the gate.
2. **A Safari-only CSS failure that every automated check missed.** The Content Security
   Policy carried `upgrade-insecure-requests`, correct in production behind TLS and
   fatal on a plain-http dev server: WebKit upgrades `localhost` too, so Safari requested
   every stylesheet and font over `https://localhost`, failed the handshake, and rendered
   every page unstyled. Chromium exempts `localhost`, so headless Chromium, curl and the
   grep of the built CSS all passed. It was found by reading Safari's own console, and
   confirmed by a probe in the system WebKit through a proxy that stripped one header at
   a time. The directive is now sent outside development only, and the WebKit probe has
   been in the verification loop since: every screen is rendered in it as well as in
   Chromium.
3. **A double `Set-Cookie`.** Both the middleware and the route handler minted a session
   on a browser whose first request was an API call. The middleware became the only
   minting site, forwarding the value in a header it strips from every incoming request.
4. **A unit test with wrong arithmetic** (22 plus 3 times 19 is 79, not what the test
   expected); the function was right, the test was not.
5. **A hydration mismatch** from locale-formatted times, and another from floating point
   in an SVG; both render after mount or round now.
6. **Contrast figures typed into the log before the script had run**; the entry carries
   the correction and the measured values.
7. **Custom properties declared on `:root`** that could never change with the element
   that carried them; they live on that element now.
8. **Two Night Service defects visible only in the frames**: menu rows vanished after a
   category switch and the late screen's note and buttons never appeared, both because
   an inline zero opacity waited for an entrance that only ran at mount.
9. **`next/font` refusing an axes list alongside a fixed weight**, which made the first
   Night Service dev server answer 500 on every page.
10. **A commit made with lint red**, because ESLint had started scanning the handoff's
    generated script under `docs`; the next commit ignores `docs`, and the log says the
    gate was broken for one commit.
11. **A retired bartender that survived the seed** because a test order still named him,
    and a licence count in the log that said seven share-alike images when there were
    eight.

### Where the AI was strongest and weakest

Strongest at holding a large rule set steady across a long build, at writing the
verification scripts that caught its own mistakes, and at building genuinely different
directions and critiquing them harshly. Weakest exactly where the log shows: arithmetic
in tests, browser mechanics that only a browser reveals, an engine difference that only
the other engine reveals, and the temptation to type a number before measuring it. The
process, not the model, is what kept those from shipping.

---

## 3. The behaviour of every feature, step by step

### The landing

`/` shows the dining room across the top, the restaurant's name and address, "I'm a
guest" and "I'm a waiter", and the table. When the link carried `?table=12`, as the card
on a real table would, it reads "You're at table 12" with Change. Without one the door
asks: a small field, "It is on the card on your table", kept for the session on Keep or
on tapping "I'm a guest", which will not go through without a table and says why. The
menu, the guest's orders and the live list are preloaded here, so either button opens
onto a screen that is already there.

### The menu

1. `/menu` reads the menu from the client cache, warmed on the landing, and shows Mains,
   Soups and Drinks as chips. Tapping a chip filters in place with no animation. Each
   dish is a 76px round photograph with its name, description, price in naira and the
   kitchen's minutes. Unavailable items are left out, and the menu refreshes every
   thirty seconds and on focus, so a dish the kitchen takes off leaves the list without a
   reload. The rows stagger in on every visit. While the menu loads the screen shows its
   own shape, the chips and four rows, never a line of text.
2. Tapping the ochre circle adds the dish; the circle morphs into a stepper pill with
   minus, the count and plus. Decrementing to zero morphs it back.
3. The cart bar never disappears. Empty, it says "Your order is empty" in the same
   slot; with items, it rises once and shows the count and the total, which tick rather
   than jump, and "View order".
4. "View order" opens the order sheet: the lines with their steppers, the subtotal, VAT
   at 7.5%, the total, and the table, pre-filled from the door and editable; the table
   pill in the header opens the same question as a sheet. "Place order" posts `{ tableNo, items: [{ menuItemId, quantity }] }` and nothing else to
   `POST /api/orders`. The strict schema rejects any other key and names it, so a
   client posting a price gets "Unknown field: priceKobo".
5. On the server the requested dishes are read by id whether available or not. A dish
   that has sold out is refused by name, "Zobo has just sold out and has been taken off
   your order", with its id in the body so the client takes it off the kept order and
   the retry; a dish that no longer exists is refused too. Unit price and prep time are
   snapshotted onto each line in the order they were added, the subtotal is the sum of
   the lines, VAT is 7.5% rounded to whole naira, the total is their sum, and the
   promise is the longest prep time. A sequential order number from 1001 is written and
   retried on the unique constraint if two orders collide. The order and the guest's
   latest table are written in one transaction. Five orders per session per ten minutes;
   the sixth is a 429.
6. The tap is answered at once. The client builds a provisional order with the promise
   from the same formula the server uses, the sheet tears away, and the Order tab opens
   with the ring already sweeping and "Sending to the kitchen" under the caption. The
   request runs from a store outside React, so it survives the navigation, and the
   kitchen's order replaces the provisional one in place: the arc carries on from where
   it is and the header gains its number. If the kitchen did not get it, the same screen
   says so with the reason, keeps the order on the menu, and offers Try again and Back to
   the menu. Placing took about three and a half seconds against the live database
   before this; now the wait is spent looking at the order.

### The session

A visitor's first request is met by the middleware, which mints a 32-byte random token,
signs it with HMAC-SHA256 over `SESSION_SECRET`, and sets it as an httpOnly, sameSite=lax
cookie, secure in production. It forwards the signed value to the route handler in a
header it strips from every incoming request first, so a browser whose very first
request is an API call still has an identity. The customer row is created on the first
API call that needs one. A tampered cookie fails the constant-time compare and is
replaced. The customer id is never read from a request.

### Tracking the order: the ring is the clock

1. `/order` shows the order the guest chose, else the newest still open, else the
   newest paid one for its receipt, from `GET /api/orders/mine`, which returns only that
   customer's rows. With two open orders a chip per order switches between them. Every
   other order of the session is listed under "Earlier orders" with its time, count,
   state and total, and opens at `/order/{id}`, which the API answers only for the
   session's own orders, so a paid order and its receipt stay one tap away. With no
   order it says so and offers the menu; while it looks, it shows the ring, the steps
   and the card as shapes.
2. The header reads "Order #1042" and the table. The ring is 184px, its arc the
   remaining fraction of the promise, recomputed every second from `placedAt` and
   `waitMinutes`, so a refresh changes nothing and no client-side counter can drift. The
   arc empties as the minutes are used; the numerals inside count down in tabular figures
   with no reflow. Under the ring: "Promised in 20 minutes · placed 9:04 pm".
3. **The derived delay.** Late is `now > placedAt + waitMinutes` while the order is still
   placed. It is computed at read time on the server and on every tick in the browser,
   and never stored. Crossing it flips the screen: the subtitle reads "6 minutes late",
   the table pill, the ring, its track, the numerals and the active tab cross from ochre
   to late red over two seconds, never a snap and never a flash, and the ring closes
   while the numerals count up. Under reduced motion the crossfade stays, slower, because
   it is a colour, not a movement.
4. The stepper below shows the three steps the data can vouch for: Order placed with
   the time and the promise, Served ("About 9:24 pm", then "Any moment" once late, then
   the time), and Paid, the current step in bold; a step completing swells its dot once.
   An earlier "In the kitchen" step was invented from nothing the database records and
   was removed. Then the items and the subtotal on a card.
5. The view polls `GET /api/orders/{id}` every three seconds, so when the waiter marks
   the order served the ring reads "Served" with the time, the stepper completes, and
   the screen offers Pay and Rate your order. Once paid it offers See the receipt and
   Order something else, and the receipt does the same, so nothing dead-ends.
6. When the browser is offline, or a poll fails after the order had arrived, a bar under
   the header says "Offline since 9:31. Showing your order as of then." The ring keeps
   its own time. When the connection returns everything revalidates and the bar says
   "Back online. Refreshed." once, then leaves. The same bar is on every screen.

### Report a problem, rate your order

1. **The complaint gate.** "Report a problem" appears only once the order is late:
   still placed past the promise, or served after it. The server enforces the same rule
   on `POST /api/orders/{id}/complaints` and answers 409 otherwise, so a hand-made
   request cannot complain about an order that is on time. Ownership is checked inside
   the query. Sent reports show on the waiter's live row as a count in red and, on the
   open order, in full with their time under "From the table". Five per session per ten
   minutes.
2. "Rate your order" opens a sheet with 1 to 5 as chips and an optional note.
   `POST /api/orders/{id}/rating` upserts on the unique `orderId`, so rating again
   changes the score rather than adding a row. Zod bounds the score first; the check
   constraint in the database is the last line, proven to reject 0 and 6. Any served
   order can be rated, late or not: the offer is on the order screen once served and on
   the receipt, and the rating shows on both.

### Live orders, the waiter's side

1. `/waiter` opens with one tap and no prompt. It polls `GET /api/waiter/orders` every
   three seconds and keeps the previous list while it revalidates, so nothing blinks.
   The header counts the open orders and how many of them include a drink. The pill
   asks "Who's serving?" and opens the roster as a sheet; the choice is kept for the
   session and the pill shows the name. While the list loads it shows four cards as
   shapes; when the browser is offline or a poll fails the subtitle reads "As of 9:31 ·
   Five open" and a bar under the chips says since when.
2. Each order is a card: the table and order number, "3 items · ₦17,500", and a status
   with its dot and time: Just placed, In the kitchen with "mm:ss left", Ready in the
   last minute of the promise, Late with the minutes over in red, Served with the time.
   All, Cooking, Late and Served filter the list. New orders slide in on the poll; a
   status change recolours in place; nothing pulses.
3. Tapping a card opens `/waiter/{id}`: placed at, the clock, the lines with their
   minutes, the subtotal, the reports and rating from the table if there are any, then
   Waiter, Chef and Bartender as chips. The waiter chip follows the session's choice,
   and until someone is chosen the button reads "Choose who is serving". "Mark as
   served" flips the order to served on screen at once and sends
   `PATCH /api/orders/{id}/assign` with the three ids; if the server refuses, the order
   is put back the way it was and the reason is printed. Only a placed order can be
   served; serving twice is a 409. The button becomes "Served at 9:26 pm" and stays that
   way; there is no revert.
4. **The table board.** The Tables tab is the floor by table: one card per table with
   every order of the last twelve hours, oldest first, each with its number, count, total
   and state, and what the table still has to pay, with the night's outstanding total in
   the subtitle. The waiter API includes orders paid in the last twelve hours for this;
   the live list leaves them out.
5. **The 86 board.** The Menu tab is every dish on the card with a switch, "On" or
   "Sold out". Taking a dish off shows at once, is rolled back with the reason if the
   server refuses, removes the dish from the guests' menu on their next refresh, and
   refuses by name any order still carrying it. Retired dishes stay in the database for
   the orders that name them and are not on the board. `GET` and `PATCH
   /api/waiter/menu`, strict Zod, behind the same seam as the rail.

### Pay, and the receipt

1. `/pay` shows the summary card with the lines, the subtotal, VAT and the total, then
   Card, Bank transfer and Cash at the till, then "Pay ₦18,813 (pretend)". Until the
   order has been served the button waits, and a line says so.
2. **Payment idempotency.** `POST /api/orders/{id}/pay` carries the method only.
   Ownership is checked inside the query and the order must be served. One transaction
   inserts the payment with `isPretend: true` and the stored total, then flips the status
   to PAID and sets `paidAt`. `Payment.orderId` is unique, so a second call, sequential
   or in the same instant, returns the payment that already exists; two calls fired
   together were proven to produce one row.
3. While the request runs the button reads "Taking payment" with a spinner. On success
   the receipt prints in place: the card feeds down from the perforation, the lines come
   in, and the PAID stamp lands once. It carries the restaurant, the address, the date
   and time, "Order #1042 · Table 12 · Receipt 0001", the lines, subtotal and VAT, "Paid
   by card" against the total, "Pretend payment. No money moved.", and who served,
   cooked and mixed. On a later visit the receipt is simply there.

### The API

| Route | Method | Checks |
|---|---|---|
| `/api/session` | GET | Creates the customer row on first call |
| `/api/menu` | GET | Public; unavailable items excluded; cached thirty seconds |
| `/api/orders` | POST | Strict body; server-side prices, VAT, total and promise; rate limited |
| `/api/orders/mine` | GET | The session's own orders, newest first |
| `/api/orders/{id}` | GET | Ownership in the query; delay derived at read time |
| `/api/orders/{id}/complaints` | POST | Ownership; must be late; rate limited |
| `/api/orders/{id}/rating` | POST | Ownership; upsert; score 1 to 5; rate limited |
| `/api/orders/{id}/pay` | POST | Ownership; must be served; one transaction; idempotent |
| `/api/waiter/orders` | GET | Open by design; the seam behind `STAFF_PIN_REQUIRED`; includes orders paid in the last twelve hours |
| `/api/waiter/menu` | GET | Every dish on the card with whether it is on; the same seam |
| `/api/waiter/menu` | PATCH | `{ id, available }`, strict; takes a dish off or puts it back; the same seam |
| `/api/orders/{id}/assign` | PATCH | Placed only; staff ids verified; the same seam |
| `/api/demo` | POST | 404 unless `DEMO_CONTROLS` is exactly `true`; moves one of the session's own orders' clocks for verification |

---

## 4. A walkthrough for a stranger

You need a phone or a browser and the live link. Nothing to install, nothing to sign in
to. Keep two tabs: one is the guest at the table, the other is the waiter.

1. **Open https://chowly-theta.vercel.app/?table=12.** The dining room, the name, and
   "You're at table 12": the link is what the card on a table would carry. Open it
   without `?table=` and the door asks for the number instead.
2. **Tap "I'm a guest".** The menu opens on Mains. Tap **Drinks** and add a **Zobo** with
   the ochre circle; it becomes a stepper. Zobo takes four minutes, and the kitchen's
   promise is the longest prep time in the order, so an order of only Zobo is late in
   four minutes, which is short enough to watch the whole story. Add a **Jollof rice**
   too if you would rather wait twelve.
3. **View the order.** The cart bar has risen with the count and total. Tap "View order",
   check the table, and tap "Place order". The Order tab opens at once, with "Sending to
   the kitchen" under the ring until the kitchen has it and the number appears.
4. **Watch the ring.** It empties as the minutes are used, and the numerals count down.
   Reload the page: the clock is exactly where it was, because it is computed from when
   you placed the order, not from when the page loaded.
5. **Running late.** When the promise is spent the ring closes and everything ochre has
   crossed to red, slowly. "Sorry, your food is taking longer than we said." Tap
   **Report a problem**, write a line, send it. Tap **Rate your order**, pick a number,
   send it; rate again to change it.
6. **Switch to the waiter.** In the second tab open https://chowly-theta.vercel.app and
   tap **"I'm a waiter"**, or open https://chowly-theta.vercel.app/waiter directly.
   There is no PIN and no prompt. Your table is in the list, marked Late with the
   minutes over, and a count of your report.
7. **Serve it.** Tap the pill, "Who's serving?", and pick yourself from the roster; it
   is kept for the session. Tap the card: your report is there under "From the table".
   Choose a chef and a bartender and tap **"Mark as served"**. The button becomes the time
   it happened before the server has even answered.
8. **The other two tabs.** **Tables** is the floor by table with what each still has to
   pay. **Menu** is the 86 board: switch **Zobo** to "Sold out", go back to the guest tab,
   add a Zobo and place it, and the order comes back refused by name with Zobo taken
   off; switch it back on afterwards.
9. **Back at the table.** Within three seconds and with no reload, the guest tab reads
   "Served" with the time and the stepper is complete. Rate it here if you like, late or
   not. Tap **Pay**.
10. **Pay.** The summary shows the subtotal, VAT and total. Pick a method and tap
   **"Pay ₦… (pretend)"**. The receipt prints: the perforation, the lines, the stamp, the
   torn foot, and who served, cooked and mixed. Tap it twice if you like; the record is
   one payment.
11. **The role switch** is the front door: two buttons, one tap each, and the tab bars on
    each side. Both sides are open to anyone with the link; that is the assignment's
    rule.
12. **One more thing to try.** Turn on Reduce Motion in your system settings and reload:
    every entrance becomes a fade, and the late crossfade still happens, slower.
13. **The first directions.** Also try turning the connection off: every screen says
    since when it has been offline and what it shows is as of then, and says once when
    it is back.
14. **The first directions.** https://chowly-theta.vercel.app/directions shows the three
    art directions built before The Pass was chosen and, in turn, replaced; each is a
    working menu screen.
