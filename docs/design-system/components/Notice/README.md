# Notice

The calm inline state for empty results and failed requests — the product's answer to "honest under failure".

- Consumer provides: `tone` (`info` or `error`), a short title and one sentence saying what still works or what to do.
- Structure: `wx-notice` on `surface-raised` with a `line` outline; 20px icon; title in `body` weight 600; detail in `body-sm` `ink-muted`. `wx-notice-error` colours only the icon and title `danger` — no red fill.
- Place it where the missing content would be (in the suggestion list, in the forecast area, over the map skeleton) so the layout does not jump.
- Use `role="status"`, not `alert`. No exclamation marks, no stack traces, nothing in the console on a healthy session.
