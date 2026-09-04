# Handoff: CHOWLY — Night Service (direction 1c)

## Overview
CHOWLY is a dining app used by guests **already seated in the restaurant**. The guest browses the
menu on their own phone, adds items, places an order against their table number, tracks it against a
promised wait time, and pays. A waiter view lists live orders, records who cooked and who mixed the
drinks, and marks an order served.

The restaurant in the design is **The Golden Gate, 13 Ubah Street, Berger, Lagos**. Prices are in
naira (₦), prep times in minutes.

This is deliberately a **conventional ordering-app structure** — header, category tabs, scrolling
dish list with photo left / text right, persistent cart bar, bottom tab navigation, vertical stepper
for order tracking. Nothing about the interaction model should be reinvented. The work is in craft:
typography, spacing rhythm, the photography treatment, and the quality of every state.

"Night Service" is one of three visual treatments that were explored over the same structure. It is
the one selected for build. The other two (1a Green House, 1b Broadsheet) are in the same reference
file and are **not** in scope — ignore them.

## About the Design Files
The file in this bundle is a **design reference created in HTML** — a prototype showing intended look
and behaviour, not production code to copy. The task is to **recreate these designs in the target
codebase's existing environment** (React, Vue, SwiftUI, React Native, native Android, etc.) using its
established patterns, component library, and theming. If no environment exists yet, pick the most
appropriate framework for the product and implement there.

The prototype is a single streaming HTML component with inline styles. Do not port the inline styles
literally — translate the values below into the codebase's tokens, components, and stylesheets.

## Fidelity
**High-fidelity.** Colours, type, spacing, and radii are final and should be matched closely. The one
exception is photography: every image in the prototype is a **placeholder** (see Assets).

## Design Tokens

### Colour
| Token | Hex | Use |
|---|---|---|
| `bg` | `#14120F` | App background (warm near-black). Header and tab bar share it. |
| `surface` | `#1D1A16` | Raised panels: cart bar, order cards, receipt, waiter rows. |
| `fg` | `#F0EBE1` | Primary text (bone). |
| `fg-muted` | `#9A9287` | Secondary text, captions, inactive tabs. |
| `accent` | `#D2A24C` | Ochre. Primary action fill, prices, active tab, countdown ring, selected chips. |
| `late` | `#C9482F` | The late state only: ring, elapsed numerals, table pill, active tab dot. |

Derived values used verbatim in the prototype:
- Hairline divider / border: `rgba(240,235,225,.09)`
- Card inner divider: `rgba(240,235,225,.12)`
- Outline button border, unselected chip border: `rgba(240,235,225,.26)` (chips `.28`)
- Ring track: `rgba(240,235,225,.12)`; late ring track `rgba(201,72,47,.22)`
- Accent pill border: `rgba(210,162,76,.4)`; accent ghost fill `rgba(210,162,76,.14)`
- Late pill border: `rgba(201,72,47,.45)`
- Receipt perforation: `1px dashed rgba(240,235,225,.2)`

**No** gradients, glassmorphism, backdrop blur, neon glow, or drop shadows anywhere. Elevation is
expressed only by the `surface` colour step and hairline borders.

### Typography
Two families, both Google Fonts:
- **Newsreader** (serif) — display only: restaurant name, screen titles, dish names, money totals,
  table names in the waiter list. Weight 400. Sizes: 44 / 32 / 27 / 25 / 24 / 23 / 21 / 20px.
  Letter-spacing `-.015em` on the 44px landing lockup, otherwise default. Line-height 1.05–1.2.
- **Space Grotesk** (sans) — everything else: body copy, labels, prices, buttons, numerals.
  Weights 400/500/600. Sizes: 15 / 14.5 / 14 / 13.5 / 12.5 / 12 / 11.5 / 8px (photo placeholder tag).
  Line-height 1.5–1.6 on descriptions and captions.
- Countdown numerals: Space Grotesk 40px, weight 500, `letter-spacing:-.03em`,
  `font-variant-numeric:tabular-nums`. All money on the receipt and all clock values use
  tabular-nums.
