# CHOWLY

A restaurant dining platform. A customer at a table browses the menu, places an order,
watches a live countdown, complains and rates if it runs late, and pays before leaving.
A waiter works a ticket rail, records who cooked and who mixed, and marks orders served.

The product is called **CHOWLY**. Never append a suffix, tag, byline or version word to
that name anywhere: not in the repo, the UI, the README, the page title, or the metadata.

---

## Hard rules

These are not preferences. Breaking any of them is a defect.

### Git

- Commit messages contain the subject line and body only. Never write `Co-Authored-By`,
  `Claude-Session`, `Generated with Claude Code`, or any other trailer, footer or byline.
  A `commit-msg` hook strips them, but do not rely on it. Do not write them at all.
- Conventional commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`.
- Commit at every meaningful step, in the order given in `docs/BUILD-PLAN.md`. The
  assignment is graded on a commit history that shows the work as it was actually done.
  Never squash. Never make one large commit at the end.
- `package-lock.json` is committed. It is never added to `.gitignore` for any reason.
- Never run `git push --force`, `git rebase`, `git reset --hard`, or `git commit --amend`
  on `main` without being asked.

### Dependencies and build

- Install with `npm ci --ignore-scripts`. Never `npm install` in CI.
- Because `--ignore-scripts` blocks Prisma's postinstall codegen, the build script must be
  `"build": "prisma generate && next build"`. Vercel's install command is set to
  `npm ci --ignore-scripts` in the dashboard.
- Pin `animejs` to an exact version, not a caret range.
- Do not add a dependency without saying what it is for. Prefer writing 30 lines over
  pulling a package for it.

### Security

Security review is part of every change, not a phase at the end.

- **Never trust a price from the client.** The order endpoint accepts menu item IDs and
  quantities only. Prices, subtotals, the total and the wait time are all computed
  server-side from the database. A client that posts a price is rejected.
- Every route handler validates its input with a Zod schema before touching the database.
  Reject unknown keys.
- Money is stored and computed as integer kobo. No floats anywhere near a total.
- The customer identity is a signed, httpOnly, sameSite=lax cookie holding an opaque
  session token. Never localStorage: it is readable by injected script.
- **Ownership checks.** A customer may only read, complain about, rate or pay an order
  whose `customerId` matches their session. Verify server-side on every one of those
  routes. Never take the customer ID from the request body.
- **The role switch is not a security boundary.** It is UI convenience, since the
  assignment forbids logins. Waiter mutations are therefore additionally gated by a staff
  PIN held in `STAFF_PIN` and compared with `crypto.timingSafeEqual`. State this honestly
  in the document rather than pretending the switch is auth.
- Payment is idempotent: a unique constraint on `Payment.orderId`, plus the insert and the
  status update inside one `prisma.$transaction`. A double-clicked button records once.
- Rate limit order creation, complaints and ratings per session.
- Set CSP, `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options` in
  `next.config.ts`.
- No secret is ever prefixed `NEXT_PUBLIC_`. Nothing from `.env` reaches the client bundle.
- Never interpolate user input into a raw SQL string. Use Prisma's query builder, or
  `$queryRaw` with parameters.

### Editing

- Surgical edits are the default. Never rewrite more than ten lines of an existing file
  without asking first.
- Never ask the user to make an edit by hand. Make the edit.

### Writing

- No em dashes in any file: code comments, UI copy, README, the document, commit messages.
  Use a comma, a colon, parentheses, or split the sentence.
- UI copy is sentence case, active voice, and names the thing that will happen. The button
  says "Pay now", the toast that follows says "Paid".
- Empty states give the person something to do. Errors say what went wrong and how to fix
  it, and never apologise.

### Motion safety

- No screen shake, no camera or FOV punch, no motion blur, no chromatic aberration, no
  rapid full-viewport flashing. Not in any component, not as a "nice touch", not ever.
- Every anime.js scope declares
  `mediaQueries: { reduceMotion: '(prefers-reduced-motion)' }` and collapses to a plain
  opacity change when it is true.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript strict |
| Styling | Tailwind v4, tokens in `app/globals.css` |
| Motion | anime.js v4 |
| Database | PostgreSQL on Neon, provisioned through the Vercel marketplace |
| ORM | Prisma |
| Validation | Zod |
| Data fetching | SWR, `refreshInterval: 3000` on the waiter rail |
| Hosting | Vercel |

Use Neon's **pooled** connection string for `DATABASE_URL` and the direct one for
`DIRECT_URL`, which Prisma migrations need.

---

## anime.js v4, read this before writing a single animation

v4 is a different library from v3. Code written from v3 memory will silently do nothing.

- No default export. `import { animate, stagger, createTimeline } from 'animejs'`.
- The signature is `animate(targets, params)`, not a `targets` key inside the object.
- The easing key is `ease`, not `easing`. Values are `'outExpo'`, not `'easeOutExpo'`.
- Durations are milliseconds. `duration: 2` is a 2ms animation, not 2 seconds.
- `direction: 'alternate'` became `alternate: true`. Stagger's `direction: 'reversed'`
  became `reversed: true`.
- Spring easing is `createSpring({ stiffness })` in current v4. Some older v4 docs show
  `spring({ bounce })`. Check the installed version's types before using it.

**In React, every animation lives inside a scope, or strict mode double-mounts leave
orphaned animations you cannot stop:**

```tsx
const root = useRef<HTMLDivElement>(null);
const scope = useRef<ReturnType<typeof createScope> | null>(null);

