# Evidence: the role switch

A segmented pill at the top right of every screen except the landing, on both sides,
opposite the lockup. The filled half is the view you are in; the other half is a link to
the other view. It says Guest and Waiter and claims nothing else, because there are no
logins in this application.

## Geometry, both engines, identical

| Screen | Header height | Title top | Tap target | Hits lockup / title / tab bar |
|---|---|---|---|---|
| guest menu, order, pay | 104.5 | 40 | 58x44 | no / no / no |
| waiter rail, tables, menu | 104.5 | 40 | 55x44 | no / no / no |
| waiter order (back header) | 81.3 | 37 | 55x44 | no / no / no |

Those are the same numbers as before the switch existed: 104.5 and y=40 on the standard
header, 81.3 and y=37 on the back variant. The header did not grow and the title did not
move. The control cancels its own border with a one pixel negative margin and the link
half cancels its 44px padding the same way, so it takes exactly the lockup's height.

Two attempts got that wrong before it was right, both caught by measuring rather than
looking: a four pixel vertical padding made the row 24, and wrapping the switch and the
lockup in a div made the back header 83.3, because a wrapper does not pass its children's
negative margins up.

## Switching

```
chromium   guest -> waiter 119ms    waiter -> guest 100ms
webkit     guest -> waiter 103ms    waiter -> guest  68ms
```

`page context survived: true` on every switch: a value written to `window` before the tap
is still there afterwards, so the document was never reloaded. It is a client-side route
change with the destination's data warmed on hover, focus and touch, and it marks a tab
press so the screen it opens renders in place instead of playing its entrance. That is the
same path the tab bar takes.

## Keyboard

Chromium reaches it at the second tab stop, after the lockup, with a `solid 2px
rgb(210, 162, 76)` focus ring drawn inside the pill.

WebKit does not reach links by Tab, which is macOS Safari's own "Press Tab to highlight
each item" setting rather than anything in the page. The rule applies when the link is
focused by other means.

The only console message in either engine was WebKit failing to load
`__nextjs_original-stack-frames`, which is Next's development overlay and does not exist
in a production build.