- Fallbacks in the prototype: `Newsreader, Georgia, serif` and `'Space Grotesk', system-ui, sans-serif`.
  Note Space Grotesk **does** carry a real ₦ glyph; verify whatever face you substitute does too, or
  the naira sign collides with the first digit.

Rules the design holds to: no tracked-out all-caps eyebrow labels, no arrow glyphs glued to button
text, no italics.

### Spacing, radii, sizes
- Screen gutter: **22px** left/right, everywhere. Header block `14px 22px 16px`.
- Dish row: `20px 22px`, `gap:17px`, divider below. This is the roomiest of the three directions —
  do not tighten it.
- Card padding: 18px (order/receipt/waiter cards), receipt header block `22px 20px 20px`.
- Radii: `999px` for pills, chips, and all buttons; `16px` receipt card; `14px` order and waiter
  cards; `12px` payment-method rows; `50%` dish photos and status dots.
- Bottom tab bar: `13px 0 26px` (the 26px is the home-indicator inset), `1px` top hairline.
- Viewport: **390 × 844**.
- Touch targets: add control 38px circle, quantity stepper 9px/12px padding inside a pill, all
  primary buttons 18–19px vertical padding. Nothing below 44px effective.

## Menu data
| Dish | Category | Description | Price | Prep |
|---|---|---|---|---|
| Grilled steak | Mains | Sirloin with pepper sauce and chips | ₦8,500 | 22 min |
| Grilled catfish | Mains | Whole, roasted plantain, pepper sauce | ₦7,000 | 20 min |
| Pounded yam and egusi | Mains | Goat meat and stockfish | ₦5,500 | 18 min |
| Jollof rice | Mains | Grilled chicken and fried plantain | ₦3,500 | 12 min |
| Eggs benedict | Mains | Poached eggs and hollandaise | ₦5,000 | 10 min |
| Goat pepper soup | Soups | Hot light broth with scent leaf | ₦4,000 | 14 min |
| Chapman | Drinks | Mixed fruit cocktail with bitters | ₦3,500 | 4 min |
| Mojito | Drinks | Lime and mint | ₦4,000 | 5 min |
| Merlot 2018 | Drinks | French red, by the glass | ₦6,000 | 3 min |
| Zobo | Drinks | Hibiscus with ginger | ₦1,500 | 4 min |

Categories, in order: **Mains · Soups · Drinks**. Default tab: Mains.

Sample order used across screens 3, 4, 6, 7, 8: 1 × Jollof rice, 1 × Grilled catfish, 2 × Chapman.
Subtotal ₦17,500 · VAT 7.5% ₦1,313 · **Total ₦18,813**. Order **#1042**, **Table 12**, placed 9:04 pm,
promised in 20 minutes (the promise is the longest prep time in the order).

Money format: `₦` + thousands-separated integer, no decimals.

## Screens

### 1 · Landing
**Purpose:** identify the restaurant and split guest from staff.
Full-bleed photo occupying the top **452px** (placeholder, see Assets). Below it, a 36/26/32px padded
block: restaurant name in Newsreader 44px on two lines, address in 12.5px `fg-muted` with
`line-height:1.6` and `letter-spacing:.01em`, then the buttons pushed to the bottom by a flex spacer.
Primary button `accent` fill with `#14120F` label, 18px padding, full-width pill: **"I'm a guest"**.
Secondary is an outline pill, same size: **"I'm a waiter"**. Below both, centred 12px `fg-muted`:
**"You're at table 12"**. No bottom tab bar on this screen.

### 2 · Menu
Header: restaurant name Newsreader 25px, address 11.5px `fg-muted`; right-aligned table pill —
11.5px 600 `accent` text, `1px solid rgba(210,162,76,.4)`, `6px 11px`, radius 999px.
Category tabs: a row of pill chips, `9px 16px`, `gap:9px`. Active chip = `accent` fill, `#14120F`
text, weight 600. Inactive = transparent fill, `fg` text, `rgba(240,235,225,.28)` border, weight 400.
Dish row: **76px circular photo left**, then name (Newsreader 20px), description (12px `fg-muted`,
`line-height:1.5`, `text-wrap:pretty`), then a baseline-aligned row of price (14px 600 `accent`) and
prep time (11.5px `fg-muted`), `gap:10px`. Add control right, vertically centred:
- qty 0 → 38px circle, `rgba(210,162,76,.14)` fill, `rgba(210,162,76,.45)` border, `accent` "+" at 20px.
- qty > 0 → `accent` pill with `#14120F` glyphs: `−`, quantity (13px 700, min-width 9px, centred), `+`;
  `gap:12px`, padding `9px 12px`.