useEffect(() => {
  scope.current = createScope({
    root,
    mediaQueries: { reduceMotion: '(prefers-reduced-motion)' },
  }).add((self) => {
    if (self.matches.reduceMotion) {
      animate('.card', { opacity: [0, 1], duration: 200 });
      return;
    }
    animate('.card', { opacity: [0, 1], y: [16, 0], delay: stagger(40), ease: 'outExpo' });
    self.add('confirm', () => animate('.ticket', { scale: [1, 1.04, 1], duration: 400 }));
  });

  return () => scope.current?.revert();
}, []);
```

Call registered methods from handlers with `scope.current?.methods.confirm()`.

Anything using anime.js is a client component and needs `'use client'`.

---

## Design direction

The visual language is **West African enamelware**: the speckled enamel trays, bowls and
plates found in every Lagos kitchen. Deep saturated ground, chalk-white forms, a dark
hairline rim around every light shape the way real enamel is edged, and a scatter of
speckle as texture. It gives CHOWLY a specific place and a specific material instead of
another restaurant SaaS dashboard.

**Do not build:** cream background with a terracotta accent and a high-contrast serif;
near-black with one acid accent; identical rounded cards with the same soft grey shadow;
tracked-out all-caps eyebrow labels; meta strings joined with middle dots; a `→` glued to
button text. Those are defaults, not decisions.

### Tokens

```
--enamel-deep    #123A5E   ground, the dining room after dark
--enamel-mid     #1B5687   raised surfaces
--chalk          #F2EFE6   plates, tickets, primary text on deep
--rim            #0A1F33   the hairline edge on every light shape
--flame          #E8A020   the countdown, the live state, warmth
--pepper         #C2402C   delay, complaint, low rating
--leaf           #2E7D5B   served, paid, resolved
```

`--flame` is the only bright colour and it is reserved for time. Do not spend it on
decoration.

### Type

- Display: **Bricolage Grotesque**, variable, for the restaurant name, the countdown and
  section heads. Use the width and optical size axes; treat it as an element, not a label.
- Body and UI: **Instrument Sans**.
- Load both with `next/font/google`. No third family. The countdown uses tabular figures
  so digits do not jitter as they tick.

### The hero is the countdown ring

The wait time is the dramatic spine of the whole assignment: order, wait, delay, complain,
rate. So it is the hero, not a hero image and not a big number with a gradient. An SVG ring
whose `stroke-dashoffset` is driven by real elapsed time against `waitMinutes`. It sits in
`--flame` while the order is on time, crosses to `--pepper` when elapsed passes the
promised wait, and settles to `--leaf` when the waiter marks it served. The complaint
button only appears once the ring has crossed, which is what makes the complaint feel
earned instead of decorative.

### Motion budget

One orchestrated page-load sequence on the menu: the enamel rims draw in with
`createDrawable`, the restaurant name resolves with `splitText`, then the plates settle in
with `stagger` from centre. That is the only motion nobody asked for.

Everything after that answers an action and shows what changed:

- Add to cart: the item arcs to the cart along `svg.createMotionPath`, the badge lands on
  `createSpring`.
- Submit order: a `createTimeline` sequence where the cart folds into a printed ticket and
  the ticket slides to the rail.
- Waiter rail: `createDraggable` to drag a ticket from Placed to Served, with a spring
  release. Keyboard and button equivalents exist for the same action.
- Pay: the ticket takes a stamp, once, and the ring goes quiet.

---

## Data model

`prisma/schema.prisma` is the source of truth and it already carries eleven deliberate
changes from the original coursework ERD. Do not simplify them back:

1. `MenuItem.prepTimeMinutes` exists. The assignment requires it.
2. `Order.waitMinutes` is a computed integer, never a string like "25 mins".
3. `Order.waiterId`, `chefId` and `bartenderId` are nullable. They are assigned after the
   customer submits, not at insert.
4. `OrderStatus` is an enum: `PLACED`, `SERVED`, `PAID`. **Delayed is not a status.** It is
   derived: `now() > placedAt + waitMinutes AND status = 'PLACED'`. Never store it.
5. `placedAt`, `servedAt` and `paidAt` are timestamps. The original split date and time
   into two columns, which cannot be compared or sorted.
6. `OrderItem.unitPriceKobo` snapshots the price at order time, so editing the menu does
   not rewrite the value of historical orders.
7. All money is integer kobo.
8. `Payment.orderId` is unique and the write is transactional.
9. `Payment.isPretend` defaults true and is surfaced in the UI.
10. `Rating.orderId` is unique with a `CHECK (score BETWEEN 1 AND 5)` added by migration.
11. `Customer.sessionToken` is unique, since there are no logins.

Every one of these is a talking point in the required document. As each is implemented,
append the reason to `docs/AI-LOG.md` while it is fresh.

---

## The document is graded as heavily as the app

`docs/` holds the deliverable. It needs four sections: how it was built, how AI was used,
the behaviour of every feature step by step, and a walkthrough a stranger can follow on the
deployed link including how to switch roles.

`docs/AI-LOG.md` is written **as we go**, never reconstructed at the end. Each entry
records what was asked for, what was accepted, what was rejected and why, and what had to
be corrected by hand. The rejections and corrections are the part that earns marks, so
record them honestly when they happen.
