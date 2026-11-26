# Spec Delta

## Purpose

The selected place is stated only in the URL, so a view can be shared, reloaded and navigated with Back/Forward. Every feature that picks a place writes it there; every feature that shows a place reads it from there.

## ADDED Requirements

### Requirement: URL is the single source of truth
The active location SHALL be represented only by the query parameters `lat`, `lon` and `name` (PRD Appendix C). Opening a URL with valid parameters SHALL show that place without any further input. Nothing about the location SHALL be stored in cookies or browser storage. (FR-SEARCH-03, FR-LOC-01, BC-PRIVACY-03)

#### Scenario: Shared link opens the same place
- **GIVEN** the URL `/?lat=49.84&lon=24.03&name=Львів`
- **WHEN** it is opened in a new private window
- **THEN** the page shows the forecast for Львів, with «Львів» as the place name, and the search field is not required

#### Scenario: Nothing persisted
- **WHEN** a place is selected and the page is reloaded without query parameters
- **THEN** the empty state is shown, and no cookie or storage entry holds the previous place

### Requirement: Canonical coordinates
When the app writes a location, it SHALL write `lat` and `lon` rounded half-up to 2 decimal places (≈1 km), and `name` URL-encoded and at most 80 characters. (FR-LOC-01)

#### Scenario: Rounding on write
- **GIVEN** a selected place at latitude 49.83826 and longitude 24.02324
- **WHEN** the app writes it to the URL
- **THEN** the URL contains `lat=49.84&lon=24.02`

#### Scenario: Long names are shortened
- **GIVEN** a place name 95 characters long
- **WHEN** the app writes it to the URL
- **THEN** `name` holds its first 80 characters

### Requirement: Invalid or partial parameters
If `lat` or `lon` is missing, not a number, or out of range (latitude −90…90, longitude −180…180), the page SHALL show the empty state with an info Notice «Не вдалося відкрити це місце. Оберіть місто в пошуку.» and SHALL NOT request a forecast. If only `name` is missing or empty, the place SHALL be labelled with its coordinates, e.g. «49,84° пн. ш., 24,03° сх. д.». (FR-LOC-01)

#### Scenario: Out-of-range latitude
- **WHEN** `/?lat=123&lon=24&name=X` is opened
- **THEN** the info Notice and the search are shown, no forecast request is made, and nothing is logged to the browser console

#### Scenario: Non-numeric coordinate
- **WHEN** `/?lat=abc&lon=24.03` is opened
- **THEN** the same info Notice is shown and no forecast request is made

#### Scenario: Missing name
- **WHEN** `/?lat=49.84&lon=24.03` is opened
- **THEN** the forecast for those coordinates is shown, labelled «49,84° пн. ш., 24,03° сх. д.»

#### Scenario: Southern and western coordinates
- **WHEN** `/?lat=-33.87&lon=-151.21` is opened
- **THEN** the label reads «33,87° пд. ш., 151,21° зх. д.»

### Requirement: History between places
Choosing a new place SHALL add a browser history entry, so Back returns to the previously shown place (or to the empty state) and Forward returns again. (FR-LOC-02)

#### Scenario: Back returns to the previous place
- **GIVEN** Львів was selected, then Ужгород
- **WHEN** the browser Back button is pressed
- **THEN** the URL and the page show Львів again, without a full page reload

#### Scenario: Back from the first place
- **GIVEN** the empty state, then Львів selected
- **WHEN** Back is pressed
- **THEN** the empty state is shown again
