# Evidence: the games

Both games in both modes at 390, in Chromium against a production build and in WebKit
against the development server, because our Content Security Policy sends
`upgrade-insecure-requests` outside development and WebKit applies it to `localhost`.

## The countdown never goes behind the panel

The panel is capped at `calc(100dvh - 415px)` rather than at a percentage, so it is held
below the ring whatever the screen height. Measured in every state the panel can reach:

| State | Panel top | Ring bottom | Clear of the ring by | Needs scrolling |
|---|---|---|---|---|
| picker | 577 | 401 | 177 | no |
| tic tac toe | 504 | 401 | 104 | no |
| tic tac toe, won | 444 | 401 | 44 | no |
| quiz | 475 | 401 | 74 | no |
| quiz, answered | 425 | 401 | 24 | no |

There is no scrim over the ring, and the digits kept ticking in every frame. An earlier
cap of 52dvh left only five pixels of clearance at the tallest state and made the won
board scroll; both were found by measuring rather than by looking.

## Both games, both modes

| | Chromium | WebKit |
|---|---|---|
| Tic tac toe alone, the app replies | board reads `OX` after one move | same |
| Tic tac toe two players, a win | "X wins.", win line drawn | same |
| Quiz alone, the answer is shown | "Not that one. The answer is 36." | "Not that one. The answer is 150." |
| Quiz two players, whose turn | "Player one, your turn." | same |
| Twelve questions, no repeats | 12 distinct | 12 distinct |
| Close, with nothing asked | panel gone | panel gone |

Neither engine reported a page error in any run.

## Motion, sampled mid-animation

A mark landing, in Chromium, four samples across 240ms:

```
opacity 0.24  scale 0.62
opacity 0.91  scale 0.96
opacity 1.00  scale 1.00
```

The win line drawing, sampled as stroke-dashoffset:

```
chromium  120 -> 39 -> 1 -> 0
webkit    121 -> 40 -> 7 -> 0
```

An earlier version restarted that draw on every render, because the effect depended on the
winner object, which is rebuilt each time. It is keyed on the line now, and the fourth
sample settling at 0 rather than jumping back to 120 is what proves it.

A question turning over, sampled as opacity and transform. The `matrix3d` is the rotateX
in flight, resolving to a plain matrix once it lands:

```
chromium  0.31 matrix3d -> 0.84 matrix3d -> 1 matrix
webkit    0.28 matrix3d -> 0.70 matrix3d -> 0.96 matrix3d -> 1 matrix
```

## The order interrupting the game

The waiter marked the order served with a game open. In both engines a band appeared over
the game within one poll:

```
order status now: SERVED
alert over the game: "Your order has been served. See your order"
```

## Keyboard

Chromium: tabbing reaches the board, the focus ring computes to `solid 2px rgb(210, 162,
76)`, the cell announces `top left, empty`, and Enter plays it.

WebKit reached no cells by Tab. That is macOS Safari's own setting, which keeps controls
out of the tab order unless "Press Tab to highlight each item" is on, and it is the same
behaviour this project already recorded for links. The rule itself is present in the
stylesheet WebKit loaded, and applies when a control is focused.

## A note on the harness

In development Next mounts an overlay portal over the bottom-left corner, which swallowed
clicks aimed at the picker. The WebKit run calls `click()` on the element directly to get
past it. A production build has no such element, which is why the Chromium run needed
nothing.
