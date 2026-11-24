"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { strings } from "@/lib/i18n";

/**
 * Shows the active UI theme (FR-SHELL-04, design D-8). There is no toggle: the theme follows
 * `prefers-color-scheme`, and the root layout's inline script keeps `<html data-theme>` in sync.
 */

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
// The server cannot know the visitor's theme: render nothing there, so hydration never mismatches.
const getServerSnapshot = () => null;

export function ThemeIndicator() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (theme === null) return null;
  const label = strings.theme[theme];
  const Icon = theme === "dark" ? Moon : Sun;
  return (
    <span role="img" aria-label={label} className="caption flex items-center gap-1.5 text-ink-muted">
      <Icon aria-hidden="true" strokeWidth={1.75} className="size-4" />
      <span aria-hidden="true">{label}</span>
    </span>
  );
}
