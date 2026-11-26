# Spec Delta

## Purpose

Finding a place by typing its name: suggestions while typing, keyboard and pointer selection, and calm empty and failure states.

## ADDED Requirements

### Requirement: Debounced suggestions
Typing in the search field SHALL show up to 8 suggestions from the geocoding service, in Ukrainian where available, about 250 ms after typing stops. Queries shorter than 2 characters (after trimming spaces) SHALL make no request and show no list. Only the latest query's results SHALL be shown, even if an earlier request answers later. Requests SHALL go through the app's own server, never from the browser to the geocoding service. (FR-SEARCH-01, TC-DATA-01, TC-STACK-03)

#### Scenario: Suggestions appear after a pause
- **WHEN** «Льв» is typed and typing stops
- **THEN** within about 250 ms plus network time a list of at most 8 suggestions appears, and the browser made one request to the app's own origin for this query

#### Scenario: One character makes no request
- **WHEN** «Л» is typed
- **THEN** no request is made and no list or Notice is shown

#### Scenario: Out-of-order answers
- **GIVEN** a request for «Льв» that answers after a later request for «Львів»
- **WHEN** both answers have arrived
- **THEN** the list shows the results for «Львів»

### Requirement: Suggestion content
Each suggestion SHALL show the place name and a secondary line «‹region› · ‹country›» (the region omitted when unknown), plus the country's flag emoji when the country code is known. The flag SHALL be hidden from assistive technology. (FR-SEARCH-02)

#### Scenario: Full suggestion
- **GIVEN** a result Львів, region «Львівська область», country «Україна», code UA
- **WHEN** it is shown
- **THEN** the row reads «Львів» over «Львівська область · Україна», with 🇺🇦 marked `aria-hidden`

#### Scenario: Missing region
- **GIVEN** a result with no region
- **WHEN** it is shown
- **THEN** the secondary line shows only the country, with no leading separator

### Requirement: Selecting a suggestion
Selecting a suggestion by click, tap or Enter SHALL make it the active location (written to the URL per the active-location capability), close the list, and put the place name in the field. (FR-SEARCH-03)

#### Scenario: Click selects
- **WHEN** the suggestion «Львів» is clicked
- **THEN** the URL becomes `?lat=…&lon=…&name=Львів` and the forecast for Львів starts loading

### Requirement: Keyboard model
The search SHALL behave as an accessible combobox: ArrowDown and ArrowUp move the highlighted suggestion (wrapping around), Enter selects the highlighted one, Escape closes the list and keeps the typed text. Enter with no highlighted suggestion SHALL select the only suggestion when exactly one is shown, and otherwise do nothing. The field, the list and the highlighted option SHALL expose their roles and state to assistive technology. (FR-SEARCH-04, NFR-A11Y-01)

#### Scenario: Arrow and Enter
- **GIVEN** three suggestions are shown
- **WHEN** ArrowDown is pressed twice and then Enter
- **THEN** the second suggestion becomes the active location

#### Scenario: Enter on a lone suggestion
- **GIVEN** exactly one suggestion is shown and none is highlighted
- **WHEN** Enter is pressed
- **THEN** that suggestion becomes the active location

#### Scenario: Enter with several suggestions and none highlighted
- **GIVEN** three suggestions are shown and none is highlighted
- **WHEN** Enter is pressed
- **THEN** nothing is selected and the list stays open

#### Scenario: Escape
- **GIVEN** the list is open
- **WHEN** Escape is pressed
- **THEN** the list closes and the typed text stays in the field

#### Scenario: Screen-reader semantics
- **WHEN** the search is inspected in the accessibility tree
- **THEN** the field has role `combobox` with an accessible name «Пошук міста» and `aria-expanded` reflecting the list; the list has role `listbox`; the highlighted row has role `option` with `aria-selected="true"`

### Requirement: Nothing found
When the geocoding service returns no results, the list area SHALL show an inline info Notice «Нічого не знайдено» with the hint «Спробуйте іншу назву.» Never a toast, error page or console error. (FR-SEARCH-05)

#### Scenario: No matches
- **WHEN** «zzqqxx» is typed and the service returns no `results`
- **THEN** the Notice «Нічого не знайдено» appears where the list would be, and the active location does not change

### Requirement: Search failure
If the geocoding request fails or takes longer than 5 seconds, the list area SHALL show an error Notice «Пошук зараз недоступний» with «Спробуйте ще раз за хвилину.», and the current forecast, if any, SHALL stay as it is. (FR-SEARCH-08)

#### Scenario: Service down
- **GIVEN** the geocoding service responds with an error
- **WHEN** a query is typed
- **THEN** the error Notice is shown inline, the console stays silent, and the forecast already on screen is unchanged
