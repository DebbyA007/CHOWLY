# Screens and evidence of Night Service

Everything here was captured against the deployed app at
https://chowly-theta.vercel.app at 390 wide, in headless Chromium and in Playwright's
WebKit 26.5. Times in the frames are the machine's local time at capture.

## The screens, numbered

The `0x-*-390.png` frames at the top of this folder are the eight screens of the handoff
and their states, clicked through in order in Chromium on the dev server before the
repair. The same screens after the repair, from production, are in `after/`.

## Before and after the repair

`before/` holds every screen and the element crops from production before the repair;
`after/` holds the same from production after it. The pairs that matter are on one sheet,
`motion/sheets/before-after.png`: the order card, a live-orders row, the waiter's order
card, the pay summary and the receipt, at two times.

## Motion, as frames

Every sequence below is a real order on production, captured as consecutive frames, in
`motion/chromium/` and `motion/webkit/`, with a contact sheet of each in `motion/sheets/`.

| Sheet | What it shows |
|---|---|
| `chromium-sweep.png`, `webkit-sweep.png` | The ring drawing in and then sweeping, ten frames about 300ms apart; the offsets logged before each frame are in the AI log |
| `chromium-cross.png` | The promise crossing on a four-minute order: twelve frames fifteen seconds apart, the arc emptying, then refilling while ochre becomes red, then closed and red, and the whole screen at the end |
| `chromium-place.png`, `webkit-place.png` | Placing an order, from the tap through the sheet leaving to the Order tab with the ring drawing in |
| `chromium-serve.png`, `webkit-serve.png` | Mark as served, from the press through the wait to the pill draining into the record |
| `chromium-print.png`, `webkit-print.png` | The receipt printing: the card feeding down from the perforation, the lines, the stamp landing, the credit and the button |

## States

`states/` holds what a stranger meets off the happy path, from production: the landing
without a table on the link, the Order and Pay tabs with no order, a waiter order that
does not exist, the 404, the three loading states caught early, placing an order while
offline, and the live list seven seconds after going offline.

## Part 4: the fixes, as evidence

Everything below is from production after the Part 4 fixes, at 390, in Chromium and in
Playwright's WebKit 26.5. The full log of every frame, with what the page reported at
each one, is in `docs/AI-LOG.md` under the Part 4 evidence entry.

`motion/sheets/part4-before-after.png` puts each changed screen beside what it replaced:
the three loading states against the shapes, the offline list that still said "Five
open" against "As of 9:31" and the bar, the door with nothing asked against the door
asking, the placeholder pill against the chosen waiter, the waiter's card against the
report from the table, four steps against three, the receipt's end against the rating
and somewhere to go. `motion/sheets/part4-states.png` is every new state on one sheet.

| Sheet | What it shows |
|---|---|
| `chromium-place-optimistic.png`, `webkit-place-optimistic.png` | Placing with the request held 2.5 s on top of the real latency: the Order tab open within a second with the ring sweeping and "Sending to the kitchen", then the kitchen's number landing with the arc carrying on from where it was |
| `chromium-serve-optimistic.png`, `webkit-serve-optimistic.png` | Mark as served with the request held 2 s: "Served at" on the first frame after the press, holding while the server answers |
| `chromium-back-online.png`, `webkit-back-online.png` | The 1.5 s after the connection returns on the order screen and the live list: "Back online. Refreshed." once, then gone |
| `chromium-picker.png` | The roster sheet entering, frames 90ms apart |
| `chromium-86.png` | Zobo switched to Sold out on the 86 board, frames 100ms apart, the subtitle counting |

The single states in `states/q-*.png` (Chromium) and `states/webkit-q-*.png` (WebKit):
the door asking for the table, refusing to open without one, and knowing it; the table
sheet on the menu; the loading shapes of the menu, the order, the pay screen, the live
list and the open order; offline on the order and on the live list; placing refused by
the network with Try again, then two open orders with a chip each; the roster before and
after choosing; the served order offering Rate your order and Pay, rated, the receipt with
the rating and "Order something else", the paid order with "See the receipt" and the
earlier orders; the 86 board before and after; the sold-out refusal naming Zobo and the
order that went through without it; the guest menu without Zobo; the table board; a late
order's report as a count on the live row and in full on the open order. `states/crop-*`
are the element crops of the same.

