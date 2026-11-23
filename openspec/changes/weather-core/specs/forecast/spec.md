# Spec Delta

## Purpose

Getting the active place's forecast and showing its seven days: what data is fetched, how it is cached, what each day card shows, and how loading and failure look.

## ADDED Requirements

### Requirement: Forecast data scope
For an active location, the app SHALL request on the server only, in the place's own time zone, 8 days of the daily, hourly and current variables listed in FR-FORECAST-01 and the design. That includes hourly cloud cover for all 8 days, which the comfort score needs. Temperatures SHALL be in °C and wind in km/h, with no API key. (FR-FORECAST-01, TC-DATA-01, TC-STACK-03, NFR-COST-01, BC-BRAND-03)

#### Scenario: One server request per new place
- **GIVEN** a place not requested in the last 15 minutes
- **WHEN** it becomes the active location
- **THEN** the server makes one forecast request with `timezone=auto` and `forecast_days=8`, and the browser makes no request to any Open-Meteo host

#### Scenario: Dates are the place's dates
- **GIVEN** a place in a time zone 10 hours behind the visitor
- **WHEN** its forecast is shown
- **THEN** the first day card is the place's current local date, not the visitor's

### Requirement: Seven day cards
The forecast SHALL show seven day cards, today first in place-local dates. Each shows the weekday and date («Сб, 28 лист.»), a weather icon, the max and min temperature («13° / 5°», whole degrees), precipitation probability («Опади 5%») and max wind («Вітер 8 км/год»). Saturday and Sunday cards SHALL carry the weekend accent. (FR-FORECAST-02)

#### Scenario: Card content
- **GIVEN** a day with code 0, max 12.6 °C, min 4.5 °C, precipitation 5 %, wind 8.4 km/h on Saturday 2026-11-28
- **WHEN** its card renders
- **THEN** it reads «Сб, 28 лист.», shows the «Ясно» icon, «13° / 5°», «Опади 5%», «Вітер 8 км/год», and has the weekend accent

#### Scenario: Exactly seven cards
- **GIVEN** a response with 8 days
- **WHEN** the day cards render
- **THEN** exactly seven cards are shown: the first seven days

#### Scenario: Missing daily value
- **GIVEN** a day whose precipitation probability is null
- **WHEN** its card renders
- **THEN** that figure shows «Опади —» and the card still renders

### Requirement: Weather icons from WMO codes
Each WMO weather code SHALL map to one of the icons and Ukrainian labels in PRD Appendix B; unknown codes map to «Невідомо» with the cloud icon. Icons next to figures SHALL have their label as accessible name. Day cards SHALL use the day variant. (FR-FORECAST-08, TC-STACK-06)

#### Scenario: Mapping table
- **WHEN** every code listed in Appendix B is mapped
- **THEN** each yields the icon and label in its row, and code 42 yields «Невідомо»

#### Scenario: Accessible icon
- **WHEN** a day card with code 61 is inspected
- **THEN** its icon has the accessible name «Дощ»

### Requirement: Caching and transitions
Forecast responses SHALL be cached on the server per rounded location for 15 minutes, and geocoding responses per query for 24 hours, keeping Open-Meteo usage within its free tier. While a new place loads, the previously shown forecast SHALL stay visible until the new one is ready. (FR-FORECAST-05, NFR-API-01)

#### Scenario: Cache hit
- **GIVEN** Львів's forecast was fetched 5 minutes ago
- **WHEN** another visitor opens `/?lat=49.84&lon=24.03&name=Львів`
- **THEN** the forecast is served without a new Open-Meteo request

#### Scenario: Switching places keeps the old forecast
- **GIVEN** Львів's forecast is shown
- **WHEN** Ужгород is selected
- **THEN** Львів's cards stay visible until Ужгород's forecast replaces them, and the page never goes blank

### Requirement: Loading state
On a first load with no forecast yet shown, the forecast area SHALL show skeletons in the final shape (weekend panel and seven day cards) on `surface-sunken`, with no spinner and no layout shift when data arrives. (FR-FORECAST-07)

#### Scenario: First load
- **WHEN** a shared forecast URL is opened and the forecast is still loading
- **THEN** skeletons matching the weekend panel and seven cards are visible, and when data arrives the cumulative layout shift of the page stays below 0.1

### Requirement: Failure state
If the forecast request fails, times out after 8 seconds, or returns data that doesn't match the expected shape, the forecast area SHALL show an error Notice «Не вдалося завантажити прогноз» with «Пошук працює — спробуйте ще раз за хвилину.» Search SHALL keep working, nothing SHALL be logged to the browser console, and a failed response SHALL NOT be cached. (FR-FORECAST-06, NFR-OBS-01)

#### Scenario: Service error
- **GIVEN** the forecast service answers with HTTP 500
- **WHEN** a place is selected
- **THEN** the error Notice is shown in the forecast area, search still works, and the browser console has no errors

#### Scenario: Malformed response
- **GIVEN** a response missing `daily.time`
- **WHEN** it is processed
- **THEN** the error Notice is shown, not a crash or partial cards

#### Scenario: Failure is not cached
- **GIVEN** a failed request for a place
- **WHEN** the same place is requested again
- **THEN** a new request is made
