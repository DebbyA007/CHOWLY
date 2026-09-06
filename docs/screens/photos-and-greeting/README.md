# Evidence: the greeting, the lockup, the photographs and the receipt save

Sixteen frames, eight per engine, at 390 wide with a device pixel ratio of two. Chromium
is Chrome for Testing, run against a local production build; WebKit is Playwright's, run
against the development server, because our own Content Security Policy sends
`upgrade-insecure-requests` outside development and WebKit applies it to `localhost` where
Chromium exempts it. That is a local testing artifact and not a defect: the deployed app
is https throughout. It is written up as a recurring cause in `docs/AI-LOG.md`.

Not from the deployed preview: Vercel's previews on this account sit behind the account's
SSO and answer a capture run with a 302 it cannot pass.

| Frame | What it shows |
|---|---|
| `01-menu-full` | The menu at 390: the larger lockup, the greeting, the two-level strip, photographed rows. |
| `02-lockup-guest` | The guest header cropped. |
| `03-greeting` | The greeting cropped. |
| `04-menu-lunch-mains`, `05-menu-dinner` | Photographed rows through the card. |
| `06-lockup-waiter` | The waiter header cropped, the same lockup. |
| `07-receipt-full` | The receipt, with saving as the primary action. |
| `08-receipt-save` | The save control cropped: the filled button, the line naming Save Image, and the quiet download. |

## What the frames were checked against

Both engines, identical numbers:

```
greeting   "Good morning. | What would you like this morning?"
header     headerH 104.5   titleTop 40   lockupTap 50   mark 22   wordmark 15px
menu       rows photographed 92, monograms 0, images failed to load 0
receipt    save button primary: true
           hint: "Your phone opens its own sheet. Tap Save Image and the receipt goes to your photos."
           download-instead shown: 1
```

The header numbers are the point of the lockup change. Before it the mark was 16 and the
wordmark 12; after it they are 22 and 15, and the header is still 104.5 pixels tall with
the title still at y=40. The same holds on the waiter side and on the back-variant header
of a waiter order page, which was measured separately at 81.3 and y=37 before and after.

The receipt line was exercised in both engines because both report that they can share a
file, so both take the share path rather than the download fallback. **It was not tested
on a real iPhone: there is no device here.** What iOS does with a files-only share is
reasoned from the Web Share API contract, not observed.
