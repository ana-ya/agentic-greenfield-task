# Button

Starts an action; primary (`wx-btn-primary`, `brand` fill, `on-brand` text) at most once per view — usually «Порівняти вихідні» or the search submit.

- Variants: `wx-btn-primary`, quiet `wx-btn` (`surface-raised`, `line-strong` border), `wx-btn-text` (`brand` text, no border) for secondary inline actions such as «Закріпити місто».
- Consumer provides: a `<button>` element, a verb-first sentence-case Ukrainian label, an optional 18px outline icon before the label.
- Height 40px, `radius-md`, `space-4` horizontal padding. Focus: 2px `focus` outline, 2px offset.
- Disabled shows why in its label («Закріплено 3 з 3»), not only by fading.
- Don't: exclamation marks, ALL CAPS, two primary buttons side by side.
