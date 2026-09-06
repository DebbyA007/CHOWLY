# Evidence: saving the receipt, by the route the browser can take

Six frames, three per engine, at 390 wide. The three are the same screen in three
browsers: one that will carry the file, one that exposes `navigator.share` and refuses
files, and one with no share at all. The second is the Android case.

The second and third browsers are shaped in the page before anything runs, by overriding
`navigator.canShare` and `navigator.share`. **That is a simulation of Android, not
Android.** There is no Android device here, so what is proved below is that the routing,
the wording and the download all behave correctly when a browser refuses files. What is
not proved is that Chrome on Android refuses them in the way the report describes.

| Browser | Hint under the button | Download control | Primary button |
|---|---|---|---|
| accepts files | "Your phone opens its own sheet. Save the picture from there, or download it below." | shown, 47px | opens the sheet |
| refuses files | "It saves as a picture in your downloads." | not shown, because the primary is the download | writes the file |
| no share at all | "It saves as a picture in your downloads." | not shown | writes the file |

Both engines gave identical results. The file the primary button produced when the share
could not carry it:

```
chromium / refuses-files    -> chowly-receipt-0010-order-1011.png
chromium / no-share-at-all  -> chowly-receipt-0011-order-1012.png
webkit   / refuses-files    -> chowly-receipt-0013-order-1014.png
webkit   / no-share-at-all  -> chowly-receipt-0014-order-1015.png
```

That is the point of the fix: where the share cannot carry the picture, the button that
says save produces a saved picture instead of a sheet that cannot.

The download control is 47px tall, above the 44px floor the design sets for anything
tappable. It had been a bare text button of about sixteen pixels.

Neither engine reported a page error on any of the six.

## What is confirmed on real hardware, and what is not

- **iPhone: confirmed by the user.** Saving works, and it is unchanged by this fix, because
  a browser that accepts the file still takes the sheet.
- **Android: not confirmed.** The failure was reported by the user; the cause is inferred
  from the Web Share API, where a browser may expose `share` and still refuse files; the
  repair is verified against a browser shaped to behave that way. It has not been run on an
  Android phone.