Cart bar (persistent, above the tab bar): `surface`, `1px solid rgba(210,162,76,.3)` top border,
padding `16px 16px 16px 22px`. Left column: item count 11.5px `fg-muted`, then total in Newsreader
23px. Right: `accent` pill button `13px 20px`, **"View order"**.
Bottom tabs: **Menu · Order · Pay**, text only, 12px; active is `accent` weight 600 with a 5px `accent`
dot 6px below the label; inactive `fg-muted`.

### 3 · Order placed
Header: "Order #1042" Newsreader 25px, "The Golden Gate" 11.5px `fg-muted`, table pill right.
**The countdown is the feature of this direction.** A 184 × 184 ring, centred, padding `14px 22px 26px`:
two SVG circles at `cx=cy=92, r=82, stroke-width=9`, the whole `<svg>` rotated `-90deg`. Track is
`rgba(240,235,225,.12)`; progress is `accent` with
`stroke-dasharray = (remaining / promise) × 2π×82` then the full circumference (515.3). The arc
therefore *empties* as the wait elapses. Centred inside: "Ready in" 11.5px `fg-muted`, then mm:ss in
40px/500 tabular. Below the ring, centred 12px `fg-muted`: **"Promised in 20 minutes · placed 9:04 pm"**.
Then the vertical stepper, gutter 22px: an 11px dot column (`gap:15px` to the text), 1px connector in
the column's remaining height, `24px` bottom padding per step. Completed steps: `accent` fill + border,
`fg` text; pending: transparent fill, `rgba(240,235,225,.25)` border and connector, `fg-muted` text.
The current step's label is weight 600. Steps and captions:
1. Order placed — 9:04 pm (done)
2. In the kitchen — 9:06 pm (done, current)
3. Ready to serve — About 9:24 pm
4. Served — At your table
Then an item card (`surface`, radius 14, padding `18px 18px 16px`): rows of `2× Name` (qty in
`fg-muted`, 10px right margin) against the line price, then a divider and **Total** in Newsreader 24px.

### 4 · Running late
Same skeleton, `late` substituted for `accent`, and the ring **closed** (`stroke-dasharray` = full
circumference on both circles) with a `rgba(201,72,47,.22)` track — the promise is spent.
Header subtitle becomes "**N minutes late**" in 11.5px 600 `late`; the table pill switches to the late
border. Ring centre reads "Elapsed" + total elapsed mm:ss in `late`. The
"Promised in 20 minutes · placed 9:04 pm" caption sits **below** the ring (it does not fit inside the
stroke — inner clearance is 155px).
Then, centred, 13.5px `fg` with `line-height:1.55`:
**"Sorry, your food is taking longer than we said. It's with the chef now."**
Then two stacked full-width outline pills, `gap:10px`, 15px padding: **"Report a problem"** and
**"Rate your order"**. Stepper follows, with "In the kitchen — Since 9:06 pm" and
"Ready to serve — Any moment".

### 5 · Waiter · live orders
Header: "Live orders" Newsreader 25px, "Five open · two drinks pending" 11.5px `fg-muted`, staff pill
"Ada O." (same style as the table pill). Filter chips, 8px gap, `8px 14px`, 12.5px:
**All · Cooking · Late · Served** — same selected styling as the menu tabs.
Rows are `surface` cards, radius 14, padding `16px 18px`, `margin:0 22px 10px`. Left: table name in
Newsreader 21px + order number 11.5px `fg-muted`, then "3 items · ₦17,500" 12px `fg-muted`.
Right, right-aligned: a 7px status dot + status label 12.5px 600 in the status colour, then the time
12px `fg-muted` tabular. Status colours: Ready `#D2A24C`, Late `#C9482F`, In the kitchen / Just placed
`#9A9287`, Served `rgba(240,235,225,.3)`.
Seed rows: Table 4 #1039 3 items ₦12,500 Ready / "Ready now"; Table 7 #1041 5 items ₦24,000 Late /
"6 min late"; Table 12 #1042 3 items ₦17,500 In the kitchen / live "mm:ss left"; Table 9 #1043 4 items
₦19,500 Just placed / "20 min left"; Table 2 #1040 2 items ₦7,500 Served / "Served 8:52 pm".
Tabs: **Orders · Tables · Menu**.

