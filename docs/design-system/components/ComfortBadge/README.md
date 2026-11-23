# ComfortBadge

Shows a day's 0–100 comfort score as number plus word on one of three fills.

- Consumer provides: `score` (0–100). `WeatherExplorer.comfortLevel(score)` returns the level; `WeatherExplorer.badgeHTML(score, size)` renders the badge with an `aria-label` («Комфорт 86 зі 100, комфортно»).
- Levels: 70–100 `comfort-good` «Комфортно»; 40–69 `comfort-fair` «Терпимо» (with a `line-strong` hairline, since the yellow is close to the page); 0–39 `comfort-poor` «Некомфортно».
- Sizes: default 24px for day cards and tables; `lg` 32px in WeekendHighlight.
- Always both number and word — never a colour dot alone.
- The one-sentence explanation goes beside or below the badge in `body`/`ink-muted`, never inside it.
