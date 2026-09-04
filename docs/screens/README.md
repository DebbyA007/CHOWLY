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
