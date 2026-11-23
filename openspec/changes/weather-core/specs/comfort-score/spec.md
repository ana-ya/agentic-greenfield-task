# Spec Delta

## Purpose

Turning one day's weather into a comfort read: a 0–100 score with a one-sentence Ukrainian rationale, or an explicit "no data", shown as a badge on the day card.

## ADDED Requirements

### Requirement: Comfort model
A day's comfort SHALL be computed by a pure, total function from five inputs (apparent temperature max, precipitation probability max, wind speed max, mean cloud cover 09:00–18:00 place time, UV index max), using the penalties, caps, rounding and rationale selection of PRD Appendix A. It SHALL never throw, and every input combination SHALL produce either a score 0–100 with a rationale or the no-data result. (FR-COMFORT-01, FR-COMFORT-02, FR-COMFORT-07)

#### Scenario: Reference cases
- **WHEN** each reference case in PRD Appendix A is scored
- **THEN** the score, band and rationale match the table exactly

#### Scenario: Total over any input
- **WHEN** the function is called with any combination of numbers, `NaN`, `±Infinity` and missing values for the five inputs
- **THEN** it returns without throwing, and the score is either a whole number 0–100 or no-data

#### Scenario: Monotonic in rain
- **GIVEN** two days identical except for precipitation probability
- **WHEN** both are scored
- **THEN** the rainier day never scores higher

### Requirement: Rationale text
The rationale SHALL be exactly one Ukrainian sentence of at most 80 characters, with no exclamation mark and no emoji, taken from the Appendix A table. (FR-COMFORT-03, BC-BRAND-01)

#### Scenario: Every rationale obeys the rules
- **WHEN** every rationale the model can produce is checked
- **THEN** each is ≤ 80 characters, ends with one full stop, and contains no «!» and no emoji

### Requirement: No score without data
When all five inputs of a day are missing, the result SHALL be no-data with the rationale «Немає даних для оцінки.», never a score. (FR-COMFORT-09)

#### Scenario: All inputs missing
- **WHEN** a day with all five inputs missing is scored
- **THEN** the result is no-data with «Немає даних для оцінки.», not 100

#### Scenario: Some inputs missing
- **GIVEN** a day with only UV missing
- **WHEN** it is scored
- **THEN** it gets a numeric score, with UV adding no penalty

### Requirement: Comfort badge on each day
Each day card SHALL show the comfort badge: the score and the band's word («Комфортно» ≥ 70, «Терпимо» 40–69, «Некомфортно» < 40) on the band's fill, with an accessible name «Комфорт ‹N› зі 100, ‹word›». A no-data day SHALL show the neutral «Немає даних» badge, with no number and no comfort colour. (FR-COMFORT-04, FR-COMFORT-09, NFR-A11Y-02)

#### Scenario: Band boundaries
- **WHEN** days scoring 39, 40, 69 and 70 are shown
- **THEN** their badges read «39 Некомфортно», «40 Терпимо», «69 Терпимо» and «70 Комфортно» on the poor, fair, fair and good fills

#### Scenario: Accessible name
- **WHEN** a badge for score 86 is inspected
- **THEN** its accessible name is «Комфорт 86 зі 100, комфортно»

#### Scenario: No-data badge
- **WHEN** a no-data day is shown
- **THEN** the badge reads «Немає даних» on the neutral style, shows no number, and uses none of the three comfort fills
