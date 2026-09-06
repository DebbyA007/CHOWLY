# Evidence for the new card, the stations and the cancel window

Thirty four frames, seventeen per engine, at 390 wide with a device pixel ratio of two.
Chromium is Chrome for Testing; WebKit is Playwright's. Every frame is from the
`menu-and-roles` branch.

**Where they were taken.** Chromium ran against the branch's own production build,
`next build` then `next start`, on the same Neon database the deployed app uses. WebKit
ran against the development server, because our own Content Security Policy sets
`upgrade-insecure-requests` outside development, WebKit applies it to `localhost` where
Chromium exempts it, and every same origin fetch then fails with a TLS error. That is a
local testing artifact, not a defect: the deployed app is https throughout.

**Not from the deployed preview.** Vercel's preview deployments on this account are behind
the account's SSO and answer a capture run with a 302 to `vercel.com/sso-api`. Production
could not be used either: it runs the old code. Both engines were run against the same
code and the same data over a different origin instead, which is said here rather than
described as production.

| Frame | What it shows |
|---|---|
| `01-menu-breakfast` | The seven printed headings, with Food and Drinks as the second row under Breakfast. A photograph and two monograms in one list. |
| `02-menu-lunch-mains` | Lunch, then Mains. Three line descriptions with "Show all of it" under the two that are clipped. |
| `03-menu-wines` | The three bottles priced from a floor: "from ₦75,000" and "Ask your waiter" where the add control sits. |
| `04-menu-tasting` | The tasting menu at ₦85,000 and ninety minutes, its pairing at ₦55,000. |
| `05-menu-tasting-expanded` | The same row with its eight courses opened. |
| `06-order-sheet` | The order sheet before placing. |
| `07-order-cancel-open` | "Cancel this order" with "You can cancel for 00:11 more" under it. |
| `08-window-t10s`, `t14s`, `t18s` | The same block across the window closing. |
| `09-order-tasting-90min` | A ninety minute promise: the ring reading 89:57 without reflow, the window at 22:27. |
| `10-cancel-confirm` | "Keep it" and "Yes, cancel". |
| `11-cancelled` | The cancelled order: no vessel, the ring reduced to its track, two steps, nothing to pay. |
| `12-waiter-water` | The waiter's screen for an order of still water: one picker, and the line that says why. |
| `13-waiter-cancelled` | An order cancelled while the waiter had it open. |
| `14-rail` | The live rail, with the cancelled order absent from it. |
| `15-86-board` | The 86 board, every dish named by both levels. |

## The window closing, measured

"No layout shift" is a claim that has to be measured. The y position of the progress
stepper, sampled every two seconds through the close, in both engines:

```
t+ 0s open    You can cancel for 00:11 more      stepper y=617
t+ 8s open    You can cancel for 00:03 more      stepper y=617
t+10s open    You can cancel for 00:01 more      stepper y=617
t+12s closed  Your order is on its way, so it ca stepper y=617
t+22s closed  Your order is on its way, so it ca stepper y=617
```

Both ends of the menu were walked rather than reasoned about. Premium Still Water, a one
minute promise, gives a fifteen second window. The chef's tasting menu, ninety minutes,
gives twenty two and a half: measured at "You can cancel for 22:27 more" with the ring
reading 89:57.

## The refusals, by request

```
chef sent for a water order: Nothing on this order came from the kitchen, so it has no chef.
a price-on-request bottle:   Premium Red Wine – Bottle is priced on the night, so it cannot go on an order. Ask your waiter.
a posted price:              Unknown field: priceKobo. Prices and wait times are set by the kitchen, not the client.
one second past the window:  The time to cancel this order has passed. Ask your waiter if something is wrong.
someone else's order:        No order with that id for this table.
a second cancel:             This order is already cancelled.
```

Neither engine reported a page error on any frame.
