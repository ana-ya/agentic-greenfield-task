# Spec Delta

## Purpose

The frame every feature mounts into: header, first-load hero, responsive layout, footer credits, theme indication, and where UI text comes from.

## ADDED Requirements

### Requirement: Header with product name and theme indicator
The page SHALL show a header with the product name (text, no logo) and an indicator of the active UI theme, light or dark. The header SHALL sit on the `scrim` surface, never directly on the background. (FR-SHELL-01, FR-SHELL-04)

#### Scenario: Header content
- **WHEN** the home page loads
- **THEN** the header shows «Weather Explorer» as text and an indicator whose accessible name states the active theme («Світла тема» or «Темна тема»)

#### Scenario: Theme follows the system without a toggle
- **GIVEN** the operating system switches from light to dark while the page is open
- **WHEN** the change takes effect
- **THEN** the page switches to the dark theme and the indicator reads «Темна тема», with no reload, no toggle control, and nothing written to cookies or browser storage

### Requirement: First-load hero with centred search
With no active location, the page SHALL show the hero question «Куди поїхати на вихідні» and the city search, centred, and no forecast and no default city. (FR-SHELL-03, BC-PRIVACY-02)

#### Scenario: Empty state
- **WHEN** `/` is opened with no query parameters
- **THEN** the hero heading and the search field are visible, no forecast request is made, and no location permission is requested

### Requirement: Responsive layout
The layout SHALL be one column below 720 px wide, and from 1024 px a 12-column grid with content at most 1200 px wide, with the weekend panel above the day cards. (FR-SHELL-02)

#### Scenario: Narrow screen
- **GIVEN** a viewport 390 px wide with an active location
- **WHEN** the page renders
- **THEN** all sections stack in one column, the seven day cards scroll horizontally in one row, and nothing overflows the viewport horizontally except that row

#### Scenario: Wide screen
- **GIVEN** a viewport 1280 px wide with an active location
- **WHEN** the page renders
- **THEN** the content is centred at no more than 1200 px wide, and the seven day cards sit in one row without scrolling

### Requirement: Footer credits
The footer SHALL credit Open-Meteo and OpenStreetMap with links to their sites. (BC-BRAND-02)

#### Scenario: Credits link out
- **WHEN** the footer is inspected
- **THEN** it contains «Дані: Open-Meteo · Карта: © OpenStreetMap contributors», with «Open-Meteo» linking to https://open-meteo.com/ and «OpenStreetMap contributors» linking to https://www.openstreetmap.org/copyright

### Requirement: Centralised Ukrainian-first strings
All product UI text SHALL come from one Ukrainian strings module. An English module SHALL define the same keys, and a missing or extra key SHALL fail the type check. The rendered locale is Ukrainian, with no language switch. Copy SHALL follow the content rules: no exclamation marks, no emoji in product text, numbers with units, 24-hour times. (NFR-I18N-01, BC-BRAND-01, BC-BRAND-03)

#### Scenario: English keys must match
- **GIVEN** a key present in the Ukrainian module but missing from the English one
- **WHEN** `npm run typecheck` is run
- **THEN** it fails, naming the missing key

#### Scenario: Copy rules hold
- **WHEN** every string value in the Ukrainian module is checked by a unit test
- **THEN** none contains «!» and none contains an emoji character

### Requirement: Privacy-preserving shell
The application SHALL set no cookies, use no analytics or third-party trackers, and make no browser requests to third-party hosts for fonts, scripts or data. (BC-PRIVACY-01, BC-PRIVACY-03, TC-DATA-01)

#### Scenario: No third-party traffic from the browser
- **GIVEN** the app running with live data (local `npm run dev` or a deployment), opened in a private window
- **WHEN** a city is searched and selected and the forecast loads
- **THEN** the browser's network log shows requests only to the app's own origin, and `document.cookie` is empty
