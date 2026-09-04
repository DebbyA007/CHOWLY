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
- **There is no authentication, by design, and no gate anywhere.** The assignment
  forbids logins and requires the live link to be usable by anyone, so "I'm a guest" and
  "I'm a waiter" are view switches and every waiter route is open. State this honestly
  in the document rather than pretending a PIN was security.
- **The server-side authorization seam stays, off by default.** `lib/staff-pin.ts`
  compares an `x-staff-pin` header against `STAFF_PIN` with `crypto.timingSafeEqual`,
  behind `STAFF_PIN_REQUIRED`. The seam is on only when the flag is exactly `true`;
  absent, empty, `false` or anything else leaves every waiter route open, because a
  deployment that never set the variable must not lock its own waiter side. It did once:
  the first version was on unless the flag was exactly `false`, and production, where
  the variable was never set, locked. `.env` and `.env.example` set it to `false` so the
  intent is written down. Its tests stay so the compare stays proven.
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

The design is decided: **Night Service**, direction 1c of the handoff at
`docs/design-ref/design_handoff_chowly_night_service/`. Read that README before touching
a screen. Fidelity is high: colours, type, spacing and radii are final and matched
closely. The structure is deliberately conventional (header, category chips, a scrolling
dish list with the photo left and the text right, a persistent cart bar, bottom tab
navigation, a vertical stepper for tracking) and it stays that way. Do not improve,
simplify or reinterpret the layout. The `.dc.html` beside the README is a reference
prototype, not code to port.

A warm near-black room: bone text, ochre for every primary action and for the countdown
ring, one late red. Elevation is a single surface step and hairline borders. Paper is
surface detail on the dark ground, never a light panel: fibre at very low contrast on
the order card and the waiter rows, a rule that reads as printed rather than drawn,
numerals and totals struck into the surface, and on the receipt, the one place it is
literal, a perforation, a torn foot and a stamp that lands once.

**Do not build:** gradients; glassmorphism or backdrop blur; neon glow, coloured outer
shadows or drop shadows of any kind; icons of any kind (the tab bar, the steppers and the
status indicators are text and simple dots by design); italics; tracked-out all-caps
eyebrow labels; an arrow glued to button text; a light panel dropped onto the dark
ground. **Middle dots are part of this design:** the handoff joins meta strings with
them on purpose ("3 items · ₦12,500", "Promised in 20 minutes · placed 9:04 pm",
"Order #1042 · Table 12 · Receipt 0088") and those stay. The earlier ban was on middle
dots as decoration between unrelated fragments; it does not strip an approved design.

### Tokens

The values are the ones in `app/globals.css`.

```
--bg          #14120F   the room, warm near-black; header and tab bar share it
--surface     #1D1A16   raised panels: cart bar, order cards, receipt, waiter rows
--fg          #F0EBE1   primary text, bone
--fg-muted    #9A9287   secondary text, captions, inactive tabs
--accent      #D2A24C   ochre: primary action fill, prices, active tab, the ring, chips
--late        #C9482F   the late state only: ring, elapsed numerals, table pill, tab dot
```

Derived values, verbatim from the handoff: hairline `rgba(240,235,225,.09)`; card
divider `.12`; outline button and chip border `.26` and `.28`; ring track `.12` and late
track `rgba(201,72,47,.22)`; accent pill border `rgba(210,162,76,.4)`, ghost fill `.14`;
late pill border `rgba(201,72,47,.45)`; receipt perforation `1px dashed` at `.2`.

### Type

- Display: **Newsreader**, weight 400 only, for the restaurant name, screen titles, dish
  names, money totals and table names. Sizes 44 / 32 / 27 / 25 / 24 / 23 / 21 / 20.
- Everything else: **Space Grotesk**, weights 400, 500, 600. It carries a real naira
  glyph; any substitute must too. Countdown numerals 40px, weight 500, tracking -0.03em,
  tabular. All money and every clock value is tabular.
- Load both with `next/font/google`. No third family.

### Spacing, radii, sizes

Screen gutter 22px everywhere; header block `14px 22px 16px`; dish row `20px 22px` with
a 17px gap and a 76px circular photo; card padding 18px; radii 999px for pills, chips
and buttons, 16px for the receipt, 14px for order and waiter cards, 12px for payment
rows; tab bar `13px 0 26px`. Nothing tappable below 44px effective. Viewport 390 by 844.

### Motion

anime.js throughout, restrained: one orchestrated entrance per screen, everything else
answers an action and shows what changed. Menu rows stagger in once; the add control
morphs into the stepper; the cart bar rises once and its figures tick. The ring's
`stroke-dashoffset` is driven from real elapsed time against the promise, computed from
`placedAt`; ochre to late red is a slow crossfade, never a snap or a flash. New waiter
rows slide in on the poll; status changes recolour in place; nothing pulses. Payment
prints the receipt. Every scope declares `mediaQueries: { reduceMotion }` and degrades to
a fade. No sound feature.

### Photography

Real, licensed and self-hosted under `public/photos/`, because the CSP allows images from
this origin only. The sources and licences are in `docs/PHOTOGRAPHY.md`. One CSS
treatment sits over all of them so eleven sources read as one shoot. Never ship a
placeholder.

### Superseded: The Pass

Replaced in Phase 5 because it was well built and wrong: industrial metal, too dark and
heavy, and its ordering screen had furniture over the task. Its lamp clock and its
ticket through-line survive as ideas; its paper treatment survives as surface detail in
Night Service. Kept here for the lineage the submission document needs.


