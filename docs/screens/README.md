# Screens and evidence

Every image here was captured against the deployed app at https://chowly-theta.vercel.app,
at 390 wide, in headless Chromium and in Playwright's WebKit 26.5 under an iPhone 13
profile. Times shown in the frames are the machine's local time at capture.

The folder holds three kinds of thing. **Contact sheets** in `motion/sheets` are the ones
to look at: each is a whole sequence on one page, captioned with what it shows and how far
apart the frames are. **Raw frames** in `motion/chromium` and `motion/webkit` are the
individual captures those sheets are built from, kept as the underlying evidence. **States**
in `states` are single screens and element crops of everything off the happy path.

`landing-390.png`, `menu-390.png`, `order-late-390.png` and `receipt-390.png` are the
four the root README shows, captured from production in one pass. An earlier numbered set
was removed: it had been captured on the dev server before several redesigns, carried the
dev badge, and had begun to show a version of the app that no longer exists.

## Contact sheets

| Sheet | What it shows |
|---|---|
| `chromium-splash`, `webkit-splash` | The cold start: the arc filling from real load progress, the dot parking in the gap, the door rising under the dissolve. `chromium-splash-reduced` is the same under reduced motion |
| `chromium-mark`, `webkit-mark` | The CHOWLY mark drawing itself in on first arrival |
| `chromium-vessel`, `webkit-vessel` | The pot simmering, the lid lifting away as the plate arrives, the glass being poured, the pour stopping as the level rises, and the glass in the late tone |
| `chromium-pot`, `webkit-pot` | The earlier pot-only sequences: cooking, late, settled |
| `chromium-sweep`, `webkit-sweep`, `chromium-cross` | The countdown ring drawing in, sweeping, and crossing from ochre to late red |
| `chromium-place-optimistic`, `webkit-place-optimistic` | Placing an order with the request held: the Order tab open within two seconds, then the kitchen's number landing |
| `chromium-serve-optimistic`, `webkit-serve-optimistic` | Mark as served answering on the first frame after the press |
| `chromium-place`, `webkit-place`, `chromium-serve`, `webkit-serve`, `chromium-print`, `webkit-print` | The earlier placement, serving and receipt-printing sequences |
| `chromium-pay-moment`, `webkit-pay-moment` | Paying: the other methods stepping back, the bill lifting away, the receipt printing |
| `chromium-tabs`, `webkit-tabs` | Tab switches, with the same switches before the fix beside them |
| `chromium-home`, `webkit-home` | The cold start on the static door, and going home from an order still being sent |
| `chromium-back-online`, `webkit-back-online` | The moment a connection returns |
| `chromium-picker` | The roster sheet opening |
| `chromium-86` | A dish switched to sold out on the waiter's board |
| `part4-before-after`, `before-after` | Each changed screen beside what it replaced |
| `part4-states`, `five-states` | Every state from a round of work on one page |

## States and crops

`states` holds single screens and element crops: the door asking for a table and refusing
to open without one, the loading shapes of every screen, offline and back on both sides,
a placement refused and retried, a dish sold out and named, the roster before and after
choosing, the bill, the receipt with its rating, the table board, the 86 board, a late
order's report reaching the waiter, and the saved receipt file itself
(`receipt-saved.png`, and `webkit-receipt-saved.png`).

## Before and after

`before` and `after` hold the same screens and crops either side of one repair, so the
pairs can be read directly: the order card, a live-orders row, the waiter's order card,
the pay summary and the receipt.

## What was removed

217 byte-identical copies were deleted, which is what happens when a sequence ends on a
still and the last frames repeat. Every distinct frame is still here.
