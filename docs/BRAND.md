# CHOWLY brand

## The mark

An open ring in ochre with a detached dot in its opening.

It is three things at once, which is why it works here and would not work for another
product: the **C** of CHOWLY, the **countdown arc** from the order screen, and the **rim of
a plate**. The detached dot is the next minute. Without it the mark is a generic letter
ring; with it, the mark reads as time.

Geometry, in a 100 unit square: a circle centred at 50,50 with radius 31, stroked at 11
units with round caps, drawn from 55 degrees clockwise to 305 degrees, leaving a 110 degree
opening on the right. The dot sits at 81,50 with radius 5.5.

Do not redraw it by eye. Use `public/brand/mark.svg`.

### Rules
- Ochre `#D2A24C` on dark ground, or near-black `#14120F` on an ochre ground. No other pairing.
- The opening always faces right. Never rotate it.
- Never fill the ring. Never add a second dot. Never close the gap.
- Never place it on a photograph without a solid ground behind it.
- Minimum size 16px. It has been tested and holds at that size.
- Clear space on all sides is equal to the radius of the dot at whatever scale it is drawn.

## Lockups

**Horizontal**, for headers and the waiter chrome: mark at 46 percent of the wordmark's cap
height, then a gap, then the wordmark.

**Stacked**, for the landing: mark above, wordmark centred beneath it.

The wordmark is **CHOWLY** set in Newsreader 400, all caps, letter-spacing 0.15em, in bone
`#F0EBE1`. Set it in the app with `next/font`, never as text inside an SVG file, or it falls
back to Georgia wherever the font has not loaded.

The mark may appear alone once the wordmark has been established on the same screen. The
wordmark may appear alone. They are never restyled, recoloured or re-spaced relative to each
other.

## Colour

| Token | Hex | Meaning |
|---|---|---|
| `bg` | `#14120F` | Ground. Warm near-black, never neutral grey. |
| `surface` | `#1D1A16` | Raised panels. |
| `fg` | `#F0EBE1` | Bone. Primary text. |
| `fg-muted` | `#9A9287` | Secondary text. |
| `accent` | `#D2A24C` | Ochre. **Time and action, nothing else.** |
| `late` | `#C9482F` | The late state only. Never decoration, never a brand colour. |

Ochre carries a single meaning across the product: something is running, or something can be
done. Spend it on the countdown ring, the primary action, the price, the active tab, the
mark. Spending it on decoration is what makes an accent stop working.

No gradients, glassmorphism, backdrop blur, glow or drop shadows anywhere. Elevation is the
`surface` step and a hairline border, nothing else.

## Type

- **Newsreader** 400, serif. Display only: the wordmark, screen titles, dish names, money totals.
- **Space Grotesk** 400 / 500 / 600. Everything else: body, labels, buttons, all numerals.
- Countdown and money use `font-variant-numeric: tabular-nums` so digits do not jitter as they tick.
- No italics. No tracked-out all-caps eyebrow labels. The wordmark is the only all-caps setting.
- Verify any substitute face carries a real naira glyph, or the sign collides with the first digit.

## Voice

Warm, and completely normal. "Your order", "Track your order", "Add to order", "Menu", "Pay".

Never clever, never quippy, never in character. The interface does not narrate itself to the
person using it, and it does not explain its own concept. If a label sounds like it was
written to be admired, rewrite it.

The one required disclosure is that payment is pretend. It appears on the payment button and
on the receipt, once each, in plain words. Nowhere else.

## Files

- `public/brand/mark.svg` — the mark alone, transparent ground
- `public/icon.svg` — 180px app icon on the near-black ground, 40px corner radius
- Favicon and apple-touch-icon are generated from `icon.svg`
