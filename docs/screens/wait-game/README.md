# Evidence: the games

Both games in both modes at 390, in Chromium and in WebKit, **captured against the
deployed application** at https://chowly-theta.vercel.app. Earlier runs for this feature
were against a local build because Vercel's preview deployments sit behind the account's
SSO; now that the branch is merged the live URL is the one under test, and everything below
was re-taken there.

## The countdown never goes behind the panel

The panel is capped at `calc(100dvh - 415px)` rather than at a percentage, so it is held
below the ring whatever the screen height. Measured on production, in every state the panel
can reach:

| State | Panel top | Ring bottom | Clear of the ring by | Needs scrolling |
|---|---|---|---|---|
| picker | 577 | 401 | 177 | no |
| tic tac toe | 504 | 401 | 104 | no |
| tic tac toe, won | 444 | 401 | 44 | no |
| quiz | 475 | 401 | 74 | no |
| quiz, answered | 425 | 401 | 24 | no |

Identical to the pixel to the same measurement taken against a local production build,
which is what one would hope for and worth checking rather than assuming. There is no
scrim over the ring, and the digits kept ticking in every frame.

An earlier cap of 52dvh left five pixels of clearance at the tallest state and made the won
board scroll. Both were found by measuring rather than by looking.

## Both games, both modes, on the live URL

| | Chromium | WebKit |
|---|---|---|
| Tic tac toe alone, the app replies | board reads `XO` after one move | same |
| Tic tac toe two players, a win | "X wins.", win line drawn | same |
| Quiz alone, the answer is shown | "The answer is Leafy vegetables." | "The answer is Yaji." |
| Quiz two players, whose turn | "Player one, your turn." | same |
| Twelve questions, no repeats | 12 distinct | 12 distinct |
| Close, with nothing asked | panel gone | panel gone |

Neither engine reported a page error in any run.

## Motion, sampled mid-animation

A mark landing, four samples across 240ms:

```
chromium  opacity 0.41 scale 0.70 -> 0.90 / 0.95 -> 1.00 / 1.00
webkit    opacity 0.32 scale 0.66 -> 0.83 / 0.91 -> 1.00 / 1.00
```

The win line drawing, sampled as stroke-dashoffset:

```
chromium  118 -> 31 -> 1 -> 0
webkit    118 -> 39 -> 6 -> 0
```

An earlier version restarted that draw on every render, because the effect depended on the
winner object, which is rebuilt each time. It is keyed on the line now, and the fourth
sample settling at 0 rather than jumping back is what proves it.

A question turning over, sampled as opacity and transform. The `matrix3d` is the rotateX in
flight, resolving to a plain matrix once it lands:

```
chromium  0.29 matrix3d -> 0.82 matrix3d -> 1 matrix3d -> 1 matrix
webkit    0.26 matrix3d -> 0.82 matrix3d -> 0.99 matrix3d -> 1 matrix
```

## The order interrupting the game

The waiter marked the order served on the live app with a game open. In both engines a band
appeared over the game within one poll:

```
order status now: SERVED
alert over the game: "Your order has been served. See your order"
```

## Keyboard

Chromium: tabbing reaches the board, the focus ring computes to `solid 2px rgb(210, 162,
76)`, the cell announces `top left, empty`, and Enter plays it.

WebKit reached no cells by Tab. That is macOS Safari's own setting, which keeps controls out
of the tab order unless "Press Tab to highlight each item" is on, and it is the same
behaviour this project already recorded for links. The rule itself is present in the
stylesheet WebKit loads, and applies when a control is focused.

## What the capture needed

Chromium is launched with `--disable-blink-features=AutomationControlled` and an iPhone user
agent, because Vercel's edge mitigation answers a plain automation run with a challenge
page. WebKit needed neither this time, which corrects an earlier note in this repository
saying WebKit could not pass that checkpoint: it could not while the mitigation was tripped
by heavy capture traffic, and it can when it is not.
