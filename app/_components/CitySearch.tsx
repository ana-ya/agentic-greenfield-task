"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { Notice, SearchIcon } from "@/components/design-system";
import { secondaryLine, type Suggestion } from "@/lib/geocode/results";
import { strings } from "@/lib/i18n";
import { hrefFor } from "@/lib/location";

/**
 * City search combobox (design D-5, FR-SEARCH-01…05/08): 250 ms debounce, one in-flight request
 * (a newer query aborts the older one, so out-of-order answers never win), ARIA 1.2 combobox.
 * Selecting a place writes it to the URL; the forecast follows from there.
 */

const DEBOUNCE_MS = 250;
const TIMEOUT_MS = 5000;
const MIN_QUERY = 2;

type Status = "idle" | "results" | "empty" | "failed";

export function CitySearch() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inFlight = useRef<AbortController>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      inFlight.current?.abort();
    },
    [],
  );

  function show(next: Status, list: Suggestion[] = []) {
    setSuggestions(list);
    setStatus(next);
    setActive(-1);
    setOpen(next !== "idle");
  }

  async function search(text: string) {
    const controller = new AbortController();
    inFlight.current = controller;
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(text)}`, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(TIMEOUT_MS)]),
      });
      const body: unknown = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok || !Array.isArray(body)) return show("failed");
      show(body.length ? "results" : "empty", body as Suggestion[]);
    } catch {
      // A newer query replaced this one: stay quiet. Anything else (network, 5 s timeout) is a failure.
      if (!controller.signal.aborted) show("failed");
    }
  }

  function onChange(text: string) {
    setQuery(text);
    clearTimeout(timer.current);
    inFlight.current?.abort();
    const trimmed = text.trim();
    if ([...trimmed].length < MIN_QUERY) return show("idle");
    timer.current = setTimeout(() => void search(trimmed), DEBOUNCE_MS);
  }

  function select(place: Suggestion) {
    clearTimeout(timer.current);
    inFlight.current?.abort();
    setQuery(place.name);
    setOpen(false);
    setActive(-1);
    startTransition(() => router.push(hrefFor({ lat: place.lat, lon: place.lon, name: place.name })));
  }

  const listOpen = open && status === "results";

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (open) event.preventDefault();
      setOpen(false);
      setActive(-1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (status !== "results") return;
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      const count = suggestions.length;
      setActive((current) => (current === -1 ? (step === 1 ? 0 : count - 1) : (current + step + count) % count));
    } else if (event.key === "Enter" && listOpen) {
      event.preventDefault();
      const chosen = active >= 0 ? suggestions[active] : suggestions.length === 1 ? suggestions[0] : undefined;
      if (chosen) select(chosen);
    }
  }

  const optionId = (index: number) => `${listId}-${index}`;

  return (
    <div className="wx-search">
      <div className="wx-field">
        <SearchIcon />
        <input
          className="wx-input"
          type="text"
          role="combobox"
          aria-label={strings.search.label}
          aria-autocomplete="list"
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-activedescendant={listOpen && active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={strings.search.placeholder}
          value={query}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => status !== "idle" && setOpen(true)}
          onBlur={() => setOpen(false)}
        />
      </div>
      <ul id={listId} role="listbox" aria-label={strings.search.suggestions} hidden={!listOpen} className="wx-list absolute inset-x-0">
        {suggestions.map((place, index) => (
          <li
            key={`${place.lat},${place.lon},${place.name}`}
            id={optionId(index)}
            role="option"
            aria-selected={index === active}
            className="wx-option"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => select(place)}
          >
            {place.flag ? (
              <span className="wx-flag" aria-hidden="true">
                {place.flag}
              </span>
            ) : null}
            <span>
              <b>{place.name}</b>
              <small>{secondaryLine(place)}</small>
            </span>
          </li>
        ))}
      </ul>
      {open && status === "empty" ? (
        <Notice className="absolute inset-x-0 mt-2" title={strings.search.empty}>
          {strings.search.emptyHint}
        </Notice>
      ) : null}
      {open && status === "failed" ? (
        <Notice className="absolute inset-x-0 mt-2" tone="error" title={strings.search.failed}>
          {strings.search.failedHint}
        </Notice>
      ) : null}
    </div>
  );
}