### 6 · Waiter · order open
Header: a 11.5px `fg-muted` back affordance reading "Live orders", then "Order #1042" Newsreader 27px
with the table pill right.
Card (`surface`, radius 14, padding 18): "Placed 9:04 pm" left and live "mm:ss left" right in 600
`accent`; then item rows (`2× Name` against that item's prep time in 11.5px `fg-muted`) separated by
`rgba(240,235,225,.1)` top borders; then Total in Newsreader 23px.
Below, two labelled chip fields at 22px gutter, label 12.5px `fg-muted`, chips `11px 15px` radius 999,
13.5px 600, selected = `accent` fill on `#14120F`, unselected = outline:
- **Chef** — Emeka Obi · Tunde Bello · Amaka Nwosu (default: Emeka Obi)
- **Bartender** — Ify Chukwu · Sade Balogun (default: Ify Chukwu)
Primary action, full-width `accent` pill, 18px padding: **"Mark as served"**. Once marked, it becomes an
outline pill with `rgba(210,162,76,.5)` border and `accent` label reading **"Served at 9:26 pm"**
(tapping again reverts, for demo purposes only — in production this should be a one-way action with an
undo).

### 7 · Payment
Header "Pay" Newsreader 25px, "Order #1042" beneath, table pill right.
Summary card (`surface`, radius 14, padding 18): item rows, divider, then Subtotal and VAT 7.5% rows in
12.5px `fg-muted`, then **Total** — label 13.5px 600, amount Newsreader 32px in `accent`.
Method field at 22px gutter, label "How would you like to pay?" 12.5px `fg-muted`, then three rows
(`gap:10px`, padding 17px, radius 12): a 16px circular radio then the label 14.5px. Selected row =
`accent` fill, `#14120F` text and ring, weight 600, with the dot rendered as
`box-shadow: inset 0 0 0 3px <fill>` so it reads as a filled ring. Unselected = transparent fill,
`rgba(240,235,225,.28)` border, `fg` text, weight 400. Options: **Card · Bank transfer · Cash at the
till** (default Card).
Primary button, full-width `accent` pill, 19px padding: **"Pay ₦18,813"**.
- **Loading:** the button becomes `rgba(210,162,76,.28)` with `fg` text, a 15px 2px spinner
  (`rgba(240,235,225,.3)` ring, `#F0EBE1` top, `spin .7s linear infinite`) and the label
  **"Taking payment"**. Duration in the prototype is 1500ms; replace with the real request.
- **Done:** an outline card (`rgba(210,162,76,.5)`, radius 14, padding 18) reading **"Paid ₦18,813"** in
  15.5px 600 `accent` with "Card · 9:38 pm" in 12.5px `fg-muted` beneath, and an underlined 12.5px
  `fg-muted` **"Start over"** below it (prototype affordance — drop or replace in production).

### 8 · Receipt
Header "Paid" Newsreader 25px with "Thank you. Your table is settled." 11.5px `fg-muted`.
Receipt card: `surface`, radius 16, `overflow:hidden`. Top block centred, `22px 20px 20px`, separated by
a `1px dashed rgba(240,235,225,.2)` perforation: restaurant name Newsreader 24px, then
"13 Ubah Street, Berger, Lagos" / "3 Sep 2026, 9:38 pm" and
"Order #1042 · Table 12 · Receipt 0088" in 11.5px `fg-muted`.
Body `18px 20px 20px`: item rows with tabular prices, divider, Subtotal and VAT rows, then a final
divider and **"Paid by card"** 13.5px 600 against the total in Newsreader 32px `accent` tabular.
Below the card, 12px `fg-muted`: "Served by Ada O. · Chef Emeka Obi · Bar Ify Chukwu" — pulled from the
waiter fields on screen 6. Then two stacked outline pills, 16px padding:
**"Rate your order"**, **"Email receipt"**.

## Interactions & Behavior
- **Category tabs** filter the dish list in place. No animation.
- **Add / stepper.** Tapping "+" on a dish at qty 0 swaps the circle for the quantity pill. Decrementing
  to 0 swaps it back. The cart bar count and total update immediately.
- **Empty cart.** When the cart reaches 0 items the cart bar becomes a `surface` strip with a
  `rgba(240,235,225,.09)` top border and centred 13px `fg-muted` **"Your order is empty"**. The bar never
  disappears — the slot is reserved so the layout does not jump.
- **Countdown** ticks once per second from a 1s interval, both the numerals and the ring arc. It counts
  *down* to the promise on screen 3 and *up* past it on screen 4; crossing the promise is what flips the
  screen into the late treatment. In production, derive the remaining time from a server timestamp, not a
  client-side counter, and clamp at 0.
- **Waiter filters** map statuses to groups: Cooking = Ready / In the kitchen / Just placed; Late = Late;
  Served = Served; All = everything. The live row (Table 12) shares its clock with the guest countdown.
- **Chef / bartender / payment method** are single-select. Selecting is instant, no confirmation.
- **Pay** runs idle → busy → done as described above.
- **Transitions.** The only animation in the direction is the pay spinner. Keep tab and chip changes
  instant; if you add motion, cap it at 150ms and use it only on the cart bar's total.
- **Hover** is not designed — this is a touch product. Use the codebase's standard press/active feedback
  (a brief opacity or fill step) on every tappable element.

## State Management
| State | Type | Notes |
|---|---|---|
| `activeCategory` | `'Mains' \| 'Soups' \| 'Drinks'` | Default `'Mains'`. |
| `cart` | `Record<dishId, qty>` | Increment/decrement; delete the key at 0. Count and total derive from it. |
| `tick` | number | 1s interval driving the countdown. Server time in production. |
| `waiterFilter` | `'All' \| 'Cooking' \| 'Late' \| 'Served'` | Default `'All'`. |
| `chef`, `bartender` | string | Defaults `'Emeka Obi'`, `'Ify Chukwu'`. Written onto the order. |
| `served` | boolean | Set by "Mark as served". |
| `paymentMethod` | `'Card' \| 'Bank transfer' \| 'Cash at the till'` | Default `'Card'`. |
| `payStatus` | `'idle' \| 'busy' \| 'done'` | 1500ms simulated in the prototype. |

Data the real app needs: the menu (with category, price, prep minutes, photo), the guest's table, the
open order (items, placed-at, promised minutes, status), the live-order list for staff, and the staff
roster for the chef and bartender fields.

## Assets
**Every image in the prototype is a placeholder** — a tinted stripe fill (`#241F19` with
`rgba(210,162,76,.16)` 135° hairlines) carrying a small monospace label naming what belongs there. They
must be replaced with real photography before this ships:
- Landing: one full-bleed dining-room shot, 390 × 452, top-aligned crop.
- Menu: one shot per dish, **circular crop at 76px** (supply at 2× minimum, 152px square source).
  Ten needed, one per menu item.
Treatment for this direction: shot dark and close, warm light, plate filling the circle, consistent
colour temperature across all ten. The round crop is load-bearing — it is what distinguishes this
direction from the rejected rectangular-card default, so shoot or crop centre-weighted.
No icons are used anywhere. The tab bar, steppers, and status indicators are text and simple dots by
design; do not substitute an icon set.

## Files
- `CHOWLY Directions.dc.html` — the design reference. It contains all three explored directions.
  **Build only direction 1c.** Its frames are marked with `data-screen-label="1c …"`
  (`1c Landing`, `1c Menu`, `1c Order placed`, `1c Running late`, `1c Waiter orders`,
  `1c Waiter order`, `1c Payment`, `1c Receipt`). Open the file in a browser and pan to the third row
  to see them live — the tabs, cart, countdown, chips, and pay flow all work.