## The five concerns, the tabs and the brand

From production under iPhone 13 emulation (390 wide, touch, device pixel ratio 3), in
Chromium and in WebKit; the earlier desktop-viewport captures could not see a phone's
zoom, which is why the field-size defect got past them.

| Sheet | What it shows |
|---|---|
| `five-states.png` | The door with its field in focus at 16px and the scale at 1; bottled water on the card; Zobo greyed with its tag on the card and on the sheet with Remove; the pot cooking, late and settled; the bill; the receipt. WebKit copies prefixed `webkit-` |
| `chromium-pot.png`, `webkit-pot.png` | The pot: cooking, frames 120ms apart, three wisps at different heights and opacities on every frame; late, the line reddening with the ring and the lid ajar; served, the steam thinning to nothing over seven frames |
| `chromium-pay-moment.png`, `webkit-pay-moment.png` | Pay: the other ways step back, "Taking payment", the bill lifting away, the receipt printing |
| `chromium-tabs.png`, `webkit-tabs.png` | Tab switches Order to Menu, Menu to Order, Order to Pay, Pay to Order, frames 60ms apart: every part at full opacity from the first frame after the press, and the same switch before the fix for comparison |
| `chromium-mark.png`, `webkit-mark.png` | The mark drawing in on first arrival at the landing: the arc sweeping, the dot landing last |

`states/brand-*.png` are the lockups in place: stacked on the landing, horizontal in the
menu header and the waiter chrome, with element crops `q5-crop-brand-*`.

## The splash

From production under iPhone 13 emulation, in Chromium and in WebKit, in a fresh
context each time so the cold start is real: `motion/*/splash-*` are frames 70ms apart
from the first paint through the fill (the arc against its track, the dot on the head,
`data-progress` and the three signals logged at each frame), the park (the dot going on
to the gap at 0 degrees), the handoff (the door rising under the dissolve) and the
landed door; `motion/*/splash-reduced-*` are the same under reduced motion, a still
lockup and a cross-fade. Sheets: `chromium-splash.png`, `webkit-splash.png`,
`chromium-splash-reduced.png`. The warm start that follows, in the same context, shows
no splash.

## The static door and the way home

From production under iPhone 13 emulation, both engines, on the sheets
`chromium-home.png` and `webkit-home.png`. `motion/*/cold-*` are the cold start on the
now static door, frames 120ms apart, the splash filling, parking and handing off.
`motion/*/home-*` are frames 100ms apart after tapping the lockup on the Order tab while
the order still read "Sending to the kitchen": the door entering with no splash. Then
`states/home-back-on-order` is the Order tab afterwards, with the order landed and
nothing lost, and `states/home-focus` is the header with the lockup focused from the
keyboard, its ring in ochre. `states/warm-*.png` are the first frames of a warm start,
the door already there and the splash never displayed; the measurement behind that is in
the AI log, taken at the first animation frame rather than guessed from a screenshot.

`states/home-focus.png` is the header with the lockup focused from the keyboard on
production: the ochre ring drawn inside the 44px target, which is the area that is
actually tappable, rather than a tighter ring that would lie about it.

## The vessel, the bill and the saved receipt

From production under iPhone 13 emulation, both engines, on the sheets
`chromium-vessel.png` and `webkit-vessel.png`. `motion/*/vessel-food-making-*` is the pot
simmering, frames 230ms apart, five wisps at different heights on every frame;
`vessel-food-serve-*` is the lid lifting away and the plate arriving under it with the
steam settling, 170ms apart, caught mid-transition rather than as an end state;
`vessel-drinks-making-*` is the pour; `vessel-drinks-serve-*` is the pour stopping and
the level rising to full; `vessel-drinks-late-*` is the glass in the late tone, its
stroke matching the ring's `--ring-tone` exactly.

`states/served-order-pay.png` is the served order with the primary action to the bill
under the ring, and `states/receipt-saved.png` is the file the save button produces, at
1170 by 1251 on a device pixel ratio of 3. The WebKit copies carry the `webkit-` prefix.