The visual language is **The Pass**: the kitchen side of a restaurant pass at nine at
night. Brushed steel is the room, brass is the rail, thermal paper is everything printed,
and the heat lamp is the clock. The customer's order is a ticket on a spike under its own
lamp, the waiter's rail is a rail, and the receipt is the same paper torn off. It was
chosen in Phase 4b over two other directions that were also built for real; the critique
is `docs/directions/README.md` and the three prototypes stay at `/directions`.

**Do not build:** purple, violet or indigo anywhere; two-stop gradients; glassmorphism or
backdrop-blur; neon glow or coloured outer shadows; one soft grey shadow under every
surface; one radius on everything; tracked-out all-caps eyebrow labels; an arrow glued to
button text; meta strings joined with middle dots. Light is halftone, steel is grain,
shadows are hard offsets in soot, and every visual choice traces to the pass or to the
data it presents.

#### Tokens

The values are the ones in `app/globals.css`.

```
--steel         #3A3D40   the room, brushed
--steel-dark    #2C2F31
--steel-light   #4B4F53
--brass         #B08A3E   the rail, the plates, the spikes
--brass-dark    #7D5F26   the machined lower edge
--brass-light   #D6B466   the name on the steel, the machined upper edge
--soot          #1B1A18   print, hard offsets, the printer slot
--ink           #2A2622   text on paper
--ink-soft      #625A4F   secondary text on paper, 4.84:1 on aged paper
--char          #C9362A   the PAID stamp only, at stamp size
--char-ink      #9B2A20   red text on paper, and button faces carrying paper text
--served        #3F7D5A   served and paid, at large size only
--served-ink    #2F6647   green text on paper, and button faces carrying paper text
--lamp-warm     #F2A93B   a lamp just switched on
--lamp-cool     #B8AD90   a lamp that has been on far too long
--paper-fresh   #F4EEDD   thermal paper under a warm lamp
--paper-aged    #E4D9BF   thermal paper under a cool one
```

`--heat` runs from 1 to 0. `--lamp`, `--paper` and `--lamp-opacity` are mixed from it with
`color-mix` on the element that carries it (`.heat`), never on `:root`, because a custom
property resolves where it is declared. The bright char and served are for stamps and
button faces; text on paper uses the ink versions. No text ever sits on a lamp pool.

#### Type

- Display: **Fraunces**, variable, with the `SOFT`, `WONK` and `opsz` axes loaded, for the
  restaurant name and the big numbers. The only curve in the room.
- Everything printed: **IBM Plex Mono**, weights 400, 500 and 700. Tabular figures on
  every count.
- Load both with `next/font/google`. No third family.

#### The hero is the lamp

Time is the app's subject, so the heat lamp over the ticket is the clock. Its halftone
pool shrinks as the promised minutes are used, and its light cools and dims, slowly and
continuously, as the order runs late, while the paper ages under it. Never a red alert:
a lamp that has been on too long, not a fire. Served holds warm and steady; paid puts the
lamp out. Under `prefers-reduced-motion` the temperature still shifts, in one slow step
per state, because it is the app's central idea. `components/pass/heat.ts` is the one
place it is computed. Contrast holds at both ends of the range, worst case 4.84:1.

#### Motion budget

One orchestrated page-load sequence on the menu: the lamps come on one at a time, the
name warms in, the strips drop off the rail and print. That is the only motion nobody
asked for.

Everything after that answers an action and shows what changed:

- Add a line: its hole is punched, the count prints, a line feeds up on the ticket.
- Fire the order: a `createTimeline` tears the ticket off the printer and swings it up
  toward the rail before the order page opens.
- The rail: `createDraggable` on the y axis, a pull that meets friction and springs back
  and opens the serving dialog past a deliberate distance. The button and the keyboard
  open the same dialog.
- Settle: the receipt feeds out, the PAID stamp lands once, the lamp goes out.
- Sound: four synthesised cues that answer those actions, off by default behind a
  visible tag.


### Superseded: West African enamelware

Replaced in Phase 4b because it read as competent and forgettable, a card grid on a blue
ground with nothing a person would remember an hour later, and its countdown was a widget
rather than the condition of the screen. Kept here for the lineage the submission
document needs.

The visual language is **West African enamelware**: the speckled enamel trays, bowls and
plates found in every Lagos kitchen. Deep saturated ground, chalk-white forms, a dark
hairline rim around every light shape the way real enamel is edged, and a scatter of
speckle as texture. It gives CHOWLY a specific place and a specific material instead of
another restaurant SaaS dashboard.

**Do not build:** cream background with a terracotta accent and a high-contrast serif;
near-black with one acid accent; identical rounded cards with the same soft grey shadow;
tracked-out all-caps eyebrow labels; meta strings joined with middle dots; a `→` glued to
button text. Those are defaults, not decisions.

#### Tokens

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

#### Type

- Display: **Bricolage Grotesque**, variable, for the restaurant name, the countdown and
  section heads. Use the width and optical size axes; treat it as an element, not a label.
- Body and UI: **Instrument Sans**.
- Load both with `next/font/google`. No third family. The countdown uses tabular figures
  so digits do not jitter as they tick.

#### The hero is the countdown ring

The wait time is the dramatic spine of the whole assignment: order, wait, delay, complain,
rate. So it is the hero, not a hero image and not a big number with a gradient. An SVG ring
whose `stroke-dashoffset` is driven by real elapsed time against `waitMinutes`. It sits in
`--flame` while the order is on time, crosses to `--pepper` when elapsed passes the
promised wait, and settles to `--leaf` when the waiter marks it served. The complaint
button only appears once the ring has crossed, which is what makes the complaint feel
earned instead of decorative.

#### Motion budget

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
