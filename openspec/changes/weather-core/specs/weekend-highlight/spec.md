# Spec Delta

## Purpose

The product's headline answer: which weekend is meant for this place, its averaged comfort, and a calm verdict, shown above the day cards.

## ADDED Requirements

### Requirement: Which weekend
The upcoming weekend SHALL be determined from the place's local date, not the visitor's: from Monday to Saturday it is this week's Saturday and Sunday (on Saturday, today and tomorrow); on Sunday it is next week's Saturday and Sunday. (FR-COMFORT-06)

#### Scenario: Weekday
- **GIVEN** the place's local date is Wednesday 2026-11-25
- **WHEN** the weekend is determined
- **THEN** it is Saturday 2026-11-28 and Sunday 2026-11-29

#### Scenario: Saturday
- **GIVEN** the place's local date is Saturday 2026-11-28
- **THEN** the weekend is 2026-11-28 and 2026-11-29

#### Scenario: Sunday means next weekend
- **GIVEN** the place's local date is Sunday 2026-11-29
- **THEN** the weekend is 2026-12-05 and 2026-12-06, and both days are within the 8 fetched days

#### Scenario: Place date differs from visitor date
- **GIVEN** it is Sunday for the visitor but still Saturday at the place
- **THEN** the weekend is the place's current Saturday and Sunday

### Requirement: Weekend panel
Exactly one weekend panel SHALL appear above the day cards, showing the label «Ці вихідні · ‹dates›», the verdict title, the weekend rationale (the lower-scoring day's), the combined weekend max/min temperature, the large comfort badge, and a per-day line for Saturday and Sunday («Сб 13° / 5° · опади 5%»). (FR-COMFORT-05)

#### Scenario: Panel content
- **GIVEN** Львів with Saturday 13°/5°, rain 5 %, score 84 and Sunday 12°/6°, rain 15 %, score 72, on 2026-11-28/29
- **WHEN** the panel renders above the day cards
- **THEN** it shows «Ці вихідні · 28–29 листопада», the badge «78 Комфортно», Sunday's rationale, «13° / 5°», and the lines «Сб 13° / 5° · опади 5%» and «Нд 12° / 6° · опади 15%»

#### Scenario: Weekend dates across months
- **GIVEN** a weekend of 2026-05-30 and 2026-05-31
- **THEN** the label reads «Ці вихідні · 30–31 травня»; for 2025-05-31 and 2025-06-01 it reads «Ці вихідні · 31 травня – 1 червня»

### Requirement: Verdict by band
The weekend score SHALL be the half-up rounded mean of the Saturday and Sunday scores, and the verdict title SHALL follow its band: ≥ 70 «‹місто› — варто їхати», 40–69 «‹місто› — можна їхати, але з планом Б», < 40 «‹місто› — краще перенести». (FR-COMFORT-05, FR-COMFORT-08)

#### Scenario: Good weekend
- **GIVEN** Saturday scores 84 and Sunday 72 for Львів
- **WHEN** the panel renders
- **THEN** the badge reads «78 Комфортно», the title «Львів — варто їхати», and the rationale is Sunday's (the lower)

#### Scenario: Fair weekend
- **GIVEN** a weekend score of 55 for Ужгород
- **THEN** the title reads «Ужгород — можна їхати, але з планом Б»

#### Scenario: Poor weekend
- **GIVEN** a weekend score of 31 for Чернівці
- **THEN** the title reads «Чернівці — краще перенести»

#### Scenario: Rounding
- **GIVEN** Saturday 70 and Sunday 69
- **THEN** the weekend score is 70 (69.5 rounds up) and the title says «варто їхати»

### Requirement: No verdict without data
If Saturday or Sunday has no score, the panel SHALL show an info Notice «Прогноз на ці вихідні поки недоступний.» instead of a verdict and badge, with no number, title or rationale. (FR-COMFORT-09)

#### Scenario: Sunday has no data
- **GIVEN** Saturday scores 80 and Sunday is no-data
- **WHEN** the panel renders
- **THEN** it shows the info Notice in place of the verdict, and no weekend score or title is shown
